import { Component, OnInit } from '@angular/core';
import { ParametrosService } from '../../services/parametros.service';

@Component({
  selector: 'udistrital-definir-opcion-proyecto',
  templateUrl: './definir-opcion-proyecto.component.html',
  styleUrls: ['./definir-opcion-proyecto.component.scss']
})
export class DefinirOpcionProyectoComponent implements OnInit{
  nivel: string = '';
  opciones: string = '';
  file: File | null = null;
  annos: any[] = []; // Initialize the "annos" property
  opcionesList = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  parametro_id: any;

  constructor(private parametrosService: ParametrosService) { }

  ngOnInit() {

    //Cargar el parametro con el "CodigoAbreviacion": "OP"
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

  onFileSelected(event: any) {
    this.file = event.target.files[0];
  }

  isFormValid() {
    return this.nivel && this.opciones && this.file;
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
            // const formData = {
            //   Activo: true,
            //   Valor: JSON.stringify({ Valor: this.opciones }),
            //   PeriodoId: {
            //     Id: parseInt(this.nivel)
            //   },
            //   ParametroId: {
            //     Id: parseInt(this.parametro_id)
            //   }
            // }

            // this.parametrosService.put('parametro_periodo/'+response.Id, formData).subscribe((response: any) => {
            //   if (response) {
            //     console.log('Registro actualizado correctamente');
            //   }
            // });
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
              if (response) {
                console.log('Registro creado correctamente');
              }
            });
          }
        }
      });

    }
  }

}
