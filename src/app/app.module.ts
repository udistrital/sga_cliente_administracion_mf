import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort'
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import {MatTabsModule} from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { CrudTipoInscripcionComponent } from './components/crud-tipo-inscripcion/crud-tipo-inscripcion.component';
import { ListTipoInscripcionComponent } from './components/list-tipo-inscripcion/list-tipo-inscripcion.component';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { environment } from '../environments/environment';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';
import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';
import { AnyService } from './services/any.service';
import { InscripcionService } from './services/inscripcion.service';
import { ProyectoAcademicoService } from './services/proyecto_academico.service';
import { SpinnerUtilInterceptor, SpinnerUtilModule } from 'spinner-util';
import { SoporteConfiguracionComponent } from './components/soporte-configuracion/soporte-configuracion/soporte-configuracion.component';
import { ResumenConfiguracionComponent } from './components/soporte-configuracion/resumen-configuracion/resumen-configuracion.component';
import { EvaluacionInscripcionService } from './services/evaluacion_inscripcion.service';
import { ParametrosService } from './services/parametros.service';
import { SgaAdmisionesMid } from './services/sga_admisiones_mid.service';
import { SgaCalendarioMidServiceService } from './services/sga-calendario-mid.service.service';
import { SgaDerechoPecuniarioMidService } from './services/sga-derecho-pecuniario-mid.service';
import { VisualizarSoporteDocumento } from './components/soporte-configuracion/visualizar-soporte/visualizar-soporte.component';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { DefinirOpcionProyectoComponent } from './components/definir-opcion-proyecto/definir-opcion-proyecto.component';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, environment.apiUrl+'assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    DynamicFormComponent,
    CrudTipoInscripcionComponent,
    ListTipoInscripcionComponent,
    SoporteConfiguracionComponent,
    ResumenConfiguracionComponent,
    VisualizarSoporteDocumento,
    DefinirOpcionProyectoComponent

  ],
  imports: [
    MatTabsModule,
    MatChipsModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    BrowserModule,
    MatRadioModule,
    MatCardModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatNativeDateModule,
    MatTableModule, 
    MatPaginatorModule,
    MatDialogModule,
    ReactiveFormsModule,
    FormsModule,
    MatSelectModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatSortModule,
    NgxDocViewerModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    HttpClientModule,
    StoreModule.forRoot({}, {}),
    SpinnerUtilModule
  ],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
    AnyService,
    InscripcionService,
    ProyectoAcademicoService,
    EvaluacionInscripcionService,
    ParametrosService,
    ProyectoAcademicoService,
    SgaAdmisionesMid,
    SgaCalendarioMidServiceService,
    SgaDerechoPecuniarioMidService,
    { provide: HTTP_INTERCEPTORS, useClass: SpinnerUtilInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }