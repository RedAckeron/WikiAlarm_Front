import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { User } from 'src/app/models/User';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { TokenService } from 'src/app/services/token.service';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class ProfilComponent implements OnInit, OnDestroy {
  // Formulaires
  public passwordForm: FormGroup = this.formBuilder.group({
    Password: ['', [Validators.required, Validators.minLength(6)]],
    ConfirmPassword: ['', Validators.required]
  }, { validator: this.passwordMatchValidator });

  // Données utilisateur
  public userData: User | null = null;
  
  // États
  public loading = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private userService: UserService,
    private tokenService: TokenService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.checkAuthenticationAndLoadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Vérification de l'authentification et chargement des données
  private checkAuthenticationAndLoadData(): void {
    const authSub = this.authService.IsConnected.subscribe({
      next: (isConnected: Boolean) => {
        if (isConnected) {
          const userId = this.tokenService.getUserId();
          if (userId) {
            this.loadUserData(userId);
          }
        }
      },
      error: () => {
        this.showToast('error', 'Erreur', 'Erreur lors de la vérification de la connexion');
      }
    });
    this.subscriptions.push(authSub);
  }

  // Chargement des données utilisateur
  private loadUserData(userId: number): void {
    this.loading = true;
    const userSub = this.userService.GetById(userId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          if (response?.JsonResult) {
            this.userData = response.JsonResult;
            if (this.userData) {
              this.userData.Active = parseInt(sessionStorage.getItem('userActive') || '0');
            }
            this.checkDefaultPassword();
          }
        },
        error: () => {
          this.showToast('error', 'Erreur', 'Erreur lors du chargement des données utilisateur');
        }
      });
    this.subscriptions.push(userSub);
  }

  // Validation du mot de passe
  private passwordMatchValidator(g: AbstractControl) {
    return g.get('Password')?.value === g.get('ConfirmPassword')?.value
      ? null : { mismatch: true };
  }

  // Vérification si le formulaire peut être soumis
  public canSubmitPasswordForm(): boolean {
    const passwordControl = this.passwordForm.get('Password');
    const confirmPasswordControl = this.passwordForm.get('ConfirmPassword');
    
    return !!(
      passwordControl?.value?.trim() &&
      confirmPasswordControl?.value?.trim() &&
      passwordControl?.valid &&
      confirmPasswordControl?.valid &&
      !this.passwordForm.hasError('mismatch')
    );
  }

  // Affichage des messages toast
  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({
      severity,
      summary,
      detail,
      life: 5000
    });
  }

  // Vérification du mot de passe par défaut
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

  // Soumission du formulaire de mot de passe
  public onSubmitPassword(): void {
    if (!this.canSubmitPasswordForm()) {
      this.passwordForm.markAllAsTouched();
      this.showToast('warn', 'Attention', 'Veuillez remplir correctement tous les champs');
      return;
    }

    const userId = this.tokenService.getUserId();
    if (!userId) {
      this.showToast('error', 'Erreur', 'ID utilisateur non trouvé');
      return;
    }

    this.loading = true;
    const userData = {
      Password: this.passwordForm.value.Password,
      ApiKey: sessionStorage.getItem('apiKey')
    };

    const updateSub = this.userService.Update(userId, userData)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          if (response.Status === 200) {
            this.showToast('success', 'Succès', 'Mot de passe mis à jour avec succès');
            sessionStorage.removeItem('hasDefaultPassword');
            this.passwordForm.reset();
          } else {
            this.showToast('error', 'Erreur', response.Message || 'Erreur lors de la mise à jour du mot de passe');
          }
        },
        error: () => {
          this.showToast('error', 'Erreur', 'Erreur lors de la mise à jour du mot de passe');
        }
      });
    this.subscriptions.push(updateSub);
  }
}
