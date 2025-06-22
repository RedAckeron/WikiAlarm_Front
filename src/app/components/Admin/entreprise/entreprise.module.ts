import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG modules
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

// Components
import { EntrepriseComponent } from './entreprise.component';

@NgModule({
  declarations: [
    EntrepriseComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: '', component: EntrepriseComponent }
    ]),
    
    // PrimeNG
    ButtonModule,
    CardModule,
    DialogModule,
    InputTextModule,
    InputTextareaModule,
    ToastModule,
    TooltipModule,
    ConfirmDialogModule
  ],
  providers: []
})
export class EntrepriseModule { } 