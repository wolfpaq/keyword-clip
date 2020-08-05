import { TestBed, inject, async } from "@angular/core/testing";
import { ClipboardService } from './clipboard.service';

describe('ClipboardService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ClipboardService,
      ]
    });
  });

  describe('has a copyText function that', () => {

    let textareaElement;

    beforeEach(() => {
      textareaElement = jasmine.createSpyObj('textarea', ['focus', 'select']);
      textareaElement.style = {};
      spyOn(document, 'createElement').and.returnValue(textareaElement);
      spyOn(document, 'execCommand');
      spyOn(document.body, 'appendChild');
      spyOn(document.body, 'removeChild');
    });

    it('creates a textarea element and sets it up with some attributes', async(
      inject([ClipboardService], (service: ClipboardService) => {
        service.copyText('some text');
        expect(textareaElement.value).toEqual('some text');
        expect(textareaElement.style.top).toEqual('0');
        expect(textareaElement.style.left).toEqual('0');
        expect(textareaElement.style.position).toEqual('fixed');
      })
    ));

    it('appends the textarea element to the DOM', async(
      inject([ClipboardService], (service: ClipboardService) => {
        service.copyText('some text');
        expect(document.body.appendChild).toHaveBeenCalledWith(textareaElement);
      })
    ));

    it('focuses and selects the textarea element', async(
      inject([ClipboardService], (service: ClipboardService) => {
        service.copyText('some text');
        expect(textareaElement.focus).toHaveBeenCalled();
        expect(textareaElement.select).toHaveBeenCalled();
      })
    ));

    it('executes the copy command on the textarea element to move the text to the clipboard', async(
      inject([ClipboardService], (service: ClipboardService) => {
        service.copyText('some text');
        expect(document.execCommand).toHaveBeenCalledWith('copy');
      })
    ));

    it('removes the textarea element from the DOM', async(
      inject([ClipboardService], (service: ClipboardService) => {
        service.copyText('some text');
        expect(document.body.removeChild).toHaveBeenCalledWith(textareaElement);
      })
    ));

  });

});
