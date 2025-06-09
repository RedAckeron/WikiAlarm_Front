import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CarService } from 'src/app/services/car.service';
import { UserService } from 'src/app/services/user.service';
import { TokenService } from 'src/app/services/token.service';
import { UserNotificationService } from 'src/app/services/user-notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-car',
  templateUrl: './car.component.html',
  styleUrls: ['./car.component.scss']
})
export class CarComponent implements OnInit, OnDestroy {
  cars: any[] = [];
  users: any[] = [];
  showDialog: boolean = false;
  showAssignDialog: boolean = false;
  isEditMode: boolean = false;
  carForm: FormGroup;
  currentCar: any = null;
  selectedCarForAssign: any = null;
  newOwnerId: number | null = null;
  private userUpdateSubscription: Subscription = new Subscription();

  constructor(
    private carService: CarService,
    private userService: UserService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private tokenService: TokenService,
    private userNotificationService: UserNotificationService
  ) {
    this.carForm = this.fb.group({
      marque: ['', Validators.required],
      modele: ['', Validators.required],
      km: [0],
      imatriculation: ['', Validators.required],
      proprietaire: [null]
    });
  }

  ngOnInit(): void {
    this.loadCars();
    this.loadUsers();
    
    // S'abonner aux notifications de mise à jour des utilisateurs
    this.userUpdateSubscription = this.userNotificationService.userUpdated$.subscribe(() => {
      this.loadUsers();
    });
  }

  ngOnDestroy(): void {
    // Désabonnement pour éviter les fuites mémoire
    this.userUpdateSubscription.unsubscribe();
  }

  loadCars(): void {
    this.carService.getCars().subscribe({
      next: (response) => {
        if (response && response.JsonResult) {
          this.cars = response.JsonResult;
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des véhicules'
        });
      }
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (response) => {
        if (response && response.JsonResult) {
          this.users = [
            { id: null, name: 'Non assigné', email: '' },
            ...response.JsonResult.map((user: any) => ({
              id: user.Id,
              name: user.Name || user.Email.split('@')[0],
              email: user.Email
            }))
          ];
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Avertissement',
          detail: 'Impossible de charger la liste des utilisateurs'
        });
        // Fallback avec des utilisateurs de test
        this.users = [
          { id: null, name: 'Non assigné', email: '' },
          { id: 1, name: 'Jean Dupont', email: 'jean.dupont@example.com' },
          { id: 2, name: 'Marie Martin', email: 'marie.martin@example.com' }
        ];
      }
    });
  }

  showAddCarDialog(): void {
    this.isEditMode = false;
    this.currentCar = null;
    this.carForm.reset();
    this.showDialog = true;
  }

  editCar(car: any): void {
    this.isEditMode = true;
    this.currentCar = car;
    this.carForm.patchValue({
      marque: car.Marque,
      modele: car.Modele,
      km: car.Km,
      imatriculation: car.Immatriculation,
      proprietaire: car.IdUserOwner
    });
    this.showDialog = true;
  }

  deleteCar(car: any): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le véhicule ${car.Marque} ${car.Modele} ?`)) {
      // TODO: Implémenter la suppression via l'API
      this.messageService.add({
        severity: 'info',
        summary: 'Info',
        detail: 'Fonction de suppression à implémenter'
      });
    }
  }

  saveCar(): void {
    if (this.carForm.valid) {
      const carData: any = {
        Marque: this.carForm.value.marque,
        Modele: this.carForm.value.modele,
        Km: this.carForm.value.km || 0,
        Immatriculation: this.carForm.value.imatriculation,
        // En création : attribuer à l'utilisateur connecté, en édition : garder la valeur du formulaire
        IdUserOwner: this.isEditMode ? this.carForm.value.proprietaire : this.tokenService.getUserId()
      };

      if (this.isEditMode && this.currentCar) {
        // Mise à jour
        const updatedCar = { ...this.currentCar, ...carData };
        this.carService.updateCar(updatedCar).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Véhicule modifié avec succès'
            });
            this.hideDialog();
            this.loadCars();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de la modification'
            });
          }
        });
      } else {
        // Ajout
        this.carService.addCar(carData).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Véhicule ajouté avec succès'
            });
            this.hideDialog();
            this.loadCars();
          },
          error: (error) => {
            console.error('❌ Erreur API création:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: `Erreur lors de l'ajout: ${error.message || error}`
            });
          }
        });
      }
    }
  }

  hideDialog(): void {
    this.showDialog = false;
    this.carForm.reset();
    this.currentCar = null;
    this.isEditMode = false;
  }

  getOwnerName(ownerId: number | null): string {
    if (!ownerId) return '';
    const owner = this.users.find(user => user.id === ownerId);
    return owner ? owner.name : '';
  }

  showAssignCarDialog(car: any): void {
    this.selectedCarForAssign = car;
    this.newOwnerId = car.IdUserOwner;
    this.showAssignDialog = true;
  }

  hideAssignDialog(): void {
    this.showAssignDialog = false;
    this.selectedCarForAssign = null;
    this.newOwnerId = null;
  }

  assignCar(): void {
    if (this.selectedCarForAssign) {
      const updatedCar = {
        ...this.selectedCarForAssign,
        IdUserOwner: this.newOwnerId
      };

      this.carService.updateCar(updatedCar).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Véhicule attribué avec succès'
          });
          this.hideAssignDialog();
          this.loadCars();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Erreur lors de l\'attribution'
          });
        }
      });
    }
  }
}
