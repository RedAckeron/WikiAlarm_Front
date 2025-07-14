import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { ItemService, Item } from '../../../services/item.service';
import { HardwareTypeService, HardwareType } from '../../../services/hardwaretype.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  providers: [MessageService]
})
export class ItemComponent implements OnInit {
  
  @ViewChild('dt') table!: Table;
  
  items: Item[] = [];
  hardwareTypes: HardwareType[] = [];
  showAddDialog: boolean = false;
  selectedHardwareType: string | null = null;
  filteredItems: Item[] = [];
  
  metiers: any[] = [
    { label: '📡 Intrusion', value: 'intrusion' },
    { label: '🔥 Incendie', value: 'incendie' },
    { label: '🔐 Contrôle d\'accès', value: 'controle-acces' },
    { label: '📹 CCTV', value: 'cctv' }
  ];
  allTypesMateriel: any[] = [
    { label: 'Caméra', value: 'camera', metier: 'cctv' },
    { label: 'Centrale', value: 'centrale', metier: 'intrusion' },
    { label: 'Badgeuse', value: 'badgeuse', metier: 'controle-acces' },
    { label: 'Détecteur', value: 'detecteur', metier: 'incendie' },
    { label: 'Sirène', value: 'sirene', metier: 'intrusion' },
    { label: 'Clavier', value: 'clavier', metier: 'intrusion' },
    { label: 'Détecteur fumée', value: 'detecteur-fumee', metier: 'incendie' },
    // Ajoute ici d'autres types si besoin
  ];
  typesMateriel: any[] = [];
  loading: boolean = true;

  newItem: any = {
    Name: '',
    Description: '',
    metier: '',
    IdHardwareType: null,
    IdWorkList: null
  };

  constructor(
    private messageService: MessageService,
    private itemService: ItemService,
    private hardwareTypeService: HardwareTypeService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadItems();
    this.loadHardwareTypes();
    this.loadMetiers();
    this.loadTypesMateriel();
  }

  loadItems() {
    this.loading = true;
    this.itemService.getItems().subscribe({
      next: (items) => {
        this.items = items;
        this.filteredItems = items;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des items:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger la liste des items'
        });
        this.loading = false;
      }
    });
  }

  loadHardwareTypes() {
    this.hardwareTypeService.listHardwareTypes().subscribe({
      next: (types: HardwareType[]) => {
        this.hardwareTypes = types;
      },
      error: (error: Error) => {
        console.error('Erreur lors du chargement des types de matériel:', error);
      }
    });
  }

  loadMetiers() {
    // À remplacer par un appel API réel
    this.metiers = [
      { label: '📡 Intrusion', value: 'intrusion' },
      { label: '🔥 Incendie', value: 'incendie' },
      { label: '🔐 Contrôle d\'accès', value: 'controle-acces' },
      { label: '📹 CCTV', value: 'cctv' }
    ];
  }

  loadTypesMateriel() {
    // À remplacer par un appel API réel
    this.typesMateriel = [
      { label: 'Caméra', value: 'camera' },
      { label: 'Centrale', value: 'centrale' },
      { label: 'Badgeuse', value: 'badgeuse' },
      { label: 'Détecteur', value: 'detecteur' }
    ];
  }

  onHardwareTypeChange(event: any) {
    if (!event.value) {
      this.filteredItems = this.items;
    } else {
      this.filteredItems = this.items.filter(item => 
        item.IdHardwareType === event.value
      );
    }
  }

  openAddDialog() {
            this.router.navigate(['/admin/gestion-item/add']);
  }

  onMetierChange() {
    this.typesMateriel = this.allTypesMateriel.filter(type => type.metier === this.newItem.metier);
    this.newItem.IdHardwareType = null;
  }

  saveItem() {
    if (this.newItem.Name) {
      // TODO: Implémenter l'appel API pour créer un item
      this.showAddDialog = false;
      
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Item ajouté avec succès'
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Veuillez remplir tous les champs obligatoires'
      });
    }
  }

  cancelAdd() {
    this.showAddDialog = false;
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
}
