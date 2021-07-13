import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'peb-add-widget',
  templateUrl: './add-widget.component.html',
  styleUrls: ['./add-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddWidgetComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
