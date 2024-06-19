import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SolicitudesCorreosService } from '../../services/solicitudes_correos.service';
import { PopUpManager } from '../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'udistrital-correo-udnet',
  templateUrl: './correo-udnet.component.html',
  styleUrls: ['./correo-udnet.component.scss']
})
export class CorreoUdnetComponent implements OnInit {
  displayedColumns: string[] = ['#', 'procesoAdminicion', 'fecha', 'estado', 'gestion'];
  displayedColumns2: string[] = ['facultad', 'codigo', 'numeroDocumento', 'primerNombre', 'segundoNombre', 'primerApellido', 'segundoApellido', 'correoPersonal', 'telefono', 'usuarioAsignado', 'correoAsignado'];
  
  dataSource!: MatTableDataSource<any>;
  dataSource2!: MatTableDataSource<any>;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('paginator2') paginator2!: MatPaginator;
  mostrarTabla1: boolean = true;

  selectedSolicitud: any | null = null; // Variable para almacenar la solicitud seleccionada


  nuevoProceso: string = '';
  nuevoEstado: string = 'Pendiente';

  constructor(
    private solicitudesCorreosService: SolicitudesCorreosService,
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.loadData();
    this.cargarDatosTabla2();
  }

  loadData(): void {
    this.solicitudesCorreosService.get('solicitud?query=EstadoTipoSolicitudId.EstadoId.Id:100').subscribe(res => {
      if (res !== null) {
        const data = <Array<any>><unknown>res;
        const formattedData = data.map(item => ({
          id: item.Id, // Agregar el ID de la solicitud para referencia
          procesoAdminicion: item.EstadoTipoSolicitudId.TipoSolicitud.Nombre,
          fecha: item.FechaRadicacion,
          estado: item.EstadoTipoSolicitudId.EstadoId.Nombre
        }));
        this.dataSource = new MatTableDataSource(formattedData);
        this.dataSource.paginator = this.paginator;
      }
    });
  }
  cargarDatosTabla() {
    const data = [
      { procesoAdminicion: 'Proceso 1', fecha: '2024-06-01', estado: 'Pendiente' },
      { procesoAdminicion: 'Proceso 2', fecha: '2024-06-02', estado: 'Completado' },
      { procesoAdminicion: 'Proceso 3', fecha: '2024-06-03', estado: 'En Proceso' }
    ];
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
  }

  cargarDatosTabla2() {
    const data2 = [
      { facultad: 'Ingeniería', codigo: '001', numeroDocumento: '12345678', primerNombre: 'Juan', segundoNombre: 'Carlos', primerApellido: 'Pérez', segundoApellido: 'García', correoPersonal: 'juan@example.com', telefono: '1234567890', usuarioAsignado: 'Usuario1', correoAsignado: 'user1@example.com' },
      { facultad: 'Medicina', codigo: '002', numeroDocumento: '87654321', primerNombre: 'Ana', segundoNombre: 'María', primerApellido: 'López', segundoApellido: 'Martínez', correoPersonal: 'ana@example.com', telefono: '0987654321', usuarioAsignado: 'Usuario2', correoAsignado: 'user2@example.com' }
    ];
    this.dataSource2 = new MatTableDataSource(data2);
    this.dataSource2.paginator = this.paginator2;
  }

  cargarCSV(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.solicitudesCorreosService.cargarDatos(file).subscribe(data => {
        this.dataSource2 = new MatTableDataSource(data);
        this.dataSource2.paginator = this.paginator2;
      }, error => {
        console.error('Error al cargar el archivo CSV:', error);
      });
    }
  }

  aplicarFiltro(event: any, tabla: string) {
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

  descargarCSV() {
    const data = this.dataSource2.data;
    this.solicitudesCorreosService.descargarDatos(data).subscribe(blob => {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'solicitudes_correos_tabla2.csv';
      link.click();
    }, error => {
      this.popUpManager.showErrorAlert('Error al descargar el archivo.');
    });
  }

  /*cargarSolicitudesCorreos() {
    if (this.selectedSolicitudId !== null) {
      // Realizar la solicitud PUT para cambiar de Radicado a Gestionado
      this.solicitudesCorreosService.put(`solicitud/${this.selectedSolicitudId}`, { 
        EstadoTipoSolicitudId: { 
          EstadoId: { 
            Id: 105 // Cambiar el ID del estado a Gestionado (105)
          }
        },
        FechaModificacion: this.formatCurrentDate()
      }).subscribe(res => {
        // Manejar la respuesta si es necesario
        console.log('Solicitud actualizada exitosamente:', res);
        this.popUpManager.showSuccessAlert('Solicitud gestionada correctamente.');
        this.loadData(); // Recargar los datos después de la actualización
      }, error => {
        console.error('Error al actualizar la solicitud:', error);
        this.popUpManager.showErrorAlert('Error al gestionar la solicitud.');
      });
    } else {
      console.warn('No se ha seleccionado ninguna solicitud para gestionar.');
      this.popUpManager.showErrorAlert('Debe seleccionar una solicitud para gestionar.');
    }
  }*/

  confirmarGestion() {
    if (this.selectedSolicitud) {
      // Realizar la solicitud PUT para cambiar de Radicado a Gestionado
      this.solicitudesCorreosService.put(`solicitud/${this.selectedSolicitud.id}`, { 
        EstadoTipoSolicitudId: { 
          EstadoId: { 
            Id: 105 // Cambiar el ID del estado a Gestionado (105)
          }
        },
        FechaModificacion: this.formatCurrentDate()
      }).subscribe(res => {
        // Manejar la respuesta si es necesario
        console.log('Solicitud actualizada exitosamente:', res);
        this.popUpManager.showSuccessAlert('Solicitud gestionada correctamente.');
        this.loadData(); // Recargar los datos después de la actualización
        this.selectedSolicitud = null; // Limpiar la selección después de gestionar
      }, error => {
        console.error('Error al actualizar la solicitud:', error);
        this.popUpManager.showErrorAlert('Error al gestionar la solicitud.');
      });
    } else {
      console.warn('No se ha seleccionado ninguna solicitud para gestionar.');
      this.popUpManager.showErrorAlert('Debe seleccionar una solicitud para gestionar.');
    }
  }

  formatCurrentDate(): string { 
    const now = new Date(); 
    const pad = (n: number) => n < 10 ? '0' + n : n; 
    const year = now.getUTCFullYear();
    const month = pad(now.getUTCMonth() + 1); 
    const day = pad(now.getUTCDate()); 
    const hours = pad(now.getUTCHours()); 
    const minutes = pad(now.getUTCMinutes()); 
    const seconds = pad(now.getUTCSeconds()); 
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} +0000 +0000`; 
  } 

  seleccionarSolicitud(row: any) {
    this.selectedSolicitud = row;
    console.log('Solicitud seleccionada:', this.selectedSolicitud);
  }

  mostrarTabla(tablaId: string) {
    document.getElementById('tabla1')!.style.display = tablaId === 'tabla1' ? 'block' : 'none';
    document.getElementById('tabla2')!.style.display = tablaId === 'tabla2' ? 'block' : 'none';
    this.mostrarTabla1 = tablaId === 'tabla1';
  }

}
