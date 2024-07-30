import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateKey'
})
export class TruncateKeyPipe implements PipeTransform {

  transform(value: string, limit: number = 0): string {
    if (!value) {
      return '';
    }

    const startIndex = 14;
    
    // If length is smaller than 20, don't remove the first 14 digits
    if (value.length <= 20) {
      return value.length > limit ? value.substring(0, limit) + '...' : value;
    }

    // Remove first 14 digits and then truncate
    const truncatedValue = value.substring(startIndex);
    return truncatedValue.length > limit ? truncatedValue.substring(0, limit) + '...' : truncatedValue;
  }
}
