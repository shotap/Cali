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
    start: Date,
    end: Date,
    summary?: string,
    organizer?: string
}

var DateFormat = function (d: Date, format: string): string {
    let res = format;

    res = res.replace(/YYYY/g, '' + d.getFullYear());
    res = res.replace(/MMMM/g, config.monthNames[d.getMonth()]);
    res = res.replace(/MMM/g, config.monthNamesShort[d.getMonth()]);
    res = res.replace(/D/g, '' + d.getDate());
    res = res.replace(/dddd/g, '' + config.dayNamesShort[d.getDay()]);
    res = res.replace(/ddd/g, '' + config.dayNames[d.getDay()]);

    return res;
};

var data = [
    {uid: 1,  title: '1',   start: new Date('2016/09/22 04:00:00') , end: new Date('2016/09/22 06:00:00')},
    {uid: 2,  title: '2',   start: new Date('2016/09/22 07:00:00') , end: new Date('2016/09/22 09:00:00')},
    {uid: 3,  title: '3',   start: new Date('2016/09/23 05:00:00') , end: new Date('2016/09/23 07:00:00')},
    {uid: 4,  title: '4',   start: new Date('2016/09/23 06:00:00') , end: new Date('2016/09/23 07:00:00')},
    {uid: 5,  title: '5',   start: new Date('2016/09/24 04:00:00') , end: new Date('2016/09/24 12:00:00')},
    {uid: 6,  title: '6',   start: new Date('2016/09/24 04:00:00') , end: new Date('2016/09/24 06:00:00')},
    {uid: 7,  title: '7',   start: new Date('2016/09/25 04:00:00') , end: new Date('2016/09/26 04:00:00')},
    {uid: 8,  title: '8',   start: new Date('2016/09/25 04:00:00') , end: new Date('2016/09/27 04:00:00')},
    {uid: 9,  title: '9',   start: new Date('2016/09/26 04:00:00') , end: new Date('2016/09/26 05:00:00')},
    {uid: 10, title: '10',  start: new Date('2016/09/26 04:00:00') , end: new Date('2016/09/26 06:00:00')},
    {uid: 11, title: '11',  start: new Date('2016/09/27 04:00:00') , end: new Date('2016/09/27 05:00:00')},
    {uid: 12, title: '12',  start: new Date('2016/09/27 04:00:00') , end: new Date('2016/09/27 06:00:00')},
];

