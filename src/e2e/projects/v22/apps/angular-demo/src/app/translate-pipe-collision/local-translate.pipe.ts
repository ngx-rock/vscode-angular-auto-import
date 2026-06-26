import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'translate',
  standalone: true,
})
export class WorkspaceTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}
