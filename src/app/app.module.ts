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
import { LoginComponent } from './components/auth/login/login.component';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { TestComponent } from './components/test/test.component';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { PasswordModule } from 'primeng/password';
import { CommonModule, DatePipe } from '@angular/common';
import { HomeModule } from './components/home/home.module';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RegisterModule } from './components/auth/register/register.module';
import { LobbyComponent } from './components/admin/lobby/lobby.component';
import { CarModule } from './components/admin/car/car.module';
import { UserModule } from './components/admin/user/user.module';
import { ItemModule } from './components/admin/item/item.module';
import { TypeMaterielModule } from './components/admin/item/type-materiel.module';
import { VehiculeModule } from './components/profil/vehicule/vehicule.module';
import { CalendrierModule } from './components/calendrier/calendrier.module';
import { CalendrierComponent as AdminCalendrierComponent } from './components/admin/calendrier/calendrier.component';
import { ReloadService } from './services/reload.service';
import { LoginModule } from './components/auth/login/login.module';
import { StockUserModule } from './components/admin/stock-user/stock-user.module';
import { NavbarModule } from './shared/components/navbar/navbar.module';
import { TooltipModule } from 'primeng/tooltip';
import { ProfilModule } from './components/profil/profil.module';
import { WikiModule } from './components/wiki/wiki.module';

@NgModule({
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    AppComponent,
    TestComponent,
    LobbyComponent,
    AdminCalendrierComponent
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
    CheckboxModule,
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
    LoginModule,
    StockUserModule,
    NavbarModule,
    TooltipModule,
    ProfilModule,
    CalendrierModule,
    WikiModule
  ],
  providers: [MessageService, ConfirmationService, DatePipe, ReloadService],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private reloadService: ReloadService) {}
}
