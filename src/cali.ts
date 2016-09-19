/**
 * according to RFC 4324 https://tools.ietf.org/html/rfc4324 definition for event
 *
 * BEGIN:VEVENT
 * DTSTART:20030307T180000Z
 * UID:FirstInThisExample-1
 * DTEND:20030307T190000Z
 * SUMMARY:Important Meeting
 * END:VEVENT
 * BEGIN:VEVENT
 * DTSTART:20040307T180000Z
 * UID:SecondInThisExample-2
 * DTEND:20040307T190000Z
 * SUMMARY:Important Meeting
 * END:VEVENT
 */
interface iEvent {
    uid: string|number,
    title: string,
    start: Date|string,
    end: Date|string,
    summary?: string,
    organizer?: string,
    toString(): string
}

var config = {
    classPrefix: 'cali',
    view: 'week',
    headerButtons: 'year,month,week,day'
};

class EventList {
    events: iEvent[];

    constructor(events: iEvent[]){
        this.events = events;
    }
    compare(other: EventList): boolean {
        this.events.forEach( (event: iEvent, index: number) => {
            if (other[index].uid !== event.uid)
                return false;
        });

        return true;
    }
    forEach(callback: (value: iEvent) => void) {
        if (this.events)
            this.events.forEach(callback);
    }
}
abstract class CaliView {
    element: Element;
    parent: CaliView;
    cali: Cali;

    constructor(element: Element, parent: CaliView){
        this.element = element;
        this.parent = parent;
        this.cali = null;
    }
    setCali(cali: Cali){
        this.cali = cali;
    }

    getCali(): Cali {
        if (!this.cali) {
            let parent:CaliView = this;

            while (parent.parent !== null) {
                parent = parent.parent;
            }

            this.cali = parent.cali;
        }

        return this.cali;
    }
    clean(): void {}
    render(): void {}
}

class CaliHeaderView extends CaliView {
    children: CaliView[];

    constructor(element: Element, parent: CaliView){
        super(element, parent);
        this.children = [];

        let titleElements = this.element.querySelectorAll('[data-' + config.classPrefix + '-header-title]');
        for (let i = 0; i < titleElements.length ; i++){
            this.children.push(new CaliHeaderTitleView(titleElements[i], this));
        }

        let buttonsElements = this.element.querySelectorAll('[data-' + config.classPrefix + '-header-buttons]');
        for (let i = 0; i < buttonsElements.length ; i++){
            this.children.push(new CaliHeaderButtonsView(buttonsElements[i], this));
        }
    }
    clean(): void {
        this.children.forEach( (child) => { child.clean(); } );
    }
    render(): void {
        this.children.forEach( (child) => { child.render(); } );
    }
}
class CaliHeaderTitleView extends CaliView {
    constructor(element: Element, parent: CaliView){
        super(element, parent);
    }

    clean(){
        this.element.innerHTML = '';
    }
    render(){
        return this.element.innerHTML = this.getCali().getTitle();
    }
}
class CaliHeaderButtonsView extends CaliView {
    buttons: string[];

    constructor(element: Element, parent: CaliView){
        super(element, parent);
        this.buttons = [];

        let buttons: string = this.element.getAttribute('data-' + config.classPrefix + '-header-buttons') || config.headerButtons;
        buttons.split(',').map( (x: string) => {
            this.buttons.push(x.trim());
        });

        this.element.setAttribute('data-' + config.classPrefix + '-btn-group', '');
    }

    addButton(type: string): void{
        let btn = document.createElement('button');
        btn.appendChild(document.createTextNode(type));
        btn.setAttribute('data-' + config.classPrefix + '-btn', '');

        if (type !== 'today') {
            if (this.getCali().getCurrentView() === type){
                btn.setAttribute('data-' + config.classPrefix + '-view-btn-active', '');
            }
            btn.setAttribute('data-' + config.classPrefix + '-view-btn', '');
            btn.addEventListener('click', (e) => {
                let other = this.getCali().element.querySelectorAll('[data-' + config.classPrefix + '-view-btn]');
                for (let i = 0; i < other.length; i++){
                    other[i].removeAttribute('data-' + config.classPrefix + '-view-btn-active');
                }
                e.srcElement.setAttribute('data-' + config.classPrefix + '-view-btn-active', '');
                this.getCali().setView(type);
            });
        } else
            btn.addEventListener('click', () => { this.getCali().resetDate(); });

        this.element.appendChild(btn);
    }

