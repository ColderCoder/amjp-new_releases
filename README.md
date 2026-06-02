# AMJP Worker

Cloudflare Worker cron job for the AMJP release page.

The Worker fetches the current Apple Music Japan "New This Week" room, writes the static site data to GitHub, and sends new releases to a Telegram channel. It has no public HTTP routes.

## Runtime Flow

- `0 * * * *`: full refresh.
  - Discover the current Apple Music Japan room.
  - Fetch album metadata through the Apple Music web API.
  - Compute a stable content hash.
  - Commit `data/jp.json` and `data/amjp-state.json` to the configured GitHub Pages branch only when content changes.
  - Send up to `TELEGRAM_MAX_PUSH_PER_RUN` pending Telegram messages.
- Durable Object alarm: Telegram drain.
  - Scheduled only when the full refresh leaves `pendingTelegramItemIds` non-empty.
  - Reads existing GitHub JSON/state only.
  - Sends the next small batch.
  - If more pending messages remain, schedules itself again five minutes later.

This avoids long sleeps inside one cron invocation and avoids fixed polling when there is no Telegram backlog. If a large Apple Music update produces more than the per-run Telegram limit, the remaining messages are drained by one-shot alarms every five minutes.

## GitHub State

The Worker writes two files:

- `data/jp.json`: public catalog data consumed by the static page.
- `data/amjp-state.json`: operational state with the stable content hash, catalog item limit, known item IDs, Telegram sent IDs, and Telegram pending IDs.

The content hash excludes `generatedAt`, so hourly runs do not create commits unless the release content changes.

When the catalog item limit increases, releases newly exposed below the previous limit are added to the known IDs without creating historical Telegram notifications.

## Telegram Behavior

Telegram messages are sent oldest first from the pending queue.

Each message contains:

1. Release title as an Apple Music link.
2. Release date.

The Worker reads up to 300 recent channel updates in three Telegram Bot API pages before sending, then removes already-seen release IDs from pending. It sends at most `TELEGRAM_MAX_PUSH_PER_RUN` messages per cron invocation and waits `TELEGRAM_SEND_INTERVAL_MS` between messages.

Rate limiting is handled conservatively:

- Short Telegram `retry_after` responses are retried in place.
- Long or repeated rate limits stop the current batch.
- Already-sent messages are written back to GitHub state before the next drain run resumes the queue.

## Required Secrets

Set these with Wrangler secrets:

```sh
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put TELEGRAM_BOT_TOKEN
```

`GITHUB_TOKEN` needs permission to read and write contents in the target GitHub repository.

`TELEGRAM_BOT_TOKEN` must belong to a bot that can post to the configured channel and can read channel updates.

There is intentionally no refresh token or manual refresh endpoint.

## Configuration

Configured in `wrangler.toml`:

- `workers_dev = false`
- `preview_urls = false`
- `TELEGRAM_DRAIN`: Durable Object binding used for one-shot drain alarms.
- `SECTION_TITLE`: Apple Music section title to resolve.
- `TELEGRAM_CHANNEL_ID`: target Telegram channel.
- `TELEGRAM_MAX_PUSH_PER_RUN`: maximum Telegram messages per cron invocation.
- `TELEGRAM_SEND_INTERVAL_MS`: delay between Telegram sends.
- `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`: GitHub Pages target.
- `GITHUB_DATA_PATH`, `GITHUB_STATE_PATH`: output paths in the target branch.

## Local Checks

```sh
npm install
npm run typecheck
npx wrangler deploy --dry-run
```

## Deploy

```sh
npm run deploy
```

After deployment, confirm:

- Worker URL is disabled.
- Preview URLs are disabled.
- Handlers list only `scheduled`.
- Secrets list only `GITHUB_TOKEN` and `TELEGRAM_BOT_TOKEN`.

## Notes

The legacy `amjp.py` scraper is not part of this Worker path. The Worker uses Apple Music's web token and JSON endpoints instead of parsing the album grid from rendered HTML.
