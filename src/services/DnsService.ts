import net from "net";
import DnsServiceInterface from "../interfaces/DnsServiceInterface";
import { DnsDataInterface } from "../interfaces/DnsDataInterface";

export default class DnsService implements DnsServiceInterface {
  private connections: DnsDataInterface[] = [];

  public initDns(): void {
    const dns = net.createServer((connection) => {
      this.createConnection(connection);
    });

    dns.listen(1234, function () {
      console.log("server is listening");
    });
  }

  public getIpAndPort(serviceName: string): string | undefined {
    const server = this.connections.find(
      (connection) => connection.serviceName === serviceName
    );
    if (!server) {
      return;
    }
    return `${server.address}:${server.port}`;
  }

  private validateDnsData(data: DnsDataInterface): boolean {
    if (!data.address || !data.serviceName || !data.method || !data.port) {
      return false;
    }

    return true;
  }

  private handleOnData(data: DnsDataInterface): any {
    const { method } = data;
    if (method === "SET") {
      this.saveServer(data);
    } else {
      return this.getIpAndPort(data.serviceName);
    }
  }

  // Faltam implementar essas duas funcoes
  private handleSetData(data: DnsDataInterface) {}
  private handleGetData(data: DnsDataInterface) {}

  private createConnection(connection: net.Socket): any {
    console.log("client connected");

    connection.on("data", (data) => {
      console.log("DATA: ",JSON.parse(data.toString()))
      const info: DnsDataInterface = JSON.parse(data.toString());
      if (info?.method === "SET") {
        const isValid = this.validateDnsData(info);
        if (!isValid) {
          console.log("Error when try to validate data");
          connection.write("ERROR DATA");
          return;
        }
      }
      const { remoteAddress, remotePort } = connection;
      // esses dois so nao vao existir se a conexao for encerrada ou destruida
      if (remoteAddress && remotePort) {
        const data = this.handleOnData({
          ...info,
          remoteAddress: remoteAddress,
          remotePort,
        });
        if (data) {
          console.log(data)
          connection.write(
            'HTTP/1.0 200 OK\r\n' +
            '\r\n'
        );
          connection.write(data.toString())
        };
      }
    });

    connection.on("end", () => {
      console.log("client disconnected");
      const { remoteAddress, remotePort } = connection;
      // esses dois so nao vao existir se a conexao for encerrada ou destruida
      if (remoteAddress && remotePort) {
        this.removeServer(remoteAddress, remotePort);
      }
    });
    connection.on("error", () => {
      console.log("client disconnected");
      const { remoteAddress, remotePort } = connection;
      // esses dois so nao vao existir se a conexao for encerrada ou destruida
      if (remoteAddress && remotePort) {
        this.removeServer(remoteAddress, remotePort);
      }
    });

    connection.pipe(connection);
  }

  private removeServer(remoteAddress: string, remotePort: number) {
    const indexToRemove = this.connections.findIndex(
      (connection) =>
        connection.remotePort === remotePort &&
        connection.remoteAddress === remoteAddress
    );

    if (indexToRemove > -1) {
      // funcao slice retorna um novo array, nao modifica o anterior
      // por isso essa nova atribuicao
      const newArr = this.connections.slice(indexToRemove, 1);
      this.connections = newArr;
    } else {
      console.log("nothing to remove");
    }
  }

  private checkIfServerAlreadyExists(address: string, port: number): boolean {
    const server = this.connections.find(
      (connection) => connection.address === address && connection.port === port
    );

    return Boolean(server);
  }

  private saveServer(data: DnsDataInterface): void {
    const existServer = this.checkIfServerAlreadyExists(
      data.address,
      data.port
    );

    if (existServer) return;

    this.connections.push(data);
  }
}
