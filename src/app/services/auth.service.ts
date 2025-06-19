import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, map, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../models/User';
import { UserFormLogin } from '../models/Forms/UsersFormLogin';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _isConnected : BehaviorSubject<Boolean> = new BehaviorSubject<Boolean>(false);

  get IsConnected() : BehaviorSubject<Boolean>
  {
   return this._isConnected;
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

  login(userform:UserFormLogin):Observable<User>
    {
    return this._httpClient.post<any>(environment.apiUrl + '?route=user/login',{
      email: userform.Email,
      password: userform.Password
    })
    .pipe(map(response => {
          if (response.Status === 200 && response.JsonResult) {
            const user = response.JsonResult;
            this._tokenService.saveToken(user.Id.toString());
            sessionStorage.setItem('Email', user.Email || '');
            sessionStorage.setItem('FirstName', user.Name || '');
            sessionStorage.setItem('apiKey', user.ApiKey || '');
            sessionStorage.setItem('userRole', user.Role || '');
            
            // Détecter si l'utilisateur utilise le mot de passe par défaut
            if (userform.Password === 'WikiAlarm') {
              sessionStorage.setItem('hasDefaultPassword', 'true');
            } else {
              sessionStorage.removeItem('hasDefaultPassword');
            }
            
            this.IsConnected.next(true);
            return user;
          }
          throw new Error(response.ErrorMessage || 'Login ou mot de passe incorrect !');
        }),
        catchError(error => {
          return throwError(() => error);
        }))
    }

  register(_registerForm:UserFormLogin):Observable<User>
    {
    const email = _registerForm.Email || '';
    const name = email.split('@')[0] || 'Utilisateur';

    return this._httpClient.post<any>(environment.apiUrl + '?route=user/create',{
      email: email,
      password: _registerForm.Password,
      name: name
    })
    .pipe(map(user=>
        {
          if(user.JsonResult && user.JsonResult.id)
          {
            this._tokenService.saveToken(user.JsonResult.id.toString());
            sessionStorage.setItem('Email', user.JsonResult.Email || '');
            sessionStorage.setItem('FirstName', user.JsonResult.Name || '');
            sessionStorage.setItem('apiKey', user.JsonResult.ApiKey || '');
            this.IsConnected.next(true);
          }
          return user.JsonResult;
        }))
    }

  logout()
    {
    sessionStorage.removeItem("IdUser");
    sessionStorage.removeItem("Email");
    sessionStorage.removeItem("FirstName");
    sessionStorage.removeItem("apiKey");
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("hasDefaultPassword");
    this.IsConnected.next(false);
    }

  GetById(id: number): Observable<any> {
    return this._httpClient.post<any>(`${environment.apiUrl}/user/get.php`, { id: id });
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
