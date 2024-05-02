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

  //source: LocalDataSource = new LocalDataSource();
  source: MatTableDataSource<any> = new MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  showInactives: boolean = true;

  datos: any[] = []

  displayedColumns = ['Id', 'Nombre', 'Descripcion', 'NivelId', 'Especial', 'Activo', 'Acciones'];


  @Output() editarElemento = new EventEmitter<number>();


  constructor(
    private translate: TranslateService,
    private inscripcionService: InscripcionService,
    private popUpManager: PopUpManager,
  ) {
    this.loadData();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.inscripcionService.get('tipo_inscripcion/?limit=0').subscribe(res => {
      if (res !== null) {
        const data = <Array<any>><unknown>res;
        //this.source.load(data);
        this.datos = data
        this.cargarDatosTabla(data);
      }
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

  ngOnInit() {
  }


  onEdit(event: any) {
    if (event && event.Id) {
      this.uid = event.Id;
      this.activetab();
    } else {
      console.error('No se pudo obtener el ID del elemento seleccionado.');
    }
  }


  onCreate() {
    this.uid = 0;
    this.activetab();
  }

  onDelete(event: any): void {
    this.popUpManager
      .showConfirmAlert(
        this.translate.instant(
          'tipo_inscripcion.seguro_deshabilitar_tipo_inscripcion',
        ),
        this.translate.instant('tipo_inscripcion.inactivar'),
      )
      .then(willDelete => {
        if (willDelete.value) {
          this.inscripcionService
            .put(
              'tipo_inscripcion/' + event.Id,
              JSON.stringify({
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
              }),
            )
            .subscribe(
              (response: any) => {
                if (JSON.stringify(response) == null) {
                  this.popUpManager.showErrorAlert(
                    this.translate.instant(
                      'tipo_inscripcion.tipo_inscripcion_deshabilitado_error',
                    ),
                  );
                } else {
                  this.popUpManager.showSuccessAlert(
                    this.translate.instant(
                      'tipo_inscripcion.tipo_inscripcion_deshabilitado',
                    ),
                  );
                  // this.ngOnInit();
                  this.loadData();
                  //this.cargarCampos();
                }
              },
              error => {
                this.popUpManager.showErrorToast(
                  this.translate.instant(
                    'tipo_inscripcion.tipo_inscripcion_deshabilitado_error',
                  ),
                );
              },
            );
        }
      });
  }

  activetab(): void {
    this.cambiotab = !this.cambiotab;
  }

  selectTab(event: any): void{
    if (event.tabTitle === this.translate.instant('GLOBAL.lista')) {
      this.cambiotab = false;
    } else {
      this.cambiotab = true;
    }
  }

  onChange(event: any) {
    if (event) {
      this.loadData();
      this.cambiotab = !this.cambiotab;
    }
  }

  itemselec(event: any): void {
    return
  }

}
