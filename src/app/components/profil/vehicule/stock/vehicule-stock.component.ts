import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StockService } from '../../../../services/stock.service';
import { HardwareTypeService, HardwareType } from '../../../../services/hardwaretype.service';
import { ItemService, Item } from '../../../../services/item.service';
import { finalize } from 'rxjs/operators';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

interface StockItem {
  IdItem: number;
  Label: string;
  Qt: number;
}

interface MaterialType {
  Id: number;
  Name: string;
  Description: string;
}

interface ItemOption {
  Id: string;
  Name: string;
  Description: string | null;
}

@Component({
  selector: 'app-vehicule-stock',
  template: `
    <div class="vehicle-container">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="pi pi-box text-primary"></i>
            Stock du véhicule
          </h5>
          <button pButton 
                  type="button" 
                  icon="pi pi-plus" 
                  label="Ajouter un article"
                  class="p-button-success p-button-sm"
                  (click)="openAddDialog()"></button>
        </div>
        <div class="card-body">
          <div *ngIf="loading" class="loading-state text-center p-4">
            <p-progressSpinner></p-progressSpinner>
            <p class="mt-3">Chargement du stock...</p>
          </div>
          <div *ngIf="!loading && stockItems.length === 0" class="alert alert-info text-center p-4">
            <i class="pi pi-info-circle" style="font-size: 2rem;"></i>
            <p class="mt-3">Aucun article dans le stock de ce véhicule.</p>
          </div>
          <div *ngIf="!loading && stockItems.length > 0" class="content">
            <p-table [value]="stockItems" styleClass="p-datatable-sm p-datatable-striped compact-table">
              <ng-template pTemplate="header">
                <tr>
                  <th>Article</th>
                  <th style="width: 120px">Quantité</th>
                  <th style="width: 100px">Actions</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-item>
                <tr>
                  <td>{{item.Label}}</td>
                  <td class="text-center">{{item.Qt}}</td>
                  <td>
                    <button pButton type="button"
                            icon="pi pi-minus"
                            class="p-button-danger p-button-rounded p-button-text"
                            [disabled]="item.Qt <= 0"
                            (click)="openRemoveDialog(item)"></button>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="3" class="text-center p-4">
                    Aucun article dans le stock
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        </div>
      </div>

      <!-- Pop-up d'ajout d'article -->
      <p-dialog [(visible)]="showAddDialog"
                header="Ajouter un article"
                [modal]="true"
                [style]="{width: '400px'}"
                [closable]="!adding">
        <div class="p-fluid">
          <div class="field mb-3">
            <label for="addType">Type de matériel</label>
            <p-dropdown id="addType"
                        [options]="materialTypes"
                        [(ngModel)]="selectedType"
                        optionLabel="Name"
                        placeholder="Sélectionner un type"
                        (onChange)="onTypeChange()"
                        [disabled]="adding"></p-dropdown>
          </div>
          <div class="field mb-3">
            <label for="addArticle">Article</label>
            <p-dropdown id="addArticle"
                        [options]="availableItems"
                        [(ngModel)]="selectedAddItem"
                        optionLabel="Name"
                        placeholder="Sélectionner un article"
                        [disabled]="adding || !selectedType"></p-dropdown>
          </div>
          <div class="field mb-3">
            <label for="addQuantity">Quantité</label>
            <p-inputNumber id="addQuantity"
                           [(ngModel)]="addQuantity"
                           [min]="1"
                           [showButtons]="true"
                           buttonLayout="horizontal"
                           spinnerMode="horizontal"
                           [step]="1"
                           [disabled]="adding"
                           styleClass="w-full"
                           inputStyleClass="text-center"></p-inputNumber>
          </div>
        </div>
        <ng-template pTemplate="footer">
          <button pButton type="button"
                  label="Annuler"
                  icon="pi pi-times"
                  class="p-button-text"
                  (click)="onCancelAdd()"
                  [disabled]="adding"></button>
          <button pButton type="button"
                  label="Ajouter"
                  icon="pi pi-check"
                  class="p-button-success"
                  (click)="onConfirmAdd()"
                  [loading]="adding"
                  [disabled]="!selectedAddItem || addQuantity <= 0"></button>
        </ng-template>
      </p-dialog>

      <!-- Historique du stock -->
      <div class="card mt-4">
        <div class="card-header d-flex align-items-center">
          <h6 class="mb-0"><i class="pi pi-history text-primary"></i> Historique du stock</h6>
        </div>
        <div class="card-body p-0">
          <p-table [value]="stockHistory" styleClass="p-datatable-sm p-datatable-striped compact-table">
            <ng-template pTemplate="header">
              <tr>
                <th>Date</th>
                <th>Article</th>
                <th>Quantité</th>
                <th>Type</th>
                <th>Remarque</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-histo>
              <tr>
                <td>{{histo.date}}</td>
                <td>{{histo.article}}</td>
                <td class="text-center">{{histo.quantity}}</td>
                <td>
                  <span [ngClass]="{'text-success': histo.type === 'ajout', 'text-danger': histo.type === 'retrait'}">
                    <i class="pi" [ngClass]="{'pi-plus-circle': histo.type === 'ajout', 'pi-minus-circle': histo.type === 'retrait'}"></i>
                    {{histo.type | titlecase}}
                  </span>
                </td>
                <td>{{histo.remarque}}</td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="5" class="text-center p-3">
                  Aucun historique disponible
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>

      <!-- Pop-up de retrait -->
      <p-dialog [(visible)]="showRemoveDialog" 
                [header]="'Retirer ' + (selectedItem?.Label || '')"
                [modal]="true"
                [style]="{width: '400px'}"
                [closable]="!removing">
        <div class="p-fluid">
          <div class="field mb-3">
            <label for="removeQuantity">Quantité à retirer</label>
            <p-inputNumber id="removeQuantity"
                           [(ngModel)]="removeQuantity"
                           [min]="1"
                           [max]="selectedItem?.Qt || 0"
                           [showButtons]="true"
                           buttonLayout="horizontal"
                           spinnerMode="horizontal"
                           [step]="1"
                           [disabled]="removing"
                           styleClass="w-full"
                           inputStyleClass="text-center"></p-inputNumber>
          </div>
          <div class="field mb-3">
            <label for="clientName">Nom du client *</label>
            <input pInputText id="clientName"
                   type="text"
                   [(ngModel)]="clientName"
                   [disabled]="removing"
                   placeholder="Entrez le nom du client"
                   class="w-full">
          </div>
        </div>
        <ng-template pTemplate="footer">
          <button pButton type="button"
                  label="Annuler"
                  icon="pi pi-times"
                  class="p-button-text"
                  (click)="cancelRemove()"
                  [disabled]="removing"></button>
          <button pButton type="button"
                  label="Retirer"
                  icon="pi pi-check"
                  class="p-button-danger"
                  (click)="confirmRemove()"
                  [loading]="removing"
                  [disabled]="!isRemoveValid()"></button>
        </ng-template>
      </p-dialog>
    </div>
  `,
  styleUrls: ['./vehicule-stock.component.scss']
})
export class VehiculeStockComponent implements OnInit {
  public loading = false;
  public stockItems: StockItem[] = [];
  public stockHistory: any[] = [];
  public vehicleId: number = 0;
  public displayAddDialog = false;
  public displayHistoryDialog = false;
  public displayRetraitDialog = false;
  public retraitForm: FormGroup;
  public retraitQuantities: number[] = [1, 2, 3, 4, 5, 10, 15, 20];
  
