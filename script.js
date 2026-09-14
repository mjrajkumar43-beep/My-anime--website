const API = "/api";

let currentAnime = null;
let currentSeason = 1;
let currentEpisode = 1;

/* ---------- Helpers ---------- */

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getTitle(item) {
    return (
        item?.title ||
        item?.name ||
        item?.animeTitle ||
        item?.seriesTitle ||
        "Unknown Anime"
    );
}

function getId(item) {
    return item?.id || item?.animeId || item?._id || item?.slug || "";
}

function getImage(item) {
    return (
        item?.image ||
        item?.poster ||
        item?.posterImage ||
        item?.thumbnail ||
        item?.cover ||
        ""
    );
}

/* ---------- Card ---------- */

function createCard(item, type = "series") {
    const title = getTitle(item);
    const id = getId(item);
    const image = getImage(item);

    return `
        <article class="card" data-title="${escapeHTML(title.toLowerCase())}"
                 onclick="openAnime('${encodeURIComponent(id)}')">

            <div class="poster">
                ${
                    image
                        ? `<img src="${escapeHTML(image)}"
                               alt="${escapeHTML(title)}"
                               loading="lazy">`
                        : `<div class="poster-placeholder">
                               ${escapeHTML(title)}
                           </div>`
                }
            </div>

            <div class="body">
                <h3>${escapeHTML(title)}</h3>
                <small>${type === "movie" ? "Movie" : "Series"}</small>
            </div>
        </article>
    `;
}

/* ---------- Home ---------- */

async function loadHome() {
    try {
        const response = await fetch(`${API}/home`);
        const data = await response.json();

        const source =
            data?.results ||
            data?.data ||
            data?.result ||
            data;

        const series =
            source?.series ||
            source?.anime ||
            source?.recent ||
            [];

        const movies =
            source?.movies ||
            [];

        const seriesGrid = document.getElementById("sg");
        const movieGrid = document.getElementById("mg");
        const topGrid = document.getElementById("tg");

        if (seriesGrid) {
            seriesGrid.innerHTML = Array.isArray(series)
                ? series.map(x => createCard(x, "series")).join("")
                : "";
        }

        if (movieGrid) {
            movieGrid.innerHTML = Array.isArray(movies)
                ? movies.map(x => createCard(x, "movie")).join("")
                : "";
        }

        if (topGrid) {
            topGrid.innerHTML = Array.isArray(series)
                ? series.slice(0, 10)
                    .map(x => createCard(x, "series"))
                    .join("")
                : "";
        }

    } catch (error) {
        console.error("Home API error:", error);
    }
}

/* ---------- Search ---------- */

async function searchAnime(query) {
    query = query.trim();

    if (!query) {
        loadHome();
        return;
    }

    try {
        const response = await fetch(
            `${API}/search?s=${encodeURIComponent(query)}&page=1`
        );

        const data = await response.json();

        const results =
            data?.results?.results ||
            data?.results ||
            data?.data ||
            [];

        const seriesGrid = document.getElementById("sg");

        if (!seriesGrid) return;

        if (!Array.isArray(results) || results.length === 0) {
            seriesGrid.innerHTML =
                `<p class="muted">Anime नहीं मिला।</p>`;
            return;
        }

        seriesGrid.innerHTML =
            results.map(x => createCard(x, "series")).join("");

    } catch (error) {
        console.error("Search error:", error);
    }
}

/* ---------- Anime Info ---------- */

async function openAnime(encodedId) {
    const id = decodeURIComponent(encodedId);

    if (!id) return;

    try {
        const response = await fetch(
            `${API}/info?id=${encodeURIComponent(id)}`
        );

        const data = await response.json();

        currentAnime = data?.result || data?.data || data;

        showAnimeInfo(currentAnime, id);

    } catch (error) {
        console.error("Anime info error:", error);
        alert("Anime information load नहीं हो सकी।");
    }
}

/* ---------- Anime Details ---------- */

function showAnimeInfo(info, id) {
    const title = getTitle(info);

    const modal = document.getElementById("modal");
    const titleElement = document.getElementById("wt");

    if (titleElement) {
        titleElement.textContent = title;
    }

    if (modal) {
        modal.classList.add("show");
    }

    loadEpisodes(id, 1);
}

/* ---------- Episodes ---------- */

async function loadEpisodes(id, season = 1) {
    currentSeason = season;

    try {
        const response = await fetch(
            `${API}/episodes?id=${encodeURIComponent(id)}&season=${season}`
        );

        const data = await response.json();

        const episodes =
            data?.results ||
            data?.episodes ||
            data?.data ||
            data;

        renderEpisodes(episodes, id);

    } catch (error) {
        console.error("Episode error:", error);
    }
}

