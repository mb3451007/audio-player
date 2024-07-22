import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioUploadModalComponent } from './audio-upload-modal.component';

describe('AudioUploadModalComponent', () => {
  let component: AudioUploadModalComponent;
  let fixture: ComponentFixture<AudioUploadModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AudioUploadModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudioUploadModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
