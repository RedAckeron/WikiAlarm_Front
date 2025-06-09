import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-type-materiel-add',
  template: `
    <form (ngSubmit)="submit()" class="p-fluid mb-4">
      <div class="p-field mb-3">
        <label for="name"><strong>Nom *</strong></label>
        <input pInputText id="name" [(ngModel)]="name" name="Name" placeholder="Nom du type..." class="p-inputtext-sm" required />
      </div>
      <div class="p-field mb-3">
        <label for="description"><strong>Description</strong></label>
        <input pInputText id="description" [(ngModel)]="description" name="Description" placeholder="Description..." class="p-inputtext-sm" />
      </div>
      <p-button label="Ajouter" icon="pi pi-plus" styleClass="p-button-primary" type="submit"></p-button>
    </form>
  `
})
export class TypeMaterielAddComponent {
  name = '';
  description: string | undefined = '';

  @Output() add = new EventEmitter<{ name: string; description?: string }>();

  submit() {
    if (!this.name) return;
    this.add.emit({ name: this.name, description: this.description ?? undefined });
    this.name = '';
    this.description = '';
  }
} 