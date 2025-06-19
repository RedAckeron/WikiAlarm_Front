import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StockService } from '../../../../services/stock.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HardwareTypeService, HardwareType } from '../../../../services/hardwaretype.service';
import { ItemService, Item } from '../../../../services/item.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-vehicule-stock',
  template: `
    <div class="card mb-3">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Stock du véhicule</h5>
        <button class="btn btn-success btn-sm" (click)="displayAddDialog = true">
          <i class="pi pi-plus"></i> Ajouter un item
        </button>
      </div>
      <div class="card-body">
        <ng-container *ngIf="loading; else stockContent">
          <div class="text-center">
            <i class="pi pi-spin pi-spinner" style="font-size: 2rem;"></i>
            <span>Chargement du stock...</span>
          </div>
        </ng-container>
        <ng-template #stockContent>
          <div *ngIf="stockItems.length === 0" class="alert alert-info text-center">
            <i class="pi pi-info-circle"></i>
            {{ stockMessage }}
          </div>
          <div *ngIf="stockItems.length > 0" class="table-responsive">
            <table class="table table-striped table-hover mb-0">
              <thead>
                <tr>
                  <th>Article</th>
                  <th class="text-end">Quantité</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of stock">
                  <td>{{ item.ItemName }}</td>
                  <td>{{ item.Qt }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ng-template>
      </div>
    </div>

    <!-- Section mouvements de stock -->
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h6 class="mb-0">Derniers mouvements de stock</h6>
        <button class="btn btn-outline-info btn-sm" (click)="displayHistoryDialog = true">
          <i class="pi pi-history"></i> Voir tout l'historique
        </button>
      </div>
      <div class="card-body p-0">
        <div *ngIf="loadingHistory" class="text-center p-3">
          <i class="pi pi-spin pi-spinner" style="font-size: 1.2rem;"></i>
          <span class="ms-2">Chargement de l'historique...</span>
        </div>
        <div *ngIf="!loadingHistory && stockHistory.length === 0" class="text-center p-3">
          <i class="pi pi-info-circle"></i>
          <span class="ms-2">Aucun mouvement récent</span>
        </div>
        <div *ngIf="!loadingHistory && stockHistory.length > 0" class="list-group list-group-flush">
          <div *ngFor="let entry of stockHistory.slice(0, 5)" class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted">{{ entry.date | date:'dd/MM/yyyy HH:mm' }}</small>
              <span [ngClass]="{'text-success': entry.type === 'ajouté', 'text-danger': entry.type === 'retiré'}">
                {{ entry.type === 'ajouté' ? '+' : '-' }}{{ entry.quantity }}
              </span>
            </div>
            <div class="fw-bold">{{ entry.item }}</div>
            <div class="small">{{ entry.commentaire }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Popup ajout d'item -->
    <p-dialog [(visible)]="displayAddDialog" [style]="{width: '400px'}" header="Ajouter un item au stock" [modal]="true" [draggable]="false" [resizable]="false">
      <form [formGroup]="addForm" (ngSubmit)="submitAddItem()">
        <div class="mb-3">
          <label for="hardwareType" class="form-label">Type de matériel</label>
          <select class="form-select" id="hardwareType" formControlName="hardwareType" (change)="onHardwareTypeChange($event)">
            <option value="">Sélectionnez un type</option>
            <option *ngFor="let type of hardwareTypes" [value]="type.Id">{{ type.Name }}</option>
          </select>
        </div>
        <div class="mb-3" *ngIf="addForm.value.hardwareType">
          <label for="itemSearch" class="form-label">Rechercher un article</label>
          <input type="text" class="form-control mb-2" id="itemSearch" [(ngModel)]="itemSearch" (ngModelChange)="onItemSearchChange()" [ngModelOptions]="{standalone: true}" name="itemSearch" placeholder="Tapez pour filtrer...">
          <label for="item" class="form-label">Article</label>
          <p-dropdown
            [options]="filteredItems"
            [(ngModel)]="selectedItem"
            [ngModelOptions]="{standalone: true}"
            optionLabel="Name"
            placeholder="Sélectionnez un article"
            [showClear]="true"
            class="mt-2">
            <ng-template let-item pTemplate="item">
              <div>{{ item.Name }}</div>
            </ng-template>
          </p-dropdown>
        </div>
        <div class="mb-3" *ngIf="addForm.value.hardwareType && selectedItem">
          <label for="quantity" class="form-label">Quantité</label>
          <select class="form-select" id="quantity" formControlName="quantity">
            <option *ngFor="let q of quantityOptions" [value]="q">{{ q }}</option>
          </select>
        </div>
        <div class="text-end">
          <button type="button" class="btn btn-secondary me-2" (click)="displayAddDialog = false">Annuler</button>
          <button type="submit" class="btn btn-success" [disabled]="addForm.invalid">Ajouter</button>
        </div>
      </form>
    </p-dialog>

    <!-- Popup historique complet -->
    <p-dialog [(visible)]="displayHistoryDialog" [style]="{width: '500px'}" header="Historique complet du stock" [modal]="true" [draggable]="false" [resizable]="false">
      <div *ngIf="loadingHistory" class="text-center p-3">
        <i class="pi pi-spin pi-spinner" style="font-size: 1.2rem;"></i>
        <span class="ms-2">Chargement de l'historique...</span>
      </div>
      <div *ngIf="!loadingHistory && stockHistory.length === 0" class="text-center p-3">
        <i class="pi pi-info-circle"></i>
        <span class="ms-2">Aucun mouvement enregistré</span>
      </div>
      <div *ngIf="!loadingHistory && stockHistory.length > 0" class="list-group list-group-flush">
        <div *ngFor="let entry of stockHistory" class="list-group-item">
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">{{ entry.date | date:'dd/MM/yyyy HH:mm' }}</small>
            <span [ngClass]="{'text-success': entry.type === 'ajouté', 'text-danger': entry.type === 'retiré'}">
              {{ entry.type === 'ajouté' ? '+' : '-' }}{{ entry.quantity }}
            </span>
          </div>
          <div class="fw-bold">{{ entry.item }}</div>
          <div class="small">{{ entry.commentaire }}</div>
        </div>
      </div>
    </p-dialog>

    <!-- Popup retrait -->
    <p-dialog [(visible)]="displayRetraitDialog" [style]="{width: '400px'}" header="Retirer du stock" [modal]="true" [draggable]="false" [resizable]="false">
      <form [formGroup]="retraitForm" (ngSubmit)="submitRetrait()">
        <div class="mb-3">
          <label for="quantity" class="form-label">Quantité</label>
          <select class="form-select" id="quantity" formControlName="quantity">
            <option *ngFor="let q of retraitQuantities" [value]="q">{{ q }}</option>
          </select>
        </div>
        <div class="mb-3">
          <label for="client" class="form-label">Client</label>
          <input type="text" class="form-control" id="client" formControlName="client" placeholder="Nom du client">
        </div>
        <div class="text-end">
          <button type="button" class="btn btn-secondary me-2" (click)="displayRetraitDialog = false">Annuler</button>
          <button type="submit" class="btn btn-success" [disabled]="retraitForm.invalid">Retirer</button>
        </div>
      </form>
    </p-dialog>
  `
})
export class VehiculeStockComponent implements OnInit {
  vehiculeId: number = 0;
  stockItems: any[] = [];
  loading: boolean = false;
  stockMessage = '';

