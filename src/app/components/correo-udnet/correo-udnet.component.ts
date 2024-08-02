import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SolicitudesCorreosService } from '../../services/solicitudes_correos.service';
import { PopUpManager } from '../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { CorreoInscripcionMidService } from '../../services/correo_inscripcion_mid.service';
import { SgaAdmisionesMid } from '../../services/sga_admisiones_mid.service';

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

  constructor(
    private solicitudesCorreosService: SolicitudesCorreosService,
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private correoInscripcionMidService: CorreoInscripcionMidService,
    private sgaAdmisionesMid: SgaAdmisionesMid
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

  cargarDatosTabla2(periodo: number, opcion: number): void {
    this.sgaAdmisionesMid.get('gestion-correos/correo-sugerido?id_periodo='+periodo+'&opcion='+opcion).subscribe((response: any) => {

      this.dataSource2 = new MatTableDataSource(response.Data);
      this.dataSource2.paginator = this.paginator2;
      
    });
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

  onGestionClick(solicitud: any): void {
    this.selectedSolicitudId = solicitud.id;
    this.cargarDatosTabla2(solicitud.referencia.Periodo, solicitud.referencia.Opcion);
    this.mostrarTabla('tabla2');
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
