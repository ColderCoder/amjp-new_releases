export interface Env {
  TELEGRAM_DRAIN: DurableObjectNamespace;
  SECTION_TITLE?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHANNEL_ID?: string;
  TELEGRAM_MAX_PUSH_PER_RUN?: string;
  TELEGRAM_SEND_INTERVAL_MS?: string;
  GITHUB_TOKEN?: string;
  GITHUB_OWNER?: string;
  GITHUB_REPO?: string;
  GITHUB_BRANCH?: string;
  GITHUB_AUTHOR_NAME?: string;
  GITHUB_AUTHOR_EMAIL?: string;
  GITHUB_DATA_PATH?: string;
  GITHUB_STATE_PATH?: string;
}

type AppleMusicArtwork = {
  url?: string;
};

type AppleMusicAlbum = {
  id: string;
  attributes?: {
    artistName?: string;
    artwork?: AppleMusicArtwork;
    contentRating?: string;
    editorialNotes?: {
      tagline?: string;
    };
    genreNames?: string[];
    isSingle?: boolean;
    name?: string;
    releaseDate?: string;
    trackCount?: number;
    url?: string;
  };
};

type AppleMusicRoom = {
  attributes?: {
    title?: string;
    lastModifiedDate?: string;
  };
  relationships?: {
    contents?: {
      data?: Array<{ id: string; type: string }>;
    };
  };
};

type AppleMusicRoomResponse = {
  resources?: {
    albums?: Record<string, AppleMusicAlbum>;
    rooms?: Record<string, AppleMusicRoom>;
  };
};

type AppleMusicDisplayText =
  | string
  | {
      stringForDisplay?: string;
    };

type AppleMusicEditorialElement = {
  id: string;
  type: string;
  attributes?: {
    editorialElementKind?: string;
    lastModifiedDate?: string;
    name?: string;
    resourceTypes?: string[];
    title?: AppleMusicDisplayText;
  };
  relationships?: {
    room?: {
      data?: Array<{ id: string; type: string; href?: string }>;
    };
  };
};

type AppleMusicGroupingResponse = {
  resources?: {
    "editorial-elements"?: Record<string, AppleMusicEditorialElement>;
  };
};

type RoomDiscovery = {
  roomId: string;
  roomUrl: string;
  discoverySource: string;
  discoveryUrl: string;
};

type AppleMusicItem = {
  id: string;
  title: string;
  artist: string;
  url: string;
  artwork: string | null;
  explicit: boolean;
  releaseDate: string | null;
  trackCount: number | null;
  kind: "album" | "single";
  genres: string[];
  tagline: string | null;
};

type CatalogPayload = {
  generatedAt: string;
  source: string;
  apiSource: string;
  storefront: string;
  roomId: string;
  roomDiscoverySource: string;
  roomDiscoveryUrl: string;
  sectionTitle: string;
  requestedSectionTitle: string;
  itemCount: number;
  items: AppleMusicItem[];
};

type RefreshCatalogOptions = {
  pushTelegram?: boolean;
  telegramLimit?: number;
};

type RefreshCatalogResult = {
  payload: CatalogPayload;
  github: GithubPublishResult;
  telegram: TelegramPushResult | null;
};

type TelegramPushResult = {
  enabled: boolean;
  channelId: string | null;
  recentMessageItemIds: number;
  candidateCount: number;
  sentCount: number;
  sentItemIds: string[];
  pendingCount: number;
  stateChanged: boolean;
  commitSha: string | null;
  skippedReason?: string;
  warning?: string;
};

type TelegramUpdate = {
  update_id: number;
  channel_post?: {
    chat?: {
      id?: number | string;
    };
    text?: string;
    caption?: string;
    entities?: TelegramMessageEntity[];
    caption_entities?: TelegramMessageEntity[];
  };
};

type TelegramMessageEntity = {
  type?: string;
  url?: string;
};

type TelegramSendMessageResult = {
  message_id: number;
};

type TelegramApiResponse<T> = {
  ok: boolean;
  result?: T;
  description?: string;
  parameters?: {
    retry_after?: number;
  };
};

type PublishedState = {
  version: 1;
  catalogItemLimit: number;
  contentHash: string;
  contentUpdatedAt: string;
  lastPublishedAt: string;
  channelId: string | null;
  knownItemIds: string[];
  sentTelegramItemIds: string[];
  pendingTelegramItemIds: string[];
};

type GithubSnapshot = {
  headSha: string;
  baseTreeSha: string;
  state: PublishedState | null;
};

type GithubPublishResult = {
  changed: boolean;
  contentHash: string;
  commitSha: string | null;
  dataPath: string;
  statePath: string;
  pendingTelegramItemIds: string[];
};

type GithubFileUpdate = {
  path: string;
  content: string;
};

type GithubRefResponse = {
  object: {
    sha: string;
  };
};

type GithubCommitResponse = {
  sha: string;
  tree: {
    sha: string;
  };
};

type GithubContentResponse = {
  content?: string;
  encoding?: string;
};

type GithubBlobResponse = {
  sha: string;
};

type GithubTreeResponse = {
  sha: string;
};

