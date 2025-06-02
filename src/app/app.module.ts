import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { LobbyComponent } from './components/Admin/lobby/lobby.component';
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
import { TestComponent } from './components/test/test.component';
import { RegisterComponent } from './components/Auth/register/register.component';
import { ProfilComponent } from './components/profil/profil.component';
import { IntrusionComponent } from './components/Wiki/intrusion/intrusion.component';
import { IncendieComponent } from './components/Wiki/incendie/incendie.component';
import { CtrlaccesComponent } from './components/Wiki/ctrlacces/ctrlacces.component';
import { CctvComponent } from './components/Wiki/cctv/cctv.component';
import { StockComponent } from './components/stock/stock.component';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { PasswordModule } from 'primeng/password';
import { CommonModule } from '@angular/common';
import { HomeModule } from './components/home/home.module';

@NgModule({
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    AppComponent,
    RegisterComponent,
    NavbarComponent,
    FooterComponent,
    LobbyComponent,
    LoginComponent,
    TestComponent,
    ProfilComponent,
    IntrusionComponent,
    IncendieComponent,
    CtrlaccesComponent,
    CctvComponent,
    StockComponent
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
    CardModule,
    PasswordModule,
    HomeModule
  ],
  providers: [MessageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
