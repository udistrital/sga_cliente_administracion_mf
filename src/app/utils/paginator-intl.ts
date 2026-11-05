import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { merge } from 'rxjs';

// Traduce los textos de todos los mat-paginator del MF.
// El idioma se cambia con setDefaultLang (ver AppComponent), por eso se escuchan ambos eventos.
@Injectable()
export class PaginatorIntl extends MatPaginatorIntl {

  private ofLabel = 'of';

  constructor(private translate: TranslateService) {
    super();
    merge(this.translate.onLangChange, this.translate.onDefaultLangChange)
      .subscribe(() => this.translateLabels());
    this.translateLabels();
  }

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return `0 ${this.ofLabel} ${length}`;
    }
    const startIndex = page * pageSize;
    const endIndex = Math.min(startIndex + pageSize, length);
    return `${startIndex + 1} – ${endIndex} ${this.ofLabel} ${length}`;
  };

  private translateLabels(): void {
    this.translate.get([
      'PAGINADOR.items_por_pagina',
      'PAGINADOR.siguiente',
      'PAGINADOR.anterior',
      'PAGINADOR.primera',
      'PAGINADOR.ultima',
      'PAGINADOR.de',
    ]).subscribe((t: any) => {
      this.itemsPerPageLabel = t['PAGINADOR.items_por_pagina'];
      this.nextPageLabel = t['PAGINADOR.siguiente'];
      this.previousPageLabel = t['PAGINADOR.anterior'];
      this.firstPageLabel = t['PAGINADOR.primera'];
      this.lastPageLabel = t['PAGINADOR.ultima'];
      this.ofLabel = t['PAGINADOR.de'];
      this.changes.next();
    });
  }
}