type TokenCache = {
  token: string;
  expiresAt: number;
};

const DEFAULT_GITHUB_BRANCH = "main";
const DEFAULT_GITHUB_DATA_PATH = "data/jp.json";
const DEFAULT_GITHUB_STATE_PATH = "data/amjp-state.json";
const DEFAULT_GITHUB_AUTHOR_NAME = "amjp-updater";
const DEFAULT_GITHUB_AUTHOR_EMAIL = "ColderCoder@users.noreply.github.com";
const DEFAULT_SECTION_TITLE = "New This Week";
const STOREFRONT = "jp";
const GROUPING_NAME = "music";
const NEW_PAGE_URL = `https://music.apple.com/${STOREFRONT}/new?l=en`;
const NEW_RELEASES_ENTRY_URL = `https://music.apple.com/${STOREFRONT}/browse/new-releases?l=en-US`;
const TOKEN_PAGE_URL = "https://music.apple.com/cn";
const TOKEN_CACHE_SKEW_MS = 60 * 60 * 1000;
const LEGACY_APPLE_MUSIC_ROOM_CONTENT_LIMIT = 100;
const APPLE_MUSIC_ROOM_CONTENT_LIMIT = 300;
const TELEGRAM_RECENT_UPDATE_LIMIT = 300;
const TELEGRAM_GET_UPDATES_PAGE_LIMIT = 100;
const DEFAULT_TELEGRAM_MAX_PUSH_PER_RUN = 20;
const DEFAULT_TELEGRAM_SEND_INTERVAL_MS = 3200;
const TELEGRAM_MAX_RETRY_AFTER_SECONDS = 30;
const TELEGRAM_MAX_RETRY_ATTEMPTS = 2;
const TELEGRAM_ITEM_MARKER_PREFIX = "AMJP:";
const FULL_REFRESH_CRON = "0 * * * *";
const TELEGRAM_DRAIN_OBJECT_NAME = "telegram-drain";
const TELEGRAM_DRAIN_ALARM_DELAY_MS = 5 * 60 * 1000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0 Safari/537.36";

let tokenCache: TokenCache | null = null;

export default {
  async scheduled(controller, env, ctx) {
    if (controller.cron === FULL_REFRESH_CRON) {
      ctx.waitUntil(refreshCatalogAndScheduleTelegramDrain(env));
      return;
    }

    ctx.waitUntil(refreshCatalogAndScheduleTelegramDrain(env));
  }
} satisfies ExportedHandler<Env>;

export class TelegramDrain implements DurableObject {
  constructor(private readonly state: DurableObjectState, private readonly env: Env) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname === "/schedule") {
      const scheduledAt = await this.scheduleNextDrain();
      return jsonResponse({ scheduledAt });
    }

    if (request.method === "POST" && url.pathname === "/clear") {
      await this.state.storage.deleteAlarm();
      return jsonResponse({ cleared: true });
    }

    return new Response("Not found", { status: 404 });
  }

  async alarm(): Promise<void> {
    try {
      const result = await drainTelegramUpdates(this.env);
      if (result && result.pendingCount > 0) {
        await this.scheduleNextDrain();
        return;
      }

      await this.state.storage.deleteAlarm();
    } catch (error) {
      await this.scheduleNextDrain();
      throw error;
    }
  }

  private async scheduleNextDrain(): Promise<string> {
    const nextAlarm = Date.now() + TELEGRAM_DRAIN_ALARM_DELAY_MS;
    const existingAlarm = await this.state.storage.getAlarm();
    if (!existingAlarm || existingAlarm > nextAlarm) {
      await this.state.storage.setAlarm(nextAlarm);
      return new Date(nextAlarm).toISOString();
    }

    return new Date(existingAlarm).toISOString();
  }
}

async function refreshCatalogAndScheduleTelegramDrain(env: Env): Promise<RefreshCatalogResult> {
  const result = await refreshCatalog(env, { pushTelegram: true });
  if (result.telegram?.enabled && result.telegram.pendingCount > 0) {
    await scheduleTelegramDrain(env);
  } else {
    await clearTelegramDrain(env);
  }

  return result;
}

async function refreshCatalog(env: Env, options: RefreshCatalogOptions = {}): Promise<RefreshCatalogResult> {
  const snapshot = await readGithubSnapshot(env);
  const payload = await fetchAppleMusicCatalog(
    env.SECTION_TITLE ?? DEFAULT_SECTION_TITLE
  );
  const published = await publishCatalog(env, snapshot, payload);

  const telegram = options.pushTelegram
    ? await pushTelegramUpdates(env, payload, published.state, options.telegramLimit)
    : null;

  return { payload, github: published.result, telegram };
}

async function scheduleTelegramDrain(env: Env): Promise<void> {
  await telegramDrainStub(env).fetch("https://telegram-drain.local/schedule", { method: "POST" });
}

async function clearTelegramDrain(env: Env): Promise<void> {
  await telegramDrainStub(env).fetch("https://telegram-drain.local/clear", { method: "POST" });
}

