import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Observable, AsyncSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FormControl, FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { ClipboardService } from './clipboard.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DEFAULT_CATEGORIES } from './default-categories';
import { ElectronService } from 'ngx-electron';
import * as xslx from 'xlsx';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';
import { AboutDialogComponent } from './about-dialog/about-dialog.component';

interface CategoryItem {
  category: string;
  subCategory: string;
  catID: string;
  catShort: string;
  explanations: string;
  synonyms: string;
  filterTestValue: string;
}

enum Settings {
  CATEGORIES = 'categories',
  AUTORUN_CATEGORY_SCRIPT = 'autorunCategoryScript',
  AUTORUN_FILENAME_SCRIPT = 'autorunFilenameScript',
  INITIALS = 'initials',
  INITIALS_LIST = 'initialsList',
  SHOW = 'show',
  SHOWS_LIST = 'showsList',
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public categoryForm: FormGroup;
  public categoryKeywordControl = new FormControl();

  public filenameForm: FormGroup;
  public filenameKeywordControl = new FormControl(null, this.categoryValidator);

  public categoryItems: CategoryItem[];
  public filteredCategoryItems: Observable<CategoryItem[]>;
  public filteredFilenameItems: Observable<CategoryItem[]>;

  public filename = '';

  public isMac = false;
  public selectedTab = 0;

  public initialsList: string[];
  public showsList: string[];

  @ViewChild('categorySelectorInput', { static: false }) categorySelectorInput: ElementRef;
  @ViewChild('filenameSelectorInput', { static: false }) filenameSelectorInput: ElementRef;

  constructor(
    private fb: FormBuilder,
    private clipboard: ClipboardService,
    private snackBar: MatSnackBar,
    private electron: ElectronService,
    private dialog: MatDialog,
    private zone: NgZone,
  ) {
    this.isMac = this.electron.isMacOS;

    this.initialsList = this.getInitialsList();
    this.showsList = this.getShowsList();

    const categories = localStorage.getItem(Settings.CATEGORIES);
    if (categories) {
      console.info('loading categories from local storage');
      this.categoryItems = JSON.parse(categories);
    } else {
      console.info('loading default categories');
      this.categoryItems = DEFAULT_CATEGORIES;
    }

    const autorunCategoryScript = !!localStorage.getItem(Settings.AUTORUN_CATEGORY_SCRIPT);
    this.categoryForm = this.fb.group({
      category: true,
      subCategory: true,
      catID: true,
      catShort: false,
      searchCategorySynonyms: true,
      categoryKeyword: this.categoryKeywordControl,
      categoryScript: '',
      autorunCategoryScript,
    });

    const autorunFilenameScript = !!localStorage.getItem(Settings.AUTORUN_FILENAME_SCRIPT);
    this.filenameForm = this.fb.group({
      userCategory: '',
      vendorCategory: '',
      fxName: '',
      initials: localStorage.getItem(Settings.INITIALS) || '',
      show: localStorage.getItem(Settings.SHOW) || '',
      userInfo: '',
      searchFilenameSynonyms: true,

      filenameKeyword: this.filenameKeywordControl,
      filenameScript: '',
      autorunFilenameScript,
    });

    this.updateFilename(null);

    if (this.electron.ipcRenderer) {
      this.electron.ipcRenderer.on('run-applescript', () => {
        this.runApplescriptForTab(this.selectedTab);
      });

      this.electron.ipcRenderer.on('copy-filename', () => {
        if (this.filenameForm.valid) {
          this.copyFilename();
        }
      });

      this.electron.ipcRenderer.on('show-settings', () => {
        this.openSettings();
      });

      this.electron.ipcRenderer.on('select-category', () => {
        this.focusCategory(this.selectedTab);
      });

      this.electron.ipcRenderer.on('show-about', (evt, version) => {
        this.openAboutDialog(version);
      });
    }
  }

