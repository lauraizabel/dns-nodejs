import "reflect-metadata";
import DnsService from "./services/DnsService";
import FileService from "./services/FileService";

const fileService = new FileService();

const app = new DnsService(fileService);

export default app.start();
