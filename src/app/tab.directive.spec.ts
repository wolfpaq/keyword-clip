import { TabDirective } from './tab.directive';
import { AsyncSubject } from 'rxjs';

describe('TabDirective', () => {

  let autoTrigger: any;
  let panelClosingActions: AsyncSubject<any>;
  let control: any;
  let directive: any;

  beforeEach(() => {
    autoTrigger = jasmine.createSpyObj('autoTrigger', ['writeValue']);
    panelClosingActions = new AsyncSubject<any>();
    autoTrigger.panelClosingActions = panelClosingActions;
    control = { control: jasmine.createSpyObj('control', ['setValue']) };
  });

  describe('has an ngAfterViewInit function that', () => {

    it('watches for the autoTrigger panel to close and sets the value of the control to the autoTrigger value if it is available', () => {
      autoTrigger.activeOption = { value: 'test value' };
      directive = new TabDirective(autoTrigger, control);
      directive.ngAfterViewInit();
      panelClosingActions.next(null);
      panelClosingActions.complete();
      expect(control.control.setValue).toHaveBeenCalledWith('test value', { emit: false });
    });

    it('watches for the autoTrigger panel to close and doesn\'t set the value of the control to the autoTrigger value if it is not available', () => {
      autoTrigger.activeOption = { value: 'test value' };
      directive = new TabDirective(autoTrigger, null);
      directive.ngAfterViewInit();
      panelClosingActions.next(null);
      panelClosingActions.complete();
      expect(control.control.setValue).not.toHaveBeenCalled();
    });

    it('watches for the autoTrigger panel to close and writes the current value back to the auto trigger control', () => {
      autoTrigger.activeOption = { value: 'test value' };
      directive = new TabDirective(autoTrigger, control);
      directive.ngAfterViewInit();
      panelClosingActions.next(null);
      panelClosingActions.complete();
      expect(autoTrigger.writeValue).toHaveBeenCalledWith('test value');
    });

    it('doesn\'t do anything if there is no active option on the passed in auto trigger', () => {
      directive = new TabDirective(autoTrigger, control);
      directive.ngAfterViewInit();
      panelClosingActions.next(null);
      panelClosingActions.complete();
      expect(control.control.setValue).not.toHaveBeenCalled();
      expect(autoTrigger.writeValue).not.toHaveBeenCalled();
    });

  });

  describe('has an ngOnDestroy function that', () => {

    it('unsubscribes from panel closing events', () => {
      const subscription = jasmine.createSpyObj('subscription', ['unsubscribe']);
      spyOn(panelClosingActions, 'subscribe').and.returnValue(subscription);
      directive = new TabDirective(autoTrigger, control);
      directive.ngAfterViewInit();
      directive.ngOnDestroy();
      expect(subscription.unsubscribe).toHaveBeenCalled();
    });

  });

});
