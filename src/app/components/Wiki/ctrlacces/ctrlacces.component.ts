import { Component } from '@angular/core';

@Component({
  selector: 'app-ctrlacces',
  templateUrl: './ctrlacces.component.html',
  styleUrls: ['./ctrlacces.component.scss']
})
export class CtrlaccesComponent {
  tabs = [
    { title: 'Lecteurs de badge', content: 'Installation et configuration des lecteurs RFID et codes', value: '0' },
    { title: 'Centrales d\'accès', content: 'Programmation et gestion des centrales de contrôle d\'accès', value: '1' },
    { title: 'Gestion des droits', content: 'Attribution et modification des droits d\'accès utilisateurs', value: '2' },
    { title: 'Supervision', content: 'Monitoring et logs des accès en temps réel', value: '3' }
  ];
}
