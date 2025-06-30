import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CarService } from '../../../services/car.service';
import { StockService } from '../../../services/stock.service';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

interface Vehicle {
  Id: number;
  Marque: string;
  Immatriculation: string;
  Km: number;
}

interface CarPassEntry {
  date: string;
  kilometrage: number;
  occasion: string;
}

interface StockItem {
  Id: number;
  Name: string;
  Quantity: number;
}

@Component({
  selector: 'app-vehicule',
  templateUrl: './vehicule.component.html',
  styleUrls: ['./vehicule.component.scss']
})
export class VehiculeComponent implements OnInit, OnDestroy {
  // Données
  public vehicules: Vehicle[] = [];
  public selectedVehicule: Vehicle | null = null;
  public carPassHistory: CarPassEntry[] = [];
  public stockItems: StockItem[] = [];

  // États
  public loading = true;
  public loadingHistory = false;
  public loadingStock = false;
  public displayCarPassDialog = false;
  public displayStockDialog = false;

  // Formulaires
  public carPassForm: FormGroup = this.fb.group({
    kilometrage: ['', [Validators.required, Validators.min(0)]],
    occasion: ['', Validators.required]
  });

  // Gestion des souscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private carService: CarService,
    private stockService: StockService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadVehicules();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Chargement des données
  private loadVehicules(): void {
    const idUser = sessionStorage.getItem('userId');
    if (!idUser) {
      this.handleNoUser();
      return;
    }

    this.loading = true;
    const vehiculeSub = this.carService.getCarsByUser(idUser).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (response: any) => {
        console.log('Réponse API véhicules:', response);
        if (response && response.Status === 200) {
          // La réponse contient le tableau de véhicules dans JsonResult
          this.vehicules = (response.JsonResult || []).map((vehicle: any) => ({
            Id: vehicle.Id,
            Marque: vehicle.Marque,
            MarqueModele: vehicle.MarqueModele,
            Immatriculation: vehicle.Immatriculation,
            Km: parseInt(vehicle.Km, 10),
            IdUserOwner: vehicle.IdUserOwner,
            IsActive: vehicle.IsActive
          }));

          if (this.vehicules.length === 0) {
            this.messageService.add({
              severity: 'info',
              summary: 'Information',
              detail: 'Aucun véhicule ne vous est actuellement assigné.'
            });
          } else {
            console.log('Véhicules chargés:', this.vehicules);
          }
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: response?.Message || 'Impossible de charger les véhicules'
          });
        }
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des véhicules:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la communication avec le serveur'
        });
      }
    });
    this.subscriptions.push(vehiculeSub);
  }

  private loadCarPassHistory(vehiculeId: number): void {
    this.loadingHistory = true;
    // Simulation de données - À remplacer par un appel API réel
    setTimeout(() => {
      this.carPassHistory = [
        {
          date: '2024-03-20',
          kilometrage: 15000,
          occasion: 'Vidange annuelle'
        },
        {
          date: '2024-02-15',
          kilometrage: 14500,
          occasion: 'Contrôle technique'
        },
        {
          date: '2024-01-10',
          kilometrage: 14000,
          occasion: 'Révision périodique'
        }
      ];
      this.loadingHistory = false;
    }, 500);
  }

  private loadStockData(vehiculeId: string): void {
    this.loadingStock = true;
    const stockSub = this.stockService.getStockByCar(parseInt(vehiculeId, 10))
      .pipe(finalize(() => this.loadingStock = false))
      .subscribe({
        next: (response) => {
          if (response?.Items) {
            this.stockItems = response.Items;
          }
        },
        error: (error) => {
          console.error('Erreur lors du chargement du stock:', error);
          this.showError('Impossible de charger le stock');
          this.stockItems = [];
        }
      });
    this.subscriptions.push(stockSub);
  }

  // Gestion des dialogues
  public openCarPassDialog(vehicule: Vehicle): void {
    this.selectedVehicule = vehicule;
    this.carPassForm.patchValue({
      kilometrage: vehicule.Km,
      occasion: ''
    });
    this.displayCarPassDialog = true;
    this.loadCarPassHistory(vehicule.Id);
  }

  public openStockDialog(vehicule: Vehicle): void {
    this.selectedVehicule = vehicule;
    this.displayStockDialog = true;
    this.loadStockData(vehicule.Id.toString());
  }

  // Gestion du CarPass
  public saveCarPass(): void {
    if (this.carPassForm.valid && this.selectedVehicule) {
      const formData = this.carPassForm.value;
      
      // Simulation de la mise à jour - À remplacer par un appel API réel
      setTimeout(() => {
        // Mise à jour du kilométrage dans la liste des véhicules
        const index = this.vehicules.findIndex(v => v.Id === this.selectedVehicule?.Id);
        if (index !== -1) {
          this.vehicules[index].Km = formData.kilometrage;
        }

        // Ajout de l'entrée dans l'historique
        this.carPassHistory.unshift({
          date: new Date().toISOString(),
          kilometrage: formData.kilometrage,
          occasion: formData.occasion
        });

        this.showSuccess('CarPass mis à jour avec succès');
        this.displayCarPassDialog = false;
      }, 500);
    }
  }

  // Utilitaires
  private handleNoUser(): void {
    this.vehicules = [];
    this.loading = false;
    this.showError('Utilisateur non connecté');
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: message
    });
  }

  private showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Succès',
      detail: message
    });
  }
}
