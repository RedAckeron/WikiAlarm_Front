import { Component, OnInit } from '@angular/core';
import { HardwareTypeService, HardwareType } from '../../../services/hardwaretype.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-type-materiel',
  template: `
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="pi pi-cog text-primary"></i>
          Gestion des types de matériel
        </h5>
      </div>
      <div class="card-body">
        <app-type-materiel-add (add)="addType($event)"></app-type-materiel-add>
        <h6 class="mb-3">Liste des types de matériel</h6>
        <p-table [value]="hardwareTypes" [paginator]="true" [rows]="10" styleClass="p-datatable-striped">
          <ng-template pTemplate="header">
            <tr>
              <th>Nom</th>
              <th>Description</th>
              <th>Nombre d'items</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-type>
            <tr>
              <td>{{ type.Name }}</td>
              <td>{{ type.Description }}</td>
              <td>{{ type.ItemCount || 0 }}</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
      <p-toast position="bottom-right"></p-toast>
    </div>
  `,
  providers: [MessageService]
})
export class TypeMaterielComponent implements OnInit {
  hardwareTypes: HardwareType[] = [];

  constructor(private hardwareTypeService: HardwareTypeService, private messageService: MessageService, private router: Router) {}

  ngOnInit() {
    this.loadTypes();
  }

  loadTypes() {
    this.hardwareTypeService.listHardwareTypes().subscribe({
      next: types => this.hardwareTypes = types,
      error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les types de matériel' })
    });
  }

  addType(event: { name: string; description?: string }) {
    this.hardwareTypeService.createHardwareType(event.name, event.description).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: res.Message || 'Type de matériel ajouté' });
        this.loadTypes();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err.error?.ErrorMessage || 'Erreur lors de l\'ajout du type de matériel' });
      }
    });
  }
} 