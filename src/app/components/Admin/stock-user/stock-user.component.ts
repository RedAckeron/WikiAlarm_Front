import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';

interface StockUser {
  id?: number;
  idUser: number;
  userName: string;
  userEmail: string;
  idItem: number;
  itemMarque: string;
  itemModele: string;
  itemMetier: string;
  quantite: number;
  dateAssignation?: Date;
  status?: 'Assigné' | 'En cours' | 'Retourné';
}

export interface UserStock {
  id: number;
  name: string;
  email: string;
}

export interface ItemStock {
  id: number;
  marque: string;
  modele: string;
  metier: string;
}

@Component({
  selector: 'app-stock-user',
  templateUrl: './stock-user.component.html',
  providers: [MessageService]
})
export class StockUserComponent implements OnInit {

  @ViewChild('dt') table!: Table;
  
  stockUsers: StockUser[] = [];
  users: UserStock[] = [];
  items: ItemStock[] = [];
  showAddDialog: boolean = false;
  showAssignDialog: boolean = false;
  
  newStockUser: Partial<StockUser> = {
    quantite: 1
  };

  selectedUser: UserStock | undefined = undefined;
  selectedItem: ItemStock | undefined = undefined;

  metiers = [
    { label: '📡 Intrusion', value: 'intrusion' },
    { label: '🔥 Incendie', value: 'incendie' },
    { label: '🔐 Contrôle d\'accès', value: 'controle-acces' },
    { label: '📹 CCTV', value: 'cctv' }
  ];

  constructor(private messageService: MessageService) { }

  ngOnInit(): void {
    this.loadStockUsers();
    this.loadUsers();
    this.loadItems();
  }

  loadStockUsers() {
    // Simulation de données
    this.stockUsers = [
      {
        id: 1,
        idUser: 1,
        userName: 'Jean Dupont',
        userEmail: 'jean.dupont@example.com',
        idItem: 1,
        itemMarque: 'Bosch',
        itemModele: 'ICP-DOT1-10',
        itemMetier: 'intrusion',
        quantite: 2,
        dateAssignation: new Date(),
        status: 'Assigné'
      },
      {
        id: 2,
        idUser: 2,
        userName: 'Marie Martin',
        userEmail: 'marie.martin@example.com',
        idItem: 2,
        itemMarque: 'Siemens',
        itemModele: 'FD-18-P',
        itemMetier: 'incendie',
        quantite: 1,
        dateAssignation: new Date(),
        status: 'En cours'
      }
    ];
  }

  loadUsers() {
    this.users = [
      { id: 1, name: 'Jean Dupont', email: 'jean.dupont@example.com' },
      { id: 2, name: 'Marie Martin', email: 'marie.martin@example.com' },
      { id: 3, name: 'Pierre Durand', email: 'pierre.durand@example.com' }
    ];
  }

  loadItems() {
    this.items = [
      { id: 1, marque: 'Bosch', modele: 'ICP-DOT1-10', metier: 'intrusion' },
      { id: 2, marque: 'Siemens', modele: 'FD-18-P', metier: 'incendie' },
      { id: 3, marque: 'HID', modele: 'R90-H', metier: 'controle-acces' }
    ];
  }

  openAssignDialog() {
    this.newStockUser = { quantite: 1 };
    this.selectedItem = undefined;
    this.showAssignDialog = true;
  }

  onUserSelected() {
    // Méthode appelée quand un utilisateur est sélectionné
    // La logique de mise à jour sera automatique via les getters
  }

  resetUserSelection() {
    this.selectedUser = undefined;
  }

  getUserStockItems(): StockUser[] {
    if (!this.selectedUser) return [];
    return this.stockUsers.filter(stock => stock.idUser === this.selectedUser!.id);
  }

  getUserTotalQuantity(): number {
    return this.getUserStockItems().reduce((total, stock) => total + stock.quantite, 0);
  }

  getUserActiveItems(): number {
    return this.getUserStockItems().filter(stock => stock.status === 'Assigné').length;
  }

  assignStock() {
    if (this.selectedUser && this.selectedItem && this.newStockUser.quantite) {
      const stockUser: StockUser = {
        id: this.stockUsers.length + 1,
        idUser: this.selectedUser.id,
        userName: this.selectedUser.name,
        userEmail: this.selectedUser.email,
        idItem: this.selectedItem.id,
        itemMarque: this.selectedItem.marque,
        itemModele: this.selectedItem.modele,
        itemMetier: this.selectedItem.metier,
        quantite: this.newStockUser.quantite!,
        dateAssignation: new Date(),
        status: 'Assigné'
      };
      
      this.stockUsers.push(stockUser);
      this.showAssignDialog = false;
      
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: `Stock assigné à ${this.selectedUser.name}`,
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

  cancelAssign() {
    this.showAssignDialog = false;
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
      case 'Assigné': return 'success';
      case 'En cours': return 'warning';
      case 'Retourné': return 'info';
      default: return 'secondary';
    }
  }

  getTotalQuantity(): number {
    return this.stockUsers.reduce((total, stock) => total + stock.quantite, 0);
  }

  getUserCount(): number {
    return [...new Set(this.stockUsers.map(stock => stock.idUser))].length;
  }
}
