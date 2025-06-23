import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { StockService } from '../../../../../services/stock.service';
import { finalize } from 'rxjs/operators';

interface MaterialType {
  Id: string;
  Name: string;
  Description: string;
  AddBy: string;
}

interface ItemOption {
  Id: string;
  Name: string;
  Description: string;
  IdHardwareType: string;
}

@Component({
  selector: 'app-vehicule-stock-add',
  template: `
    <div class="stock-add-container">
      <div class="header">
        <h2>Ajouter un article au stock</h2>
        <button pButton type="button" icon="pi pi-arrow-left" 
                label="Retour au stock" 
                class="p-button-secondary" 
                (click)="onBack()"></button>
      </div>

      <div *ngIf="loading" class="loading-container">
        <p-progressSpinner></p-progressSpinner>
      </div>

      <div *ngIf="!loading" class="content p-fluid">
        <div class="field">
          <label for="materialType">Type de matériel</label>
          <p-dropdown 
            id="materialType" 
            [options]="materialTypes" 
            [(ngModel)]="selectedType"
            (ngModelChange)="onTypeChange()"
            optionLabel="Name"
            [filter]="true"
            filterBy="Name"
            placeholder="Sélectionner un type de matériel"
            [showClear]="true">
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
            [options]="filteredItems" 
            [(ngModel)]="selectedItem"
            optionLabel="Name"
            [filter]="true"
            filterBy="Name"
            placeholder="Sélectionner un article"
            [showClear]="true">
            <ng-template pTemplate="item" let-item>
              <div class="item-info">
                <div class="item-name">{{item.Name}}</div>
                <div class="item-description text-muted">{{item.Description}}</div>
              </div>
            </ng-template>
          </p-dropdown>
        </div>

        <div class="field" *ngIf="selectedItem">
          <label for="quantity">Quantité</label>
          <p-inputNumber 
            id="quantity" 
            [(ngModel)]="quantity"
            [min]="1" 
            [showButtons]="true"
            buttonLayout="horizontal"
            spinnerMode="horizontal"
            [step]="1"
            decrementButtonClass="p-button-secondary"
            incrementButtonClass="p-button-secondary"
            incrementButtonIcon="pi pi-plus"
            decrementButtonIcon="pi pi-minus">
          </p-inputNumber>
        </div>

        <div class="actions">
          <button pButton type="button" 
                  label="Ajouter au stock" 
                  class="p-button-success" 
                  [disabled]="!isFormValid() || submitting"
                  (click)="onSubmit()"></button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stock-add-container {
      padding: 1rem;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .content {
      max-width: 600px;
    }
    .field {
      margin-bottom: 1.5rem;
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
    .actions {
      margin-top: 2rem;
    }
    .text-muted {
      color: #6c757d;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
    }
  `]
})
export class VehiculeStockAddComponent implements OnInit {
  public materialTypes: MaterialType[] = [];
  public selectedType: MaterialType | null = null;
  public selectedItem: ItemOption | null = null;
  public quantity: number = 1;
  public filteredItems: ItemOption[] = [];
  public vehicleId: string = '';
  public loading: boolean = false;
  public submitting: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private stockService: StockService
  ) {}

  public ngOnInit(): void {
    // Récupérer l'ID du véhicule depuis l'URL parent
    const urlSegments = this.router.url.split('/');
    const stockIndex = urlSegments.indexOf('stock');
    if (stockIndex !== -1 && urlSegments.length > stockIndex + 1) {
      this.vehicleId = urlSegments[stockIndex + 1];
    }

    this.loadMaterialTypes();
  }

  private loadMaterialTypes(): void {
    this.loading = true;
    this.stockService.getHardwareTypes()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          if (response && response.Data) {
            this.materialTypes = response.Data;
          }
        },
        error: (error) => {
          console.error('Erreur lors du chargement des types de matériel:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de charger les types de matériel'
          });
        }
      });
  }

  public onTypeChange(): void {
    this.selectedItem = null;
    this.filteredItems = [];
    
    if (this.selectedType) {
      this.loading = true;
      this.stockService.getItemsByHardwareType(this.selectedType.Id)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (response) => {
            if (response && response.Data) {
              this.filteredItems = response.Data;
            }
          },
          error: (error) => {
            console.error('Erreur lors du chargement des articles:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Impossible de charger les articles'
            });
          }
        });
    }
  }

  public isFormValid(): boolean {
    return this.selectedType !== null && 
           this.selectedItem !== null && 
           this.quantity > 0;
  }

  public onSubmit(): void {
    if (this.isFormValid() && !this.submitting) {
      this.submitting = true;
      
      // Conversion de l'ID en nombre
      const idCar = parseInt(this.vehicleId);
      const idItem = parseInt(this.selectedItem!.Id);
      
      console.log('Ajout au stock :', {
        idCar,
        idItem,
        quantity: this.quantity
      });

      this.stockService.addItemToVehicleStock(idCar, idItem, this.quantity)
        .pipe(finalize(() => this.submitting = false))
        .subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Article ajouté au stock'
            });
            this.onBack();
          },
          error: (error) => {
            console.error('Erreur lors de l\'ajout au stock:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Impossible d\'ajouter l\'article au stock'
            });
          }
        });
    }
  }

  public onBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
} 