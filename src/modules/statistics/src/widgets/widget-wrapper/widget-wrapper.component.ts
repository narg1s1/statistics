import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';
import { AppThemeEnum, EnvService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PeAuthService } from '@pe/auth';

import { ActualPeStatisticsApi, PeWidgetService, ucfirst } from '../../infrastructure';
import { PeStatisticsEditFormComponent } from '../../overlay/edit-form/edit-statistics-form.component';
import { sizeOptions } from '../../overlay/form/statistics-form.component';
import { MOCK_DATA } from '../mock.data';

@Component({
  selector: 'peb-widget-wrapper',
  templateUrl: './widget-wrapper.component.html',
  styleUrls: ['./widget-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetWrapperComponent implements OnInit, OnDestroy {
  @Input() config: any = {};
  @Input() useDefaultDataSource = false;
  @Input() showEditBtn = false;

  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  editOverlayRef: PeOverlayRef;

  @HostBinding('class.clickable') @Input() isClickable = false;
  @HostBinding('class') class = `${this.theme}-widget`;

  editMode = false;
  protected readonly destroyed$: any = new Subject();
  constructor(
    protected cdr: ChangeDetectorRef,
    protected apiService: ActualPeStatisticsApi,
    protected widgetService: PeWidgetService,
    private overlayWidgetService: PeOverlayWidgetService,
    private envService: EnvService,
    private translateService: TranslateService,
    private authTokenService: PeAuthService,
  ) {}

  onEditMode = () => {
    const onSaveSubject$ = new BehaviorSubject(null);
    const data = {
      data: this.config,
    };
    const headerConfig = {
      onSaveSubject$,
      title: this.translateService.translate('statistics.overlay_titles.edit_widget'),
      backBtnTitle: this.translateService.translate('statistics.action.cancel'),
      backBtnCallback: () => {
        onSaveSubject$.next(false);
        this.editOverlayRef.close();
      },
      doneBtnTitle: this.translateService.translate('statistics.action.done'),
      doneBtnCallback: () => {
        onSaveSubject$.next(true);
        this.editOverlayRef.close();
      },
      onSave$: onSaveSubject$.asObservable(),
      theme: this.theme,
      removeContentPadding: true,
    } as any;
    this.editOverlayRef = this.overlayWidgetService.open({
      data,
      headerConfig,
      component: PeStatisticsEditFormComponent,
    });
  }

  onRemove() {
    if (confirm(this.translateService.translate('statistics.confirm_dialog.delete_widget'))) {
      this.apiService
        .removeWidget(this.widgetService.currentDashboard?.id, this.config.id)
        .pipe(
          tap(() => {
            this.widgetService.widgets = this.widgetService.widgets.filter(widget => widget.id !== this.config.id);
          }),
        )
        .subscribe();
    }
  }

  ngOnInit(): void {
    if (this.widgetService.webSocket) {
      this.widgetService.webSocket.addEventListener('open', (open) => {
        this.widgetService.webSocket.send(
          JSON.stringify({
            event: 'get-data',
            data: {
              widgetId: this.config.id,
              token: this.authTokenService.token,
            },
          }),
        );
      });
      this.widgetService.webSocket.addEventListener('message', (response: { data: string }) => {
        const dataRaw = JSON.parse(response.data);
        if (this.config.id === dataRaw.widgetId) {
          if (dataRaw.data) {
            const newDataSource = dataRaw.data.map((settings, index) => {
              const newSettings = settings.map((setting) => {
                if (typeof setting === 'string') {
                  if (setting.includes('%')) {
                    return {
                      value: Number(setting.replace('%', '')),
                      text: undefined,
                      currency: undefined,
                      percent: '%',
                    };
                  }
                  let newCurrencySetting = null;
                  ['USD', 'EUR', 'DKK', 'SE', 'NOK'].forEach((currency) => {
                    if (setting.includes(currency)) {
                      newCurrencySetting = {
                        currency,
                        value: Number(setting.replace(currency, '').trim()),
                        text: undefined,
                        percent: undefined,
                      };
                    }
                  });
                  if (newCurrencySetting !== null) {
                    return newCurrencySetting;
                  }
                  return {
                    value: undefined,
                    text: setting,
                    percent: undefined,
                    currency: undefined,
                  };
                }
                if (typeof setting === 'number') {
                  return {
                    value: setting,
                    text: undefined,
                    currency: undefined,
                    percent: undefined,
                  };
                }
                if (setting instanceof Array) {
                  return {
                    value: setting,
                    text: undefined,
                    currency: undefined,
                    percent: undefined,
                  };
                }
              });
              return newSettings;
            });
            this.config.dataSource = newDataSource;
            this.cdr.detectChanges();
            return;
          }
        }
      });
      this.widgetService.webSocket.addEventListener('error', (err: any) => {
        console.log('error', err);
      });
    }
    if (this.useDefaultDataSource) {
      this.config.dataSource = MOCK_DATA[this.config.viewType];
      this.config.dataSource[0][0] = ucfirst(this.widgetService.selectedApp);
      this.cdr.detectChanges();
    }
  }

  getGraphView(size) {
    return sizeOptions.find(sizeOption => sizeOption.size === size)?.graphView;
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
