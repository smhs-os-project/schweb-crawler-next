# SMHS 公告資料庫：API 對接說明

GitHub 的 `raw.githubusercontent.com` 允許所有瀏覽器直接存取，所以您可以直接在瀏覽器中 `fetch` 這個網址。

    https://raw.githubusercontent.com/smhs-os-project/smhs-announcements/<api endpoint>

## API Endpoints

### GET `/index.json`

包含所有公告的簡要資訊。

#### 回傳範例

TODO

### GET `/available_category.json`

回傳所有公告分類。

#### 回傳範例

TODO

### GET `/announcements/<公告 ID>.json`

回傳某個公告的內容、附件等詳細資料。

#### 回傳範例

TODO
