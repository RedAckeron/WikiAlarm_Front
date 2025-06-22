import { Component, OnInit } from '@angular/core';
import { CalendrierService, Affectation, Utilisateur, Entreprise, ApiResponse } from 'src/app/services/calendrier.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-calendrier',
  templateUrl: './calendrier.component.html',
  styleUrls: ['./calendrier.component.scss']
})
export class CalendrierComponent implements OnInit {
  
  // Dates de la semaine courante
  currentWeek: Date[] = [];
  currentDate = new Date();

  // Données pour les modals
  showAffectationModal = false;
  showModificationModal = false;
  showHorairesModal = false;
  
  // Formulaire d'affectation
  affectationForm = {
    userId: null as number | null,
    entrepriseId: null as number | null,
    typeAffectation: 'jour' as 'jour' | 'semaine',
    dates: [] as Date[],
    heureDebut: '',
    heureFin: '',
    useDefaultHours: true,
    isException: false
  };

  // Formulaire de gestion des horaires d'entreprise
  horaireForm = {
    entrepriseId: null as number | null,
    horaires: [
      { day: 1, workTimeIn: '0800', workTimeOut: '1630', active: true }, // Lundi
      { day: 2, workTimeIn: '0800', workTimeOut: '1630', active: true }, // Mardi
      { day: 3, workTimeIn: '0800', workTimeOut: '1630', active: true }, // Mercredi
      { day: 4, workTimeIn: '0800', workTimeOut: '1630', active: true }, // Jeudi
      { day: 5, workTimeIn: '0800', workTimeOut: '1630', active: true }, // Vendredi
      { day: 6, workTimeIn: '0900', workTimeOut: '1200', active: false }, // Samedi
      { day: 7, workTimeIn: '0000', workTimeOut: '0000', active: false }  // Dimanche
    ]
  };

  // Données pour modification
  selectedAffectation: Affectation | null = null;
  
  // Listes de référence
  utilisateurs: Utilisateur[] = [];
  entreprises: Entreprise[] = [];

  // État de chargement
  loading = false;

  // Données du calendrier de la semaine (depuis l'API)
  weekCalendarData: any = null;
  
  // Affectations par jour pour affichage dans les colonnes
  dailyAffectations: { [key: string]: any[] } = {};

  constructor(
    public calendrierService: CalendrierService,
    private messageService: MessageService
  ) {
    this.generateCurrentWeek();
  }

  ngOnInit() {
    this.loadReferenceData();
    this.loadCurrentWeekCalendar();
    this.loadDailyAffectations();
  }

