import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WikiService } from 'src/app/services/wiki.service';
import { WorkTypeService } from 'src/app/services/worktype.service';

@Component({
  selector: 'app-wiki-question',
  templateUrl: './wiki-question.component.html',
  styleUrls: ['./wiki-question.component.scss']
})
export class WikiQuestionComponent implements OnInit {
  idWork = 0;
  idMarque = 0;
  idModele = 0;
  metierName = '';
  marqueName = '';
  modeleName = '';
  questions: any[] = [];
  newQuestionText: string = '';
  editingResponse: { [key: number]: boolean } = {};
  editedResponses: { [key: number]: string } = {};
  historiqueDialogVisible: boolean = false;
  historiqueReponses: any[] = [];
  historiqueQuestion: any = null;
  isAdmin: boolean = false;
  editQuestionDialogVisible: boolean = false;
  questionToEdit: any = null;
  editedQuestionText: string = '';

  constructor(
    private route: ActivatedRoute,
    private wikiService: WikiService,
    private workTypeService: WorkTypeService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.idWork = Number(params.get('idWork'));
      this.idMarque = Number(params.get('idMarque'));
      this.idModele = Number(params.get('idModele'));
      console.log('IDs récupérés - Métier:', this.idWork, 'Marque:', this.idMarque, 'Modèle:', this.idModele);
      
      // Charger directement les questions
      this.loadQuestions();
      
      // Récupérer le nom du modèle
      const apiKey = sessionStorage.getItem('apiKey') || '';
      this.wikiService.getModelesByMarque(apiKey, this.idWork, this.idMarque).subscribe(res => {
        if (res.Status === 200 && Array.isArray(res.JsonResult)) {
          const modele = res.JsonResult.find((m: any) => String(m.Id) === String(this.idModele));
          console.log('Modèles reçus:', res.JsonResult, 'ID recherché:', this.idModele, 'Modèle trouvé:', modele);
          this.modeleName = modele ? modele.Model || modele.Name || modele.nom : `Modèle ${this.idModele}`;
        } else {
          this.modeleName = `Modèle ${this.idModele}`;
        }
      });
      
      // Récupérer le nom de la marque
      this.wikiService.getMarquesByMetier(apiKey, this.idWork).subscribe(res => {
        if (res.Status === 200 && Array.isArray(res.JsonResult)) {
          const marque = res.JsonResult.find((m: any) => String(m.Id) === String(this.idMarque));
          console.log('Marques reçues:', res.JsonResult, 'ID recherché:', this.idMarque, 'Marque trouvée:', marque);
          this.marqueName = marque ? marque.Marque || marque.Name || marque.nom : '';
        } else {
          this.marqueName = '';
        }
      });
      
      // Optionnel : récupérer le nom du métier pour d'autres usages
      this.workTypeService.getWorkTypes(apiKey).subscribe(
        metiers => {
          const metier = metiers.find((m: any) => String(m.Id) === String(this.idWork));
          this.metierName = metier ? metier.Name : `Métier ${this.idWork}`;
        },
        error => {
          this.metierName = `Métier ${this.idWork}`;
        }
      );
    });
    // Détection admin via UserRole
    const role = sessionStorage.getItem('userRole');
    this.isAdmin = role === 'Admin';
    console.log('userRole:', role, 'isAdmin:', this.isAdmin);
  }

  loadQuestions() {
    console.log('Début de loadQuestions() pour le modèle ID:', this.idModele);
    const apiKey = sessionStorage.getItem('apiKey') || '';
    this.wikiService.getQuestionsByModele(apiKey, this.idModele).subscribe(
      res => {
        console.log('Réponse API questions reçue:', res);
        if (res.Status === 200) {
          this.questions = res.JsonResult;
          console.log('Questions reçues pour le modèle', this.idModele, ':', this.questions);
        } else {
          this.questions = [];
          console.warn('Aucune question reçue pour le modèle', this.idModele, 'Status:', res.Status);
        }
      },
      error => {
        console.error('Erreur lors de la récupération des questions:', error);
        this.questions = [];
      }
    );
  }

  addQuestion() {
    if (!this.newQuestionText.trim()) return;
    const apiKey = sessionStorage.getItem('apiKey') || '';
    console.log('Ajout de la question:', this.newQuestionText, 'pour le modèle ID:', this.idModele);
    
    this.wikiService.addQuestion(apiKey, this.idModele, this.newQuestionText).subscribe(
      res => {
        console.log('Réponse ajout question:', res);
        if (res.Status === 201) {
          console.log('Question ajoutée avec succès');
          this.loadQuestions(); // Recharger la liste des questions
          this.newQuestionText = ''; // Vider le champ
        } else {
          console.warn('Erreur lors de l\'ajout de la question, Status:', res.Status);
        }
      },
      error => {
        console.error('Erreur lors de l\'ajout de la question:', error);
      }
    );
  }

  startEditingResponse(questionId: number, currentResponse: any) {
    this.editingResponse[questionId] = true;
    let value = '';
    if (Array.isArray(currentResponse)) {
      if (currentResponse.length > 0) {
        value = currentResponse[currentResponse.length - 1].Reponse || currentResponse[currentResponse.length - 1].Response || '';
      }
    } else if (typeof currentResponse === 'object' && currentResponse !== null) {
      value = currentResponse.Reponse || currentResponse.Response || '';
    } else if (typeof currentResponse === 'string') {
      value = currentResponse;
    }
    this.editedResponses[questionId] = value;
  }

  cancelEditingResponse(questionId: number) {
    this.editingResponse[questionId] = false;
    delete this.editedResponses[questionId];
  }

  saveResponse(questionId: number) {
    const newResponse = this.editedResponses[questionId];
    if (!newResponse || !newResponse.trim()) return;
    
    const apiKey = sessionStorage.getItem('apiKey') || '';
    console.log('Sauvegarde de la réponse pour la question ID:', questionId, 'Réponse:', newResponse);
    
    this.wikiService.addResponse(apiKey, questionId, newResponse).subscribe(
      res => {
        console.log('Réponse sauvegardée:', res);
        if (res.Status === 200 || res.Status === 201) {
          this.editingResponse[questionId] = false;
          delete this.editedResponses[questionId];
          this.loadQuestions(); // Recharger pour voir les modifications
        } else {
          console.warn('Erreur lors de la sauvegarde, Status:', res.Status);
        }
      },
      error => {
        console.error('Erreur lors de la sauvegarde de la réponse:', error);
      }
    );
  }

  openHistorique(question: any) {
    this.historiqueDialogVisible = true;
    this.historiqueQuestion = question;
    const apiKey = sessionStorage.getItem('apiKey') || '';
    this.wikiService.getReponseHistory(apiKey, question.Id).subscribe(
      res => {
        if (res.Status === 200) {
          this.historiqueReponses = res.JsonResult;
        } else {
          this.historiqueReponses = [];
        }
      },
      error => {
        this.historiqueReponses = [];
      }
    );
  }

  closeHistorique() {
    this.historiqueDialogVisible = false;
    this.historiqueReponses = [];
    this.historiqueQuestion = null;
  }

  getLastReponse(question: any): string | null {
    const rep = question.Reponse || question.Response;
    if (!rep) return null;
    if (Array.isArray(rep)) {
      if (rep.length === 0) return null;
      // On prend la dernière réponse du tableau
      return rep[rep.length - 1].Reponse || rep[rep.length - 1].Response || null;
    }
    if (typeof rep === 'string') return rep;
    if (typeof rep === 'object' && (rep.Reponse || rep.Response)) return rep.Reponse || rep.Response;
    return null;
  }

  openEditQuestionDialog(question: any) {
    this.questionToEdit = question;
    this.editedQuestionText = question.Question;
    this.editQuestionDialogVisible = true;
  }

  closeEditQuestionDialog() {
    this.editQuestionDialogVisible = false;
    this.questionToEdit = null;
    this.editedQuestionText = '';
  }

  saveEditedQuestion() {
    if (!this.questionToEdit || !this.editedQuestionText.trim()) return;
    const apiKey = sessionStorage.getItem('apiKey') || '';
    this.wikiService.updateQuestion(apiKey, this.questionToEdit.Id, this.editedQuestionText).subscribe(
      res => {
        if (res.Status === 200) {
          this.closeEditQuestionDialog();
          this.loadQuestions();
        }
      }
    );
  }

  get sessionStorageUserRole(): string | null {
    return sessionStorage.getItem('userRole');
  }
} 