function telegramDrainStub(env: Env): DurableObjectStub {
  const id = env.TELEGRAM_DRAIN.idFromName(TELEGRAM_DRAIN_OBJECT_NAME);
  return env.TELEGRAM_DRAIN.get(id);
}

async function drainTelegramUpdates(env: Env): Promise<TelegramPushResult | null> {
  const snapshot = await readGithubSnapshot(env);
  if (!snapshot.state || snapshot.state.pendingTelegramItemIds.length === 0) {
    return null;
  }

  const payloadText = await readGithubTextFile(env, githubDataPath(env));
  const payload = payloadText ? parseCatalogPayload(payloadText) : null;
  if (!payload) {
    throw new Error(`GitHub data file is missing or invalid: ${githubDataPath(env)}`);
  }

  return pushTelegramUpdates(env, payload, snapshot.state);
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(`${JSON.stringify(body, null, 2)}\n`, {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

async function publishCatalog(
  env: Env,
  snapshot: GithubSnapshot,
  payload: CatalogPayload
): Promise<{ result: GithubPublishResult; state: PublishedState }> {
  const now = new Date().toISOString();
  const contentHash = await catalogContentHash(payload);
  const previousState = snapshot.state;
  const existingKnownIds = previousState?.knownItemIds ?? payload.items.map((item) => item.id);
  const existingSentIds = previousState?.sentTelegramItemIds ?? payload.items.map((item) => item.id);
  const existingPendingIds = previousState?.pendingTelegramItemIds ?? [];
  const contentChanged = !previousState || previousState.contentHash !== contentHash;
  const telegramCatalogItems = previousState
    ? payload.items.slice(0, previousState.catalogItemLimit)
    : payload.items;
  const newPendingIds = contentChanged && previousState
    ? telegramCatalogItems
        .slice()
        .reverse()
        .map((item) => item.id)
        .filter((id) => !existingKnownIds.includes(id) && !existingSentIds.includes(id) && !existingPendingIds.includes(id))
    : [];
  const state: PublishedState = {
    version: 1,
    catalogItemLimit: APPLE_MUSIC_ROOM_CONTENT_LIMIT,
    contentHash,
    contentUpdatedAt: contentChanged ? payload.generatedAt : previousState.contentUpdatedAt,
    lastPublishedAt: contentChanged ? now : previousState.lastPublishedAt,
    channelId: telegramChannelId(env),
    knownItemIds: compactItemIds([...existingKnownIds, ...payload.items.map((item) => item.id)]),
    sentTelegramItemIds: compactItemIds(existingSentIds),
    pendingTelegramItemIds: compactItemIds([...existingPendingIds, ...newPendingIds])
  };

  if (!contentChanged) {
    return {
      state,
      result: {
        changed: false,
        contentHash,
        commitSha: null,
        dataPath: githubDataPath(env),
        statePath: githubStatePath(env),
        pendingTelegramItemIds: state.pendingTelegramItemIds
      }
    };
  }

  const commit = await commitGithubFiles(env, snapshot, [
    {
      path: githubDataPath(env),
      content: `${JSON.stringify(payload, null, 2)}\n`
    },
    {
      path: githubStatePath(env),
      content: `${JSON.stringify(state, null, 2)}\n`
    }
  ], `update amjp releases: ${payload.generatedAt.slice(0, 10)}`);

  return {
    state,
    result: {
      changed: true,
      contentHash,
      commitSha: commit.commitSha,
      dataPath: githubDataPath(env),
      statePath: githubStatePath(env),
      pendingTelegramItemIds: state.pendingTelegramItemIds
    }
  };
}

async function pushTelegramUpdates(
  env: Env,
  payload: CatalogPayload,
  state: PublishedState,
  limitOverride?: number
): Promise<TelegramPushResult> {
  const channelId = telegramChannelId(env);
  if (!env.TELEGRAM_BOT_TOKEN || !channelId) {
    return {
      enabled: false,
      channelId,
      recentMessageItemIds: 0,
      candidateCount: 0,
      sentCount: 0,
      sentItemIds: [],
      pendingCount: state.pendingTelegramItemIds.length,
      stateChanged: false,
      commitSha: null,
      skippedReason: "missing Telegram bot token or channel id"
    };
  }

  const recent = await readRecentTelegramItemIds(env);
  const itemById = new Map(payload.items.map((item) => [item.id, item]));
  const recentItemIds = recent.itemIds;
  const pendingBefore = state.pendingTelegramItemIds;
  const pendingAfterRecent = pendingBefore.filter((id) => !recentItemIds.has(id));
  const candidateItems = pendingAfterRecent
    .map((id) => itemById.get(id))
    .filter((item): item is AppleMusicItem => Boolean(item));
  const missingItemIds = pendingAfterRecent.filter((id) => !itemById.has(id));
  const maxPush = limitOverride ?? parsePositiveInteger(env.TELEGRAM_MAX_PUSH_PER_RUN) ?? DEFAULT_TELEGRAM_MAX_PUSH_PER_RUN;
  const itemsToSend = candidateItems.slice(0, maxPush);
  const sendIntervalMs = parsePositiveInteger(env.TELEGRAM_SEND_INTERVAL_MS) ?? DEFAULT_TELEGRAM_SEND_INTERVAL_MS;
  const sentItemIds: string[] = [];
  let sendWarning: string | undefined;

  for (let index = 0; index < itemsToSend.length; index += 1) {
    try {
      await sendTelegramRelease(env, itemsToSend[index]);
      sentItemIds.push(itemsToSend[index].id);
      if (index < itemsToSend.length - 1) {
        await sleep(sendIntervalMs);
      }
    } catch (error) {
      sendWarning = error instanceof Error ? error.message : String(error);
      break;
    }
  }

  const sentSet = new Set([...Array.from(recentItemIds), ...sentItemIds]);
  const nextState: PublishedState = {
    ...state,
    channelId,
    sentTelegramItemIds: compactItemIds([...state.sentTelegramItemIds, ...Array.from(sentSet)]),
    pendingTelegramItemIds: pendingAfterRecent.filter((id) => itemById.has(id) && !sentSet.has(id))
  };
  const stateChanged = JSON.stringify(nextState) !== JSON.stringify(state);
  const commit = stateChanged
    ? await commitGithubFiles(env, await readGithubSnapshot(env), [
        {
          path: githubStatePath(env),
          content: `${JSON.stringify(nextState, null, 2)}\n`
        }
      ], `update amjp telegram state: ${new Date().toISOString().slice(0, 10)}`)
    : null;

  return {
    enabled: true,
    channelId,
    recentMessageItemIds: recentItemIds.size,
    candidateCount: candidateItems.length,
    sentCount: sentItemIds.length,
    sentItemIds,
    pendingCount: nextState.pendingTelegramItemIds.length,
    stateChanged,
    commitSha: commit?.commitSha ?? null,
    warning: [
      recent.warning,
      sendWarning,
      missingItemIds.length > 0 ? `dropped ${missingItemIds.length} pending ids missing from current JSON` : undefined
    ].filter(Boolean).join("; ") || undefined
  };
}

async function readRecentTelegramItemIds(env: Env): Promise<{ itemIds: Set<string>; warning?: string }> {
  try {
    const updates = await readRecentTelegramUpdates(env);
    const channelId = telegramChannelId(env);
    const itemIds = new Set<string>();

    for (const update of updates) {
      const post = update.channel_post;
      if (!post || String(post.chat?.id ?? "") !== channelId) {
        continue;
      }

      const entityUrls = [...(post.entities ?? []), ...(post.caption_entities ?? [])]
        .map((entity) => entity.url)
        .filter((url): url is string => typeof url === "string");
      for (const id of telegramItemIdsFromText(`${post.text ?? ""}\n${post.caption ?? ""}\n${entityUrls.join("\n")}`)) {
        itemIds.add(id);
      }
    }

    return { itemIds };
  } catch (error) {
    return {
      itemIds: new Set<string>(),
      warning: error instanceof Error ? error.message : String(error)
    };
  }
}

async function readRecentTelegramUpdates(env: Env): Promise<TelegramUpdate[]> {
  const updates: TelegramUpdate[] = [];
  let offset = -TELEGRAM_RECENT_UPDATE_LIMIT;

  while (updates.length < TELEGRAM_RECENT_UPDATE_LIMIT) {
    const limit = Math.min(TELEGRAM_GET_UPDATES_PAGE_LIMIT, TELEGRAM_RECENT_UPDATE_LIMIT - updates.length);
    const page = await telegramApi<TelegramUpdate[]>(env, "getUpdates", {
      offset,
      limit,
      allowed_updates: ["channel_post"]
    });
    updates.push(...page);

    if (page.length < limit) {
      break;
    }

    offset = Math.max(...page.map((update) => update.update_id)) + 1;
  }

  return updates;
}

async function sendTelegramRelease(env: Env, item: AppleMusicItem): Promise<number> {
  const result = await telegramApi<TelegramSendMessageResult>(env, "sendMessage", {
    chat_id: telegramChannelId(env),
    text: telegramMessage(item),
    parse_mode: "HTML",
    link_preview_options: {
      is_disabled: false,
      url: item.url
    }
  });

  return result.message_id;
}

async function telegramApi<T>(env: Env, method: string, body: unknown, attempt = 0): Promise<T> {
  if (!env.TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN is not set");
  }

  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const data = await telegramResponse<T>(response);

  if (response.status === 429 && typeof data.parameters?.retry_after === "number") {
    if (attempt >= TELEGRAM_MAX_RETRY_ATTEMPTS || data.parameters.retry_after > TELEGRAM_MAX_RETRY_AFTER_SECONDS) {
      throw new Error(`Telegram ${method} rate limited: retry after ${data.parameters.retry_after}s`);
    }

    await sleep((data.parameters.retry_after + 1) * 1000);
    return telegramApi<T>(env, method, body, attempt + 1);
  }

  if (!response.ok || !data.ok || data.result === undefined) {
    throw new Error(`Telegram ${method} failed: ${data.description ?? `${response.status} ${response.statusText}`}`);
  }

  return data.result;
}

async function telegramResponse<T>(response: Response): Promise<TelegramApiResponse<T>> {
  try {
    return (await response.json()) as TelegramApiResponse<T>;
  } catch {
    return {
      ok: false,
      description: `${response.status} ${response.statusText}`
    };
  }
}

function telegramMessage(item: AppleMusicItem): string {
  return [
    `<a href="${escapeHtmlAttribute(item.url)}">${escapeHtml(item.title)}</a>`,
    escapeHtml(item.releaseDate ?? "Unknown date")
  ].filter((line) => line.length > 0).join("\n");
}

function telegramItemIdsFromText(text: string): Set<string> {
  const itemIds = new Set<string>();
  for (const match of text.matchAll(new RegExp(`${TELEGRAM_ITEM_MARKER_PREFIX}(\\d+)`, "g"))) {
    itemIds.add(match[1]);
  }
  for (const match of text.matchAll(/music\.apple\.com\/[^/\s]+\/album\/[^\s?]+\/(\d+)/g)) {
    itemIds.add(match[1]);
  }
  return itemIds;
}

async function readGithubSnapshot(env: Env): Promise<GithubSnapshot> {
  const branch = githubBranch(env);
  const ref = await githubApi<GithubRefResponse>(env, `/git/ref/heads/${encodeURIComponent(branch)}`);
  const commit = await githubApi<GithubCommitResponse>(env, `/git/commits/${ref.object.sha}`);
  const stateText = await readGithubTextFile(env, githubStatePath(env));

  return {
    headSha: ref.object.sha,
    baseTreeSha: commit.tree.sha,
    state: stateText ? parsePublishedState(stateText) : null
  };
}

async function readGithubTextFile(env: Env, path: string): Promise<string | null> {
  const response = await githubFetch(env, `/contents/${path}?ref=${encodeURIComponent(githubBranch(env))}`);
  if (response.status === 404) {
    return null;
  }

  const data = await githubResponse<GithubContentResponse>(response);
  if (!data.content || data.encoding !== "base64") {
    return null;
  }

  return atob(data.content.replace(/\s+/g, ""));
}

async function commitGithubFiles(
  env: Env,
  snapshot: GithubSnapshot,
  files: GithubFileUpdate[],
  message: string
): Promise<{ commitSha: string; treeSha: string }> {
  const tree = [];

  for (const file of files) {
    const blob = await githubApi<GithubBlobResponse>(env, "/git/blobs", {
      method: "POST",
      body: JSON.stringify({
        content: file.content,
        encoding: "utf-8"
      })
    });
    tree.push({
      path: file.path,
      mode: "100644",
      type: "blob",
      sha: blob.sha
    });
  }

  const nextTree = await githubApi<GithubTreeResponse>(env, "/git/trees", {
    method: "POST",
    body: JSON.stringify({
      base_tree: snapshot.baseTreeSha,
      tree
    })
  });
  const now = new Date().toISOString();
  const author = {
    name: env.GITHUB_AUTHOR_NAME || DEFAULT_GITHUB_AUTHOR_NAME,
    email: env.GITHUB_AUTHOR_EMAIL || DEFAULT_GITHUB_AUTHOR_EMAIL,
    date: now
  };
  const commit = await githubApi<GithubCommitResponse>(env, "/git/commits", {
    method: "POST",
    body: JSON.stringify({
      message,
      tree: nextTree.sha,
      parents: [snapshot.headSha],
      author,
      committer: author
    })
  });

  await githubApi<unknown>(env, `/git/refs/heads/${encodeURIComponent(githubBranch(env))}`, {
    method: "PATCH",
    body: JSON.stringify({
      sha: commit.sha,
      force: false
    })
  });

  return {
    commitSha: commit.sha,
    treeSha: nextTree.sha
  };
}

async function githubApi<T>(env: Env, path: string, init: RequestInit = {}): Promise<T> {
  return githubResponse<T>(await githubFetch(env, path, init));
}

async function githubFetch(env: Env, path: string, init: RequestInit = {}): Promise<Response> {
  if (!env.GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN is not set");
  }
  if (!githubOwner(env) || !githubRepo(env)) {
    throw new Error("GITHUB_OWNER and GITHUB_REPO must be set");
  }

  return fetch(`https://api.github.com/repos/${githubOwner(env)}/${githubRepo(env)}${path}`, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "content-type": "application/json",
      "user-agent": "amjp-updater-worker",
      "x-github-api-version": "2022-11-28",
      ...init.headers
    }
  });
}

async function githubResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const data = text ? JSON.parse(text) as { message?: string } : {};

  if (!response.ok) {
    throw new Error(`GitHub API failed: ${response.status} ${response.statusText}${data.message ? `: ${data.message}` : ""}`);
  }

  return data as T;
}

