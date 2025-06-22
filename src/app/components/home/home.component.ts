import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { UserFormLogin } from 'src/app/models/Forms/UsersFormLogin';
import { AuthService } from 'src/app/services/auth.service';
import { CalendrierService } from 'src/app/services/calendrier.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [MessageService]
})
export class HomeComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  loadingToday = false;
  isConnected = false;
  todaySummary: any[] = [];
  currentDate: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private calendrierService: CalendrierService
  ) {
    this.loginForm = this.fb.group({
      Email: ['', [Validators.required, Validators.email]],
      Password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.authService.IsConnected.subscribe({
      next: (value: Boolean) => {
        this.isConnected = !!value;
        if (value) {
          this.loadTodaySummaryFromAPI();
        }
      }
    });
  }

  /**
   * Charge les affectations du jour depuis l'API
   */
  loadTodaySummaryFromAPI() {
    this.loadingToday = true;
    this.currentDate = new Date().toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // D'abord charger les utilisateurs pour avoir les noms corrects
    this.calendrierService.getUtilisateurs().subscribe({
      next: (utilisateurs) => {
        console.log('Utilisateurs chargés pour home:', utilisateurs.length);
        
        // Ensuite charger les affectations du jour avec la nouvelle route
        console.log('=== CHARGEMENT AFFECTATIONS DU JOUR ===');
        console.log('Date du jour:', new Date().toISOString().split('T')[0]);
        
        this.calendrierService.loadTodayAffectationsFromAPI().subscribe({
          next: (affectations) => {
            console.log('Affectations du jour chargées via get_day_calendar:', affectations);
            console.log('Nombre d\'affectations trouvées:', affectations.length);
            this.todaySummary = affectations;
            
            if (affectations.length === 0) {
              this.messageService.add({
                severity: 'info',
                summary: 'Information',
                detail: 'Aucune affectation prévue pour aujourd\'hui',
                life: 3000
              });
            } else {
              const totalEmployes = affectations.reduce((total, entreprise) => 
                total + entreprise.employes.length, 0);
              
              this.messageService.add({
                severity: 'success',
                summary: 'Affectations chargées',
                detail: `${totalEmployes} employé(s) affecté(s) aujourd'hui`,
                life: 3000
              });
            }
          },
          error: (error) => {
            console.error('Erreur lors du chargement des affectations du jour via get_day_calendar:', error);
            this.messageService.add({
              severity: 'warn',
              summary: 'Attention',
              detail: 'Impossible de charger les affectations du jour, utilisation des données locales',
              life: 4000
            });
            
            // Fallback sur l'ancienne méthode
            this.loadTodaySummary();
          },
          complete: () => {
            this.loadingToday = false;
          }
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.loadingToday = false;
        
        // Fallback sur l'ancienne méthode
        this.loadTodaySummary();
      }
    });
  }

  /**
   * Méthode de fallback pour charger les données locales
   */
  loadTodaySummary() {
    this.todaySummary = this.calendrierService.getTodayAffectationsSummary();
    this.currentDate = new Date().toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const userForm: UserFormLogin = this.loginForm.value;
    this.authService.login(userForm).subscribe({
      next: (response) => {
        this.loading = false;
        
        // Affiche le message de succès de l'API
        this.messageService.add({
          severity: 'success',
          summary: 'Connexion réussie',
          detail: response.Message || 'Bienvenue !',
          life: 3000
        });

        this.loadTodaySummaryFromAPI();
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur login:', error);
        
        // Affiche le message d'erreur exact de l'API
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur de connexion',
          detail: error.message || 'Une erreur est survenue lors de la connexion',
          life: 5000
        });
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  /**
   * Recharge manuellement les affectations du jour
   */
  rechargerAffectations() {
    console.log('=== RECHARGEMENT MANUEL DES AFFECTATIONS ===');
    this.loadTodaySummaryFromAPI();
  }

  /**
   * Test direct de l'API get_day_calendar
   */
  testAPIDirecte() {
    console.log('=== TEST API DIRECTE ===');
    this.calendrierService.testGetDayCalendar().subscribe({
      next: (result) => {
        console.log('Résultat du test API:', result);
      },
      error: (error) => {
        console.error('Erreur du test API:', error);
      }
    });
  }

  // Génère le texte de la plage de dates de la semaine courante
  private generateWeekRange(): string {
    const currentWeek = this.calendrierService.getCurrentWeek();
    const startDate = currentWeek[0].toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    const endDate = currentWeek[6].toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${startDate} - ${endDate}`;
  }

  // Convertit les jours d'activité en texte lisible
  getJoursActiviteText(joursActivite: number[]): string {
    const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    
    if (joursActivite.length === 7) {
      return '7j/7';
    }
    
    if (joursActivite.length === 5 && joursActivite.every(j => j <= 5)) {
      return 'Lun-Ven';
    }
    
    if (joursActivite.length === 6 && joursActivite.every(j => j <= 6)) {
      return 'Lun-Sam';
    }
    
    // Sinon, liste les jours spécifiques
    return joursActivite.map(j => jours[j - 1]).join(', ');
  }

  // Récupère tous les employés dans une liste plate
  getAllEmployes(): any[] {
    const allEmployes: any[] = [];
    
    this.todaySummary.forEach(entreprise => {
      entreprise.employes.forEach((employe: any) => {
        allEmployes.push({
          nom: employe.nom,
          entreprise: entreprise.entreprise,
          couleurEntreprise: entreprise.couleur,
          horaire: employe.horaire,
          isException: employe.isException || false
        });
      });
    });
    
    // Trier par nom d'employé
    return allEmployes.sort((a, b) => a.nom.localeCompare(b.nom));
  }
}