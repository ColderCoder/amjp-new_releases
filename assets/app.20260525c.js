const DEFAULT_DATA_URL = "./data/jp.json";
const params = new URLSearchParams(window.location.search);
const dataUrl = params.get("data") || DEFAULT_DATA_URL;
const EAGER_ARTWORK_COUNT = 6;
const artworkSizesByView = {
  grid: "(max-width: 720px) calc((100vw - 50px) / 2), 220px",
  list: "(max-width: 720px) 88px, 104px"
};
const releaseDateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "2-digit",
  timeZone: "UTC"
});
const searchSites = [
  {
    name: "Google",
    icon: "assets/icons/google.ico",
    url: (q) => `https://www.google.com/search?q=${q}`
  },
  {
    name: "Redacted",
    icon: "assets/icons/redacted.png",
    url: (q) => `https://redacted.sh/torrents.php?searchstr=${q}`
  },
  {
    name: "Orpheus",
    icon: "assets/icons/orpheus.ico",
    url: (q) => `https://orpheus.network/torrents.php?searchstr=${q}`
  },
  {
    name: "DicMusic",
    icon: "assets/icons/dicmusic.ico",
    url: (q) => `https://dicmusic.com/torrents.php?searchstr=${q}`
  }
];

const state = {
  payload: null,
  query: "",
  view: localStorage.getItem("amjp:view") || "grid",
  renderFrame: 0
};

const elements = {
  brandLink: document.querySelector("#brand-link"),
  filter: document.querySelector("#filter"),
  jsonLink: document.querySelector("#json-link"),
  releases: document.querySelector("#releases"),
  status: document.querySelector("#status"),
  template: document.querySelector("#release-template"),
  themeToggle: document.querySelector("#theme-toggle"),
  viewToggle: document.querySelector("#view-toggle")
};

initTheme();
initView();
bindEvents();
loadCatalog();

function bindEvents() {
  elements.filter.addEventListener("input", (event) => {
    state.query = event.target.value.trim().toLowerCase();
    scheduleRender();
  });

  elements.viewToggle.addEventListener("click", () => {
    state.view = state.view === "grid" ? "list" : "grid";
    localStorage.setItem("amjp:view", state.view);
    initView();
  });

  elements.themeToggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("amjp:theme", nextTheme);
  });
}

async function loadCatalog() {
  if (!dataUrl) {
    showStatus("Set the release data URL.", "error");
    return;
  }

  showStatus("Loading releases.", "loading");

  try {
    const response = await fetch(dataUrl);
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    state.payload = await response.json();
    hideStatus();
    render();
  } catch (error) {
    showStatus(`Could not load ${dataUrl}: ${error.message}`, "error");
  }
}

function render() {
  const payload = state.payload;
  if (!payload) {
    return;
  }

  const items = Array.isArray(payload.items) ? payload.items : [];
  const filteredItems = filterItems(items);

  elements.brandLink.href = payload.source || "https://music.apple.com/jp/new?l=en";
  elements.jsonLink.href = dataUrl;
  renderItems(filteredItems);
}

function filterItems(items) {
  if (!state.query) {
    return items;
  }

  return items.filter((item) => {
    return `${item.title} ${item.artist}`.toLowerCase().includes(state.query);
  });
}

function renderItems(items) {
  const fragment = document.createDocumentFragment();

  for (const [index, item] of items.entries()) {
    const node = elements.template.content.firstElementChild.cloneNode(true);
    const title = node.querySelector(".release-title");
    const artist = node.querySelector(".release-artist");
    const releaseDate = node.querySelector(".release-date");
    const artworkLink = node.querySelector(".artwork-link");
    const artwork = node.querySelector(".artwork");
    const placeholder = node.querySelector(".artwork-placeholder");
    const actions = node.querySelector(".release-actions");

    title.href = item.url;
    title.textContent = item.explicit ? `${item.title} [E]` : item.title;
    artist.textContent = item.artist;
    renderReleaseDate(releaseDate, item.releaseDate);
    artworkLink.href = item.url;
    artwork.alt = `${item.title} cover`;

    if (index < EAGER_ARTWORK_COUNT) {
      artwork.loading = "eager";
      artwork.fetchPriority = "high";
    }

    if (item.artwork) {
      artwork.src = artworkUrlForSize(item.artwork, 316);
      artwork.srcset = [160, 316, 632]
        .map((size) => `${artworkUrlForSize(item.artwork, size)} ${size}w`)
        .join(", ");
      artwork.sizes = artworkSizes();
      placeholder.hidden = true;
    } else {
      artwork.hidden = true;
    }

    for (const action of searchActions(item)) {
      const link = document.createElement("a");
      link.className = "search-action";
      link.href = action.url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.title = action.name;
      link.setAttribute("aria-label", action.name);

      const image = document.createElement("img");
      image.src = action.icon;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      link.append(image);
      actions.append(link);
    }

    fragment.append(node);
  }

  elements.releases.replaceChildren(fragment);
}

function renderReleaseDate(element, value) {
  if (!value) {
    element.hidden = true;
    element.textContent = "";
    element.removeAttribute("datetime");
    return;
  }

  const date = new Date(`${value}T00:00:00Z`);
  element.dateTime = value;
  element.textContent = releaseDateFormatter.format(date);
}

function searchActions(item) {
  const q = encodeURIComponent(`${item.artist} ${item.title}`);
  return searchSites.map((site) => ({
    name: site.name,
    icon: site.icon,
    url: site.url(q)
  }));
}

function scheduleRender() {
  if (state.renderFrame) {
    cancelAnimationFrame(state.renderFrame);
  }

  state.renderFrame = requestAnimationFrame(() => {
    state.renderFrame = 0;
    render();
  });
}

function artworkUrlForSize(url, size) {
  return url.replace(/\/\d+x\d+([^/?]*)(\.[a-z0-9]+)(\?.*)?$/i, `/${size}x${size}$1$2$3`);
}

function artworkSizes() {
  return artworkSizesByView[state.view] || artworkSizesByView.grid;
}

function updateArtworkSizes() {
  for (const image of document.querySelectorAll(".artwork")) {
    image.sizes = artworkSizes();
  }
}

function showStatus(message, tone) {
  elements.status.hidden = false;
  elements.status.dataset.tone = tone;
  elements.status.textContent = message;
}

function hideStatus() {
  elements.status.hidden = true;
  elements.status.textContent = "";
  elements.status.removeAttribute("data-tone");
}

function initTheme() {
  const saved = localStorage.getItem("amjp:theme");
  const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  document.documentElement.dataset.theme = saved || preferred;
}

function initView() {
  document.documentElement.dataset.view = state.view;
  elements.viewToggle.setAttribute("aria-pressed", String(state.view === "list"));
  updateArtworkSizes();
}
