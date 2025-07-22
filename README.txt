【くまお先生Bot復元パック（GoFile対応・2024年7月17日版）】

▼アップロード方法（Railway推奨）
1. https://railway.app にアクセスしてログイン
2. 新しいプロジェクトを作成 → ZIPをアップロード
3. `.env`に以下を設定
   - CHANNEL_SECRET=
   - CHANNEL_ACCESS_TOKEN=
   - OPENAI_API_KEY=
4. 公開URLをLINE BotのWebhookに登録

▼注意
・CloudinaryではなくGoFile方式で構築されています。
・package.jsonの"main"はindex.jsになっており、すでに本番向け構成です。
