import axios from 'axios';
import type { BackendPorts } from '../config';

export function createApiClient(ports: BackendPorts) {
  return {
    tsubasa: axios.create({ baseURL: `http://127.0.0.1:${ports.tsubasa.port}` }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
