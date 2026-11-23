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
import { Observable, firstValueFrom, forkJoin, of } from 'rxjs';
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

interface EstadoSolicitudVista {
  id: number;
  icono: string;
  clase: string;
  etiqueta: string;
}

@Component({
    selector: 'udistrital-correo-udnet',
    templateUrl: './correo-udnet.component.html',
    styleUrls: ['./correo-udnet.component.scss'],
    standalone: false
})
export class CorreoUdnetComponent implements OnInit {
  mostrarTabla1: boolean = true;
  displayedColumns: string[] = ['#', 'procesoAdminicion', 'fecha', 'estado', 'gestion'];
  estadosSolicitud: EstadoSolicitudVista[] = [
    { id: 100, icono: 'hourglass_top', clase: 'estado-radicada', etiqueta: 'solicitudes_correos.estado_radicada' },
    { id: 105, icono: 'check_circle', clase: 'estado-gestionado', etiqueta: 'solicitudes_correos.estado_gestionado' },
    { id: 106, icono: 'mark_chat_read', clase: 'estado-observaciones', etiqueta: 'solicitudes_correos.estado_gestionado_observaciones' },
  ];
  private estadoDesconocido: EstadoSolicitudVista = { id: 0, icono: 'help_outline', clase: 'estado-otro', etiqueta: '' };
  aspirantes$!: Observable<any[]>;
  solicitudSeleccionada: any = null;

  dataSource!: MatTableDataSource<any>;
  dataSource2!: MatTableDataSource<any>;

  selectedSolicitudId!: number;
  observaciones: Observacion[] = []; // Arreglo para almacenar las observaciones
  observacionForm!: FormGroup; // Formulario para la observación
  mostrarFormulario: boolean = true; // Propiedad para controlar la visibilidad del formulario
  

