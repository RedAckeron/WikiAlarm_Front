import { Component } from '@angular/core';

@Component({
  selector: 'app-incendie',
  templateUrl: './incendie.component.html',
  styleUrls: ['./incendie.component.scss']
})
export class IncendieComponent {
  tabs = [
    { title: 'Détection incendie', content: 'Guides sur les systèmes de détection de fumée et de chaleur', value: '0' },
    { title: 'Centrales incendie', content: 'Configuration et maintenance des centrales d\'alarme incendie', value: '1' },
    { title: 'Dispositifs d\'alerte', content: 'Sirènes, flashs et dispositifs sonores d\'évacuation', value: '2' },
    { title: 'Évacuation', content: 'Procédures et équipements d\'évacuation d\'urgence', value: '3' }
  ];
}
