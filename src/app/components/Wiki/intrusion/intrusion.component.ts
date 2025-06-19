import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
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
  selector: 'app-intrusion',
  templateUrl: './intrusion.component.html',
  styleUrls: ['./intrusion.component.scss'],
  standalone: true,
  imports: [CommonModule, DialogModule, CardModule, ButtonModule, NgbModule]
})
export class IntrusionComponent {
  displayModal = false;
  selectedItem: WikiItem | null = null;

  tabs: WikiItem[] = [
    { 
      title: 'Méthode de travail', 
      content: 'Contenu détaillé sur les méthodes de travail...', 
      description: 'Guide des bonnes pratiques et procédures',
      icon: 'pi pi-book',
      value: '0'
    },
    { 
      title: 'Centrale', 
      content: 'Informations sur les centrales d\'alarme...', 
      description: 'Configuration et maintenance des centrales',
      icon: 'pi pi-server',
      value: '1'
    },
    { 
      title: 'Sirène', 
      content: 'Documentation sur les sirènes...', 
      description: 'Installation et paramétrage des sirènes',
      icon: 'pi pi-volume-up',
      value: '2'
    },
    { 
      title: 'Détecteur', 
      content: 'Guide sur les différents types de détecteurs...', 
      description: 'Types et configurations des détecteurs',
      icon: 'pi pi-eye',
      value: '3'
    },
    { 
      title: 'Contact', 
      content: 'Guide sur les contacts de porte et fenêtre...', 
      description: 'Installation et configuration des contacts',
      icon: 'pi pi-link',
      value: '4'
    },
    { 
      title: 'Transmetteur', 
      content: 'Documentation sur les transmetteurs...', 
      description: 'Configuration des transmetteurs d\'alarme',
      icon: 'pi pi-send',
      value: '5'
    }
  ];

  openContent(item: WikiItem): void {
    this.selectedItem = item;
    this.displayModal = true;
  }
}