function parsePublishedState(text: string): PublishedState | null {
  try {
    const state = JSON.parse(text) as PublishedState;
    if (state.version !== 1 || typeof state.contentHash !== "string") {
      return null;
    }

    return {
      version: 1,
      catalogItemLimit: Number.isInteger(state.catalogItemLimit) && state.catalogItemLimit > 0
        ? state.catalogItemLimit
        : LEGACY_APPLE_MUSIC_ROOM_CONTENT_LIMIT,
      contentHash: state.contentHash,
      contentUpdatedAt: state.contentUpdatedAt || "",
      lastPublishedAt: state.lastPublishedAt || "",
      channelId: state.channelId ?? null,
      knownItemIds: compactItemIds(state.knownItemIds ?? []),
      sentTelegramItemIds: compactItemIds(state.sentTelegramItemIds ?? []),
      pendingTelegramItemIds: compactItemIds(state.pendingTelegramItemIds ?? [])
    };
  } catch {
    return null;
  }
}

function parseCatalogPayload(text: string): CatalogPayload | null {
  try {
    const payload = JSON.parse(text) as CatalogPayload;
    if (typeof payload.generatedAt !== "string" || !Array.isArray(payload.items)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

async function catalogContentHash(payload: CatalogPayload): Promise<string> {
  return sha256Hex(JSON.stringify({
    roomId: payload.roomId,
    sectionTitle: payload.sectionTitle,
    itemCount: payload.itemCount,
    items: payload.items
  }));
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function compactItemIds(itemIds: string[]): string[] {
  const seen = new Set<string>();
  const compacted: string[] = [];

  for (let index = itemIds.length - 1; index >= 0; index -= 1) {
    const id = itemIds[index];
    if (!seen.has(id)) {
      seen.add(id);
      compacted.push(id);
    }
  }

  return compacted.reverse().slice(-500);
}

function telegramChannelId(env: Env): string | null {
  return env.TELEGRAM_CHANNEL_ID?.trim() || null;
}

function githubOwner(env: Env): string {
  return env.GITHUB_OWNER?.trim() || "";
}

function githubRepo(env: Env): string {
  return env.GITHUB_REPO?.trim() || "";
}

function githubBranch(env: Env): string {
  return env.GITHUB_BRANCH?.trim() || DEFAULT_GITHUB_BRANCH;
}

function githubDataPath(env: Env): string {
  return env.GITHUB_DATA_PATH?.trim() || DEFAULT_GITHUB_DATA_PATH;
}

function githubStatePath(env: Env): string {
  return env.GITHUB_STATE_PATH?.trim() || DEFAULT_GITHUB_STATE_PATH;
}

function parsePositiveInteger(value: string | null | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtmlAttribute(value: string): string {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

export async function fetchAppleMusicCatalog(
  requestedSectionTitle = DEFAULT_SECTION_TITLE
): Promise<CatalogPayload> {
  const developerToken = await getDeveloperToken();
  const roomDiscovery = await discoverLatestAlbumsRoom(developerToken, requestedSectionTitle);
  const apiSource = appleMusicRoomApiUrl(roomDiscovery.roomId);
  const response = await fetch(apiSource, {
    headers: appleMusicApiHeaders(developerToken)
  });

  if (!response.ok) {
    throw new Error(
      `Apple Music API failed for room ${roomDiscovery.roomId}: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as AppleMusicRoomResponse;
  const room = data.resources?.rooms?.[roomDiscovery.roomId];
  const albums = data.resources?.albums ?? {};
  const items = sortCatalogItemsByReleaseDate(room?.relationships?.contents?.data
    ?.filter((entry) => entry.type === "albums")
    .map((entry) => albums[entry.id])
    .filter((album): album is AppleMusicAlbum => Boolean(album))
    .map(toCatalogItem) ?? []);

  if (items.length === 0) {
    throw new Error(`No Apple Music albums returned for JP room ${roomDiscovery.roomId}`);
  }

  return {
    generatedAt: new Date().toISOString(),
    source: roomDiscovery.roomUrl,
    apiSource,
    storefront: STOREFRONT,
    roomId: roomDiscovery.roomId,
    roomDiscoverySource: roomDiscovery.discoverySource,
    roomDiscoveryUrl: roomDiscovery.discoveryUrl,
    sectionTitle: room?.attributes?.title || requestedSectionTitle,
    requestedSectionTitle,
    itemCount: items.length,
    items
  };
}

async function discoverLatestAlbumsRoom(developerToken: string, requestedSectionTitle: string): Promise<RoomDiscovery> {
  const errors: string[] = [];

  for (const discover of [
    () => discoverRoomFromGroupingApi(developerToken, requestedSectionTitle),
    () => discoverRoomFromNewPage(requestedSectionTitle),
    () => discoverRoomFromNewReleasesEntry(requestedSectionTitle)
  ]) {
    try {
      const room = await discover();
      if (room) {
        return room;
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  throw new Error(
    `Could not discover Apple Music ${STOREFRONT} room for "${requestedSectionTitle}"` +
      (errors.length ? `: ${errors.join("; ")}` : "")
  );
}

async function discoverRoomFromGroupingApi(
  developerToken: string,
  requestedSectionTitle: string
): Promise<RoomDiscovery | null> {
  const apiUrl = appleMusicGroupingApiUrl();
  const response = await fetch(apiUrl, {
    headers: appleMusicApiHeaders(developerToken)
  });

  if (!response.ok) {
    throw new Error(`Apple Music grouping API failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as AppleMusicGroupingResponse;
  const targetTitles = sectionTitleCandidates(requestedSectionTitle).map(normalizeHtmlText);
  const elements = Object.values(data.resources?.["editorial-elements"] ?? {});
  const element = elements.find((entry) => {
    const name = entry.attributes?.name ?? displayText(entry.attributes?.title);
    return targetTitles.includes(normalizeHtmlText(name ?? "")) && entry.attributes?.resourceTypes?.includes("albums");
  });

  if (!element) {
    return null;
  }

  const roomId = element.relationships?.room?.data?.[0]?.id ?? element.id;
  return {
    roomId,
    roomUrl: `https://music.apple.com/${STOREFRONT}/room/${roomId}?l=en-US`,
    discoverySource: "grouping-api",
    discoveryUrl: apiUrl
  };
}

async function discoverRoomFromNewReleasesEntry(requestedSectionTitle: string): Promise<RoomDiscovery | null> {
  if (!isNewReleasesEntrySection(requestedSectionTitle)) {
    return null;
  }

  const response = await fetch(NEW_RELEASES_ENTRY_URL, {
    redirect: "manual",
    headers: appleMusicPageHeaders()
  });

  const location = response.headers.get("location");
  const redirectedRoomId = roomIdFromUrl(location, NEW_RELEASES_ENTRY_URL);
  if (redirectedRoomId) {
    return {
      roomId: redirectedRoomId,
      roomUrl: absoluteUrl(location, NEW_RELEASES_ENTRY_URL),
      discoverySource: "new-releases-entry-redirect",
      discoveryUrl: NEW_RELEASES_ENTRY_URL
    };
  }

  const finalRoomId = roomIdFromUrl(response.url, NEW_RELEASES_ENTRY_URL);
  if (finalRoomId) {
    return {
      roomId: finalRoomId,
      roomUrl: absoluteUrl(response.url, NEW_RELEASES_ENTRY_URL),
      discoverySource: "new-releases-entry-final-url",
      discoveryUrl: NEW_RELEASES_ENTRY_URL
    };
  }

  return null;
}

async function discoverRoomFromNewPage(requestedSectionTitle: string): Promise<RoomDiscovery | null> {
  const html = await fetchText(NEW_PAGE_URL);
  const match = sectionTitleCandidates(requestedSectionTitle)
    .map((sectionTitle) => roomForSection(html, sectionTitle, NEW_PAGE_URL))
    .find((room): room is { roomId: string; roomUrl: string } => Boolean(room));

  if (!match) {
    return null;
  }

  return {
    roomId: match.roomId,
    roomUrl: match.roomUrl,
    discoverySource: "new-page-section",
    discoveryUrl: NEW_PAGE_URL
  };
}

async function getDeveloperToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }

  const shellHtml = await fetchText(TOKEN_PAGE_URL);
  const scriptSrc = shellHtml.match(/<script\b[^>]*type="module"[^>]*src="([^"]+)"/)?.[1];
  if (!scriptSrc) {
    throw new Error("Could not find Apple Music web bundle script");
  }

  const bundle = await fetchText(new URL(scriptSrc, TOKEN_PAGE_URL).toString());
  const tokens = Array.from(bundle.matchAll(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g), (match) => match[0]);
  const token = tokens.find(isAppleMusicWebToken);

  if (!token) {
    throw new Error("Could not find Apple Music developer token in web bundle");
  }

  tokenCache = {
    token,
    expiresAt: tokenExpiryMs(token) - TOKEN_CACHE_SKEW_MS
  };

  return token;
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: appleMusicPageHeaders()
  });

  if (!response.ok) {
    throw new Error(`Fetch failed for ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function appleMusicPageHeaders(): HeadersInit {
  return {
    "user-agent": USER_AGENT,
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "accept-language": "en-US,en;q=0.9,ja;q=0.8"
  };
}

function appleMusicApiHeaders(developerToken: string): HeadersInit {
  return {
    authorization: `Bearer ${developerToken}`,
    origin: "https://music.apple.com",
    "user-agent": USER_AGENT
  };
}

function toCatalogItem(album: AppleMusicAlbum): AppleMusicItem {
  const attributes = album.attributes ?? {};

  return {
    id: album.id,
    title: attributes.name || "Unknown Title",
    artist: attributes.artistName || "Unknown Artist",
    url: attributes.url || `https://music.apple.com/${STOREFRONT}/album/${album.id}`,
    artwork: artworkUrl(attributes.artwork),
    explicit: attributes.contentRating === "explicit",
    releaseDate: attributes.releaseDate ?? null,
    trackCount: attributes.trackCount ?? null,
    kind: attributes.isSingle ? "single" : "album",
    genres: attributes.genreNames ?? [],
    tagline: attributes.editorialNotes?.tagline ?? null
  };
}

function sortCatalogItemsByReleaseDate(items: AppleMusicItem[]): AppleMusicItem[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const dateCompare = releaseDateSortKey(right.item.releaseDate).localeCompare(
        releaseDateSortKey(left.item.releaseDate)
      );
      return dateCompare || left.index - right.index;
    })
    .map(({ item }) => item);
}

function releaseDateSortKey(value: string | null): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value ?? "") ? value ?? "" : "";
}

