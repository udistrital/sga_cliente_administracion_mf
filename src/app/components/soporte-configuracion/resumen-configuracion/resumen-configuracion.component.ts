import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../managers/popUpManager';
import { Concepto } from '../../../models/derechos_pecuniarios/concepto';
import { EvaluacionInscripcionService } from '../../../services/evaluacion_inscripcion.service';
import { InscripcionService } from '../../../services/inscripcion.service';
import { ParametrosService } from '../../../services/parametros.service';
import { ProyectoAcademicoService } from '../../../services/proyecto_academico.service';
import { SgaCalendarioMidServiceService } from '../../../services/sga-calendario-mid.service.service';
import { SgaDerechoPecuniarioMidService } from '../../../services/sga-derecho-pecuniario-mid.service';
import { SgaAdmisionesMid } from '../../../services/sga_admisiones_mid.service';
import { TAGS_INSCRIPCION_PROGRAMA } from './def_tags_por_programa';

@Component({
    selector: 'app-resumen-configuracion',
    templateUrl: './resumen-configuracion.component.html',
    styleUrls: ['./resumen-configuracion.component.scss'],
    standalone: false
})
export class ResumenConfiguracionComponent {
  @Output() soportehijo= new EventEmitter<boolean>();
  procesos!: any
  variables: boolean = true
  resumen: boolean = false
  periodo!: any
  nivel!: number
  proyectos: any;
  criterios: any[] = [];
  fecha!: string;
  nivel_load: any;
  tiposInscrip!: any
  loading!: boolean;
  subCriterios!: any;
  periodos: any = [];
  selectednivel: any;
  FechaGlobal!: number;
  nombrePeriodo!: string;
  nombreP!: string
  criterio_selected!: any;
  proyectos_selected!: any;
  tagsObject: any = undefined;
  seccionesSuite = [
    { clave: 'info_persona', etiqueta: 'inscripcion.info_basica', icono: 'account_circle' },
    { clave: 'formacion_academica', etiqueta: 'inscripcion.formacion_academica', icono: 'school' },
    { clave: 'idiomas', etiqueta: 'inscripcion.idiomas', icono: 'public' },
    { clave: 'experiencia_laboral', etiqueta: 'inscripcion.experiencia_laboral', icono: 'work' },
    { clave: 'produccion_academica', etiqueta: 'inscripcion.produccion_academica', icono: 'book' },
    { clave: 'documento_programa', etiqueta: 'inscripcion.documento_programa', icono: 'description' },
    { clave: 'descuento_matricula', etiqueta: 'inscripcion.descuento_matricula', icono: 'attach_money' },
    { clave: 'propuesta_grado', etiqueta: 'inscripcion.propuesta_grado', icono: 'insert_drive_file' },
    { clave: 'perfil', etiqueta: 'inscripcion.perfil', icono: 'person' },
  ];
  proyectosId: any[] = []
  semanasCalendario!: number
  Calendario_academico: string = "";
  criteriosTable!: any
  SubCriterio!: MatTableDataSource<any>
  proyectoCurricular!: MatTableDataSource<any>
  derechosPecuniarios!: MatTableDataSource<any>
  cuentaDerechosPecuniarios!: MatTableDataSource<any>
  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);
  displayedColumnsSubCriterios = ["nombre", "descripcion", "activo"]
  displayedColumnsDerechosPecuniarios = ["codigo", "nombre", "factor", "costo"]
  displayedColumnsProyectoCurricular = ["calendario", "facultad", "nombre", "nivel", "modalidad",]
  displayedColumnsDerechosPecuniariosCuentas = ["tipoCuneta", "descripcion"]
  @ViewChild(MatPaginator) paginator!: MatPaginator;


  constructor(
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private sgaMidAdmisiones: SgaAdmisionesMid,
    private parametrosService: ParametrosService,
    private inscripcionService: InscripcionService,
    private projectService: ProyectoAcademicoService,
    private evaluacionService: EvaluacionInscripcionService,
    private sgaCalendarioMidService: SgaCalendarioMidServiceService,
    private sgaDerechoPecunarioMidService: SgaDerechoPecuniarioMidService
  ) { }

  async ngOnInit() {
    this.tagsObject = structuredClone(TAGS_INSCRIPCION_PROGRAMA);
    await this.cargarPeriodo()
    await this.loadLevel()
    await this.loadDataCunetaPecuniarios()
    await this.loadCriterioSubCriterio().catch(() => this.criterios = [])
  }

  selectPeriodo() {
    this.selectednivel = undefined;
    this.proyectos_selected = undefined;
    this.resumen = false;
  }

  async loadResumen() {
    this.procesos = [];
    this.proyectoCurricular = new MatTableDataSource<any>([]);
    this.criteriosTable = [];
    this.tagsObject = structuredClone(TAGS_INSCRIPCION_PROGRAMA);
    this.resumen = !!this.selectednivel;
    if (!this.resumen) {
      return;
    }
    await this.loadCalendario()
  }

  cargarPeriodo() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0')
        .subscribe((res: any) => {
          const r = <any>res;
          if (res !== null && r.Status === '200') {
            this.periodo = res.Data.find((p: any) => p.Activo);
            window.localStorage.setItem('IdPeriodo', String(this.periodo['Id']));
            resolve(this.periodo);
            const periodos = <any[]>res['Data'];
            periodos.forEach((element: any) => {
              this.periodos.push(element);
            });
          } else {
            this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.periodo_error'));
            reject(false);
          }
        },
          (error: HttpErrorResponse) => {
            console.error(error);
            this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.periodo_error'));
            reject(error);
          });
    });
  }

  loadLevel() {
    return new Promise((resolve, reject) => {
      this.projectService.get('nivel_formacion?limit=0')
        .subscribe((response: any) => {
          if (response !== null || response !== undefined) {
            this.nivel_load = <any>response;
            resolve(response);
          } else {
            this.popUpManager.showErrorAlert(this.translate.instant('ERROR.general'));
            reject(false);
          }
        },
          (error: HttpErrorResponse) => {
            console.error(error);
            this.popUpManager.showErrorAlert(this.translate.instant('ERROR.general'));
            reject(error);
          });
    });
  }

  // loadLevel2() {
  //   this.projectService.get('nivel_formacion?limit=0').subscribe(
  //     (response: any) => {
  //       console.log(response)
  //       if (response !== null || response !== undefined) {
  //         this.nivel_load = <any>response;
  //       }
  //     },
  //     error => {
  //       this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
  //       this.loading = false;
  //     },
  //   );
  // }

  async loadCalendario() {
    const periodo: any = await this.recuperarPeriodo(this.periodo["Id"]);
    this.nombrePeriodo = periodo.Descripcion
    this.FechaGlobal = periodo.Year
    this.nombreP = periodo.Nombre
    const inicioVigencia = new Date(periodo.InicioVigencia);
    const finVigencia = new Date(periodo.FinVigencia);
    const diferenciaMs = finVigencia.getTime() - inicioVigencia.getTime();
    const semanas = diferenciaMs / (1000 * 60 * 60 * 24 * 7);
    const semanasRedondeadas = Math.floor(semanas);
    this.semanasCalendario = semanasRedondeadas
    await this.loadDatacalendario()
    await this.loadDerechoPecuniarios()
  }

  recuperarPeriodo(idPeriodo: any) {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo/' + idPeriodo)
        .subscribe((response: any) => {
          if (response.Success === true && response.Status === '200') {
            resolve(response.Data);
          } else {
            this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.periodo_error'));
            reject(false);
          }
        },
          (error: HttpErrorResponse) => {
            console.error(error);
            this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.periodo_error'));
            reject(error);
          });
    });
  }

  async loadDatacalendario() {
    let periodo: any[] = []
    const calendario: any = await this.recuperarCalendarioAcademico();
    const nivel = (this.nivel_load || []).find((n: any) => n.Nombre === this.selectednivel);

    for (const element of calendario) {
      const mismoNivel = (nivel && element.Nivel === nivel.Id) || element.Nombre.includes(this.selectednivel);
      if (element.Activo == true && this.nombreP == element.Periodo && mismoNivel) {
        periodo.push(element)
      }
    }

    if (periodo.length === 0) {
      this.popUpManager.showAlert(this.translate.instant('GLOBAL.atencion'), this.translate.instant('soporte.sin_calendario'));
      return;
    }
    await this.loadProcessActivity(periodo[0])
  }

  recuperarCalendarioAcademico() {
    return new Promise((resolve, reject) => {
      this.sgaCalendarioMidService.get('calendario-academico/')
        .subscribe((response: any) => {
          if (response.Status === 200) {
            resolve(response.Data)
          } else if (response.Status !== 200) {
            this.popUpManager.showErrorAlert(this.translate.instant('ERROR.invalidResponse'));
            reject(false);
          } else if (!response.data) {
            this.popUpManager.showErrorAlert(this.translate.instant('ERROR.noData'));
            reject(false);
          }
        },
          (error: HttpErrorResponse) => {
            console.error(error);
            this.popUpManager.showErrorAlert(this.translate.instant('ERROR.noData'));
            reject(error);
          });
    });
  }

  async loadProcessActivity(periodo: any) {
    const calendarioPeriodo: any = await this.recuperarCalendarioPeriodo(periodo.Id);
    this.procesos = calendarioPeriodo[0].proceso
    this.proyectosId = JSON.parse(calendarioPeriodo[0].DependenciaId);
    await this.loadProyectosCurriculares(this.proyectosId)
  }

  recuperarCalendarioPeriodo(periodo: any) {
    return new Promise((resolve, reject) => {
      this.sgaCalendarioMidService.get('calendario-academico/v2/' + periodo)
        .subscribe((response: any) => {
          if (response.Status === 200 && response.Success === true) {
            resolve(response.Data)
          } else {
            this.popUpManager.showErrorAlert(this.translate.instant('ERROR.noData'));
            reject(false);
          }
        },
          (error: HttpErrorResponse) => {
            console.error(error);
            this.popUpManager.showErrorAlert(this.translate.instant('ERROR.noData'));
            reject(error);
          });
    });
  }

  async loadDerechoPecuniarios() {
    let datosCargados: Concepto[] = [];
    const periodos: any = await this.recuperarPeriodosVG();

    for (let index = 0; index < periodos.length; index++) {
      if(periodos[index].Year == this.FechaGlobal  ) {
        const derechos: any = await this.recuperarDerechosPecunarios(periodos[index].Id);
        var data: any[] = derechos;
        if (Object.keys(data).length > 0 && Object.keys(data[0]).length > 0) {
          for (const obj of data) {
            var concepto = new Concepto();
            concepto.Id = obj.ParametroId.Id;
            concepto.Codigo = obj.ParametroId.CodigoAbreviacion;
            concepto.Nombre = obj.ParametroId.Nombre;
            concepto.FactorId = obj.Id;
            concepto.Factor = JSON.parse(obj.Valor).NumFactor;
            if (JSON.parse(obj.Valor).Costo !== undefined) {
              concepto.Costo = JSON.parse(obj.Valor).Costo;
            }
            datosCargados.push(concepto);
          }
        } else {
          this.popUpManager.showAlert('info', this.translate.instant('soporte.no_conceptos'));
        }
        this.derechosPecuniarios = new MatTableDataSource(datosCargados);
        this.derechosPecuniarios.paginator = this.paginator;
      }
    }
  }

  recuperarDerechosPecunarios(id: any) {
    return new Promise((resolve, reject) => {
      this.sgaDerechoPecunarioMidService.get('derechos-pecuniarios/vigencias/' + id)
        .subscribe((response: any) => {
          resolve(response.Data);
        },
          (error: HttpErrorResponse) => {
            console.error(error);
            this.popUpManager.showErrorAlert(this.translate.instant('ERROR.general'));
            reject(error);
          });
    });
  }

  recuperarPeriodosVG() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo?query=CodigoAbreviacion:VG&limit=0&sortby=Id&order=desc')
        .subscribe((response: any) => {
          if (response.Status === "200" && response.Success === true) {
            resolve(response.Data);
          } else {
            this.popUpManager.showErrorAlert(this.translate.instant('ERROR.general'));
            reject(false);
          }
        },
          (error: HttpErrorResponse) => {
            console.error(error);
            this.popUpManager.showErrorAlert(this.translate.instant('ERROR.general'));
            reject(error);
          });
    });
  }

  loadDataCunetaPecuniarios() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get("parametro?query=TipoParametroId:37")
        .subscribe((response: any) => {
          if (response.Status === "200") {
            this.cuentaDerechosPecuniarios = new MatTableDataSource(response.Data)
            resolve(response);
          } else {
            this.popUpManager.showErrorAlert(this.translate.instant('ERROR.general'));
            reject(false);
          }
        },
          (error: HttpErrorResponse) => {
            console.error(error);
            this.popUpManager.showErrorAlert(this.translate.instant('ERROR.general'));
            reject(error);
          });
    });
  }

  async loadProyectosCurriculares(proyectosId: any) {
    let data: any = []
    if (!Number.isNaN(this.selectednivel)) {
      const proyectos: any = await this.recuperarProyectosCurriculares();

      for (const proyecto of proyectos) {
        for (const id of proyectosId.proyectos) {
          if (id === proyecto.Id && this.selectednivel == proyecto.NivelFormacionId.Nombre) {
            data.push(proyecto)
          }
        }
      }
      this.proyectoCurricular = new MatTableDataSource(data)
      await this.activeCriterios()
      await this.loadsuite()
    }
  }

  recuperarProyectosCurriculares() {
    return new Promise((resolve, reject) => {
      this.projectService.get('proyecto_academico_institucion?limit=0')
        .subscribe((response: any) => {
          if (response.length > 0) {
            resolve(response);
          } else {
            this.popUpManager.showErrorAlert(this.translate.instant('ERROR.general'));
            reject(false);
          }
        },
          (error: HttpErrorResponse) => {
            console.error(error);
            this.popUpManager.showErrorAlert(this.translate.instant('ERROR.general'));
            reject(error);
          });
    });
  }

  async loadCriterioSubCriterio() {
    this.criterios = [];
    this.subCriterios = []
    const admision: any = await this.recuperarAdmision();
    this.criterios = admision;
  }

  recuperarAdmision() {
    return new Promise((resolve, reject) => {
      this.sgaMidAdmisiones.get('admision/criterio')
        .subscribe((response: any) => {
          if (response.Status === 200 && response.Success === true) {
            resolve(response.Data);
          } else {
            this.popUpManager.showErrorAlert(this.translate.instant('ERROR.general'));
            reject(false);
          }
        },
          (error: HttpErrorResponse) => {
            console.error(error);
            this.popUpManager.showErrorAlert(this.translate.instant('ERROR.general'));
            reject(error);
          });
    });
  }

  async activeCriterios() {
    const idsConfigurados = new Set<number>();
    for (const element of this.proyectoCurricular.data) {
      const requisitoPrograma: any = await this.recuperarRequisitoPrograma(element.Id, this.periodo.Id).catch(() => []);
      for (const requisito of requisitoPrograma || []) {
        if (requisito?.RequisitoId?.Id !== undefined) {
          idsConfigurados.add(requisito.RequisitoId.Id);
        }
      }
    }
    this.criteriosTable = this.criterios.filter((criterio: any) => idsConfigurados.has(criterio.Id));
  }

  recuperarRequisitoPrograma(programaId: any, periodoId: any) {
    return new Promise((resolve, reject) => {
      this.evaluacionService.get('requisito_programa_academico?query=Activo:true,ProgramaAcademicoId:' + programaId + ',PeriodoId:' + periodoId + '&limit=0')
        .subscribe((response: any) => {
          resolve(response);
        },
          (error: HttpErrorResponse) => {
            console.error(error);
            this.popUpManager.showErrorAlert(this.translate.instant('ERROR.general'));
            reject(error);
          });
    });
  }

  cargarTipoInscripcion(): any {
    return new Promise((resolve, reject) => {
      this.inscripcionService.get('tipo_inscripcion?query=Activo:true&limit=0')
        .subscribe((response: any) => {
          if (response != null && response.Status != '404'
            && Object.keys(response[0]).length > 0) {
            this.tiposInscrip = response;
            resolve(this.tiposInscrip);
          } else {
            reject({ TipoInscrip: "Bad answer" });
          }
        },
          (error: HttpErrorResponse) => {
            reject({ TipoInscrip: error });
          });
    });
  }

  async loadsuite() {
    this.tagsObject = structuredClone(TAGS_INSCRIPCION_PROGRAMA);
    const tiposInscripcion = await this.cargarTipoInscripcion()

    for (const element of this.proyectoCurricular.data) {
      for (const inscripcion of tiposInscripcion) {
        const tags: any = await this.recuperarTagsdependencia(this.periodo.Id, element.Id, inscripcion.Id);
        if (Object.keys(tags[0]).length > 0) {
          const data = JSON.parse(tags[0].ListaTags);
          for (const key in data) {
            if (data.hasOwnProperty(key) && this.tagsObject.hasOwnProperty(key)) {
              const value = data[key];
              if (value.selected) {
                this.tagsObject[key].selected = true;
              }
              if (value.required) {
                this.tagsObject[key].required = true;
              }
            }
          }
        }
      }
    }
  }

  recuperarTagsdependencia(periodoId: any, dependenciaId: any, tipoInscripcionId: any) {
    return new Promise((resolve, reject) => {
      this.evaluacionService.get('tags_por_dependencia?query=Activo:true,PeriodoId:' + periodoId + ',DependenciaId:' + dependenciaId + ',TipoInscripcionId:' + tipoInscripcionId)
        .subscribe((response: any) => {
          if (response != null && response.Status == '200') {
            resolve(response.Data);
          } else {
            this.popUpManager.showAlert(this.translate.instant('soporte.definicion_suite_inscripcion_programa'), this.translate.instant('soporte.no_tiene_suite'));
            reject(false);
          }
        },
          (error: HttpErrorResponse) => {
            console.error(error);
            this.popUpManager.showErrorAlert(this.translate.instant('ERROR.general'));
            reject(error);
          });
    });
  }

  cerrar(){
    this.soportehijo.emit(false)
  }
}
