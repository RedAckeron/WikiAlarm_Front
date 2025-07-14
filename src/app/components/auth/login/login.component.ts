import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MessageService } from 'primeng/api';
import { UserFormLogin } from '../../../models/Forms/UsersFormLogin';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading: boolean = false;
  errorMessage: string = '';
  isSessionExpired: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.loginForm = this.fb.group({
      Email: ['', [Validators.required, Validators.email]],
      Password: ['', Validators.required]
    });

    // Vérifier si l'utilisateur vient d'être déconnecté
    const lastPath = sessionStorage.getItem('lastPath');
    if (lastPath && lastPath !== '/home' && lastPath !== '/') {
      this.isSessionExpired = true;
    }
  }

  ngOnInit() {
    // Nettoyer les messages d'erreur au chargement
    this.errorMessage = '';
    this.isSessionExpired = false;
    
    // Réinitialiser le formulaire
    this.loginForm = this.fb.group({
      Email: ['', [Validators.required, Validators.email]],
      Password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const loginData: UserFormLogin = {
        Email: this.loginForm.get('Email')?.value,
        Password: this.loginForm.get('Password')?.value
      };

      this.authService.login(loginData).subscribe({
        next: (response) => {
          console.log('Réponse login:', response);
          if (response && response.ApiKey) {
            // Rediriger vers la page d'accueil après connexion réussie
            this.router.navigate(['/home']);
          } else {
            this.errorMessage = 'Email ou mot de passe incorrect';
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Email ou mot de passe incorrect'
            });
          }
        },
        error: (error) => {
          console.error('Erreur de connexion:', error);
          this.errorMessage = 'Une erreur est survenue lors de la connexion';
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Une erreur est survenue lors de la connexion'
          });
        },
        complete: () => {
          this.loading = false;
        }
      });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}
