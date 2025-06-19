import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

interface WikiItem {
  title: string;
  content: string;
  description: string;
  icon: string;
  value: string;
}

@Component({
  selector: 'app-ctrlacces',
  templateUrl: './ctrlacces.component.html',
  styleUrls: ['./ctrlacces.component.scss'],
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule]
})
export class CtrlaccesComponent {
  tabs: WikiItem[] = [
    { 
      title: 'Lecteurs de badge', 
      content: 'Installation et configuration des lecteurs RFID et codes. Guide complet sur le montage, le câblage et le paramétrage des différents types de lecteurs.', 
      description: 'Configuration des lecteurs d\'accès',
      icon: 'pi pi-id-card',
      value: '0'
    },
    { 
      title: 'Centrales d\'accès', 
      content: 'Programmation et gestion des centrales de contrôle d\'accès. Paramétrage des contrôleurs, configuration des zones et des plages horaires.', 
      description: 'Gestion des centrales de contrôle',
      icon: 'pi pi-server',
      value: '1'
    },
    { 
      title: 'Gestion des droits', 
      content: 'Attribution et modification des droits d\'accès utilisateurs. Création des profils, gestion des groupes et des autorisations spéciales.', 
      description: 'Administration des droits d\'accès',
      icon: 'pi pi-users',
      value: '2'
    },
    { 
      title: 'Supervision', 
      content: 'Monitoring et logs des accès en temps réel. Configuration des alertes, suivi des événements et génération des rapports d\'accès.', 
      description: 'Surveillance des accès en temps réel',
      icon: 'pi pi-chart-line',
      value: '3'
    }
  ];
}
