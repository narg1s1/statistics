import { Pipe, PipeTransform } from '@angular/core';
import { ucfirst } from '../../infrastructure';

@Pipe({
  name: 'selectedOptions',
})
export class SelectedOptionsPipe implements PipeTransform {
  constructor() {}

  transform(options: any) {
    if (!options) {
      return '';
    }
    let optionsText = '';
    Object.keys(options).forEach((element) => {
      if (options[element] === null) {
        return;
      }
      if (options[element] instanceof Array) {
        let arrayText = `${ucfirst(element)}:`;
        options[element].forEach((item, index) => {
          if (index === 0) {
            arrayText = arrayText + ` ${ucfirst(item)}`;
            return;
          }
          arrayText = arrayText + `, ${ucfirst(item)}`;
        });
        optionsText = `${optionsText}, ${arrayText}`;
        return;
      }
      optionsText = optionsText + ucfirst(element) + `: ${options[element]}`;
    });
    return `(${optionsText})`;
  }
}
