import { Component, Input, ViewChild, } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { VisualizarSoporteDocumento } from '../visualizar-soporte/visualizar-soporte.component';
import { SgaAdmisionesMid } from '../../../services/sga_admisiones_mid.service';
import saveAs from 'file-saver';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-soporte-configuracion',
  templateUrl: './soporte-configuracion.component.html',
  styleUrls: ['./soporte-configuracion.component.scss']
})
export class SoporteConfiguracionComponent {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  soporte: boolean = true
  resumen: boolean = false
  folderTagtoReload!: string;
  dataSource = new MatTableDataSource<any>
  columns = ["orden", "convocatoria", "generacion", "usuario", "+"]



  constructor(private dialog: MatDialog, private admisionServices: SgaAdmisionesMid) { }

  ngOnInit() {
    this.dataSource = new MatTableDataSource([{ orden: 1, convocatoria: "2024-1", generacion: "2021", usuario: "admin" }])
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  activateVariables() {
    this.soporte = false
    this.resumen = true
  }

  openDialog(data: any): void {
    const dialogRef = this.dialog.open(VisualizarSoporteDocumento, {
      width: '1600px',
      height: '750px',
      data: data
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  documento(option: string) {
    this.admisionServices.get("admision/soporte/40/2").subscribe((response: any) => {
      console.log(response)
      if (response.status == 200 && response.success == true) {
        if (option == "ver") {
          this.VisualizarPdf(response.data.pdf);
        } else {
          this.downloadPdf(response.data.pdf, "Soporte.pdf");
        }
      }
    });
  }

  VisualizarPdf(base64String: string): void {
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    this.dialog.open(VisualizarSoporteDocumento, {
      width: '1600px',
      height: '750px',
      data: { pdfUrl: url }
    });
  }

  downloadPdf(base64String: string, fileName: string): void {
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    saveAs(blob, fileName);
  }

  visualizarSoporte(valor: boolean) {
    console.log("fds")
    console.log(this.soporte)
    this.soporte = !valor
    this.resumen = valor
    console.log(this.soporte)
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}