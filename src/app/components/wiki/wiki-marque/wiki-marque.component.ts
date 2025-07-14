import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WikiService } from 'src/app/services/wiki.service';
import { WorkTypeService } from 'src/app/services/worktype.service';

@Component({
  selector: 'app-wiki-marque',
  templateUrl: './wiki-marque.component.html',
  styleUrls: ['./wiki-marque.component.scss']
})
export class WikiMarqueComponent implements OnInit {
  metierName = '';
  marqueId = 0;
  idWork = 0;
  modeles: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private wikiService: WikiService,
    private workTypeService: WorkTypeService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.metierName = params.get('metier') || '';
      this.marqueId = Number(params.get('marqueId'));
      const apiKey = sessionStorage.getItem('apiKey') || '';
      this.workTypeService.getWorkTypes(apiKey).subscribe(metiers => {
        const metier = metiers.find(m => m.Name.toLowerCase() === this.metierName.toLowerCase());
        if (metier) {
          this.idWork = metier.Id;
          this.loadModeles();
        }
      });
    });
  }

  loadModeles() {
    const apiKey = sessionStorage.getItem('apiKey') || '';
    this.wikiService.getModelesByMarque(apiKey, this.idWork, this.marqueId).subscribe(res => {
      if (res.Status === 200) {
        this.modeles = res.JsonResult;
      } else {
        this.modeles = [];
      }
    });
  }
} 