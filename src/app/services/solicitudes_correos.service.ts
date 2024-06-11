import { Injectable } from '@angular/core';
import { RequestManager } from '../managers/requestManager';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';


@Injectable()
export class SolicitudesCorreosService {

    constructor(private requestManager: RequestManager, private http: HttpClient) {
        this.requestManager.setPath('SOLICITUDES_CORREOS_SERVICE');
    }

    get(endpoint: string) {
        this.requestManager.setPath('SOLICITUDES_CORREOS_SERVICE');
        return this.requestManager.get(endpoint);
    }

    post(endpoint: any, element: any) {
        this.requestManager.setPath('SOLICITUDES_CORREOS_SERVICE');
        return this.requestManager.post(endpoint, element);
    }

    put(endpoint: any, element: any) {
        this.requestManager.setPath('SOLICITUDES_CORREOS_SERVICE');
        return this.requestManager.put(endpoint, element);
    }

    delete(endpoint: any, element: { Id: any; }) {
        this.requestManager.setPath('SOLICITUDES_CORREOS_SERVICE');
        return this.requestManager.delete(endpoint, element.Id);
    }

    cargarDatos(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post('/api/upload-csv', formData).pipe(
            map(response => {
                return response;
            })
        );
    }
    
    descargarDatos(): Observable<Blob> {
        return this.http.get('/api/download-csv', { responseType: 'blob' }).pipe(
            map(response => {
                return response;
            })
        );
    }
}

