import { TmplAstVariable } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { Customer } from 'src/app/models/CustomerModel';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit{

  FindCustomerForm : FormGroup;
  items!: MenuItem[];
  private _isConnected! : Boolean;

  get isConnected()
  {
    return this._isConnected;
  }


  constructor(private _builder : FormBuilder,private _router : Router,private _authService:AuthService)
  {
    //On crée un nouveau formulaire grâce à notre FormBuilder et on le stocke dans notre propriété registerForm
    this.FindCustomerForm = this._builder.group({
      FormFindCustomer : [null, [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      IdUserSelected:[]
    })
  }

  ListFindedCustomer!:Customer[];

  C1:Customer=
  {
  id:0,
  firstName:"choisir",
  lastName:"Veuillez",
  email:"",
  call1:"",
  call2:"",
  dtIn: new Date,
  addByUser:0,
  adresses:[]
  };


logout()
  {
    this._authService.logout();
      this._router.navigate(['/', 'home']);
  }

  goToHome() {
    this._router.navigate(['/home']);
  }

  ngOnInit() {
    //recuperation de observable is connected
    this._authService.IsConnected.subscribe({
      next: (value : Boolean) =>
      {
        //console.log("new value : " + value)
        this._isConnected=value;
        this.buildMenu(); // Reconstruire le menu quand la connexion change
      }});

      this.buildMenu();
  }

  private buildMenu() {
    this.items = [
      {label: 'Profil', icon: 'pi pi-user', routerLink: ['/profil']},
      {label: 'Véhicule', icon: 'pi pi-car', routerLink: ['/profil/vehicule']},
      {label: 'Stock', icon: 'pi pi-shopping-cart', routerLink: ['/stock']},
      {label: 'Calendrier', icon: 'pi pi-calendar', routerLink: ['/calendrier']},
      {
          label: 'Base de connaissance',
          icon: 'pi pi-book',
          items: [
              {label: 'Intrusion', icon: 'pi pi-shield', routerLink: ['/Wiki/intrusion']},
              {label: 'Incendie', icon: 'pi pi-exclamation-triangle', routerLink: ['/Wiki/incendie']},
              {label: 'Control Acces', icon: 'pi pi-key', routerLink: ['/Wiki/ctrlacces']},
              {label: 'Cctv', icon: 'pi pi-camera', routerLink: ['/Wiki/cctv']}
          ]
    }];

    // Ajouter le menu Admin seulement si l'utilisateur est connecté et est admin
    if (this._isConnected && this._authService.canAccessAdminPanel()) {
      this.items.push({
        label: 'Administration',
        icon: 'pi pi-cog',
        items: [
          {label: 'Tableau de bord', icon: 'pi pi-chart-bar', routerLink: ['/Admin']},
          {separator: true},
          {label: 'Gestion Utilisateur', icon: 'pi pi-user-plus', routerLink: ['/Admin/gestion-utilisateur']},
          {label: 'Gestion Véhicule', icon: 'pi pi-car', routerLink: ['/Admin/gestion-vehicule']},
          {label: 'Gestion Entreprise', icon: 'pi pi-building', routerLink: ['/Admin/gestion-entreprise']},
          {separator: true},
          {label: 'Gestion Item', icon: 'pi pi-box', routerLink: ['/Admin/gestion-item']},
          {label: 'Type de matériel', icon: 'pi pi-cog', routerLink: ['/Admin/type-materiel']},
          {label: 'Stock Véhicule', icon: 'pi pi-truck', routerLink: ['/Admin/stock-vehicule']},
          {label: 'Stock Utilisateur', icon: 'pi pi-users', routerLink: ['/Admin/stock-utilisateur']},
          {separator: true},
          {label: 'Calendrier', icon: 'pi pi-calendar', routerLink: ['/Admin/calendrier']}
        ]
      });
    }

    // Ajouter le logout en dernier
    this.items.push({label: 'Logout', icon: 'pi pi-sign-out',command:(event)=>{this.logout();} });
  }
}


//this._customerService.ReadLastCustomers("j").subscribe((data)=>this.Customers=data);
