import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgGridAngularCustomComponent } from './ag-grid-angular-custom.component';

describe('AgGridAngularCustomComponent', () => {
  let component: AgGridAngularCustomComponent;
  let fixture: ComponentFixture<AgGridAngularCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgGridAngularCustomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgGridAngularCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
