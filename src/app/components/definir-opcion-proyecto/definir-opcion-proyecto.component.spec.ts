import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefinirOpcionProyectoComponent } from './definir-opcion-proyecto.component';

describe('DefinirOpcionProyectoComponent', () => {
  let component: DefinirOpcionProyectoComponent;
  let fixture: ComponentFixture<DefinirOpcionProyectoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DefinirOpcionProyectoComponent]
    });
    fixture = TestBed.createComponent(DefinirOpcionProyectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
