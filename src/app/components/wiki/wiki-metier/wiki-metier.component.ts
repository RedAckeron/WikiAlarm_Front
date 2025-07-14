import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkChapitreService } from 'src/app/services/work-chapitre.service';
import { WorkTypeService } from 'src/app/services/worktype.service';
import { WikiService } from 'src/app/services/wiki.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-wiki-metier',
  templateUrl: './wiki-metier.component.html',
  styleUrls: ['./wiki-metier.component.scss']
})
export class WikiMetierComponent implements OnInit {
  idWork = 0;
  metierName = '';
  chapitres: any[] = [];
  showDialog: boolean = false;
  newChapterName: string = '';
  marques: any[] = [];
  newMarqueName: string = '';

  constructor(
    private route: ActivatedRoute,
    private workChapitreService: WorkChapitreService,
    private workTypeService: WorkTypeService,
    private wikiService: WikiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.idWork = Number(params.get('idWork'));
      const apiKey = sessionStorage.getItem('apiKey') || '';
      this.workTypeService.getWorkTypes(apiKey).subscribe(metiers => {
        console.log('Métiers reçus:', metiers, 'ID recherché:', this.idWork);
        const metier = metiers.find(m => String(m.Id) === String(this.idWork));
        console.log('Métier trouvé:', metier);
        this.metierName = metier ? metier.Name : `Métier ${this.idWork}`;
        if (metier) {
          this.loadMarques();
          this.workChapitreService.getChapitres(apiKey, metier.Id).subscribe(res => {
            this.chapitres = res.JsonResult || [];
          });
        } else {
          this.marques = [];
        }
      });
    });
  }

  loadMarques() {
    console.log('Début de loadMarques() pour le métier ID:', this.idWork);
    const apiKey = sessionStorage.getItem('apiKey') || '';
    this.wikiService.getMarquesByMetier(apiKey, this.idWork).subscribe(
      res => {
        console.log('Réponse API reçue:', res);
        if (res.Status === 200) {
          this.marques = res.JsonResult;
          console.log('Marques reçues pour le métier', this.idWork, ':', this.marques);
        } else {
          this.marques = [];
          console.warn('Aucune marque reçue pour le métier', this.idWork, 'Status:', res.Status);
        }
      },
      error => {
        console.error('Erreur lors de la récupération des marques:', error);
        this.marques = [];
      }
    );
  }

  addMarque() {
    if (!this.newMarqueName.trim()) return;
    const apiKey = sessionStorage.getItem('apiKey') || '';
    this.workChapitreService.addMarque(apiKey, this.newMarqueName, this.idWork).subscribe(res => {
      if (res.Status === 200) {
        this.loadMarques();
        this.newMarqueName = '';
      }
    });
  }

  addChapter() {
    if (this.newChapterName.trim()) {
      this.chapitres.push({ Name: this.newChapterName });
      this.newChapterName = '';
      this.showDialog = false;
    }
  }
} 