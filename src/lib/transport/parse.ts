import { Transport } from './model';
import { axiosTransport } from './axios';
import { fetchTransport } from './fetch';

export function getTransport(
  transport?: 'axios' | 'fetch' | Transport
): Transport {
  return typeof transport === 'function'
    ? transport
    : transport === 'axios'
    ? axiosTransport()
    : fetchTransport();
}
