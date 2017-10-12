export class Agendas {
  jobs: OneAgenda[];
  constructor() {
    this.jobs = [];

    // testing data;
    let end = new Date();
    const range = 3600 * 1000 * 10;
    let start;
    for (let i = 0; i < 100; ++i) {
       start = new Date(end.getTime() + range);
       end = new Date(start.getTime() + range);
      const tmp = new OneAgenda(start, end, `Random Job ${i}`, (i % 10 === 0));
      this.jobs.push(tmp);
    }
  }

  getAgendasByMonth(Month, Year) {
    const result = [];
    const tmpMap = {};

    this.jobs.filter((job: OneAgenda) => {
      return Month === job.getMonth() && Year === job.getYear();
    }).forEach((job: OneAgenda) => {
      const key = job.getDateString();
      if (tmpMap[key] !== undefined) {
        tmpMap[key].push(job);
      } else {
        tmpMap[key] = [job];
      }
    });

    Object.keys(tmpMap).forEach(key => {
      result.push({
        date: key,
        agendas: tmpMap[key].sort((a, b) => {
          return a.start.getTime() > b.start.getTime();
        })
      });
    });

    return result;
  }
}

export class OneAgenda {
  isAllDay = false;
  start: Date;
  end: Date;
  details: any;

  constructor(start: Date, end: Date, details: any, isAllDay = false) {
    if (isAllDay) {
      this.isAllDay = true;
    }

    this.start = start;
    this.end = end;
    this.details = details;
  }

  getTime() {
    if (this.isAllDay) {
      return 'All Day';
    } else {
      return (this.end.getTime() - this.start.getTime()).toString();
    }
  }

  getMonth() {
    return this.start.getMonth();
  }

  getYear() {
    return this.start.getFullYear();
  }

  getDateString() {
    return this.start.toDateString();
  }

  getTimeRange() {
    if (this.isAllDay) {
      return 'All Day';
    } else {
      return `${this.start.toLocaleTimeString()} - ${this.end.toLocaleTimeString()}`;
    }
  }

  getDetails() {
    return this.details;
  }
}
