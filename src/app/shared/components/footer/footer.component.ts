import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  private _isConnected! : Boolean;
  userEmail: string = '';
  userRole: string = '';

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
        this._isConnected = value;
        if (value) {
          this.userEmail = sessionStorage.getItem('Email') || '';
          this.userRole = sessionStorage.getItem('userRole') || '';
        } else {
          this.userEmail = '';
          this.userRole = '';
        }
      }});


      this._userService.CurrentCustomer.subscribe({
        next: (value : number) => 
        {
          this._currentCustomer=value;
        }});


  }
  }