import fs from "fs";
import { scoped, registry, Lifecycle } from "tsyringe";

@scoped(Lifecycle.ResolutionScoped)
@registry([{ token: "FileService", useClass: FileService }])
export default class FileService {
  async writeFile(fileName: string, content: string) {
    await fs.appendFileSync(fileName, content);
  }

  async getContentFromFile(fileName: string) {
    const buffer = await fs.readFileSync(fileName);
    const fileContent = buffer.toString();
    return fileContent;
  }
}
