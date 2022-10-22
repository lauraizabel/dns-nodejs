export interface DnsDataInterface {
  method: "SET" | "GET";
  serviceName: string;
  address: string;
  port: number;
  // Atributos para remover do DNS depois.
  remotePort: number;
  remoteAddress: string;
}
