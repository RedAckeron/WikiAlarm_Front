import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Entreprise {
  id: number;
  nom: string;
  couleur: string; // Code couleur hex
  joursActivite: number[]; // 1=Lundi, 2=Mardi, ... 7=Dimanche
  heureDebut: string; // Format "HH:mm"
  heureFin: string; // Format "HH:mm"
  description?: string;
}

export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  actif: boolean;
}

export interface Affectation {
  id: number;
  userId: number;
  userName: string;
  entrepriseId: number;
  entrepriseName: string;
  entrepriseCouleur: string;
  date: Date;
  heureDebut?: string; // Peut surcharger l'horaire par défaut de l'entreprise
  heureFin?: string; // Peut surcharger l'horaire par défaut de l'entreprise
  isException: boolean;
  parentAffectationId?: number;
}

// Interfaces pour les réponses API
export interface ApiResponse<T> {
  Status: number;
  Message: string;
  ErrorMessage?: string;
  JsonResult: T;
}

export interface HoraireEntreprise {
  Day: number; // 1=Lundi, 7=Dimanche
  WorkTimeIn: string; // Format HHMM
  WorkTimeOut: string; // Format HHMM
}

export interface CalendrierId {
  calendar: any[];
  period: {
    date_start: string;
    date_end: string;
  };
  statistics: {
    total_jours_travailles: number;
    total_creees: number;
    total_existantes: number;
    total_erreurs: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CalendrierService {

  private apiUrl = environment.apiUrl;

  // Cache local des utilisateurs pour accès synchrone
  private utilisateursCache: Utilisateur[] = [];

  constructor(private http: HttpClient) { }

  // === GESTION DE LA CLÉ API ===
  
  /**
   * Récupère la clé API depuis le sessionStorage
   */
  private getApiKey(): string {
    return sessionStorage.getItem('apiKey') || localStorage.getItem('apiKey') || '';
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    const apiKey = this.getApiKey();
    return apiKey !== null && apiKey !== '';
  }

  /**
   * Méthode de diagnostic pour déboguer les problèmes d'authentification
   */
  debugAuthentication(): void {
    const sessionApiKey = sessionStorage.getItem('apiKey');
    const localApiKey = localStorage.getItem('apiKey');
    const currentApiKey = this.getApiKey();
    
    console.log('=== DEBUG AUTHENTIFICATION ===');
    console.log('SessionStorage apiKey:', sessionApiKey ? 'PRÉSENTE' : 'ABSENTE');
    console.log('LocalStorage apiKey:', localApiKey ? 'PRÉSENTE' : 'ABSENTE');
    console.log('Clé API utilisée:', currentApiKey ? 'VALIDE' : 'VIDE');
    console.log('API URL:', this.apiUrl);
    console.log('==============================');
  }

  // Liste des utilisateurs
  private utilisateurs: Utilisateur[] = [
    { id: 1, nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@wikialarm.be', actif: true },
    { id: 2, nom: 'Martin', prenom: 'Paul', email: 'paul.martin@wikialarm.be', actif: true },
    { id: 3, nom: 'Martin', prenom: 'Sophie', email: 'sophie.martin@wikialarm.be', actif: true },
    { id: 4, nom: 'Moreau', prenom: 'Alice', email: 'alice.moreau@wikialarm.be', actif: true },
    { id: 5, nom: 'Legrand', prenom: 'Pierre', email: 'pierre.legrand@wikialarm.be', actif: true },
    { id: 6, nom: 'Dubois', prenom: 'Marie', email: 'marie.dubois@wikialarm.be', actif: true },
    { id: 7, nom: 'Girard', prenom: 'Paul', email: 'paul.girard@wikialarm.be', actif: true },
    { id: 8, nom: 'Rousseau', prenom: 'Emma', email: 'emma.rousseau@wikialarm.be', actif: true },
    { id: 9, nom: 'Bernard', prenom: 'Thomas', email: 'thomas.bernard@wikialarm.be', actif: true },
    { id: 10, nom: 'Mercier', prenom: 'Julie', email: 'julie.mercier@wikialarm.be', actif: true },
    { id: 11, nom: 'Lefevre', prenom: 'Marc', email: 'marc.lefevre@wikialarm.be', actif: true },
    { id: 12, nom: 'Vincent', prenom: 'Sarah', email: 'sarah.vincent@wikialarm.be', actif: true },
    { id: 13, nom: 'Morel', prenom: 'David', email: 'david.morel@wikialarm.be', actif: true },
    { id: 14, nom: 'Roux', prenom: 'Camille', email: 'camille.roux@wikialarm.be', actif: true },
    { id: 15, nom: 'Blanc', prenom: 'Antoine', email: 'antoine.blanc@wikialarm.be', actif: true },
    { id: 16, nom: 'Fabre', prenom: 'Léa', email: 'lea.fabre@wikialarm.be', actif: true },
    { id: 17, nom: 'Garnier', prenom: 'Hugo', email: 'hugo.garnier@wikialarm.be', actif: true },
    { id: 18, nom: 'Moreau', prenom: 'Lucas', email: 'lucas.moreau@wikialarm.be', actif: true },
    { id: 19, nom: 'Dupont', prenom: 'Chloé', email: 'chloe.dupont@wikialarm.be', actif: true },
  ];

  // Liste des entreprises avec leurs horaires (à remplacer par des appels API)
  private entreprises: Entreprise[] = [
    { 
      id: 1, 
      nom: 'Dumay Mior', 
      couleur: '#007bff',
      joursActivite: [1, 2, 3, 4, 5], // Lundi à vendredi
      heureDebut: '08:00',
      heureFin: '16:30',
      description: 'Lun-Ven 8h-16h30'
    },
    { 
      id: 2, 
      nom: 'SAS', 
      couleur: '#dc3545',
      joursActivite: [1, 2, 3, 4, 5], // Lundi à vendredi
      heureDebut: '08:00',
      heureFin: '16:30',
      description: 'Lun-Ven 8h-16h30'
    },
    { 
      id: 3, 
      nom: 'Service de Garde', 
      couleur: '#28a745',
      joursActivite: [1, 2, 3, 4, 5, 6, 7], // 7j/7
      heureDebut: '00:00',
      heureFin: '23:59',
      description: '24h/7j'
    }
  ];

  // Cache des affectations chargées depuis l'API
  private affectations: Affectation[] = [];
  
  // Données d'exemple d'affectations avec horaires (pour référence, sera remplacé par l'API)
  private affectationsExample: Affectation[] = [
    // Martin Paul affecté à SAS toute la semaine
    { id: 1, userId: 2, userName: 'Martin Paul', entrepriseId: 2, entrepriseName: 'SAS', entrepriseCouleur: '#dc3545', date: new Date('2025-06-16'), isException: false },
    { id: 2, userId: 2, userName: 'Martin Paul', entrepriseId: 2, entrepriseName: 'SAS', entrepriseCouleur: '#dc3545', date: new Date('2025-06-17'), isException: false },
    { id: 3, userId: 2, userName: 'Martin Paul', entrepriseId: 2, entrepriseName: 'SAS', entrepriseCouleur: '#dc3545', date: new Date('2025-06-18'), isException: false },
    { id: 4, userId: 2, userName: 'Martin Paul', entrepriseId: 2, entrepriseName: 'SAS', entrepriseCouleur: '#dc3545', date: new Date('2025-06-19'), isException: false },
    { id: 5, userId: 2, userName: 'Martin Paul', entrepriseId: 2, entrepriseName: 'SAS', entrepriseCouleur: '#dc3545', date: new Date('2025-06-20'), isException: false },
    { id: 6, userId: 2, userName: 'Martin Paul', entrepriseId: 2, entrepriseName: 'SAS', entrepriseCouleur: '#dc3545', date: new Date('2025-06-21'), isException: false },
    { id: 7, userId: 2, userName: 'Martin Paul', entrepriseId: 2, entrepriseName: 'SAS', entrepriseCouleur: '#dc3545', date: new Date('2025-06-22'), isException: false },
    
    // Exception : Martin déplacé au Service de Garde le vendredi avec horaire spécifique
    { id: 8, userId: 2, userName: 'Martin Paul', entrepriseId: 3, entrepriseName: 'Service de Garde', entrepriseCouleur: '#28a745', date: new Date('2025-06-20'), heureDebut: '18:00', heureFin: '06:00', isException: true, parentAffectationId: 5 },
    
    // Dupont Jean chez Dumay Mior le mardi
    { id: 9, userId: 1, userName: 'Dupont Jean', entrepriseId: 1, entrepriseName: 'Dumay Mior', entrepriseCouleur: '#007bff', date: new Date('2025-06-17'), isException: false },
    
    // Sophie Martin au Service de Garde mercredi et jeudi (garde de nuit)
    { id: 10, userId: 3, userName: 'Sophie Martin', entrepriseId: 3, entrepriseName: 'Service de Garde', entrepriseCouleur: '#28a745', date: new Date('2025-06-18'), heureDebut: '22:00', heureFin: '06:00', isException: false },
    { id: 11, userId: 3, userName: 'Sophie Martin', entrepriseId: 3, entrepriseName: 'Service de Garde', entrepriseCouleur: '#28a745', date: new Date('2025-06-19'), heureDebut: '22:00', heureFin: '06:00', isException: false },

    // === AFFECTATIONS POUR AUJOURD'HUI ===
    
    // Dumay Mior - Équipe bureau
    { id: 12, userId: 4, userName: 'Alice Moreau', entrepriseId: 1, entrepriseName: 'Dumay Mior', entrepriseCouleur: '#007bff', date: new Date(), isException: false },
    { id: 13, userId: 5, userName: 'Pierre Legrand', entrepriseId: 1, entrepriseName: 'Dumay Mior', entrepriseCouleur: '#007bff', date: new Date(), isException: false },
    { id: 14, userId: 6, userName: 'Marie Dubois', entrepriseId: 1, entrepriseName: 'Dumay Mior', entrepriseCouleur: '#007bff', date: new Date(), isException: false },
    { id: 15, userId: 7, userName: 'Paul Girard', entrepriseId: 1, entrepriseName: 'Dumay Mior', entrepriseCouleur: '#007bff', date: new Date(), isException: false },
    { id: 16, userId: 8, userName: 'Emma Rousseau', entrepriseId: 1, entrepriseName: 'Dumay Mior', entrepriseCouleur: '#007bff', date: new Date(), isException: false },
    
    // SAS - Équipe bureau
    { id: 17, userId: 9, userName: 'Thomas Bernard', entrepriseId: 2, entrepriseName: 'SAS', entrepriseCouleur: '#dc3545', date: new Date(), isException: false },
    { id: 18, userId: 10, userName: 'Julie Mercier', entrepriseId: 2, entrepriseName: 'SAS', entrepriseCouleur: '#dc3545', date: new Date(), isException: false },
    { id: 19, userId: 11, userName: 'Marc Lefevre', entrepriseId: 2, entrepriseName: 'SAS', entrepriseCouleur: '#dc3545', date: new Date(), isException: false },
    { id: 20, userId: 12, userName: 'Sarah Vincent', entrepriseId: 2, entrepriseName: 'SAS', entrepriseCouleur: '#dc3545', date: new Date(), isException: false },
    
    // Service de Garde - Équipes 24h/7j
    { id: 21, userId: 13, userName: 'David Morel', entrepriseId: 3, entrepriseName: 'Service de Garde', entrepriseCouleur: '#28a745', date: new Date(), heureDebut: '06:00', heureFin: '14:00', isException: false },
    { id: 22, userId: 14, userName: 'Camille Roux', entrepriseId: 3, entrepriseName: 'Service de Garde', entrepriseCouleur: '#28a745', date: new Date(), heureDebut: '14:00', heureFin: '22:00', isException: false },
    { id: 23, userId: 15, userName: 'Antoine Blanc', entrepriseId: 3, entrepriseName: 'Service de Garde', entrepriseCouleur: '#28a745', date: new Date(), heureDebut: '22:00', heureFin: '06:00', isException: false },
    { id: 24, userId: 16, userName: 'Léa Fabre', entrepriseId: 3, entrepriseName: 'Service de Garde', entrepriseCouleur: '#28a745', date: new Date(), heureDebut: '00:00', heureFin: '12:00', isException: false },
    { id: 25, userId: 17, userName: 'Hugo Garnier', entrepriseId: 3, entrepriseName: 'Service de Garde', entrepriseCouleur: '#28a745', date: new Date(), heureDebut: '12:00', heureFin: '00:00', isException: false },
    
    // Quelques exceptions pour aujourd'hui
    { id: 26, userId: 18, userName: 'Lucas Moreau', entrepriseId: 1, entrepriseName: 'Dumay Mior', entrepriseCouleur: '#007bff', date: new Date(), isException: false },
    { id: 27, userId: 18, userName: 'Lucas Moreau', entrepriseId: 3, entrepriseName: 'Service de Garde', entrepriseCouleur: '#28a745', date: new Date(), heureDebut: '16:30', heureFin: '22:00', isException: true, parentAffectationId: 26 },
    
    { id: 28, userId: 19, userName: 'Chloé Dupont', entrepriseId: 2, entrepriseName: 'SAS', entrepriseCouleur: '#dc3545', date: new Date(), isException: false },
    { id: 29, userId: 19, userName: 'Chloé Dupont', entrepriseId: 1, entrepriseName: 'Dumay Mior', entrepriseCouleur: '#007bff', date: new Date(), heureDebut: '14:00', heureFin: '16:30', isException: true, parentAffectationId: 28 },
  ];

  // Récupère toutes les entreprises depuis l'API
  getEntreprisesFromAPI(): Observable<ApiResponse<any[]>> {
    const body = {
      ApiKey: this.getApiKey()
    };

    return this.http.post<ApiResponse<any[]>>(`${this.apiUrl}/?route=entreprise/list`, body);
  }

  // Récupère toutes les entreprises (méthode locale pour compatibilité)
  getEntreprises(): Entreprise[] {
    return this.entreprises;
  }

  // Récupère une entreprise par ID
  getEntrepriseById(id: number): Entreprise | undefined {
    return this.entreprises.find(e => e.id === id);
  }

  // Récupère toutes les affectations
  getAffectations(): Affectation[] {
    return this.affectations;
  }

  // Génère les dates de la semaine courante
  getCurrentWeek(): Date[] {
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Lundi = premier jour
    startOfWeek.setDate(diff);

    const currentWeek: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      currentWeek.push(date);
    }
    return currentWeek;
  }

  // Récupère l'affectation pour une date donnée (priorité aux exceptions)
  getAffectationForDate(date: Date): Affectation | undefined {
    const dateStr = date.toDateString();
    
    // Cherche d'abord les exceptions pour cette date
    const exception = this.affectations.find(affectation => 
      affectation.date.toDateString() === dateStr && affectation.isException
    );
    
    if (exception) {
      return exception;
    }
    
    // Sinon, cherche l'affectation normale pour cette date
    return this.affectations.find(affectation => 
      affectation.date.toDateString() === dateStr && !affectation.isException
    );
  }

  // Récupère les horaires d'une affectation (spécifique ou par défaut de l'entreprise)
  getAffectationHoraires(affectation: Affectation) {
    const entreprise = this.getEntrepriseById(affectation.entrepriseId);
    return {
      debut: affectation.heureDebut || entreprise?.heureDebut || '08:00',
      fin: affectation.heureFin || entreprise?.heureFin || '16:00'
    };
  }

  // Vérifie si une entreprise travaille un jour donné
  isEntrepriseActiveOnDay(entrepriseId: number, date: Date): boolean {
    const entreprise = this.getEntrepriseById(entrepriseId);
    if (!entreprise) return false;
    
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // Dimanche = 7
    return entreprise.joursActivite.includes(dayOfWeek);
  }

  // Récupère un résumé des affectations du jour actuel par entreprise
  getTodayAffectationsSummary() {
    const today = new Date();
    const affectationsParEntreprise: {[key: string]: any} = {};
    
    // Récupère toutes les affectations du jour (exceptions en priorité)
    const todayAffectations = this.affectations.filter(affectation => 
      affectation.date.toDateString() === today.toDateString()
    );
    
    // Traite les affectations normales d'abord
    const normalAffectations = todayAffectations.filter(a => !a.isException);
    const exceptionAffectations = todayAffectations.filter(a => a.isException);
    
    // Utilisateurs déjà traités par des exceptions
    const usersWithExceptions = exceptionAffectations.map(a => a.userId);
    
    // Traite les affectations normales (sauf celles remplacées par des exceptions)
    normalAffectations
      .filter(affectation => !usersWithExceptions.includes(affectation.userId))
      .forEach(affectation => {
        this.addAffectationToSummary(affectation, affectationsParEntreprise);
      });
    
    // Traite les exceptions (priorité absolue)
    exceptionAffectations.forEach(affectation => {
      this.addAffectationToSummary(affectation, affectationsParEntreprise);
    });
    
    return Object.values(affectationsParEntreprise);
  }

  // Méthode helper pour ajouter une affectation au résumé
  private addAffectationToSummary(affectation: Affectation, summary: {[key: string]: any}) {
    const key = affectation.entrepriseId.toString();
    const entreprise = this.getEntrepriseById(affectation.entrepriseId);
    
    if (!summary[key]) {
      summary[key] = {
        entreprise: affectation.entrepriseName,
        couleur: affectation.entrepriseCouleur,
        horaireDefaut: entreprise ? `${entreprise.heureDebut} - ${entreprise.heureFin}` : '',
        joursActivite: entreprise?.joursActivite || [],
        employes: []
      };
    }
    
    const horaires = this.getAffectationHoraires(affectation);
    const horaireText = `${horaires.debut}-${horaires.fin}`;
    
    summary[key].employes.push({
      nom: affectation.userName,
      horaire: horaireText,
      isException: affectation.isException
    });
  }

  // Récupère un résumé des affectations de la semaine courante par entreprise
  getCurrentWeekSummary() {
    const currentWeek = this.getCurrentWeek();
    const affectationsParEntreprise: {[key: string]: any} = {};
    
    currentWeek.forEach(day => {
      const affectation = this.getAffectationForDate(day);
      if (affectation) {
        const key = affectation.entrepriseId.toString();
        if (!affectationsParEntreprise[key]) {
          const entreprise = this.getEntrepriseById(affectation.entrepriseId);
          affectationsParEntreprise[key] = {
            entreprise: affectation.entrepriseName,
            couleur: affectation.entrepriseCouleur,
            horaireDefaut: entreprise ? `${entreprise.heureDebut} - ${entreprise.heureFin}` : '',
            joursActivite: entreprise?.joursActivite || [],
            employes: {}
          };
        }
        
        const userKey = affectation.userId.toString();
        if (!affectationsParEntreprise[key].employes[userKey]) {
          affectationsParEntreprise[key].employes[userKey] = {
            nom: affectation.userName,
            jours: [],
            exceptions: []
          };
        }
        
        const dayName = day.toLocaleDateString('fr-FR', { weekday: 'long' });
        const horaires = this.getAffectationHoraires(affectation);
        const horaireText = `${horaires.debut}-${horaires.fin}`;
        
        if (affectation.isException) {
          affectationsParEntreprise[key].employes[userKey].exceptions.push({
            jour: dayName,
            horaire: horaireText
          });
        } else {
          affectationsParEntreprise[key].employes[userKey].jours.push({
            jour: dayName,
            horaire: horaireText
          });
        }
      }
    });
    
    return Object.values(affectationsParEntreprise).map((entreprise: any) => ({
      ...entreprise,
      employes: Object.values(entreprise.employes)
    }));
  }

  // === CHARGEMENT DES AFFECTATIONS DEPUIS L'API ===

  // Charge les affectations d'une semaine depuis l'API
  loadAffectationsFromAPI(dateStart: string, dateEnd: string): Observable<Affectation[]> {
    const apiKey = this.getApiKey();
    return new Observable(observer => {
      this.http.post<any>(`${this.apiUrl}?route=entreprise/get_week_calendar`, {
        ApiKey: apiKey,
        date_start: dateStart,
        date_end: dateEnd
      }).subscribe({
        next: (response) => {
          if (response && response.Status === 200 && response.JsonResult?.calendrier) {
            const affectations: Affectation[] = [];
            let idCounter = 1;

            response.JsonResult.calendrier.forEach((entrepriseData: any) => {
              const entreprise = entrepriseData.entreprise;
              
              // Traiter les affectations de la semaine
              if (entrepriseData.semaine && Array.isArray(entrepriseData.semaine)) {
                entrepriseData.semaine.forEach((jour: any) => {
                  if (jour.user && jour.actif && jour.travaille) {
                    // Récupérer l'utilisateur depuis le cache
                    const utilisateur = this.utilisateursCache.find(u => u.id.toString() === jour.user);
                    
                    const affectation: Affectation = {
                      id: idCounter++,
                      userId: parseInt(jour.user),
                      userName: utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}`.trim() : `Utilisateur ${jour.user}`,
                      entrepriseId: parseInt(entreprise.id),
                      entrepriseName: entreprise.nom,
                      entrepriseCouleur: entreprise.couleur,
                      date: new Date(jour.date),
                      heureDebut: jour.horaires?.debut,
                      heureFin: jour.horaires?.fin,
                      isException: false
                    };
                    
                    affectations.push(affectation);
                  }
                });
              }

              // Traiter les affectations spéciales (exceptions)
              if (entrepriseData.affectations && Array.isArray(entrepriseData.affectations)) {
                entrepriseData.affectations.forEach((affectationAPI: any) => {
                  const utilisateur = this.utilisateursCache.find(u => u.id.toString() === affectationAPI.user);
                  
                  const affectation: Affectation = {
                    id: idCounter++,
                    userId: parseInt(affectationAPI.user),
                    userName: utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}`.trim() : `Utilisateur ${affectationAPI.user}`,
                    entrepriseId: parseInt(entreprise.id),
                    entrepriseName: entreprise.nom,
                    entrepriseCouleur: entreprise.couleur,
                    date: new Date(affectationAPI.date),
                    heureDebut: affectationAPI.horaires?.debut,
                    heureFin: affectationAPI.horaires?.fin,
                    isException: true
                  };
                  
                  affectations.push(affectation);
                });
              }
            });

            // Mettre à jour le cache des affectations
            this.affectations = affectations;
            observer.next(affectations);
          } else {
            console.warn('Aucune donnée de calendrier trouvée dans la réponse API');
            observer.next([]);
          }
          observer.complete();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des affectations:', error);
          // En cas d'erreur, utiliser les données d'exemple pour le développement
          this.affectations = this.affectationsExample;
          observer.next(this.affectationsExample);
          observer.complete();
        }
      });
    });
  }

  // Charge les affectations pour une semaine donnée (helper)
  loadWeekAffectations(startDate: Date): Observable<Affectation[]> {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const dateStart = this.formatDateForAPI(startDate);
    const dateEnd = this.formatDateForAPI(endDate);
    
    return this.loadAffectationsFromAPI(dateStart, dateEnd);
  }

  // === NOUVELLES MÉTHODES POUR CHARGEMENT DES AFFECTATIONS DU JOUR ===

  /**
   * Récupère le calendrier d'un jour spécifique pour toutes les entreprises
   */
  getDayCalendar(date?: string): Observable<ApiResponse<any>> {
    const body = {
      ApiKey: this.getApiKey(),
      ...(date && { date })
    };

    console.log('=== APPEL get_day_calendar ===');
    console.log('Corps de la requête:', body);
    
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/?route=entreprise/get_day_calendar`, body).pipe(
      tap(response => {
        console.log('=== RÉPONSE get_day_calendar ===');
        console.log('Response complète:', response);
        console.log('JsonResult:', response.JsonResult);
        console.log('Type de JsonResult:', typeof response.JsonResult);
      })
    );
  }

  /**
   * Charge les affectations du jour depuis l'API
   */
  loadTodayAffectationsFromAPI(): Observable<any[]> {
    const today = new Date();
    const todayStr = this.formatDateForAPI(today);
    
    return this.getDayCalendar(todayStr).pipe(
      map((response: ApiResponse<any>) => {
        if (response.Status === 200 && response.JsonResult) {
          return this.processTodayAffectations(response.JsonResult);
        }
        return [];
      }),
      catchError(error => {
        console.error('Erreur lors du chargement des affectations du jour:', error);
        // Fallback sur les données locales si erreur
        return of(this.getTodayAffectationsSummary());
      })
    );
  }

  /**
   * Traite les données de l'API pour créer un résumé des affectations du jour
   */
  private processTodayAffectations(dayData: any): any[] {
    console.log('=== TRAITEMENT AFFECTATIONS DU JOUR ===');
    console.log('Données reçues:', dayData);
    
    // NOUVEAU FORMAT API 2.0 : utilisateurs avec plannings détaillés
    if (dayData.utilisateurs && Array.isArray(dayData.utilisateurs)) {
      console.log('Format détecté: nouveau format API 2.0 - utilisateurs avec plannings');
      return this.processNewFormatUtilisateurs(dayData.utilisateurs);
    }
    
    // Ancien format : utilisateurs_affecter
    if (dayData.utilisateurs_affecter && Array.isArray(dayData.utilisateurs_affecter)) {
      console.log('Format détecté: ancien format - utilisateurs_affecter');
      return this.processUtilisateursAffecter(dayData.utilisateurs_affecter, dayData);
    }
    
    // Si c'est un tableau d'entreprises (très ancien format)
    if (Array.isArray(dayData)) {
      console.log('Format détecté: très ancien format - array d\'entreprises');
      return this.processTodayAffectationsArray(dayData);
    }
    
    // Si c'est un objet avec des propriétés entreprises
    if (dayData.entreprises || dayData.calendar || dayData.affectations) {
      const entreprises = dayData.entreprises || dayData.calendar || dayData.affectations;
      console.log('Format détecté: ancien format - objet avec entreprises');
      return this.processTodayAffectationsArray(entreprises);
    }
    
    // Si c'est un format différent, essayer de l'adapter
    console.log('Format non reconnu:', dayData);
    return [];
  }

  /**
   * Traite le nouveau format API 2.0 avec utilisateurs et plannings détaillés
   */
  private processNewFormatUtilisateurs(utilisateurs: any[]): any[] {
    console.log('=== TRAITEMENT NOUVEAU FORMAT UTILISATEURS ===');
    console.log('Utilisateurs reçus:', utilisateurs);
    
    if (utilisateurs.length === 0) {
      console.log('Aucun utilisateur affecté aujourd\'hui');
      return [];
    }

    // Créer un résumé groupé par entreprise
    const affectationsParEntreprise: {[key: string]: any} = {};
    
    utilisateurs.forEach((utilisateur: any) => {
      console.log('Traitement utilisateur:', utilisateur);
      
      const user = utilisateur.user;
      const plannings = utilisateur.plannings || [];
      
      plannings.forEach((planning: any) => {
        const entreprise = planning.entreprise;
        const entrepriseKey = `entreprise_${entreprise.id}`;
        
        // Initialiser l'entreprise si pas encore fait
        if (!affectationsParEntreprise[entrepriseKey]) {
          affectationsParEntreprise[entrepriseKey] = {
            entreprise: entreprise.nom,
            couleur: entreprise.couleur || '#007bff',
            horaireDefaut: this.formatHoraires(planning.horaires_entreprise),
            joursActivite: [1,2,3,4,5], // Par défaut
            employes: []
          };
        }
        
        // Horaires spécifiques du planning ou ceux de l'entreprise
        const horaires = planning.horaires_planning || planning.horaires_entreprise;
        const horaireText = this.formatHoraires(horaires);
        
        // Ajouter l'employé
        affectationsParEntreprise[entrepriseKey].employes.push({
          nom: user.nom,
          horaire: horaireText,
          isException: false
        });
      });
    });
    
    const result = Object.values(affectationsParEntreprise);
    console.log('Résultat final des affectations (nouveau format):', result);
    return result;
  }

  /**
   * Formate les horaires depuis l'objet horaires de l'API
   */
  private formatHoraires(horaires: any): string {
    if (horaires && horaires.debut && horaires.fin) {
      return `${horaires.debut} - ${horaires.fin}`;
    }
    // Fallback sur format raw si disponible
    if (horaires && horaires.debut_raw && horaires.fin_raw) {
      const debut = this.convertTimeFromAPI(horaires.debut_raw);
      const fin = this.convertTimeFromAPI(horaires.fin_raw);
      return `${debut} - ${fin}`;
    }
    // Horaire par défaut
    return '08:00 - 16:30';
  }

  /**
   * Traite les utilisateurs affectés directement (nouveau format API)
   */
  private processUtilisateursAffecter(utilisateursAffecter: any[], dayData: any): any[] {
    console.log('=== TRAITEMENT UTILISATEURS AFFECTER ===');
    console.log('Utilisateurs affectés:', utilisateursAffecter);
    
    if (utilisateursAffecter.length === 0) {
      console.log('Aucun utilisateur affecté aujourd\'hui');
      return [];
    }

    // Créer un résumé groupé par entreprise
    const affectationsParEntreprise: {[key: string]: any} = {};
    
    utilisateursAffecter.forEach((userAffectation: any) => {
      console.log('Traitement utilisateur:', userAffectation);
      
      // Pour l'instant, on va créer une entreprise générique car l'API ne retourne pas les détails d'entreprise
      const entrepriseKey = 'entreprise_generale';
      
      if (!affectationsParEntreprise[entrepriseKey]) {
        affectationsParEntreprise[entrepriseKey] = {
          entreprise: 'Affectations du jour',
          couleur: '#007bff',
          horaireDefaut: this.getHoraireFromDayData(dayData),
          joursActivite: [1,2,3,4,5],
          employes: []
        };
      }
      
      // Trouver le nom complet de l'utilisateur
      const userId = userAffectation.user_id;
      const userName = userAffectation.userName || `Utilisateur ${userId}`;
      
      // Ajouter l'employé
      affectationsParEntreprise[entrepriseKey].employes.push({
        nom: userName,
        horaire: this.getHoraireFromDayData(dayData),
        isException: false
      });
    });
    
    const result = Object.values(affectationsParEntreprise);
    console.log('Résultat final des affectations:', result);
    return result;
  }

  /**
   * Extrait les horaires depuis les données du jour
   */
  private getHoraireFromDayData(dayData: any): string {
    if (dayData.horaires_entreprise) {
      const horaires = dayData.horaires_entreprise;
      if (horaires.debut && horaires.fin) {
        const debut = this.convertTimeFromAPI(horaires.debut);
        const fin = this.convertTimeFromAPI(horaires.fin);
        return `${debut} - ${fin}`;
      }
    }
    
    // Horaire par défaut
    return '08:00 - 16:30';
  }

  private processTodayAffectationsArray(dayData: any[]): any[] {
    const affectationsParEntreprise: {[key: string]: any} = {};
    
    dayData.forEach((entrepriseData: any) => {
      if (!entrepriseData.entreprise && !entrepriseData.nom) return;
      
      const entreprise = entrepriseData.entreprise || entrepriseData;
      const key = entreprise.id?.toString() || entreprise.nom || Math.random().toString();
      
      // Initialiser l'entreprise si pas encore fait
      if (!affectationsParEntreprise[key]) {
        affectationsParEntreprise[key] = {
          entreprise: entreprise.nom || 'Entreprise inconnue',
          couleur: entreprise.couleur || '#808080',
          horaireDefaut: this.getDefaultScheduleText(entreprise),
          joursActivite: entreprise.joursActivite || [1,2,3,4,5],
          employes: []
        };
      }
      
      // Traiter les affectations du jour
      this.processEntrepriseAffectations(entrepriseData, affectationsParEntreprise[key]);
    });
    
    // Filtrer les entreprises qui ont des employés aujourd'hui
    return Object.values(affectationsParEntreprise).filter((entreprise: any) => 
      entreprise.employes.length > 0
    );
  }

  private getDefaultScheduleText(entreprise: any): string {
    if (entreprise.horaires) {
      const debut = this.convertTimeFromAPI(entreprise.horaires.debut || '0800');
      const fin = this.convertTimeFromAPI(entreprise.horaires.fin || '1630');
      return `${debut} - ${fin}`;
    }
    if (entreprise.heureDebut && entreprise.heureFin) {
      return `${entreprise.heureDebut} - ${entreprise.heureFin}`;
    }
    return '08:00 - 16:30';
  }

  private processEntrepriseAffectations(entrepriseData: any, entrepriseResult: any) {
    // Traiter les affectations normales
    if (entrepriseData.affectations && Array.isArray(entrepriseData.affectations)) {
      entrepriseData.affectations.forEach((affectation: any) => {
        if (affectation.user && affectation.actif) {
          this.addEmployeToResult(affectation, entrepriseResult, false);
        }
      });
    }
    
    // Traiter les plannings de la journée
    if (entrepriseData.planning && Array.isArray(entrepriseData.planning)) {
      entrepriseData.planning.forEach((planning: any) => {
        if (planning.user && planning.actif && planning.travaille) {
          this.addEmployeToResult(planning, entrepriseResult, false);
        }
      });
    }
    
    // Traiter les affectations spéciales/exceptions
    if (entrepriseData.exceptions && Array.isArray(entrepriseData.exceptions)) {
      entrepriseData.exceptions.forEach((exception: any) => {
        if (exception.user) {
          this.addEmployeToResult(exception, entrepriseResult, true);
        }
      });
    }
    
    // Traiter les utilisateurs directement listés
    if (entrepriseData.users && Array.isArray(entrepriseData.users)) {
      entrepriseData.users.forEach((user: any) => {
        if (user.id || user.user) {
          this.addEmployeToResult(user, entrepriseResult, false);
        }
      });
    }
  }

  private addEmployeToResult(userData: any, entrepriseResult: any, isException: boolean) {
    const userId = userData.user || userData.id || userData.userId;
    const utilisateur = this.utilisateursCache.find(u => u.id.toString() === userId.toString());
    const userName = utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}`.trim() : 
                   userData.userName || userData.nom || `Utilisateur ${userId}`;
    
    // Formater les horaires
    let horaireText = '';
    if (userData.horaires?.debut && userData.horaires?.fin) {
      horaireText = `${this.convertTimeFromAPI(userData.horaires.debut)}-${this.convertTimeFromAPI(userData.horaires.fin)}`;
    } else if (userData.heureDebut && userData.heureFin) {
      horaireText = `${userData.heureDebut}-${userData.heureFin}`;
    } else {
      horaireText = entrepriseResult.horaireDefaut;
    }
    
    // Éviter les doublons
    const existingEmploye = entrepriseResult.employes.find((emp: any) => emp.nom === userName);
    if (!existingEmploye) {
      entrepriseResult.employes.push({
        nom: userName,
        horaire: horaireText,
        isException: isException
      });
    }
  }

  // === GESTION DES UTILISATEURS ===

  // Récupère tous les utilisateurs actifs depuis l'API
  getUtilisateurs(): Observable<Utilisateur[]> {
    const apiKey = this.getApiKey();
    return new Observable(observer => {
      this.http.post<any>(`${this.apiUrl}?route=user/list`, {
        ApiKey: apiKey
      }).subscribe({
        next: (response) => {
          console.log('Réponse API utilisateurs:', response);
          
          if (response && response.Status === 200 && response.JsonResult) {
            console.log('Données brutes utilisateurs:', response.JsonResult);
            
            // Convertir les données API vers notre interface
            const utilisateurs: Utilisateur[] = response.JsonResult
              .filter((user: any) => {
                const isActive = user.active === 1 || user.Active === 1 || user.active === '1' || user.Active === '1';
                console.log(`Utilisateur ${user.Id} (${user.Email}) - actif: ${isActive}`);
                return isActive;
              })
              .map((user: any) => ({
                id: user.Id,
                nom: this.extractLastName(user.Name || user.Email),
                prenom: this.extractFirstName(user.Name || user.Email),
                email: user.Email,
                actif: true
              }));
            
            console.log('Utilisateurs traités:', utilisateurs);
            
            // Mettre à jour le cache
            this.utilisateursCache = utilisateurs;
            observer.next(utilisateurs);
          } else {
            console.log('Pas de données utilisateur valides dans la réponse');
            observer.next([]);
          }
          observer.complete();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des utilisateurs:', error);
          observer.next([]);
          observer.complete();
        }
      });
    });
  }

  // Version synchrone pour accès rapide (utilise le cache)
  getUtilisateurById(id: number): Utilisateur | undefined {
    return this.utilisateursCache.find(u => u.id === id);
  }

  // Méthodes utilitaires pour extraire nom et prénom
  private extractFirstName(fullName: string): string {
    if (!fullName) return 'Utilisateur';
    
    // Si c'est un email, prendre la partie avant @
    if (fullName.includes('@')) {
      return fullName.split('@')[0];
    }
    
    // Si c'est un nom complet, prendre le premier mot
    const parts = fullName.trim().split(' ');
    return parts[0] || 'Utilisateur';
  }

  private extractLastName(fullName: string): string {
    if (!fullName) return '';
    
    // Si c'est un email, ne pas extraire de nom de famille
    if (fullName.includes('@')) {
      return '';
    }
    
    // Si c'est un nom complet, prendre tout sauf le premier mot
    const parts = fullName.trim().split(' ');
    return parts.slice(1).join(' ') || '';
  }

  // === GESTION DES AFFECTATIONS ===

  // Crée une nouvelle affectation
  createAffectation(affectationData: {
    userId: number;
    entrepriseId: number;
    dates: Date[];
    heureDebut?: string;
    heureFin?: string;
    isException?: boolean;
    parentAffectationId?: number;
  }): boolean {
    const utilisateur = this.getUtilisateurById(affectationData.userId);
    const entreprise = this.getEntrepriseById(affectationData.entrepriseId);
    
    if (!utilisateur || !entreprise) {
      return false;
    }

    const userName = `${utilisateur.prenom} ${utilisateur.nom}`.trim();
    
    affectationData.dates.forEach(date => {
      // Supprime l'ancienne affectation si elle existe (pour remplacement)
      this.deleteAffectationForDate(date, affectationData.userId);
      
      const newId = Math.max(...this.affectations.map(a => a.id), 0) + 1;
      
      const newAffectation: Affectation = {
        id: newId,
        userId: affectationData.userId,
        userName: userName,
        entrepriseId: affectationData.entrepriseId,
        entrepriseName: entreprise.nom,
        entrepriseCouleur: entreprise.couleur,
        date: new Date(date),
        heureDebut: affectationData.heureDebut,
        heureFin: affectationData.heureFin,
        isException: affectationData.isException || false,
        parentAffectationId: affectationData.parentAffectationId
      };
      
      this.affectations.push(newAffectation);
    });
    
    return true;
  }

  // Supprime une affectation pour une date et un utilisateur donnés
  deleteAffectationForDate(date: Date, userId: number): void {
    const dateStr = date.toDateString();
    this.affectations = this.affectations.filter(affectation => 
      !(affectation.date.toDateString() === dateStr && affectation.userId === userId)
    );
  }

  // Supprime une affectation par ID
  deleteAffectation(id: number): boolean {
    const initialLength = this.affectations.length;
    this.affectations = this.affectations.filter(a => a.id !== id);
    return this.affectations.length < initialLength;
  }

  // Met à jour une affectation existante
  updateAffectation(id: number, updates: Partial<Affectation>): boolean {
    const affectationIndex = this.affectations.findIndex(a => a.id === id);
    if (affectationIndex === -1) {
      return false;
    }

    // Met à jour les champs modifiables
    if (updates.entrepriseId) {
      const entreprise = this.getEntrepriseById(updates.entrepriseId);
      if (entreprise) {
        this.affectations[affectationIndex].entrepriseId = updates.entrepriseId;
        this.affectations[affectationIndex].entrepriseName = entreprise.nom;
        this.affectations[affectationIndex].entrepriseCouleur = entreprise.couleur;
      }
    }

    if (updates.userId) {
      const utilisateur = this.getUtilisateurById(updates.userId);
      if (utilisateur) {
        this.affectations[affectationIndex].userId = updates.userId;
        this.affectations[affectationIndex].userName = `${utilisateur.prenom} ${utilisateur.nom}`.trim();
      }
    }

    if (updates.heureDebut !== undefined) {
      this.affectations[affectationIndex].heureDebut = updates.heureDebut;
    }

    if (updates.heureFin !== undefined) {
      this.affectations[affectationIndex].heureFin = updates.heureFin;
    }

    return true;
  }

  // Génère les dates d'une semaine à partir d'une date donnée
  getWeekDates(startDate: Date): Date[] {
    const dates: Date[] = [];
    const start = new Date(startDate);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  }

  // Vérifie si un utilisateur est déjà affecté à une date donnée
  isUserAssignedOnDate(userId: number, date: Date): boolean {
    const dateStr = date.toDateString();
    return this.affectations.some(affectation => 
      affectation.userId === userId && affectation.date.toDateString() === dateStr
    );
  }

  // === NOUVELLES MÉTHODES API POUR GESTION CALENDRIER ===

  /**
   * Assigne un utilisateur à une entreprise avec génération automatique des plannings
   */
  assignUserToEntreprise(userId: number, entrepriseId: number, dates?: string[]): Observable<ApiResponse<any>> {
    const body = {
      ApiKey: this.getApiKey(),
      idUser: userId, // Changé de IdUser vers idUser selon la doc API
      entreprise_id: entrepriseId,
      ...(dates && { dates })
    };

    console.log('Corps de la requête assignUserToEntreprise:', body);
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/?route=entreprise/assign_user`, body);
  }

  /**
   * Retire un utilisateur d'une entreprise
   */
  removeUserFromEntreprise(userId: number, entrepriseId: number): Observable<ApiResponse<any>> {
    const body = {
      ApiKey: this.getApiKey(),
      idUser: userId, // Changé selon la doc API
      entreprise_id: entrepriseId
    };

    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/?route=entreprise/remove_user`, body);
  }

  /**
   * Liste les affectations d'une entreprise
   */
  getEntrepriseAffectations(entrepriseId: number): Observable<ApiResponse<any>> {
    const body = {
      ApiKey: this.getApiKey(),
      entreprise_id: entrepriseId
    };

    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/?route=entreprise/list_affectations`, body);
  }

  /**
   * Définit les horaires d'une entreprise
   */
  setEntrepriseSchedule(entrepriseId: number, schedules: HoraireEntreprise[]): Observable<ApiResponse<any>> {
    const body = {
      ApiKey: this.getApiKey(),
      IdEntreprise: entrepriseId, // Selon la doc API set_schedule utilise IdEntreprise
      schedules: schedules
    };

    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/?route=entreprise/set_schedule`, body);
  }

