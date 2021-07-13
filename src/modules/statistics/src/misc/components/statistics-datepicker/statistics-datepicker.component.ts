import { ChangeDetectionStrategy, Component, Inject, ViewChild } from '@angular/core';
import { MatCalendar } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Moment } from 'moment';
import * as moment_ from 'moment';
const moment = moment_;

@Component({
  selector: 'pe-statistics-datepicker',
  templateUrl: './statistics-datepicker.component.html',
  styleUrls: ['./statistics-datepicker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeStatisticsDatepickerComponent {
  @ViewChild('calendar') calendar: MatCalendar<Moment>;

  readonly maxDate = moment();

  constructor(
    private dialogRef: MatDialogRef<PeStatisticsDatepickerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  selectedChangeOn(date: Moment): void {
    this.dialogRef.close(date);
  }
}