function artworkUrl(artwork?: AppleMusicArtwork): string | null {
  if (!artwork?.url) {
    return null;
  }

  return artwork.url
    .replace("{w}", "632")
    .replace("{h}", "632")
    .replace("{f}", "jpg");
}

function appleMusicRoomApiUrl(roomId: string): string {
  const url = new URL(`https://amp-api.music.apple.com/v1/editorial/${STOREFRONT}/rooms/${roomId}`);
  url.searchParams.set("l", "en-US");
  url.searchParams.set("art[url]", "f");
  url.searchParams.set("format[resources]", "map");
  url.searchParams.set("limit[contents]", String(APPLE_MUSIC_ROOM_CONTENT_LIMIT));
  url.searchParams.set("platform", "web");
  return url.toString();
}

function appleMusicGroupingApiUrl(): string {
  const url = new URL(`https://amp-api.music.apple.com/v1/editorial/${STOREFRONT}/groupings`);
  url.searchParams.set("name", GROUPING_NAME);
  url.searchParams.set("l", "en-US");
  url.searchParams.set("format[resources]", "map");
  url.searchParams.set("platform", "web");
  url.searchParams.set("tabs", "nonsubscriber");
  url.searchParams.set("omit[resource:artists]", "autos");
  url.searchParams.set("relate[songs]", "albums");
  url.searchParams.set("include[albums]", "artists");
  url.searchParams.set("include[songs]", "artists");
  url.searchParams.set("include[music-videos]", "artists");
  url.searchParams.set("include[stations]", "events,radio-show");
  url.searchParams.set("extend[station-events]", "editorialVideo");
  url.searchParams.set("fields[artists]", "name,url,artwork,editorialArtwork,genreNames,plainEditorialNotes");
  url.searchParams.set(
    "fields[albums]",
    "artistName,artistUrl,artwork,contentRating,editorialArtwork,plainEditorialNotes,name,playParams,releaseDate,url,trackCount"
  );
  url.searchParams.set("art[url]", "f");
  url.searchParams.append("extend", "editorialArtwork");
  url.searchParams.append("extend", "artistUrl");
  url.searchParams.append("extend", "plainEditorialNotes");
  return url.toString();
}

