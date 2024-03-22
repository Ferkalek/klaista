import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { BehaviorSubject, Subject, combineLatest, map, takeUntil } from 'rxjs';
import { MainService } from '../../service/main.service';
import { IItem } from '../../interfaces/list.interface';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent implements OnInit, OnDestroy {
  isOwner$ = this.service.key$.pipe(map((v) => !!v));
  isShowReloadBtn$ = this.service.hasPartner$;
  isDisabledReloadBtn$ = new BehaviorSubject<boolean>(true);
  isEditable$ = this.service.isEditable$;
  addItemInvalid$ = this.service.addItemInvalid$;
  isShowMessage$ = new BehaviorSubject<boolean>(false);
  message$ = new BehaviorSubject<string>('');

  private unsubscribe$ = new Subject<void>();

  constructor(private service: MainService) {}

  ngOnInit(): void {
    combineLatest([this.service.list$, this.service.lastSentList$])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(([list, lastSentList]) =>
        this.isDisabledReloadBtn$.next(
          lastSentList === JSON.stringify(list.filter((i) => !i.status))
        )
      );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
  }

  resendList(): void {
    this.service.sendListToPartner();
    this.isDisabledReloadBtn$.next(true);
  }

  onCopyList(): void {
    const list = this.service.list$.value;
    const text = list
      .reduce((acc: string[], i: IItem) => {
        if (!i.status) {
          acc.push(`${i.text};`);
        }
        return acc;
      }, [])
      .join('\n');

    navigator.clipboard.writeText(text).then(() => this.showMessage('Copied'));
  }

  onCopyLink(): void {
    const listId = this.service.key$.value;

    navigator.clipboard
      .writeText(`${document.location.origin}?listId=${listId}`)
      .then(() => this.showMessage('Copied'));
  }

  onAddItem(): void {
    const isEditable = !this.isEditable$.value;
    this.service.isEditable$.next(isEditable);

    if (isEditable) {
      this.service.addItemInputFocused$.next();
    } else {
      this.addItem();
    }
  }

  onClose(): void {
    this.isShowMessage$.next(false);
    setTimeout(() => this.message$.next(''), 500);
  }

  private showMessage(msg: string): void {
    this.message$.next(msg);
    this.isShowMessage$.next(true);

    setTimeout(() => this.onClose(), 3000);
  }

  private addItem(): void {
    if (this.service.addItemInvalid$.value) {
      return;
    }

    this.service.addItem({
      id: Date.now().toString(),
      text: this.service.addItemValue$.value,
      status: false,
    });

    this.service.resetForm$.next();
  }
}
