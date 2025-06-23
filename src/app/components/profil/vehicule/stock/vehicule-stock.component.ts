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
  id: string;
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
    <div class="stock-container">
      <div class="header">
        <h2>Stock du véhicule</h2>
        <button pButton type="button" 
                icon="pi pi-plus" 
                label="Ajouter un article"
                class="p-button-success" 
                (click)="openAddDialog()"></button>
      </div>

      <div *ngIf="loading" class="loading-container">
        <p-progressSpinner></p-progressSpinner>
      </div>

      <div *ngIf="!loading" class="content">
        <p-table [value]="stockItems" [tableStyle]="{ 'min-width': '50rem' }">
          <ng-template pTemplate="header">
            <tr>
              <th>Article</th>
              <th style="width: 150px">Quantité</th>
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

      <!-- Dialog d'ajout -->
      <p-dialog 
        [(visible)]="showAddDialog" 
        [header]="'Ajouter un article'"
        [modal]="true"
        [style]="{width: '650px', minHeight: '400px'}"
        [contentStyle]="{overflow: 'visible'}"
        [baseZIndex]="10000"
        [draggable]="false"
        [resizable]="false"
        [closable]="!adding">
        <div class="p-fluid dialog-content">
          <div class="field">
            <label for="materialType">Type de matériel</label>
            <p-dropdown 
              id="materialType" 
              [options]="materialTypes" 
              [(ngModel)]="selectedType"
              (ngModelChange)="onTypeChange()"
              optionLabel="Name"
              [filter]="true"
              [filterBy]="'Name'"
              [showClear]="true"
              placeholder="Sélectionner un type de matériel"
              [disabled]="adding"
              [autoDisplayFirst]="false"
              styleClass="w-full"
              [panelStyle]="{minWidth: '100%'}"
              appendTo="body">
              <ng-template pTemplate="item" let-type>
                <div class="type-item">
                  <div class="type-label">{{type.Name}}</div>
                  <div class="type-description text-muted">{{type.Description}}</div>
                </div>
              </ng-template>
            </p-dropdown>
          </div>

          <div class="field" *ngIf="selectedType">
            <label for="article">Article</label>
            <p-dropdown 
              id="article" 
              [options]="availableItems" 
              [(ngModel)]="selectedAddItem"
              optionLabel="Name"
              [filter]="true"
              [filterBy]="'Name'"
              [showClear]="true"
              placeholder="Sélectionner un article"
              [disabled]="adding"
              [autoDisplayFirst]="false"
              styleClass="w-full"
              [panelStyle]="{minWidth: '100%'}"
              appendTo="body">
              <ng-template pTemplate="item" let-item>
                <div class="item-info">
                  <div class="item-name">{{item.Name}}</div>
                  <div class="item-description text-muted">{{item.Description}}</div>
                </div>
              </ng-template>
            </p-dropdown>
          </div>

          <div class="field" *ngIf="selectedAddItem">
            <label for="addQuantity">Quantité</label>
            <p-inputNumber 
              id="addQuantity" 
              [(ngModel)]="addQuantity"
              [min]="1" 
              [max]="999"
              [showButtons]="true"
              buttonLayout="horizontal"
              spinnerMode="horizontal"
              [step]="1"
              [disabled]="adding"
              styleClass="w-full"
              inputStyleClass="text-center">
            </p-inputNumber>
          </div>
        </div>

        <ng-template pTemplate="footer">
          <div class="dialog-footer">
            <button pButton 
                    label="Annuler" 
                    icon="pi pi-times" 
                    class="p-button-text" 
                    (click)="onCancelAdd()"
                    [disabled]="adding"></button>
            <button pButton 
                    label="Ajouter" 
                    icon="pi pi-check" 
                    class="p-button-success" 
                    (click)="onConfirmAdd()"
                    [loading]="adding"
                    [disabled]="!isAddValid()"></button>
          </div>
        </ng-template>
      </p-dialog>

      <!-- Dialog de retrait -->
      <p-dialog 
        [(visible)]="showRemoveDialog" 
        [header]="'Retirer ' + (selectedItem?.Label || '')"
        [modal]="true"
        [style]="{width: '450px'}"
        [closable]="!removing">
        <div class="p-fluid">
          <div class="field">
            <label for="quantity">Quantité à retirer</label>
            <p-inputNumber 
              [(ngModel)]="removeQuantity"
              [min]="1"
              [max]="selectedItem?.Qt || 0"
              [showButtons]="true"
              buttonLayout="horizontal"
              spinnerMode="horizontal"
              inputId="quantity"
              [step]="1"
              [disabled]="removing">
            </p-inputNumber>
          </div>

          <div class="field">
            <label for="client">Nom du client *</label>
            <input pInputText 
                   id="client" 
                   type="text" 
                   [(ngModel)]="clientName"
                   [disabled]="removing"
                   placeholder="Entrez le nom du client">
          </div>
        </div>

        <ng-template pTemplate="footer">
          <button pButton 
                  label="Annuler" 
                  icon="pi pi-times" 
                  class="p-button-text" 
                  (click)="cancelRemove()"
                  [disabled]="removing"></button>
          <button pButton 
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
  styles: [`
    .stock-container {
      padding: 1.5rem;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .header h2 {
      margin: 0;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
    }
    .text-center {
      text-align: center;
    }
    .field {
      margin-bottom: 1.5rem;
    }
    .field:last-child {
      margin-bottom: 0;
    }
    .field label {
      display: block;
      margin-bottom: 0.5rem;
    }
    .type-item, .item-info {
      padding: 0.5rem 0;
    }
    .type-label, .item-name {
      font-weight: 500;
      margin-bottom: 0.25rem;
    }
    .type-description, .item-description {
      font-size: 0.875rem;
      color: #666;
    }
    .text-muted {
      color: #6c757d;
    }
  `]
})
export class VehiculeStockComponent implements OnInit {
  public loading = false;
  public stockItems: StockItem[] = [];
  public stockHistory: any[] = [];
  public vehicleId = '';
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
    const vehicleId = this.route.snapshot.paramMap.get('id');
    if (!vehicleId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'ID du véhicule manquant'
      });
      this.router.navigate(['/profil/vehicule']);
      return;
    }
    this.vehicleId = vehicleId;
    this.loadStockData();
    this.loadHardwareTypes();
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
    if (this.selectedAddItem && this.addQuantity > 0) {
      this.adding = true;
      
      // Vérification et conversion des IDs
      const itemId = this.selectedAddItem.Id || '';
      
      if (!itemId) {
        console.error('ID de l\'item invalide:', this.selectedAddItem);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'ID de l\'item invalide'
        });
        this.adding = false;
        return;
      }

      console.log('Données avant envoi:', {
        vehicleId: this.vehicleId,
        itemId: itemId,
        quantity: this.addQuantity,
        selectedItem: this.selectedAddItem
      });

      this.stockService.addItemToStockCar(
        this.vehicleId,
        itemId,
        this.addQuantity
      ).subscribe({
        next: (response: any) => {
          console.log('Réponse API:', response);
          if (response.Status === 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Article ajouté au stock avec succès'
            });
            this.loadStockData();
            this.onCancelAdd();
          } else {
            console.error('Erreur API:', response);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: response.ErrorMessage || 'Erreur lors de l\'ajout au stock'
            });
          }
          this.adding = false;
        },
        error: (error: any) => {
          console.error('Erreur complète:', error);
          console.error('Corps de la réponse:', error.error);
          console.error('Statut HTTP:', error.status);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: error.error?.ErrorMessage || 'Erreur lors de l\'ajout au stock'
          });
          this.adding = false;
        }
      });
    } else {
      console.log('Validation échouée:', {
        selectedAddItem: this.selectedAddItem,
        addQuantity: this.addQuantity
      });
    }
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
      parseInt(this.vehicleId),
      parseInt(this.selectedItem.id),
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
          detail: 'Article retiré du stock avec succès'
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
              id: item.IdItem || item.id,
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
    if (this.selectedItem && this.isRemoveValid()) {
      this.removing = true;
      
      console.log('Retrait du stock :', {
        idCar: this.vehicleId,
        idItem: this.selectedItem.id,
        quantity: this.removeQuantity,
        remarque: this.clientName
      });

      this.stockService.removeItemFromVehicleStock(
        this.vehicleId,
        this.selectedItem.id,
        this.removeQuantity,
        this.clientName
      )
      .pipe(finalize(() => {
        this.removing = false;
        this.showRemoveDialog = false;
      }))
      .subscribe({
        next: (response) => {
          console.log('Réponse du retrait:', response);
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Article retiré du stock'
          });
          this.loadStockData();
        },
        error: (error) => {
          console.error('Erreur lors du retrait du stock:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: error.error?.Message || 'Impossible de retirer l\'article du stock'
          });
        }
      });
    }
  }

  public openAddDialog(): void {
    this.selectedType = null;
    this.selectedAddItem = null;
    this.addQuantity = 1;
    this.availableItems = [];
    this.showAddDialog = true;
  }

  public isAddValid(): boolean {
    return !!this.selectedType && 
           !!this.selectedAddItem && 
           this.addQuantity > 0;
  }
} 