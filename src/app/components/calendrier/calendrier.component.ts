import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { environment } from 'src/environments/environment';

interface Entreprise {
  id: number;
  nom: string;
  couleur: string;
  horairesParJour?: { [key: number]: { debut: string; fin: string; actif: boolean } };
}

interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
}

interface Affectation {
  id: number;
  date: string;
  utilisateur: Utilisateur;
  entreprise: Entreprise;
  heureDebut?: string;
  heureFin?: string;
  isException?: boolean;
}

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], filterValue: any, filterProperty: string): any[] {
    if (!items || !filterValue) {
      return items || [];
    }
    
    return items.filter(item => {
      const value = this.getNestedProperty(item, filterProperty);
      return value == filterValue;
    });
  }
  
  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((o, p) => o && o[p], obj);
  }
}

@Component({
  selector: 'app-calendrier',
  templateUrl: './calendrier.component.html',
  styleUrls: ['./calendrier.component.scss'],
  standalone: false
})
export class CalendrierComponent implements OnInit {
  
  // Données
  entreprises: Entreprise[] = [];
  utilisateurs: Utilisateur[] = [];
  affectations: Affectation[] = [];
  
  // Calendrier
  currentDate = new Date();
  currentWeekStart = new Date();
  calendarDays: any[] = [];
  
  // États
  loading = false;
  viewMode: 'week' | 'day' = 'week'; // Vue par défaut : semaine
  
  // Mois et jours
  monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  
  dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initializeWeekStart();
    this.loadData();
  }

  initializeWeekStart() {
    // Calculer le début de la semaine courante (dimanche)
    const today = new Date();
    const dayOfWeek = today.getDay();
    this.currentWeekStart = new Date(today);
    this.currentWeekStart.setDate(today.getDate() - dayOfWeek);
    this.currentWeekStart.setHours(0, 0, 0, 0);
  }

  loadData() {
    this.loading = true;
    const apiKey = sessionStorage.getItem('apiKey') || '';
    
    // Charger les entreprises
    this.http.post<any>(`${environment.apiUrl}?route=entreprise/list`, {
      ApiKey: apiKey
    }).subscribe({
      next: (response) => {
        if (response.Status === 200) {
          const entreprisesData = response.JsonResult?.entreprises || [];
          this.entreprises = entreprisesData.map((item: any) => ({
            id: item.entreprise.id,
            nom: item.entreprise.nom,
            couleur: item.entreprise.couleur,
            horairesParJour: item.horairesParJour || {}
          }));
        }
        this.loadAffectations();
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur lors du chargement des entreprises:', error);
      }
    });
  }

  loadAffectations() {
    const apiKey = sessionStorage.getItem('apiKey') || '';
    
    // Charger les affectations selon la vue
    const { startDate, endDate } = this.getDateRange();
    
    this.http.post<any>(`${environment.apiUrl}?route=affectation/list`, {
      ApiKey: apiKey,
      dateDebut: this.formatDate(startDate),
      dateFin: this.formatDate(endDate)
    }).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.Status === 200) {
          this.affectations = response.JsonResult || [];
          this.generateCalendar();
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur lors du chargement des affectations:', error);
        this.generateCalendar(); // Générer le calendrier même sans affectations
      }
    });
  }

  getDateRange(): { startDate: Date, endDate: Date } {
    if (this.viewMode === 'day') {
      // Vue jour : seulement le jour courant
      const startDate = new Date(this.currentDate);
      const endDate = new Date(this.currentDate);
      return { startDate, endDate };
    } else {
      // Vue semaine : 7 jours à partir du début de semaine
      const startDate = new Date(this.currentWeekStart);
      const endDate = new Date(this.currentWeekStart);
      endDate.setDate(startDate.getDate() + 6);
      return { startDate, endDate };
    }
  }

  generateCalendar() {
    this.calendarDays = [];
    
    if (this.viewMode === 'day') {
      // Vue jour : un seul jour
      const dayData = {
        date: new Date(this.currentDate),
        dateString: this.formatDate(this.currentDate),
        isToday: this.isToday(this.currentDate),
        affectations: this.getAffectationsForDate(this.currentDate)
      };
      this.calendarDays.push(dayData);
    } else {
      // Vue semaine : 7 jours
      for (let i = 0; i < 7; i++) {
        const date = new Date(this.currentWeekStart);
        date.setDate(this.currentWeekStart.getDate() + i);
        
        const dayData = {
          date: date,
          dateString: this.formatDate(date),
          isToday: this.isToday(date),
          affectations: this.getAffectationsForDate(date)
        };
        
        this.calendarDays.push(dayData);
      }
    }
  }

  getAffectationsForDate(date: Date): Affectation[] {
    const dateString = this.formatDate(date);
    return this.affectations.filter(affectation => 
      affectation.date === dateString
    );
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  previousPeriod() {
    if (this.viewMode === 'day') {
      // Jour précédent
      this.currentDate.setDate(this.currentDate.getDate() - 1);
    } else {
      // Semaine précédente
      this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    }
    this.loadAffectations();
  }

  nextPeriod() {
    if (this.viewMode === 'day') {
      // Jour suivant
      this.currentDate.setDate(this.currentDate.getDate() + 1);
    } else {
      // Semaine suivante
      this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    }
    this.loadAffectations();
  }

  goToToday() {
    const today = new Date();
    this.currentDate = new Date(today);
    this.initializeWeekStart();
    this.loadAffectations();
  }

  switchViewMode(mode: 'week' | 'day') {
    this.viewMode = mode;
    if (mode === 'day') {
      this.currentDate = new Date(); // Aller au jour courant
    } else {
      this.initializeWeekStart(); // Aller à la semaine courante
    }
    this.loadAffectations();
  }

  getWeekDateRange(): string {
    const endDate = new Date(this.currentWeekStart);
    endDate.setDate(this.currentWeekStart.getDate() + 6);
    
    const startStr = this.currentWeekStart.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    });
    const endStr = endDate.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
    
    return `${startStr} - ${endStr}`;
  }

  getCurrentDateStr(): string {
    return this.currentDate.toLocaleDateString('fr-FR', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }

  getEntrepriseById(id: number): Entreprise | undefined {
    return this.entreprises.find(e => e.id === id);
  }

  getAffectationsByEntreprise(affectations: Affectation[]): { [key: string]: Affectation[] } {
    const grouped: { [key: string]: Affectation[] } = {};
    
    affectations.forEach(affectation => {
      const entrepriseNom = affectation.entreprise.nom;
      if (!grouped[entrepriseNom]) {
        grouped[entrepriseNom] = [];
      }
      grouped[entrepriseNom].push(affectation);
    });
    
    return grouped;
  }

  // Méthode de filtrage pour le template
  filterAffectationsByEntreprise(affectations: Affectation[], entrepriseId: number): Affectation[] {
    return affectations.filter(affectation => affectation.entreprise.id === entrepriseId);
  }
}
