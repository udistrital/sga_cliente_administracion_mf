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
  styleUrls: ['./resumen-configuracion.component.scss']
})
export class ResumenConfiguracionComponent {
  @Output() soportehijo= new EventEmitter<boolean>();
  procesos!: any
  variables: boolean = true
  resumen: boolean = false
  periodo!: any
  nivel!: number
  proyectos: any;
  criterios: any;
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

  ngOnInit() {
    this.tagsObject = { ...TAGS_INSCRIPCION_PROGRAMA };
    this.cargarPeriodo()
    this.loadLevel()
    this.loadDataCunetaPecuniarios()
  }

  selectPeriodo() {
    this.selectednivel = undefined;
    this.proyectos_selected = undefined;
  }

  loadResumen() {
    this.resumen = true
    this.loadCalendario()
    this.loadCriterioSubCriterio()
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

          }
        },
          (error: HttpErrorResponse) => {
            reject(error);
          });
    });

  }

  loadLevel() {
    this.projectService.get('nivel_formacion?limit=0').subscribe(
      (response: any) => {
        console.log(response)
        if (response !== null || response !== undefined) {
          this.nivel_load = <any>response;
        }
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        this.loading = false;
      },
    );
  }



  loadCalendario() {
    this.parametrosService.get('periodo/' + this.periodo["Id"]).subscribe((response: any) => {
      console.log("Calendario")
      console.log(response)
      if (response.Success === true && response.Status === '200') {
        this.nombrePeriodo = response.Data.Descripcion
        this.FechaGlobal = response.Data.Year
        this.nombreP = response.Data.Nombre
        const inicioVigencia = new Date(response.Data.InicioVigencia);
        const finVigencia = new Date(response.Data.FinVigencia);
        const diferenciaMs = finVigencia.getTime() - inicioVigencia.getTime();
        const semanas = diferenciaMs / (1000 * 60 * 60 * 24 * 7);
        const semanasRedondeadas = Math.floor(semanas);
        this.semanasCalendario = semanasRedondeadas
        this.loadDatacalendario()
        this.loadDerechoPecuniarios()
      }
    })
  }

  loadDatacalendario() {
    let periodo: any[] = []
    this.sgaCalendarioMidService.get('calendario-academico/').subscribe(
      (response: any) => {
        console.log(response)
        if (response.Status === 200) {
          response.Data.forEach((element: any) => {
            if (element.Activo == true && this.nombreP == element.Periodo && element.Nombre.includes(this.selectednivel)) {
              periodo.push(element)
            }
          });
          this.loadProcessActivity(periodo[0])
        } else if (response.Status !== 200) {
          this.popUpManager.showErrorAlert(this.translate.instant('ERROR.invalidResponse'));
        } else if (!response.data) {
          this.popUpManager.showErrorAlert(this.translate.instant('ERROR.noData'));
        }
      })
  };



  loadProcessActivity(periodo: any) {
    this.sgaCalendarioMidService.get('calendario-academico/v2/' + periodo.Id).subscribe(
      (response: any) => {
        console.log("DataCalendario")
        console.log(response)
        if (response.Status === 200 && response.Success === true) {
          this.procesos = response.Data[0].proceso
          this.proyectosId = JSON.parse(response.Data[0].DependenciaId);
          this.loadProyectosCurriculares(this.proyectosId)
        }
      })
  }

  loadDerechoPecuniarios() {
    let datosCargados: Concepto[] = [];
    this.parametrosService.get('periodo?query=CodigoAbreviacion:VG&limit=0&sortby=Id&order=desc').subscribe((response: any) => {
      console.log("Ultimo")
      console.log(response)
      if(response.Status === "200" && response.Success === true){
        for (let index = 0; index < response.Data.length; index++) {
          console.log(response.Data[index].Year)
          console.log(this.FechaGlobal)
          if(response.Data[index].Year == this.FechaGlobal  ){
            this.sgaDerechoPecunarioMidService
            .get('derechos-pecuniarios/vigencias/' + response.Data[index].Id)
            .subscribe(
              (response: any) => {
                console.log("Pecuniarios")
                console.log(response)
                var data: any[] = response.Data;
                if (Object.keys(data).length > 0 && Object.keys(data[0]).length > 0) {
                  data.forEach((obj) => {
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
    
                  });
                } else {
                  this.popUpManager.showAlert(
                    'info',
                    this.translate.instant('derechos_pecuniarios.no_conceptos')
                  );
                }
    
    
                this.derechosPecuniarios = new MatTableDataSource(datosCargados);
                this.derechosPecuniarios.paginator = this.paginator;
              },
              () => {
                this.popUpManager.showErrorAlert(
                  this.translate.instant('ERROR.general')
                );
              }
            );
            
          }
        }


      }

    })


  }

  loadDataCunetaPecuniarios() {

    this.parametrosService.get("parametro?query=TipoParametroId:37")
      .subscribe(
        (response: any) => {
          console.log(response)
          if (response.Status === "200") {
            this.cuentaDerechosPecuniarios = new MatTableDataSource(response.Data)
          } else {
            console.log("Error cuentas de banco")
          }
        })
  }


  loadProyectosCurriculares(proyectosId: any) {
    let data: any = []
    if (!Number.isNaN(this.selectednivel)) {
      this.projectService.get('proyecto_academico_institucion?limit=0').subscribe(
        (response: any) => {

          if (response.length > 0) {
            response.forEach((proyecto: any) => {
              proyectosId.proyectos.forEach((id: any) => {
                if (id === proyecto.Id && this.selectednivel == proyecto.NivelFormacionId.Nombre) {
                  data.push(proyecto)
                }
              });
            })
            this.proyectoCurricular = new MatTableDataSource(data)
            console.log("Proyectos")
            console.log(this.proyectoCurricular.data)
          }
          this.activeCriterios()
          this.loadsuite()
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          this.loading = false;
        },
      );
    }
  }



  loadCriterioSubCriterio() {
    this.criterios = [];
    this.subCriterios = []
    this.sgaMidAdmisiones.get('admision/criterio').subscribe(
      (response: any) => {
        console.log("Criterios")
        console.log(response)
        if (response.status === 200 && response.success === true) {
          this.criterios = response.data;
        }

      })

  }

  activeCriterios() {
    this.proyectoCurricular.data.forEach((element: any) => {
      let data: any[] = [];
      this.evaluacionService.get('requisito_programa_academico?query=ProgramaAcademicoId:' + element.Id +
        ',PeriodoId:' + this.periodo.Id).subscribe((response: any) => {
          this.criterios.forEach((criterio: any) => {

            let encontrado = false;
            response.forEach((res: any) => {
              if (Object.keys(data).length > 0 && Object.keys(data[0]).length > 0) {
                if (res["RequisitoId"]["Id"] === criterio.Id) {
                  encontrado = true;
                }
              }
            });
            if (!encontrado) {
              data.push(criterio);
            }
          });
          this.criteriosTable = data;
        },
          error => {
            console.log("Error")
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
    this.tagsObject = { ...TAGS_INSCRIPCION_PROGRAMA };
    const tiposInscripcion = await this.cargarTipoInscripcion()
    this.proyectoCurricular.data.forEach((element: any) => {
      tiposInscripcion.forEach((inscripcion: any) => {
        this.evaluacionService.get('tags_por_dependencia?query=Activo:true,PeriodoId:' + this.periodo.Id + ',DependenciaId:' + element.Id + ',TipoInscripcionId:' + inscripcion.Id)
          .subscribe((response: any) => {
            if (response != null && response.Status == '200') {
              if (Object.keys(response.Data[0]).length > 0) {
                const data = JSON.parse(response.Data[0].ListaTags);
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
            } else {
              this.loading = false;
              this.popUpManager.showAlert(this.translate.instant('admision.definicion_suite_inscripcion_programa'), this.translate.instant('admision.no_tiene_suite'));
            }
          })
      })
    }
    );
  }
  cerrar(){
    this.soportehijo.emit(false)
    console.log("hola")
  }
}
