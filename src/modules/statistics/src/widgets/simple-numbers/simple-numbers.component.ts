import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';

import { AppThemeEnum, EnvService } from '@pe/common';

import { AbstractWidgetDirective } from '../abstract.widget';

@Component({
  selector: 'peb-simple-numbers',
  templateUrl: './simple-numbers.component.html',
  styleUrls: ['./simple-numbers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleNumbersComponent extends AbstractWidgetDirective {
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  @HostBinding('class') class = `${this.theme}-widget`;

  constructor(private envService: EnvService) {
    super();
  }
}
