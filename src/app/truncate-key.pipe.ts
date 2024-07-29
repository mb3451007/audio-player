import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateKey'
})
export class TruncateKeyPipe implements PipeTransform {

  transform(value: string, limit: number=0): string {
    if(!value){
      return '';
    }
    const startIndex=14;
    const truncatedValue=value.substring(startIndex)
    return truncatedValue.length>limit? truncatedValue.substring(0,limit) + '...' : truncatedValue
    // return value.length>limit?value.substring(0,limit) + '...' :value;
  
  }
}
