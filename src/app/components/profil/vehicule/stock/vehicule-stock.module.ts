import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { VehiculeStockComponent } from './vehicule-stock.component';
import { DialogModule } from 'primeng/dialog';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';

@NgModule({
  declarations: [
    // VehiculeStockComponent // SUPPRIMÉ
  ],
  imports: [
    CommonModule,
    DialogModule,
    ReactiveFormsModule,
    FormsModule,
    DropdownModule
  ],
  exports: [
    // VehiculeStockComponent // SUPPRIMÉ
  ]
})
export class VehiculeStockModule {} 