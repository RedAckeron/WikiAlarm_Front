import { Component } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-intrusion',
  templateUrl: './intrusion.component.html',
  styleUrls: ['./intrusion.component.scss'],
  standalone: true,
  imports: [AccordionModule, CommonModule]
})
export class IntrusionComponent {
  tabs = [
    { title: 'Methode de travail', content: 'Content 1', value: '0' },
    { title: 'Centrale', content: 'Content 2', value: '1' },
    { title: 'Sirene', content: 'Content 3', value: '2' },
    { title: 'Détecteur', content: 'Content 4', value: '3' },
    
];
}
