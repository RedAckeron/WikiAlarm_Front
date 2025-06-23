import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';

import { VehiculeStockComponent } from './vehicule-stock.component';
import { VehiculeStockRoutingModule } from './vehicule-stock-routing.module';
import { VehiculeStockAddComponent } from './add/vehicule-stock-add.component';
import { VehiculeStockRemoveComponent } from './remove/vehicule-stock-remove.component';

@NgModule({
  declarations: [
    VehiculeStockComponent,
    VehiculeStockAddComponent,
    VehiculeStockRemoveComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    VehiculeStockRoutingModule,
    ButtonModule,
    TableModule,
    InputNumberModule,
    InputTextModule,
    DialogModule,
    DynamicDialogModule,
    ProgressSpinnerModule,
    ToastModule,
    DropdownModule
  ],
  providers: [
    MessageService,
    DialogService
  ],
  exports: [
    VehiculeStockComponent
  ]
})
export class VehiculeStockModule { } 