import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendrierComponent } from './calendrier.component';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@NgModule({
  declarations: [
    CalendrierComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CalendarModule,
    ToastModule,
    ProgressSpinnerModule
  ],
  exports: [
    CalendrierComponent
  ],
  providers: [
    MessageService
  ]
})
export class CalendrierModule { } 