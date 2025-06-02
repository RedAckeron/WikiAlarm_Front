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

const routes: Routes = [
  {path : '',component : HomeComponent},
  {path : 'home',component : HomeComponent},
  {path : 'profil',component : ProfilComponent},
  {path : 'stock',component : StockComponent},
  {
    path : 'Wiki',children:
    [
      {path : 'intrusion',component : IntrusionComponent},
      {path : 'incendie',component : IncendieComponent},
      {path : 'ctrlacces',component : CtrlaccesComponent},
      {path : 'cctv',component : CctvComponent}
    ]
  },
  {path : 'Admin',component : AdminComponent},
  {path : 'test',component : TestComponent},
  {path:'**',component:NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
