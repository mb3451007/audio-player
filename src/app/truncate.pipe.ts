import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {

  transform(value: string, limit: number=0): string {
    if(!value){
      return '';
    }
    return value.length>limit?value.substring(0,limit) + '...' :value;
    // return value.length>limit?value.substring(0,10)+ '...' :value;
  }

}
