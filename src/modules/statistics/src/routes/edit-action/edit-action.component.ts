import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { isSelectableItem } from '@pe/common';

import { PeStatisticsItem, PeStatisticsSingleSelectedAction } from '../../interfaces/statistics.interface';

@Component({
  selector: 'peb-edit-action',
  templateUrl: './edit-action.component.html',
  styleUrls: ['./edit-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditActionComponent implements OnInit {


  @Input() item: PeStatisticsItem;
  @Input() actions: PeStatisticsSingleSelectedAction[];

  constructor() { }

  ngOnInit(): void {
  }

  onAction(event: MouseEvent, action: PeStatisticsSingleSelectedAction) {
    event.stopPropagation();
    event.preventDefault();
    if (action.callback) {
      isSelectableItem(this.item) ? action.callback(this.item.id) : action.callback();
    }

    action.callback();
  }

}
