import { Injectable } from '@angular/core';
import { RequestManager } from '../managers/requestManager';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import * as Papa from 'papaparse';

@Injectable()
export class SolicitudesCorreosService {

    constructor(private requestManager: RequestManager, private http: HttpClient) {
        this.requestManager.setPath('SOLICITUDES_ADMINISTRACION');
    }

    get(endpoint: string) {
        this.requestManager.setPath('SOLICITUDES_ADMINISTRACION');
        return this.requestManager.get(endpoint);
    }

    post(endpoint: any, element: any) {
        this.requestManager.setPath('SOLICITUDES_ADMINISTRACION');
        return this.requestManager.post(endpoint, element);
    }

    put(endpoint: any, element: any) {
        this.requestManager.setPath('SOLICITUDES_ADMINISTRACION');
        return this.requestManager.put(endpoint, element);
    }

    delete(endpoint: any, element: { Id: any; }) {
        this.requestManager.setPath('SOLICITUDES_ADMINISTRACION');
        return this.requestManager.delete(endpoint, element.Id);
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

    descargarDatos(data: any[]): Observable<Blob> {
        return new Observable<Blob>(observer => {
            const csvData = Papa.unparse(data);
            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            observer.next(blob);
            observer.complete();
        });
    }
}

