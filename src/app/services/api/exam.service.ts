import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable,of} from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse,Question,SubQuestion,Exam, TestContent } from "../../models/api.model";
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private apiUrl = environment.apiBaseUrl; // your Django API root

  constructor(private http: HttpClient) {}

  getExamContent(examId: number): Observable<TestContent> {
    return this.http.get<TestContent>(`${this.apiUrl}/tests/${examId}/content`);
  }

  checkExamAvailability(examId: number): Observable<boolean> {
    return this.http.get<Exam>(`${this.apiUrl}/exam/${examId}/parse`).pipe(
      map(() => true),
      catchError(()=>of(false))
    );
  }
}