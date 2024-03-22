import { SocketIoConfig } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';

let socketIoConfig: SocketIoConfig = { url: environment.baseUrl };
let listId: string = '';
let key: string = '';

export const setConfig = (data: Partial<SocketIoConfig>) => {
  socketIoConfig = { ...socketIoConfig, ...data };
};

export const getConfig = () => {
  return socketIoConfig;
};

export const getListId = (): string => listId;
export const setListId = (id: string): void => {
  listId = id;
};

export const getKey = (): string => key;
export const setKey = (dataKey: string): void => {
  key = dataKey;
};
