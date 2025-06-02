import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { UserProfil } from 'src/app/models/Forms/UserProfil';
import { UserFormLogin } from 'src/app/models/Forms/UsersFormLogin';
import { AuthService } from 'src/app/Services/auth.service';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss'],
  providers: [MessageService, AuthService]
})
export class ProfilComponent implements OnInit {
  public userForm!: UserFormLogin;
  public loginUser!: FormGroup;
  private _isConnected!: Boolean;
  public loading: boolean = false;

  get isConnected() {
    return this._isConnected;
  }

  constructor(
    private messageService: MessageService,
    private _authService: AuthService,
    private _fromBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this._authService.IsConnected.subscribe(
      (value: Boolean) => {
        this._isConnected = value;
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la vérification de la connexion'
        });
      }
    );

    this.loginUser = this._fromBuilder.group({
      Email: [null, [Validators.required, Validators.email]],
      Password: [null, [Validators.required, Validators.minLength(6)]]
    });

    // Charger les données actuelles de l'utilisateur
    this.loadUserData();
  }

  private loadUserData(): void {
    // TODO: Implémenter le chargement des données utilisateur depuis le service
    // this._authService.getCurrentUser().subscribe({
    //   next: (user) => {
    //     this.loginUser.patchValue({
    //       Email: user.email
    //     });
    //   },
    //   error: (error) => {
    //     this.messageService.add({
    //       severity: 'error',
    //       summary: 'Erreur',
    //       detail: 'Impossible de charger les données utilisateur'
    //     });
    //   }
    // });
  }
  
  onSubmit(): void {
    if (this.loginUser.valid) {
      this.loading = true;
      const userData = this.loginUser.value;

      // TODO: Implémenter la mise à jour du profil
      setTimeout(() => { // À remplacer par l'appel API réel
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Profil mis à jour avec succès'
        });
      }, 1000);
    } else {
      this.loginUser.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Veuillez corriger les erreurs dans le formulaire'
      });
    }
  }
}
