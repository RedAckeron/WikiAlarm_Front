import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { HttpClientModule } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastModule } from 'primeng/toast';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { AccordionModule} from 'primeng/accordion';
import { MenubarModule} from 'primeng/menubar';
import { LoginComponent } from './components/Auth/login/login.component';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { TestComponent } from './components/test/test.component';
import { ProfilComponent } from './components/profil/profil.component';
import { IntrusionComponent } from './components/Wiki/intrusion/intrusion.component';
import { IncendieComponent } from './components/Wiki/incendie/incendie.component';
import { CtrlaccesComponent } from './components/Wiki/ctrlacces/ctrlacces.component';
import { CctvComponent } from './components/Wiki/cctv/cctv.component';
import { StockComponent } from './components/profil/stock/stock.component';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { PasswordModule } from 'primeng/password';
import { CommonModule } from '@angular/common';
import { HomeModule } from './components/home/home.module';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RegisterModule } from './components/Auth/register/register.module';
import { LobbyComponent } from './components/Admin/lobby/lobby.component';
import { VehiculeComponent } from './components/profil/vehicule/vehicule.component';
import { CarModule } from './components/Admin/car/car.module';
import { UserModule } from './components/Admin/user/user.module';
import { ItemComponent } from './components/Admin/item/item.component';
import { StockUserComponent } from './components/Admin/stock-user/stock-user.component';
import { StockCarComponent } from './components/Admin/stock-car/stock-car.component';
import { ItemModule } from './components/Admin/item/item.module';
import { TypeMaterielModule } from './components/Admin/item/type-materiel.module';
import { VehiculeModule } from './components/profil/vehicule/vehicule.module';
import { CalendrierComponent } from './components/calendrier/calendrier.component';

@NgModule({
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    LoginComponent,
    TestComponent,
    ProfilComponent,
    StockComponent,
    LobbyComponent,
    ItemComponent,
    StockUserComponent,
    StockCarComponent,
    CalendrierComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    CommonModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    ButtonModule,
    NgbModule,
    ToastModule,
    SplitButtonModule,
    TabViewModule,
    TagModule,
    AccordionModule,
    MenubarModule,
    InputTextModule,
    DialogModule,
    TableModule,
    DropdownModule,
    InputNumberModule,
    CardModule,
    PasswordModule,
    HomeModule,
    ConfirmDialogModule,
    RegisterModule,
    CarModule,
    UserModule,
    ItemModule,
    TypeMaterielModule,
    VehiculeModule,
    IntrusionComponent,
    IncendieComponent,
    CtrlaccesComponent,
    CctvComponent
  ],
  providers: [MessageService, ConfirmationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
