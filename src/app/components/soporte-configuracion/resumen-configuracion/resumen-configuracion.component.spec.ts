import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumenConfiguracionComponent } from './resumen-configuracion.component';

describe('ResumenConfiguracionComponent', () => {
  let component: ResumenConfiguracionComponent;
  let fixture: ComponentFixture<ResumenConfiguracionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResumenConfiguracionComponent]
    });
    fixture = TestBed.createComponent(ResumenConfiguracionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
