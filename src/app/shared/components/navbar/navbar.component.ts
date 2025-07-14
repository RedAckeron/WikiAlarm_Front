import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Customer } from 'src/app/models/CustomerModel';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService } from 'primeng/api';
import { WorkTypeService } from 'src/app/services/worktype.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  FindCustomerForm: FormGroup;
  items!: MenuItem[];
  private _isConnected!: boolean;
  workTypes: any[] = [];

  get isConnected() {
    return this._isConnected;
  }

  constructor(
    private _builder: FormBuilder,
    private _router: Router,
    private _authService: AuthService,
    private _messageService: MessageService,
    private workTypeService: WorkTypeService
  ) {
    this.FindCustomerForm = this._builder.group({
      FormFindCustomer: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      IdUserSelected: []
    });
  }

  ListFindedCustomer!: Customer[];

  C1: Customer = {
    id: 0,
    firstName: "choisir",
    lastName: "Veuillez",
    email: "",
    call1: "",
    call2: "",
    dtIn: new Date(),
    addByUser: 0,
    adresses: []
  };

  logout() {
    this._authService.logout();
    this._router.navigate(['/', 'home']);
  }

  goToHome() {
    this._router.navigate(['/home']);
  }

  ngOnInit() {
    this._authService.IsConnected.subscribe({
      next: (value: boolean) => {
        this._isConnected = value;
        if (this._isConnected) {
          const apiKey = sessionStorage.getItem('apiKey') || '';
          this.workTypeService.getWorkTypes(apiKey).subscribe({
            next: (data) => {
              console.log('Métiers reçus de l’API :', data, 'Type:', typeof data, 'Longueur:', Array.isArray(data) ? data.length : 'non tableau');
              this.workTypes = data;
              this.buildMenu();
            },
            error: (error) => {
              console.error('Erreur lors du chargement des métiers', error);
              this.buildMenu();
            }
          });
        } else {
          this.workTypes = [];
          this.buildMenu();
        }
      }
    });
  }

  private buildMenu() {
    this.items = [
      {label: 'Profil', icon: 'pi pi-user', routerLink: ['/profil']},
      {label: 'Calendrier', icon: 'pi pi-calendar', routerLink: ['/calendrier']},
      {
        label: 'Base de connaissance',
        icon: 'pi pi-book',
        items: this.workTypes && this.workTypes.length > 0 ? this.workTypes.map(metier => ({
          label: metier.Name,
          icon: 'pi pi-briefcase',
          routerLink: ['/wiki', 'metier', metier.Id]
        })) : [
          {label: 'Aucun métier trouvé', disabled: true}
        ]
      }
    ];

    if (this._isConnected && this._authService.canAccessAdminPanel()) {
      this.items.push({
        label: 'Administration',
        icon: 'pi pi-cog',
        items: [
          {label: 'Tableau de bord', icon: 'pi pi-chart-bar', routerLink: ['/Admin']},
          {separator: true},
          {label: 'Gestion Utilisateur', icon: 'pi pi-user-plus', routerLink: ['/admin/gestion-utilisateur']},
          {label: 'Gestion Véhicule', icon: 'pi pi-car', routerLink: ['/admin/gestion-vehicule']},
          {label: 'Gestion Entreprise', icon: 'pi pi-building', routerLink: ['/admin/gestion-entreprise']},
          {separator: true},
          {label: 'Gestion Item', icon: 'pi pi-box', routerLink: ['/admin/gestion-item']},
          {label: 'Type de matériel', icon: 'pi pi-cog', routerLink: ['/admin/type-materiel']},
          {label: 'Stock Utilisateur', icon: 'pi pi-users', routerLink: ['/admin/stock-utilisateur']},
          {separator: true},
          {label: 'Calendrier', icon: 'pi pi-calendar', routerLink: ['/admin/calendrier']}
        ]
      });
    }

    this.items.push({
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.logout()
    });
  }
}

//this._customerService.ReadLastCustomers("j").subscribe((data)=>this.Customers=data);
