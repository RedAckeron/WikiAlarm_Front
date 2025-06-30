import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// PrimeNG Modules
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';

// Components
import { CarpassComponent } from './carpass/carpass.component';
import { VehiculeComponent } from './vehicule.component';

// Services
import { CarService } from '../../../services/car.service';
import { StockService } from '../../../services/stock.service';

const routes: Routes = [
  { path: '', component: VehiculeComponent },
  { 
    path: 'stock/:id', 
    loadChildren: () => import('./stock/vehicule-stock.module').then(m => m.VehiculeStockModule)
  },
  { path: 'carpass', component: CarpassComponent }
];

@NgModule({
  declarations: [
    VehiculeComponent
  ],
  imports: [
    // Angular Modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),

    // PrimeNG Modules
    DialogModule,
    ButtonModule,
    DropdownModule,
    TableModule,
    ProgressSpinnerModule,
    ToastModule,
    InputNumberModule,
    TooltipModule,
    InputTextModule,

    // Standalone Components
    CarpassComponent
  ],
  providers: [
    MessageService,
    CarService,
    StockService
  ],
  exports: [
    VehiculeComponent
  ]
})
export class VehiculeModule {}
