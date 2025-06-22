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

  roles: string[] = ['User', 'Admin'];
  statuts = [
    { label: 'Actif', value: 1 },
    { label: 'Inactif', value: 0 }
  ];

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private tokenService: TokenService,
    private userNotificationService: UserNotificationService
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      firstName: [''],
      nickName: ['', [Validators.maxLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['User', Validators.required],
      password: [''],
      active: [1]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (response) => {
        if (response && response.JsonResult) {
          this.users = [...response.JsonResult];
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
    this.userForm.reset({
      role: 'User',
      active: 1
    });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.showDialog = true;
  }

  editUser(user: any): void {
    this.isEditMode = true;
    this.currentUser = user;
    this.userForm.patchValue({
      name: user.Name,
      firstName: user.FirstName,
      nickName: user.NickName,
      email: user.Email,
      role: user.Role,
      active: user.Active,
      password: ''
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.setValidators(Validators.minLength(6));
    this.userForm.get('password')?.updateValueAndValidity();
    this.showDialog = true;
  }

  hideDialog(): void {
    this.showDialog = false;
    this.userForm.reset();
    this.currentUser = null;
    this.isEditMode = false;
  }

  saveUser(): void {
    if (this.userForm.valid) {
      const userData: any = {
        Name: this.userForm.value.name,
        FirstName: this.userForm.value.firstName,
        NickName: this.userForm.value.nickName,
        Email: this.userForm.value.email,
        Role: this.userForm.value.role,
        ApiKey: sessionStorage.getItem('apiKey')
      };

      if (this.userForm.value.password) {
        userData.Password = this.userForm.value.password;
      }

      if (this.isEditMode) {
        userData.Active = this.userForm.value.active;
        
        this.userService.updateUser(this.currentUser.Id, userData).subscribe({
          next: (response) => {
            if (response.Status === 200) {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Utilisateur modifié avec succès'
              });
              this.hideDialog();
              this.loadUsers();
              this.userNotificationService.notifyUserUpdate();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: response.Message || 'Erreur lors de la modification'
              });
            }
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
        this.userService.createUser(userData).subscribe({
          next: (response) => {
            if (response.Status === 200) {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Utilisateur créé avec succès'
              });
              this.hideDialog();
              this.loadUsers();
              this.userNotificationService.notifyUserUpdate();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: response.Message || 'Erreur lors de la création'
              });
            }
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
