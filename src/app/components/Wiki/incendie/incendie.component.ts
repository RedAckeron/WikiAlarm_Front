import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

interface WikiItem {
  title: string;
  content: string;
  description: string;
  icon: string;
  value: string;
}

@Component({
  selector: 'app-incendie',
  templateUrl: './incendie.component.html',
  styleUrls: ['./incendie.component.scss'],
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, NgbModule]
})
export class IncendieComponent {
  tabs: WikiItem[] = [
    { 
      title: 'Détection incendie', 
      content: 'Guides sur les systèmes de détection de fumée et de chaleur. Installation et maintenance des détecteurs, zonage et paramétrage des seuils de détection.', 
      description: 'Configuration des détecteurs incendie',
      icon: 'pi pi-exclamation-triangle',
      value: '0'
    },
    { 
      title: 'Centrales incendie', 
      content: 'Configuration et maintenance des centrales d\'alarme incendie. Programmation des zones, gestion des événements et paramétrage des actions automatiques.', 
      description: 'Gestion des centrales de détection',
      icon: 'pi pi-server',
      value: '1'
    },
    { 
      title: 'Dispositifs d\'alerte', 
      content: 'Sirènes, flashs et dispositifs sonores d\'évacuation. Installation et configuration des différents types d\'avertisseurs, tests et maintenance.', 
      description: 'Systèmes d\'alerte et d\'évacuation',
      icon: 'pi pi-volume-up',
      value: '2'
    },
    { 
      title: 'Évacuation', 
      content: 'Procédures et équipements d\'évacuation d\'urgence. Plans d\'évacuation, signalisation, éclairage de sécurité et issues de secours.', 
      description: 'Gestion des procédures d\'urgence',
      icon: 'pi pi-sign-out',
      value: '3'
    }
  ];
}