function roomForSection(html: string, sectionTitle: string, baseUrl: string): { roomId: string; roomUrl: string } | null {
  const targetTitle = normalizeHtmlText(sectionTitle);
  const sectionRegex =
    /<div\b[^>]*data-testid="section-container"[^>]*aria-label="([^"]+)"[\s\S]{0,1600}?href="([^"]*\/room\/(\d+)[^"]*)"/g;
  let match: RegExpExecArray | null;

  while ((match = sectionRegex.exec(html))) {
    if (normalizeHtmlText(match[1]) === targetTitle) {
      return {
        roomId: match[3],
        roomUrl: absoluteUrl(match[2], baseUrl)
      };
    }
  }

  const titleLinkRegex = /href="([^"]*\/room\/(\d+)[^"]*)"[\s\S]{0,500}?<span[^>]*>([^<]+)<\/span>/g;
  while ((match = titleLinkRegex.exec(html))) {
    if (normalizeHtmlText(match[3]) === targetTitle) {
      return {
        roomId: match[2],
        roomUrl: absoluteUrl(match[1], baseUrl)
      };
    }
  }

  return null;
}

function roomIdFromUrl(value: string | null, baseUrl: string): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(decodeHtmlEntities(value), baseUrl);
    const match = url.pathname.match(new RegExp(`^/${STOREFRONT}/room/(\\d+)`));
    return match?.[1] ?? null;
  } catch {
    return value.match(/\/room\/(\d+)/)?.[1] ?? null;
  }
}

