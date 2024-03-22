import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { IItem } from '../interfaces/list.interface';
import { StorageService } from './storage.service';
import { CURRENT_LIST } from '../constants/basic.constants';
import { getKey, getListId } from '../common/app-config';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root',
})
export class MainService {
  private currentList$ = new BehaviorSubject<IItem[]>([]);

  constructor(
    private storageService: StorageService,
    private socketService: SocketService
  ) {}

  key$ = new BehaviorSubject<string>(''); // it means owner
  listId$ = new BehaviorSubject<string>('');

  hasPartner$ = new BehaviorSubject<boolean>(false);

  lastSentList$ = new BehaviorSubject<string>('');

  isEditable$ = new BehaviorSubject<boolean>(false);
  addItemInvalid$ = new BehaviorSubject<boolean>(false);
  addItemValue$ = new BehaviorSubject<string>('');

  addItemInputFocused$ = new Subject<void>();
  resetForm$ = new Subject<void>();

  get list$(): BehaviorSubject<IItem[]> {
    return this.currentList$;
  }

  init(): void {
    const key = getKey();

    if (key) {
      this.key$.next(key);
      const list = this.storageService.get(CURRENT_LIST);

      if (list) {
        this.setList(JSON.parse(list), true);
      }
    } else {
      this.listId$.next(getListId());
    }
  }

  setList(list: IItem[], isInit = false): void {
    this.currentList$.next(list);
    if (!isInit) {
      this.storageService.set(CURRENT_LIST, JSON.stringify(list));
    }
  }

  addItem(item: IItem): void {
    const list = [item, ...this.currentList$.value];
    this.setList(list);
  }

  editItem(item: IItem): void {
    const list = [...this.currentList$.value];
    const index = list.findIndex((i) => i.id === item.id);

    list[index].text = item.text;
    this.setList(list);
  }

  changeStatus(item: IItem): void {
    const list = [...this.currentList$.value];
    const index = list.findIndex((i) => i.id === item.id);

    list.splice(index, 1);

    if (item.status) {
      list.push(item);
    } else {
      const firstDoneItemIndex = list.findIndex((i) => i.status);
      list.splice(firstDoneItemIndex, 0, item);
    }

    this.setList(list);
  }

  deleteItem(id: string): void {
    const list = [...this.currentList$.value];
    const index = list.findIndex((i) => i.id === id);
    list.splice(index, 1);

    this.setList(list);
  }

  sendListToPartner(): void {
    const list = this.list$.value.filter((i) => !i.status);

    if (list) {
      const listStr = JSON.stringify(list);

      this.lastSentList$.next(listStr);
      this.socketService.sendMessage('sentListToPartner', listStr);
    }
  }
}