  @ViewChild('paginator1') paginator!: MatPaginator;
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
    this.periodo= 27;
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
    this.solicitudesCorreosService.get('solicitud?query=EstadoTipoSolicitudId.TipoSolicitud.Id:40,Activo:true&limit=0&sortby=Id&order=desc').subscribe(res => {
      if (res !== null) {
        const data = <Array<any>><unknown>res;
        const formattedData = data.map(item => ({
          id: item.Id,
          procesoAdminicion: item.EstadoTipoSolicitudId.TipoSolicitud.Nombre,
          fecha: this.formatDate(item.FechaRadicacion),
          estado: item.EstadoTipoSolicitudId.EstadoId.Nombre,
          estadoId: item.EstadoTipoSolicitudId.EstadoId.Id,
          estadoVista: this.getEstado(item.EstadoTipoSolicitudId.EstadoId.Id),
          referencia: JSON.parse(item.Referencia)
        }));
  
        formattedData.sort((a, b) => {
          if (a.estadoId === 100 && b.estadoId !== 100) {
            return -1;
          } else if (a.estadoId !== 100 && b.estadoId === 100) {
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

  nombreCompleto(aspirante: any): string {
    return [aspirante.PrimerNombre, aspirante.SegundoNombre, aspirante.PrimerApellido, aspirante.SegundoApellido]
      .filter(parte => !!parte)
      .join(' ');
  }

  iniciales(aspirante: any): string {
    return `${(aspirante.PrimerNombre ?? '').charAt(0)}${(aspirante.PrimerApellido ?? '').charAt(0)}`.toUpperCase();
  }

  tieneCorreoUd(aspirante: any): boolean {
    return String(aspirante.CorreoPersonal ?? '').toLowerCase().endsWith('@udistrital.edu.co');
  }

  get totalAspirantes(): number {
    return this.dataSource2?.data.length ?? 0;
  }

  get aspirantesConCorreoUd(): number {
    return this.dataSource2?.data.filter(aspirante => this.tieneCorreoUd(aspirante)).length ?? 0;
  }
  
  getEstado(estadoId: number): EstadoSolicitudVista {
    return this.estadosSolicitud.find(e => e.id === estadoId) ?? this.estadoDesconocido;
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }





  cargarDatosTabla2(periodo: number, opcion: number): void {
    this.sgaAdmisionesMid.get('gestion-correos/correo-sugerido?id_periodo='+periodo+'&opcion='+opcion).subscribe((response: any) => {

      this.dataSource2 = new MatTableDataSource(response.Data);
      this.dataSource2.paginator = this.paginator2;
      this.aspirantes$ = this.dataSource2.connect();
      this.mostrarTabla('tabla2');
      
    });
  }


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
    this.solicitudSeleccionada = solicitud;
    this.cargarDatosTabla2(solicitud.referencia.Periodo, solicitud.referencia.Opcion)
    this.observacionForm.get('cuerpoObservacion')?.setValue(solicitud.referencia?.Observacion ?? '');
    //this.listarAspirantes();
    //this.mostrarTabla('tabla2');
  }





  cargarCSV(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.solicitudesCorreosService.cargarDatos(file).subscribe(data => {
        const limitedData = data.slice(0, 100); // Limitar a 100 registros
        this.dataSource2 = new MatTableDataSource<Element>(limitedData);
        this.dataSource2.paginator = this.paginator2;
        this.aspirantes$ = this.dataSource2.connect();
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
    if (this.mostrarTabla1) {
      this.loadData();
    }
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
  

  async confirmarGestion(): Promise<void> {
    if (!this.selectedSolicitudId) {
      this.popUpManager.showErrorAlert('No se ha seleccionado ninguna solicitud.');
      return;
    }

    const asignaciones = this.dataSource2.data
      .filter((item: any) => item?.Id && item?.correo_asignado)
      .map((item: any) => ({ Id: Number(item.Id), Correo: String(item.correo_asignado).trim() }));

    if (asignaciones.length === 0) {
      this.popUpManager.showErrorAlert(this.translate.instant('solicitudes_correos.listado_sin_columnas'));
      return;
    }

    try {
      const solicitud: any = await firstValueFrom(this.solicitudesCorreosService.get('solicitud/' + this.selectedSolicitudId));
      const respuesta: any = await firstValueFrom(this.correoInscripcionMidService.post('personas/asignar-correo-institucional', asignaciones));

      const resultados: any[] = Array.isArray(respuesta?.Data) ? respuesta.Data : [];
      const yaTenianUsuario = new Set(resultados.filter(r => r?.Error === 'Correo institucional ya existe').map(r => r.Id));
      const noActualizados = new Set(resultados
        .filter(r => r?.Error === 'Error al actualizar la información' || r?.Error === 'Hubo problemas al consultar el servicio')
        .map(r => r.Id));
      const asignados = asignaciones.length - yaTenianUsuario.size - noActualizados.size;

      if (asignados <= 0) {
        this.popUpManager.showAlert(
          this.translate.instant('GLOBAL.atencion'),
          this.translate.instant('solicitudes_correos.ningun_correo_asignado', {
            total: asignaciones.length,
            existentes: yaTenianUsuario.size,
            fallidos: noActualizados.size,
          })
        );
        return;
      }

      const observacion = this.observacionForm.value.cuerpoObservacion ?? '';
      const referenciaUpdate = JSON.parse(solicitud.Referencia);
      referenciaUpdate['Observacion'] = observacion;
      solicitud.EstadoTipoSolicitudId.Id = observacion !== '' ? 96 : 95;
      solicitud.Referencia = JSON.stringify(referenciaUpdate);
      await firstValueFrom(this.solicitudesCorreosService.put('solicitud', solicitud));

      this.popUpManager.showSuccessAlert(this.translate.instant('solicitudes_correos.resumen_asignacion', {
        asignados,
        total: asignaciones.length,
        existentes: yaTenianUsuario.size,
      }));
    } catch (error) {
      console.error('Error al asignar correos:', error);
      this.popUpManager.showErrorAlert(this.translate.instant('solicitudes_correos.error_asignacion'));
    }
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
