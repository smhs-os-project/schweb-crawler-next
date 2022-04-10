# SMHS 公告爬蟲

這是爬取 SMHS 目前最新公告的爬蟲。

這個爬蟲主打工程化設計——架構分明、設計模組化，方便您將爬蟲移植到任何環境。

## 使用

### 定期自動抓取的 API

大部分使用者應不需要自行爬取，可逕行前往 [SMHS 公告 API](https://api.schweb.pan93.com) 取得最近公告。

### 自行爬取

```bash
# 抓下爬蟲
git clone --recursive https://github.com/smhs-os-project/schweb-crawler-next

# 安裝依賴
pnpm i

# 編譯 TypeScript
pnpm build

# 執行
pnpm start:prod
```

## 開發

```bash
pnpm i
pnpm start:dev
```

### 更新 Schema

Schema [可從本處取得](https://github.com/smhs-os-project/schweb-crawler-jtd)。

```bash
pnpm build:schema
```

## 授權

GPL-3.0

## 作者

- pan93412 <pan93412@gmail.com>
