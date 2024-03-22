import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

type IconType =
  | 'close'
  | 'menu'
  | 'save'
  | 'delete'
  | 'edit'
  | 'plus'
  | 'copy'
  | 'share'
  | 'reload';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  @Input() type: IconType;
}
