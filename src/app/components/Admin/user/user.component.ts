import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { UserService } from 'src/app/services/user.service';
import { TokenService } from 'src/app/services/token.service';
import { UserNotificationService } from 'src/app/services/user-notification.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  users: any[] = [];
  showDialog: boolean = false;
  isEditMode: boolean = false;
  userForm: FormGroup;
  currentUser: any = null;
  selectedUser: any = null;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private tokenService: TokenService,
    private userNotificationService: UserNotificationService
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''] // Pas de validation par défaut, sera géré dynamiquement
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (response) => {
        if (response && response.JsonResult) {
          // S'assurer que les données sont correctement mises à jour
          this.users = [...response.JsonResult]; // Créer une nouvelle référence pour forcer la détection de changement
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des utilisateurs'
        });
      }
    });
  }

  showAddUserDialog(): void {
    this.isEditMode = false;
    this.currentUser = null;
    this.userForm.reset();
    // En mode création, pas de validation de mot de passe
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.showDialog = true;
  }

  editUser(user: any): void {
    this.isEditMode = true;
    this.currentUser = user;
    this.userForm.patchValue({
      name: user.Name,
      email: user.Email,
      password: '' // On laisse vide pour modification
    });
    // En mode édition, le mot de passe est optionnel avec validation si renseigné
    this.userForm.get('password')?.setValidators([Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.showDialog = true;
  }

  hideDialog(): void {
    this.showDialog = false;
    this.userForm.reset();
    this.currentUser = null;
    this.isEditMode = false;
    // Remettre la validation du mot de passe
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  saveUser(): void {
    if (this.userForm.valid) {
      const userData: any = {
        Name: this.userForm.value.name,
        Email: this.userForm.value.email
      };

      // Ajouter le mot de passe seulement s'il est renseigné
      if (this.userForm.value.password) {
        userData.Password = this.userForm.value.password;
      }

      if (this.isEditMode && this.currentUser) {
        // Mise à jour
        this.userService.updateUser(this.currentUser.Id, userData).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Utilisateur modifié avec succès'
            });
            this.hideDialog();
            this.loadUsers();
            // Notifier les autres composants
            this.userNotificationService.notifyUserUpdate();
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
        // Création d'utilisateur
        const apiKey = sessionStorage.getItem('apiKey');
        
        if (!apiKey) {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Clé API manquante. Veuillez vous reconnecter.'
          });
          return;
        }
        
        const createData = {
          ApiKey: apiKey,
          Name: userData.Name,
          Email: userData.Email,
          Password: 'WikiAlarm'
        };
        
        this.userService.createUser(createData).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Utilisateur créé avec succès'
            });
            this.hideDialog();
            this.loadUsers();
            // Notifier les autres composants
            this.userNotificationService.notifyUserUpdate();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de la création'
            });
          }
        });
      }
    }
  }

  toggleUserStatus(user: any): void {
    const currentActiveValue = user.active ?? user.Active ?? user.status ?? user.Status;
    const isCurrentlyActive = currentActiveValue === 1 || currentActiveValue === '1' || currentActiveValue === true || currentActiveValue === 'true';
    
    const newStatus = isCurrentlyActive ? 0 : 1;
    const action = newStatus === 0 ? 'désactiver' : 'réactiver';
    
    if (confirm(`Êtes-vous sûr de vouloir ${action} l'utilisateur ${user.Name || user.Email} ?`)) {
      if (newStatus === 0) {
        // Désactiver
        this.userService.Deactivate(user.Id).subscribe({
          next: (response) => {
            console.log('🔍 Réponse API désactivation:', response);
            // Vérifier le statut de la réponse API
            if (response && (response.Status === 200 || response.Status === '200')) {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Utilisateur désactivé avec succès'
              });
              this.loadUsers();
              // Notifier les autres composants
              this.userNotificationService.notifyUserUpdate();
            } else {
              console.log('❌ Statut API non-200:', response?.Status);
              this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: response?.Message || 'Erreur lors de la désactivation'
              });
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de la désactivation'
            });
          }
        });
      } else {
        // Pour réactiver, il faut utiliser update
        this.userService.updateUser(user.Id, { active: 1 }).subscribe({
          next: (response) => {
            // Vérifier le statut de la réponse API
            if (response && (response.Status === 200 || response.Status === '200')) {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Utilisateur réactivé avec succès'
              });
              this.loadUsers();
              // Notifier les autres composants
              this.userNotificationService.notifyUserUpdate();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: response?.Message || 'Erreur lors de la réactivation'
              });
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de la réactivation'
            });
          }
        });
      }
    }
  }

  getUserStatus(user: any): string {
    // Vérifier différents noms de champs possibles et différents types
    const activeValue = user.active ?? user.Active ?? user.status ?? user.Status;
    
    // Gérer les différents types de valeurs (number, string, boolean)
    if (activeValue === 1 || activeValue === '1' || activeValue === true || activeValue === 'true') {
      return 'Actif';
    }
    return 'Inactif';
  }

  getUserSeverity(user: any): string {
    const activeValue = user.active ?? user.Active ?? user.status ?? user.Status;
    
    if (activeValue === 1 || activeValue === '1' || activeValue === true || activeValue === 'true') {
      return 'success';
    }
    return 'danger';
  }

  onUserSelected() {
    // Optionnel : tu peux ajouter une logique ici si besoin
  }
}
