import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MainService } from './service/main.service';
import { SocketService } from './service/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  constructor(
    private service: MainService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.socketService
      .getMessage('listFromOwner')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((list: string) => {
        this.service.setList([
          ...JSON.parse(list),
          ...this.service.list$.value.filter((i) => i.status),
        ]);
      });

    this.socketService
      .getMessage('userConnected')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        if (this.service.key$.value) {
          this.service.hasPartner$.next(true);

          this.service.sendListToPartner();
        }
      });

    this.socketService
      .getMessage('disconnect')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => (document.location.href = '/'));

    this.socketService
      .getMessage('onlyOwnerInRoom')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.service.hasPartner$.next(false));

    this.service.init();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
  }
}
