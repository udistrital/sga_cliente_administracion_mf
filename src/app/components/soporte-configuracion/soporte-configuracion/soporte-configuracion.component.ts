import { Component, } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-soporte-configuracion',
  templateUrl: './soporte-configuracion.component.html',
  styleUrls: ['./soporte-configuracion.component.scss']
})
export class SoporteConfiguracionComponent {
  soporte: boolean = true
  resumen: boolean = false
  dataSource = new MatTableDataSource<any>
  columns = ["orden", "convocatoria", "generacion", "usuario", "+"]


  constructor() { }
  ngOnInit() { }
  activateVariables() {
    this.soporte  = false
    this.resumen = true
   }
}

