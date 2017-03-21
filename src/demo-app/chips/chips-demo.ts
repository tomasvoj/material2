import {Component} from '@angular/core';
import {MdChipInputEvent, ENTER, COMMA} from '@angular/material';
import {FormControl, NgModel} from '@angular/forms';

export interface Person {
  name: string;
}

export interface DemoColor {
  name: string;
  color: string;
}

@Component({
  moduleId: module.id,
  selector: 'chips-demo',
  templateUrl: 'chips-demo.html',
  styleUrls: ['chips-demo.css']
})
export class ChipsDemo {
  visible: boolean = true;
  color: string = '';
  selectable: boolean = true;
  removable: boolean = true;
  addOnBlur: boolean = true;

  stateCtrl: FormControl;
  currentState = '';
  topHeightCtrl = new FormControl(0);

  reactiveStates: any;
  tdStates: any[];

  tdDisabled = false;

  constructor() {
    this.tdStates = this.states;
    this.stateCtrl = new FormControl({code: 'CA', name: 'California'});
    this.reactiveStates = this.stateCtrl.valueChanges
        .startWith(this.stateCtrl.value)
        .map(val => this.displayFn(val))
        .map(name => this.filterStates(name));
  }

  // Enter, comma, semi-colon
  separatorKeys = [ENTER, COMMA, 186];

  states = [
    {code: 'AL', name: 'Alabama'},
    {code: 'AK', name: 'Alaska'},
    {code: 'AZ', name: 'Arizona'},
    {code: 'AR', name: 'Arkansas'},
    {code: 'CA', name: 'California'},
    {code: 'CO', name: 'Colorado'},
    {code: 'CT', name: 'Connecticut'},
    {code: 'DE', name: 'Delaware'},
    {code: 'FL', name: 'Florida'},
    {code: 'GA', name: 'Georgia'},
    {code: 'HI', name: 'Hawaii'},
    {code: 'ID', name: 'Idaho'},
    {code: 'IL', name: 'Illinois'},
    {code: 'IN', name: 'Indiana'},
    {code: 'IA', name: 'Iowa'},
    {code: 'KS', name: 'Kansas'},
    {code: 'KY', name: 'Kentucky'},
    {code: 'LA', name: 'Louisiana'},
    {code: 'ME', name: 'Maine'},
    {code: 'MD', name: 'Maryland'},
    {code: 'MA', name: 'Massachusetts'},
    {code: 'MI', name: 'Michigan'},
    {code: 'MN', name: 'Minnesota'},
    {code: 'MS', name: 'Mississippi'},
    {code: 'MO', name: 'Missouri'},
    {code: 'MT', name: 'Montana'},
    {code: 'NE', name: 'Nebraska'},
    {code: 'NV', name: 'Nevada'},
    {code: 'NH', name: 'New Hampshire'},
    {code: 'NJ', name: 'New Jersey'},
    {code: 'NM', name: 'New Mexico'},
    {code: 'NY', name: 'New York'},
    {code: 'NC', name: 'North Carolina'},
    {code: 'ND', name: 'North Dakota'},
    {code: 'OH', name: 'Ohio'},
    {code: 'OK', name: 'Oklahoma'},
    {code: 'OR', name: 'Oregon'},
    {code: 'PA', name: 'Pennsylvania'},
    {code: 'RI', name: 'Rhode Island'},
    {code: 'SC', name: 'South Carolina'},
    {code: 'SD', name: 'South Dakota'},
    {code: 'TN', name: 'Tennessee'},
    {code: 'TX', name: 'Texas'},
    {code: 'UT', name: 'Utah'},
    {code: 'VT', name: 'Vermont'},
    {code: 'VA', name: 'Virginia'},
    {code: 'WA', name: 'Washington'},
    {code: 'WV', name: 'West Virginia'},
    {code: 'WI', name: 'Wisconsin'},
    {code: 'WY', name: 'Wyoming'},
  ];

  people: Person[] = [
    { name: 'Kara' },
    { name: 'Jeremy' },
    { name: 'Topher' },
    { name: 'Elad' },
    { name: 'Kristiyan' },
    { name: 'Paul' }
  ];

  availableColors: DemoColor[] = [
    { name: 'none', color: '' },
    { name: 'Primary', color: 'primary' },
    { name: 'Accent', color: 'accent' },
    { name: 'Warn', color: 'warn' }
  ];

  alert(message: string): void {
    alert(message);
  }

  add(event: MdChipInputEvent): void {
    let input = event.input;
    let value = event.value;

    // Add our person
    if (value && value.trim() != '') {
      this.people.push({ name: value.trim() });
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(person: Person): void {
    let index = this.people.indexOf(person);

    if (index >= 0) {
      this.people.splice(index, 1);
    }
  }

  toggleVisible(): void {
    this.visible = false;
  }

  displayFn(value: any): string {
    return value && typeof value === 'object' ? value.name : value;
  }

  filterStates(val: string) {
    return val ? this.states.filter(s => new RegExp(`^${val}`, 'gi').test(s.name))
        : this.states;
  }
}
