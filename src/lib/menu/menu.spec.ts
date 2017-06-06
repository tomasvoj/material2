import {TestBed, async, ComponentFixture} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {
  MdMenuModule,
  MdMenuTrigger,
  MdMenuPanel,
  MenuPositionX,
  MenuPositionY
} from './index';
import {OverlayContainer} from '../core/overlay/overlay-container';
import {Dir, LayoutDirection} from '../core/rtl/dir';
import {extendObject} from '../core/util/object-extend';
import {ESCAPE} from '../core/keyboard/keycodes';
import {dispatchKeyboardEvent} from '../core/testing/dispatch-events';


describe('MdMenu', () => {
  let overlayContainerElement: HTMLElement;
  let dir: LayoutDirection;

  beforeEach(async(() => {
    dir = 'ltr';
    TestBed.configureTestingModule({
      imports: [MdMenuModule, NoopAnimationsModule],
      declarations: [SimpleMenu, PositionedMenu, OverlapMenu, CustomMenuPanel, CustomMenu],
      providers: [
        {provide: OverlayContainer, useFactory: () => {
          overlayContainerElement = document.createElement('div');
          overlayContainerElement.classList.add('cdk-overlay-container');
          document.body.appendChild(overlayContainerElement);

          // remove body padding to keep consistent cross-browser
          document.body.style.padding = '0';
          document.body.style.margin = '0';
          return {getContainerElement: () => overlayContainerElement};
        }},
        {provide: Dir, useFactory: () => {
          return {value: dir};
        }}
      ]
    });

    TestBed.compileComponents();
  }));

  afterEach(() => {
    document.body.removeChild(overlayContainerElement);
  });

  it('should open the menu as an idempotent operation', () => {
    const fixture = TestBed.createComponent(SimpleMenu);
    fixture.detectChanges();
    expect(overlayContainerElement.textContent).toBe('');
    expect(() => {
      fixture.componentInstance.trigger.openMenu();
      fixture.componentInstance.trigger.openMenu();

      expect(overlayContainerElement.textContent).toContain('Item');
      expect(overlayContainerElement.textContent).toContain('Disabled');
    }).not.toThrowError();
  });

  it('should close the menu when a click occurs outside the menu', () => {
    const fixture = TestBed.createComponent(SimpleMenu);
    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();

    const backdrop = <HTMLElement>overlayContainerElement.querySelector('.cdk-overlay-backdrop');
    backdrop.click();
    fixture.detectChanges();

    expect(overlayContainerElement.textContent).toBe('');
  });

  it('should close the menu when pressing escape', () => {
    const fixture = TestBed.createComponent(SimpleMenu);
    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();

    const panel = overlayContainerElement.querySelector('.mat-menu-panel');
    dispatchKeyboardEvent(panel, 'keydown', ESCAPE);
    fixture.detectChanges();

    expect(overlayContainerElement.textContent).toBe('');
  });

  it('should open a custom menu', () => {
    const fixture = TestBed.createComponent(CustomMenu);
    fixture.detectChanges();
    expect(overlayContainerElement.textContent).toBe('');
    expect(() => {
      fixture.componentInstance.trigger.openMenu();
      fixture.componentInstance.trigger.openMenu();

      expect(overlayContainerElement.textContent).toContain('Custom Menu header');
      expect(overlayContainerElement.textContent).toContain('Custom Content');
    }).not.toThrowError();
  });

  it('should set the panel direction based on the trigger direction', () => {
    dir = 'rtl';
    const fixture = TestBed.createComponent(SimpleMenu);
    fixture.detectChanges();
    fixture.componentInstance.trigger.openMenu();
    fixture.detectChanges();

    const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane');
    expect(overlayPane.getAttribute('dir')).toEqual('rtl');
  });

  describe('positions', () => {
    let fixture: ComponentFixture<PositionedMenu>;
    let panel: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(PositionedMenu);
      fixture.detectChanges();

      const trigger = fixture.componentInstance.triggerEl.nativeElement;

      // Push trigger to the bottom edge of viewport,so it has space to open "above"
      trigger.style.position = 'fixed';
      trigger.style.top = '600px';

      // Push trigger to the right, so it has space to open "before"
      trigger.style.left = '100px';

      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      panel = overlayContainerElement.querySelector('.mat-menu-panel') as HTMLElement;
    });

    it('should append mat-menu-before if the x position is changed', () => {
      expect(panel.classList).toContain('mat-menu-before');
      expect(panel.classList).not.toContain('mat-menu-after');

      fixture.componentInstance.xPosition = 'after';
      fixture.detectChanges();

      expect(panel.classList).toContain('mat-menu-after');
      expect(panel.classList).not.toContain('mat-menu-before');
    });

    it('should append mat-menu-above if the y position is changed', () => {
      expect(panel.classList).toContain('mat-menu-above');
      expect(panel.classList).not.toContain('mat-menu-below');

      fixture.componentInstance.yPosition = 'below';
      fixture.detectChanges();

      expect(panel.classList).toContain('mat-menu-below');
      expect(panel.classList).not.toContain('mat-menu-above');
    });

    it('should default to the "below" and "after" positions', () => {
      fixture.destroy();

      let newFixture = TestBed.createComponent(SimpleMenu);

      newFixture.detectChanges();
      newFixture.componentInstance.trigger.openMenu();
      newFixture.detectChanges();
      panel = overlayContainerElement.querySelector('.mat-menu-panel') as HTMLElement;

      expect(panel.classList).toContain('mat-menu-below');
      expect(panel.classList).toContain('mat-menu-after');
    });

  });

  describe('fallback positions', () => {

    it('should fall back to "before" mode if "after" mode would not fit on screen', () => {
      const fixture = TestBed.createComponent(SimpleMenu);
      fixture.detectChanges();
      const trigger = fixture.componentInstance.triggerEl.nativeElement;

      // Push trigger to the right side of viewport, so it doesn't have space to open
      // in its default "after" position on the right side.
      trigger.style.position = 'fixed';
      trigger.style.right = '-50px';
      trigger.style.top = '200px';

      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      const overlayPane = getOverlayPane();
      const triggerRect = trigger.getBoundingClientRect();
      const overlayRect = overlayPane.getBoundingClientRect();

      // In "before" position, the right sides of the overlay and the origin are aligned.
      // To find the overlay left, subtract the menu width from the origin's right side.
      const expectedLeft = triggerRect.right - overlayRect.width;
      expect(Math.floor(overlayRect.left))
          .toBe(Math.floor(expectedLeft),
              `Expected menu to open in "before" position if "after" position wouldn't fit.`);

      // The y-position of the overlay should be unaffected, as it can already fit vertically
      expect(Math.floor(overlayRect.top))
          .toBe(Math.floor(triggerRect.top),
              `Expected menu top position to be unchanged if it can fit in the viewport.`);
    });

    it('should fall back to "above" mode if "below" mode would not fit on screen', () => {
      const fixture = TestBed.createComponent(SimpleMenu);
      fixture.detectChanges();
      const trigger = fixture.componentInstance.triggerEl.nativeElement;

      // Push trigger to the bottom part of viewport, so it doesn't have space to open
      // in its default "below" position below the trigger.
      trigger.style.position = 'fixed';
      trigger.style.bottom = '65px';

      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      const overlayPane = getOverlayPane();
      const triggerRect = trigger.getBoundingClientRect();
      const overlayRect = overlayPane.getBoundingClientRect();

      // In "above" position, the bottom edges of the overlay and the origin are aligned.
      // To find the overlay top, subtract the menu height from the origin's bottom edge.
      const expectedTop = triggerRect.bottom - overlayRect.height;
      expect(Math.floor(overlayRect.top))
          .toBe(Math.floor(expectedTop),
              `Expected menu to open in "above" position if "below" position wouldn't fit.`);

      // The x-position of the overlay should be unaffected, as it can already fit horizontally
      expect(Math.floor(overlayRect.left))
          .toBe(Math.floor(triggerRect.left),
              `Expected menu x position to be unchanged if it can fit in the viewport.`);
    });

    it('should re-position menu on both axes if both defaults would not fit', () => {
      const fixture = TestBed.createComponent(SimpleMenu);
      fixture.detectChanges();
      const trigger = fixture.componentInstance.triggerEl.nativeElement;

      // push trigger to the bottom, right part of viewport, so it doesn't have space to open
      // in its default "after below" position.
      trigger.style.position = 'fixed';
      trigger.style.right = '-50px';
      trigger.style.bottom = '65px';

      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      const overlayPane = getOverlayPane();
      const triggerRect = trigger.getBoundingClientRect();
      const overlayRect = overlayPane.getBoundingClientRect();

      const expectedLeft = triggerRect.right - overlayRect.width;
      const expectedTop = triggerRect.bottom - overlayRect.height;

      expect(Math.floor(overlayRect.left))
          .toBe(Math.floor(expectedLeft),
              `Expected menu to open in "before" position if "after" position wouldn't fit.`);

      expect(Math.floor(overlayRect.top))
          .toBe(Math.floor(expectedTop),
              `Expected menu to open in "above" position if "below" position wouldn't fit.`);
    });

    it('should re-position a menu with custom position set', () => {
      const fixture = TestBed.createComponent(PositionedMenu);
      fixture.detectChanges();
      const trigger = fixture.componentInstance.triggerEl.nativeElement;

      fixture.componentInstance.trigger.openMenu();
      fixture.detectChanges();
      const overlayPane = getOverlayPane();
      const triggerRect = trigger.getBoundingClientRect();
      const overlayRect = overlayPane.getBoundingClientRect();

      // As designated "before" position won't fit on screen, the menu should fall back
      // to "after" mode, where the left sides of the overlay and trigger are aligned.
      expect(Math.floor(overlayRect.left))
          .toBe(Math.floor(triggerRect.left),
              `Expected menu to open in "after" position if "before" position wouldn't fit.`);

      // As designated "above" position won't fit on screen, the menu should fall back
      // to "below" mode, where the top edges of the overlay and trigger are aligned.
      expect(Math.floor(overlayRect.top))
          .toBe(Math.floor(triggerRect.top),
              `Expected menu to open in "below" position if "above" position wouldn't fit.`);
    });

    function getOverlayPane(): HTMLElement {
      return overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
    }
  });

  describe('overlapping trigger', () => {
    /**
     * This test class is used to create components containing a menu.
     * It provides helpers to reposition the trigger, open the menu,
     * and access the trigger and overlay positions.
     * Additionally it can take any inputs for the menu wrapper component.
     *
     * Basic usage:
     * const subject = new OverlapSubject(MyComponent);
     * subject.openMenu();
     */
    class OverlapSubject<T extends TestableMenu> {
      private readonly fixture: ComponentFixture<T>;
      private readonly trigger: any;

      constructor(ctor: {new(): T; }, inputs: {[key: string]: any} = {}) {
        this.fixture = TestBed.createComponent(ctor);
        extendObject(this.fixture.componentInstance, inputs);
        this.fixture.detectChanges();
        this.trigger = this.fixture.componentInstance.triggerEl.nativeElement;
      }

      openMenu() {
        this.fixture.componentInstance.trigger.openMenu();
        this.fixture.detectChanges();
      }

      updateTriggerStyle(style: any) {
        return extendObject(this.trigger.style, style);
      }

      get overlayRect() {
        return this.overlayPane.getBoundingClientRect();
      }

      get triggerRect() {
        return this.trigger.getBoundingClientRect();
      }

      get menuPanel() {
        return overlayContainerElement.querySelector('.mat-menu-panel');
      }

      private get overlayPane() {
        return overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
      }
    }

    let subject: OverlapSubject<OverlapMenu>;
    describe('explicitly overlapping', () => {
      beforeEach(() => {
        subject = new OverlapSubject(OverlapMenu, {overlapTrigger: true});
      });

      it('positions the overlay below the trigger', () => {
        subject.openMenu();

        // Since the menu is overlaying the trigger, the overlay top should be the trigger top.
        expect(Math.floor(subject.overlayRect.top))
            .toBe(Math.floor(subject.triggerRect.top),
                `Expected menu to open in default "below" position.`);
      });
    });

    describe('not overlapping', () => {
      beforeEach(() => {
        subject = new OverlapSubject(OverlapMenu, {overlapTrigger: false});
      });

      it('positions the overlay below the trigger', () => {
        subject.openMenu();

        // Since the menu is below the trigger, the overlay top should be the trigger bottom.
        expect(Math.floor(subject.overlayRect.top))
            .toBe(Math.floor(subject.triggerRect.bottom),
                `Expected menu to open directly below the trigger.`);
      });

      it('supports above position fall back', () => {
        // Push trigger to the bottom part of viewport, so it doesn't have space to open
        // in its default "below" position below the trigger.
        subject.updateTriggerStyle({position: 'fixed', bottom: '0'});
        subject.openMenu();

        // Since the menu is above the trigger, the overlay bottom should be the trigger top.
        expect(Math.floor(subject.overlayRect.bottom))
            .toBe(Math.floor(subject.triggerRect.top),
                `Expected menu to open in "above" position if "below" position wouldn't fit.`);
      });

      it('repositions the origin to be below, so the menu opens from the trigger', () => {
        subject.openMenu();

        expect(subject.menuPanel.classList).toContain('mat-menu-below');
        expect(subject.menuPanel.classList).not.toContain('mat-menu-above');
      });

    });
  });

  describe('animations', () => {
    it('should include the ripple on items by default', () => {
      const fixture = TestBed.createComponent(SimpleMenu);
      fixture.detectChanges();

      fixture.componentInstance.trigger.openMenu();
      const item = fixture.debugElement.query(By.css('.mat-menu-item'));
      const ripple = item.query(By.css('.mat-ripple'));

      expect(ripple).not.toBeNull();
    });

    it('should remove the ripple on disabled items', () => {
      const fixture = TestBed.createComponent(SimpleMenu);
      fixture.detectChanges();

      fixture.componentInstance.trigger.openMenu();
      const items = fixture.debugElement.queryAll(By.css('.mat-menu-item'));

      // items[1] is disabled, so the ripple should not be present
      const ripple = items[1].query(By.css('.mat-ripple'));
      expect(ripple).toBeNull();
    });

  });

  describe('close event', () => {
    let fixture: ComponentFixture<SimpleMenu>;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleMenu);
      fixture.detectChanges();
      fixture.componentInstance.trigger.openMenu();
    });

    it('should emit an event when a menu item is clicked', () => {
      const menuItem = overlayContainerElement.querySelector('[md-menu-item]') as HTMLElement;

      menuItem.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.closeCallback).toHaveBeenCalled();
    });

    it('should emit a close event when the backdrop is clicked', () => {
      const backdrop = <HTMLElement>overlayContainerElement.querySelector('.cdk-overlay-backdrop');

      backdrop.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.closeCallback).toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('does not throw an error on destroy', () => {
      const fixture = TestBed.createComponent(SimpleMenu);
      expect(fixture.destroy.bind(fixture)).not.toThrow();
    });
  });
});

