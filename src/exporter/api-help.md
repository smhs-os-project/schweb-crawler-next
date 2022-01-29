# SMHS 公告資料庫：API 對接說明

`api.schweb.pan93.com` 允許所有瀏覽器直接存取，所以您可以直接在瀏覽器中 `fetch` 這個網址。

    https://api.schweb.pan93.com/<api endpoint>

## API Endpoints

### GET `/index.json`

包含所有公告的簡要資訊。[JSON Schema 見此](./schemas/index.json)。

### GET `/available_category.json`

回傳所有公告分類。[JSON Schema 見此](./schemas/available_category.json)。

### GET `/announcements/<公告 ID>.json`

回傳某個公告的內容、附件等詳細資料。[JSON Schema 見此](./schemas/announcement.json)。
