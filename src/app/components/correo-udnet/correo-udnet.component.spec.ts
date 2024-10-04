import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorreoUdnetComponent } from './correo-udnet.component';

describe('CorreoUdnetComponent', () => {
  let component: CorreoUdnetComponent;
  let fixture: ComponentFixture<CorreoUdnetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CorreoUdnetComponent]
    });
    fixture = TestBed.createComponent(CorreoUdnetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
