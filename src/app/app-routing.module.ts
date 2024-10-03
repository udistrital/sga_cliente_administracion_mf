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
import { AuthGuard } from '../_guards/auth.guard';

const routes: Routes = [

  {
    path: "lista",
    canActivate: [AuthGuard],
    component: ListTipoInscripcionComponent
  },
  {
    path: "crear",
    canActivate: [AuthGuard],
    component: CrudTipoInscripcionComponent
  },
  {
    path: "soporte",
    canActivate: [AuthGuard],
    component: SoporteConfiguracionComponent
  },
  {
    path: "opcion",
//    canActivate: [AuthGuard],
    component: DefinirOpcionProyectoComponent
  },
  {
    path: "lista",
    canActivate: [AuthGuard],
    component: AppComponent
  },
  {
    path: "correo-institucional",
    /* canActivate: [AuthGuard], */
    component: CorreoUdnetComponent
  },
  {
    path: "inscripcion/lista",
    canActivate: [AuthGuard],
    component: ListTipoInscripcionComponent
  },
  {
    path: "inscripcion/crear",
    canActivate: [AuthGuard],
    component: CrudTipoInscripcionComponent
  },
  {
    path: "inscripcion/soporte",
    canActivate: [AuthGuard],
    component: SoporteConfiguracionComponent
  },
  {
    path: "inscripcion/lista",
    canActivate: [AuthGuard],
    component: AppComponent
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    provideRouter(routes),
    { provide: APP_BASE_HREF, useValue: '/administracion/' },
    getSingleSpaExtraProviders(),
    provideHttpClient(withFetch())]
})
export class AppRoutingModule { }