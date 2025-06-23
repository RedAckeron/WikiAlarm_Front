import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { VehiculeStockAddComponent } from './vehicule-stock-add.component';

@NgModule({
  declarations: [
    VehiculeStockAddComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputNumberModule,
    DropdownModule,
    ProgressSpinnerModule,
    ToastModule
  ],
  providers: [
    MessageService
  ],
  exports: [
    VehiculeStockAddComponent
  ]
})
export class VehiculeStockAddModule { } 