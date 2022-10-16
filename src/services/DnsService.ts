import net from "net";
import { scoped, registry, Lifecycle, inject } from "tsyringe";
import { DnsDataInterface } from "../interfaces/DnsDataInterface";
import FileService from "./FileService";

@scoped(Lifecycle.ResolutionScoped)
@registry([{ token: "DnsService", useClass: DnsService }])
export default class DnsService {
  constructor(@inject("FileService") private fileService: FileService) {}

  async start(): Promise<any> {
    this.createDns();
    await this.getIpAndPort("setapproval");
  }

  validateDnsData(data: DnsDataInterface): { valid: boolean } {
    if (!data.hostname || !data.ip || !data.method || !data.port) {
      return { valid: false };
    }

    return { valid: true };
  }

  async handleOnData(data: DnsDataInterface) {
    const { hostname, ip, method, port } = data;

    if (method === "SET") {
      await this.saveServer(`${hostname} ${ip} ${port}\r\n`);
    } else {
      await this.getIpAndPort(hostname);
    }
  }

  createConnection(connection: net.Socket) {
    console.log("client connected");

    connection.on("data", (data) => {
      const info: DnsDataInterface = JSON.parse(data.toString());

      const { valid } = this.validateDnsData(info);

      if (!valid) {
        console.log("Error data");
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

  createDns() {
    const dns = net.createServer((connection) => {
      this.createConnection(connection);
    });

    dns.listen(1234, function () {
      console.log("server is listening");
    });
  }

  async checkIfServerAlreadyExists(serverParams: string) {
    const hostname = serverParams.split(" ")[0];
    const existServer = await this.getIpAndPort(hostname);
    if (existServer) return true;
    return false;
  }

  async saveServer(serverParams: string) {
    const existServer = await this.checkIfServerAlreadyExists(serverParams);

    if (existServer) return;

    await this.fileService.writeFile("hosts.txt", serverParams);
  }

  async getIpAndPort(hostname: string) {
    const fileString = await this.fileService.getContentFromFile("hosts.txt");

    const lines = fileString.split("\r\n");

    const formattedLines = lines.map((line) => line.split(" "));

    const serverData = formattedLines.find((line) => line[0] === hostname);

    if (!serverData) return;

    return `${serverData[1]}:${serverData[2]}`;
  }
}
