import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ItemService } from '../../../services/item.service';

@Component({
  selector: 'app-item-add',
  templateUrl: './item-add.component.html',
  providers: [MessageService]
})
export class ItemAddComponent {
  metiers: any[] = [
    { label: '📡 Intrusion', value: 'intrusion' },
    { label: '🔥 Incendie', value: 'incendie' },
    { label: '🔐 Contrôle d\'accès', value: 'controle-acces' },
    { label: '📹 CCTV', value: 'cctv' }
  ];
  allTypesMateriel: any[] = [
    { label: 'Caméra', value: 'camera', metier: 'cctv' },
    { label: 'Centrale', value: 'centrale', metier: 'intrusion' },
    { label: 'Badgeuse', value: 'badgeuse', metier: 'controle-acces' },
    { label: 'Détecteur', value: 'detecteur', metier: 'incendie' },
    { label: 'Sirène', value: 'sirene', metier: 'intrusion' },
    { label: 'Clavier', value: 'clavier', metier: 'intrusion' },
    { label: 'Détecteur fumée', value: 'detecteur-fumee', metier: 'incendie' },
  ];
  typesMateriel: any[] = [];

  newItem: any = {
    Name: '',
    Description: '',
    metier: '',
    IdHardwareType: null,
    IdWorkList: null
  };

  constructor(
    private messageService: MessageService,
    private itemService: ItemService,
    private router: Router
  ) {}

  onMetierChange() {
    this.typesMateriel = this.allTypesMateriel.filter(type => type.metier === this.newItem.metier);
    this.newItem.IdHardwareType = null;
  }

  saveItem() {
    if (this.newItem.Name && this.newItem.metier) {
      // TODO: Appel API pour créer l'item
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Item ajouté avec succès'
      });
      this.router.navigate(['/admin/item']);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Veuillez remplir tous les champs obligatoires'
      });
    }
  }

  cancelAdd() {
    this.router.navigate(['/admin/item']);
  }
} 