var config = {
    classPrefix: 'cali',
    view: 'week',
    rowHeight: 25,
    headerButtons: 'year,month,week,day',
    monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"],
    dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
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
    getFiltered(startD: Date, endD: Date){
        let res = [];

        this.events.map( (event: iEvent) => {
            if (event.start.getTime() > startD.getTime() && event.end.getTime() < endD.getTime()){
                res.push(event);
            }
        });

        return res;
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

        if (['today', 'next', 'prev'].indexOf(type) === -1) {
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
        } else {
            switch (type){
                case 'today': btn.addEventListener('click', () => { this.getCali().today(); }); break;
                case 'next': btn.addEventListener('click', () => { this.getCali().next(); }); break;
                case 'prev': btn.addEventListener('click', () => { this.getCali().prev(); });break;
            }
        }


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
    viewName: string;

    constructor(element: Element, parent: CaliView){
        super(element, parent);
        this.viewName = '';
    }
    getViewName(): string {
        return this.viewName;
    }
    getTimeColumn(): Element {
        let timeColumn = document.createElement('ol');
        timeColumn.setAttribute('data-' + config.classPrefix + '-time-column', '');

        for (let i = 0; i < 24; i++){
            let item = document.createElement('li');
            let z = '' + Math.floor(i);
            z = (z.length === 1 ? '0' + z : z) + ':00';
            item.appendChild(document.createTextNode(z));

            timeColumn.appendChild(item);
        }

        return timeColumn;
    }
    getDayGrid(d?: Date): Element {
        let list = document.createElement('ol');
        list.setAttribute('data-' + config.classPrefix + '-day-grid', '');

        if (d) {
            let listTitle = document.createElement('li');
            listTitle.appendChild(document.createTextNode(DateFormat(d, 'ddd D')));
            listTitle.setAttribute('data-' + config.classPrefix + '-day-grid-title', '');
            list.appendChild(listTitle);
        }
        for (let i = 0; i < 48; i++){
            let listItem = document.createElement('li');
            list.appendChild(listItem);
        }

        return list;
    }
    getEventObject(event: iEvent, viewStart?: Date): Element{
        let eventObj = document.createElement('li');
        eventObj.setAttribute('data-' + config.classPrefix + '-event', '');
        eventObj.style.top = '' + ((event.start.getHours()+(event.start.getMinutes()/60))*config.rowHeight*2+config.rowHeight) + 'px';
        eventObj.appendChild(document.createTextNode(event.title));

        if (event.start.getDay() === event.end.getDay()){ // start and end in the same day
            eventObj.style.height = '' + ((event.end.getTime()-event.start.getTime())/36e5*config.rowHeight*2) + 'px';
        }

        if (viewStart && viewStart.getDay() !== event.start.getDay()){ //this is not a day view, need to calculate the offset from the week start
            eventObj.style.width = "calc((100% - 50px)/7)";
            eventObj.style.left = "calc(100%/7*" + event.start.getDay() + ")";
            console.log(event.title, event.start.getDay());
        }

        return eventObj;
    }
    getFilteredEvents(startD?: Date, endD?: Date): iEvent[] {
        startD = startD || this.getViewStart();
        endD = endD || this.getViewEnd();

        let events = this.getCali().getEventList();
        return events.getFiltered(startD, endD);
    }

    clean(): void {
        this.element.innerHTML = '';
    }
    render(): void{
        this.renderGrid();
        this.renderContent();
    }

    abstract getTitle(): string;
    abstract getViewStart(): Date;
    abstract getViewEnd(): Date;
    abstract renderGrid(): void;
    abstract renderContent(): void;
}
class CaliContentYearView extends CaliContentView {
    constructor(element: Element, parent: CaliView){
        super(element, parent);
        this.viewName = 'year';
    }

    getViewStart(): Date {
        let d = new Date();
        d.setFullYear(this.getCali().getActiveDate().getFullYear(), 0, 11);
        return d;
    }
    getViewEnd(): Date {
        let d = new Date();
        d.setFullYear(this.getCali().getActiveDate().getFullYear(), 11, 31);
        return d;
    }
    getTitle(): string {
        return '' + this.getCali().getActiveDate().getFullYear();
    }

    renderGrid(): void {

    }
    renderContent(): void {

    }
}
class CaliContentMonthView extends CaliContentView {
    constructor(element: Element, parent: CaliView){
        super(element, parent);
        this.viewName = 'month';
    }

    getViewStart(): Date {
        let base = this.getCali().getActiveDate();
        let d = new Date();
        d.setFullYear(base.getFullYear(), base.getMonth(), 1);

        return d;
    }
    getViewEnd(): Date {
        let base = this.getCali().getActiveDate();
        let d = new Date();
        d.setFullYear(base.getFullYear(), base.getMonth() + 1, 0);

        return d;
    }
    getTitle(): string{
        return DateFormat(this.getCali().getActiveDate(), 'MMMM YYYY');
    }

    renderGrid(): void {

    }
    renderContent(): void {

    }
}
class CaliContentWeekView extends CaliContentView {
    constructor(element: Element, parent: CaliView){
        super(element, parent);
        this.viewName = 'week';
    }

    getViewStart(): Date {
        let base: Date = this.getCali().getActiveDate();
        let d = new Date();
        d.setDate(base.getDate() - base.getDay());

        return d;
    }
    getViewEnd(): Date {
        let base: Date = this.getCali().getActiveDate();
        let d = new Date();
        d.setDate(base.getDate() + (6 - base.getDay()));

        return d;
    }
    getTitle(): string {
        return '' + DateFormat(this.getViewStart(), 'D MMM') + ' - ' + DateFormat(this.getViewEnd(), 'D MMM');
    }

    renderGrid(): void {
        let masterList = document.createElement('ol');
        masterList.setAttribute('data-' + config.classPrefix + '-week', '');

        for (let j = 0; j < 7; j++){
            let masterListItem = document.createElement('li');
            masterListItem.setAttribute('data-' + config.classPrefix + '-day-in-week', '');
            let d = this.getViewStart();
            d.setDate(d.getDate() + j);
            masterListItem.appendChild(this.getDayGrid(d));
            masterList.appendChild(masterListItem);
        }

        this.element.appendChild(this.getTimeColumn());
        this.element.appendChild(masterList);
    }
    renderContent(): void {
        let list = document.createElement('ol');
        list.setAttribute('data-' + config.classPrefix + '-content-wrap', '');

        this.getFilteredEvents().forEach( (event) => list.appendChild(this.getEventObject(event, this.getViewStart())) );
        this.element.appendChild(list);
    }
}
class CaliContentDayView extends CaliContentView {
    constructor(element: Element, parent: CaliView){
        super(element, parent);
        this.viewName = 'day';
    }

    getViewStart(): Date {
        let base: Date = this.getCali().getActiveDate();
        let d = new Date(base.getTime());
        d.setHours(0, 0, 0, 0);

        return d;

    }
    getViewEnd(): Date {
        let base: Date = this.getCali().getActiveDate();
        let d = new Date(base.getTime());
        d.setHours(23, 59, 59, 0);

        return d;
    }
    getTitle(): string {
        return DateFormat(this.getCali().getActiveDate(), 'D MMMM');
    }

    renderGrid(): void {
        this.element.appendChild(this.getTimeColumn());
        this.element.appendChild(this.getDayGrid(this.getCali().getActiveDate()));
    }
    renderContent(): void {
        let list = document.createElement('ol');
        list.setAttribute('data-' + config.classPrefix + '-content-wrap', '');

        this.getFilteredEvents().forEach( (event) => list.appendChild(this.getEventObject(event)) );
        this.element.appendChild(list);
    }
}

class Cali {
    element: Element;
    events: EventList;
    header: CaliView;
    content: CaliContentView;
    activeDate: Date;
    contentElement: Element;

    constructor(element: Element, events?: iEvent[]) {
        this.element = element;
        this.activeDate = new Date();
        if (events)
            this.events = new EventList(events);

        this.contentElement = this.element.querySelectorAll('[data-' + config.classPrefix + '-content]')[0];
        if (this.contentElement){
            this.setView(this.contentElement.getAttribute('data-' + config.classPrefix + '-content'));
        }

        let header = this.element.querySelectorAll('[data-' + config.classPrefix + '-header]')[0];
        let headerObj: CaliView = null;
        if (header){
            headerObj = new CaliHeaderView(header, null);
            headerObj.setCali(this);
        }
        this.header = headerObj;


        this.render();
    }
    setView(type: string): void {
        let contentObj: CaliContentView = null;
        if (this.content && this.content.getViewName() === type) return;
        switch (type){
            case 'month': contentObj = new CaliContentMonthView(this.contentElement, null); break;
            case 'week': contentObj = new CaliContentWeekView(this.contentElement, null); break;
            case 'day': contentObj = new CaliContentDayView(this.contentElement, null); break;
            case 'year': contentObj = new CaliContentYearView(this.contentElement, null); break;
            default: throw 'Not supported view type';
        }
        if (contentObj){
            contentObj.setCali(this);
        }
        this.content = contentObj;

        this.render();
    }
    getCurrentView(): string {
        return this.content.getViewName();
    }
    getActiveDate(): Date {
        return this.activeDate;
    }
    getTitle(): string {
        return this.content.getTitle();
    }
    getEventList(): EventList {
        return this.events;
    }
    next(): void {
        switch (this.content.getViewName()) {
            case 'month':this.activeDate.setFullYear(this.activeDate.getFullYear(), this.activeDate.getMonth() + 1); break;
            case 'week': this.activeDate.setDate(this.activeDate.getDate() + 7); break;
            case 'day':  this.activeDate.setDate(this.activeDate.getDate() + 1); break;
            case 'year': this.activeDate.setDate(this.activeDate.getDate() + 365); break;
        }

        this.render();
    }
    prev(): void {
        switch (this.content.getViewName()){
            case 'month':this.activeDate.setFullYear(this.activeDate.getFullYear(), this.activeDate.getMonth() - 1); break;
            case 'week':  this.activeDate.setDate(this.activeDate.getDate() - 7); break;
            case 'day':   this.activeDate.setDate(this.activeDate.getDate() - 1); break;
            case 'year':  this.activeDate.setDate(this.activeDate.getDate() - 365); break;
        }

        this.render();
    }
    today(): void {
        this.activeDate = new Date();
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

let caliElements = document.querySelectorAll('[data-' + config.classPrefix + ']');

for (let i = 0; i < caliElements.length; i++){
        new Cali(caliElements[i], data);
    }