@Component({
  template: `
    <button [mdMenuTriggerFor]="menu" #triggerEl>Toggle menu</button>
    <md-menu #menu="mdMenu" (close)="closeCallback()">
      <button md-menu-item> Item </button>
      <button md-menu-item disabled> Disabled </button>
    </md-menu>
  `
})
class SimpleMenu {
  @ViewChild(MdMenuTrigger) trigger: MdMenuTrigger;
  @ViewChild('triggerEl') triggerEl: ElementRef;
  closeCallback = jasmine.createSpy('menu closed callback');
}

@Component({
  template: `
    <button [mdMenuTriggerFor]="menu" #triggerEl>Toggle menu</button>
    <md-menu [xPosition]="xPosition" [yPosition]="yPosition" #menu="mdMenu">
      <button md-menu-item> Positioned Content </button>
    </md-menu>
  `
})
class PositionedMenu {
  @ViewChild(MdMenuTrigger) trigger: MdMenuTrigger;
  @ViewChild('triggerEl') triggerEl: ElementRef;
  xPosition: MenuPositionX = 'before';
  yPosition: MenuPositionY = 'above';
}

interface TestableMenu {
  trigger: MdMenuTrigger;
  triggerEl: ElementRef;
}
@Component({
  template: `
    <button [mdMenuTriggerFor]="menu" #triggerEl>Toggle menu</button>
    <md-menu [overlapTrigger]="overlapTrigger" #menu="mdMenu">
      <button md-menu-item> Not overlapped Content </button>
    </md-menu>
  `
})
class OverlapMenu implements TestableMenu {
  @Input() overlapTrigger: boolean;
  @ViewChild(MdMenuTrigger) trigger: MdMenuTrigger;
  @ViewChild('triggerEl') triggerEl: ElementRef;
}

@Component({
  selector: 'custom-menu',
  template: `
    <ng-template>
      Custom Menu header
      <ng-content></ng-content>
    </ng-template>
  `,
  exportAs: 'mdCustomMenu'
})
class CustomMenuPanel implements MdMenuPanel {
  xPosition: MenuPositionX = 'after';
  yPosition: MenuPositionY = 'below';
  overlapTrigger: true;

  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;
  @Output() close = new EventEmitter<void>();
  focusFirstItem = () => {};
  setPositionClasses = () => {};
  _emitCloseEvent() {
    this.close.emit();
  }
}

@Component({
  template: `
    <button [mdMenuTriggerFor]="menu">Toggle menu</button>
    <custom-menu #menu="mdCustomMenu">
      <button md-menu-item> Custom Content </button>
    </custom-menu>
  `
})
class CustomMenu {
  @ViewChild(MdMenuTrigger) trigger: MdMenuTrigger;
}
