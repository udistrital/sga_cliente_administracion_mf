import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Output, EventEmitter } from '@angular/core';

//import { LocalDataSource } from 'ng2-smart-table';
import { InscripcionService } from '../../services/inscripcion.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from '../../managers/popUpManager';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';


@Component({
  selector: 'udistrital-list-tipo-inscripcion',
  templateUrl: './list-tipo-inscripcion.component.html',
  styleUrls: ['./list-tipo-inscripcion.component.scss']
})
export class ListTipoInscripcionComponent implements OnInit {

  uid: number = 0;
  cambiotab: boolean = false;

  source!: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  showInactives: boolean = true;

  datos: any[] = []

  displayedColumns = ['Id', 'Nombre', 'Descripcion', 'NivelId', 'Especial', 'Activo', 'Acciones'];


  @Output() editarElemento = new EventEmitter<number>();


  constructor(
    private translate: TranslateService,
    private inscripcionService: InscripcionService,
    private popUpManager: PopUpManager,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  async ngOnInit() {
    await this.loadData();
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  async loadData() {
    const data: any = await this.recuperarTiposInscripcion();
    this.datos = data
    this.cargarDatosTabla(data);
  }

  recuperarTiposInscripcion() {
    return new Promise((resolve, reject) => {
      this.inscripcionService.get('tipo_inscripcion?sortby=Id&order=desc&limit=0').subscribe(
        (res: any) => {
          if (res !== null) {
            resolve(res);
          } else {
            this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.error_tipo_inscripcion'));
            reject([]);
          }
        },
        (error: any) => {
          console.error(error);
          //this.loading = false;
          this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.error_tipo_inscripcion'));
          reject([]);
        }
      );
    });
  }

  cargarDatosTabla(datosCargados: any[]): void {
    let datos = this.showInactives ? datosCargados : datosCargados.filter(d => d.Activo == true);
    this.source = new MatTableDataSource(datos);
    this.source.paginator = this.paginator;
    this.source.sort = this.sort;
  }

  hideInactive() {
    this.showInactives = !this.showInactives;
    this.cargarDatosTabla(this.datos);
  }

  async onEdit(event: any) {
    if (event && event.Id) {
      this.uid = event.Id;
      await this.activetab();
    } else {
      console.error('No se pudo obtener el ID del elemento seleccionado.');
    }
  }

  async onCreate() {
    this.uid = 0;
    await this.activetab();
  }

  async onDelete(event: any) {
    this.popUpManager.showConfirmAlert(this.translate.instant('tipo_inscripcion.seguro_deshabilitar_tipo_inscripcion',),this.translate.instant('tipo_inscripcion.inactivar'))
      .then(async willDelete => {
        if (willDelete.value) {
          const tipoInscripcion = {
            Activo: false,
            CodigoAbreviacion: event.CodigoAbreviacion,
            Descripcion: event.Descripcion,
            Especial: event.Especial,
            FechaCreacion: event.FechaCreacion,
            FechaModificacion: event.FechaModificacion,
            Id: event.Id,
            NivelId: event.NivelId,
            Nombre: event.Nombre,
            NumeroOrden: event.NumeroOrden,
          }

          const actualizacion: any = await this.actualizarTipoInscripcion(tipoInscripcion);
          await this.loadData();
        }
      });
  }

  actualizarTipoInscripcion(body: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionService.put('tipo_inscripcion/', body).subscribe(
          (res: any) => {
            this.popUpManager.showSuccessAlert(this.translate.instant('tipo_inscripcion.tipo_inscripcion_deshabilitado'));
            resolve(true);
          },
          (error: any) => {
            console.error(error);
            //this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('tipo_inscripcion.tipo_inscripcion_deshabilitado_error'));
            reject(false);
          }
        );
    });
  }

  async activetab() {
    this.cambiotab = !this.cambiotab;
    await this.loadData()
  }

  selectTab(event: any): void{
    if (event.tabTitle === this.translate.instant('GLOBAL.lista')) {
      this.cambiotab = false;
    } else {
      this.cambiotab = true;
    }
  }

  async onChange(event: any) {
    if (event) {
      await this.loadData();
      this.cambiotab = !this.cambiotab;
    }
  }

  itemselec(event: any): void {
    return
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.source.filter = filterValue.trim().toLowerCase();

    if (this.source.paginator) {
      this.source.paginator.firstPage();
    }
  }

}
