import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'money'})
export class MoneyPipe implements PipeTransform {
  transform(value: number, args: string[]): any {
    if (!value) return value;

    return  "$ " + value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1.");

  }
}