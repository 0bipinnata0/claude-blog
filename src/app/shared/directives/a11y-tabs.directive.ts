import {
    Directive,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    Output,
    QueryList,
    ContentChildren,
    AfterContentInit,
    inject,
    computed,
    signal,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import { FocusKeyManager, FocusableOption } from '@angular/cdk/a11y';
import { ENTER, SPACE, LEFT_ARROW, RIGHT_ARROW, HOME, END } from '@angular/cdk/keycodes';

@Directive({
    selector: '[appTab]',
    standalone: true,
    host: {
        'role': 'tab',
        '[attr.aria-selected]': 'isActive()',
        '[attr.tabindex]': 'isActive() ? 0 : -1',
        '[class.active]': 'isActive()',
        '(click)': 'select()'
    }
})
export class TabDirective implements FocusableOption {
    element = inject(ElementRef<HTMLElement>);

    @Input('appTab') value: any;
    @Output() selected = new EventEmitter<any>();

    private _isActive = signal(false);
    isActive = this._isActive.asReadonly();

    setActive(active: boolean) {
        this._isActive.set(active);
    }

    select() {
        this.selected.emit(this.value);
    }

    focus() {
        this.element.nativeElement.focus();
    }
}

@Directive({
    selector: '[appTabs]',
    standalone: true,
    host: {
        'role': 'tablist',
        '[attr.aria-orientation]': '"horizontal"'
    }
})
export class TabsDirective implements AfterContentInit, OnChanges {
    @ContentChildren(TabDirective) tabs!: QueryList<TabDirective>;
    @Input() selectedValue: any;
    @Output() selectedValueChange = new EventEmitter<any>();

    private keyManager!: FocusKeyManager<TabDirective>;

    ngAfterContentInit() {
        this.keyManager = new FocusKeyManager(this.tabs)
            .withHorizontalOrientation('ltr')
            .withWrap();

        // Set initial active state based on selectedValue
        this.updateActiveTab();

        // Listen for changes if tabs are added/removed
        this.tabs.changes.subscribe(() => {
            this.updateActiveTab();
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['selectedValue'] && !changes['selectedValue'].firstChange) {
            this.updateActiveTab();
        }
    }

    @HostListener('keydown', ['$event'])
    onKeydown(event: KeyboardEvent) {
        this.keyManager.onKeydown(event);

        if (event.keyCode === ENTER || event.keyCode === SPACE) {
            if (this.keyManager.activeItem) {
                this.selectTab(this.keyManager.activeItem);
                event.preventDefault();
            }
        }
    }

    selectTab(tab: TabDirective) {
        this.selectedValue = tab.value;
        this.selectedValueChange.emit(tab.value);
        this.updateActiveTab();
    }

    updateActiveTab() {
        if (!this.tabs) return;
        this.tabs.forEach((tab, index) => {
            const isActive = tab.value === this.selectedValue;
            tab.setActive(isActive);
            if (isActive && this.keyManager) {
                this.keyManager.setActiveItem(index);
            }
        });
    }

    // Expose for template if needed, though we use content projection usually
    // But here we are just managing state. 
}

@Directive({
    selector: '[appTabPanel]',
    standalone: true,
    host: {
        'role': 'tabpanel',
        '[attr.tabindex]': '0'
    }
})
export class TabPanelDirective {
    // basic role application
}
