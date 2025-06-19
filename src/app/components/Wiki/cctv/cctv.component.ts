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
  selector: 'app-cctv',
  templateUrl: './cctv.component.html',
  styleUrls: ['./cctv.component.scss'],
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, NgbModule]
})
export class CctvComponent {
  tabs: WikiItem[] = [
    { 
      title: 'Caméras IP', 
      content: 'Installation et configuration des caméras de surveillance IP. Guide détaillé sur le paramétrage des caméras réseau, leur positionnement et leur intégration.', 
      description: 'Configuration des caméras de surveillance',
      icon: 'pi pi-camera',
      value: '0'
    },
    { 
      title: 'Enregistreurs', 
      content: 'Configuration des NVR/DVR et systèmes d\'enregistrement. Paramétrage des options d\'enregistrement, gestion du stockage et des archives vidéo.', 
      description: 'Gestion des enregistreurs vidéo',
      icon: 'pi pi-database',
      value: '1'
    },
    { 
      title: 'Réseau vidéo', 
      content: 'Architecture réseau et bande passante pour la vidéosurveillance. Optimisation des flux vidéo, configuration des switches et routeurs pour le trafic CCTV.', 
      description: 'Infrastructure réseau pour la vidéo',
      icon: 'pi pi-sitemap',
      value: '2'
    },
    { 
      title: 'Visualisation', 
      content: 'Clients de visualisation et supervision vidéo. Installation et paramétrage des logiciels de visualisation, configuration des murs d\'écrans et postes opérateurs.', 
      description: 'Interfaces de supervision vidéo',
      icon: 'pi pi-desktop',
      value: '3'
    }
  ];
}
