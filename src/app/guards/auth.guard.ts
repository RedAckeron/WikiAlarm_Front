import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.IsConnected.pipe(
      take(1),
      map((isConnected: Boolean) => {
        if (isConnected) {
          return true;
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Accès refusé',
            detail: 'Veuillez vous connecter pour accéder à cette page'
          });
          this.router.navigate(['/home']);
          return false;
        }
      })
    );
  }
} 