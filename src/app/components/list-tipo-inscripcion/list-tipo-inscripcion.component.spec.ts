import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTipoInscripcionComponent } from './list-tipo-inscripcion.component';

describe('ListTipoInscripcionComponent', () => {
  let component: ListTipoInscripcionComponent;
  let fixture: ComponentFixture<ListTipoInscripcionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListTipoInscripcionComponent]
    });
    fixture = TestBed.createComponent(ListTipoInscripcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
