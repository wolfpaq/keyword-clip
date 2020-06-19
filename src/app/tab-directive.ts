import { Directive, AfterViewInit, OnDestroy, Optional } from '@angular/core';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ClipboardService } from './clipboard.service';


@Directive({ selector: '[tab-directive]' })
export class TabDirective implements AfterViewInit, OnDestroy {

  private observable: Subscription;

  constructor(
    @Optional() private autoTrigger: MatAutocompleteTrigger,
    @Optional() private control: NgControl,
    private clipboard: ClipboardService) {}

  ngAfterViewInit() {
    this.observable = this.autoTrigger.panelClosingActions.subscribe(() => {
      if (this.autoTrigger.activeOption) {
        const value = this.autoTrigger.activeOption.value;
        if (this.control) {
          this.control.control.setValue(value, { emit: false });
        }
        this.autoTrigger.writeValue(value);
        setTimeout(() => {
          this.clipboard.copyText(value);
        });
      }
    });
  }

  ngOnDestroy() {
    this.observable.unsubscribe();
  }
}
