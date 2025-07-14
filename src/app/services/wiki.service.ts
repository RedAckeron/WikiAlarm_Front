import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WikiService {
  private apiUrl = 'http://85.201.40.87/.api/WikiAlarm/index.php?route=WikiMarque/ListByLivre';

  constructor(private http: HttpClient) {}

  getMarquesByLivre(apiKey: string, idLivre: number): Observable<any> {
    return this.http.post<any>(this.apiUrl, { ApiKey: apiKey, IdLivre: idLivre });
  }

  getModelesByMarque(apiKey: string, idLivre: number, idMarque: number): Observable<any> {
    return this.http.post<any>(
      'http://85.201.40.87/.api/WikiAlarm/?route=WikiModel/ListByMarque',
      { ApiKey: apiKey, IdLivre: idLivre, IdMarque: idMarque }
    );
  }

  getMarquesByMetier(apiKey: string, idMetier: number): Observable<any> {
    return this.http.post<any>(
      'http://85.201.40.87/.api/WikiAlarm/?route=WikiMarque/ListByMetier',
      { ApiKey: apiKey, IdMetier: idMetier }
    );
  }

  addModele(apiKey: string, idMarque: number, modelName: string): Observable<any> {
    return this.http.post<any>(
      'http://85.201.40.87/.api/WikiAlarm/?route=WikiModel/Add',
      { ApiKey: apiKey, IdMarque: idMarque, Model: modelName }
    );
  }

  getQuestionsByModele(apiKey: string, idModele: number): Observable<any> {
    return this.http.post<any>(
      'http://85.201.40.87/.api/WikiAlarm/?route=WikiQuestion/ListByModel',
      { ApiKey: apiKey, IdModel: idModele }
    );
  }

  addQuestion(apiKey: string, idModele: number, questionText: string): Observable<any> {
    return this.http.post<any>(
      'http://85.201.40.87/.api/WikiAlarm/?route=WikiQuestion/Add',
      { ApiKey: apiKey, IdModel: idModele, Question: questionText }
    );
  }

  addResponse(apiKey: string, idQuestion: number, responseText: string): Observable<any> {
    return this.http.post<any>(
      'http://85.201.40.87/.api/WikiAlarm/?route=WikiReponse/Add',
      { ApiKey: apiKey, IdQuestion: idQuestion, Reponse: responseText }
    );
  }

  getReponseHistory(apiKey: string, idQuestion: number): Observable<any> {
    return this.http.post<any>(
      'http://85.201.40.87/.api/WikiAlarm/?route=WikiReponse/ListByQuestion',
      { ApiKey: apiKey, IdQuestion: idQuestion }
    );
  }

  updateQuestion(apiKey: string, id: number, questionText: string): Observable<any> {
    return this.http.post<any>(
      'http://85.201.40.87/.api/WikiAlarm/?route=WikiQuestion/Update',
      { ApiKey: apiKey, Id: id, Question: questionText }
    );
  }
} 