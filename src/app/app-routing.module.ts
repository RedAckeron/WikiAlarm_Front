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
import { StockComponent } from './components/stock/stock.component';
import { AdminComponent } from './components/Admin/admin.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {path : '',component : HomeComponent},
  {path : 'home',component : HomeComponent},
  {path : 'profil',component : ProfilComponent, canActivate: [AuthGuard]},
  {path : 'stock',component : StockComponent, canActivate: [AuthGuard]},
  {
    path : 'Wiki',children:
    [
      {path : 'intrusion',component : IntrusionComponent, canActivate: [AuthGuard]},
      {path : 'incendie',component : IncendieComponent, canActivate: [AuthGuard]},
      {path : 'ctrlacces',component : CtrlaccesComponent, canActivate: [AuthGuard]},
      {path : 'cctv',component : CctvComponent, canActivate: [AuthGuard]}
    ]
  },
  {path : 'Admin',component : AdminComponent, canActivate: [AuthGuard]},
  {path : 'test',component : TestComponent},
  {path:'**',component:NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
