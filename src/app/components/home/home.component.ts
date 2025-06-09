import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { UserFormLogin } from 'src/app/models/Forms/UsersFormLogin';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [MessageService]
})
export class HomeComponent implements OnInit {
  private _isConnected!: Boolean;
  loginForm!: FormGroup;
  loading: boolean = false;

  get isConnected() {
    return this._isConnected;
  }

  constructor(
    private messageService: MessageService,
    private _authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this._authService.IsConnected.subscribe({
      next: (value: Boolean) => {
        this._isConnected = value;
      }
    });
    this.loginForm = this.formBuilder.group({
      Email: ['', [Validators.required, Validators.email]],
      Password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const userForm: UserFormLogin = this.loginForm.value;
      this._authService.login(userForm).subscribe({
        next: (response) => {
          this.loading = false;
          if (response && response.Id && response.Id != 0) {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Connexion réussie'
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Login ou mot de passe incorrect !'
            });
          }
        },
        error: (error) => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Échec de la connexion'
          });
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez remplir correctement tous les champs'
      });
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}