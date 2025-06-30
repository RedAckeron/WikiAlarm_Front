import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { environment } from 'src/environments/environment';
import { CalendrierService } from 'src/app/services/calendrier.service';
import { forkJoin } from 'rxjs';

interface Employee {
  prenom: string;
  nom: string;
}

interface ApiAffectation {
  entreprise: string;
  couleur: string;
  employes: Employee[];
  date: string;
}

interface DayAffectations {
  sas: string[];
  dumay: string[];
  devilder: string[];
  raway: string[];
  service: string[];
  massart: string[];
}

interface WeekDay {
  date: Date;
  name: string;
  isToday: boolean;
  affectations: DayAffectations;
}

interface WeekAffectation {
  entreprise: string;
  couleur: string;
  employes: Employee[];
  daysCount: number;
  startDate: Date;
  endDate: Date;
}

interface ApiResponse {
  Status: number;
  JsonResult: any;
  Message?: string;
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
  standalone: false,
  providers: [MessageService]
})
export class CalendrierComponent implements OnInit {
  
  // Données
  affectations: ApiAffectation[] = [];
  
  // Calendrier
  currentDate = new Date();
  currentWeekStart = new Date();
  
  // États
  loading = false;
  viewMode: 'week' | 'day' = 'week';
  
  // Mois et jours
  monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  
  dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  weekDays: WeekDay[] = [];
  weekStart: Date = new Date();
  weekEnd: Date = new Date();
  weekAffectations: WeekAffectation[] = [];
  showWeekPicker: boolean = false;
  selectedDate: Date = new Date();
  frenchLocale: any = {
    firstDayOfWeek: 1,
    dayNames: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
    dayNamesShort: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    dayNamesMin: ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"],
    monthNames: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
    monthNamesShort: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"],
    today: 'Aujourd\'hui',
    clear: 'Effacer',
    dateFormat: 'dd/mm/yy',
    weekHeader: 'Sem.'
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private calendrierService: CalendrierService
  ) {}

  ngOnInit(): void {
    this.loadCurrentWeek();
  }

  loadCurrentWeek() {
    const today = new Date();
    this.weekStart = this.getWeekStart(today);
    this.weekEnd = this.getWeekEnd(today);
    this.loadWeekDays();
  }

  loadWeekAffectations() {
    this.loading = true;
    const apiKey = sessionStorage.getItem('apiKey') || '';

    // Créer un tableau de promesses pour chaque jour de la semaine
    const promises = this.weekDays.map(day => {
      return this.calendrierService.loadDayAffectationsFromAPI(day.date).toPromise();
    });

    // Attendre que toutes les promesses soient résolues
    Promise.all(promises)
      .then(results => {
        // Pour chaque jour, traiter les affectations
        this.weekDays.forEach((day, index) => {
          const dayResult = results[index];
          if (dayResult && dayResult.length > 0) {
            // Convertir les affectations au format attendu
            const affectations: DayAffectations = {
              sas: [],
              dumay: [],
              devilder: [],
              raway: [],
              service: [],
              massart: []
            };

            dayResult.forEach(aff => {
              const entrepriseName = aff.entreprise.toLowerCase().trim();
              
              // Récupérer tous les employés
              const employeeNames = aff.employes.map((emp: Employee) => 
                `${emp.prenom} ${emp.nom}`.trim()
              );

              if (entrepriseName === 'sas') {
                affectations.sas = employeeNames;
              } else if (entrepriseName === 'dumay mior') {
                affectations.dumay = employeeNames;
              } else if (entrepriseName === 'de vilder') {
                affectations.devilder = employeeNames;
              } else if (entrepriseName === 'raway') {
                affectations.raway = employeeNames;
              } else if (entrepriseName === 'service de garde') {
                affectations.service = employeeNames;
              } else if (entrepriseName === 'massart') {
                affectations.massart = employeeNames;
              }
            });

            day.affectations = affectations;
          }
        });

        this.updateWeekSummary();
      })
      .catch(error => {
        console.error('Erreur lors du chargement des affectations:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les affectations: ' + (error.message || error),
          life: 3000
        });
      })
      .finally(() => {
        this.loading = false;
      });
  }

  private processWeekAffectations() {
    const affectationsByEntreprise = new Map<string, WeekAffectation>();

    // Parcourir tous les jours et leurs affectations
    this.weekDays.forEach(day => {
      // Récupérer les affectations du jour
      const dayAffectations = day.affectations;
      
      // Si le jour a des affectations, les traiter
      Object.entries(dayAffectations).forEach(([entreprise, userNames]) => {
        if (userNames.length > 0) {
          const key = entreprise;
          
          if (!affectationsByEntreprise.has(key)) {
            affectationsByEntreprise.set(key, {
              entreprise: entreprise,
              couleur: this.getColorForEntreprise(entreprise),
              employes: [],
              daysCount: 1,
              startDate: day.date,
              endDate: day.date
            });
          } else {
            const existingAffectation = affectationsByEntreprise.get(key)!;
            existingAffectation.daysCount++;
            
            if (day.date < existingAffectation.startDate) {
              existingAffectation.startDate = day.date;
            }
            if (day.date > existingAffectation.endDate) {
              existingAffectation.endDate = day.date;
            }
          }
        }
      });
    });

    this.weekAffectations = Array.from(affectationsByEntreprise.values())
      .filter(aff => aff.daysCount > 1)
      .sort((a, b) => b.daysCount - a.daysCount);
  }

  private getColorForEntreprise(entreprise: string): string {
    switch (entreprise.toLowerCase()) {
      case 'sas':
        return '#e83e8c';  // Rose
      case 'dumay':
        return '#007bff';  // Bleu
      case 'devilder':
        return '#6c757d';  // Gris
      case 'raway':
        return '#6c757d';  // Gris
      case 'service':
        return '#ffc107';  // Jaune
      case 'massart':
        return '#6c757d';  // Gris
      default:
        return '#6c757d';  // Gris par défaut
    }
  }

  updateWeekSummary() {
    // Pas besoin de mettre à jour le résumé car les affectations sont déjà à jour
    // après le chargement des données de chaque jour
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  previousWeek() {
    this.weekStart.setDate(this.weekStart.getDate() - 7);
    this.weekEnd.setDate(this.weekEnd.getDate() - 7);
    this.loadWeekDays();
  }

  nextWeek() {
    this.weekStart.setDate(this.weekStart.getDate() + 7);
    this.weekEnd.setDate(this.weekEnd.getDate() + 7);
    this.loadWeekDays();
  }

  private getDayName(day: number): string {
    return this.dayNames[day];
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  private getWeekEnd(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? 0 : 7);
    return new Date(d.setDate(diff));
  }

  private loadWeekDays() {
    this.weekDays = [];
    const currentDate = new Date(this.weekStart);
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      this.weekDays.push({
        name: this.getDayName(currentDate.getDay()),
        date: new Date(currentDate),
        isToday: this.isSameDay(currentDate, today),
        affectations: {
          sas: [],
          dumay: [],
          devilder: [],
          raway: [],
          service: [],
          massart: []
        }
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    this.loadWeekAffectations();
  }
}
