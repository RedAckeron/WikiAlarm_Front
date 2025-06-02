import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { RegisterForm } from 'src/app/models/Forms/RegisterForm';
import { AuthService } from 'src/app/Services/auth.service';
import { TokenService } from 'src/app/Services/Token.service';
import { UserService } from 'src/app/Services/user.service';

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

  constructor(
    private _authService : AuthService,
    private _userService : UserService,
    private _fromBuilder : FormBuilder,
    private _tokenService : TokenService,
    private _router : Router,
    private messageService: MessageService
  ) { }


 ngOnInit(): void {
    this.RegisterUser = this._fromBuilder.group({
     Email: ['', [Validators.required, Validators.email]],
  Password: ['', [Validators.required, Validators.minLength(6)]]
    })
  }

  onSubmit(): void{
    if(this.RegisterUser.valid)
    {
    this.registerForm = new RegisterForm()
    this.registerForm.Email = this.RegisterUser.value['Email']
    this.registerForm.Password = this.RegisterUser.value['Password']

    this._authService.register(this.registerForm).subscribe({
      next : (data) => {
        if (data) {
          console.table(data)
          if(data.id!=0)
          {
            this._tokenService.saveToken(data.id.toString())
            this.messageService.add({ severity: 'info', summary: 'Succes', detail: data.ApiMessage });
            this._router.navigate(['profil'])
          }
          else 
          {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: data.ApiMessage });
          }
        }
      },
      error : (error) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error.message });
      },
      complete : () => {
        // Redirection....
       
      }
    })
    }
  else 
  {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Les champs du formulaire sont invalide' });
  }
  }    }

 