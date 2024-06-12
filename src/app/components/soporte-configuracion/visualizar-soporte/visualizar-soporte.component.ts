import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'visualizar-soporte',
  templateUrl: './visualizar-soporte.component.html',
  styleUrls: ['./visualizar-soporte.component.scss'],
})
export class VisualizarSoporteDocumento implements AfterViewInit {
  @ViewChild('pdfViewer') pdfViewer!: ElementRef;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngAfterViewInit(): void {
    (this.pdfViewer.nativeElement as HTMLObjectElement).data = this.data.pdfUrl;
  }
}
