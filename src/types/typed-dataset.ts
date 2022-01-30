import type { Dataset } from "apify";

export type TypedDatasetConsumer<T> = (item: T, index: number) => void;

/**
 * 有正確標注類型（而非 `object`）的 Dataset
 *
 * 尚未標完所有的類型。若有需要可自行標註。
 *
 * @template T Dataset 內元素的類型。
 * @see Dataset
 */
export type TypedDataset<T> = {
    /** @see Dataset.pushData */
    pushData: (data: T | T[]) => Promise<void>;

    /** @see Dataset.forEach */
    forEach: (
        iteratee: TypedDatasetConsumer<T>,
        options?:
            | {
                  desc?: boolean | undefined;
                  fields?: string[] | undefined;
                  unwind?: string | undefined;
              }
            | undefined,
        index?: number | undefined
    ) => Promise<void>;
} & Dataset;
