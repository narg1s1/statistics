import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';

import { AppThemeEnum, EnvService } from '@pe/common';

import { AbstractWidgetDirective } from '../abstract.widget';

@Component({
  selector: 'peb-detailed-numbers',
  templateUrl: './detailed-numbers.component.html',
  styleUrls: ['./detailed-numbers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailedNumbersComponent extends AbstractWidgetDirective {
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  @HostBinding('class') class = `${this.theme}-widget`;

  constructor(private envService: EnvService) {
    super();
  }
  getRowsNumber() {
    return ['small', 'medium'].includes(this.config.size) || !this.config.size ? 4 : 8;
  }

  checkIfEmpty(row: any[]) {
    return row.filter((cell: string | number) => cell === null).length === 3;
  }
}
