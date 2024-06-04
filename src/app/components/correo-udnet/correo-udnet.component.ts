import { Component, ViewChild, OnInit } from '@angular/core';
import { SolicitudesCorreos, ListadoCorreos } from 'src/app/models/correos_administrativos/solicitudes_correos';
import { SolicitudesCorreosService } from 'src/app/services/solicitudes_correos.service';
import { PopUpManager } from 'src/app/managers/popUpManager';
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
  displayedColumns: string[] = ['#', 'procesoAdminicion', 'fecha', 'estado', 'gestion', 'enviar'];
  solicitudes: SolicitudesCorreos[] = [];
  dataSource!: MatTableDataSource<SolicitudesCorreos>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private translate: TranslateService,
    private solicitudesCorreosService: SolicitudesCorreosService,
    private popUpManager: PopUpManager,
    private router: Router
  ) { }

  async ngOnInit() {
    await this.cargarDatosTabla();
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

  ajustarBotonesSegunEstado(solicitud: any) {
    const estado = solicitud.estado;
    if (estado) {
      let accion, tipo;
      if (estado === 'Aprobado') {
        accion = 'VER';
        tipo = 'ver';
      } else {
        accion = 'EDITAR';
        tipo = 'editar';
      }
      solicitud['gestion'] = { value: accion, type: tipo, disabled: false };
      solicitud['enviar'] = { value: undefined, type: 'enviar', disabled: true };
    }
  }

  aplicarFiltro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  enviaraRevision(id: string) {
    const solicitud: any = this.solicitudes.filter((solicitud: any) => solicitud._id === id);
    let solicitud_edit = solicitud[0];

    solicitud_edit.estado = 'En Revisión';
    this.solicitudesCorreosService.put('solicitudes-correos/' + id, solicitud_edit).subscribe(
      (resp: any) => {
        if (resp.Status == "200") {
          this.popUpManager.showSuccessAlert(this.translate.instant('solicitudes_correos.enviar_revision_ok'));
          this.recargarSolicitudesCorreos();
        } else {
          this.popUpManager.showErrorAlert(this.translate.instant('solicitudes_correos.enviar_revision_fallo'));
        }
      },
      (err: unknown) => {
        this.popUpManager.showErrorAlert(this.translate.instant('solicitudes_correos.enviar_revision_fallo'));
      }
    );
  }

  async recargarSolicitudesCorreos() {
    try {
      await this.cargarDatosTabla();
    } catch (error: unknown) {
      this.popUpManager.showErrorToast(this.translate.instant('ERROR.sin_informacion_en') + ': <b>' + this.translate.instant('solicitudes_correos.solicitudes_correos') + '</b>.');
    }
  }
}
