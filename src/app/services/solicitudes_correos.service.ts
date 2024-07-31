import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
        complete: (result) => {
          observer.next(result.data);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  descargarDatos(data: any[], chunkSize: number = 20): Observable<void> {
    return new Observable<void>(observer => {
      const workbook = XLSX.utils.book_new();

      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        const worksheet = XLSX.utils.json_to_sheet(chunk);
        XLSX.utils.book_append_sheet(workbook, worksheet, `Sheet${Math.floor(i / chunkSize) + 1}`);
      }

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, 'solicitudes_correos.xlsx');

      observer.next();
      observer.complete();
    });
  }
}
