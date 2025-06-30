import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CarService } from '../../../services/car.service';
import { UserService } from '../../../services/user.service';
import { TokenService } from 'src/app/services/token.service';
import { UserNotificationService } from 'src/app/services/user-notification.service';
import { Subscription } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { Router } from '@angular/router';

interface Car {
  Id?: number;
  Marque: string;
  Modele: string;
  Km: number;
  Immatriculation: string;
  IdUserOwner?: number;
  NameUserOwner?: string;
}

interface User {
  id: number | null;
  name: string;
  email: string;
}

@Component({
  selector: 'app-car',
  templateUrl: './car.component.html',
  styleUrls: ['./car.component.scss']
})
export class CarComponent implements OnInit, OnDestroy {
  cars: Car[] = [];
  users: any[] = [];
  selectedUser: any = null;
  selectedCar: Car | null = null;
  showDialog: boolean = false;
  showAssignDialog: boolean = false;
  editMode: boolean = false;
  carForm: FormGroup;
  currentCar: Car | null = null;
  selectedCarForAssign: Car | null = null;
  newOwnerId: number | null = null;
  private subscriptions: Subscription[] = [];
  isAdmin: boolean = false;
  loading: boolean = false;

  constructor(
    private carService: CarService,
    private userService: UserService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private tokenService: TokenService,
    private userNotificationService: UserNotificationService,
    private dialogService: DialogService,
    private router: Router
  ) {
    this.carForm = this.fb.group({
      brand: ['', Validators.required],
      model: ['', Validators.required],
      mileage: [0],
      licensePlate: ['', Validators.required],
      userOwnerId: [null]
    });
  }

  ngOnInit(): void {
    this.isAdmin = sessionStorage.getItem('userRole') === 'Admin';
    this.loadCars();
    this.loadUsers();
  }

  ngOnDestroy(): void {
    // Désabonnement pour éviter les fuites mémoire
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadCars(): void {
    this.loading = true;
    console.log('Début du chargement des véhicules...');
    const sub = this.carService.getCars().subscribe({
      next: (response) => {
        if (response && response.Status === 200) {
          if (Array.isArray(response.JsonResult)) {
            this.cars = response.JsonResult.map((car: any) => ({
              Id: car.Id,
              Marque: car.Marque,
              Modele: car.Modele,
              Km: car.Km,
              Immatriculation: car.Immatriculation,
              IdUserOwner: car.IdUserOwner,
              NameUserOwner: car.NameUserOwner || 'Non assigné'
            }));
          } else {
            console.error('JsonResult n\'est pas un tableau:', response.JsonResult);
            this.cars = [];
          }
        } else {
          console.error('Erreur de chargement:', response);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: response?.Message || 'Impossible de charger les véhicules'
          });
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des véhicules:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error?.error?.Message || 'Erreur lors du chargement des véhicules'
        });
      },
      complete: () => {
        this.loading = false;
      }
    });
    this.subscriptions.push(sub);
  }

  loadUsers(): void {
    this.loading = true;
    const sub = this.userService.getUsers().subscribe({
      next: (response) => {
        if (response && response.Status === 200 && response.JsonResult) {
          this.users = response.JsonResult.map((user: any) => ({
            Id: user.Id,
            Name: user.NameUserOwner || `${user.FirstName} ${user.Name}`.trim()
          }));
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de charger la liste des utilisateurs'
          });
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des utilisateurs'
        });
      },
      complete: () => {
        this.loading = false;
      }
    });
    this.subscriptions.push(sub);
  }

  showAddCarDialog(): void {
    this.editMode = false;
    this.currentCar = null;
    this.carForm.reset();
    this.showDialog = true;
  }

  onEditCar(car: Car) {
    this.editMode = true;
    this.selectedCar = car;
    this.carForm.patchValue({
      brand: car.Marque,
      model: car.Modele,
      mileage: car.Km,
      licensePlate: car.Immatriculation,
      userOwnerId: car.IdUserOwner || null
    });
    this.showDialog = true;
  }

  onDeleteCar(car: Car) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le véhicule ${car.Marque} ${car.Modele} ?`)) {
      const sub = this.carService.deleteCar(car.Id!).subscribe({
        next: (response) => {
          if (response && response.Success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Véhicule supprimé avec succès'
            });
            this.loadCars();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: response?.Message || 'Impossible de supprimer le véhicule'
            });
          }
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: error?.error?.Message || 'Erreur lors de la suppression du véhicule'
          });
        }
      });
      this.subscriptions.push(sub);
    }
  }

  onSubmit() {
    if (this.carForm.valid) {
      const formData = this.carForm.value;
      
      const payload = {
        ApiKey: sessionStorage.getItem('apiKey'),
        Marque: formData.brand,
        Modele: formData.model,
        Km: formData.mileage,
        Immatriculation: formData.licensePlate,
        IdUserOwner: 1
      };

      console.log('Données envoyées:', payload);

      this.carService.createCar(payload).subscribe({
        next: (response) => {
          console.log('Réponse création véhicule:', response);
          if (response && response.Status === 201) {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: response.Message || 'Véhicule créé avec succès'
            });
            this.loadCars();
            this.closeDialog();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: response.Message || 'Erreur lors de la création du véhicule'
            });
          }
        },
        error: (error) => {
          console.error('Erreur lors de la création du véhicule:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: error.error?.Message || 'Erreur lors de la création du véhicule'
          });
        }
      });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.carForm.controls).forEach(key => {
        const control = this.carForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  getOwnerName(ownerId: number | null): string {
    if (!ownerId) return '';
    const owner = this.users.find(user => user.id === ownerId);
    return owner ? owner.name : '';
  }

  onShowAssignDialog(car: Car): void {
    this.selectedCar = car;
    if (this.users.length === 0) {
      this.loadUsers();
    }
    this.showAssignDialog = true;
  }

  hideAssignDialog(): void {
    this.showAssignDialog = false;
    this.selectedCarForAssign = null;
    this.newOwnerId = null;
  }

  assignCarToUser(car: Car, userId: number | null): void {
    if (!car.Id || !userId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Données invalides pour l\'attribution'
      });
      return;
    }

    this.loading = true;
    const sub = this.carService.assignCar(car.Id, userId).subscribe({
      next: (response) => {
        if (response && response.Status === 200) {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Véhicule attribué avec succès'
          });
          this.loadCars();
          this.showAssignDialog = false;
          this.selectedUser = null;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: response?.Message || 'Impossible d\'attribuer le véhicule'
          });
        }
      },
      error: (error) => {
        console.error('Erreur lors de l\'attribution:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error?.error?.Message || 'Erreur lors de l\'attribution du véhicule'
        });
      },
      complete: () => {
        this.loading = false;
      }
    });
    this.subscriptions.push(sub);
  }

  showSuccessMessage(summary: string): void {
    this.messageService.add({
      severity: 'success',
      summary: summary,
      detail: ''
    });
  }

  showErrorMessage(summary: string): void {
    this.messageService.add({
      severity: 'error',
      summary: summary,
      detail: ''
    });
  }

  closeDialog(): void {
    this.showDialog = false;
    this.carForm.reset();
    this.editMode = false;
    this.currentCar = null;
  }

  onManageStock(car: Car): void {
    this.router.navigate(['/profil/vehicule', car.Id, 'stock']);
  }
}
