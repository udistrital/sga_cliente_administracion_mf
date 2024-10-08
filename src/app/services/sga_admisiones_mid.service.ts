import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { RequestManager } from '../managers/requestManager';

const httpOptions = {
  headers: new HttpHeaders({
    'Accept': 'application/json',
  }),
}

const path = environment.SGA_ADMISIONES_MID;

@Injectable()

export class SgaAdmisionesMid {

  constructor(private requestManager: RequestManager, private http: HttpClient) {
    this.requestManager.setPath('SGA_ADMISIONES_MID');
  }

  get(endpoint: any): any {
    this.requestManager.setPath('SGA_ADMISIONES_MID');
    return this.requestManager.get(endpoint);
  }

  post(endpoint: any, element: any) {
    this.requestManager.setPath('SGA_ADMISIONES_MID');
    return this.requestManager.post(endpoint, element);
  }

  put(endpoint: any, element: any ) {
    this.requestManager.setPath('SGA_ADMISIONES_MID');
    return this.requestManager.put(endpoint, element);
  }

  obtenerCorreosAsignados(idPeriodo: number) {
    const url = `gestion-correos/correo-sugerido?id_periodo=${idPeriodo}`;
    return this.http.get<{ correo_asignado: string, usuarioSugerido: string }>(`${path}/${url}`, httpOptions);
  }
}
