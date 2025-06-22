import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface Entreprise {
  id?: number;
  nom: string;
  couleur: string;
  horairesParJour?: { [key: number]: { debut: string; fin: string; actif: boolean } };
  description?: string;
  created_at?: string;
}

@Component({
  selector: 'app-entreprise',
  templateUrl: './entreprise.component.html',
  styleUrls: ['./entreprise.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class EntrepriseComponent implements OnInit {
  
  entrepriseForm: FormGroup;
  entreprises: Entreprise[] = [];
  loading = false;
  showForm = false;
  editMode = false;
  selectedEntreprise: Entreprise | null = null;

  // Horaires par défaut pour chaque jour
  horairesParJour: { [key: number]: { debut: string; fin: string; actif: boolean } } = {
    1: { debut: '08:00', fin: '16:30', actif: true },  // Lundi
    2: { debut: '08:00', fin: '16:30', actif: true },  // Mardi
    3: { debut: '08:00', fin: '16:30', actif: true },  // Mercredi
    4: { debut: '08:00', fin: '16:30', actif: true },  // Jeudi
    5: { debut: '08:00', fin: '16:30', actif: true },  // Vendredi
    6: { debut: '08:00', fin: '16:30', actif: false }, // Samedi
    7: { debut: '08:00', fin: '16:30', actif: false }  // Dimanche
  };

  // Options pour les jours de la semaine
  joursOptions = [
    { label: 'Lundi', value: 1 },
    { label: 'Mardi', value: 2 },
    { label: 'Mercredi', value: 3 },
    { label: 'Jeudi', value: 4 },
    { label: 'Vendredi', value: 5 },
    { label: 'Samedi', value: 6 },
    { label: 'Dimanche', value: 7 }
  ];

  // Couleurs prédéfinies
  couleursOptions = [
    { label: 'Bleu', value: '#007bff', color: '#007bff' },
    { label: 'Rouge', value: '#dc3545', color: '#dc3545' },
    { label: 'Vert', value: '#28a745', color: '#28a745' },
    { label: 'Orange', value: '#fd7e14', color: '#fd7e14' },
    { label: 'Violet', value: '#6f42c1', color: '#6f42c1' },
    { label: 'Cyan', value: '#17a2b8', color: '#17a2b8' },
    { label: 'Jaune', value: '#ffc107', color: '#ffc107' },
    { label: 'Rose', value: '#e83e8c', color: '#e83e8c' }
  ];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private http: HttpClient
  ) {
    this.entrepriseForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      couleur: ['#007bff', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadEntreprises();
  }

  loadEntreprises() {
    this.loading = true;
    const apiKey = sessionStorage.getItem('apiKey') || '';
    console.log('API Key récupérée:', apiKey);
    
    if (!apiKey) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Clé API manquante. Veuillez vous reconnecter.'
      });
      this.loading = false;
      return;
    }
    
    this.http.post<any>(`${environment.apiUrl}?route=entreprise/list`, {
      ApiKey: apiKey
    }).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.Status === 200) {
          // Nouvelle structure : les entreprises sont dans JsonResult.entreprises
          const entreprisesData = response.JsonResult?.entreprises || [];
          
          // Mapper les données vers le format attendu par le frontend
          this.entreprises = entreprisesData.map((item: any) => {
            return {
              id: item.entreprise.id,
              nom: item.entreprise.nom,
              couleur: item.entreprise.couleur,
              created_at: item.entreprise.created_at,
              description: item.entreprise.description || '',
              horairesParJour: item.horairesParJour || {}
            };
          });
          
          console.log('=== DONNÉES CHARGÉES ===');
          console.log('Nombre d\'entreprises:', this.entreprises.length);
          this.entreprises.forEach((entreprise, index) => {
            console.log(`Entreprise ${index + 1}:`, {
              id: entreprise.id,
              nom: entreprise.nom,
              couleur: entreprise.couleur,
              horairesParJour: entreprise.horairesParJour
            });
          });
          console.log('========================');
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: response.ErrorMessage || 'Erreur lors du chargement des entreprises'
          });
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur lors du chargement des entreprises:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les entreprises'
        });
      }
    });
  }

  onSubmit() {
    if (this.entrepriseForm.invalid || !this.hasAtLeastOneActiveDay()) {
      this.entrepriseForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formData = this.entrepriseForm.value;
    
    // Ajouter les horaires par jour aux données
    const dataWithHoraires = {
      ...formData,
      horairesParJour: this.horairesParJour
    };
    
    const endpoint = this.editMode ? 'entreprise/update' : 'entreprise/create';
    const apiKey = sessionStorage.getItem('apiKey') || '';
    const payload = this.editMode ? 
      { 
        ...dataWithHoraires, 
        id: this.selectedEntreprise?.id, 
        ApiKey: apiKey,
        updateAffectations: true  // Indique qu'il faut mettre à jour les affectations existantes
      } : 
      { ...dataWithHoraires, ApiKey: apiKey };

    console.log('=== DONNÉES ENVOYÉES AU BACKEND ===');
    console.log('Endpoint:', endpoint);
    console.log('Payload JSON:', JSON.stringify(payload, null, 2));
    console.log('================================');

    this.http.post<any>(`${environment.apiUrl}?route=${endpoint}`, payload).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.Status === 200) {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: response.Message || `Entreprise ${this.editMode ? 'modifiée' : 'créée'} avec succès`
          });
          this.closeForm(); // Ferme la modal et remet à zéro le formulaire
          this.loadEntreprises();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: response.ErrorMessage || 'Une erreur est survenue'
          });
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de sauvegarder l\'entreprise'
        });
      }
    });
  }

  editEntreprise(entreprise: Entreprise) {
    this.editMode = true;
    this.selectedEntreprise = entreprise;
    this.showForm = true;
    
    // Charger les horaires par jour depuis l'entreprise
    if (entreprise.horairesParJour) {
      this.horairesParJour = { ...entreprise.horairesParJour };
    } else {
      // Valeurs par défaut si pas d'horaires définis
      this.horairesParJour = {
        1: { debut: '08:00', fin: '16:30', actif: true },
        2: { debut: '08:00', fin: '16:30', actif: true },
        3: { debut: '08:00', fin: '16:30', actif: true },
        4: { debut: '08:00', fin: '16:30', actif: true },
        5: { debut: '08:00', fin: '16:30', actif: true },
        6: { debut: '08:00', fin: '16:30', actif: false },
        7: { debut: '08:00', fin: '16:30', actif: false }
      };
    }
    
    this.entrepriseForm.patchValue({
      nom: entreprise.nom,
      couleur: entreprise.couleur,
      description: entreprise.description || ''
    });
  }



  deleteEntreprise(entreprise: Entreprise) {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer l'entreprise "${entreprise.nom}" ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.loading = true;
        const apiKey = sessionStorage.getItem('apiKey') || '';
        this.http.post<any>(`${environment.apiUrl}?route=entreprise/delete`, { 
          id: entreprise.id,
          ApiKey: apiKey 
        }).subscribe({
          next: (response) => {
            this.loading = false;
            if (response.Status === 200) {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Entreprise supprimée avec succès'
              });
              this.loadEntreprises();
            }
          },
          error: (error) => {
            this.loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Impossible de supprimer l\'entreprise'
            });
          }
        });
      }
    });
  }

  resetForm() {
    this.entrepriseForm.reset({
      couleur: '#007bff'
    });
    
    // Réinitialiser les horaires par jour aux valeurs par défaut
    this.horairesParJour = {
      1: { debut: '08:00', fin: '16:30', actif: true },
      2: { debut: '08:00', fin: '16:30', actif: true },
      3: { debut: '08:00', fin: '16:30', actif: true },
      4: { debut: '08:00', fin: '16:30', actif: true },
      5: { debut: '08:00', fin: '16:30', actif: true },
      6: { debut: '08:00', fin: '16:30', actif: false },
      7: { debut: '08:00', fin: '16:30', actif: false }
    };
    
    this.editMode = false;
    this.selectedEntreprise = null;
  }

  closeForm() {
    this.showForm = false;
    this.resetForm();
  }

  getJoursText(jours: number[] | undefined): string {
    if (!jours || jours.length === 0) return 'Non défini';
    if (jours.length === 7) return '7j/7';
    if (jours.length === 5 && jours.every(j => j <= 5)) return 'Lun-Ven';
    if (jours.length === 6 && jours.every(j => j <= 6)) return 'Lun-Sam';
    
    const joursNoms = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    return jours.map(j => joursNoms[j - 1]).filter(Boolean).join(', ');
  }

  // Vérifie si un jour est sélectionné
  isJourSelected(jour: number): boolean {
    const joursActuels = this.entrepriseForm.get('joursActivite')?.value || [];
    return joursActuels.includes(jour);
  }

  // Toggle un jour d'activité
  toggleJour(jour: number) {
    const joursActuels = this.entrepriseForm.get('joursActivite')?.value || [];
    const index = joursActuels.indexOf(jour);
    
    if (index > -1) {
      // Retirer le jour
      joursActuels.splice(index, 1);
    } else {
      // Ajouter le jour
      joursActuels.push(jour);
    }
    
    // Trier les jours
    joursActuels.sort((a: number, b: number) => a - b);
    
    this.entrepriseForm.patchValue({ joursActivite: joursActuels });
  }

  // Méthodes pour gérer les horaires par jour
  isJourActif(jour: number): boolean {
    return this.horairesParJour[jour]?.actif || false;
  }

  toggleJourActif(jour: number, event: any): void {
    this.horairesParJour[jour].actif = event.target.checked;
  }

  getHeureDebut(jour: number): string {
    return this.horairesParJour[jour]?.debut || '08:00';
  }

  getHeureFin(jour: number): string {
    return this.horairesParJour[jour]?.fin || '16:30';
  }

  updateHeureDebut(jour: number, event: any): void {
    this.horairesParJour[jour].debut = event.target.value;
  }

  updateHeureFin(jour: number, event: any): void {
    this.horairesParJour[jour].fin = event.target.value;
  }

  hasAtLeastOneActiveDay(): boolean {
    return Object.values(this.horairesParJour).some(horaire => horaire.actif);
  }

  // Génère un résumé des horaires pour l'affichage dans la liste
  getHorairesResume(entreprise: Entreprise): string {
    if (!entreprise.horairesParJour || Object.keys(entreprise.horairesParJour).length === 0) {
      return '08:00 - 16:30'; // Horaires par défaut si non définis
    }

    const joursActifs = Object.entries(entreprise.horairesParJour)
      .filter(([_, horaire]) => horaire.actif)
      .map(([jour, horaire]) => ({ jour: parseInt(jour), horaire }));

    if (joursActifs.length === 0) {
      return 'Aucun jour actif';
    }

    // Si tous les jours actifs ont les mêmes horaires
    const premierHoraire = joursActifs[0].horaire;
    const tousLesMemesHoraires = joursActifs.every(
      j => j.horaire.debut === premierHoraire.debut && j.horaire.fin === premierHoraire.fin
    );

    if (tousLesMemesHoraires) {
      return `${premierHoraire.debut} - ${premierHoraire.fin}`;
    } else {
      return 'Horaires variables';
    }
  }

  // Génère le texte des jours actifs
  getJoursActifsText(entreprise: Entreprise): string {
    if (!entreprise.horairesParJour || Object.keys(entreprise.horairesParJour).length === 0) {
      return 'Lun-Ven'; // Jours par défaut si non définis
    }

    const joursActifs = Object.entries(entreprise.horairesParJour)
      .filter(([_, horaire]) => horaire.actif)
      .map(([jour, _]) => parseInt(jour))
      .sort((a, b) => a - b);

    if (joursActifs.length === 0) {
      return 'Aucun jour';
    }

    if (joursActifs.length === 7) {
      return '7j/7';
    }

    if (joursActifs.length === 5 && joursActifs.every(j => j <= 5)) {
      return 'Lun-Ven';
    }

    if (joursActifs.length === 6 && joursActifs.every(j => j <= 6)) {
      return 'Lun-Sam';
    }

    const joursNoms = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    return joursActifs.map(j => joursNoms[j - 1]).join(', ');
  }

  // Génère le planning détaillé avec horaires par jour
  getPlanningDetaille(entreprise: Entreprise): string {
    if (!entreprise.horairesParJour || Object.keys(entreprise.horairesParJour).length === 0) {
      return 'Lun-Ven: 08:00-16:30'; // Planning par défaut
    }

    const joursNoms = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const planningParJour: string[] = [];

    // Grouper les jours ayant les mêmes horaires
    const groupesHoraires: { [key: string]: number[] } = {};

    Object.entries(entreprise.horairesParJour)
      .filter(([_, horaire]) => horaire.actif)
      .forEach(([jour, horaire]) => {
        const horaireKey = `${horaire.debut}-${horaire.fin}`;
        if (!groupesHoraires[horaireKey]) {
          groupesHoraires[horaireKey] = [];
        }
        groupesHoraires[horaireKey].push(parseInt(jour));
      });

    // Créer le texte pour chaque groupe d'horaires
    Object.entries(groupesHoraires).forEach(([horaire, jours]) => {
      jours.sort((a, b) => a - b);
      
      // Regrouper les jours consécutifs
      const groupesConsecutifs: number[][] = [];
      let groupeActuel: number[] = [jours[0]];
      
      for (let i = 1; i < jours.length; i++) {
        if (jours[i] === jours[i-1] + 1) {
          groupeActuel.push(jours[i]);
        } else {
          groupesConsecutifs.push(groupeActuel);
          groupeActuel = [jours[i]];
        }
      }
      groupesConsecutifs.push(groupeActuel);

      // Formatter chaque groupe
      const joursTexte = groupesConsecutifs.map(groupe => {
        if (groupe.length === 1) {
          return joursNoms[groupe[0] - 1];
        } else if (groupe.length === 2) {
          return `${joursNoms[groupe[0] - 1]}-${joursNoms[groupe[1] - 1]}`;
        } else {
          return `${joursNoms[groupe[0] - 1]}-${joursNoms[groupe[groupe.length - 1] - 1]}`;
        }
      }).join(', ');

      planningParJour.push(`${joursTexte}: ${horaire}`);
    });

    return planningParJour.join(' | ');
  }

  // Génère la liste des jours avec leurs horaires pour l'affichage détaillé
  getJoursAvecHoraires(entreprise: Entreprise): { nom: string, horaire: string }[] {
    if (!entreprise.horairesParJour || Object.keys(entreprise.horairesParJour).length === 0) {
      // Horaires par défaut si non définis
      return [
        { nom: 'Lundi', horaire: '08:00 - 16:30' },
        { nom: 'Mardi', horaire: '08:00 - 16:30' },
        { nom: 'Mercredi', horaire: '08:00 - 16:30' },
        { nom: 'Jeudi', horaire: '08:00 - 16:30' },
        { nom: 'Vendredi', horaire: '08:00 - 16:30' }
      ];
    }

    const joursNoms = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const joursAvecHoraires: { nom: string, horaire: string }[] = [];

    Object.entries(entreprise.horairesParJour)
      .filter(([_, horaire]) => horaire.actif)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([jour, horaire]) => {
        const jourIndex = parseInt(jour) - 1;
        joursAvecHoraires.push({
          nom: joursNoms[jourIndex],
          horaire: `${horaire.debut} - ${horaire.fin}`
        });
      });

    return joursAvecHoraires;
  }
} 