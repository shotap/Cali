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
    organizer?: string,

    overlap?: number,
    offset?: number
}

var DateFormat = function (d: Date, format: string): string {
    let res = format;

    res = res.replace(/YYYY/g, '' + d.getFullYear());
    res = res.replace(/D/g, '' + d.getDate());
    res = res.replace(/dddd/g, '' + config.dayNamesShort[d.getDay()]);
    res = res.replace(/ddd/g, '' + config.dayNames[d.getDay()]);
    res = res.replace(/MMMM/g, config.monthNames[d.getMonth()]);
    res = res.replace(/MMM/g, config.monthNamesShort[d.getMonth()]);

    return res;
};

var data = [
    {uid: 11,  title: '1',       start: new Date('2016/10/16 04:00:00') , end: new Date('2016/10/16 06:00:00')},
    {uid: 12,  title: '2',       start: new Date('2016/10/16 07:00:00') , end: new Date('2016/10/16 09:00:00')},
    {uid: 13,  title: '3',       start: new Date('2016/10/17 05:00:00') , end: new Date('2016/10/17 08:00:00')},
    {uid: 14,  title: '3!',      start: new Date('2016/10/17 08:15:00') , end: new Date('2016/10/17 10:00:00')},
    {uid: 15,  title: 'pi',      start: new Date('2016/10/17 05:00:00') , end: new Date('2016/10/17 05:30:00')},
    {uid: 16,  title: '4',       start: new Date('2016/10/17 06:00:00') , end: new Date('2016/10/17 07:00:00')},
    {uid: 17,  title: 'po',      start: new Date('2016/10/17 06:30:00') , end: new Date('2016/10/17 07:20:00')},
    {uid: 18,  title: 'pe',      start: new Date('2016/10/17 06:45:00') , end: new Date('2016/10/17 07:45:00')},
    {uid: 19,  title: 'ze',      start: new Date('2016/10/17 07:35:00') , end: new Date('2016/10/17 09:45:00')},
    {uid: 20,  title: '5',       start: new Date('2016/10/18 04:00:00') , end: new Date('2016/10/18 12:00:00')},
    {uid: 21,  title: '6',       start: new Date('2016/10/18 04:00:00') , end: new Date('2016/10/18 06:00:00')},
    {uid: 22,  title: '7',       start: new Date('2016/10/19 04:00:00') , end: new Date('2016/10/19 08:00:00')},
    {uid: 23,  title: '8',       start: new Date('2016/10/19 04:00:00') , end: new Date('2016/10/10 02:00:00')},
    {uid: 24,  title: '9',       start: new Date('2016/10/18 04:00:00') , end: new Date('2016/10/18 05:00:00')},
    {uid: 25, title: '10',       start: new Date('2016/10/18 04:00:00') , end: new Date('2016/10/18 06:00:00')},
    {uid: 26, title: '11',       start: new Date('2016/10/19 04:00:00') , end: new Date('2016/10/19 05:00:00')},
    {uid: 27, title: '12',       start: new Date('2016/10/20 04:00:00') , end: new Date('2016/10/20 06:00:00')},
];

var config = {
    classPrefix: 'cali',
    view: 'week',
    rtl: false,
    rowHeight: 25,
    headerButtons: 'year,month,week,day',
    monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"],
    dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    buttonText: {
        'day': 'Day',
        'week': 'Week',
        'month': 'Month',
        'year': 'Year',
        'today': 'Today',
        'prev': '<',
        'next': '>'
    }
};
class EventList {
    events: iEvent[];

