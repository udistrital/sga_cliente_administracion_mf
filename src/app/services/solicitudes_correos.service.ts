import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { RequestManager } from '../managers/requestManager';

@Injectable({
  providedIn: 'root'
})
export class SolicitudesCorreosService {

  constructor(private requestManager: RequestManager) {
    this.requestManager.setPath('SOLICITUDES_ADMINISTRACION');
  }

  get(endpoint:string) {
    this.requestManager.setPath('SOLICITUDES_ADMINISTRACION');
    return this.requestManager.get(endpoint);
  }

  post(endpoint:string, element:any) {
    this.requestManager.setPath('SOLICITUDES_ADMINISTRACION');
    return this.requestManager.post(endpoint, element);
  }

  put(endpoint:string, element:any) {
    this.requestManager.setPath('SOLICITUDES_ADMINISTRACION');
    return this.requestManager.put(endpoint, element);
  }

  delete(endpoint:string, element:any) {
    this.requestManager.setPath('SOLICITUDES_ADMINISTRACION');
    return this.requestManager.delete(endpoint, element.Id);
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
