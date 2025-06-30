import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, map, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../models/User';
import { UserFormLogin } from '../models/Forms/UsersFormLogin';
import { RegisterResponse } from '../models/Forms/RegisterResponse';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _isConnected = new BehaviorSubject<boolean>(false);
  get IsConnected() {
    return this._isConnected.asObservable();
  }

  private _UserSubject : BehaviorSubject<User|null>
  public user!:Observable<User|null>;
  public headers = new HttpHeaders().set('Content-Type', 'application/json')

  constructor(private _httpClient: HttpClient,private _tokenService:TokenService)
  {
    let token :string | null =this._tokenService.getToken();
    //console.log("TOKEN : "+token);
    let IdUser:number=this._tokenService.getUserId();
    //console.log("Type de userid : "+typeof(IdUser));

    if(token)
    {
      this._UserSubject = new BehaviorSubject<User|null>(JSON.parse(token))
      this.user = this._UserSubject.asObservable()
    }
    else
    {
      this._UserSubject= new BehaviorSubject<User|null>(null)
    }
    
  }

  public get userValue(): User|null {
    return this._UserSubject.value
  }

  // Set du token dans le behavior
  SetToken(token : User){
    this._UserSubject.next(token)
  }

  login(userform:UserFormLogin):Observable<any>
    {
    // Validation des données
    if (!userform.Email || !userform.Password) {
      return throwError(() => new Error('Email et mot de passe requis'));
    }

    return this._httpClient.post<any>(environment.apiUrl + '?route=user/login',{
      email: userform.Email.toLowerCase(),
      password: userform.Password
    })
    .pipe(map(response => {
          console.log('Réponse API login:', response);
          if (response.Status === 200 && response.JsonResult) {
            const user = response.JsonResult;
            console.log('User data from API:', user); // Debug log
            this._tokenService.saveToken(user.Id.toString());
            sessionStorage.setItem('userId', user.Id.toString());
            sessionStorage.setItem('Email', user.Email || '');
            sessionStorage.setItem('FirstName', user.Name || '');
            sessionStorage.setItem('apiKey', user.ApiKey || '');
            sessionStorage.setItem('userRole', user.Role || '');
            // Correction de la récupération du statut actif
            const activeStatus = user.active || user.Active || 0;
            sessionStorage.setItem('userActive', activeStatus.toString());
            
            // Détecter si l'utilisateur utilise le mot de passe par défaut
            if (userform.Password === 'WikiAlarm') {
              sessionStorage.setItem('hasDefaultPassword', 'true');
            } else {
              sessionStorage.removeItem('hasDefaultPassword');
            }
            
            this._isConnected.next(true);
            // Retourne l'utilisateur ET le message
            return { ...user, Message: response.Message };
          }
          throw new Error(response.ErrorMessage || 'Login ou mot de passe incorrect !');
        }),
        catchError(error => {
          return throwError(() => error);
        }))
    }

  register(_registerForm: UserFormLogin): Observable<RegisterResponse> {
    const email = _registerForm.Email || '';
    const name = email.split('@')[0] || 'Utilisateur';

    return this._httpClient.post<any>(environment.apiUrl + '?route=user/create', {
      email: email,
      password: _registerForm.Password,
      name: name
    })
    .pipe(
      map(response => {
        if (response.JsonResult && response.JsonResult.id) {
          this._tokenService.saveToken(response.JsonResult.id.toString());
          sessionStorage.setItem('Email', response.JsonResult.email || '');
          sessionStorage.setItem('FirstName', response.JsonResult.firstName || '');
          sessionStorage.setItem('apiKey', response.JsonResult.apiKey || '');
          this._isConnected.next(true);

          return {
            id: response.JsonResult.id,
            email: response.JsonResult.email,
            apiMessage: response.Message || 'Inscription réussie',
            status: response.Status || 200
          };
        }
        return {
          id: 0,
          email: '',
          apiMessage: response.Message || 'Erreur lors de l\'inscription',
          status: response.Status || 400
        };
      })
    );
  }

  logout()
    {
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("Email");
    sessionStorage.removeItem("FirstName");
    sessionStorage.removeItem("apiKey");
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("hasDefaultPassword");
    sessionStorage.removeItem("userActive");
    this._isConnected.next(false);
    }

  GetById(id: number): Observable<any> {
    const ApiKey = sessionStorage.getItem('apiKey') || '';
    return this._httpClient.post<any>(`${environment.apiUrl}?route=user/get`, { 
      ApiKey,
      id: id 
    });
  }

  // Gestion des rôles
  getCurrentUserRole(): string {
    return sessionStorage.getItem('userRole') || '';
  }

  isAdmin(): boolean {
    const role = this.getCurrentUserRole().toLowerCase();
    return role === 'admin' || role === 'administrator' || role === 'administrateur';
  }

  isUser(): boolean {
    const role = this.getCurrentUserRole().toLowerCase();
    return role === 'user' || role === 'utilisateur';
  }

  hasRole(expectedRole: string): boolean {
    const currentRole = this.getCurrentUserRole().toLowerCase();
    return currentRole === expectedRole.toLowerCase();
  }

  canAccessAdminPanel(): boolean {
    return this.isAdmin();
  }

  canManageUsers(): boolean {
    return this.isAdmin();
  }

  canManageVehicles(): boolean {
    return this.isAdmin();
  }
  }
