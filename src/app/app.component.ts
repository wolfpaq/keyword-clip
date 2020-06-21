import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
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

  public categoryItems: CategoryItem[];
  public filteredCategoryItems: Observable<CategoryItem[]>;

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
        searchSynonyms: true,
        keyword: this.categoryKeywordControl,
      });
    }

  ngOnInit() {
    this.filteredCategoryItems = this.categoryKeywordControl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterItems(value))
    );
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
    this.clipboard.copyText(text);
    this.snackBar.open(`'${text}' copied to the clipboard`, null, { duration: 3000 })
  }

  public formatCategoryItem(item: CategoryItem): string | null {
    if (item) {
      return `${item.category} ${item.subCategory} ${item.catID}`.trim();
    }
    return null;
  }

  public clearKeyword() {
    this.categoryKeywordControl.setValue({ category: '', subCategory: '', catID: '', catShort: '' });
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
    this.clearKeyword();
  }

  private getCell(sheet: any[], col: string, row: number, missing: string = '???') {
    const cellName = col + row;
    return sheet[cellName] && sheet[cellName].v ? sheet[cellName].v : missing;
  }

  private filterItems(value: string | CategoryItem): CategoryItem[] {
    const filterValue = typeof(value) === 'string' ? value.toLowerCase() : this.formatCategoryItem(value);
    return this.categoryItems.filter((item) => {
      let found = item.category.toLowerCase().includes(filterValue) ||
        item.subCategory.toLocaleLowerCase().includes(filterValue) ||
        item.catID.toLocaleLowerCase().includes(filterValue);
      if (!found && this.categoryForm.value.searchSynonyms) {
        found = item.synonyms.toLocaleLowerCase().includes(filterValue);
      }
      return found;
    });
  }
}
