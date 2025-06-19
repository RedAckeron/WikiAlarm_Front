import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestComponent } from './components/test/test.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { HomeComponent } from './components/home/home.component';
import { ProfilComponent } from './components/profil/profil.component';
import { IntrusionComponent } from './components/Wiki/intrusion/intrusion.component';
import { IncendieComponent } from './components/Wiki/incendie/incendie.component';
import { CtrlaccesComponent } from './components/Wiki/ctrlacces/ctrlacces.component';
import { CctvComponent } from './components/Wiki/cctv/cctv.component';
import { StockComponent } from './components/profil/stock/stock.component';
import { AuthGuard } from './guards/auth.guard';
import { RegisterComponent } from './components/Auth/register/register.component';
import { LobbyComponent } from './components/Admin/lobby/lobby.component';
import { VehiculeComponent } from './components/profil/vehicule/vehicule.component';
import { ItemComponent } from './components/Admin/item/item.component';
import { StockCarComponent } from './components/Admin/stock-car/stock-car.component';
import { StockUserComponent } from './components/Admin/stock-user/stock-user.component';
import { ItemAddComponent } from './components/Admin/item/item-add.component';
import { TypeMaterielComponent } from './components/Admin/item/type-materiel.component';
import { TypeMaterielAddComponent } from './components/Admin/item/type-materiel-add.component';
import { VehiculeStockComponent } from './components/profil/vehicule/stock/vehicule-stock.component';
import { CalendrierComponent } from './components/calendrier/calendrier.component';
import { CalendrierComponent as AdminCalendrierComponent } from './components/Admin/calendrier/calendrier.component';

const routes: Routes = [
  {path : '',component : HomeComponent},
  {path : 'home',component : HomeComponent},
  {path : 'profil',component : ProfilComponent, canActivate: [AuthGuard]},
  {path : 'profil/vehicule',component : VehiculeComponent, canActivate: [AuthGuard]},
  {path : 'profil/vehicule/stock/:id', component : VehiculeStockComponent, canActivate: [AuthGuard]},
  {path : 'stock',component : StockComponent, canActivate: [AuthGuard]},
  {path : 'register', component: RegisterComponent},
  {path : 'calendrier', component: CalendrierComponent, canActivate: [AuthGuard]},
  {
    path : 'Wiki',children:
    [
      {path : 'intrusion',component : IntrusionComponent, canActivate: [AuthGuard]},
      {path : 'incendie',component : IncendieComponent, canActivate: [AuthGuard]},
      {path : 'ctrlacces',component : CtrlaccesComponent, canActivate: [AuthGuard]},
      {path : 'cctv',component : CctvComponent, canActivate: [AuthGuard]}
    ]
  },
  {
    path : 'Admin', 
    children: [
      {path : '', component : LobbyComponent, canActivate: [AuthGuard]},
      {path : 'gestion-utilisateur', loadChildren: () => import('./components/Admin/user/user.module').then(m => m.UserModule), canActivate: [AuthGuard]},
      {path : 'gestion-vehicule', loadChildren: () => import('./components/Admin/car/car.module').then(m => m.CarModule), canActivate: [AuthGuard]},
      {path : 'gestion-item', component : ItemComponent, canActivate: [AuthGuard]},
      {path : 'gestion-item/add', component : ItemAddComponent, canActivate: [AuthGuard]},
      {path : 'stock-vehicule', component : StockCarComponent, canActivate: [AuthGuard]},
      {path : 'stock-utilisateur', component : StockUserComponent, canActivate: [AuthGuard]},
      {path : 'type-materiel', component : TypeMaterielComponent, canActivate: [AuthGuard]},
      {path : 'type-materiel/add', component : TypeMaterielAddComponent, canActivate: [AuthGuard]},
      {path : 'calendrier', component : AdminCalendrierComponent, canActivate: [AuthGuard]}
    ]
  },
  {path : 'test',component : TestComponent},
  {path:'**',component:NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
