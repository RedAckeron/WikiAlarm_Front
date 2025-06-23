import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehiculeStockComponent } from './vehicule-stock.component';
import { VehiculeStockRemoveComponent } from './remove/vehicule-stock-remove.component';
import { VehiculeStockAddComponent } from './add/vehicule-stock-add.component';

const routes: Routes = [
  {
    path: '',
    component: VehiculeStockComponent
  },
  {
    path: 'add',
    component: VehiculeStockAddComponent
  },
  {
    path: ':itemId/remove',
    component: VehiculeStockRemoveComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehiculeStockRoutingModule { } 