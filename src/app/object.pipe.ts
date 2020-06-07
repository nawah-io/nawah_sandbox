import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'keys', pure: false })
export class KeysPipe implements PipeTransform {
  transform(value: any, args?: any[]): any[] {
    // // create instance vars to store keys and final output
    // let keyArr: any[] = Object.keys(value),
    //     dataArr = [];

    // // loop through the object,
    // // pushing values to the return array
    // keyArr.forEach((key: any) => {
    //     dataArr.push(value[key]);
    // });

    // // return the resulting array
    // return dataArr;
    return Object.keys(value);
  }
}

@Pipe({ name: 'values', pure: false })
export class ValuesPipe implements PipeTransform {
  transform(value: any, args?: any[]): Object[] {
    let keyArr: any[] = Object.keys(value),
      dataArr: any[] = [],
      keyName: string = (args && args[0]) ? args[0] : 'key',
      keyOrder: boolean = (args && args[1]) ? args[1] : false;

    keyArr.forEach((key: any) => {
      value[key][keyName] = key;
      dataArr.push(value[key])
    });

    if (keyOrder) {
      dataArr.sort((a: any, b: any): number =>
        a[keyName] > b[keyName] ? 1 : -1
      );
    }

    return dataArr;
  }
}