import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { RegisterForm } from 'src/app/models/Forms/RegisterForm';
import { RegisterResponse } from 'src/app/models/Forms/RegisterResponse';
import { AuthService } from 'src/app/services/auth.service';
import { TokenService } from 'src/app/services/token.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  providers: [MessageService]
})

export class RegisterComponent implements OnInit {
    public errormessage:string="";
    public registerForm! : RegisterForm
    public RegisterUser! : FormGroup
    public loading: boolean = false;

  constructor(
    private _authService : AuthService,
    private _userService : UserService,
    private _formBuilder : FormBuilder,
    private _tokenService : TokenService,
    private _router : Router,
    private messageService: MessageService
  ) { }


 ngOnInit(): void {
    this.RegisterUser = this._formBuilder.group({
     Email: [null, [Validators.required, Validators.email]],
  Password: [null, [Validators.required, Validators.minLength(6)]]
    })
  }

  onSubmit(): void{
    if(this.RegisterUser.valid)
    {
    this.loading = true;
    this.registerForm = new RegisterForm()
    this.registerForm.Email = this.RegisterUser.value['Email']
    this.registerForm.Password = this.RegisterUser.value['Password']

    this._authService.register(this.registerForm).subscribe({
      next : (response: RegisterResponse) => {
        if (response) {
          if(response.id!=0)
          {
            this._tokenService.saveToken(response.id.toString())
            this.messageService.add({ severity: 'info', summary: 'Succès', detail: response.apiMessage });
            this._router.navigate(['profil'])
          }
          else 
          {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: response.apiMessage });
          }
        }
      },
      error : (error) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error.message });
      },
      complete : () => {
        this.loading = false;
      }
    })
    }
  else 
  {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Les champs du formulaire sont invalides' });
  }
  }    

  goBack(): void {
    this._router.navigate(['/home']);
  }
}

 