  public materialTypes: MaterialType[] = [];
  public availableItems: ItemOption[] = [];
  public selectedType: MaterialType | null = null;
  public selectedItem: StockItem | null = null;
  public addQuantity: number = 1;
  public filteredItems: Item[] = [];
  public removing = false;
  public showRemoveDialog = false;
  public removeQuantity = 1;
  public clientName = '';

  // Variables pour le dialogue d'ajout
  public adding = false;
  public showAddDialog = false;
  public selectedAddItem: ItemOption | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private stockService: StockService,
    private hardwareTypeService: HardwareTypeService,
    private itemService: ItemService,
    private dialogService: DialogService
  ) {
    this.retraitForm = this.formBuilder.group({
      quantity: ['', Validators.required],
      client: ['', Validators.required],
      notes: ['']
    });
  }

  public ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.vehicleId = parseInt(params['id'], 10);
      this.loadStockData();
      this.loadHardwareTypes();
      this.loadStockHistory();
    });
  }

  private loadHardwareTypes(): void {
    this.hardwareTypeService.listHardwareTypes()
      .subscribe({
        next: (types: HardwareType[]) => {
          this.materialTypes = types.map((type: HardwareType) => ({
            Id: type.Id,
            Name: type.Name,
            Description: type.Description || ''
          }));
        },
        error: (error) => {
          console.error('Erreur lors du chargement des types:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de charger les types de matériel'
          });
        }
      });
  }

  public onAddItem(): void {
    if (this.vehicleId) {
      this.router.navigate(['add'], { relativeTo: this.route });
    }
  }

  public onTypeChange(): void {
    this.selectedAddItem = null;
    this.availableItems = [];
    
    if (this.selectedType) {
      console.log('Type sélectionné:', this.selectedType);
      this.itemService.getItemsByHardwareType(this.selectedType.Id)
        .subscribe({
          next: (items: any[]) => {
            console.log('Items reçus:', items);
            this.availableItems = items.map(item => {
              const itemId = item.id || item.Id || '';
              console.log('ID de l\'item mappé:', itemId);
              return {
                Id: itemId,
                Name: item.name || item.Name || '',
                Description: item.description || item.Description || null
              };
            }).filter(item => item.Id !== '');
            
            if (this.availableItems.length === 0) {
              this.messageService.add({
                severity: 'info',
                summary: 'Information',
                detail: 'Aucun article disponible pour ce type de matériel'
              });
            }
            console.log('Items disponibles après mapping:', this.availableItems);
          },
          error: (error) => {
            console.error('Erreur lors du chargement des items:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Impossible de charger la liste des articles'
            });
          }
        });
    }
  }

  public onViewHistory(): void {
    this.loading = true;
    this.stockService.getHistoryByCar(this.vehicleId)
      .pipe(finalize(() => {
        this.loading = false;
        this.displayHistoryDialog = true;
      }))
      .subscribe({
        next: (response) => {
          console.log('Réponse historique:', response);
          if (response && response.JsonResult) {
            this.stockHistory = response.JsonResult;
            console.log('Historique chargé:', this.stockHistory);
          } else {
            console.log('Pas d\'historique dans la réponse:', response);
            this.stockHistory = [];
          }
        },
        error: (error) => {
          console.error('Erreur lors du chargement de l\'historique:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de charger l\'historique'
          });
        }
      });
  }

  public onConfirmAdd(): void {
    if (!this.selectedAddItem || !this.addQuantity) return;

    this.adding = true;
    this.stockService.addItemToVehicleStock(
      this.vehicleId,
      parseInt(this.selectedAddItem.Id, 10),
      this.addQuantity
    ).pipe(
      finalize(() => this.adding = false)
    ).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Article ajouté au stock'
        });
        this.showAddDialog = false;
        this.loadStockData();
        this.loadStockHistory();
        this.resetAddForm();
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible d\'ajouter l\'article au stock'
        });
      }
    });
  }

  public onConfirmRetrait(): void {
    if (!this.retraitForm.valid || !this.selectedItem) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    const formValue = this.retraitForm.value;
    this.loading = true;

    this.stockService.removeItemFromVehicleStock(
      this.vehicleId,
      this.selectedItem.IdItem,
      formValue.quantity,
      formValue.client
    )
    .pipe(finalize(() => {
      this.loading = false;
      this.displayRetraitDialog = false;
      this.retraitForm.reset();
    }))
    .subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `Article retiré du stock (Client: ${formValue.client})`
        });
        this.loadStockData();
      },
      error: (error) => {
        console.error('Erreur lors du retrait du stock:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de retirer l\'article du stock'
        });
      }
    });
  }

  public onCancelAdd(): void {
    this.showAddDialog = false;
    this.selectedType = null;
    this.selectedAddItem = null;
    this.addQuantity = 1;
  }

  public onCloseHistory(): void {
    this.displayHistoryDialog = false;
  }

  public onRetireItem(item: any): void {
    this.router.navigate([`${item.id}/remove`], {
      relativeTo: this.route,
      state: { item }
    });
  }

  private loadStockData(): void {
    this.loading = true;
    this.stockService.getStockByCar(this.vehicleId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          console.log('Réponse API stock:', response);
          if (response && response.JsonResult) {
            this.stockItems = response.JsonResult.map((item: any) => ({
              IdItem: item.IdItem,
              Label: item.ItemName,
              Qt: item.Qt
            }));
            console.log('Stock items mappés:', this.stockItems);
          } else {
            console.log('Pas de données dans la réponse:', response);
            this.stockItems = [];
          }
        },
        error: (error) => {
          console.error('Erreur lors du chargement du stock:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de charger le stock'
          });
          this.stockItems = [];
        }
      });
  }

  public openRemoveDialog(item: StockItem): void {
    this.selectedItem = item;
    this.removeQuantity = 1;
    this.clientName = '';
    this.showRemoveDialog = true;
  }

  public cancelRemove(): void {
    this.showRemoveDialog = false;
    this.selectedItem = null;
    this.removeQuantity = 1;
    this.clientName = '';
  }

  public isRemoveValid(): boolean {
    return this.removeQuantity > 0 && 
           this.removeQuantity <= (this.selectedItem?.Qt || 0) && 
           this.clientName.trim() !== '';
  }

  public confirmRemove(): void {
    if (!this.selectedItem || !this.removeQuantity || !this.clientName) return;

    this.removing = true;
    this.stockService.removeItemFromVehicleStock(
      this.vehicleId,
      this.selectedItem.IdItem,
      this.removeQuantity,
      this.clientName
    ).pipe(
      finalize(() => this.removing = false)
    ).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `Article retiré du stock (Client: ${this.clientName})`
        });
        this.showRemoveDialog = false;
        this.loadStockData();
        this.loadStockHistory();
        this.resetRemoveForm();
      },
      error: (error) => {
        console.error('Erreur lors du retrait:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de retirer l\'article du stock'
        });
      }
    });
  }

  public openAddDialog(): void {
    this.showAddDialog = true;
  }

  public isAddValid(): boolean {
    return !!this.selectedType && 
           !!this.selectedAddItem && 
           this.addQuantity > 0;
  }

  private resetAddForm(): void {
    this.selectedType = null;
    this.selectedAddItem = null;
    this.addQuantity = 1;
    this.availableItems = [];
  }

  private resetRemoveForm(): void {
    this.selectedItem = null;
    this.removeQuantity = 1;
    this.clientName = '';
  }

  private formatShortDate(dateStr: string): string {
    if (!dateStr) return '-';
    // Attend un format 'YYYY-MM-DD HH:mm:ss' ou 'YYYY-MM-DD'
    const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return dateStr;
    const [, year, month, day] = match;
    return `${day}/${month}/${year.slice(2)}`;
  }

  private loadStockHistory(): void {
    this.stockService.getHistoryByCar(this.vehicleId)
      .subscribe({
        next: (response) => {
          if (response && response.JsonResult) {
            this.stockHistory = response.JsonResult.map((histo: any) => ({
              date: this.formatShortDate(histo.Date),
              article: histo.Article || '-',
              quantity: Math.abs(Number(histo.Qt)),
              type: Number(histo.Qt) > 0 ? 'ajout' : 'retrait',
              remarque: histo.Remarque || '-'
            }));
          } else {
            this.stockHistory = [];
          }
        },
        error: () => {
          this.stockHistory = [];
        }
      });
  }
} 