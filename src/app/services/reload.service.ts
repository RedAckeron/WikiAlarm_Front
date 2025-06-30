import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ReloadService {
  constructor(private router: Router) {
    // Écouter l'événement beforeunload qui se déclenche avant le rechargement de la page
    window.addEventListener('beforeunload', () => {
      // Sauvegarder le chemin actuel avant le rechargement
      sessionStorage.setItem('lastPath', this.router.url);
    });

    // Écouter l'événement load qui se déclenche après le rechargement
    window.addEventListener('load', () => {
      // Si nous ne sommes pas déjà sur la page d'accueil
      if (this.router.url !== '/home' && this.router.url !== '/') {
        // Rediriger vers la page d'accueil
        this.router.navigate(['/home']);
      }
    });
  }
} 