  loadReferenceData() {
    this.loading = true;
    
    // Charger les utilisateurs depuis l'API
    this.calendrierService.getUtilisateurs().subscribe({
      next: (utilisateurs) => {
        console.log('Utilisateurs chargés:', utilisateurs);
        this.utilisateurs = utilisateurs;
        
        if (utilisateurs.length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Attention',
            detail: 'Aucun utilisateur actif trouvé'
          });
        } else {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: `${utilisateurs.length} utilisateur(s) chargé(s)`
          });
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger la liste des utilisateurs'
        });
      },
      complete: () => {
        this.loading = false;
      }
    });
    
    // Charger les vraies entreprises depuis l'API
    this.calendrierService.getEntreprisesFromAPI().subscribe({
      next: (response) => {
        console.log('Réponse API entreprises complète:', response);
        console.log('Type de JsonResult:', typeof response.JsonResult);
        console.log('JsonResult:', response.JsonResult);
        
        if (response.Status === 200 && response.JsonResult) {
          let entreprisesData: any[] = [];
          
          // L'API retourne un objet avec une propriété "entreprises" qui contient le tableau
          if (response.JsonResult && typeof response.JsonResult === 'object') {
            const jsonResult = response.JsonResult as any;
            if (jsonResult.entreprises && Array.isArray(jsonResult.entreprises)) {
              entreprisesData = jsonResult.entreprises;
              console.log('Entreprises extraites de JsonResult.entreprises:', entreprisesData);
            } else if (Array.isArray(response.JsonResult)) {
              // Fallback si c'est directement un tableau
              entreprisesData = response.JsonResult;
            } else {
              // Dernier fallback : convertir l'objet en tableau
              entreprisesData = Object.values(response.JsonResult);
            }
          }
          
          console.log('Données entreprises extraites:', entreprisesData);
          console.log('Première entreprise brute:', entreprisesData[0]);
          console.log('Propriétés de la première entreprise:', Object.keys(entreprisesData[0] || {}));
          
          if (entreprisesData.length > 0) {
            // Transformer les données API vers notre format local
            // Chaque élément a une propriété "entreprise" avec les vraies données
            this.entreprises = entreprisesData.map((item: any) => {
              console.log('Item complet de l\'API:', item);
              
              // Extraire les données de l'entreprise
              const entrepriseData = item.entreprise;
              console.log('Données entreprise extraites:', entrepriseData);
              
              // Extraire les jours actifs depuis horairesParJour
              const joursActifs: number[] = [];
              if (item.horairesParJour) {
                Object.keys(item.horairesParJour).forEach(day => {
                  if (item.horairesParJour[day].actif) {
                    joursActifs.push(parseInt(day));
                  }
                });
              }
              
              // Extraire les horaires par défaut (premier jour actif)
              let heureDebut = '08:00';
              let heureFin = '16:30';
              if (item.horairesParJour && joursActifs.length > 0) {
                const premierJour = item.horairesParJour[joursActifs[0]];
                if (premierJour) {
                  heureDebut = premierJour.debut || '08:00';
                  heureFin = premierJour.fin || '16:30';
                }
              }
              
              const mapped = {
                id: parseInt(entrepriseData.id), // Convertir string vers number
                nom: entrepriseData.nom,
                couleur: entrepriseData.couleur || '#007bff',
                joursActivite: joursActifs.length > 0 ? joursActifs : [1, 2, 3, 4, 5], // Jours réellement actifs
                heureDebut: heureDebut,
                heureFin: heureFin,
                description: `${entrepriseData.nom} (${joursActifs.length} jours actifs)`
              };
              console.log('Entreprise mappée:', mapped);
              return mapped;
            });
            console.log('Entreprises transformées:', this.entreprises);
            console.log('Première entreprise:', this.entreprises[0]);
            console.log('Longueur du tableau entreprises:', this.entreprises.length);
            
            // Forcer la détection des changements
            setTimeout(() => {
              console.log('Entreprises après timeout:', this.entreprises);
            }, 100);
            
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: `${this.entreprises.length} entreprise(s) chargée(s) depuis l'API`
            });
          } else {
            console.warn('Aucune entreprise trouvée dans la réponse API, utilisation des données locales');
            this.entreprises = this.calendrierService.getEntreprises();
            this.messageService.add({
              severity: 'info',
              summary: 'Information',
              detail: 'Utilisation des entreprises locales (aucune trouvée dans l\'API)'
            });
          }
        } else {
          console.warn('Réponse API entreprises invalide, utilisation des données locales');
          this.entreprises = this.calendrierService.getEntreprises();
          this.messageService.add({
            severity: 'warn',
            summary: 'Attention',
            detail: 'Réponse API invalide, utilisation des entreprises locales'
          });
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des entreprises:', error);
        this.messageService.add({
          severity: 'warn',
          summary: 'Attention',
          detail: 'Impossible de charger les entreprises depuis l\'API, utilisation des données locales'
        });
        // Fallback sur les données locales
    this.entreprises = this.calendrierService.getEntreprises();
      }
    });
  }

  /**
   * Charge le calendrier de la semaine depuis l'API
   */
  loadCurrentWeekCalendar() {
    const startDate = this.calendrierService.formatDateForAPI(this.currentWeek[0]);
    const endDate = this.calendrierService.formatDateForAPI(this.currentWeek[6]);
    
    this.loading = true;
    
    this.calendrierService.getWeekCalendar(startDate, endDate).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.Status === 200) {
          this.weekCalendarData = response.JsonResult;
          console.log('Calendrier de la semaine chargé:', this.weekCalendarData);
          
          this.messageService.add({
            severity: 'success',
            summary: 'Calendrier chargé',
            detail: `Données de la semaine du ${startDate} au ${endDate} récupérées`
          });
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Attention',
            detail: response.Message || 'Impossible de charger le calendrier'
          });
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement du calendrier:', error);
        this.messageService.add({
          severity: 'warn',
          summary: 'Avertissement',
          detail: 'Utilisation des données d\'exemple pour le calendrier'
        });
        
        // Fallback sur l'ancienne méthode
        this.loadCurrentWeekAffectations();
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  loadCurrentWeekAffectations() {
    // Calculer le début de la semaine courante (lundi)
    const startOfWeek = new Date(this.currentWeek[0]);
    
    this.calendrierService.loadWeekAffectations(startOfWeek).subscribe({
      next: (affectations) => {
        console.log('Affectations chargées depuis l\'API:', affectations);
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `${affectations.length} affectation(s) chargée(s)`
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement des affectations:', error);
        this.messageService.add({
          severity: 'warn',
          summary: 'Avertissement',
          detail: 'Utilisation des données d\'exemple'
        });
      }
    });
  }

  /**
   * Charge les affectations pour chaque jour de la semaine courante
   */
  loadDailyAffectations() {
    console.log('=== CHARGEMENT DES AFFECTATIONS QUOTIDIENNES ===');
    
    // Réinitialiser les affectations
    this.dailyAffectations = {};
    
    // Charger les affectations pour chaque jour de la semaine
    this.currentWeek.forEach((date, index) => {
      const dateKey = this.calendrierService.formatDateForAPI(date);
      console.log(`Chargement des affectations pour ${dateKey}`);
      
      this.calendrierService.getDayCalendar(dateKey).subscribe({
        next: (response) => {
          if (response.Status === 200 && response.JsonResult) {
            console.log(`Affectations pour ${dateKey}:`, response.JsonResult);
            
            // Traiter les données avec la méthode de traitement existante
            const affectations = this.calendrierService['processTodayAffectations'](response.JsonResult);
            console.log(`Affectations traitées pour ${dateKey}:`, affectations);
            
            // Stocker les affectations pour ce jour
            this.dailyAffectations[dateKey] = affectations;
            
            // Forcer la détection des changements
            setTimeout(() => {
              console.log(`Affectations stockées pour ${dateKey}:`, this.dailyAffectations[dateKey]);
            }, 10);
          }
        },
        error: (error) => {
          console.error(`Erreur lors du chargement des affectations pour ${dateKey}:`, error);
          this.dailyAffectations[dateKey] = [];
        }
      });
    });
  }

  get affectations(): Affectation[] {
    return this.calendrierService.getAffectations();
  }

  generateCurrentWeek() {
    const startOfWeek = new Date(this.currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Lundi = premier jour
    startOfWeek.setDate(diff);

    this.currentWeek = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      this.currentWeek.push(date);
    }
  }

  previousWeek() {
    this.currentDate.setDate(this.currentDate.getDate() - 7);
    this.generateCurrentWeek();
    this.loadCurrentWeekCalendar();
    this.loadDailyAffectations();
  }

  nextWeek() {
    this.currentDate.setDate(this.currentDate.getDate() + 7);
    this.generateCurrentWeek();
    this.loadCurrentWeekCalendar();
    this.loadDailyAffectations();
  }

  /**
   * Récupère les affectations pour un jour donné
   */
  getDailyAffectations(date: Date): any[] {
    const dateKey = this.calendrierService.formatDateForAPI(date);
    return this.dailyAffectations[dateKey] || [];
  }

  // Récupère l'affectation pour une date donnée (priorité aux exceptions)
  getAffectationForDate(date: Date): Affectation | undefined {
    return this.calendrierService.getAffectationForDate(date);
  }

  // Récupère les affectations de semaine (pour l'affichage en bloc)
  getWeekAffectations() {
    const weekAffectations: {[key: string]: Affectation[]} = {};
    
    this.currentWeek.forEach(day => {
      const affectation = this.getAffectationForDate(day);
      if (affectation && !affectation.isException) {
        const key = `${affectation.userId}-${affectation.entrepriseId}`;
        if (!weekAffectations[key]) {
          weekAffectations[key] = [];
        }
        weekAffectations[key].push(affectation);
      }
    });
    
    // Retourne les semaines complètes (au moins 5 jours)
    return Object.values(weekAffectations)
      .filter(affectations => affectations.length >= 5)
      .map(affectations => ({
        userName: affectations[0].userName,
        entrepriseName: affectations[0].entrepriseName,
        couleur: affectations[0].entrepriseCouleur,
        startDate: new Date(Math.min(...affectations.map(a => a.date.getTime()))),
        endDate: new Date(Math.max(...affectations.map(a => a.date.getTime()))),
        daysCount: affectations.length
      }));
  }

  // Vérifie si un jour fait partie d'une semaine affichée en bloc
  isDayPartOfWeekBlock(date: Date): boolean {
    const affectation = this.getAffectationForDate(date);
    if (!affectation || affectation.isException) {
      return false;
    }
    
    const weekAffectations = this.getWeekAffectations();
    return weekAffectations.some(week => 
      week.userName === affectation.userName && 
      week.entrepriseName === affectation.entrepriseName &&
      date >= week.startDate && 
      date <= week.endDate
    );
  }

  onAffectClick(date: Date) {
    console.log('=== OUVERTURE MODAL AFFECTATION ===');
    console.log('Entreprises disponibles:', this.entreprises);
    console.log('Nombre d\'entreprises:', this.entreprises?.length || 0);
    this.resetAffectationForm();
    this.affectationForm.dates = [new Date(date)];
    this.affectationForm.typeAffectation = 'jour';
    this.showAffectationModal = true;
  }

  onAffectationClick(affectation: Affectation) {
    this.selectedAffectation = { ...affectation };
    this.showModificationModal = true;
  }

  /**
   * Ouvre le modal de gestion des horaires d'entreprise
   */
  openHorairesModal() {
    this.showHorairesModal = true;
  }

  /**
   * Charge les horaires d'une entreprise
   */
  loadEntrepriseHoraires(entrepriseId: number) {
    if (!entrepriseId) return;
    
    this.calendrierService.getEntrepriseSchedule(entrepriseId).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.Status === 200 && response.JsonResult.schedules) {
          // Mettre à jour le formulaire avec les horaires existants
          response.JsonResult.schedules.forEach((schedule: any) => {
            const horaireIndex = this.horaireForm.horaires.findIndex(h => h.day === schedule.Day);
            if (horaireIndex !== -1) {
              this.horaireForm.horaires[horaireIndex] = {
                day: schedule.Day,
                workTimeIn: schedule.WorkTimeIn,
                workTimeOut: schedule.WorkTimeOut,
                active: true
              };
            }
          });
          
          this.messageService.add({
            severity: 'success',
            summary: 'Horaires chargés',
            detail: 'Les horaires de l\'entreprise ont été récupérés'
          });
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des horaires:', error);
        this.messageService.add({
          severity: 'warn',
          summary: 'Attention',
          detail: 'Impossible de charger les horaires de l\'entreprise'
        });
      }
    });
  }

  /**
   * Sauvegarde les horaires d'une entreprise
   */
  saveEntrepriseHoraires() {
    if (!this.horaireForm.entrepriseId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez sélectionner une entreprise'
      });
      return;
    }

    // Vérifier l'authentification avant de continuer
    if (!this.calendrierService.isAuthenticated()) {
      this.calendrierService.debugAuthentication();
      this.messageService.add({
        severity: 'error',
        summary: 'Non autorisé',
        detail: 'Vous n\'êtes pas authentifié. Veuillez vous reconnecter.'
      });
      return;
    }
    
    // Convertir les horaires actifs au format API
    const schedules = this.horaireForm.horaires
      .filter(h => h.active)
      .map(h => ({
        Day: h.day,
        WorkTimeIn: h.workTimeIn,
        WorkTimeOut: h.workTimeOut
      }));

    console.log('Sauvegarde des horaires pour l\'entreprise:', this.horaireForm.entrepriseId, schedules);
    
    this.calendrierService.setEntrepriseSchedule(this.horaireForm.entrepriseId, schedules).subscribe({
      next: (response: ApiResponse<any>) => {
        console.log('Réponse API setEntrepriseSchedule:', response);
        
        if (response.Status === 200) {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Les horaires de l\'entreprise ont été sauvegardés'
          });
          this.showHorairesModal = false;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: response.Message || response.ErrorMessage || 'Impossible de sauvegarder les horaires'
          });
        }
      },
      error: (error: any) => {
        console.error('Erreur lors de la sauvegarde des horaires:', error);
        
        let errorMessage = 'Erreur lors de la sauvegarde des horaires';
        
        if (error.status === 401) {
          errorMessage = 'Non autorisé. Veuillez vérifier vos permissions.';
          this.calendrierService.debugAuthentication();
        } else if (error.status === 403) {
          errorMessage = 'Accès interdit. Vous n\'avez pas les droits nécessaires.';
        } else if (error.error?.Message) {
          errorMessage = error.error.Message;
        } else if (error.error?.ErrorMessage) {
          errorMessage = error.error.ErrorMessage;
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: errorMessage
        });
      }
    });
  }

  // === GESTION DU FORMULAIRE D'AFFECTATION ===

  resetAffectationForm() {
    this.affectationForm = {
      userId: null,
      entrepriseId: null,
      typeAffectation: 'jour',
      dates: [],
      heureDebut: '',
      heureFin: '',
      useDefaultHours: true,
      isException: false
    };
  }

  onTypeAffectationChange() {
    if (this.affectationForm.typeAffectation === 'semaine' && this.affectationForm.dates.length === 1) {
      // Générer toute la semaine à partir du jour sélectionné
      const startDate = this.affectationForm.dates[0];
      const dayOfWeek = startDate.getDay();
      const mondayDate = new Date(startDate);
      mondayDate.setDate(startDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      
      this.affectationForm.dates = this.calendrierService.getWeekDates(mondayDate);
    } else if (this.affectationForm.typeAffectation === 'jour' && this.affectationForm.dates.length > 1) {
      // Garder seulement le premier jour
      this.affectationForm.dates = [this.affectationForm.dates[0]];
    }
  }

  onEntrepriseChange() {
    if (this.affectationForm.useDefaultHours && this.affectationForm.entrepriseId) {
      const entreprise = this.calendrierService.getEntrepriseById(this.affectationForm.entrepriseId);
      if (entreprise) {
        this.affectationForm.heureDebut = entreprise.heureDebut;
        this.affectationForm.heureFin = entreprise.heureFin;
      }
    }
  }

  onUseDefaultHoursChange() {
    if (this.affectationForm.useDefaultHours) {
      this.onEntrepriseChange();
    } else {
      this.affectationForm.heureDebut = '';
      this.affectationForm.heureFin = '';
    }
  }

  submitAffectation() {
    if (!this.affectationForm.userId || !this.affectationForm.entrepriseId || this.affectationForm.dates.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    // Vérifier l'authentification avant de continuer
    if (!this.calendrierService.isAuthenticated()) {
      this.calendrierService.debugAuthentication();
      this.messageService.add({
        severity: 'error',
        summary: 'Non autorisé',
        detail: 'Vous n\'êtes pas authentifié. Veuillez vous reconnecter.'
      });
      return;
    }

    this.loading = true;

    // Préparer les horaires personnalisés si nécessaire
    const customHours = this.affectationForm.useDefaultHours ? undefined : {
      heureDebut: this.affectationForm.heureDebut,
      heureFin: this.affectationForm.heureFin
    };

    console.log('Création d\'affectation:', {
      userId: this.affectationForm.userId,
      entrepriseId: this.affectationForm.entrepriseId,
      dates: this.affectationForm.dates,
      customHours
    });

    // Convertir userId en nombre si c'est une chaîne
    const userId = typeof this.affectationForm.userId === 'string' ? 
      parseInt(this.affectationForm.userId, 10) : 
      this.affectationForm.userId;
    
    const entrepriseId = typeof this.affectationForm.entrepriseId === 'string' ? 
      parseInt(this.affectationForm.entrepriseId, 10) : 
      this.affectationForm.entrepriseId;

    // Utiliser la nouvelle méthode API
    this.calendrierService.createCompleteAffectation(
      userId,
      entrepriseId,
      this.affectationForm.dates,
      customHours
    ).subscribe({
      next: (response: any) => {
        console.log('Réponse API createCompleteAffectation:', response);
    
        if (response.Status === 200) {
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: `Affectation créée pour ${this.affectationForm.dates.length} jour(s)`
      });
      this.showAffectationModal = false;
      this.resetAffectationForm();
          
          // Recharger le calendrier de la semaine
          this.loadCurrentWeekCalendar();
          this.loadDailyAffectations();
    } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Attention',
            detail: response.Message || response.ErrorMessage || 'L\'affectation a été traitée avec des avertissements'
          });
        }
      },
      error: (error: any) => {
        console.error('Erreur lors de la création de l\'affectation:', error);
        
        let errorMessage = 'Impossible de créer l\'affectation';
        
        if (error.status === 401) {
          errorMessage = 'Non autorisé. Veuillez vérifier vos permissions.';
          this.calendrierService.debugAuthentication();
        } else if (error.status === 403) {
          errorMessage = 'Accès interdit. Vous n\'avez pas les droits nécessaires.';
        } else if (error.status === 400) {
          errorMessage = error.error?.Message || error.error?.ErrorMessage || 'Données invalides.';
        } else if (error.error?.Message) {
          errorMessage = error.error.Message;
        } else if (error.error?.ErrorMessage) {
          errorMessage = error.error.ErrorMessage;
        }
        
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
          detail: errorMessage
      });
      },
      complete: () => {
        this.loading = false;
    }
    });
  }

  // === GESTION DE LA MODIFICATION ===

  submitModification() {
    if (!this.selectedAffectation) return;

    const updates: Partial<Affectation> = {};
    
    // Ici on pourrait ajouter la logique de modification
    // Pour l'instant, on ferme juste la modal
    this.showModificationModal = false;
    this.selectedAffectation = null;
    
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Fonctionnalité de modification en cours de développement'
    });
  }

  deleteAffectation() {
    if (!this.selectedAffectation) return;

    const success = this.calendrierService.deleteAffectation(this.selectedAffectation.id);
    
    if (success) {
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Affectation supprimée'
      });
      this.showModificationModal = false;
      this.selectedAffectation = null;
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de supprimer l\'affectation'
      });
    }
  }

  // === UTILITAIRES ===

  getUtilisateurName(userId: number): string {
    const user = this.calendrierService.getUtilisateurById(userId);
    return user ? `${user.prenom} ${user.nom}` : 'Utilisateur inconnu';
  }

  getEntrepriseName(entrepriseId: number): string {
    const entreprise = this.calendrierService.getEntrepriseById(entrepriseId);
    return entreprise ? entreprise.nom : 'Entreprise inconnue';
  }

  // Récupère les horaires d'une affectation
  getHoraires(affectation: any) {
    const horaires = this.calendrierService.getAffectationHoraires(affectation);
    return `${horaires.debut} - ${horaires.fin}`;
  }

  // === MÉTHODES POUR GESTION DES HORAIRES ===

  /**
   * Met à jour l'heure de début pour un jour donné
   */
  updateWorkTimeIn(index: number, event: Event) {
    const target = event.target as HTMLInputElement;
    if (target && target.value) {
      this.horaireForm.horaires[index].workTimeIn = this.calendrierService.convertTimeToAPI(target.value);
    }
  }

  /**
   * Met à jour l'heure de fin pour un jour donné
   */
  updateWorkTimeOut(index: number, event: Event) {
    const target = event.target as HTMLInputElement;
    if (target && target.value) {
      this.horaireForm.horaires[index].workTimeOut = this.calendrierService.convertTimeToAPI(target.value);
    }
  }

  getDayNameInFrench(date: Date): string {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    return days[date.getDay() === 0 ? 6 : date.getDay() - 1];
  }
}
