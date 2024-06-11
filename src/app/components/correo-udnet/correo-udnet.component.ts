import { Component, ViewChild, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SolicitudesCorreosService } from '../../services/solicitudes_correos.service';
import { PopUpManager } from '../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';

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
  cargarSolicitudesCorreos: any;

  constructor(
    private solicitudesCorreosService: SolicitudesCorreosService,
    private translate: TranslateService,
    private popUpManager: PopUpManager
  ) { }

  ngOnInit() {
    this.cargarDatosTabla();
    this.cargarDatosTabla2();
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

  aplicarFiltro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  aplicarFiltro2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
    if (this.dataSource2.paginator) {
      this.dataSource2.paginator.firstPage();
    }
  }

  mostrarTabla(tablaId: string) {
    document.getElementById('tabla1')!.style.display = tablaId === 'tabla1' ? 'block' : 'none';
    document.getElementById('tabla2')!.style.display = tablaId === 'tabla2' ? 'block' : 'none';
    this.mostrarTabla1 = tablaId === 'tabla1';
  }

  cargarCSV(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.solicitudesCorreosService.cargarDatos(file).subscribe(response => {
        this.popUpManager.showSuccessAlert('Archivo cargado con éxito.');
        this.cargarDatosTabla2(); // Recargar datos después de la carga del archivo
      }, error => {
        this.popUpManager.showErrorAlert('Error al cargar el archivo.');
      });
    }
  }

  descargarCSV() {
    this.solicitudesCorreosService.descargarDatos().subscribe(blob => {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'solicitudes_correos.csv';
      link.click();
    }, error => {
      this.popUpManager.showErrorAlert('Error al descargar el archivo.');
    });
  }
}



