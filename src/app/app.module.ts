import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { TabDirective } from './tab.directive';
import { ClipboardService } from './clipboard.service';
import { NgxElectronModule } from 'ngx-electron';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';
import { AboutDialogComponent } from './about-dialog/about-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    TabDirective,
    SettingsDialogComponent,
    AboutDialogComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    MatTooltipModule,
    MatTabsModule,
    MatButtonModule,
    MatSelectModule,
    NgxElectronModule,
    MatDialogModule,
  ],
  providers: [
    ClipboardService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