  ngOnInit() {
    this.filteredCategoryItems = this.categoryKeywordControl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterItems(value, this.categoryForm.value.searchCategorySynonyms))
    );
    this.categoryKeywordControl.registerOnChange(this.categorySelected.bind(this));

    this.filteredFilenameItems = this.filenameKeywordControl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterItems(value, this.filenameForm.value.searchFilenameSynonyms))
    );
    this.filenameKeywordControl.registerOnChange(this.updateFilename.bind(this));
  }

  public categorySelected(item: CategoryItem) {
    let text = '';
    if (this.categoryForm.value.category) {
      text += (' ' + item.category);
    }
    if (this.categoryForm.value.subCategory) {
      text += (' ' + item.subCategory);
    }
    if (this.categoryForm.value.catID) {
      text += (' ' + item.catID);
    }
    if (this.categoryForm.value.catShort) {
      text += (' ' + item.catShort);
    }
    text = text.trim();

    if (text) {
      this.clipboard.copyText(text);
      this.snackBar.open(`'${text}' copied to the clipboard`, null, { duration: 3000 });
      if (this.categoryForm.value.autorunCategoryScript) {
        this.runApplescript(this.categoryForm.value.categoryScript);
      }
    }
  }

  public formatCategoryItem(item: CategoryItem): string | null {
    if (item) {
      return `${item.category} ${item.subCategory} ${item.catID}`.trim();
    }
    return null;
  }

  public clearCategoryKeyword() {
    this.categoryKeywordControl.setValue({ category: '', subCategory: '', catID: '', catShort: '' });
  }

  public clearFilenameKeyword() {
    this.filenameKeywordControl.setValue({ category: '', subCategory: '', catID: '', catShort: '' });
  }

  public importFile(evt: any) {
    const file = evt.srcElement.files[0];
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = xslx.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      this.loadSheet(sheet);
    };
    reader.readAsArrayBuffer(file);
  }

  public updateFilename(item: CategoryItem | null) {
    const selectedItem = item ? item : this.filenameForm.value.filenameKeyword;
    const catId = selectedItem ? selectedItem.catID : '?';
    const userCategory = this.filenameForm.value.userCategory ? ('-' + this.filenameForm.value.userCategory) : '';
    const vendorCategory = this.filenameForm.value.vendorCategory ? (this.filenameForm.value.vendorCategory + '-') : '';
    const fxName = this.filenameForm.value.fxName || '?';
    const show = this.filenameForm.value.show || '?';
    const initials = this.filenameForm.value.initials || '?';
    const userInfo = this.filenameForm.value.userInfo ?('_' + this.filenameForm.value.userInfo) : '';
    this.filename = `${catId}${userCategory}_${vendorCategory}${fxName}_${initials}_${show}${userInfo}`;
  }

  public copyFilename() {
    this.clipboard.copyText(this.filename);
    this.snackBar.open(`'${this.filename}' copied to the clipboard`, null, { duration: 3000 });
    localStorage.setItem(Settings.INITIALS, this.filenameForm.value.initials);
    localStorage.setItem(Settings.SHOW, this.filenameForm.value.show);

    if (this.filenameForm.value.autorunFilenameScript) {
      this.runApplescript(this.filenameForm.value.filenameScript);
    }
  }

  public runApplescriptForTab(tab: number) {
    if (tab === 0) {
      if (this.runApplescript(this.categoryForm.value.categoryScript)) {
        this.snackBar.open('Ran applescript for \'Category\' tab', null, { duration: 3000 });
      };
    } else if (tab === 1) {
      if (this.runApplescript(this.filenameForm.value.filenameScript)) {
        this.snackBar.open('Ran applescript for \'Filename\' tab', null, { duration: 3000 });
      };
    }
  }

  public changeAutorunCategoryScript(evt: MatCheckboxChange) {
    if (evt.checked) {
      localStorage.setItem(Settings.AUTORUN_CATEGORY_SCRIPT, 'true');
    } else {
      localStorage.removeItem(Settings.AUTORUN_CATEGORY_SCRIPT);
    }
  }

  public changeAutorunFilenameScript(evt: MatCheckboxChange) {
    if (evt.checked) {
      localStorage.setItem(Settings.AUTORUN_FILENAME_SCRIPT, 'true');
    } else {
      localStorage.removeItem(Settings.AUTORUN_FILENAME_SCRIPT);
    }
  }

  public openSettings() {
    this.openSettingsDialog().subscribe((dialogRef) => {
      dialogRef.afterClosed().subscribe((settings) => {
        if (settings) {
          if (settings.shows.length > 0) {
            this.showsList = settings.shows;
            localStorage.setItem(Settings.SHOWS_LIST, JSON.stringify(this.showsList));
          } else {
            this.showsList = [];
            localStorage.removeItem(Settings.SHOWS_LIST);
          }
          if (settings.initials.length > 0) {
            this.initialsList = settings.initials;
            localStorage.setItem(Settings.INITIALS_LIST, JSON.stringify(this.initialsList));
          } else {
            this.initialsList = [];
            localStorage.removeItem(Settings.INITIALS_LIST);
          }
          if (settings.resetCategories) {
            localStorage.removeItem(Settings.CATEGORIES);
            this.categoryItems = DEFAULT_CATEGORIES;
          }
        }
      });
    });
  }

  public focusCategory(tab: number) {
    if (tab === 0) {
      this.categorySelectorInput.nativeElement.focus();
    } else if (tab === 1) {
      this.filenameSelectorInput.nativeElement.focus();
    }
  }

  public clearFilenameOptions() {
    this.filenameForm.patchValue({
      userCategory: '',
      vendorCategory: '',
      fxName: '',
      initials: '',
      show: '',
      filenameKeyword: '',
      userInfo: '',
    });
    this.updateFilename(null);
  }

  private getInitialsList() {
    const stored = localStorage.getItem(Settings.INITIALS_LIST);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  }

  private getShowsList() {
    const stored = localStorage.getItem(Settings.SHOWS_LIST);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  }

  private categoryValidator(control?: AbstractControl): { [key: string]: boolean } | null {
    return control.value && control.value.catID ? null : { invalidTime: true };
  }

  private loadSheet(sheet) {
    let row = 4;
    let category = this.getCell(sheet, 'A', row, null);
    this.categoryItems = [];
    while (category) {
      const subCategory = this.getCell(sheet, 'B', row);
      const catID = this.getCell(sheet, 'C', row);
      const filterTestValue = category.toLowerCase() + subCategory.toLowerCase() + catID.toLowerCase();
      const item: CategoryItem = {
        category,
        subCategory,
        catID,
        catShort: this.getCell(sheet, 'D', row),
        explanations: this.getCell(sheet, 'E', row),
        synonyms: this.getCell(sheet, 'F', row, '!!!'),
        filterTestValue,
      };
      this.categoryItems.push(item);

      row++;
      category = this.getCell(sheet, 'A', row, null);
    }
    localStorage.setItem(Settings.CATEGORIES, JSON.stringify(this.categoryItems));
    this.clearCategoryKeyword();
    this.clearFilenameKeyword();
  }

  private getCell(sheet: any[], col: string, row: number, missing: string = '???') {
    const cellName = col + row;
    return sheet[cellName] && sheet[cellName].v ? sheet[cellName].v : missing;
  }

  private filterItems(value: string | CategoryItem, synonyms: boolean): CategoryItem[] {
    const filterValue = typeof(value) === 'string' ? this.sanitizeFilter(value) : value.filterTestValue;
    return this.categoryItems.filter((item) => {
      let found = item.filterTestValue.includes(filterValue);
      if (!found && synonyms) {
        found = item.synonyms.toLocaleLowerCase().includes(filterValue);
      }
      return found;
    });
  }

  private sanitizeFilter(value: string): string {
    return value.replace(/\s+/g, '').trim().toLocaleLowerCase();
  }

  private runApplescript(script: string): boolean {
    if (this.isMac && script) {
      this.electron.ipcRenderer.send('run-applescript', script);
      return true;
    }
    return false;
  }

  private openSettingsDialog(): Observable<MatDialogRef<SettingsDialogComponent>> {
    const subject = new AsyncSubject<MatDialogRef<SettingsDialogComponent>>();
    this.zone.run(() => {
      const allowCategoryReset = !!localStorage.getItem(Settings.CATEGORIES);
      const config: MatDialogConfig = {
        disableClose: true,
        width: '22rem',
        data: { shows: this.showsList, initials: this.initialsList, allowCategoryReset }
      };
      subject.next(this.dialog.open(SettingsDialogComponent, config));
      subject.complete();
    });
    return subject;
  }

  private openAboutDialog(version: string) {
    this.zone.run(() => {
      const config: MatDialogConfig = {
        disableClose: false,
        autoFocus: false,
        data: { version }
      };
      this.dialog.open(AboutDialogComponent, config);
    });
  }
}
