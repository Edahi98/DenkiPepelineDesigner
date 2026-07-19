import net from 'net';

export interface ServiceConfig {
  port: number;
  host: string;
}

export interface BackendPorts {
  tsubasa: ServiceConfig;
}

function getAvailablePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, '127.0.0.1', () => {
      const port = (server.address() as net.AddressInfo).port;
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });
}

export async function resolvePorts(): Promise<BackendPorts> {
  const tsubasaPort = await getAvailablePort();
  const host = '127.0.0.1';

  return {
    tsubasa: { port: tsubasaPort, host },
  };
}