function absoluteUrl(value: string | null, baseUrl: string): string {
  return new URL(decodeHtmlEntities(value ?? ""), baseUrl).toString();
}

function normalizeHtmlText(value: string): string {
  return decodeHtmlEntities(value).replace(/\s+/g, " ").trim().toLowerCase();
}

function displayText(value: AppleMusicDisplayText | undefined): string | undefined {
  return typeof value === "string" ? value : value?.stringForDisplay;
}

function sectionTitleCandidates(sectionTitle: string): string[] {
  const normalized = normalizeHtmlText(sectionTitle);
  if (normalized === "new releases") {
    return ["New Releases", "New This Week", "Recent Releases"];
  }

  return [sectionTitle];
}

function isNewReleasesEntrySection(sectionTitle: string): boolean {
  return ["new releases", "recent releases"].includes(normalizeHtmlText(sectionTitle));
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_match, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function isAppleMusicWebToken(token: string): boolean {
  const payload = decodeJwtPayload(token);
  return payload?.origin === "*.apple.com" || Array.isArray(payload?.root_https_origin);
}

function tokenExpiryMs(token: string): number {
  const payload = decodeJwtPayload(token);
  const exp = typeof payload?.exp === "number" ? payload.exp : 0;
  return exp > 0 ? exp * 1000 : Date.now() + 60 * 60 * 1000;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const encodedPayload = token.split(".")[1];
    const normalized = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}
