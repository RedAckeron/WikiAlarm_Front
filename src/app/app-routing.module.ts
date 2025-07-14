import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestComponent } from './components/test/test.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { HomeComponent } from './components/home/home.component';
import { ProfilComponent } from './components/profil/profil.component';
import { AuthGuard } from './guards/auth.guard';
import { RegisterComponent } from './components/auth/register/register.component';
import { LobbyComponent } from './components/admin/lobby/lobby.component';
import { ItemComponent } from './components/admin/item/item.component';
import { StockUserComponent } from './components/admin/stock-user/stock-user.component';
import { ItemAddComponent } from './components/admin/item/item-add.component';
import { TypeMaterielComponent } from './components/admin/item/type-materiel.component';
import { TypeMaterielAddComponent } from './components/admin/item/type-materiel-add.component';
import { CalendrierComponent } from './components/calendrier/calendrier.component';
import { CalendrierComponent as AdminCalendrierComponent } from './components/admin/calendrier/calendrier.component';
import { LoginComponent } from './components/auth/login/login.component';
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
    path : 'wiki',
    loadChildren: () => import('./components/wiki/wiki.module').then(m => m.WikiModule),
    canActivate: [AuthGuard]
  },
  {
    path : 'admin', 
    children: [
      {path : '', component : LobbyComponent, canActivate: [AuthGuard]},
      {path : 'gestion-utilisateur', loadChildren: () => import('./components/admin/user/user.module').then(m => m.UserModule), canActivate: [AuthGuard]},
      {path : 'gestion-vehicule', loadChildren: () => import('./components/admin/car/car.module').then(m => m.CarModule), canActivate: [AuthGuard]},
      {path : 'gestion-entreprise', loadChildren: () => import('./components/admin/entreprise/entreprise.module').then(m => m.EntrepriseModule), canActivate: [AuthGuard]},
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
