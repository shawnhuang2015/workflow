import { Component, OnInit } from '@angular/core';
import { Agendas } from './app.modle';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  agendas: Agendas;

  currentMonth: number;
  currentYear: number;

  data: any[];

  constructor() {
    this.currentMonth = 9;
    this.currentYear = 2017;
  }

  ngOnInit() {
    console.log('init');
    this.agendas = new Agendas();

    this.data = this.agendas.getAgendasByMonth(this.currentMonth, this.currentYear);
  }

  onPreMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear -= 1;
    } else {
      this.currentMonth -= 1;
    }

    this.data = this.agendas.getAgendasByMonth(this.currentMonth, this.currentYear);
  }

  onNextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear += 1;
    } else {
      this.currentMonth += 1;
    }

    this.data = this.agendas.getAgendasByMonth(this.currentMonth, this.currentYear);
  }

  onNewEvent() {
    console.log('on new event');
  }
}
