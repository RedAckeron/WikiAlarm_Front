import { Component, OnInit } from '@angular/core';
import { CarService } from '../../../services/car.service';
import { StockService } from '../../../services/stock.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface CarPassEntry {
  date: string;
  kilometrage: number;
  occasion: string;
}

interface StockItem {
  Id: number;
  Name: string;
  Quantity: number;
  // Ajoutez d'autres propriétés selon votre API
}

@Component({
  selector: 'app-vehicule',
  templateUrl: './vehicule.component.html',
  styleUrls: ['./vehicule.component.scss']
})
export class VehiculeComponent implements OnInit {
  vehicules: any[] = [];
  loading = true;
  selectedVehicule: any = null;
  displayCarPassDialog = false;
  displayStockDialog = false;
  carPassForm: FormGroup;
  carPassHistory: CarPassEntry[] = [];
  loadingHistory = false;
  stockItems: StockItem[] = [];
  loadingStock = false;

  constructor(
    private carService: CarService,
    private stockService: StockService,
    private fb: FormBuilder
  ) {
    this.carPassForm = this.fb.group({
      kilometrage: ['', [Validators.required, Validators.min(0)]],
      occasion: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const idUser = sessionStorage.getItem('IdUser');
    if (idUser) {
      this.carService.getCarsByUser(idUser).subscribe({
        next: res => {
          this.vehicules = res.JsonResult || [];
          this.loading = false;
        },
        error: () => {
          this.vehicules = [];
          this.loading = false;
        }
      });
    } else {
      this.vehicules = [];
      this.loading = false;
    }
  }

  openCarPassDialog(vehicule: any): void {
    this.selectedVehicule = vehicule;
    this.carPassForm.patchValue({
      kilometrage: vehicule.Km,
      occasion: ''
    });
    this.displayCarPassDialog = true;
    this.loadCarPassHistory(vehicule.Id);
  }

  openStockDialog(vehicule: any): void {
    this.selectedVehicule = vehicule;
    this.displayStockDialog = true;
    this.loadStock(vehicule.Id);
  }

  loadStock(vehiculeId: number): void {
    this.loadingStock = true;
    this.stockService.getStockByCar(vehiculeId).subscribe({
      next: (res) => {
        this.stockItems = res.JsonResult || [];
        this.loadingStock = false;
      },
      error: (_) => {
        this.stockItems = [];
        this.loadingStock = false;
      }
    });
  }

  loadCarPassHistory(vehiculeId: number): void {
    this.loadingHistory = true;
    // TODO: Appeler le service pour charger l'historique
    // Pour l'instant, on simule des données
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

  submitCarPass(): void {
    if (this.carPassForm.valid && this.selectedVehicule) {
      // TODO: Appeler le service pour mettre à jour le kilométrage
      console.log('Mise à jour du kilométrage:', {
        vehiculeId: this.selectedVehicule.Id,
        ...this.carPassForm.value
      });
      this.displayCarPassDialog = false;
    }
  }
}
