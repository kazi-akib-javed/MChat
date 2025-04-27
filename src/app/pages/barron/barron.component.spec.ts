import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarronComponent } from './barron.component';

describe('BarronComponent', () => {
  let component: BarronComponent;
  let fixture: ComponentFixture<BarronComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarronComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarronComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
