import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestComponent } from './components/test/test.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { HomeComponent } from './components/home/home.component';
import { ProfilComponent } from './components/profil/profil.component';
import { AuthGuard } from './guards/auth.guard';
import { RegisterComponent } from './components/Auth/register/register.component';
import { LobbyComponent } from './components/Admin/lobby/lobby.component';
import { ItemComponent } from './components/Admin/item/item.component';
import { StockUserComponent } from './components/Admin/stock-user/stock-user.component';
import { ItemAddComponent } from './components/Admin/item/item-add.component';
import { TypeMaterielComponent } from './components/Admin/item/type-materiel.component';
import { TypeMaterielAddComponent } from './components/Admin/item/type-materiel-add.component';
import { CalendrierComponent } from './components/calendrier/calendrier.component';
import { CalendrierComponent as AdminCalendrierComponent } from './components/Admin/calendrier/calendrier.component';
import { LoginComponent } from './components/Auth/login/login.component';
import { WorkComponent } from './components/Wiki/work/work.component';
import { StockComponent } from './components/profil/stock/stock.component';

const routes: Routes = [
  {path : '', redirectTo: 'home', pathMatch: 'full'},
  {path : 'home', component : HomeComponent},
  {path : 'login', component : LoginComponent},
  {path : 'register', component : RegisterComponent},
  {
    path : 'profil',
    component : ProfilComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'vehicule',
        loadChildren: () => import('./components/profil/vehicule/vehicule.module').then(m => m.VehiculeModule)
      },
      {
        path: 'stock',
        component: StockComponent
      }
    ]
  },
  {path : 'calendrier', component : CalendrierComponent, canActivate: [AuthGuard]},
  {
    path : 'Wiki',
    children: [
      { path: ':metier', component: WorkComponent, canActivate: [AuthGuard] }
    ]
  },
  {
    path : 'Admin', 
    children: [
      {path : '', component : LobbyComponent, canActivate: [AuthGuard]},
      {path : 'gestion-utilisateur', loadChildren: () => import('./components/Admin/user/user.module').then(m => m.UserModule), canActivate: [AuthGuard]},
      {path : 'gestion-vehicule', loadChildren: () => import('./components/Admin/car/car.module').then(m => m.CarModule), canActivate: [AuthGuard]},
      {path : 'gestion-entreprise', loadChildren: () => import('./components/Admin/entreprise/entreprise.module').then(m => m.EntrepriseModule), canActivate: [AuthGuard]},
      {path : 'gestion-item', component : ItemComponent, canActivate: [AuthGuard]},
      {path : 'gestion-item/add', component : ItemAddComponent, canActivate: [AuthGuard]},
      {path : 'stock-utilisateur', component : StockUserComponent, canActivate: [AuthGuard]},
      {path : 'type-materiel', component : TypeMaterielComponent, canActivate: [AuthGuard]},
      {path : 'type-materiel/add', component : TypeMaterielAddComponent, canActivate: [AuthGuard]},
      {path : 'calendrier', component : AdminCalendrierComponent, canActivate: [AuthGuard]}
    ]
  },
  {path : 'test', component : TestComponent},
  {path : '**', component : NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
