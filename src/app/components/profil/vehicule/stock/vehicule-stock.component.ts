import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-vehicule-stock',
  template: `
    <div class="card">
      <div class="card-header">
        <h5>Stock du véhicule</h5>
      </div>
      <div class="card-body">
        <p>Affichage du stock pour le véhicule ID : {{ vehiculeId }}</p>
        <!-- Ici tu pourras afficher la liste réelle du stock -->
      </div>
    </div>
  `
})
export class VehiculeStockComponent implements OnInit {
  vehiculeId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.vehiculeId = this.route.snapshot.paramMap.get('id');
  }
} 