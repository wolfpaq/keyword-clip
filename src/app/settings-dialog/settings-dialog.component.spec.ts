import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_BASE_HREF } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { SettingsDialogComponent } from './settings-dialog.component';

describe('SettingsDialogComponent', () => {

  let fixture: ComponentFixture<SettingsDialogComponent>;
  let dialogRef: MatDialogRef<SettingsDialogComponent>;

  beforeEach(() => {
    dialogRef = jasmine.createSpyObj('dialogRef', ['close']);

    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatCheckboxModule,
        MatInputModule,
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        FormBuilder,
        { provide: APP_BASE_HREF, useValue: '/' },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { shows: ['s1', 's2'], initials: ['i1', 'i2'], allowCategoryReset: true } },
      ],
      declarations: [
        SettingsDialogComponent,
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsDialogComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.debugElement.nativeElement.remove();
  });

  it('should create the component', async(() => {
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  }));

  it('should render a dialog title, content and actions', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    const title = compiled.querySelector('h1[mat-dialog-title]');
    expect(title).toBeTruthy();
    const content = compiled.querySelector('div[mat-dialog-content]');
    expect(content).toBeTruthy();
    const actions = compiled.querySelector('div[mat-dialog-actions]');
    expect(actions).toBeTruthy();
  }));

  describe('has a constructor that', () => {

    it('creates a form group with the controls populated by the passed in data', () => {
      const component = fixture.componentInstance;
      expect(component.form).toBeTruthy();
      expect(component.form.value.shows).toEqual('s1\ns2');
      expect(component.form.value.initials).toEqual('i1\ni2');
      expect(component.form.controls.resetCategories.value).toBeFalse();
      expect(component.form.controls.resetCategories.disabled).toBeFalse();
    });

  });

  describe('has a submit function that', () => {

    it('closes the dialog and returns the data entered by the user', () => {
      const component = fixture.componentInstance;
      component.form.patchValue({ shows: 's3\ns4', initials: 'i3\ni4', allowCategoryReset: false });
      component.submit();
      expect(component.dialogRef.close).toHaveBeenCalledWith({ shows: ['s3', 's4'], initials: ['i3', 'i4'], resetCategories: false });
    });

  });

});
