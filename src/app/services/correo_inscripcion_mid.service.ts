
import { Injectable } from '@angular/core';
import { RequestManager } from '../managers/requestManager';

@Injectable()
export class CorreoInscripcionMidService {

    constructor(private requestManager: RequestManager) {
        this.requestManager.setPath('TERCEROS_MID'); 
    }

    get(endpoint: string) {
        this.requestManager.setPath('TERCEROS_MID');
        return this.requestManager.get(endpoint);
    }

    post(endpoint: string, element: any) {
        this.requestManager.setPath('TERCEROS_MID');
        return this.requestManager.post(endpoint, element);
    }

    put(endpoint: string, id: any, element: any) {
        this.requestManager.setPath('TERCEROS_MID');
        return this.requestManager.put(`${endpoint}/${id}`, element);
    }

    delete(endpoint: string, id: any) {
        this.requestManager.setPath('TERCEROS_MID');
        return this.requestManager.delete(endpoint, id);
    }
}
