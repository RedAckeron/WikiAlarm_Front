import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { CarpassComponent } from './carpass/carpass.component';
import { VehiculeComponent } from './vehicule.component';
import { VehiculeStockComponent } from './stock/vehicule-stock.component';

const routes: Routes = [
  { path: '', component: VehiculeComponent },
  { path: 'stock/:id', component: VehiculeStockComponent },
  { path: 'carpass', component: CarpassComponent }
];

@NgModule({
  declarations: [
    VehiculeComponent,
    VehiculeStockComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    DialogModule,
    ButtonModule,
    DropdownModule,
    TableModule,
    CarpassComponent
  ],
  exports: [
    VehiculeComponent,
    VehiculeStockComponent
  ]
})
export class VehiculeModule {}
