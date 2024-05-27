import { Pipe, PipeTransform } from '@angular/core';
import { Tag, TagGroup } from '../models/tag.model';
import { ConfigService } from '../services/config.service';

@Pipe({
  name: 'controlLabel',
  standalone: true
})
export class ControlLabelPipe implements PipeTransform {
  private tags: Tag[] = [];
  private tagGroups: TagGroup[] = [];

  constructor(private configService: ConfigService) {
    this.tags = this.configService.tags;
    this.tagGroups = this.configService.tagGroups;
  }

  transform(value: string): string {
    const tag: Tag | undefined = this.tags.find((tag: Tag) => tag.id === value.replaceAll('_', '.'));
    if (tag) return tag.name;
    const tagGroup: TagGroup | undefined = this.tagGroups.find((group: TagGroup) => group.id === value);
    if (tagGroup) return tagGroup.name;
    return value;
  }
}