    clean(){
        this.element.innerHTML = '';
    }
    render(): void {
        if (!this.buttons.length) return;

        this.buttons.forEach( (view) => {
            switch (view){
                case 'day':   this.addButton('day'); break;
                case 'week':  this.addButton('week'); break;
                case 'month': this.addButton('month'); break;
                case 'year':  this.addButton('year'); break;
                case 'today': this.addButton('today'); break;
                case 'list': this.addButton('list'); break;
                case 'next': this.addButton('next'); break;
                case 'prev': this.addButton('prev'); break;
            }
        });
    }
}

abstract class CaliContentView extends CaliView {
    events: EventList;
    viewName: string;

    constructor(element: Element, parent: CaliView, events: EventList){
        super(element, parent);

        this.events = events;
        this.viewName = '';
    }
    getViewName(): string {
        return this.viewName;
    }
    getTitle(): string {
        return '' + Math.random();
    }

    abstract getViewStart(): Date;
    abstract getViewEnd(): Date;

    clean(): void {
        this.element.innerHTML = '';
    }
    render(): void{
        let x = document.createTextNode('Now this is view ' + this.viewName + ' and some random numbers: ' + Math.random());
        this.element.appendChild(x);
    }
}
class CaliContentMonthView extends CaliContentView {
    constructor(element: Element, parent: CaliView, events: EventList){
        super(element, parent, events);
        this.viewName = 'month';
    }

    getViewStart(): Date {return new Date();}
    getViewEnd(): Date {return new Date();}
}
class CaliContentWeekView extends CaliContentView {
    constructor(element: Element, parent: CaliView, events: EventList){
        super(element, parent, events);
        this.viewName = 'week';
    }

    getViewStart(): Date {return new Date();}
    getViewEnd(): Date {return new Date();}
}
class CaliContentDayView extends CaliContentView {
    constructor(element: Element, parent: CaliView, events: EventList){
        super(element, parent, events);
        this.viewName = 'day';
    }

    getViewStart(): Date {return new Date();}
    getViewEnd(): Date {return new Date();}
}
class CaliContentYearView extends CaliContentView {
    constructor(element: Element, parent: CaliView, events: EventList){
        super(element, parent, events);
        this.viewName = 'year';
    }

    getViewStart(): Date {return new Date();}
    getViewEnd(): Date {return new Date();}
}

class Cali {
    element: Element;
    header: CaliView;
    content: CaliContentView;
    activeDate: Date;
    contentElement: Element;

    constructor(element: Element) {
        this.element = element;

        let header = this.element.querySelectorAll('[data-' + config.classPrefix + '-header]')[0];
        let headerObj: CaliView = null;
        if (header){
            headerObj = new CaliHeaderView(header, null);
            headerObj.setCali(this);
        }
        this.header = headerObj;

        this.contentElement = this.element.querySelectorAll('[data-' + config.classPrefix + '-content]')[0];
        if (this.contentElement){
            this.setView(this.contentElement.getAttribute('data-' + config.classPrefix + '-content'));
        }

        this.render();
    }
    setView(type: string): void {
        let contentObj: CaliContentView = null;
        if (this.content && this.content.getViewName() === type) return;
        switch (type){
            case 'month': contentObj = new CaliContentMonthView(this.contentElement, null, new EventList(null)); break;
            case 'week': contentObj = new CaliContentWeekView(this.contentElement, null, new EventList(null)); break;
            case 'day': contentObj = new CaliContentDayView(this.contentElement, null, new EventList(null)); break;
            case 'year': contentObj = new CaliContentYearView(this.contentElement, null, new EventList(null)); break;
            default: throw 'Not supported view type';
        }
        this.content = contentObj;

        this.render();
    }
    getTitle(): string {
        return this.content.getTitle();
    }
    getCurrentView(): string {
        return this.content.getViewName();
    }
    resetDate(): void {
        this.render();
    }
    clean(): void {
        if (this.header && this.header !== null) this.header.clean();
        if (this.content && this.content !== null) this.content.clean();
    }
    render(): void {
        this.clean();
        if (this.header && this.header !== null) this.header.render();
        if (this.content && this.content !== null) this.content.render();
    }
}

(() => {
    let caliElements = document.querySelectorAll('[data-' + config.classPrefix + ']');

    for (let i = 0; i < caliElements.length; i++){
        new Cali(caliElements[i]);
    }
})();