  /**
   * Récupère les horaires d'une entreprise
   */
  getEntrepriseSchedule(entrepriseId: number, day?: number): Observable<ApiResponse<any>> {
    const body = {
      ApiKey: this.getApiKey(),
      IdEntreprise: entrepriseId, // Selon la doc API get_schedule utilise IdEntreprise
      ...(day && { Day: day })
    };

    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/?route=entreprise/get_schedule`, body);
  }

  /**
   * Met à jour l'horaire d'un jour spécifique
   */
  updateEntrepriseSchedule(entrepriseId: number, day: number, workTimeIn?: string, workTimeOut?: string): Observable<ApiResponse<any>> {
    const body = {
      ApiKey: this.getApiKey(),
      IdEntreprise: entrepriseId, // Selon la doc API update_schedule utilise IdEntreprise
      Day: day,
      ...(workTimeIn && { WorkTimeIn: workTimeIn }),
      ...(workTimeOut && { WorkTimeOut: workTimeOut })
    };

    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/?route=entreprise/update_schedule`, body);
  }

  /**
   * Vérifie si une entreprise travaille à une date/heure donnée
   */
  checkEntrepriseWorkingTime(entrepriseId: number, date?: string, time?: string): Observable<ApiResponse<any>> {
    const body = {
      ApiKey: this.getApiKey(),
      IdEntreprise: entrepriseId, // Selon la doc API check_working_time utilise IdEntreprise
      ...(date && { date }),
      ...(time && { time })
    };

    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/?route=entreprise/check_working_time`, body);
  }

  /**
   * Récupère le calendrier de la semaine pour toutes les entreprises
   */
  getWeekCalendar(dateStart?: string, dateEnd?: string): Observable<ApiResponse<CalendrierId>> {
    const body = {
      ApiKey: this.getApiKey(),
      ...(dateStart && { date_start: dateStart }),
      ...(dateEnd && { date_end: dateEnd })
    };

    return this.http.post<ApiResponse<CalendrierId>>(`${this.apiUrl}/?route=entreprise/get_week_calendar`, body);
  }

  // === MÉTHODES UTILITAIRES POUR CONVERSION FORMATS ===

  /**
   * Convertit une heure du format "HH:mm" vers "HHMM"
   */
  convertTimeToAPI(time: string): string {
    return time.replace(':', '');
  }

  /**
   * Convertit une heure du format "HHMM" vers "HH:mm"
   */
  convertTimeFromAPI(time: string): string {
    if (time.length === 4) {
      return `${time.substring(0, 2)}:${time.substring(2, 4)}`;
    }
    return time;
  }

  /**
   * Convertit un jour numérique en nom
   */
  getDayName(dayNumber: number): string {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[dayNumber === 7 ? 0 : dayNumber];
  }

  /**
   * Formate une date pour l'API (YYYY-MM-DD)
   */
  formatDateForAPI(date: Date): string {
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
           String(date.getDate()).padStart(2, '0');
  }

  // === MÉTHODES COMBINÉES POUR L'INTERFACE ===

  /**
   * Crée une affectation complète avec gestion des horaires d'entreprise
   */
  createCompleteAffectation(
    userId: number, 
    entrepriseId: number, 
    dates: Date[], 
    customHours?: { heureDebut: string, heureFin: string }
  ): Observable<any> {
    
    // 1. D'abord assigner l'utilisateur à l'entreprise
    const formattedDates = dates.map(date => this.formatDateForAPI(date));
    
    return this.assignUserToEntreprise(userId, entrepriseId, formattedDates).pipe(
      map(response => {
        if (response.Status === 200) {
          // 2. Si des horaires personnalisés sont fournis, les appliquer
          if (customHours) {
            // Convertir les horaires et les appliquer pour chaque jour
            const timeIn = this.convertTimeToAPI(customHours.heureDebut);
            const timeOut = this.convertTimeToAPI(customHours.heureFin);
            
            // Ici on pourrait ajouter une logique pour gérer les horaires personnalisés
            // Pour l'instant, on utilise les horaires par défaut de l'entreprise
          }
          
          // Recharger les affectations pour cette semaine
          this.loadWeekAffectations(dates[0]);
        }
        return response;
      }),
      catchError(error => {
        console.error('Erreur lors de la création de l\'affectation:', error);
        return of({ Status: 500, Message: 'Erreur lors de la création', JsonResult: null });
      })
    );
  }

  /**
   * TEST DIRECT - Appel l'API get_day_calendar avec logging détaillé
   */
  testGetDayCalendar(): Observable<any> {
    const today = this.formatDateForAPI(new Date());
    console.log('=== TEST DIRECT get_day_calendar ===');
    console.log('Date formatée:', today);
    
    return this.getDayCalendar(today).pipe(
      tap(response => {
        console.log('=== RÉSULTAT TEST DIRECT ===');
        console.log('Status:', response.Status);
        console.log('Message:', response.Message);
        console.log('JsonResult type:', typeof response.JsonResult);
        console.log('JsonResult:', JSON.stringify(response.JsonResult, null, 2));
        
        if (Array.isArray(response.JsonResult)) {
          console.log('C\'est un array de longueur:', response.JsonResult.length);
        } else if (typeof response.JsonResult === 'object' && response.JsonResult) {
          console.log('C\'est un objet avec les clés:', Object.keys(response.JsonResult));
        }
      }),
      catchError(error => {
        console.error('=== ERREUR TEST DIRECT ===');
        console.error('Error:', error);
        return of(null);
      })
    );
  }
} 