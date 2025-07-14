import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WikiService } from 'src/app/services/wiki.service';
import { WorkTypeService } from 'src/app/services/worktype.service';

@Component({
  selector: 'app-wiki-modele',
  templateUrl: './wiki-modele.component.html',
  styleUrls: ['./wiki-modele.component.scss']
})
export class WikiModeleComponent implements OnInit {
  idWork = 0;
  idMarque = 0;
  metierName = '';
  marqueName = '';
  modeles: any[] = [];
  newModeleName: string = '';

  constructor(
    private route: ActivatedRoute,
    private wikiService: WikiService,
    private workTypeService: WorkTypeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.idWork = Number(params.get('idWork'));
      this.idMarque = Number(params.get('idMarque'));
      console.log('ID du métier:', this.idWork, 'ID de la marque:', this.idMarque);
      
      // Charger directement les modèles
      this.loadModeles();
      
      // Récupérer le nom de la marque
      const apiKey = sessionStorage.getItem('apiKey') || '';
      this.wikiService.getMarquesByMetier(apiKey, this.idWork).subscribe(res => {
        console.log('Réponse API getMarquesByMetier:', res);
        if (res.Status === 200 && Array.isArray(res.JsonResult)) {
          console.log('Liste des marques:', res.JsonResult, 'ID recherché:', this.idMarque);
          const marque = res.JsonResult.find((m: any) => String(m.Id) === String(this.idMarque));
          console.log('Marque trouvée:', marque);
          this.marqueName = marque ? marque.Marque || marque.Name || marque.nom : `Marque ${this.idMarque}`;
        } else {
          this.marqueName = `Marque ${this.idMarque}`;
        }
      });
      
      // Optionnel : récupérer le nom du métier pour d'autres usages
      this.workTypeService.getWorkTypes(apiKey).subscribe(
        metiers => {
          const metier = metiers.find(m => String(m.Id) === String(this.idWork));
          this.metierName = metier ? metier.Name : `Métier ${this.idWork}`;
        },
        error => {
          this.metierName = `Métier ${this.idWork}`;
        }
      );
    });
  }

  loadModeles() {
    console.log('Début de loadModeles() pour la marque ID:', this.idMarque);
    const apiKey = sessionStorage.getItem('apiKey') || '';
    this.wikiService.getModelesByMarque(apiKey, this.idWork, this.idMarque).subscribe(
      res => {
        console.log('Réponse API modèles reçue:', res);
        if (res.Status === 200) {
          this.modeles = res.JsonResult;
          console.log('Modèles reçus pour la marque', this.idMarque, ':', this.modeles);
        } else {
          this.modeles = [];
          console.warn('Aucun modèle reçu pour la marque', this.idMarque, 'Status:', res.Status);
        }
      },
      error => {
        console.error('Erreur lors de la récupération des modèles:', error);
        this.modeles = [];
      }
    );
  }

  addModele() {
    if (!this.newModeleName.trim()) return;
    const apiKey = sessionStorage.getItem('apiKey') || '';
    console.log('Ajout du modèle:', this.newModeleName, 'pour la marque ID:', this.idMarque);
    
    this.wikiService.addModele(apiKey, this.idMarque, this.newModeleName).subscribe(
      res => {
        console.log('Réponse ajout modèle:', res);
        if (res.Status === 201) {
          console.log('Modèle ajouté avec succès, ID:', res.JsonResult.Id);
          this.loadModeles(); // Recharger la liste des modèles
          this.newModeleName = ''; // Vider le champ
        } else {
          console.warn('Erreur lors de l\'ajout du modèle, Status:', res.Status);
        }
      },
      error => {
        console.error('Erreur lors de l\'ajout du modèle:', error);
      }
    );
  }
} 