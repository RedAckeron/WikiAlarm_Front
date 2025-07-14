import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {

  showItemManagement = false;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {

  }

  get canManageUsers(): boolean {
    return this.authService.canManageUsers();
  }

  get canManageVehicles(): boolean {
    return this.authService.canManageVehicles();
  }

  get userRole(): string {
    return this.authService.getCurrentUserRole();
  }
}
