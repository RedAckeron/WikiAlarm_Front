import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserProfil } from 'src/app/models/Forms/UserProfil';
import { UserFormLogin } from 'src/app/models/Forms/UsersFormLogin';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { TokenService } from 'src/app/services/token.service';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class ProfilComponent implements OnInit {
  public userForm!: UserFormLogin;
  public loginUser!: FormGroup;
  private _isConnected!: Boolean;
  public loading: boolean = false;
  public userData: any = null;

  get isConnected() {
    return this._isConnected;
  }

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private _authService: AuthService,
    private _userService: UserService,
    private _tokenService: TokenService,
    private _fromBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this._authService.IsConnected.subscribe(
      (value: Boolean) => {
        this._isConnected = value;
        if (value) {
          const userId = Number(sessionStorage.getItem('IdUser'));
          const userEmail = sessionStorage.getItem('Email');
          this._userService.GetById(userId).subscribe({
            next: (response) => {
              if (response && response.JsonResult) {
                this.userData = response.JsonResult;
                this.loginUser.patchValue({
                  Email: userEmail || this.userData.Email || this.userData.email || '',
                  Password: ''
                });
                
                // Vérifier si l'utilisateur a le mot de passe par défaut
                this.checkDefaultPassword();
              }
            }
          });
        }
      },
      (error) => {
        this.showToast('error', 'Erreur', 'Erreur lors de la vérification de la connexion');
      }
    );

    this.loginUser = this._fromBuilder.group({
      Email: [null, [Validators.required, Validators.email]],
      Password: [null, [Validators.minLength(6)]],  // Pas obligatoire, mais si rempli doit faire au moins 6 caractères
      ConfirmPassword: [null, []]  // Pas obligatoire non plus
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: AbstractControl) {
    return g.get('Password')?.value === g.get('ConfirmPassword')?.value
      ? null : { mismatch: true };
  }

  // Méthode pour vérifier si le formulaire peut être soumis
  canSubmitForm(): boolean {
    const emailControl = this.loginUser.get('Email');
    const passwordControl = this.loginUser.get('Password');
    const confirmPasswordControl = this.loginUser.get('ConfirmPassword');
    
    // Email doit être valide
    const emailValid = emailControl?.valid;
    
    // Les deux champs mot de passe doivent être remplis
    const passwordFilled = passwordControl?.value && passwordControl.value.trim().length > 0;
    const confirmPasswordFilled = confirmPasswordControl?.value && confirmPasswordControl.value.trim().length > 0;
    
    // Les deux champs mot de passe doivent être valides
    const passwordValid = passwordControl?.valid;
    const confirmPasswordValid = confirmPasswordControl?.valid;
    
    // Les mots de passe doivent correspondre
    const passwordsMatch = !this.loginUser.hasError('mismatch');
    
    // Bouton visible seulement si email valide ET les 2 mots de passe sont remplis, valides et correspondent
    return !!(emailValid && passwordFilled && confirmPasswordFilled && passwordValid && confirmPasswordValid && passwordsMatch);
  }

  tryLoadOrCreateUser(): void {
    const userId = Number(sessionStorage.getItem('IdUser'));
    const email = this._authService.userValue?.email || '';
    const name = this._authService.userValue?.firstName || '';

    this._userService.checkOrCreateUser(userId, email, name).subscribe({
      next: (response) => {

        if (response && response.JsonResult) {
          this.userData = response.JsonResult;
          // Si l'email n'existe pas, on fait un update
          if (!this.userData.Email && !this.userData.email && email) {
            this._userService.Update(this.userData.Id || this.userData.id, { email: email, firstName: name }).subscribe({
              next: () => {
                // Après update, relire les infos utilisateur
                this._userService.checkOrCreateUser(userId, email, name).subscribe({
                  next: (resp) => {
                    this.userData = resp.JsonResult;
                    this.loginUser.patchValue({
                      Email: this.userData.Email || this.userData.email || '',
                      Password: ''
                    });

                  }
                });
              }
            });
          } else {
            this.loginUser.patchValue({
              Email: this.userData.Email || this.userData.email || '',
              Password: ''
            });

          }
        }
      }
    });
  }

  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({
      severity: severity,
      summary: summary,
      detail: detail,
      life: 5000,
      sticky: false
    });
  }

  private checkDefaultPassword(): void {
    // Vérifier si l'utilisateur a le mot de passe par défaut
    // On utilise plusieurs indicateurs pour détecter cela :
    
    // 1. Vérifier si c'est marqué dans sessionStorage (peut être défini lors de la connexion)
    const hasDefaultPassword = sessionStorage.getItem('hasDefaultPassword');
    
    // 2. Ou vérifier si c'est la première connexion (peut être ajouté à l'API plus tard)
    const isFirstLogin = this.userData?.isFirstLogin || this.userData?.hasDefaultPassword;
    
    // 3. Ou si l'utilisateur n'a jamais changé son mot de passe (timestampe de dernière modification)
    const lastPasswordChange = this.userData?.lastPasswordChange;
    const accountCreated = this.userData?.createdAt || this.userData?.dtin;
    
    if (hasDefaultPassword === 'true' || isFirstLogin || 
        (accountCreated && !lastPasswordChange)) {
      
      this.showToast(
        'warn', 
        '🔒 Sécurité', 
        'Votre mot de passe est encore celui par défaut (WikiAlarm). Pour votre sécurité, veuillez le changer ci-dessous.'
      );
      
      // Optionnel : faire clignoter le champ mot de passe
      setTimeout(() => {
        const passwordField = document.getElementById('password');
        if (passwordField) {
          passwordField.focus();
          passwordField.style.border = '2px solid #ff6b6b';
          setTimeout(() => {
            passwordField.style.border = '';
          }, 3000);
        }
      }, 1000);
    }
  }

  onSubmit(): void {
    if (this.loginUser.valid) {
      this.loading = true;
      const userId = this._tokenService.getUserId();
      
      // Construire les données à envoyer - ne pas inclure le mot de passe s'il est vide
      const userData: any = {
        Email: this.loginUser.value.Email
      };
      
      // Ajouter le mot de passe seulement s'il a été saisi
      if (this.loginUser.value.Password && this.loginUser.value.Password.trim().length > 0) {
        userData.Password = this.loginUser.value.Password;
      }

      this._userService.Update(userId, userData).subscribe({
        next: (response) => {
          this.loading = false;

          if (response.Status === 200) {
            this.showToast('success', 'Succès', 'Profil mis à jour avec succès');
            
            // Si l'utilisateur a changé son mot de passe, supprimer le flag du mot de passe par défaut
            if (this.loginUser.value.Password) {
              sessionStorage.removeItem('hasDefaultPassword');
            }
            
            this.tryLoadOrCreateUser();
          } else {
            this.showToast('error', 'Erreur', response.Message || 'Erreur lors de la mise à jour du profil');
          }
        },
        error: (error) => {
          this.loading = false;
          this.showToast('error', 'Erreur', 'Erreur lors de la mise à jour du profil');
        }
      });
    } else {
      this.loginUser.markAllAsTouched();
      this.showToast('warn', 'Attention', 'Veuillez remplir correctement tous les champs');
    }
  }

  confirmDeactivate(): void {
    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir désactiver votre compte ? Cette action est irréversible.',
      header: 'Confirmation de désactivation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, désactiver',
      rejectLabel: 'Non, annuler',
      accept: () => {
        this.deactivateAccount();
      },
      reject: () => {
        this.showToast('info', 'Annulé', 'La désactivation du compte a été annulée');
      }
    });
  }

  deactivateAccount(): void {
    const userId = this._tokenService.getUserId();
    if (userId) {
      this._userService.Deactivate(userId).subscribe({
        next: (response) => {
          if (response.Status === 200) {
            this.showToast('success', 'Succès', 'Votre compte a été désactivé avec succès. Vous allez être déconnecté.');
            setTimeout(() => {
              this._authService.logout();
            }, 2000);
          } else {
            this.showToast('error', 'Erreur', response.Message || 'Erreur lors de la désactivation du compte');
          }
        },
        error: (error) => {
          this.showToast('error', 'Erreur', 'Une erreur est survenue lors de la désactivation du compte');
        }
      });
    }
  }
}
