import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, filter, interval, map, of, take, timeout } from 'rxjs';
import { PopUpManager } from '../app/managers/popUpManager';

// El core puede limpiar y volver a pedir el menú al cargar la página,
// así que se espera un tiempo prudente a que quede en localStorage.
const MENU_POLL_MS = 200;
const MENU_TIMEOUT_MS = 10000;

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

  constructor(
    private popUpManager: PopUpManager,
    private translate: TranslateService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const path = new URL(window.location.href).pathname;
    const params = route.params;

    return waitForMenu().pipe(
      map((menuPermisos) => {
        if (menuPermisos != null && checkUrlExists(menuPermisos, path, params)) {
          return true;
        }
        // translate.get espera a que cargue el archivo de idioma antes de mostrar el aviso
        this.translate.get('ERROR.rol_insuficiente_titulo').subscribe((message: string) => {
          this.popUpManager.showErrorAlert(message);
        });
        return false;
      })
    );
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.canActivate(route, state);
  }
}

function waitForMenu(): Observable<any[] | null> {
  const menu = parseMenuPermissions(localStorage.getItem('menu'));
  if (menu != null) {
    return of(menu);
  }
  return interval(MENU_POLL_MS).pipe(
    map(() => parseMenuPermissions(localStorage.getItem('menu'))),
    filter((menuPermisos) => menuPermisos != null),
    take(1),
    timeout({ first: MENU_TIMEOUT_MS, with: () => of(null) }),
  );
}

function parseMenuPermissions(menuInfo: string | null): any[] | null {
  if (!menuInfo) {
    return null;
  }
  try {
    return JSON.parse(atob(menuInfo));
  } catch {
    return null;
  }
}

// Recorrer el menú para verificar si la URL y los parámetros existen
function checkUrlExists(menuItems: any[], targetUrl: string, params: any): boolean {
  return menuItems.some((item: any) => {
    // Verificar la URL y los parámetros
    if (item.Url === targetUrl && checkParams(item.Params, params)) {
      return true;
    }
    if (item.Opciones && item.Opciones.length > 0) {
      return checkUrlExists(item.Opciones, targetUrl, params);
    }
    return false;
  });
}

// Verificar los parámetros de la ruta
function checkParams(expectedParams: any, actualParams: any): boolean {
  if (!expectedParams) {
    return true; // No se requieren parámetros específicos
  }
  for (let key in expectedParams) {
    if (expectedParams[key] !== actualParams[key]) {
      return false; // Un parámetro no coincide
    }
  }
  return true; // Todos los parámetros coinciden
}
