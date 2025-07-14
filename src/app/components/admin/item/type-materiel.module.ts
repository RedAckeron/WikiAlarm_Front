import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TypeMaterielComponent } from './type-materiel.component';
import { TypeMaterielAddComponent } from './type-materiel-add.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';

@NgModule({
  declarations: [TypeMaterielComponent, TypeMaterielAddComponent],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    ToastModule,
    InputTextModule
  ],
  exports: [TypeMaterielComponent, TypeMaterielAddComponent]
})
export class TypeMaterielModule {} 