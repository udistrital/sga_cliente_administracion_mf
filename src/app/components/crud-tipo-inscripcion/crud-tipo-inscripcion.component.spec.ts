import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudTipoInscripcionComponent } from './crud-tipo-inscripcion.component';

describe('CrudTipoInscripcionComponent', () => {
  let component: CrudTipoInscripcionComponent;
  let fixture: ComponentFixture<CrudTipoInscripcionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudTipoInscripcionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrudTipoInscripcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
