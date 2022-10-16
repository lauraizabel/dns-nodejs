export interface DnsDataInterface {
  method: "SET" | "GET";
  hostname: string;
  ip: string;
  port: number;
}
