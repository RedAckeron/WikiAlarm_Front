import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DialogModule } from 'primeng/dialog';
import { WikiMetierComponent } from './wiki-metier/wiki-metier.component';
import { WikiMarqueComponent } from './wiki-marque/wiki-marque.component';
import { WikiModeleComponent } from './wiki-modele/wiki-modele.component';
import { WikiQuestionComponent } from './wiki-question/wiki-question.component';
import { WikiReponseComponent } from './wiki-reponse/wiki-reponse.component';
import { NewlineToBrPipe } from './wiki-question/newline-to-br.pipe';

const routes: Routes = [
  { path: 'metier/:idWork', component: WikiMetierComponent },
  { path: 'metier/:idWork/marque/:idMarque', component: WikiModeleComponent },
  { path: 'metier/:idWork/marque/:idMarque/modele/:idModele', component: WikiQuestionComponent },
  { path: 'metier/:idWork/marque/:idMarque/modele/:idModele/question/:idQuestion', component: WikiReponseComponent }
];

@NgModule({
  declarations: [
    WikiMetierComponent,
    WikiMarqueComponent,
    WikiModeleComponent,
    WikiQuestionComponent,
    WikiReponseComponent,
    NewlineToBrPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    AccordionModule,
    InputTextareaModule,
    DialogModule,
    RouterModule.forChild(routes)
  ]
})
export class WikiModule {} 