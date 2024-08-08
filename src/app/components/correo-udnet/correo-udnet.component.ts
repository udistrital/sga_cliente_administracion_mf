import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SolicitudesCorreosService } from '../../services/solicitudes_correos.service';
import { PopUpManager } from '../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { CorreoInscripcionMidService } from '../../services/correo_inscripcion_mid.service';
import { SgaAdmisionesMid } from '../../services/sga_admisiones_mid.service';
import { InscripcionService } from '../../services/inscripcion.service';
import { OikosService } from '../../services/oikos.service';
import { TercerosService } from '../../services/terceros.service';
import { forkJoin, of } from 'rxjs';
import { mergeMap, map, switchMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
/* import { SgaMidService } from '../../services/sga_mid.service'; */

interface Element {
  facultad: string;
  codigo: string;
  numeroDocumento: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  correoPersonal: string;
  telefono: string;
  usuarioAsignado: string;
  correoAsignado: string;
}

interface Observacion {
  tipoObservacion: string;
  nombres: string;
  apellidos: string;
  cuerpoObservacion: string;
  fecha: Date;
}

@Component({
  selector: 'udistrital-correo-udnet',
  templateUrl: './correo-udnet.component.html',
  styleUrls: ['./correo-udnet.component.scss']
})
export class CorreoUdnetComponent implements OnInit {
  mostrarTabla1: boolean = true;
  displayedColumns: string[] = ['#', 'procesoAdminicion', 'fecha', 'estado', 'gestion'];
  displayedColumns2: string[] = ['facultad', 'codigo', 'numeroDocumento', 'primerNombre', 'segundoNombre', 'primerApellido', 'segundoApellido', 'correoPersonal', 'telefono', 'usuarioAsignado', 'correoAsignado'];

  dataSource!: MatTableDataSource<any>;
  dataSource2!: MatTableDataSource<Element>;

  selectedSolicitudId!: number;
  observaciones: Observacion[] = []; // Arreglo para almacenar las observaciones
  observacionForm!: FormGroup; // Formulario para la observación
  mostrarFormulario: boolean = true; // Propiedad para controlar la visibilidad del formulario

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('paginator2') paginator2!: MatPaginator;

  loading!: boolean;
  periodo!: any;

  constructor(
    private solicitudesCorreosService: SolicitudesCorreosService,
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private fb: FormBuilder,
    private correoInscripcionMidService: CorreoInscripcionMidService,
    private sgaAdmisionesMid: SgaAdmisionesMid,
    private inscripcionService: InscripcionService,
    private oikosService: OikosService,
    private terceroService: TercerosService,
    /* private sgamidService: SgaMidService, */
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  initForm(): void {
    this.observacionForm = this.fb.group({
      tipoObservacion: ['', Validators.required],
      nombreRemitente: this.fb.group({
        nombres: ['', Validators.required],
        apellidos: ['', Validators.required]
      }),
      cuerpoObservacion: ['', Validators.required]
    });
  }

  loadData(): void {
    this.solicitudesCorreosService.get('solicitud?query=EstadoTipoSolicitudId.TipoSolicitud.Id:40,Activo:true,Id__gt:48578&limit=0').subscribe(res => {
      if (res !== null) {
        const data = <Array<any>>res;
        const formattedData = data.map(item => ({
          id: item.Id,
          procesoAdminicion: item.EstadoTipoSolicitudId.TipoSolicitud.Nombre,
          fecha: this.formatDate(item.FechaRadicacion),
          estado: item.EstadoTipoSolicitudId.EstadoId.Nombre,
          referencia: JSON.parse(item.Referencia),
          estadoStyle: this.getEstadoStyle(item.EstadoTipoSolicitudId.EstadoId.Id)
        }));
  
        formattedData.sort((a, b) => {
          if (a.estado === 'Radicado' && b.estado !== 'Radicado') {
            return -1;
          } else if (a.estado !== 'Radicado' && b.estado === 'Radicado') {
            return 1;
          } else {
            const dateA = new Date(a.fecha);
            const dateB = new Date(b.fecha);
            return dateB.getTime() - dateA.getTime();
          }
        });
  
        this.dataSource = new MatTableDataSource(formattedData);
        this.dataSource.paginator = this.paginator;
      }
    });
  }
  
  getEstadoStyle(EstadoId: number): { color: string } {
    switch (EstadoId) {
      case 105:
        return { color: 'var(--success-accent)' };
      case 100:
        return { color: 'var(--danger-base)' };
      default:
        return { color: 'black'};
    }
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }





/*   cargarDatosTabla2(periodo: number, opcion: number): void {
    this.sgaAdmisionesMid.get('gestion-correos/correo-sugerido?id_periodo='+periodo+'&opcion='+opcion).subscribe((response: any) => {

      this.dataSource2 = new MatTableDataSource(response.Data);
      this.dataSource2.paginator = this.paginator2;
      
    });
  } */


  async listarAspirantes() {
    this.loading = true;
    let aspirantesOficializados: any[] = [];
    let aspirantesNoOficializados: any[] = [];
    const facultades: any = await this.cargarFacultades();
    for (const facultad of facultades) {
      const proyectos = facultad.Opciones;
      for (const proyecto of proyectos) {
        const inscripcionesMatriculadas: any = await this.recuperarInscripciones(11, this.periodo, proyecto.Id);
        if (Object.keys(inscripcionesMatriculadas[0]).length != 0) {
          for (const inscripcion of inscripcionesMatriculadas) {
            const persona: any = await this.consultarTercero(inscripcion.PersonaId);
            const itemBody = {
              facultad: facultad.Nombre,
              proyecto: proyecto.Nombre,
              codigo: inscripcion.Id,
              documento: persona.NumeroIdentificacion,
              nombre: `${persona.PrimerNombre} ${persona.SegundoNombre}`,
              apellido: `${persona.PrimerApellido} ${persona.SegundoApellido}`,
              correopersonal: persona.UsuarioWSO2,
              telefono: persona.Telefono,
              correoSugerido: `${persona.PrimerNombre}${persona.SegundoNombre}${persona.PrimerApellido}${persona.SegundoApellido}@udistrital.edu.co`,
              correoAsignado: persona.UsuarioWSO2
            }
            aspirantesOficializados.push(itemBody);
          }
        }

        const inscripcionesNoOficializadas: any = await this.recuperarInscripciones(12, this.periodo, proyecto.Id);
        if (Object.keys(inscripcionesNoOficializadas[0]).length != 0) {
          for (const inscripcion of inscripcionesNoOficializadas) {
            const persona: any = await this.consultarTercero(inscripcion.PersonaId);
            const itemBody = {
              facultad: facultad.Nombre,
              proyecto: proyecto.Nombre,
              codigo: inscripcion.Id,
              documento: persona.NumeroIdentificacion,
              nombre: `${persona.PrimerNombre} ${persona.SegundoNombre}`,
              apellido: `${persona.PrimerApellido} ${persona.SegundoApellido}`,
              correopersonal: persona.UsuarioWSO2,
              telefono: persona.Telefono,
              correoSugerido: `${persona.PrimerNombre}${persona.SegundoNombre}${persona.PrimerApellido}${persona.SegundoApellido}@udistrital.edu.co`,
              correoAsignado: persona.UsuarioWSO2
            }
            aspirantesNoOficializados.push(itemBody);
          }
        }
      }
    }

    if (aspirantesOficializados.length > 0) {
      this.dataSource2 = new MatTableDataSource(aspirantesOficializados);
      this.dataSource2.paginator = this.paginator2;
    } else {
      this.popUpManager.showAlert(this.translate.instant('admision.titulo_aspirantes_no_encontrados'), this.translate.instant('admision.aspirantes_oficializados_no_encontrados'));
    }

    if (aspirantesNoOficializados.length > 0) {
      this.dataSource2 = new MatTableDataSource(aspirantesNoOficializados);
      this.dataSource2.paginator = this.paginator2;
    } else {
      this.popUpManager.showAlert(this.translate.instant('admision.titulo_aspirantes_no_encontrados'), this.translate.instant('admision.aspirantes_no_oficializados_no_encontrados'));
    }

    this.loading = false;
  }

  cargarFacultades() {
    return new Promise((resolve, reject) => {
      this.oikosService.get('dependencia_padre/FacultadesConProyectos?Activo:true&limit=0')
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            console.error(error);
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('admision.facultades_error'));
            reject(false);
          });
    });
  }

  recuperarInscripciones(idEstadoFormacion: any, periodo: any, programa: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionService.get(`inscripcion?query=Activo:true,EstadoInscripcionId.Id:${idEstadoFormacion},PeriodoId:${periodo},ProgramaAcademicoId:${programa}&sortby=Id&order=asc&limit=0`)
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            console.error(error);
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('admision.inscripciones_error'));
            reject(false);
          });
    });
  }

  consultarTercero(id: number) {
    return this.terceroService.get(`tercero?query=Id:${id}`).toPromise();
  }



