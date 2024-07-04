import { NgModule } from '@angular/core';
import { RouterModule, Routes, provideRouter } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { getSingleSpaExtraProviders } from 'single-spa-angular';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { AppComponent } from './app.component';
import { CrudTipoInscripcionComponent } from './components/crud-tipo-inscripcion/crud-tipo-inscripcion.component';
import { ListTipoInscripcionComponent } from './components/list-tipo-inscripcion/list-tipo-inscripcion.component';
import { SoporteConfiguracionComponent } from './components/soporte-configuracion/soporte-configuracion/soporte-configuracion.component';
import { ResumenConfiguracionComponent } from './components/soporte-configuracion/resumen-configuracion/resumen-configuracion.component';
import { DefinirOpcionProyectoComponent } from './components/definir-opcion-proyecto/definir-opcion-proyecto.component';

import { CorreoUdnetComponent } from './components/correo-udnet/correo-udnet.component';

const routes: Routes = [

  { path: "lista", component: ListTipoInscripcionComponent },
  { path: "crear", component:  CrudTipoInscripcionComponent},
  { path: "soporte", component: SoporteConfiguracionComponent },
  { path: "opcion", component: DefinirOpcionProyectoComponent },
  { path: "lista", component: AppComponent },
  { path: "correo-udnet", component: CorreoUdnetComponent },
  { path: "inscripcion/lista", component: ListTipoInscripcionComponent },
  { path: "inscripcion/crear", component:  CrudTipoInscripcionComponent},
  { path: "inscripcion/soporte", component: SoporteConfiguracionComponent },
  { path: "inscripcion/lista", component: AppComponent }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [ 
    provideRouter(routes),
    { provide: APP_BASE_HREF, useValue: '/administracion/' },
    getSingleSpaExtraProviders(),
    provideHttpClient(withFetch()) ]
})
export class AppRoutingModule { }