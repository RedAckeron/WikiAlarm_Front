import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../environements/environement';

export interface Entreprise {
  id?: number;
  nom: string;
  couleur: string;
  joursActivite: number[];
  heureDebut: string;
  heureFin: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EntrepriseService {
  private apiUrl = `${environment.apiUrl}/entreprise`;
  private entreprisesSubject = new BehaviorSubject<Entreprise[]>([]);
  public entreprises$ = this.entreprisesSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Récupérer toutes les entreprises
  getEntreprises(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/list`, { 
      headers: this.getHeaders() 
    });
  }

  // Récupérer une entreprise par ID
  getEntreprise(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    });
  }

  // Créer une nouvelle entreprise
  createEntreprise(entreprise: Entreprise): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create`, entreprise, { 
      headers: this.getHeaders() 
    });
  }

  // Modifier une entreprise
  updateEntreprise(id: number, entreprise: Entreprise): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update/${id}`, entreprise, { 
      headers: this.getHeaders() 
    });
  }

  // Supprimer une entreprise
  deleteEntreprise(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete/${id}`, { 
      headers: this.getHeaders() 
    });
  }

  // Mettre à jour la liste locale des entreprises
  updateEntreprisesList(entreprises: Entreprise[]) {
    this.entreprisesSubject.next(entreprises);
  }

  // Récupérer la liste locale des entreprises
  getEntreprisesFromSubject(): Entreprise[] {
    return this.entreprisesSubject.value;
  }

  // Couleurs prédéfinies pour les entreprises
  static getCouleursOptions() {
    return [
      { label: 'Bleu', value: 'blue', color: '#007bff' },
      { label: 'Rouge', value: 'red', color: '#dc3545' },
      { label: 'Vert', value: 'green', color: '#28a745' },
      { label: 'Orange', value: 'orange', color: '#fd7e14' },
      { label: 'Violet', value: 'purple', color: '#6f42c1' },
      { label: 'Cyan', value: 'cyan', color: '#17a2b8' },
      { label: 'Rose', value: 'pink', color: '#e83e8c' },
      { label: 'Jaune', value: 'yellow', color: '#ffc107' }
    ];
  }

  // Jours de la semaine
  static getJoursOptions() {
    return [
      { label: 'Lundi', value: 1 },
      { label: 'Mardi', value: 2 },
      { label: 'Mercredi', value: 3 },
      { label: 'Jeudi', value: 4 },
      { label: 'Vendredi', value: 5 },
      { label: 'Samedi', value: 6 },
      { label: 'Dimanche', value: 7 }
    ];
  }
} 