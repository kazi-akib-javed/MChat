import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GreQuantComponent } from './gre-quant.component';

describe('GreQuantComponent', () => {
  let component: GreQuantComponent;
  let fixture: ComponentFixture<GreQuantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GreQuantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GreQuantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
