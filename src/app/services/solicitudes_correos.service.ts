import { Injectable } from '@angular/core';
import { RequestManager } from '../managers/requestManager'; 

@Injectable()
export class SolicitudesCorreosService {

    constructor(private requestManager: RequestManager) {
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
}
