import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as Papa from 'papaparse';

@Injectable({
  providedIn: 'root'
})
export class SolicitudesCorreosService {

  private baseUrl = 'http://pruebasapi2.intranetoas.udistrital.edu.co:8117/v1/';

  constructor(private http: HttpClient) {}

  get(endpoint: string): Observable<any> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.get(url);
  }

  post(endpoint: string, element: any): Observable<any> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.post(url, element);
  }

  put(endpoint: string, element: any): Observable<any> {
    const url = `${this.baseUrl}${endpoint}`; 
    return this.http.put(url, element);
  }

  delete(endpoint: string, id: any): Observable<any> {
    const url = `${this.baseUrl}${endpoint}/${id}`;
    return this.http.delete(url);
  }

  cargarDatos(file: File): Observable<any[]> {
    return new Observable<any[]>(observer => {
      Papa.parse(file, {
        header: true,
        complete: (result: any) => {
          observer.next(result.data);
          observer.complete();
        },
        error: (error: any) => {
          observer.error(error);
        }
      });
    });
  }

  descargarDatos(data: any[]): Observable<Blob> {
    return new Observable<Blob>(observer => {
      const csvData = Papa.unparse(data);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      observer.next(blob);
      observer.complete();
    });
  }
}
