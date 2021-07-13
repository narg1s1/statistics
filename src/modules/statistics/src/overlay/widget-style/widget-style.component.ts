import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { TranslateService } from '@pe/i18n-core';
import { PE_OVERLAY_CONFIG } from '@pe/overlay-widget';

import { PeWidgetService } from '../../infrastructure';
import { MOCK_DATA } from '../../widgets/mock.data';

@Component({
  selector: 'peb-widget-style',
  templateUrl: './widget-style.component.html',
  styleUrls: ['./widget-style.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetStyleComponent implements OnInit {
  body: HTMLElement = document.body;
  widgets = [
    {
      viewType: this.widgetService.widgetType.DetailedNumbers,
      size: this.widgetService.widgetSize.Small,
      dataSource: MOCK_DATA['widgetStyle'],
    },
    {
      viewType: this.widgetService.widgetType.TwoColumns,
      size: this.widgetService.widgetSize.Small,
    },
    {
      viewType: this.widgetService.widgetType.Percentage,
      size: this.widgetService.widgetSize.Small,
    },
    {
      viewType: this.widgetService.widgetType.SimpleNumbers,
      size: this.widgetService.widgetSize.Small,
    },
    {
      viewType: this.widgetService.widgetType.LineGraph,
      size: this.widgetService.widgetSize.Small,
    },
  ];

  constructor(
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any,
    private widgetService: PeWidgetService,
    private translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.overlayConfig.title = this.translateService.translate('statistics.overlay_titles.widget_style');
    this.body.classList.add(`wider-overlay`);
  }

  onWidgetStyleSelect(viewType): void {
    this.widgetService.viewType = viewType;
    this.overlayConfig.onSaveSubject$.next(true);
  }
}
