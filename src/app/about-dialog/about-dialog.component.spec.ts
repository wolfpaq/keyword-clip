import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_BASE_HREF } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AboutDialogComponent } from './about-dialog.component';

describe('AboutDialogComponent', () => {

  let fixture: ComponentFixture<AboutDialogComponent>;
  let dialogRef: MatDialogRef<AboutDialogComponent>;

  beforeEach(() => {
    dialogRef = jasmine.createSpyObj('dialogRef', ['close']);

    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { version: '1.0' } },
      ],
      declarations: [
        AboutDialogComponent,
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutDialogComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.debugElement.nativeElement.remove();
  });

  it('should create the component', async(() => {
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  }));

  it('should render a dialog title and content', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    const title = compiled.querySelector('h1[mat-dialog-title]');
    expect(title).toBeTruthy();
    const content = compiled.querySelector('div[mat-dialog-content]');
    expect(content).toBeTruthy();
  }));

});
