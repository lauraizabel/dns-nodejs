export default interface DnsServiceInterface {
  initDns: () => void;
  getIpAndPort: (serviceName: string) => string | undefined;
}
