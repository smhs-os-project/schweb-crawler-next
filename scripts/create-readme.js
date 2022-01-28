const buf = [
    "# SMHS Announcement",
    "",
    "用來取得三民高中公告的離線公開 API。學校停電也可以使用 :)",
    "",
    "## 公告一覽",
    "",
];
const readme = require("./output/index.json");

for (const [category, announcements] of Object.entries(readme)) {
    buf.push(`### ${category}\n`);
    buf.push(
        ...announcements.map(
            ({ id, date, title }) => `- ${id}: ${title} (_${date}_)`
        )
    );
    buf.push("");
}

require("fs").writeFileSync("./output/README.md", buf.join("\n"));
