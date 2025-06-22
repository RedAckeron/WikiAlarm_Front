import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { User } from 'src/app/models/User';
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
  public passwordForm!: FormGroup;
  private _isConnected!: Boolean;
  public loading: boolean = false;
  public userData: User | null = null;

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private _authService: AuthService,
    private _userService: UserService,
    private _tokenService: TokenService,
    private _formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    this._authService.IsConnected.subscribe(
      (value: Boolean) => {
        this._isConnected = value;
        if (value) {
          const userId = this._tokenService.getUserId();
          if (userId) {
            this.loadUserData(userId);
          }
        }
      },
      (error) => {
        this.showToast('error', 'Erreur', 'Erreur lors de la vérification de la connexion');
      }
    );
  }

  private initializeForm(): void {
    this.passwordForm = this._formBuilder.group({
      Password: [null, [Validators.minLength(6)]],
      ConfirmPassword: [null]
    }, { validator: this.passwordMatchValidator });
  }

  private loadUserData(userId: number): void {
    this._userService.GetById(userId).subscribe({
      next: (response) => {
        if (response && response.JsonResult) {
          this.userData = response.JsonResult;
          if (this.userData) {
            this.userData.Active = parseInt(sessionStorage.getItem('userActive') || '0');
          }
          this.checkDefaultPassword();
        }
      },
      error: (error) => {
        this.showToast('error', 'Erreur', 'Erreur lors du chargement des données utilisateur');
      }
    });
  }

  passwordMatchValidator(g: AbstractControl) {
    return g.get('Password')?.value === g.get('ConfirmPassword')?.value
      ? null : { mismatch: true };
  }

  canSubmitPasswordForm(): boolean {
    const passwordControl = this.passwordForm.get('Password');
    const confirmPasswordControl = this.passwordForm.get('ConfirmPassword');
    
    const passwordFilled = passwordControl?.value && passwordControl.value.trim().length > 0;
    const confirmPasswordFilled = confirmPasswordControl?.value && confirmPasswordControl.value.trim().length > 0;
    const passwordValid = passwordControl?.valid;
    const confirmPasswordValid = confirmPasswordControl?.valid;
    const passwordsMatch = !this.passwordForm.hasError('mismatch');
    
    return !!(passwordFilled && confirmPasswordFilled && passwordValid && confirmPasswordValid && passwordsMatch);
  }

  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({
      severity: severity,
      summary: summary,
      detail: detail,
      life: 5000
    });
  }

  private checkDefaultPassword(): void {
    const hasDefaultPassword = sessionStorage.getItem('hasDefaultPassword');
    if (hasDefaultPassword === 'true') {
      this.showToast(
        'warn', 
        '🔒 Sécurité', 
        'Votre mot de passe est encore celui par défaut. Pour votre sécurité, veuillez le changer.'
      );
    }
  }

  onSubmitPassword(): void {
    if (this.passwordForm.valid && this.canSubmitPasswordForm()) {
      this.loading = true;
      const userId = this._tokenService.getUserId();
      
      if (!userId) {
        this.showToast('error', 'Erreur', 'ID utilisateur non trouvé');
        return;
      }

      const userData = {
        Password: this.passwordForm.value.Password,
        ApiKey: sessionStorage.getItem('apiKey')
      };

      this._userService.Update(userId, userData).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.Status === 200) {
            this.showToast('success', 'Succès', 'Mot de passe mis à jour avec succès');
            sessionStorage.removeItem('hasDefaultPassword');
            this.passwordForm.reset();
          } else {
            this.showToast('error', 'Erreur', response.Message || 'Erreur lors de la mise à jour du mot de passe');
          }
        },
        error: (error) => {
          this.loading = false;
          this.showToast('error', 'Erreur', 'Erreur lors de la mise à jour du mot de passe');
        }
      });
    } else {
      this.passwordForm.markAllAsTouched();
      this.showToast('warn', 'Attention', 'Veuillez remplir correctement tous les champs');
    }
  }
}