    constructor(events: iEvent[]){
        this.events = events;
    }
    forEach(callback: (value: iEvent) => void) {
        if (this.events)
            this.events.forEach(callback);
    }
    getFilteredAndSorted(startD: Date, endD: Date): iEvent[]{
        let res: iEvent[] = [];
        this.events.map( (event: iEvent) => {
            if (event.start.getTime() <= endD.getTime() && event.end.getTime() >= startD.getTime()){
                res.push(event);
            }
        });

        res.sort( (a: iEvent, b: iEvent) => {
            let startFirst = a.start.getTime() - b.start.getTime();
            if (startFirst > 0) return 1;
            if (startFirst < 0) return -1;

            let longer = a.end.getTime() - b.end.getTime();
            if (longer > 0) return -1;
            if (longer < 0) return 1;

            return 0;
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
        console.log('get cali');
        if (!this.cali) {
            let parent:CaliView = this;

            while (parent.parent !== null) {
                parent = parent.parent;
            }

            return parent.cali;
        }

        return this.cali;
    }
    abstract clean(): void;
    abstract render(): void;
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
        btn.appendChild(document.createTextNode( Object.keys(config.buttonText).indexOf(type) != -1 ? config.buttonText[type] : type ));
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
                this.getCali().setView(type, true);
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
    getEventElement(event: iEvent, parent: Element, maxOffset: number, isWeek?: boolean): Element[]{
        let res: Element[] = [];
        let eventElement = document.createElement('li');
        eventElement.setAttribute('data-' + config.classPrefix + '-event', ''+event.uid);
        eventElement.style.top = '' + ((event.start.getHours()+(event.start.getMinutes()/60))*config.rowHeight*2+config.rowHeight) + 'px';
        eventElement.appendChild(document.createTextNode(event.title));

        if (event.start.getDay() === event.end.getDay()){ // start and end in the same day
            eventElement.style.height = '' + ((event.end.getTime()-event.start.getTime())/36e5*config.rowHeight*2) + 'px';
        } else {
            let midnight = new Date();
            midnight.setTime(event.start.getTime());
            midnight.setHours(24, 0, 0);
            eventElement.style.height = '' + ((midnight.getTime()-event.start.getTime())/36e5*config.rowHeight*2) + 'px';

            if (isWeek) {
                let leftover = (event.end.getTime() - event.start.getTime()) / 36e5 - (midnight.getTime() - event.start.getTime()) / 36e5;
                let leftoverDays = Math.min(Math.floor(leftover / 24) + 1, 6 - event.start.getDay()); // if this event starts but dosent end this week

                for (let i = 1; i <= leftoverDays; i++) {
                    let delta = Math.min(24, leftover - (24 * (i - 1)));
                    let _event = JSON.parse(JSON.stringify(event)); // deep copy the event

                    let _start = new Date();
                    _start.setTime(event.start.getTime());
                    _start.setDate(_start.getDate() + i);
                    _start.setHours(0, 1, 0);

                    let _end = new Date();
                    _end.setTime(_start.getTime());
                    if (delta === 24)   _end.setHours(23, 59);
                    else                _end.setHours(delta);

                    _event.start = _start;
                    _event.end = _end;

                    this.getEventElement(_event, parent, maxOffset, isWeek).forEach((r) => res.push(r));
                }
            }
        }

        if (isWeek){
            if (!config.rtl) {
                eventElement.style.left = "calc(100%/7*" + event.start.getDay() + (event.offset ? " + " + event.offset + "*(100% - 50px)/7" + (event.overlap ? "/" + (1 + maxOffset) : "") : "") + ")";
                eventElement.style.right = "calc(100%/7*" + (7 - event.start.getDay() - 1) + ")";
            } else {
                eventElement.style.right = "calc(100%/7*" + event.start.getDay() + (event.offset ? " + " + event.offset + "*(100% - 50px)/7" + (event.overlap ? "/" + (1 + maxOffset) : "") : "") + ")";
                eventElement.style.left = "calc(100%/7*" + (7 - event.start.getDay() - 1) + ")";
            }
        } else {
            if (!config.rtl) {
                eventElement.style.left = event.offset ? "calc(" + event.offset + "*10%" : "0";
                eventElement.style.right = "0";
            } else {
                eventElement.style.right = event.offset ? "calc(" + event.offset + "*10%" : "0";
                eventElement.style.left = "0";
            }
        }

        eventElement.style.zIndex = "" + (100+event.offset);
        res.push(eventElement);
        return res;
    }
    getFilteredEvents(startD?: Date, endD?: Date): [iEvent[], number] {
        startD = startD || this.getViewStart();
        endD = endD || this.getViewEnd();

        let events = this.getCali().getEventList();
        return this.checkOverlap(events.getFilteredAndSorted(startD, endD));
    }
    checkOverlap(arr: iEvent[]): [iEvent[], number]{
        let maxOffset = 0;
        for (let i = 0; i < arr.length; i++){
            arr[i].offset = 0;
            arr[i].overlap = 0;
        }

        for (let i = 0; i < arr.length; i++){
            for (let j = i + 1; j < arr.length; j++){
                if (arr[i].start.getTime() <= arr[j].end.getTime() && arr[i].end.getTime() >= arr[j].start.getTime()) {
                    arr[i].overlap++; arr[j].overlap++;
                    maxOffset = Math.max(maxOffset, arr[i].overlap, arr[j].overlap);
                    //arr[j].offset++;
                    arr[j].offset = arr[i].offset + 1;
                } else break;
            }
        }

        return [arr, maxOffset];
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
        let base: Date = this.getCali().getActiveDate();
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
        let tbl = document.createElement('table');
        tbl.setAttribute('data-' + config.classPrefix + '-month-grid', '');

        let tblHead = document.createElement('thead');
        let tblHeadRow = document.createElement('tr');
        tblHeadRow.setAttribute('data-' + config.classPrefix + '-grid-header', '');
        for (let i = 0; i < 7; i++){
            let tblHeadRowCell = document.createElement('th');
            tblHeadRowCell.appendChild(document.createTextNode(config.dayNames[i]));
            tblHeadRow.appendChild(tblHeadRowCell);
        }
        tblHead.appendChild(tblHeadRow);
        tbl.appendChild(tblHead);

        let tblBody = document.createElement('tbody');
        let startOfMonth = this.getViewStart();
        let startOfMonthNumber = startOfMonth.getDay();

        let isActive = false;
        for (let i = 0; i < 6; i++){
            let tblRow = document.createElement('tr');
            tblRow.setAttribute('data-' + config.classPrefix + '-week-in-month', '');

            for (let j = 0; j < 7; j++){
                let dayNumber = i*7 + j;
                let cellDate = new Date();
                cellDate.setDate(startOfMonth.getDate() + dayNumber - startOfMonthNumber);

                let tblRowCell = document.createElement('td');
                tblRowCell.setAttribute('data-' + config.classPrefix + '-day-in-month', '');
                tblRowCell.setAttribute('data-' + config.classPrefix + '-day-' + j, '');

                let tblRowCellHeader = document.createElement('div');
                tblRowCellHeader.setAttribute('data-' + config.classPrefix + '-day-in-month-date', '');

                if (cellDate.getDate() === 1)
                    isActive = !isActive;

                if (!isActive) {
                    tblRowCellHeader.setAttribute('data-' + config.classPrefix + '-day-in-month-date-not-active', '');
                }
                tblRowCellHeader.appendChild(document.createTextNode(DateFormat(cellDate, 'D')));

                tblRowCell.appendChild(tblRowCellHeader);
                tblRow.appendChild(tblRowCell);
            }

            tblBody.appendChild(tblRow);
        }
        tbl.appendChild(tblBody);
        this.element.appendChild(tbl);
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
        let base: Date = new Date('' + this.getCali().getActiveDate()); console.log(base);
        let d = new Date();
        d.setFullYear(base.getFullYear(), base.getMonth(), base.getDate() - base.getDay());

        return d;
    }
    getViewEnd(): Date {
        let base: Date = new Date('' + this.getCali().getActiveDate());
        let d = new Date();
        d.setFullYear(base.getFullYear(), base.getMonth(), base.getDate() + 6 - base.getDay());
        //d.setDate(base.getDate() + (6 - base.getDay()));

        return d;
    }
    getTitle(): string {
        return '' + DateFormat(this.getViewStart(), 'D MMM') + ' - ' + DateFormat(this.getViewEnd(), 'D MMM');
    }

    renderGrid(): void {
        let tbl = document.createElement('table');
        tbl.setAttribute('data-' + config.classPrefix + '-week-grid', '');

        let tblHead = document.createElement('thead');
        let tblHeadRow = document.createElement('tr');
        for (let i = 0; i < 8; i++) {
            let tblHeadRowCell = document.createElement('th');
            tblHeadRowCell.setAttribute('data-' + config.classPrefix + '-grid-header', '');
            if (i) {
                let d = this.getCali().getActiveDate();
                d.setDate(d.getDate() + i + 1);
                tblHeadRowCell.appendChild(document.createTextNode(DateFormat(d, 'ddd D')));
            }
            tblHeadRow.appendChild(tblHeadRowCell);
        }
        tblHead.appendChild(tblHeadRow);
        tbl.appendChild(tblHead);

        let tblBody = document.createElement('tbody');

        for (let i = 0; i < 48; i++){
            let tblRow = document.createElement('tr');

            if (i%2===0){
                let tblRowTimeCell = document.createElement('td');
                tblRowTimeCell.rowSpan = 2;
                tblRowTimeCell.className = 'data-' + config.classPrefix + '-time-column';
                let z = '' + Math.floor(i/2);
                z = (z.length === 1 ? '0' + z : z) + ':00';
                tblRowTimeCell.appendChild(document.createTextNode(z));
                tblRow.appendChild(tblRowTimeCell);
            }

            for (let j = 0; j < 7; j++) {
                let tblRowCell = document.createElement('td');
                tblRowCell.setAttribute('data-' + config.classPrefix + '-hour-in-day', '');
                tblRow.appendChild(tblRowCell);
            }

            tblBody.appendChild(tblRow);
        }
        tbl.appendChild(tblBody);
        this.element.appendChild(tbl);


    }
    renderContent(): void {
        let list = document.createElement('ol');
        list.setAttribute('data-' + config.classPrefix + '-content-wrap', '');

        let filttered: [iEvent[], number] = this.getFilteredEvents();
        filttered[0].forEach( (event, i) => this.getEventElement(event, list, filttered[1], true).forEach( (e) => { list.appendChild(e); } ) );
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
        let tbl = document.createElement('table');
        tbl.setAttribute('data-' + config.classPrefix + '-day-grid', '');

        let tblHead = document.createElement('thead');
        let tblHeadRow = document.createElement('tr');
        for (let i = 0; i < 2; i++) {
            let tblHeadRowCell = document.createElement('th');
            tblHeadRowCell.setAttribute('data-' + config.classPrefix + '-grid-header', '');
            if (i)
                tblHeadRowCell.appendChild(document.createTextNode(DateFormat(this.getCali().getActiveDate(), 'ddd D')));
            tblHeadRow.appendChild(tblHeadRowCell);
        }
        tblHead.appendChild(tblHeadRow);
        tbl.appendChild(tblHead);

        let tblBody = document.createElement('tbody');

        for (let i = 0; i < 48; i++){
            let tblRow = document.createElement('tr');

            if (i%2===0){
                let tblRowTimeCell = document.createElement('td');
                tblRowTimeCell.rowSpan = 2;
                tblRowTimeCell.className = 'data-' + config.classPrefix + '-time-column';
                let z = '' + Math.floor(i/2);
                z = (z.length === 1 ? '0' + z : z) + ':00';
                tblRowTimeCell.appendChild(document.createTextNode(z));
                tblRow.appendChild(tblRowTimeCell);
            }

            let tblRowCell = document.createElement('td');
            tblRowCell.setAttribute('data-' + config.classPrefix + '-hour-in-day', '');
            tblRow.appendChild(tblRowCell);
            tblBody.appendChild(tblRow);
        }
        tbl.appendChild(tblBody);
        this.element.appendChild(tbl);
    }
    renderContent(): void {
        let list = document.createElement('ol');
        list.setAttribute('data-' + config.classPrefix + '-content-wrap', '');

        let filtered: [iEvent[], number] = this.getFilteredEvents();
        filtered[0].forEach( (event, i) => this.getEventElement(event, list, filtered[1]).forEach( (e) => list.appendChild(e) ) );
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
            this.setView(this.contentElement.getAttribute('data-' + config.classPrefix + '-content'), false);
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
    setView(type: string, toRender: boolean): void {
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