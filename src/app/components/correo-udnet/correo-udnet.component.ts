import { Component, ViewChild, OnInit } from '@angular/core';
import { SolicitudesCorreos } from '../../models/correos_administrativos/solicitudes_correos';
import { SolicitudesCorreosService } from '../../services/solicitudes_correos.service';
import { PopUpManager } from '../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';

@Component({
  selector: 'udistrital-correo-udnet',
  templateUrl: './correo-udnet.component.html',
  styleUrls: ['./correo-udnet.component.scss']
})
export class CorreoUdnetComponent implements OnInit {
  displayedColumns: string[] = ['#','procesoAdminicion','fecha','estado', 'gestion'];
  displayedColumns2: string[] = ['facultad','codigo','numeroDocumento','primerNombre','segundoNombre','primerApellido','segundoApellido','correoPersonal','telefono','usuarioAsignado','correoAsignado'];
  solicitudes: SolicitudesCorreos[] = [];
  solicitudesTabla2: SolicitudesCorreos[] = [];
  dataSource!: MatTableDataSource<SolicitudesCorreos>;
  dataSource2!: MatTableDataSource<SolicitudesCorreos>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('paginator2') paginator2!: MatPaginator;

  constructor(
    private translate: TranslateService,
    private solicitudesCorreosService: SolicitudesCorreosService,
    private popUpManager: PopUpManager
  ) { }

  async ngOnInit() {
    await this.cargarDatosTabla();
    await this.cargarDatosTabla2();
  }

  async cargarDatosTabla() {
    try {
      await this.cargarSolicitudesCorreos();
    } catch (error: unknown) {
      this.popUpManager.showErrorToast("ERROR GENERAL" + error);
    }

    this.dataSource = new MatTableDataSource<SolicitudesCorreos>(this.solicitudes);
    this.dataSource.paginator = this.paginator;
  }

  async cargarDatosTabla2() {
    try {
      await this.cargarSolicitudesCorreosTabla2();
    } catch (error: unknown) {
      this.popUpManager.showErrorToast("ERROR GENERAL" + error);
    }

    this.dataSource2 = new MatTableDataSource<SolicitudesCorreos>(this.solicitudesTabla2);
    this.dataSource2.paginator = this.paginator2;
  }

  async cargarSolicitudesCorreos() {
    return new Promise((resolve, reject) => {
      this.solicitudesCorreosService.get('solicitudes-correos?query=activo:true&limit=0').subscribe(
        (response: any) => {
          this.solicitudes = response["Data"];
          resolve(true);
        },
        (error: unknown) => {
          reject(error);
        }
      );
    });
  }

  async cargarSolicitudesCorreosTabla2() {
    return new Promise((resolve, reject) => {
      this.solicitudesCorreosService.get('solicitudes-correos?query=activo:true&limit=0').subscribe(
        (response: any) => {
          this.solicitudesTabla2 = response["Data"];
          resolve(true);
        },
        (error: unknown) => {
          reject(error);
        }
      );
    });
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
  }
}

