import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ItemComponent } from './item.component';
import { ItemAddComponent } from './item-add.component';

@NgModule({
  declarations: [
    ItemComponent,
    ItemAddComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    ButtonModule,
    ToastModule,
    InputTextModule,
    InputTextareaModule,
    TableModule,
    TagModule,
    DialogModule
  ],
  exports: [
    ItemComponent,
    ItemAddComponent
  ]
})
export class ItemModule { } 