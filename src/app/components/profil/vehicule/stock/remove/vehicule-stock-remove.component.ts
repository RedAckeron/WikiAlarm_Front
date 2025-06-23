import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StockService } from '../../../../../services/stock.service';
import { finalize } from 'rxjs/operators';

interface StockItem {
  id: number;
  Label: string;
  Qt: number;
}

@Component({
  selector: 'app-vehicule-stock-remove',
  template: `
    <div class="stock-remove-container">
      <div class="header">
        <h2>Retirer un article du stock</h2>
        <button pButton type="button" icon="pi pi-arrow-left" 
                label="Retour au stock" 
                class="p-button-secondary" 
                (click)="onBack()"></button>
      </div>

      <div *ngIf="loading" class="loading-container">
        <p-progressSpinner></p-progressSpinner>
      </div>

      <div *ngIf="!loading && item" class="content">
        <form [formGroup]="removeForm" (ngSubmit)="onSubmit()">
          <div class="card">
            <div class="field">
              <h3>Article à retirer</h3>
              <div class="item-info">
                <div class="item-name">{{item.Label}}</div>
                <div class="stock-qty">Quantité en stock: {{item.Qt}}</div>
              </div>
            </div>

            <div class="field">
              <label for="quantity">Quantité à retirer</label>
              <p-inputNumber 
                id="quantity" 
                formControlName="quantity"
                [min]="1"
                [max]="item.Qt"
                [showButtons]="true"
                buttonLayout="horizontal"
                spinnerMode="horizontal"
                [step]="1"
                inputStyleClass="w-full"
                decrementButtonClass="p-button-secondary"
                incrementButtonClass="p-button-secondary"
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus">
              </p-inputNumber>
              <small class="p-error block mt-1" *ngIf="removeForm.get('quantity')?.errors?.['required'] && removeForm.get('quantity')?.touched">
                La quantité est requise
              </small>
              <small class="p-error block mt-1" *ngIf="removeForm.get('quantity')?.errors?.['max'] && removeForm.get('quantity')?.touched">
                La quantité ne peut pas dépasser {{item.Qt}}
              </small>
            </div>

            <div class="field">
              <label for="client">Nom du client *</label>
              <input pInputText 
                     id="client" 
                     type="text" 
                     formControlName="client" 
                     class="w-full"
                     placeholder="Entrez le nom du client">
              <small class="p-error block mt-1" *ngIf="removeForm.get('client')?.errors?.['required'] && removeForm.get('client')?.touched">
                Le nom du client est requis
              </small>
            </div>

            <div class="field">
              <label for="notes">Notes (optionnel)</label>
              <textarea pInputTextarea 
                        id="notes" 
                        formControlName="notes" 
                        class="w-full"
                        rows="3" 
                        placeholder="Informations complémentaires"></textarea>
            </div>

            <div class="actions">
              <button pButton type="submit" 
                      label="Retirer du stock" 
                      icon="pi pi-minus-circle"
                      class="p-button-danger w-full" 
                      [loading]="submitting"
                      [disabled]="!removeForm.valid || submitting"></button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .stock-remove-container {
      padding: 1.5rem;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .header h2 {
      margin: 0;
      color: var(--surface-900);
    }
    .card {
      background: var(--surface-card);
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
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
      color: var(--surface-700);
    }
    .item-info {
      background: var(--surface-ground);
      padding: 1rem;
      border-radius: 6px;
      margin-top: 0.5rem;
    }
    .item-name {
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--surface-900);
      margin-bottom: 0.5rem;
    }
    .stock-qty {
      color: var(--surface-600);
    }
    .actions {
      margin-top: 2rem;
    }
    .w-full {
      width: 100%;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
    }
    .mt-1 {
      margin-top: 0.25rem;
    }
    .block {
      display: block;
    }
  `]
})
export class VehiculeStockRemoveComponent implements OnInit {
  public removeForm: FormGroup;
  public item: StockItem | null = null;
  public loading = false;
  public submitting = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private stockService: StockService
  ) {
    this.removeForm = this.formBuilder.group({
      quantity: ['', [Validators.required, Validators.min(1)]],
      client: ['', Validators.required],
      notes: ['']
    });
  }

  public ngOnInit(): void {
    // Récupérer les paramètres de l'URL
    const vehicleId = this.route.snapshot.paramMap.get('id');
    const itemId = this.route.snapshot.paramMap.get('itemId');

    if (!vehicleId || !itemId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Paramètres manquants dans l\'URL'
      });
      this.router.navigate(['/profil/vehicule']);
      return;
    }

    this.loadStockData(vehicleId, itemId);
  }

  private loadStockData(vehicleId: string, itemId: string): void {
    this.loading = true;
    this.stockService.getStockByCar(vehicleId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          if (response && response.Items) {
            const foundItem = response.Items.find((i: any) => i.id.toString() === itemId);
            if (foundItem) {
              this.item = {
                id: foundItem.id,
                Label: foundItem.Label,
                Qt: foundItem.Qt
              };
              // Mettre à jour les validateurs avec la quantité max
              this.removeForm.get('quantity')?.setValidators([
                Validators.required,
                Validators.min(1),
                Validators.max(this.item.Qt)
              ]);
              this.removeForm.get('quantity')?.updateValueAndValidity();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Article non trouvé dans le stock'
              });
              this.onBack();
            }
          }
        },
        error: (error) => {
          console.error('Erreur lors du chargement du stock:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de charger le stock'
          });
          this.onBack();
        }
      });
  }

  public onSubmit(): void {
    if (this.removeForm.valid && this.item) {
      const vehicleId = this.route.snapshot.paramMap.get('id');
      if (!vehicleId) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'ID du véhicule manquant'
        });
        return;
      }

      const quantity = this.removeForm.get('quantity')?.value;
      const client = this.removeForm.get('client')?.value;
      
      this.submitting = true;
      
      // Conversion des IDs en nombres
      const idCar = parseInt(vehicleId);
      
      console.log('Retrait du stock :', {
        idCar,
        idItem: this.item.id,
        quantity,
        client
      });

      this.stockService.removeItemFromVehicleStock(
        idCar,
        this.item.id,
        quantity,
        client
      )
      .pipe(finalize(() => this.submitting = false))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Article retiré du stock'
          });
          this.onBack();
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
  }

  public onBack(): void {
    const vehicleId = this.route.snapshot.paramMap.get('id');
    if (vehicleId) {
      this.router.navigate(['/profil/vehicule/stock', vehicleId]);
    } else {
      this.router.navigate(['/profil/vehicule']);
    }
  }
} 