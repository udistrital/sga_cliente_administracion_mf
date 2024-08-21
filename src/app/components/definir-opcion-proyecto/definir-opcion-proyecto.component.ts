import { Component, OnInit } from '@angular/core';
import { ParametrosService } from '../../services/parametros.service';
import { PopUpManager } from '../../managers/popUpManager';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'udistrital-definir-opcion-proyecto',
  templateUrl: './definir-opcion-proyecto.component.html',
  styleUrls: ['./definir-opcion-proyecto.component.scss']
})
export class DefinirOpcionProyectoComponent implements OnInit{
  nivel: string = '';
  opciones: string = '';
  file: File | null = null;
  fileName: string | null = null;
  annos: any[] = [];
  opcionesList = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  parametro_id: any;

  constructor(
    private parametrosService: ParametrosService,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
  ) { }

  async ngOnInit() {
    //Cargar el parametro con el "CodigoAbreviacion": "OPREGRADO"
    const oPregrado: any = await this.recuperarParametroOPregrado(); 
    this.parametro_id = oPregrado[0].Id;
    // Cargar los niveles académicos
    const niveles: any = await this.recuperarNivelesAcademicos();
    for (let i = 0; i < niveles.length; i++) {
      this.annos.push(niveles[i]);
    }
  }

  recuperarNivelesAcademicos() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0').subscribe((res: any) => {
        resolve(res.Data);
      },
        (error: any) => {
          console.error(error);
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          reject(error);
        });
    });
  }

  recuperarParametroOPregrado() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('parametro?query=Activo:true,CodigoAbreviacion:OPREGRADO').subscribe((res: any) => {
        resolve(res.Data);
      },
        (error: any) => {
          console.error(error);
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          reject(error);
        });
    });
  }

  recuperarNivelParametro(periodoId: any, parametroId: any) {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('parametro_periodo/?query=PeriodoId:' + periodoId + ',ParametroId:' + parametroId + ',Activo:true&sortby=Id&order=desc&limit=0').subscribe((res: any) => {
        if (res.Status === "200") {
          resolve(res.Data);
        } else {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          reject(false);
        }
      },
        (error: any) => {
          console.error(error);
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          reject(error);
        });
    });
  }

  async selectNivel() {
    const nivel: any = await this.recuperarNivelParametro(this.nivel, this.parametro_id);
    if (this.isObjectEmpty(nivel[0]) === false) {
      this.opciones = JSON.parse(nivel[0].Valor).Valor;
    }else{
      this.opciones = '';
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileName = file.name;
    } else {
      this.fileName = null;
    }
  }

  isFormValid() {
    return this.nivel && this.opciones && this.fileName;
  }

  //Verfica si un objeto está vacío
  isObjectEmpty(obj: any): boolean {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
  }

  async onSubmit() {
    if (this.isFormValid()) {
      const parametro: any = await this.recuperarNivelParametro(this.nivel, this.parametro_id)
      if (this.isObjectEmpty(parametro[0]) === false) {
        // Actualizar el registro del periodo
        const formData = {
          Id: parseInt(parametro[0].Id),
          Activo: true,
          Valor: JSON.stringify({ Valor: this.opciones }),
          PeriodoId: {
            Id: parseInt(this.nivel)
          },
          ParametroId: {
            Id: parseInt(this.parametro_id)
          }
        }

        await this.actualizarParametroPeriodo(formData);
      } else {
        // Crear el registro del nuevo perido 
        const formData = {
          Activo: true,
          Valor: JSON.stringify({ Valor: this.opciones }),
          PeriodoId: {
            Id: parseInt(this.nivel)
          },
          ParametroId: {
            Id: parseInt(this.parametro_id)
          }
        }

        await this.crearParametroPeriodo(formData);
      }
    }
  }

  actualizarParametroPeriodo(body: any) {
    return new Promise((resolve, reject) => {
      this.parametrosService.put('parametro_periodo', body).subscribe((res: any) => {
        const r = <any>res;
        if (r !== null && r.Type !== 'error') {
          this.popUpManager.showSuccessAlert(this.translate.instant('admision.registro_exito'));
          resolve(res)
        } else {
          this.popUpManager.showErrorToast(this.translate.instant('GLOBAL.error'));
          reject(false)
        }
      },
        (error: HttpErrorResponse) => {
          console.error(error);
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.actualizar') + '-' + this.translate.instant('GLOBAL.info_estado'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
          reject(error);
        });
    });
  }

  crearParametroPeriodo(body: any) {
    return new Promise((resolve, reject) => {
      this.parametrosService.post('parametro_periodo', body).subscribe((res: any) => {
        const r = <any>res;
        if (r !== null && r.Type !== 'error') {
          this.popUpManager.showSuccessAlert(this.translate.instant('admision.registro_exito'));
          resolve(res)
        } else {
          this.popUpManager.showErrorToast(this.translate.instant('GLOBAL.error'));
          reject(false)
        }
      },
        (error: HttpErrorResponse) => {
          console.error(error);
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.actualizar') + '-' + this.translate.instant('GLOBAL.info_estado'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
          reject(error);
        });
    });
  }

  // onSubmit2() {
  //   if (this.isFormValid()) {
  //     this.parametrosService.get('parametro_periodo/?query=PeriodoId:' + this.nivel + ',ParametroId:' + this.parametro_id + ',Activo:true').subscribe((response: any) => {
  //       if (response.Status === "200") {
  //         if (this.isObjectEmpty(response.Data[0]) === false) {
  //           // Actualizar el registro del periodo
  //           console.log('Existe');
  //           console.log(response.Data);
  //           const formData = {
  //             Id: parseInt(response.Data[0].Id),
  //             Activo: true,
  //             Valor: JSON.stringify({ Valor: this.opciones }),
  //             PeriodoId: {
  //               Id: parseInt(this.nivel)
  //             },
  //             ParametroId: {
  //               Id: parseInt(this.parametro_id)
  //             }
  //           }

  //           console.log(formData);

  //           this.parametrosService.put('parametro_periodo', formData).subscribe((response: any) => {
  //             const r = <any>response;
  //             if (r !== null && r.Type !== 'error') {
  //               this.popUpManager.showSuccessAlert(this.translate.instant('admision.registro_exito'));
  //             } else {
  //               this.popUpManager.showErrorToast(this.translate.instant('GLOBAL.error'));
  //             }
  //           },
  //             (error: HttpErrorResponse) => {
  //               Swal.fire({
  //                 icon: 'error',
  //                 title: error.status + '',
  //                 text: this.translate.instant('ERROR.' + error.status),
  //                 footer: this.translate.instant('GLOBAL.actualizar') + '-' +
  //                   this.translate.instant('GLOBAL.info_estado'),
  //                 confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //               });
  //             });

  //         }else{
  //           // Crear el registro del nuevo perido 
  //           const formData = {
  //             Activo: true,
  //             Valor: JSON.stringify({ Valor: this.opciones }),
  //             PeriodoId: {
  //               Id: parseInt(this.nivel)
  //             },
  //             ParametroId: {
  //               Id: parseInt(this.parametro_id)
  //             }
  //           }

  //           this.parametrosService.post('parametro_periodo', formData).subscribe((response: any) => {
  //             const r = <any>response;
  //             if (r !== null && r.Type !== 'error') {
  //               this.popUpManager.showSuccessAlert(this.translate.instant('admision.registro_exito'));
  //             } else {
  //               this.popUpManager.showErrorToast(this.translate.instant('GLOBAL.error'));
  //             }
  //           },
  //             (error: HttpErrorResponse) => {
  //               Swal.fire({
  //                 icon: 'error',
  //                 title: error.status + '',
  //                 text: this.translate.instant('ERROR.' + error.status),
  //                 footer: this.translate.instant('GLOBAL.actualizar') + '-' +
  //                   this.translate.instant('GLOBAL.info_estado'),
  //                 confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //               });
  //             });
  //         }
  //       }
  //     });

  //   }
  // }

}
