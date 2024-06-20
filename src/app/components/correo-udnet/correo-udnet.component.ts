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
  selectedSolicitudId!: number;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('paginator2') paginator2!: MatPaginator;
  mostrarTabla1: boolean = true;

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
    this.solicitudesCorreosService.get('solicitud?query=EstadoTipoSolicitudId.TipoSolicitud.Id:40').subscribe(res => {
      if (res !== null) {
        const data = <Array<any>><unknown>res;
        const formattedData = data.map(item => ({
          id: item.Id,
          procesoAdminicion: item.EstadoTipoSolicitudId.TipoSolicitud.Nombre,
          fecha: item.FechaRadicacion,
          estado: item.EstadoTipoSolicitudId.EstadoId.Nombre
        }));
        this.dataSource = new MatTableDataSource(formattedData);
        this.dataSource.paginator = this.paginator;
      }
    });
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


  mostrarTabla(tablaId: string) {
    this.mostrarTabla1 = tablaId === 'tabla1';
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

  confirmarGestion() {
    if (!this.selectedSolicitudId) {
      this.popUpManager.showErrorAlert('No se ha seleccionado ninguna solicitud.');
      return;
    }
  
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds} +0000 +0000`;
    };
  
    const updatedSolicitud = {
      EstadoTipoSolicitudId: {
        Id: 105 
      },
      FechaModificacion: formatDate(new Date()) 
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
  

  onGestionClick(id: number) {
    this.selectedSolicitudId = id;
    this.mostrarTabla('tabla2');
  }
}
