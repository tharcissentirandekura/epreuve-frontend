import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse,Question,SubQuestion,Exam } from "../../models/api.model";
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private apiUrl = environment.apiBaseUrl; // your Django API root

  constructor(private http: HttpClient) {}

  getExamContent(examId: number): Observable<Exam> {
    return this.http.get<Exam>(`${this.apiUrl}/exam/${examId}/parse/`);
  }
}