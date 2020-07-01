import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.scss']
})
export class SettingsDialogComponent {

  public form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<SettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
  ) {
    const shows = this.convertArray(data.shows);
    const initials = this.convertArray(data.initials);
    this.form = this.formBuilder.group({
      shows,
      initials,
      resetCategories: new FormControl({ value: false, disabled: !this.data.allowCategoryReset }),
    });
  }

  public submit() {
    this.dialogRef.close({
      shows: this.convertString(this.form.value.shows),
      initials: this.convertString(this.form.value.initials),
      resetCategories: this.form.value.resetCategories,
    });
  }

  private convertArray(vals: string[]): string {
    return vals.join('\n');
  }

  private convertString(val: string): string[] {
    return val.split('\n').filter((item) => !!item);
  }
}
