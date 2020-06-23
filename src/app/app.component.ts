import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FormControl, FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { ClipboardService } from './clipboard.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DEFAULT_CATEGORIES } from './default-categories';
import * as xslx from 'xlsx';

interface CategoryItem {
  category: string;
  subCategory: string;
  catID: string;
  catShort: string;
  explanations: string;
  synonyms: string;
};

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

  constructor(
    private fb: FormBuilder,
    private clipboard: ClipboardService,
    private snackBar: MatSnackBar,
    ) {
      // electron.ipcRenderer.on('importFile', (arg) => {
      //   console.log('import', arg);
      // });

      const categories = localStorage.getItem('categories');
      if (categories) {
        console.log('loading categories from local storage');
        this.categoryItems = JSON.parse(categories);
      } else {
        console.log('loading default categories');
        this.categoryItems = DEFAULT_CATEGORIES;
      }

      this.categoryForm = this.fb.group({
        category: true,
        subCategory: true,
        catID: true,
        catShort: false,
        searchCategorySynonyms: true,
        categoryKeyword: this.categoryKeywordControl,
      });

      this.filenameForm = this.fb.group({
        userCategory: '',
        fxName: '',
        initials: localStorage.getItem('initials') || '',
        show: localStorage.getItem('show') || '',
        userInfo: '',
        searchFilenameSynonyms: true,
        filenameKeyword: this.filenameKeywordControl,
      });

      this.updateFilename(null);
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
      console.log('categorySelected', text);
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
      const sheetName = workbook.SheetNames.find((name) => name.indexOf('7.0') >= 0);
      const sheet = workbook.Sheets[sheetName];
      this.loadSheet(sheet);
    };
    reader.readAsArrayBuffer(file);
  }

  public updateFilename(item: CategoryItem | null) {
    console.log('updateFilename', item, this.filenameForm.value);
    // catID-UserCategory_FXName_ShowName_UserInfo
    const selectedItem = item ? item : this.filenameForm.value.filenameKeyword;
    const catId = selectedItem ? selectedItem.catID : '?';
    const userCategory = this.filenameForm.value.userCategory ? ('-' + this.filenameForm.value.userCategory) : '';
    const fxName = this.filenameForm.value.fxName || '?';
    const show = this.filenameForm.value.show || '?';
    const initials = this.filenameForm.value.initials || '?';
    const userInfo = this.filenameForm.value.userInfo ?('_' + this.filenameForm.value.userInfo) : '';
    this.filename = `${catId}${userCategory}_${fxName}_${initials}_${show}${userInfo}`;
  }

  public copyFilename() {
    this.clipboard.copyText(this.filename);
    this.snackBar.open(`'${this.filename}' copied to the clipboard`, null, { duration: 3000 });
    localStorage.setItem('initials', this.filenameForm.value.initials);
    localStorage.setItem('show', this.filenameForm.value.show);

  }

  private categoryValidator(control?: AbstractControl): { [key: string]: boolean } | null {
    console.log('categoryValidator', control.value);
    return control.value && control.value.catID ? null : { invalidTime: true };
  }

  private loadSheet(sheet) {
    let row = 4;
    let category = this.getCell(sheet, 'A', row, null);
    this.categoryItems = [];
    while (category) {
      const item: CategoryItem = {
        category,
        subCategory: this.getCell(sheet, 'B', row),
        catID: this.getCell(sheet, 'C', row),
        catShort: this.getCell(sheet, 'D', row),
        explanations: this.getCell(sheet, 'E', row),
        synonyms: this.getCell(sheet, 'F', row, '!!!'),
      };
      this.categoryItems.push(item);

      row++;
      category = this.getCell(sheet, 'A', row, null);
    }
    localStorage.setItem('categories', JSON.stringify(this.categoryItems));
    this.clearCategoryKeyword();
    this.clearFilenameKeyword();
  }

  private getCell(sheet: any[], col: string, row: number, missing: string = '???') {
    const cellName = col + row;
    return sheet[cellName] && sheet[cellName].v ? sheet[cellName].v : missing;
  }

  private filterItems(value: string | CategoryItem, synonyms: boolean): CategoryItem[] {
    const filterValue = typeof(value) === 'string' ? value.toLowerCase() : this.formatCategoryItem(value);
    return this.categoryItems.filter((item) => {
      let found = item.category.toLowerCase().includes(filterValue) ||
        item.subCategory.toLocaleLowerCase().includes(filterValue) ||
        item.catID.toLocaleLowerCase().includes(filterValue);
      if (!found && synonyms) {
        found = item.synonyms.toLocaleLowerCase().includes(filterValue);
      }
      return found;
    });
  }
}
