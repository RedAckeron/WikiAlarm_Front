import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserNotificationService {
  private userUpdatedSource = new Subject<void>();
  
  // Observable que les autres composants peuvent écouter
  userUpdated$ = this.userUpdatedSource.asObservable();

  constructor() { }

  // Méthode appelée quand un utilisateur est créé, modifié ou supprimé
  notifyUserUpdate(): void {
    this.userUpdatedSource.next();
  }
} 