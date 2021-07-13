import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ReplaySubject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n-core';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PeWidgetService, ucfirst } from '../../infrastructure';
import { PeStatisticsDatepickerComponent } from '../../misc/components/statistics-datepicker/statistics-datepicker.component';

import * as moment from 'moment';

interface FieldOption {
  label: string;
  value: string;
}

@Component({
  selector: 'peb-field-form',
  templateUrl: './field-form.component.html',
  styleUrls: ['./field-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeFieldFormComponent implements OnInit, OnDestroy {
  readonly destroyed$ = new ReplaySubject<boolean>();
  body: HTMLElement = document.body;

  timeFrames: FieldOption[] = [
    { label: this.translateService.translate('statistics.form_fields.time_frame_options.hourly'), value: 'hour' },
    { label: this.translateService.translate('statistics.form_fields.time_frame_options.daily'), value: 'day' },
    { label: this.translateService.translate('statistics.form_fields.time_frame_options.weekly'), value: 'week' },
    { label: this.translateService.translate('statistics.form_fields.time_frame_options.monthly'), value: 'month' },
    { label: this.translateService.translate('statistics.form_fields.time_frame_options.yearly'), value: 'year' },
    { label: this.translateService.translate('statistics.form_fields.time_frame_options.today'), value: 'today' },
    {
      label: this.translateService.translate('statistics.form_fields.time_frame_options.yesterday'),
      value: 'yesterday',
    },
    {
      label: this.translateService.translate('statistics.form_fields.time_frame_options.last_week'),
      value: 'last week',
    },
    {
      label: this.translateService.translate('statistics.form_fields.time_frame_options.last_month'),
      value: 'last month',
    },
    {
      label: this.translateService.translate('statistics.form_fields.time_frame_options.last_year'),
      value: 'last year',
    },
    {
      label: this.translateService.translate('statistics.form_fields.time_frame_options.date_range'),
      value: 'date_range',
    },
  ];

  currencies: FieldOption[] = [
    { label: this.translateService.translate('statistics.form_fields.currency_options.usd'), value: 'USD' },
    { label: this.translateService.translate('statistics.form_fields.currency_options.eur'), value: 'EUR' },
    { label: this.translateService.translate('statistics.form_fields.currency_options.dkk'), value: 'DKK' },
    { label: this.translateService.translate('statistics.form_fields.currency_options.se'), value: 'SE' },
    { label: this.translateService.translate('statistics.form_fields.currency_options.nok'), value: 'NOK' },
  ];

  lineGraphGranularity: FieldOption[] = [
    { label: this.translateService.translate('statistics.form_fields.time_frame_options.hourly'), value: 'hour' },
    { label: this.translateService.translate('statistics.form_fields.time_frame_options.daily'), value: 'day' },
    { label: this.translateService.translate('statistics.form_fields.time_frame_options.weekly'), value: 'week' },
    { label: this.translateService.translate('statistics.form_fields.time_frame_options.monthly'), value: 'month' },
    { label: this.translateService.translate('statistics.form_fields.time_frame_options.yearly'), value: 'year' },
  ];

  devices: FieldOption[] = [
    { label: this.translateService.translate('statistics.form_fields.devices_options.desktop'), value: 'Desktop' },
    { label: this.translateService.translate('statistics.form_fields.devices_options.tablet'), value: 'Tablet' },
    { label: this.translateService.translate('statistics.form_fields.devices_options.mobile'), value: 'Mobile' },
  ];

  browsers: FieldOption[] = [
    { label: this.translateService.translate('statistics.form_fields.browsers_options.chrome'), value: 'Chrome' },
    { label: this.translateService.translate('statistics.form_fields.browsers_options.safari'), value: 'Safari' },
    {
      label: this.translateService.translate('statistics.form_fields.browsers_options.internet_explorer'),
      value: 'IE',
    },
  ];

  channels: FieldOption[] = [];
  paymentMethods: FieldOption[] = [];

  fieldForm = this.formBuilder.group({
    behaviorMetric: null,
    paymentStatus: null,
    conversionMetric: null,
    currency: null,
    channel: null,
    paymentMethod: null,
    dateRangeGranularity: null,
    browser: null,
    device: null,
    granularity: [],
    lineGraphGranularity: [],
    dateTimeTo: [],
    dateTimeFrom: [],
  });

  metrics;

  constructor(
    private formBuilder: FormBuilder,
    private matDialog: MatDialog,
    public widgetService: PeWidgetService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
  ) {
    this.matIconRegistry.addSvgIcon(
      `datetime-picker`,
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/datetime-picker-icon.svg'),
    );
  }

  ngOnInit(): void {
    this.body.classList.remove(`remove-overlay-content-padding`);
    this.overlayData.onReset
      .pipe(
        tap(() => {
          this.fieldForm.reset({
            behaviorMetric: null,
            paymentStatus: null,
            conversionMetric: null,
            currency: null,
            channel: null,
            paymentMethod: null,
            dateRangeGranularity: null,
            browser: null,
            device: null,
            granularity: [],
            lineGraphGranularity: [],
            dateTimeTo: [],
            dateTimeFrom: [],
          });
          delete this.widgetService.fieldForms[this.overlayData.fieldId];
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
    this.metrics = this.widgetService.metricTypes.map((item) => {
      const fields = [];
      const formName = item.type
        .split(' ')
        .map((name, index) => {
          if (index === item.type.split(' ').length - 1) {
            return name;
          }
          return name.toLowerCase();
        })
        .join('');
      item.list.forEach((element) => {
        fields.push({
          label: this.translateService.translate(`statistics.form_fields.metric_optons.${element.name}`),
          value: element.name,
        });
      });

      return {
        formName,
        type: this.translateService.translate(
          `statistics.form_fields.metric_groups.${item.type.replace(' ', '_').toLowerCase()}`,
        ),
        list: fields,
      };
    });

    this.channels = this.widgetService.appChannels;
    this.paymentMethods = this.widgetService.paymentMethods;
    if (this.widgetService.fieldForms[this.overlayData.fieldId]) {
      this.fieldForm.patchValue(this.widgetService.fieldForms[this.overlayData.fieldId], { emitEvent: false });
      this.cdr.detectChanges();
    }
    this.fieldForm.valueChanges
      .pipe(
        tap((formValue) => {
          if (formValue.granularity !== 'date_range') {
            formValue.dateRangeGranularity = null;
            formValue.dateTimeFrom = null;
            formValue.dateTimeTo = null;
          }
          this.widgetService.fieldForms[this.overlayData.fieldId] = formValue;
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  openDatepicker(controlName: string): void {
    const dialog = this.matDialog.open(PeStatisticsDatepickerComponent);
    dialog
      .afterClosed()
      .pipe(
        tap((value) => {
          if (value) {
            const date = moment(value).format('DD.MM.YYYY');
            this.fieldForm.get(controlName).patchValue(date);
          }
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  getChipLabel(value): string {
    const item = this.paymentMethods.find(element => element.value === value);
    return item.label;
  }

  ngOnDestroy() {
    this.body.classList.add(`remove-overlay-content-padding`);
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
