import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkChapitreService } from 'src/app/services/work-chapitre.service';
import { WorkTypeService } from 'src/app/services/worktype.service';

@Component({
  selector: 'app-work',
  templateUrl: './work.component.html',
  styleUrls: ['./work.component.scss']
})
export class WorkComponent implements OnInit {
  metierName: string = '';
  chapitres: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private workChapitreService: WorkChapitreService,
    private workTypeService: WorkTypeService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.metierName = params.get('metier') || '';
      const apiKey = sessionStorage.getItem('apiKey') || '';

      this.workTypeService.getWorkTypes(apiKey).subscribe(metiers => {
        const metier = metiers.find(m => m.Name.toLowerCase() === this.metierName.toLowerCase());
        if (metier) {
          this.workChapitreService.getChapitres(apiKey, metier.Id).subscribe(res => {
            this.chapitres = res.JsonResult || [];
          });
        }
      });
    });
  }
} 