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

  ngOnInit() {

    //Cargar el parametro con el "CodigoAbreviacion": "OPREGRADO"
    this.parametrosService.get('parametro?query=Activo:true,CodigoAbreviacion:OPREGRADO').subscribe((response: any) => {
      this.parametro_id = response.Data[0].Id;
    });

    // Cargar los niveles académicos
    this.parametrosService.get('periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0').subscribe((response: any) => {
      console.log(response);
      for (let i = 0; i < response.Data.length; i++) {
        this.annos.push(response.Data[i]);
      }
    });
  }

  selectNivel() {
    console.log(this.nivel);
    this.parametrosService.get('parametro_periodo/?query=PeriodoId:' + this.nivel + ',ParametroId:' + this.parametro_id + ',Activo:true').subscribe((response: any) => {
      if (response.Status === "200") {
        if (this.isObjectEmpty(response.Data[0]) === false) {
          this.opciones = JSON.parse(response.Data[0].Valor).Valor;
        }else{
          this.opciones = '';
        }
      }
    });
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

  onSubmit() {
    if (this.isFormValid()) {
      this.parametrosService.get('parametro_periodo/?query=PeriodoId:' + this.nivel + ',ParametroId:' + this.parametro_id + ',Activo:true').subscribe((response: any) => {
        if (response.Status === "200") {
          if (this.isObjectEmpty(response.Data[0]) === false) {
            // Actualizar el registro del periodo
            console.log('Existe');
            console.log(response.Data);
            const formData = {
              Id: parseInt(response.Data[0].Id),
              Activo: true,
              Valor: JSON.stringify({ Valor: this.opciones }),
              PeriodoId: {
                Id: parseInt(this.nivel)
              },
              ParametroId: {
                Id: parseInt(this.parametro_id)
              }
            }

            console.log(formData);

            this.parametrosService.put('parametro_periodo', formData).subscribe((response: any) => {
              const r = <any>response;
              if (r !== null && r.Type !== 'error') {
                this.popUpManager.showSuccessAlert(this.translate.instant('admision.registro_exito'));
              } else {
                this.popUpManager.showErrorToast(this.translate.instant('GLOBAL.error'));
              }
            },
              (error: HttpErrorResponse) => {
                Swal.fire({
                  icon: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                    this.translate.instant('GLOBAL.info_estado'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              });

          }else{
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

            this.parametrosService.post('parametro_periodo', formData).subscribe((response: any) => {
              const r = <any>response;
              if (r !== null && r.Type !== 'error') {
                this.popUpManager.showSuccessAlert(this.translate.instant('admision.registro_exito'));
              } else {
                this.popUpManager.showErrorToast(this.translate.instant('GLOBAL.error'));
              }
            },
              (error: HttpErrorResponse) => {
                Swal.fire({
                  icon: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                    this.translate.instant('GLOBAL.info_estado'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              });
          }
        }
      });

    }
  }

}
