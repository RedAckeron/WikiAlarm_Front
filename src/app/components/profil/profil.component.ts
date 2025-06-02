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
  providers: [MessageService,AuthService]
})
export class ProfilComponent implements OnInit {
  public userForm! : UserFormLogin
  public loginUser! : FormGroup
private _isConnected! : Boolean;


get isConnected()
  {
    return this._isConnected;
  }

  
constructor(
  private messageService: MessageService,
  private _authService:AuthService,
  private _fromBuilder : FormBuilder
) {}


  ngOnInit(): void {

  this._authService.IsConnected.subscribe(
      {
      next: (value : Boolean) =>
        {
          this._isConnected=value;
        }
      });




    this.loginUser = this._fromBuilder.group({
      Email : [null, [Validators.required]],
      Password : [null, [Validators.required]]
    })
  }
  
  onSubmit(): void
    {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Update" });
    }

}
