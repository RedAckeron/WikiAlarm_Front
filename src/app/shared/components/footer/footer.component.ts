import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/Services/auth.service';
import { UserService } from 'src/app/Services/user.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  private _isConnected! : Boolean;
  userEmail: string = '';

  get isConnected()
  {
    return this._isConnected;
  }
  private _currentCustomer! : number;

  get currentCustomer()
  {
    return this._currentCustomer;
  }



   constructor(private _authService:AuthService,private _userService:UserService){
   }

  IdUser:string|null =localStorage.getItem('IdUser');
  
  ngOnInit(): void {

    this._authService.IsConnected.subscribe({
      next: (value : Boolean) => 
      {
        this._isConnected=value
        if (value) {
          const user = this._authService.userValue;
          if (user) {
            this.userEmail = user.email;
          }
        }
      }});


      this._userService.CurrentCustomer.subscribe({
        next: (value : number) => 
        {
          this._currentCustomer=value;
        }});


  }
  }