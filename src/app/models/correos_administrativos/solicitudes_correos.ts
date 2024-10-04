import { ListadoCorreos } from "./listado_correos";

export class SolicitudesCorreos {
    Id!: number;
    procesoAdminicion!: string;
    fecha!: Date;
    estado!: boolean;
    gestion!: ListadoCorreos;
}
