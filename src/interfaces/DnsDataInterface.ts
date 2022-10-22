export interface DnsDataInterface {
  method: "SET" | "GET";
  serviceName: string;
  address: string;
  port: number;
}
