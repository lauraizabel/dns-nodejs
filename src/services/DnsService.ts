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

  private handleOnData(data: DnsDataInterface): void {
    const { address, serviceName, method, port } = data;

    if (method === "SET") {
      this.saveServer(data);
    } else {
      this.getIpAndPort(data.serviceName);
    }
  }

  private createConnection(connection: net.Socket): void {
    console.log("client connected");

    connection.on("data", (data) => {
      const info: DnsDataInterface = JSON.parse(data.toString());

      const isValid = this.validateDnsData(info);

      if (!isValid) {
        console.log("Error when try to validate data");
        connection.write("ERROR DATA");
        return;
      }

      this.handleOnData(info);
    });

    connection.on("end", function () {
      console.log("client disconnected");
    });

    connection.pipe(connection);
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
