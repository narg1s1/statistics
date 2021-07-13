import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { AppThemeEnum, EnvironmentConfigInterface, EnvService, PE_ENV } from '@pe/common';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { TranslateService } from '@pe/i18n-core';

import { ActualPeStatisticsApi, PeWidgetService } from '../../infrastructure';
import { PeFieldFormComponent } from '../field-form/field-form.component';
import { SizeOptions } from '../widget-size/widget-size.component';
import { MOCK_DATA } from '../../widgets/mock.data';

import * as moment from 'moment';

export const sizeOptions: SizeOptions[] = [
  {
    size: 'small',
    graphView: [158, 130],
  },
  {
    size: 'medium',
    graphView: [308, 130],
  },
  {
    size: 'large',
    graphView: [308, 280],
  },
];

export const FIELD_NUMBER = {
  ['DetailedNumbers-large']: 22,
  ['DetailedNumbers-medium']: 10,
  ['Percentage']: 3,
  ['SimpleNumbers']: 3,
  ['TwoColumns']: 6,
  ['LineGraph']: 4,
};

interface StatisticsField {
  type: string;
  value: any;
}

@Component({
  selector: 'peb-statistics-edit-form',
  templateUrl: './edit-statistics-form.component.html',
  styleUrls: ['./edit-statistics-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeStatisticsEditFormComponent implements OnInit, OnDestroy {
  body: HTMLElement = document.body;
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;
  lineGraphDataRequired = false;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ActualPeStatisticsApi,
    private overlayWidgetService: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
    public widgetService: PeWidgetService,
    private envService: EnvService,
    private translateService: TranslateService,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {}
  readonly destroyed$ = new ReplaySubject<boolean>();

  widgetConfig: any = { size: this.widgetService.selectedWidgetSize, viewType: this.widgetService.viewType };

  addWidgetForm: FormGroup = this.formBuilder.group({
    name: this.formBuilder.control('Transactions'),
    fields: this.formBuilder.array([]),
  });

  addWidgetFormValue: any;

  numbers: number[] = [];

  fieldData = [];

  getGraphView(size) {
    return sizeOptions.find(sizeOption => sizeOption.size === size)?.graphView;
  }

  getControls() {
    return (this.addWidgetForm.get('fields') as FormArray).controls;
  }

  formPreviewDataSource = (formValue) => {
    this.addWidgetFormValue = formValue;
    const perChunk = 3;

    const previewDataSource = [formValue.name, null].concat(formValue.fields).reduce((resultArray, item, index) => {
      const chunkIndex = Math.floor(index / perChunk);

      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = [];
      }

      if (this.widgetService.viewType === 'LineGraph' && chunkIndex === 1 && index === 4) {
        resultArray[chunkIndex].push(MOCK_DATA.LineGraph[1][1]);
      } else {
        resultArray[chunkIndex].push(item);
      }

      return resultArray;
    }, []);

    this.widgetConfig = {
      ...this.widgetConfig,
      name: formValue.name,
      viewType: this.widgetService.viewType,
      dataSource: previewDataSource,
      size: this.widgetService.selectedWidgetSize,
    };

    this.cdr.detectChanges();
  }

  ngOnInit() {
    const metricTypes = this.widgetService.metricTypes.map((item) => {
      const groupName = item.type
        .split(' ')
        .map((name, index) => {
          if (index === item.type.split(' ').length - 1) {
            return name;
          }
          return name.toLowerCase();
        })
        .join('');

      const items = item.list.map((element) => {
        return element.name;
      });

      return { groupName, items };
    });
    this.widgetService.fieldForms = {};
    this.body.classList.add(`wider-overlay`);
    this.widgetService.viewType = this.overlayData.data.viewType;
    this.widgetService.selectedWidgetSize = this.overlayData.data.size;
    this.widgetConfig.name = this.overlayData.data?.widgetSettings[0][0]?.value;
    this.addWidgetForm.get('name').patchValue(this.overlayData.data?.widgetSettings[0][0]?.value);
    this.overlayData.data.widgetSettings.forEach((item, index) => {
      if (index < 2) {
        return;
      }
      let formFieldData = {};
      if (item.length === 0) {
        this.fieldData.push('');
        return;
      }

      if (item[0]?.type !== 'text') {
        this.fieldData.push('');
      }
      item.forEach((element) => {
        if (element.type === 'text') {
          this.fieldData.push(element.value);
          return;
        }
        if (element.type === 'metric') {
          metricTypes.forEach((group) => {
            if (group.items.includes(element.value)) {
              formFieldData[group.groupName] = element.value;
              return;
            }
          });
        }
        if (element.type === 'granularity') {
          if (this.overlayData.data.viewType === 'LineGraph') {
            formFieldData['lineGraphGranularity'] = element.value;
          }
          if (['hour', 'day', 'week', 'month', 'year'].includes(element.value)) {
            formFieldData['granularity'] = element.value;
            formFieldData['dateRangeGranularity'] = element.value;
          }
          return;
        }
        if (element.type === 'dateTimeFrom') {
          formFieldData['dateTimeFrom'] = moment(element.value).format('DD.MM.YYYY');
          formFieldData['granularity'] = 'date_range';
          return;
        }
        if (element.type === 'dateTimeTo') {
          formFieldData['dateTimeTo'] = moment(element.value).format('DD.MM.YYYY');
          formFieldData['granularity'] = 'date_range';
          return;
        }
        if (element.type === 'dateTimeRelative') {
          formFieldData['granularity'] = element.value;
          return;
        }
        if (element.type === 'filter') {
          if (element.value.name === 'currency') {
            formFieldData['currency'] = element.value.value;
            return;
          }
          if (element.value.name === 'paymentMethod') {
            if (element.value.value) {
              formFieldData['paymentMethod'] = [element.value.value];
            } else {
              formFieldData['paymentMethod'] = element.value.values;
            }
            return;
          }
          if (element.value.name === 'device') {
            formFieldData['device'] = element.value.value;
            return;
          }
          if (element.value.name === 'browser') {
            formFieldData['browser'] = element.value.value;
            return;
          }
          if (element.value.name === 'channel') {
            formFieldData['channel'] = element.value.value;
          }
        }
      });
      if (Object.keys(formFieldData).length !== 0) {
        this.widgetService.fieldForms[index - 2] = formFieldData;
      }
    });

    if (this.widgetService.viewType === this.widgetService.widgetType.DetailedNumbers) {
      this.numbers = Array(FIELD_NUMBER[`${this.widgetService.viewType}-${this.widgetService.selectedWidgetSize}`])
        .fill(1)
        .map((x, i) => i + 1);
    } else {
      this.numbers = Array(FIELD_NUMBER[this.widgetService.viewType])
        .fill(1)
        .map((x, i) => i + 1);
    }

    this.numbers.forEach((number) => {
      (this.addWidgetForm.get('fields') as FormArray).push(
        new FormControl(
          this.fieldData[number - 1] ? this.fieldData[number - 1] : `Field ${number}`,
          Validators.required,
        ),
      );
    });
    setTimeout(() => {
      this.formPreviewDataSource(this.addWidgetForm.value);
    });
    this.addWidgetForm.valueChanges.pipe(tap(this.formPreviewDataSource), takeUntil(this.destroyed$)).subscribe();

    this.overlayConfig.onSave$
      .pipe(
        tap((onSave) => {
          if (onSave) {
            const data: any = {
              type: 'transactions',
              name: this.widgetConfig.name,
              size: this.widgetService.selectedWidgetSize,
              viewType: this.widgetService.viewType,
              widgetSettings: [],
            };
            if (this.addWidgetFormValue?.fields) {
              data.widgetSettings.push([
                [{ type: 'text', value: this.widgetConfig.name ? this.widgetConfig.name : 'Transactions' }],
                [],
                [{ type: 'text', value: this.addWidgetFormValue?.fields[0] }],
              ]);

              const fields = this.addWidgetFormValue?.fields.slice(1, this.addWidgetFormValue.fields.length);
              let row: any[][] = [];
              Object.values(fields).forEach((value: string, i: number) => {
                let field = [];
                if (value === `Field ${i + 2}`) {
                  let currentForm = this.widgetService.fieldForms[i + 1];
                  if (currentForm) {
                    const gatheredData = this.gatherDataFromField(field, currentForm);
                    field = gatheredData.field;
                    currentForm = gatheredData.currentForm;
                  }
                } else {
                  let currentForm = this.widgetService.fieldForms[i + 1];
                  if (currentForm) {
                    const gatheredData = this.gatherDataFromField(field, currentForm);
                    field = gatheredData.field;
                    currentForm = gatheredData.currentForm;
                  } else {
                    field.push({ value, type: 'text' });
                  }
                }
                row.push(field);
                if ((i + 1) % 3 === 0 || ((i + 1) % 3 !== 0 && i === fields.length - 1)) {
                  data.widgetSettings.push(row);
                  row = [];
                }
              });
              if (this.widgetService.viewType === 'LineGraph' && data.widgetSettings[1][1].length === 0) {
                this.lineGraphDataRequired = true;
                this.cdr.detectChanges();
              } else {
                if (this.widgetService.currentDashboard?.id) {
                  this.editWidget(data);
                  this.overlayWidgetService.close();
                }
              }
            }
          }
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  editWidget(data) {
    this.apiService
      .editSingleWidget(this.widgetService.currentDashboard?.id, this.overlayData.data.id, {
        widgetSettings: data.widgetSettings,
      })
      .pipe(
        switchMap((response) => {
          return this.apiService.getWidgets(this.widgetService.currentDashboard?.id);
        }),
        tap((widgets: any[]) => {
          this.widgetService.webSocket.close();
          this.widgetService.webSocket = new WebSocket(this.env.backend.statisticsWs);
          this.widgetService.widgets = widgets.map((widget: any) => {
            return {
              id: widget._id,
              widgetSettings: widget.widgetSettings.reduce((accu: any, setting: any) => [...accu, ...setting]),
              viewType: widget.viewType,
              size: widget.size ?? this.widgetService.widgetSize.Large,
              edit: false,
            };
          });
        }),
      )
      .subscribe();
  }

  gatherDataFromField(field, currentForm) {
    if (currentForm.behaviorMetric) {
      field.push({ type: 'metric', value: currentForm.behaviorMetric });
    }
    if (currentForm.conversionMetric) {
      field.push({ type: 'metric', value: currentForm.conversionMetric });
    }
    if (currentForm.paymentStatus) {
      field.push({ type: 'metric', value: currentForm.paymentStatus });
    }

    let granularity: string;
    let dateTimeRelative: string;
    switch (currentForm.granularity) {
      case 'today':
        dateTimeRelative = 'today';
        granularity = 'day';
        break;
      case 'yesterday':
        dateTimeRelative = 'yesterday';
        granularity = 'day';
        break;
      case 'last month':
        dateTimeRelative = 'last month';
        granularity = 'month';
        break;
      case 'last week':
        granularity = 'week';
        dateTimeRelative = 'last week';
        break;
      case 'last year':
        granularity = 'year';
        dateTimeRelative = 'last year';
        break;
      case 'date_range':
        granularity = currentForm.dateRangeGranularity;
        break;
      default:
        granularity = currentForm.granularity;
        break;
    }
    if (granularity) {
      field.push({ type: 'granularity', value: granularity });
    }

    if (dateTimeRelative) {
      field.push({ type: 'dateTimeRelative', value: dateTimeRelative });
    }

    if (currentForm.dateTimeFrom) {
      const dateTimeFrom = moment(currentForm.dateTimeFrom, 'DD.MM.YYYY').toISOString();

      field.push({
        type: 'dateTimeFrom',
        value: dateTimeFrom,
      });
    }
    if (currentForm.dateTimeTo) {
      const dateTimeTo = moment(currentForm.dateTimeTo, 'DD.MM.YYYY').toISOString();

      field.push({
        type: 'dateTimeTo',
        value: dateTimeTo,
      });
    }
    if (currentForm.currency) {
      field.push({
        type: 'filter',
        value: {
          name: this.widgetService.dimensionTypes.currency,
          value: currentForm.currency,
        },
      });
    }
    if (currentForm.device) {
      field.push({
        type: 'filter',
        value: {
          name: this.widgetService.dimensionTypes.device,
          value: currentForm.device,
        },
      });
    }
    if (currentForm.browser) {
      field.push({
        type: 'filter',
        value: {
          name: this.widgetService.dimensionTypes.browser,
          value: currentForm.browser,
        },
      });
    }
    if (currentForm.channel) {
      let query = {
        type: 'filter',
        value: {
          name: this.widgetService.dimensionTypes.channel,
          value: currentForm.channel,
        },
      };

      if (currentForm.channel instanceof Array) {
        query = {
          type: 'filter',
          value: {
            name: this.widgetService.dimensionTypes.channel,
            operator: 'equals',
            values: currentForm.channel,
          },
        } as any;
      }

      field.push(query);
    }
    if (currentForm.paymentMethod) {
      let query = {
        type: 'filter',
        value: {
          name: this.widgetService.dimensionTypes.paymentMethod,
          value: currentForm.paymentMethod,
        },
      };

      if (currentForm.paymentMethod instanceof Array) {
        query = {
          type: 'filter',
          value: {
            name: this.widgetService.dimensionTypes.paymentMethod,
            operator: 'equals',
            values: currentForm.paymentMethod,
          },
        } as any;
      }

      field.push(query);
    }
    if (field.find(cell => cell.type === 'metric')) {
      field.push({
        type: 'filter',
        value: {
          name: this.widgetService.dimensionTypes.businessId,
          value: this.envService.businessId,
        },
      });
    }
    return { field, currentForm };
  }

  ngOnDestroy() {
    this.body.classList.remove(`wider-overlay`);
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  openFieldForm(number: number) {
    const onSaveSubject$ = new BehaviorSubject(null);
    const onResetSubject$ = new Subject<void>();
    const data = {
      fieldId: number,
      onReset: onResetSubject$,
    };
    const headerConfig = {
      onSaveSubject$,
      title: this.getControls()[number].value,
      backBtnTitle: this.translateService.translate('statistics.action.back'),
      backBtnCallback: () => {
        this.overlayWidgetService.close();
        this.cdr.detectChanges();
      },
      cancelBtnTitle: this.translateService.translate('statistics.action.reset'),
      cancelBtnCallback: () => {
        onResetSubject$.next();
        this.cdr.detectChanges();
      },
      doneBtnTitle: this.translateService.translate('statistics.action.add'),
      doneBtnCallback: () => {
        this.overlayWidgetService.close();
        this.cdr.detectChanges();
      },
      onSave$: onSaveSubject$.asObservable(),
      theme: this.theme,
    } as any;
    this.overlayWidgetService.open({
      data,
      headerConfig,
      component: PeFieldFormComponent,
    });
  }

  onRemove() {
    if (confirm('Are you really sure you want to delete this widget?')) {
      this.apiService
        .removeWidget(this.widgetService.currentDashboard?.id, this.overlayData.data.id)
        .pipe(
          tap(() => {
            this.widgetService.widgets = this.widgetService.widgets.filter(
              widget => widget.id !== this.overlayData.data.id,
            );

            this.overlayWidgetService.close();
          }),
        )
        .subscribe();
    }
  }
}
