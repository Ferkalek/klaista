import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { MainService } from '../../service/main.service';
import { IItem } from 'src/app/interfaces/list.interface';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent {
  list$: Observable<IItem[]> = this.service.list$.asObservable();

  constructor(private service: MainService) {}
}
