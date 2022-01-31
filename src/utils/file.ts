import path from "path";
import fsPromises from "fs/promises";
import fs from "fs";
import recursiveCopy from "recursive-copy";

/**
 * 假如檔案所在的資料夾不存在，則自動建立
 *
 * @param filePath 檔案路徑
 */
export async function createDirOfFile(filePath: string): Promise<void> {
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
        await fsPromises.mkdir(dir, { recursive: true });
    }
}

/**
 * 寫入檔案。假如資料夾不存在，則自動建立。
 * @param filePath 要寫入的檔案路徑。
 * @param content 檔案內容。
 */
export async function writeFile(
    filePath: string,
    content: Buffer | string
): Promise<void> {
    await createDirOfFile(filePath);
    await fsPromises.writeFile(filePath, content);
}

/**
 * 複製檔案。假如資料夾不存在，則自動建立。
 * @param src 來源位置。
 * @param dst 目標位置。
 */
export async function copyFile(src: string, dst: string): Promise<void> {
    await createDirOfFile(dst);
    await recursiveCopy(src, dst, {
        overwrite: true,
    });
}
