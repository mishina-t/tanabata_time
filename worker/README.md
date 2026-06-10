# 同期API

Cloudflare Durable Objectsを使い、複数端末の進行状態を一つに保つ小さなAPIです。書き込みは運営コードをサーバー側で検証し、更新番号が古い操作は `409` で拒否します。

## 設定

1. `worker/wrangler.jsonc` の `ALLOWED_ORIGIN` をGitHub Pagesのオリジンへ変更します。
2. `.operator-codes.local.txt` のコードに対応するSHA-256ハッシュと表示名をJSONにします。
3. 次の形式でCloudflare secret `OPERATOR_HASHES` を登録します。

```json
{
  "<管理者コードのSHA-256>": "管理者",
  "<運営2コードのSHA-256>": "運営2"
}
```

```bash
npx wrangler secret put OPERATOR_HASHES --config worker/wrangler.jsonc
npx wrangler deploy --config worker/wrangler.jsonc
```

デプロイ後のURLをGitHub Actions secret `VITE_SYNC_API_URL` に登録します。
