# 七夕寄席 タイムキーパー

七夕祭で落語研究会が行う教室寄席とステージ企画を、スマートフォンで確認・進行管理するための運営用Webアプリです。予定データは静的ファイル、当日の共有状態はCloudflare Durable Object、端末内バックアップは `localStorage` に保存します。

## 開発環境

- Vite
- React
- TypeScript
- React Router (`HashRouter`)
- PWA manifest / Workbox Service Worker

## 運用モードと共同作業

画面は標準で閲覧モードです。管理者1名と運営担当者4名に個別発行した運営コードでログインした端末だけが、開始・終了・時間調整を操作できます。コード一覧はGit管理外の `.operator-codes.local.txt` にあります。進行中の枠は常に一つだけになるよう更新し、オフライン中は予定の閲覧のみ可能です。

未来の出演枠は事前にスキップでき、同じボタンから取消できます。終了後の枠も「記録を修正」から状態、実績開始時刻、実績終了時刻、メモ、持ち時間を修正できます。

同期APIは `worker/` にあります。全端末は2秒間隔で最新状態を取得し、書き込みは運営コードをAPI側でも検証します。更新番号が古い操作は拒否され、最新状態を取得してから再操作するため、別端末の編集を無言で上書きしません。同じ操作IDの再送も二重処理しません。

APIが設定されていない開発環境では端末内モードになります。端末内モードの状態は別端末へ同期されないため、本番では必ず `worker/README.md` の手順で同期APIをデプロイし、GitHub Actions secret `VITE_SYNC_API_URL` を設定してください。

通信切断時やAPI障害時は、最後に取得した予定を端末キャッシュから表示し、編集操作を無効化します。

## インストールと起動

```bash
npm install
npm run dev
```

表示されたローカルURLをブラウザで開きます。

## ビルド

```bash
npm run build
npm run preview
```

成果物は `dist/` に生成されます。

## GitHub Pagesへの公開

1. GitHubに `rakugo-timekeeper` リポジトリを作成します。
2. このプロジェクトをpushします。
3. Repository Settings > Pages > Build and deployment の Source を `GitHub Actions` にします。
4. `main` ブランチへpushします。
5. `.github/workflows/deploy.yml` がビルドし、`dist/` を自動公開します。

公開URLの想定は `https://<ユーザー名>.github.io/rakugo-timekeeper/` です。別のリポジトリ名にする場合は `vite.config.ts` の `base` を変更してください。ルーティングはGitHub Pagesで再読み込みしても404になりにくい `HashRouter` を使用しています。

## スケジュールデータの編集

予定は `src/data/schedule.ts` にまとめています。出演者を増やす場合は既存の教室寄席を複製し、重複しない `id`、日付、時刻、出演者名、演目名を変更してください。型定義は `src/types/schedule.ts` にあります。

ステージ中に教室寄席を休止する企画には、次を設定します。

```ts
stageBlocksClassroom: true
```

## 公式リンクの変更

`src/config/links.ts` のURLを本番URLに差し替えてください。空文字のSNSリンクは現在画面に表示していません。

## localStorageのリセット

操作モードでスケジュール画面末尾の「保存した進行状態をリセット」を押します。開発者ツールから削除する場合のキーは `tanabata-rakuken-runtime-v2` です。

## PWAとして使う

GitHub PagesでHTTPS公開したページをスマートフォンで一度開き、ブラウザの「ホーム画面に追加」を選びます。表示名は「七夕寄席」です。必要な画面資産は初回表示後に保存されるため、以降はオフラインでも予定表を閲覧できます。

## 今後の拡張案

- 本番の出演者・演目・会場データへの差し替え
- スキップ時に後続予定を自動で詰めるモード
- 実績時刻と進行履歴の書き出し
- 操作履歴の一覧と直前状態への復元
- オフラインキャッシュの更新通知と手動更新
- 公式アプリのディープリンク対応
