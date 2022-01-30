import type { ExporterAbstract } from "./exporter.abstract";

/**
 * 統合資料結構匯出器的類別。
 */
export class Exporters {
    constructor(private readonly exporters: ExporterAbstract[]) {}

    /**
     * 呼叫已經註冊的匯出器以匯出資料結構。
     *
     * @param dataDir 資料結構的匯出目的資料目錄。
     */
    public async export(dataDir: string): Promise<void> {
        await Promise.all(
            this.exporters.map((exporter) => exporter.export(dataDir))
        );
    }
}