/*   onGestionClick(solicitud: any): void {
    this.selectedSolicitudId = solicitud.id;
    this.cargarDatosTabla2(solicitud.referencia.Periodo, solicitud.referencia.Opcion);
    this.mostrarTabla('tabla2');
  } */

  onGestionClick(solicitud: any): void {
    this.selectedSolicitudId = solicitud.id;
    this.listarAspirantes();
    this.mostrarTabla('tabla2');
  }





  cargarCSV(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.solicitudesCorreosService.cargarDatos(file).subscribe(data => {
        const limitedData = data.slice(0, 100); // Limitar a 100 registros
        this.dataSource2 = new MatTableDataSource<Element>(limitedData);
        this.dataSource2.paginator = this.paginator2;
      }, error => {
        console.error('Error al cargar el archivo CSV:', error);
      });
    }
  }
  
  aplicarFiltro(event: any, tabla: string): void {
    const filterValue = (event.target as HTMLInputElement).value;
    if (tabla === 'tabla1') {
      this.dataSource.filter = filterValue.trim().toLowerCase();
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    } else {
      this.dataSource2.filter = filterValue.trim().toLowerCase();
      if (this.dataSource2.paginator) {
        this.dataSource2.paginator.firstPage();
      }
    }
  }

  mostrarTabla(tablaId: string): void {
    this.mostrarTabla1 = tablaId === 'tabla1';
  }

  descargarCSV(): void {
    const data = this.dataSource2.data;
    const chunkSize = 1000;
  
    this.solicitudesCorreosService.descargarDatos(data, chunkSize).subscribe(() => {
      this.popUpManager.showSuccessAlert('Archivo descargado correctamente.');
    }, error => {
      this.popUpManager.showErrorAlert('Error al descargar el archivo.');
    });
  }
  

  confirmarGestion(): void {
    if (!this.selectedSolicitudId) {
      this.popUpManager.showErrorAlert('No se ha seleccionado ninguna solicitud.');
      return;
    }

    const updatedSolicitud = {
      Id: this.selectedSolicitudId,
      EstadoTipoSolicitudId: {
        Id: 95
      },
      Referencia: "{}",
      Resultado: "",
      FechaRadicacion: "2024-06-15 16:00:00 +0000 +0000",
      FechaCreacion: "2024-06-15 16:48:37.638665 +0000 +0000",
      FechaModificacion: "2024-06-15 16:48:37.63876 +0000 +0000",
      SolicitudFinalizada: false,
      Activo: true,
      SolicitudPadreId: null
    };

    this.solicitudesCorreosService.put(`solicitud/${this.selectedSolicitudId}`, updatedSolicitud).subscribe(
      () => {
        this.popUpManager.showSuccessAlert('Gestión de solicitudes confirmada.');
        this.loadData();
        this.mostrarTabla('tabla1');
      },
      error => {
        this.popUpManager.showErrorAlert('Error al confirmar la gestión de solicitudes.');
        console.error('Error:', error);
      }
    );
  }

  toggleFormVisibility(): void {
    this.mostrarTabla1 = !this.mostrarTabla1;
  }


  onEnviarClick(): void {
    const data = {
      asignaciones: this.dataSource2.data.map(item => ({
        facultad: item.facultad,
        codigo: item.codigo,
        numeroDocumento: item.numeroDocumento,
        primerNombre: item.primerNombre,
        segundoNombre: item.segundoNombre,
        primerApellido: item.primerApellido,
        segundoApellido: item.segundoApellido,
        correoPersonal: item.correoPersonal,
        telefono: item.telefono,
        usuarioAsignado: item.usuarioAsignado,
        correoAsignado: item.correoAsignado
      }))
    };

    this.correoInscripcionMidService.post('asignacion', data).subscribe(
      response => {
        this.popUpManager.showSuccessAlert('Correos asignados correctamente.');
        console.log(response);
      },
      error => {
        this.popUpManager.showErrorAlert('Error al asignar correos.');
        console.error('Error al asignar correos:', error);
      }
    );
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  cancelarObservacion(): void {
    this.observacionForm.reset();
    this.toggleFormulario();
  }

  agregarObservacion(): void {
    if (this.observacionForm.valid) {
      const observacion: Observacion = {
        tipoObservacion: this.observacionForm.value.tipoObservacion,
        nombres: this.observacionForm.value.nombreRemitente.nombres,
        apellidos: this.observacionForm.value.nombreRemitente.apellidos,
        cuerpoObservacion: this.observacionForm.value.cuerpoObservacion,
        fecha: new Date()
      };

      this.observaciones.push(observacion);
      this.observacionForm.reset();
      this.toggleFormVisibility();
    }
  }

  getObservacionColor(tipo: string): string {
    switch (tipo) {
      case 'usuarioEspecifico':
        return 'usuario-especifico-color';
      case 'general':
        return 'general-color';
      case 'sobreCampo':
        return 'sobre-campo-color';
      case 'erroresParticulares':
        return 'errores-particulares-color';
      case 'erroresPlataforma':
        return 'errores-plataforma-color';
      case 'duplicaciones':
        return 'duplicaciones-color';
      default:
        return '';
    }
  }

  agregarAsignacion(asignacion: any): void {
    this.correoInscripcionMidService.post('asignacion', asignacion).subscribe((response: any) => {
      /* this.cargarDatosTabla2(); */
    });
  }

  onSubmit(): void {
    if (this.observacionForm.valid) {
      const formValue = this.observacionForm.value;
      const asignacion = {
        tipoObservacion: formValue.tipoObservacion,
        nombres: formValue.nombreRemitente.nombres,
        apellidos: formValue.nombreRemitente.apellidos,
        cuerpoObservacion: formValue.cuerpoObservacion,
        fecha: new Date(),
        usuarioAsignado: this.obtenerUsuarioAsignado(),
        correoAsignado: this.obtenerCorreoAsignado()
      };
      this.agregarAsignacion(asignacion);
    }
  }

  obtenerUsuarioAsignado(): string {
    return 'usuarioAsignadoEjemplo';
  }

  obtenerCorreoAsignado(): string {
    return 'correoAsignado@example.com';
  }
}
