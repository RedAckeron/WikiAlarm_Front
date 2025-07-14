import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ItemService } from '../../../services/item.service';
import { HardwareTypeService, HardwareType } from '../../../services/hardwaretype.service';

@Component({
  selector: 'app-item-add',
  templateUrl: './item-add.component.html',
  providers: [MessageService]
})
export class ItemAddComponent implements OnInit {
  typesMateriel: HardwareType[] = [];
  loading = false;

  newItem: any = {
    Name: '',
    Description: '',
    IdHardwareType: null
  };

  constructor(
    private messageService: MessageService,
    private itemService: ItemService,
    private hardwareTypeService: HardwareTypeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadTypesMateriel();
  }

  loadTypesMateriel() {
    this.loading = true;
    this.hardwareTypeService.listHardwareTypes().subscribe({
      next: (types) => {
        this.typesMateriel = types;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des types:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les types de matériel'
        });
        this.loading = false;
      }
    });
  }

  saveItem() {
    if (this.newItem.Name && this.newItem.IdHardwareType) {
      const addBy = Number(sessionStorage.getItem('IdUser')) || 1;
      this.itemService.addItem({
        Name: this.newItem.Name,
        IdHardwareType: this.newItem.IdHardwareType,
        AddBy: addBy
      }).subscribe({
        next: (res) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: res.Message || 'Item ajouté avec succès'
          });
          this.router.navigate(['/admin/gestion-item']);
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: err.error?.ErrorMessage || 'Erreur lors de l\'ajout de l\'item'
          });
        }
      });
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