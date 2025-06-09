import { Component } from '@angular/core';

@Component({
  selector: 'app-cctv',
  templateUrl: './cctv.component.html',
  styleUrls: ['./cctv.component.scss']
})
export class CctvComponent {
  tabs = [
    { title: 'Caméras IP', content: 'Installation et configuration des caméras de surveillance IP', value: '0' },
    { title: 'Enregistreurs', content: 'Configuration des NVR/DVR et systèmes d\'enregistrement', value: '1' },
    { title: 'Réseau vidéo', content: 'Architecture réseau et bande passante pour la vidéosurveillance', value: '2' },
    { title: 'Visualisation', content: 'Clients de visualisation et supervision vidéo', value: '3' }
  ];
}
