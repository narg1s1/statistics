import { ChangeDetectionStrategy, Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'peb-statistics-field',
  templateUrl: './statistics-field.component.html',
  styleUrls: ['./statistics-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StatisticsFieldComponent),
      multi: true,
    },
  ],
})
export class StatisticsFieldComponent implements ControlValueAccessor {
  @Input() title = 'Field';
  @Input() id: number;
  @Input() optionsSelected: any;
  @Input() readonly = false;
  @Input() errorMessage: string;
  formGroup = new FormGroup({
    fieldValue: new FormControl(),
  });
  @Input() openFieldFunc: (id: number) => void;

  private onTouched = () => {};

  private onChange: (value: string) => void = () => {};

  registerOnChange(onChange: (value: string) => void) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void) {
    this.onTouched = onTouched;
  }

  writeValue(value: number) {
    this.formGroup.get('fieldValue').patchValue(value ? value : this.title);
  }

  onValueChanged(event: any) {
    this.onChange(event.target.value);
    this.onTouched();
  }
}
