import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InscripcionService } from '../../services/inscripcion.service';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../managers/popUpManager';
import { ProyectoAcademicoService } from '../../services/proyecto_academico.service';
import { NivelFormacion } from '../../models/proyecto_academico/nivel_formacion';
import { TipoInscripcion } from '../../models/inscripcion/tipo_inscripcion';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2.js';


@Component({
    selector: 'udistrital-crud-tipo-inscripcion',
    templateUrl: './crud-tipo-inscripcion.component.html',
    styleUrls: ['./crud-tipo-inscripcion.component.scss'],
    standalone: false
})
export class CrudTipoInscripcionComponent {
  tipo_inscripcion_id!: number;
  niveles: NivelFormacion[] = [];
  info_tipo_inscripcion: TipoInscripcion | undefined;
  form: FormGroup;

  @Input('tipo_periodo_id')
  set name(tipo_inscripcion_id: number) {
    this.tipo_inscripcion_id = tipo_inscripcion_id;
    this.loadTipoInscripcion();
  }

  @Input() embebido = false;

  @HostBinding('class.tarjeta')
  get esTarjeta(): boolean {
    return !this.embebido;
  }

  @Output() eventChange = new EventEmitter();
  @Output() cancelar = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private translate: TranslateService,
    private inscripcionService: InscripcionService,
    private projectService: ProyectoAcademicoService,
    private popUpManager: PopUpManager) {
    this.form = this.fb.group({
      Nombre: ['', Validators.required],
      Descripcion: ['', Validators.required],
      CodigoAbreviacion: ['', Validators.required],
      NumeroOrden: [null, Validators.required],
      NivelId: [null, Validators.required],
      Activo: [false],
      Especial: [false],
    });
    this.nivel_load();
  }

  get esEdicion(): boolean {
    return this.info_tipo_inscripcion !== undefined;
  }

  nivel_load() {
    this.projectService.get('nivel_formacion?limit=0').subscribe(
      (response: any) => {
        const nivelFormacionResponse = response as NivelFormacion[];
        this.niveles = nivelFormacionResponse.filter(nivel => nivel.NivelFormacionPadreId === null);
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      }
    );
  }

  public loadTipoInscripcion(): void {
    if (this.tipo_inscripcion_id !== undefined && this.tipo_inscripcion_id !== 0) {
      this.inscripcionService.get('tipo_inscripcion/?query=id:' + this.tipo_inscripcion_id)
        .subscribe((res: any) => {
          if (res !== null) {
            this.info_tipo_inscripcion = <TipoInscripcion>res[0];
            this.form.reset({ Activo: false, Especial: false });
            this.form.patchValue(this.info_tipo_inscripcion);
          }
        });
    } else {
      this.info_tipo_inscripcion = undefined;
      this.form.reset({ Activo: false, Especial: false });
    }
  }

  onCancelar(): void {
    if (this.embebido) {
      this.cancelar.emit();
      return;
    }
    this.router.navigateByUrl(this.router.url.replace(/crear$/, 'lista'));
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const tipoInscripcion = { ...this.info_tipo_inscripcion, ...this.form.value };
    if (this.esEdicion) {
      this.updateTipoInscripcion(tipoInscripcion);
    } else {
      this.createTipoInscripcion(tipoInscripcion);
    }
  }

  updateTipoInscripcion(tipoInscripcion: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.actualizar'),
      text: this.translate.instant('tipo_inscripcion.seguro_actualizar_tipo_inscripcion'),
      icon: 'warning',
      showCancelButton: true,
    };
    Swal.fire(opt)
    .then((willDelete: any) => {
      if (willDelete.value) {
        this.info_tipo_inscripcion = <TipoInscripcion>tipoInscripcion;
        this.inscripcionService.put('tipo_inscripcion', this.info_tipo_inscripcion)
          .subscribe(res => {
            this.loadTipoInscripcion();
            this.eventChange.emit(true);
            this.popUpManager.showSuccessAlert(this.translate.instant('tipo_inscripcion.tipo_inscripcion_actualizado'))
          });
      }
    });
  }

  createTipoInscripcion(tipoInscripcion: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.registrar'),
      text: this.translate.instant('tipo_inscripcion.seguro_continuar_registrar_tipo_inscripcion'),
      icon: 'warning',
      showCancelButton: true,
    };
    Swal.fire(opt)
    .then((willDelete: any) => {
      if (willDelete.value) {
        this.inscripcionService.post('tipo_inscripcion', tipoInscripcion)
          .subscribe(res => {
            this.info_tipo_inscripcion = <TipoInscripcion><unknown>res;
            this.eventChange.emit(true);
            this.popUpManager.showSuccessAlert(this.translate.instant('tipo_inscripcion.tipo_inscripcion_creado'))
          });
      }
    });
  }
}