  displayAddDialog = false;
  addForm: FormGroup;

  displayHistoryDialog = false;
  stockHistory: any[] = [];
  loadingHistory = false;

  hardwareTypes: HardwareType[] = [];
  items: Item[] = [];
  filteredItems: Item[] = [];
  selectedHardwareType: number | null = null;
  selectedItem: Item | null = null;
  itemSearch = '';

  quantityOptions: number[] = Array.from({length: 100}, (_, i) => i + 1);

  stock: any[] = [];
  loadingStock = false;

  displayRetraitDialog = false;
  selectedStockItem: any = null;
  retraitQuantities: number[] = [];
  retraitForm: FormGroup;

  isLoadingHistorique: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private stockService: StockService,
    private hardwareTypeService: HardwareTypeService,
    private itemService: ItemService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.addForm = this.fb.group({
      hardwareType: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
    this.retraitForm = this.fb.group({
      quantity: [1, [Validators.required, Validators.min(1)]],
      client: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.loadItems();
    setTimeout(() => this.loadStock(this.vehiculeId), 200);
    this.loadStockHistory();
    this.isLoadingHistorique = true;
  }

  initForm() {
    this.vehiculeId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.vehiculeId) {
      this.loading = true;
      this.stockService.getStockByCar(this.vehiculeId).subscribe({
        next: (res) => {
          this.stockItems = res.JsonResult || [];
          this.loading = false;
          this.stockMessage = this.stockItems.length === 0 ? (res.Message || 'Aucun stock disponible pour ce véhicule.') : '';
        },
        error: (_) => {
          this.stockItems = [];
          this.loading = false;
          this.stockMessage = 'Erreur lors du chargement du stock.';
        }
      });
    } else {
      this.stockItems = [];
      this.loading = false;
      this.stockMessage = 'Aucun véhicule sélectionné.';
    }
    this.loadHardwareTypes();
  }

  loadStockHistory(): void {
    this.isLoadingHistorique = true;
    this.stockService.getHistoryByCar(this.vehiculeId).subscribe({
      next: (res: any) => {
        this.stockHistory = (res.JsonResult || []).map((entry: any) => {
          const q = Number(entry.Qtt ?? entry.Qt);
          return {
            date: new Date(Number(entry.DtIn) * 1000),
            item: this.getItemNameById(entry.IdItem),
            quantity: Math.abs(q),
            type: q > 0 ? 'ajouté' : 'retiré',
            commentaire: entry.Remarque || ''
          };
        });
        this.isLoadingHistorique = false;
      },
      error: (_: any) => {
        this.stockHistory = [];
        this.isLoadingHistorique = false;
      }
    });
  }

  getItemNameById(idItem: string): string {
    const item = this.items.find(i => i.id === idItem);
    return item ? item.Name : 'Article inconnu';
  }

  loadHardwareTypes() {
    this.hardwareTypeService.listHardwareTypes().subscribe(types => {
      this.hardwareTypes = types;
      console.log('Types hardware chargés :', types);
    });
  }

  loadItems() {
    this.itemService.getItems().subscribe(items => {
      this.items = items;
      this.filterItems();
    });
  }

  onHardwareTypeChange(event: any) {
    const typeId = Number(event.target.value);
    console.log('Type sélectionné :', typeId);
    if (typeId) {
      this.addForm.patchValue({ hardwareType: typeId });
      this.itemService.getItemsByHardwareType(typeId).subscribe(items => {
        console.log('Réponse items pour type', typeId, ':', items);
        this.items = Array.isArray(items) ? items : [];
        this.filterItems();
      });
    } else {
      this.items = [];
      this.filteredItems = [];
      this.selectedItem = null;
    }
  }

  filterItems() {
    const search = this.itemSearch.toLowerCase();
    this.filteredItems = (this.items || []).filter(item =>
      !search || item.Name.toLowerCase().includes(search)
    );
  }

  onItemSearchChange() {
    this.filterItems();
  }

  submitAddItem(): void {
    if (this.selectedItem && this.addForm.valid) {
      const formValue = this.addForm.value;
      this.stockService.addItemToStockCar(
        this.vehiculeId,
        Number(this.selectedItem.id),
        formValue.quantity
      ).subscribe({
        next: (response) => {
          if (response.Status === 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Item ajouté au stock avec succès'
            });
            this.displayAddDialog = false;
            this.addForm.reset({
              hardwareType: '',
              quantity: 1
            });
            this.selectedItem = null;
            this.itemSearch = '';
            this.filteredItems = [];
            this.loadStock(this.vehiculeId);
            this.loadStockHistory();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: response.Message || 'Erreur lors de l\'ajout de l\'item'
            });
          }
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout de l\'item:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Une erreur est survenue lors de l\'ajout de l\'item'
          });
        }
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez sélectionner un type de matériel et un item'
      });
    }
  }

  loadStock(carId: number): void {
    this.loadingStock = true;
    this.stockService.getStockByCar(carId).subscribe({
      next: (res) => {
        this.stock = res.JsonResult || [];
        console.log('Stock du véhicule récupéré :', this.stock);
        this.loadingStock = false;
      },
      error: (_) => {
        this.stock = [];
        this.loadingStock = false;
      }
    });
  }

  openRetraitDialog(item: any) {
    this.selectedStockItem = item;
    const max = Number(item.Qt) || 1;
    this.retraitQuantities = Array.from({length: max}, (_, i) => i + 1);
    this.retraitForm.reset({ quantity: 1, client: '' });
    this.displayRetraitDialog = true;
  }

  submitRetrait() {
    if (this.retraitForm.valid && this.selectedStockItem) {
      const { quantity, client } = this.retraitForm.value;
      this.stockService.removeItemFromStockCar(
        this.selectedStockItem.IdCar,
        this.selectedStockItem.IdItem,
        quantity,
        client,
        '' // remarque optionnelle
      ).subscribe({
        next: (res) => {
          this.displayRetraitDialog = false;
          this.loadStock(this.vehiculeId);
          this.loadStockHistory();
        },
        error: (err) => {
          // Gérer l'erreur si besoin
          this.displayRetraitDialog = false;
        }
      });
    }
  }
} 