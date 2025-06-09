import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';

interface StockCar {
  id?: number;
  idCar: number;
  carMarque: string;
  carModele: string;
  carImmatriculation: string;
  idItem: number;
  itemMarque: string;
  itemModele: string;
  itemMetier: string;
  quantite: number;
  dateAjout?: Date;
  status?: 'Stocké' | 'En route' | 'Utilisé';
}

export interface CarStock {
  id: number;
  marque: string;
  modele: string;
  immatriculation: string;
  km: number;
}

export interface ItemStock {
  id: number;
  marque: string;
  modele: string;
  metier: string;
}

@Component({
  selector: 'app-stock-car',
  templateUrl: './stock-car.component.html',
  styleUrls: ['./stock-car.component.scss'],
  providers: [MessageService]
})
export class StockCarComponent implements OnInit {

  @ViewChild('dt') table!: Table;
  
  stockCars: StockCar[] = [];
  cars: CarStock[] = [];
  items: ItemStock[] = [];
  showAddDialog: boolean = false;
  showStockDialog: boolean = false;
  
  newStockCar: Partial<StockCar> = {
    quantite: 1
  };

  selectedCar: CarStock | undefined = undefined;
  selectedItem: ItemStock | undefined = undefined;

  metiers = [
    { label: '📡 Intrusion', value: 'intrusion' },
    { label: '🔥 Incendie', value: 'incendie' },
    { label: '🔐 Contrôle d\'accès', value: 'controle-acces' },
    { label: '📹 CCTV', value: 'cctv' }
  ];

  constructor(private messageService: MessageService) { }

  ngOnInit(): void {
    this.loadStockCars();
    this.loadCars();
    this.loadItems();
  }

  loadStockCars() {
    // Simulation de données
    this.stockCars = [
      {
        id: 1,
        idCar: 1,
        carMarque: 'Renault',
        carModele: 'Master',
        carImmatriculation: 'AB-123-CD',
        idItem: 1,
        itemMarque: 'Bosch',
        itemModele: 'ICP-DOT1-10',
        itemMetier: 'intrusion',
        quantite: 5,
        dateAjout: new Date(),
        status: 'Stocké'
      },
      {
        id: 2,
        idCar: 2,
        carMarque: 'Mercedes',
        carModele: 'Sprinter',
        carImmatriculation: 'EF-456-GH',
        idItem: 2,
        itemMarque: 'Siemens',
        itemModele: 'FD-18-P',
        itemMetier: 'incendie',
        quantite: 3,
        dateAjout: new Date(),
        status: 'En route'
      }
    ];
  }

  loadCars() {
    this.cars = [
      { id: 1, marque: 'Renault', modele: 'Master', immatriculation: 'AB-123-CD', km: 120000 },
      { id: 2, marque: 'Mercedes', modele: 'Sprinter', immatriculation: 'EF-456-GH', km: 85000 },
      { id: 3, marque: 'Ford', modele: 'Transit', immatriculation: 'IJ-789-KL', km: 95000 }
    ];
  }

  loadItems() {
    this.items = [
      { id: 1, marque: 'Bosch', modele: 'ICP-DOT1-10', metier: 'intrusion' },
      { id: 2, marque: 'Siemens', modele: 'FD-18-P', metier: 'incendie' },
      { id: 3, marque: 'HID', modele: 'R90-H', metier: 'controle-acces' }
    ];
  }

  openStockDialog() {
    this.newStockCar = { quantite: 1 };
    this.selectedItem = undefined;
    this.showStockDialog = true;
  }

  onCarSelected() {
    // Méthode appelée quand un véhicule est sélectionné
    // La logique de mise à jour sera automatique via les getters
  }

  resetCarSelection() {
    this.selectedCar = undefined;
  }

  getCarStockItems(): StockCar[] {
    if (!this.selectedCar) return [];
    return this.stockCars.filter(stock => stock.idCar === this.selectedCar!.id);
  }

  getCarTotalQuantity(): number {
    return this.getCarStockItems().reduce((total, stock) => total + stock.quantite, 0);
  }

  getCarActiveItems(): number {
    return this.getCarStockItems().filter(stock => stock.status === 'Stocké').length;
  }

  stockItem() {
    if (this.selectedCar && this.selectedItem && this.newStockCar.quantite) {
      const stockCar: StockCar = {
        id: this.stockCars.length + 1,
        idCar: this.selectedCar.id,
        carMarque: this.selectedCar.marque,
        carModele: this.selectedCar.modele,
        carImmatriculation: this.selectedCar.immatriculation,
        idItem: this.selectedItem.id,
        itemMarque: this.selectedItem.marque,
        itemModele: this.selectedItem.modele,
        itemMetier: this.selectedItem.metier,
        quantite: this.newStockCar.quantite!,
        dateAjout: new Date(),
        status: 'Stocké'
      };
      
      this.stockCars.push(stockCar);
      this.showStockDialog = false;
      
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: `Stock ajouté dans ${this.selectedCar.marque} ${this.selectedCar.modele}`,
        life: 3000
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Veuillez remplir tous les champs obligatoires',
        life: 3000
      });
    }
  }

  cancelStock() {
    this.showStockDialog = false;
  }

  getMetierLabel(metier: string): string {
    const metierObj = this.metiers.find(m => m.value === metier);
    return metierObj ? metierObj.label : metier;
  }

  getMetierSeverity(metier: string): string {
    switch(metier) {
      case 'intrusion': return 'danger';
      case 'incendie': return 'warning';
      case 'controle-acces': return 'info';  
      case 'cctv': return 'success';
      default: return 'secondary';
    }
  }

  getStatusSeverity(status: string): string {
    switch(status) {
      case 'Stocké': return 'success';
      case 'En route': return 'warning';
      case 'Utilisé': return 'info';
      default: return 'secondary';
    }
  }

  getTotalQuantity(): number {
    return this.stockCars.reduce((total, stock) => total + stock.quantite, 0);
  }

  getCarCount(): number {
    return [...new Set(this.stockCars.map(stock => stock.idCar))].length;
  }
}