/* ---------- Episode Buttons ---------- */

function renderEpisodes(episodes, id) {
    let container = document.getElementById("episodes");

    if (!container) {
        container = document.createElement("div");
        container.id = "episodes";
        container.className = "episodes";

        const box = document.querySelector(".box");

        if (box) {
            box.appendChild(container);
        }
    }

    if (!Array.isArray(episodes)) {
        container.innerHTML =
            `<p class="muted">Episodes उपलब्ध नहीं हैं।</p>`;
        return;
    }

    container.innerHTML = episodes.map((ep, index) => {

        const number =
            ep?.episode ||
            ep?.episodeNumber ||
            ep?.number ||
            index + 1;

        return `
            <button class="episode-btn"
                    onclick="loadEpisode(
                        '${encodeURIComponent(id)}',
                        ${currentSeason},
                        ${Number(number)}
                    )">
                Episode ${escapeHTML(number)}
            </button>
        `;

    }).join("");
}

/* ---------- Video / Stream ---------- */

async function loadEpisode(encodedId, season = 1, episode = 1) {
    const id = decodeURIComponent(encodedId);

    currentAnime = id;
    currentSeason = season;
    currentEpisode = episode;

    try {
        const response = await fetch(
            `${API}/stream?id=${encodeURIComponent(id)}&season=${season}&ep=${episode}`
        );

        const data = await response.json();

        showPlayer(data);

    } catch (error) {
        console.error("Stream error:", error);
        alert("इस episode का authorized stream उपलब्ध नहीं है।");
    }
}

/* ---------- Player ---------- */

function showPlayer(data) {
    const player =
        document.querySelector(".player") ||
        document.getElementById("player");

    if (!player) return;

    const streams =
        data?.streams ||
        data?.servers ||
        data?.results ||
        data?.data ||
        [];

    let list = [];

    if (Array.isArray(streams)) {
        list = streams;
    } else if (typeof streams === "object") {
        list = Object.entries(streams).map(([name, url]) => ({
            name,
            url
        }));
    }

    const directUrl =
        data?.url ||
        data?.videoUrl ||
        data?.streamUrl ||
        data?.embedUrl ||
        data?.iframe;

    if (directUrl) {
        list.unshift({
            name: "Default",
            url: directUrl
        });
    }

    if (!list.length) {
        player.innerHTML =
            `<div class="player-message">
                इस episode के लिए कोई playable stream नहीं मिला।
             </div>`;
        return;
    }

    const first = list[0];

    player.innerHTML = `
        <iframe
            id="videoFrame"
            src="${escapeHTML(first.url)}"
            allowfullscreen
            loading="lazy">
        </iframe>
    `;

    const serverBox = document.querySelector(".servers");

    if (serverBox) {
        serverBox.innerHTML = list.map((server, index) => `
            <button onclick="changeServer(${index})">
                ${escapeHTML(server.name || `Server ${index + 1}`)}
            </button>
        `).join("");

        window.currentStreams = list;
    }
}

/* ---------- Change Server ---------- */

function changeServer(index) {
    const streams = window.currentStreams || [];
    const stream = streams[index];

    if (!stream?.url) return;

    const frame = document.getElementById("videoFrame");

    if (frame) {
        frame.src = stream.url;
    }
}

/* ---------- Previous / Next ---------- */

function previousEpisode() {
    if (currentEpisode <= 1) return;

    loadEpisode(
        encodeURIComponent(currentAnime),
        currentSeason,
        currentEpisode - 1
    );
}

function nextEpisode() {
    loadEpisode(
        encodeURIComponent(currentAnime),
        currentSeason,
        currentEpisode + 1
    );
}

/* ---------- Close Player ---------- */

function closeModal() {
    const modal = document.getElementById("modal");

    if (modal) {
        modal.classList.remove("show");
    }

    const player =
        document.querySelector(".player") ||
        document.getElementById("player");

    if (player) {
        player.innerHTML = "";
    }
}

/* ---------- Search Input ---------- */

const searchInput = document.getElementById("search");

if (searchInput) {
    let timer;

    searchInput.addEventListener("input", function () {
        clearTimeout(timer);

        timer = setTimeout(() => {
            searchAnime(this.value);
        }, 500);
    });
}

/* ---------- Mobile Menu ---------- */

const menuButton = document.getElementById("menu");

if (menuButton) {
    menuButton.addEventListener("click", () => {
        const nav = document.querySelector("nav");

        if (nav) {
            nav.classList.toggle("open");
        }
    });
}

/* ---------- Start ---------- */

document.addEventListener("DOMContentLoaded", () => {
    loadHome();
});
