import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit } from '@angular/core';

import { AppThemeEnum, EnvService } from '@pe/common';

import { AbstractWidgetDirective } from '../abstract.widget';
import { MOCK_DATA } from '../mock.data';

@Component({
  selector: 'peb-line-graph',
  templateUrl: './line-graph.component.html',
  styleUrls: ['./line-graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineGraphComponent extends AbstractWidgetDirective implements OnInit {
  @Input() view: number[] = [158, 130];
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  @HostBinding('class') class = `${this.theme}-widget`;

  constructor(private envService: EnvService) {
    super();
  }

  lineGraphData = null;
  legend = false;
  showLabels = true;
  animations = true;
  xAxis = false;
  yAxis = false;
  showYAxisLabel = true;
  showXAxisLabel = true;
  timeline = true;

  colorScheme = {
    domain: ['#00f67d'],
  };

  ngOnInit() {
    if (!this.config?.dataSource[1][1]) {
      this.lineGraphData = MOCK_DATA.LineGraph;
    }
  }
}
