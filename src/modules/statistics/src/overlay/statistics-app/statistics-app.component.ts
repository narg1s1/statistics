import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';

import { AppThemeEnum, EnvironmentConfigInterface, EnvService, PE_ENV } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PE_OVERLAY_CONFIG } from '@pe/overlay-widget';

import { ActualPeStatisticsApi, PeWidgetService } from '../../infrastructure';

export interface App {
  id: string;
  name: string;
  url: string;
}

@Component({
  selector: 'peb-statistics-app',
  templateUrl: './statistics-app.component.html',
  styleUrls: ['./statistics-app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsAppComponent implements OnInit {
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  body: HTMLElement = document.body;
  apps: App[] = [];
  constructor(
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private widgetService: PeWidgetService,
    private apiService: ActualPeStatisticsApi,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService,
    private envService: EnvService,
  ) {
    this.overlayConfig.title = this.translateService.translate('statistics.overlay_titles.add_widget');
  }

  ngOnInit() {
    this.body.classList.remove(`wider-overlay`);
    this.apiService.getDashboardsById(this.widgetService.currentDashboard?.id).subscribe((dashboard: any) => {
      const installedApps = dashboard?.business?.installedApps.filter((element, index) => {
        if (
          [
            'checkout-wrapper',
            'theme',
            'builder',
            'pos-client',
            'shop-header',
            'santander-de-fact',
            'builder-translate',
            'commerceos',
            'settings',
            'coupons',
            'connect',
            'marketing',
            'statistics',
          ].includes(element.code)
        ) {
          return false;
        } else {
          if (element.installed) {
            return true;
          }
          return false;
        }
      });

      installedApps.forEach((element) => {
        this.apps.push({
          id: element.code,
          name: this.translateService.translate(`statistics.widget_apps.${element.code}`),
          url: `${this.env.custom.cdn}/icons-png/icon-statistic-${element.code}.png`,
        });
      });
      this.cdr.detectChanges();
    });
  }

  onAppClick(app: App) {
    this.widgetService.selectedApp = app;
    this.overlayConfig.onSaveSubject$.next(true);
  }
}
