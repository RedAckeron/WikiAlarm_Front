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
    const idUser = sessionStorage.getItem('IdUser');
    if (!idUser) {
      this.handleNoUser();
      return;
    }

    this.loading = true;
    const vehiculeSub = this.carService.getCarsByUser(idUser).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (res) => {
        this.vehicules = res.JsonResult || [];
      },
      error: () => {
        this.vehicules = [];
        this.showError('Erreur lors du chargement des véhicules');
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
    const stockSub = this.stockService.getStockByCar(vehiculeId)
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

  // Soumission des formulaires
  public submitCarPass(): void {
    if (!this.carPassForm.valid || !this.selectedVehicule) {
      this.showError('Veuillez remplir correctement tous les champs');
      return;
    }

    const updateData = {
      vehiculeId: this.selectedVehicule.Id,
      ...this.carPassForm.value
    };

    // TODO: Implémenter l'appel API pour la mise à jour
    console.log('Mise à jour du kilométrage:', updateData);
    
    // Simuler une mise à jour réussie
    this.showSuccess('Kilométrage mis à jour avec succès');
    this.displayCarPassDialog = false;
    this.carPassForm.reset();
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
