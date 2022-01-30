/**
 * 一個匯出工具 (Exporter) 應有的各項方法
 */
export interface Exporter {
    /**
     * 執行匯出任務
     *
     * @param dataDir 資料目錄
     */
    export: (dataDir: string) => Promise<void>;
}
