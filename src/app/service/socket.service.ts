import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  constructor(private socket: Socket) {}

  sendMessage(action: string, msg: string): void {
    this.socket.emit(action, msg);
  }

  getMessage(msg: string): Observable<never | string> {
    return this.socket.fromEvent(msg);
  }
}
