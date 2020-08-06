import { AsyncSubject } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { FormBuilder } from '@angular/forms';
import { ClipboardService } from './clipboard.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ElectronService } from 'ngx-electron';
import { MatDialog } from '@angular/material/dialog';
import { DEFAULT_CATEGORIES } from './default-categories';
import * as xslx from 'xlsx';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';
import { AboutDialogComponent } from './about-dialog/about-dialog.component';

describe('AppComponent', () => {

  let fixture;
  let electronService: any;
  let ipcRenderer: any;
  let eventMap = {};
  let clipboardService: any;
  let snackbar: any;
  let dialogService: any;

  beforeEach(async(() => {

    ipcRenderer = jasmine.createSpyObj('ipcRenderer', ['on', 'send']);
    electronService = { isMacOS: true, ipcRenderer };
    ipcRenderer.on.and.callFake((evt, fn) => {
      eventMap[evt] = fn;
    });
    clipboardService = jasmine.createSpyObj('snackbar', ['copyText']);
    snackbar = jasmine.createSpyObj('snackbar', ['open']);
    dialogService = jasmine.createSpyObj('dialogService', ['open']);

    TestBed.configureTestingModule({
      imports: [
        MatAutocompleteModule,
        MatIconModule,
        MatTabsModule,
        MatCheckboxModule,
        MatFormFieldModule,
      ],
      providers: [
        FormBuilder,
        { provide: ElectronService, useValue: electronService },
        { provide: ClipboardService, useValue: clipboardService },
        { provide: MatSnackBar, useValue: snackbar },
        { provide: MatDialog, useValue: dialogService },
      ],
      declarations: [
        AppComponent,
      ],
    }).compileComponents();

    spyOn(console, 'info');
  }));

  afterEach(() => {
    fixture.debugElement.nativeElement.remove();
  });

  it('should create the app', () => {
    fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render some elements on the page', () => {
    fixture = TestBed.createComponent(AppComponent);
    const compiled = fixture.nativeElement;
    const tabGroup = compiled.querySelector('mat-tab-group');
    expect(tabGroup).toBeTruthy();
  });

  describe('has a constructor that', () => {

    it('sets the isMac flag to the value provided by the electron service', () => {
      fixture = TestBed.createComponent(AppComponent);
      expect(fixture.componentInstance.isMac).toBe(true);
    });

    it('gets a list of user initials from local storage and stores them if they are there', () => {
      spyOn(localStorage, 'getItem').and.returnValue('["aa", "bb"]');
      fixture = TestBed.createComponent(AppComponent);
      expect(fixture.componentInstance.initialsList).toEqual(['aa', 'bb']);
    });

    it('stores an empty list for user initials if there are no initials stored in local storage', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);
      fixture = TestBed.createComponent(AppComponent);
      expect(fixture.componentInstance.initialsList).toEqual([]);
    });

    it('gets a list of user shows from local storage and stores them if they are there', () => {
      spyOn(localStorage, 'getItem').and.returnValue('["aa", "bb"]');
      fixture = TestBed.createComponent(AppComponent);
      expect(fixture.componentInstance.showsList).toEqual(['aa', 'bb']);
    });

    it('stores an empty list for user shows if there are no initials stored in local storage', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);
      fixture = TestBed.createComponent(AppComponent);
      expect(fixture.componentInstance.showsList).toEqual([]);
    });

    it('stores a list of categories if they are available in local storage', () => {
      const strCategories = '[{"category":"AIR","subCategory":"MISC","catID":"AIRMisc","catShort":"AIR","explanations":"Air sounds not fitting another category in this list.","synonyms":"!!!","filterTestValue":"airmiscairmisc"}]';
      spyOn(localStorage, 'getItem').and.returnValue(strCategories);
      fixture = TestBed.createComponent(AppComponent);
      expect(fixture.componentInstance.categoryItems).toEqual(JSON.parse(strCategories));
      expect(console.info).toHaveBeenCalledWith('loading categories from local storage');
    });

    it('stores the default list of categories if there are none saved in local storage', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);
      fixture = TestBed.createComponent(AppComponent);
      expect(fixture.componentInstance.categoryItems).toEqual(DEFAULT_CATEGORIES);
      expect(console.info).toHaveBeenCalledWith('loading default categories');
    });

    it('creates a form group for the category form on the first tab of the UI', () => {
      fixture = TestBed.createComponent(AppComponent);
      const component = fixture.componentInstance;
      expect(component.categoryForm.controls.category).toBeTruthy();
      expect(component.categoryForm.controls.subCategory).toBeTruthy();
      expect(component.categoryForm.controls.catID).toBeTruthy();
      expect(component.categoryForm.controls.catShort).toBeTruthy();
      expect(component.categoryForm.controls.searchCategorySynonyms).toBeTruthy();
      expect(component.categoryForm.controls.categoryKeyword).toBeTruthy();
      expect(component.categoryForm.controls.categoryScript).toBeTruthy();
      expect(component.categoryForm.controls.autorunCategoryScript).toBeTruthy();
      expect(component.categoryForm.value.category).toBeTrue();
      expect(component.categoryForm.value.subCategory).toBeTrue();
      expect(component.categoryForm.value.catID).toBeTrue();
      expect(component.categoryForm.value.catShort).toBeFalse();
      expect(component.categoryForm.value.searchCategorySynonyms).toBeTrue();
      expect(component.categoryForm.value.categoryKeyword).toEqual(null);
      expect(component.categoryForm.value.categoryScript).toEqual('');
      expect(component.categoryForm.value.autorunCategoryScript).toBeFalse();
    });

    it('creates a form group for the category form on the first tab of the UI', () => {
      spyOn(localStorage, 'getItem').and.returnValue('true');
      fixture = TestBed.createComponent(AppComponent);
      const component = fixture.componentInstance;
      expect(component.categoryForm.controls.category).toBeTruthy();
      expect(component.categoryForm.controls.subCategory).toBeTruthy();
      expect(component.categoryForm.controls.catID).toBeTruthy();
      expect(component.categoryForm.controls.catShort).toBeTruthy();
      expect(component.categoryForm.controls.searchCategorySynonyms).toBeTruthy();
      expect(component.categoryForm.controls.categoryKeyword).toBeTruthy();
      expect(component.categoryForm.controls.categoryScript).toBeTruthy();
      expect(component.categoryForm.controls.autorunCategoryScript).toBeTruthy();
      expect(component.categoryForm.value.category).toBeTrue();
      expect(component.categoryForm.value.subCategory).toBeTrue();
      expect(component.categoryForm.value.catID).toBeTrue();
      expect(component.categoryForm.value.catShort).toBeFalse();
      expect(component.categoryForm.value.searchCategorySynonyms).toBeTrue();
      expect(component.categoryForm.value.categoryKeyword).toEqual(null);
      expect(component.categoryForm.value.categoryScript).toEqual('');
      expect(component.categoryForm.value.autorunCategoryScript).toBeTrue();
    });

    it('creates a form group for the filename form on the second tab of the UI', () => {
      fixture = TestBed.createComponent(AppComponent);
      const component = fixture.componentInstance;
      expect(component.filenameForm.controls.userCategory).toBeTruthy();
      expect(component.filenameForm.controls.vendorCategory).toBeTruthy();
      expect(component.filenameForm.controls.fxName).toBeTruthy();
      expect(component.filenameForm.controls.initials).toBeTruthy();
      expect(component.filenameForm.controls.show).toBeTruthy();
      expect(component.filenameForm.controls.userInfo).toBeTruthy();
      expect(component.filenameForm.controls.searchFilenameSynonyms).toBeTruthy();
      expect(component.filenameForm.controls.filenameKeyword).toBeTruthy();
      expect(component.filenameForm.controls.filenameScript).toBeTruthy();
      expect(component.filenameForm.controls.autorunFilenameScript).toBeTruthy();
      expect(component.filenameForm.value.userCategory).toEqual('');
      expect(component.filenameForm.value.vendorCategory).toEqual('');
      expect(component.filenameForm.value.fxName).toEqual('');
      expect(component.filenameForm.value.initials).toEqual('');
      expect(component.filenameForm.value.show).toEqual('');
      expect(component.filenameForm.value.userInfo).toEqual('');
      expect(component.filenameForm.value.searchFilenameSynonyms).toBeTrue();
      expect(component.filenameForm.value.filenameKeyword).toBeNull()
      expect(component.filenameForm.value.filenameScript).toEqual('');
      expect(component.filenameForm.value.autorunFilenameScript).toBeFalse();
    });

    it('creates a form group for the filename form on the second tab of the UI', () => {
      spyOn(localStorage, 'getItem').and.callFake((param) => {
        if (param === 'initials') {
          return 'abc';
        } else if (param === 'show') {
          return 'def';
        }
        return null;
      })
      fixture = TestBed.createComponent(AppComponent);
      const component = fixture.componentInstance;
      expect(component.filenameForm.controls.userCategory).toBeTruthy();
      expect(component.filenameForm.controls.vendorCategory).toBeTruthy();
      expect(component.filenameForm.controls.fxName).toBeTruthy();
      expect(component.filenameForm.controls.initials).toBeTruthy();
      expect(component.filenameForm.controls.show).toBeTruthy();
      expect(component.filenameForm.controls.userInfo).toBeTruthy();
      expect(component.filenameForm.controls.searchFilenameSynonyms).toBeTruthy();
      expect(component.filenameForm.controls.filenameKeyword).toBeTruthy();
      expect(component.filenameForm.controls.filenameScript).toBeTruthy();
      expect(component.filenameForm.controls.autorunFilenameScript).toBeTruthy();
      expect(component.filenameForm.value.userCategory).toEqual('');
      expect(component.filenameForm.value.vendorCategory).toEqual('');
      expect(component.filenameForm.value.fxName).toEqual('');
      expect(component.filenameForm.value.initials).toEqual('abc');
      expect(component.filenameForm.value.show).toEqual('def');
      expect(component.filenameForm.value.userInfo).toEqual('');
      expect(component.filenameForm.value.searchFilenameSynonyms).toBeTrue();
      expect(component.filenameForm.value.filenameKeyword).toBeNull()
      expect(component.filenameForm.value.filenameScript).toEqual('');
      expect(component.filenameForm.value.autorunFilenameScript).toBeFalse();
    });

    it('updates the filename that will be copied to the clipboard without further changes', () => {
      spyOn(localStorage, 'getItem').and.callFake((param) => {
        if (param === 'initials') {
          return 'abc';
        } else if (param === 'show') {
          return 'def';
        }
        return null;
      })
      fixture = TestBed.createComponent(AppComponent);
      const component = fixture.componentInstance;
      expect(component.filename).toEqual('?_?_abc_def');
    });

    it('listens for a menu event to run an applescript and runs it for the currently selected tab', () => {
      fixture = TestBed.createComponent(AppComponent);
      const component = fixture.componentInstance;
      spyOn(component, 'runApplescriptForTab');

      component.selectedTab = 0;
      eventMap['run-applescript']();
      expect(component.runApplescriptForTab).toHaveBeenCalledWith(0);

      component.selectedTab = 1;
      eventMap['run-applescript']();
      expect(component.runApplescriptForTab).toHaveBeenCalledWith(1);
    });

    it('listens for a menu event to copy the filename to the clipboard and calls a method to do that if the filename is valid', () => {
      fixture = TestBed.createComponent(AppComponent);
      const component = fixture.componentInstance;
      component.filenameForm.patchValue({ filenameKeyword: DEFAULT_CATEGORIES[0], fxName: 'F', initials: 'I', show: 'S', userInfo: 'U', vendorCategory: 'V' });
      spyOn(component, 'copyFilename');

      eventMap['copy-filename']();
      expect(component.copyFilename).toHaveBeenCalled();
    });

    it('listens for a menu event to copy the filename to the clipboard and doesn\'t call a method to do that if the form is not valid', () => {
      fixture = TestBed.createComponent(AppComponent);
      const component = fixture.componentInstance;
      component.filenameForm.patchValue({ fxName: null });
      spyOn(component, 'copyFilename');

      eventMap['copy-filename']();
      expect(component.copyFilename).not.toHaveBeenCalled();
    });

    it('listens for a menu event to show the settings dialog and opens it', () => {
      fixture = TestBed.createComponent(AppComponent);
      const component = fixture.componentInstance;
      spyOn(component, 'openSettings');

      eventMap['show-settings']();
      expect(component.openSettings).toHaveBeenCalled();
    });

    it('listens for a menu event to select a category and sets the focus to the category control of the current tab', () => {
      fixture = TestBed.createComponent(AppComponent);
      const component = fixture.componentInstance;
      component.selectedTab = 1;
      spyOn(component, 'focusCategory');

      eventMap['select-category']();
      expect(component.focusCategory).toHaveBeenCalledWith(1);
    });

    it('listens for a menu event to show the about dialog and opens it', () => {
      fixture = TestBed.createComponent(AppComponent);
      const component = fixture.componentInstance;
      eventMap['show-about']({}, '1.1');
      expect(dialogService.open).toHaveBeenCalledWith(AboutDialogComponent, { disableClose: false, autoFocus: false, data: { version: '1.1' }});
    });

  });

  describe('has an ngOnInit function that', () => {

    let component;

    beforeEach(() => {
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      spyOn(component, 'categorySelected');
      spyOn(component, 'updateFilename');
      component.ngOnInit();
    });

    it('watches for text changes on the category keyword control and updaes the filtered list of category items', () => {
      const item = DEFAULT_CATEGORIES[0];
      let iteration = 0;
      component.filteredCategoryItems.subscribe((items) => {
        if (iteration === 0) {
          expect(items).toEqual(DEFAULT_CATEGORIES);
        } else {
          expect(items).toEqual([item]);
        }
        iteration++;
      });
      component.categoryKeywordControl.setValue(item.filterTestValue, { emitEvent: true });
    });

    it('watches for object changes on the category keyword control and updaes the filtered list of category items', () => {
      const item = DEFAULT_CATEGORIES[0];
      let iteration = 0;
      component.filteredCategoryItems.subscribe((items) => {
        if (iteration === 0) {
          expect(items).toEqual(DEFAULT_CATEGORIES);
        } else {
          expect(items).toEqual([item]);
        }
        iteration++;
      });
      component.categoryKeywordControl.setValue(item, { emitEvent: true });
    });

    it('watches for category updates and sets the currently selected category in the list', () => {
      const item = DEFAULT_CATEGORIES[0];
      component.categoryKeywordControl.setValue(item, { emitEvent: true });
      expect(component.categorySelected).toHaveBeenCalledWith(item, true);
    });

    it('watches for text changes on the filename keyword control and updaes the filtered list of category items', () => {
      const item = DEFAULT_CATEGORIES[0];
      let iteration = 0;
      component.filteredFilenameItems.subscribe((items) => {
        if (iteration === 0) {
          expect(items).toEqual(DEFAULT_CATEGORIES);
        } else {
          expect(items).toEqual([item]);
        }
        iteration++;
      });
      component.filenameKeywordControl.setValue(item.filterTestValue, { emitEvent: true });
    });

    it('watches for object changes on the filename keyword control and updaes the filtered list of category items', () => {
      const item = DEFAULT_CATEGORIES[0];
      let iteration = 0;
      component.filteredFilenameItems.subscribe((items) => {
        if (iteration === 0) {
          expect(items).toEqual(DEFAULT_CATEGORIES);
        } else {
          expect(items).toEqual([item]);
        }
        iteration++;
      });
      component.filenameKeywordControl.setValue(item, { emitEvent: true });
    });

    it('watches for category updates and sets the currently selected category in the list', () => {
      const item = DEFAULT_CATEGORIES[0];
      component.filenameKeywordControl.setValue(item, { emitEvent: true });
      expect(component.updateFilename).toHaveBeenCalledWith(item, true);
    });

  });

  describe('has a categorySelected function that', () => {

    let component;

    beforeEach(() => {
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
    });

    it('copies the category text to the clipboard and shows a snackbar when all data is present', () => {
      const item = DEFAULT_CATEGORIES[0];
      component.categoryForm.patchValue({ category: item.category, subCategory: item.subCategory, catID: item.catID, catShort: item.catShort });
      component.categorySelected(item);
      const text = `${item.category} ${item.subCategory} ${item.catID} ${item.catShort}`;
      expect(component.clipboard.copyText).toHaveBeenCalledWith(text);
      expect(snackbar.open).toHaveBeenCalledWith(`'${text}' copied to the clipboard`, null, { duration: 3000 });
    });

    it('copies the category text to the clipboard and shows a snackbar when only category is present', () => {
      const item = DEFAULT_CATEGORIES[0];
      component.categoryForm.patchValue({ category: item.category, subCategory: '', catID: '', catShort: '' });
      component.categorySelected(item);
      const text = `${item.category}`;
      expect(component.clipboard.copyText).toHaveBeenCalledWith(text);
      expect(snackbar.open).toHaveBeenCalledWith(`'${text}' copied to the clipboard`, null, { duration: 3000 });
    });

    it('copies the category text to the clipboard and shows a snackbar when only subCategory is present', () => {
      const item = DEFAULT_CATEGORIES[0];
      component.categoryForm.patchValue({ category: '', subCategory: item.subCategory, catID: '', catShort: '' });
      component.categorySelected(item);
      const text = `${item.subCategory}`;
      expect(component.clipboard.copyText).toHaveBeenCalledWith(text);
      expect(snackbar.open).toHaveBeenCalledWith(`'${text}' copied to the clipboard`, null, { duration: 3000 });
    });

    it('copies the category text to the clipboard and shows a snackbar when only catID is present', () => {
      const item = DEFAULT_CATEGORIES[0];
      component.categoryForm.patchValue({ category: '', subCategory: '', catID: item.catID, catShort: '' });
      component.categorySelected(item);
      const text = `${item.catID}`;
      expect(component.clipboard.copyText).toHaveBeenCalledWith(text);
      expect(snackbar.open).toHaveBeenCalledWith(`'${text}' copied to the clipboard`, null, { duration: 3000 });
    });

    it('copies the category text to the clipboard and shows a snackbar when only catShort is present', () => {
      const item = DEFAULT_CATEGORIES[0];
      component.categoryForm.patchValue({ category: '', subCategory: '', catID: '', catShort: item.catShort });
      component.categorySelected(item);
      const text = `${item.catShort}`;
      expect(component.clipboard.copyText).toHaveBeenCalledWith(text);
      expect(snackbar.open).toHaveBeenCalledWith(`'${text}' copied to the clipboard`, null, { duration: 3000 });
    });

    it('doesn\'t copy the category text to the clipboard or show a snackbar if there is nothing to copy', () => {
      const item = DEFAULT_CATEGORIES[0];
      component.categoryForm.patchValue({ category: '', subCategory: '', catID: '', catShort: '' });
      component.categorySelected(item);
      expect(component.clipboard.copyText).not.toHaveBeenCalled();
      expect(snackbar.open).not.toHaveBeenCalled();
    });

    it('runs the appleScript if there is a script available and the autoRun flag and we are on a mac is set', () => {
      const item = DEFAULT_CATEGORIES[0];
      component.categoryForm.patchValue({ category: item.category, subCategory: item.subCategory,
        catID: item.catID, catShort: item.catShort, categoryScript: 'some script', autorunCategoryScript: true });
      component.isMac = true;
      component.categorySelected(item);
      expect(electronService.ipcRenderer.send).toHaveBeenCalledWith('run-applescript', 'some script');
    });

    it('doesn\'t run the appleScript if there is a script available and the autoRun flag is not set', () => {
      const item = DEFAULT_CATEGORIES[0];
      component.categoryForm.patchValue({ category: item.category, subCategory: item.subCategory,
        catID: item.catID, catShort: item.catShort, categoryScript: 'some script', autorunCategoryScript: false });
      component.isMac = true;
      component.categorySelected(item);
      expect(electronService.ipcRenderer.send).not.toHaveBeenCalled();
    });

    it('doesn\'t run the appleScript if there is a script available and the autoRun flag is set but we\'re not on a mac', () => {
      const item = DEFAULT_CATEGORIES[0];
      component.categoryForm.patchValue({ category: item.category, subCategory: item.subCategory,
        catID: item.catID, catShort: item.catShort, categoryScript: 'some script', autorunCategoryScript: true });
      component.isMac = false;
      component.categorySelected(item);
      expect(electronService.ipcRenderer.send).not.toHaveBeenCalled();
    });

  });

  describe('has a formatCategoryItem function that', () => {

    let component;

    beforeEach(() => {
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
    });

    it('returns a trimmed string with the passed in category item information for display in the selection list', () => {
      const item = DEFAULT_CATEGORIES[0];
      const displayVal = `${item.category} ${item.subCategory} ${item.catID}`;
      expect(component.formatCategoryItem(item)).toEqual(displayVal);
      expect(component.formatCategoryItem({ ...item, category: ' ' + item.category, catID: item.catID + ' ' })).toEqual(displayVal);
    });

    it('returns null if the passed in value is null', () => {
      expect(component.formatCategoryItem(null)).toBeNull();
    });

  });

  describe('has a clearCategoryKeyword function that', () => {

    let component;

    beforeEach(() => {
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      spyOn(component.categoryKeywordControl, 'setValue');
    });

    it('resets all the input controls to blank values', () => {
      component.clearCategoryKeyword();
      expect(component.categoryKeywordControl.setValue).toHaveBeenCalledWith({ category: '', subCategory: '', catID: '', catShort: '' });
    });

  });

  describe('has a clearFilenameKeyword function that', () => {

    let component;

    beforeEach(() => {
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      spyOn(component.filenameKeywordControl, 'setValue');
    });

    it('resets all the input controls to blank values', () => {
      component.clearFilenameKeyword();
      expect(component.filenameKeywordControl.setValue).toHaveBeenCalledWith({ category: '', subCategory: '', catID: '', catShort: '' });
    });

  });

  describe('has an importFile function that', () => {

    let component;
    let reader;

    beforeEach(() => {
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      reader = jasmine.createSpyObj('reader', ['readAsArrayBuffer']);
      spyOn(window, 'FileReader').and.returnValue(reader);
      spyOn(localStorage, 'setItem');
      spyOn(component, 'clearCategoryKeyword');
      spyOn(component, 'clearFilenameKeyword');
    });

    it('reads the file selected by the user', () => {
      const file = 'file';
      component.importFile({ srcElement: { files: [file] } });
      expect(reader.readAsArrayBuffer).toHaveBeenCalledWith(file);
    });

    it('loads data from the file when it gets the onload event after opening the file', () => {
      const result = new Uint8Array();
      const sheet = {};
      spyOn(window, 'Uint8Array').and.returnValue(result);
      spyOn(xslx, 'read').and.returnValue({ SheetNames: ['sheet1'], Sheets: { sheet1: sheet } });
      component.importFile({ srcElement: { files: ['file'] } });
      reader.onload({ target: { result: 'result' } });
      expect(window.Uint8Array).toHaveBeenCalledWith('result');
      expect(xslx.read).toHaveBeenCalledWith(result, { type: 'array' });
    });

    it('creates a list of items from the spreadsheet and stores them locally to use in the UI selector', () => {
      const result = new Uint8Array();
      const sheet = { A4: { v: 'a' }, B4: { v: 'b' }, C4: { v: 'c' }, D4: { v: 'd' }, E4: { v: 'e' } };
      spyOn(window, 'Uint8Array').and.returnValue(result);
      spyOn(xslx, 'read').and.returnValue({ SheetNames: ['sheet1'], Sheets: { sheet1: sheet } });
      component.importFile({ srcElement: { files: ['file'] } });
      reader.onload({ target: { result: 'result' } });
      const item = { category: 'a', subCategory: 'b', catID: 'c', catShort: 'd', explanations: 'e', synonyms: '!!!', filterTestValue: 'abc' };
      expect(component.categoryItems).toEqual([item]);
    });

    it('stores the updated list in localStorage', () => {
      const result = new Uint8Array();
      const sheet = { A4: { v: 'a' }, B4: { v: 'b' }, C4: { v: 'c' }, D4: { v: 'd' }, E4: { v: 'e' } };
      spyOn(window, 'Uint8Array').and.returnValue(result);
      spyOn(xslx, 'read').and.returnValue({ SheetNames: ['sheet1'], Sheets: { sheet1: sheet } });
      component.importFile({ srcElement: { files: ['file'] } });
      reader.onload({ target: { result: 'result' } });
      const item = { category: 'a', subCategory: 'b', catID: 'c', catShort: 'd', explanations: 'e', synonyms: '!!!', filterTestValue: 'abc' };
      expect(localStorage.setItem).toHaveBeenCalledWith('categories', JSON.stringify([item]));
    });

    it('clears the forms so we can start fresh with the newly imported data', () => {
      const result = new Uint8Array();
      const sheet = { A4: { v: 'a' }, B4: { v: 'b' }, C4: { v: 'c' }, D4: { v: 'd' }, E4: { v: 'e' } };
      spyOn(window, 'Uint8Array').and.returnValue(result);
      spyOn(xslx, 'read').and.returnValue({ SheetNames: ['sheet1'], Sheets: { sheet1: sheet } });
      component.importFile({ srcElement: { files: ['file'] } });
      reader.onload({ target: { result: 'result' } });
      expect(component.clearCategoryKeyword).toHaveBeenCalled();
      expect(component.clearFilenameKeyword).toHaveBeenCalled();
    });

  });

  describe('has an updateFilename function that', () => {

    let component;

    beforeEach(() => {
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
    });

    it('generates a filename with some placeholders for missing elements', () => {
      const item = DEFAULT_CATEGORIES[0];
      component.filenameForm.patchValue({ filenameKeyword: DEFAULT_CATEGORIES[0] });
      component.updateFilename(null);
      expect(component.filename).toEqual(`${item.catID}_?_?_?`);
    });

    it('generates a filename with some placeholders for missing elements and a user category', () => {
      const item = DEFAULT_CATEGORIES[0];
      component.filenameForm.patchValue({ filenameKeyword: DEFAULT_CATEGORIES[0], userCategory: 'u' });
      component.updateFilename(null);
      expect(component.filename).toEqual(`${item.catID}-u_?_?_?`);
    });

    it('generates a filename with some placeholders for missing elements and a vendor category', () => {
      const item = DEFAULT_CATEGORIES[0];
      component.filenameForm.patchValue({ filenameKeyword: DEFAULT_CATEGORIES[0], vendorCategory: 'v' });
      component.updateFilename(null);
      expect(component.filename).toEqual(`${item.catID}_v-?_?_?`);
    });

    it('generates a filename with some placeholders for missing elements and an fx name', () => {
      const item = DEFAULT_CATEGORIES[0];
      component.filenameForm.patchValue({ filenameKeyword: DEFAULT_CATEGORIES[0], fxName: 'f' });
      component.updateFilename(null);
      expect(component.filename).toEqual(`${item.catID}_f_?_?`);
    });

    it('generates a filename with some placeholders for missing elements and initials', () => {
      const item = DEFAULT_CATEGORIES[0];
      component.filenameForm.patchValue({ filenameKeyword: DEFAULT_CATEGORIES[0], initials: 'i' });
      component.updateFilename(null);
      expect(component.filename).toEqual(`${item.catID}_?_i_?`);
    });

    it('generates a filename with some placeholders for missing elements and a show name', () => {
      const item = DEFAULT_CATEGORIES[0];
      component.filenameForm.patchValue({ filenameKeyword: DEFAULT_CATEGORIES[0], show: 's' });
      component.updateFilename(null);
      expect(component.filename).toEqual(`${item.catID}_?_?_s`);
    });

    it('generates a filename with some placeholders for missing elements and extra user info', () => {
      const item = DEFAULT_CATEGORIES[0];
      component.filenameForm.patchValue({ filenameKeyword: DEFAULT_CATEGORIES[0], userInfo: 'u' });
      component.updateFilename(null);
      expect(component.filename).toEqual(`${item.catID}_?_?_?_u`);
    });

    it('generates a filename with no missing data and not optional data', () => {
      const item = DEFAULT_CATEGORIES[0];
      component.filenameForm.patchValue({ filenameKeyword: DEFAULT_CATEGORIES[0], fxName: 'f', initials: 'i', show: 's' });
      component.updateFilename(null);
      expect(component.filename).toEqual(`${item.catID}_f_i_s`);
    });

    it('generates a filename with no missing data and all optional data', () => {
      const item = DEFAULT_CATEGORIES[0];
      component.filenameForm.patchValue({ filenameKeyword: DEFAULT_CATEGORIES[0], fxName: 'f', initials: 'i', show: 's',
        userCategory: 'uc', vendorCategory: 'vc', userInfo: 'ui' });
      component.updateFilename(null);
      expect(component.filename).toEqual(`${item.catID}-uc_vc-f_i_s_ui`);
    });

    it('generates a filename with no missing data and no optional data when the item is passed in', () => {
      const item = DEFAULT_CATEGORIES[0];
      component.filenameForm.patchValue({ filenameKeyword: DEFAULT_CATEGORIES[0], fxName: 'f', initials: 'i', show: 's' });
      component.updateFilename({ ...item, catID: 'catID'});
      expect(component.filename).toEqual(`catID_f_i_s`);
    });

    it('generates a filename with no missing data and all optional data when the item is passed in', () => {
      const item = DEFAULT_CATEGORIES[0];
      component.filenameForm.patchValue({ filenameKeyword: DEFAULT_CATEGORIES[0], fxName: 'f', initials: 'i', show: 's',
        userCategory: 'uc', vendorCategory: 'vc', userInfo: 'ui' });
      component.updateFilename({ ...item, catID: 'catID'});
      expect(component.filename).toEqual(`catID-uc_vc-f_i_s_ui`);
    });

  });

  describe('has a copyFilename function that', () => {

    let component;

    beforeEach(() => {
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      spyOn(localStorage, 'setItem');
    });

    it('copies the current filename to the clipboard', () => {
      component.filename = 'testfilename';
      component.copyFilename();
      expect(clipboardService.copyText).toHaveBeenCalledWith('testfilename');
    });

    it('shows a snackbar with the copied text in it', () => {
      component.filename = 'testfilename';
      component.copyFilename();
      expect(snackbar.open).toHaveBeenCalledWith('\'testfilename\' copied to the clipboard', null, { duration: 3000 });
    });

    it('saves the current intials and show to localStorage', () => {
      component.filename = 'testfilename';
      component.filenameForm.patchValue({ initials: 'i', show: 's' });
      component.copyFilename();
      expect(localStorage.setItem).toHaveBeenCalledWith('initials', 'i');
      expect(localStorage.setItem).toHaveBeenCalledWith('show', 's');
    });

    it('it runs the current appleScript if there is one and the autorun checkbox is checked', () => {
      component.filename = 'testfilename';
      component.filenameForm.patchValue({ autorunFilenameScript: true, filenameScript: 'some script' });
      component.copyFilename();
      expect(ipcRenderer.send).toHaveBeenCalledWith('run-applescript', 'some script');
    });

    it('it doesn\'t run the current appleScript if the autorun checkbox is not checked', () => {
      component.filename = 'testfilename';
      component.filenameForm.patchValue({ autorunFilenameScript: false, filenameScript: 'some script' });
      component.copyFilename();
      expect(ipcRenderer.send).not.toHaveBeenCalled();
    });

    it('it doesn\'t run  the current appleScript if there isn\'t one and the autorun checkbox is checked', () => {
      component.filename = 'testfilename';
      component.filenameForm.patchValue({ autorunFilenameScript: true, filenameScript: '' });
      component.copyFilename();
      expect(ipcRenderer.send).not.toHaveBeenCalled();
    });

  });

  describe('has a runApplescriptForTab function that', () => {

    let component;

    beforeEach(() => {
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
    });

    it('runs the category applescript if there is a script if the tab is 0 and we are on a mac', () => {
      component.categoryForm.patchValue({ categoryScript: 'some script' });
      component.isMac = true;
      component.runApplescriptForTab(0);
      expect(ipcRenderer.send).toHaveBeenCalledWith('run-applescript', 'some script');
    });

    it('opens a snackbar with a message about the script run if the script was run for the category tab', () => {
      component.categoryForm.patchValue({ categoryScript: 'some script' });
      component.isMac = true;
      component.runApplescriptForTab(0);
      expect(snackbar.open).toHaveBeenCalledWith('Ran applescript for \'Category\' tab', null, { duration: 3000 });
    });

    it('doesn\'t run the category applescript if there is no script', () => {
      component.categoryForm.patchValue({ categoryScript: '' });
      component.isMac = true;
      component.runApplescriptForTab(0);
      expect(ipcRenderer.send).not.toHaveBeenCalled();
    });

    it('doesn\'t open a snackbar if there is no script to run on the category tab', () => {
      component.categoryForm.patchValue({ categoryScript: '' });
      component.isMac = true;
      component.runApplescriptForTab(0);
      expect(snackbar.open).not.toHaveBeenCalled();
    });

    it('runs the filename applescript if there is a script if the tab is 1 and we are on a mac', () => {
      component.filenameForm.patchValue({ filenameScript: 'some script' });
      component.isMac = true;
      component.runApplescriptForTab(1);
      expect(ipcRenderer.send).toHaveBeenCalledWith('run-applescript', 'some script');
    });

    it('opens a snackbar with a message about the script run if the script was run for the filename tab', () => {
      component.filenameForm.patchValue({ filenameScript: 'some script' });
      component.isMac = true;
      component.runApplescriptForTab(1);
      expect(snackbar.open).toHaveBeenCalledWith('Ran applescript for \'Filename\' tab', null, { duration: 3000 });
    });

    it('doesn\'t run the filename applescript if there is no script', () => {
      component.filenameForm.patchValue({ filenameScript: '' });
      component.isMac = true;
      component.runApplescriptForTab(1);
      expect(ipcRenderer.send).not.toHaveBeenCalled();
    });

    it('doesn\'t open a snackbar if there is no script to run on the filename tab', () => {
      component.filenameForm.patchValue({ filenameScript: '' });
      component.isMac = true;
      component.runApplescriptForTab(1);
      expect(snackbar.open).not.toHaveBeenCalled();
    });

    it('doesn\t run a script if the tab is not 0 or 1', () => {
      component.filenameForm.patchValue({ categoryScript: 'some script', filenameScript: 'some script' });
      component.isMac = true;
      component.runApplescriptForTab(-1);
      component.runApplescriptForTab(2);
      component.runApplescriptForTab(10);
      component.runApplescriptForTab(50);
      expect(ipcRenderer.send).not.toHaveBeenCalled();
      expect(snackbar.open).not.toHaveBeenCalled();
    });

    it('doesn\t run a script if we are not on a mac', () => {
      component.filenameForm.patchValue({ categoryScript: 'some script', filenameScript: 'some script' });
      component.isMac = false;
      component.runApplescriptForTab(0);
      component.runApplescriptForTab(1);
      expect(ipcRenderer.send).not.toHaveBeenCalled();
      expect(snackbar.open).not.toHaveBeenCalled();
    });

  });

  describe('has a changeAutorunCategoryScript function that', () => {

    let component;

    beforeEach(() => {
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      spyOn(localStorage, 'setItem');
      spyOn(localStorage, 'removeItem');
    });

    it('saves the autorun state to localStorage when the checkbox is checked', () => {
      component.changeAutorunCategoryScript({ checked: true });
      expect(localStorage.setItem).toHaveBeenCalledWith('autorunCategoryScript', 'true');
    });

    it('saves the autorun state to localStorage when the checkbox is not checked', () => {
      component.changeAutorunCategoryScript({ checked: false });
      expect(localStorage.removeItem).toHaveBeenCalledWith('autorunCategoryScript');
    });

  });

  describe('has a changeAutorunFilenameScript function that', () => {

    let component;

    beforeEach(() => {
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      spyOn(localStorage, 'setItem');
      spyOn(localStorage, 'removeItem');
    });

    it('saves the autorun state to localStorage when the checkbox is checked', () => {
      component.changeAutorunFilenameScript({ checked: true });
      expect(localStorage.setItem).toHaveBeenCalledWith('autorunFilenameScript', 'true');
    });

    it('saves the autorun state to localStorage when the checkbox is not checked', () => {
      component.changeAutorunFilenameScript({ checked: false });
      expect(localStorage.removeItem).toHaveBeenCalledWith('autorunFilenameScript');
    });

  });

  describe('has an openSettings function that', () => {

    let component;
    let dialogRef;
    let dialogResult;

    beforeEach(() => {
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      dialogRef = jasmine.createSpyObj('dialog', ['afterClosed']);
      dialogService.open.and.returnValue(dialogRef);
      dialogResult = new AsyncSubject<any>();
      dialogRef.afterClosed.and.returnValue(dialogResult);
      spyOn(localStorage, 'setItem');
      spyOn(localStorage, 'removeItem');
    });

    it('opens a dialog to show the settings allowing category reset if we have imported categories', () => {
      spyOn(localStorage, 'getItem').and.returnValue('categoryList');
      component.showsList = 'sl';
      component.initialsList = 'il';
      component.openSettings();
      expect(dialogService.open).toHaveBeenCalledWith(SettingsDialogComponent, {
        disableClose: true,
        width: '22rem',
        data: { shows: 'sl', initials: 'il', allowCategoryReset: true }
      });
    });

    it('opens a dialog to show the settings disallowing category reset if we don\'t have imported categories', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);
      component.showsList = 'sl';
      component.initialsList = 'il';
      component.openSettings();
      expect(dialogService.open).toHaveBeenCalledWith(SettingsDialogComponent, {
        disableClose: true,
        width: '22rem',
        data: { shows: 'sl', initials: 'il', allowCategoryReset: false }
      });
    });

    it('stores the list of shows locally and to localStorage if there are any set in the settings returned from the dialog', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);
      component.openSettings();
      dialogResult.next({ shows: ['s1', 's2'], initials: [], resetCategories: false  });
      dialogResult.complete();
      expect(component.showsList).toEqual(['s1', 's2']);
      expect(localStorage.setItem).toHaveBeenCalledWith('showsList', '["s1","s2"]');
    });

    it('stores an empty list of shows locally and removes from localStorage if there aren\'t any set in the settings returned from the dialog', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);
      component.openSettings();
      dialogResult.next({ shows: [], initials: [], resetCategories: false  });
      dialogResult.complete();
      expect(component.showsList).toEqual([]);
      expect(localStorage.removeItem).toHaveBeenCalledWith('showsList');
    });

    it('stores the list of initials locally and to localStorage if there are any set in the settings returned from the dialog', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);
      component.openSettings();
      dialogResult.next({ shows: [], initials: ['i1', 'i2'], resetCategories: false });
      dialogResult.complete();
      expect(component.initialsList).toEqual(['i1', 'i2']);
      expect(localStorage.setItem).toHaveBeenCalledWith('initialsList', '["i1","i2"]');
    });

    it('stores an empty list of initials locally and to removes from localStorage if there are any set in the settings returned from the dialog', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);
      component.openSettings();
      dialogResult.next({ shows: [], initials: [], resetCategories: false });
      dialogResult.complete();
      expect(component.initialsList).toEqual([]);
      expect(localStorage.removeItem).toHaveBeenCalledWith('initialsList');
    });

    it('removes the categories from localStorage and resets the list to the default if resetCategories is set in the returned settings', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);
      component.openSettings();
      dialogResult.next({ shows: [], initials: [], resetCategories: true });
      dialogResult.complete();
      expect(localStorage.removeItem).toHaveBeenCalledWith('categories');
      expect(component.categoryItems).toEqual(DEFAULT_CATEGORIES);
    });

    it('doesn\'t do anything if the user cancelled from the dialog', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);
      component.openSettings();
      dialogResult.next(null);
      dialogResult.complete();
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(localStorage.removeItem).not.toHaveBeenCalled();
    });

  });

  describe('has a focusCategory function that', () => {

    let component;

    beforeEach(() => {
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      component.categorySelectorInput = { nativeElement: jasmine.createSpyObj('categoryNative', ['focus']) };
      component.filenameSelectorInput = { nativeElement: jasmine.createSpyObj('filenameNative', ['focus']) };
    });

    it('sets the focus to the category list dropdown if the current tab is 0', () => {
      component.focusCategory(0);
      expect(component.categorySelectorInput.nativeElement.focus).toHaveBeenCalled();
    });

    it('sets the focus to the filename list dropdown if the current tab is 1', () => {
      component.focusCategory(1);
      expect(component.filenameSelectorInput.nativeElement.focus).toHaveBeenCalled();
    });

    it('doesn\'t do anything if the tab is not 0 or 1', () => {
      component.focusCategory(-1);
      component.focusCategory(2);
      component.focusCategory(3);
      expect(component.categorySelectorInput.nativeElement.focus).not.toHaveBeenCalled();
      expect(component.filenameSelectorInput.nativeElement.focus).not.toHaveBeenCalled();

    });

  });

  describe('has a clearFilenameOptions function that', () => {

    let component;

    beforeEach(() => {
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
    });

    it('resets all the data on the filename form', () => {
      spyOn(component.filenameForm, 'patchValue');
      component.clearFilenameOptions();
      expect(component.filenameForm.patchValue).toHaveBeenCalledWith({ userCategory: '', vendorCategory: '',
        fxName: '', initials: '', show: '', filenameKeyword: '', userInfo: '' });
    });

    it('updates the filename that the user can copy to the clipboard', () => {
      spyOn(component, 'updateFilename');
      component.clearFilenameOptions();
      expect(component.updateFilename).toHaveBeenCalledWith(null);
    });

  });

});
