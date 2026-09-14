/* ====================================================
   MY ANIME WEBSITE
   script.js
==================================================== */

const API = "/api";

/* ====================================================
   ELEMENTS
==================================================== */

const seriesGrid = document.getElementById("sg");
const movieGrid = document.getElementById("mg");
const topGrid = document.getElementById("tg");
const searchInput = document.getElementById("search");

const modal = document.getElementById("modal");
const watchTitle = document.getElementById("wt");

let currentAnime = null;
let currentSeason = 1;
let currentEpisode = 1;


/* ====================================================
   HELPERS
==================================================== */

function escapeHTML(text) {
    if (text === undefined || text === null) return "";

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function getImage(item) {

    return (
        item?.image ||
        item?.poster ||
        item?.cover ||
        item?.thumbnail ||
        item?.img ||
        "https://via.placeholder.com/300x440?text=Anime"
    );

}


function getTitle(item) {

    return (
        item?.title ||
        item?.name ||
        item?.animeTitle ||
        "Unknown Anime"
    );

}


function getId(item) {

    return (
        item?.id ||
        item?.slug ||
        item?.animeId ||
        item?.mal_id ||
        ""
    );

}


/* ====================================================
   CREATE ANIME CARD
==================================================== */

function createCard(item, number = null) {

    const title = getTitle(item);
    const id = getId(item);
    const image = getImage(item);

    const card = document.createElement("div");

    card.className = "card";

    if (number !== null) {
        card.dataset.number = number;
    }

    card.innerHTML = `
        <img
            src="${escapeHTML(image)}"
            alt="${escapeHTML(title)}"
            loading="lazy"
            onerror="this.src='https://via.placeholder.com/300x440?text=Anime'"
        >

        <div class="card-info">
            <h3>${escapeHTML(title)}</h3>
            <p>
                ${escapeHTML(
                    item?.type ||
                    item?.releaseDate ||
                    "Anime"
                )}
            </p>
        </div>
    `;

    card.addEventListener("click", () => {

        if (id) {
            openAnime(id, title);
        } else {
            watch(title);
        }

    });

    return card;
}


/* ====================================================
   LOAD HOME
==================================================== */

async function loadHome() {

    try {

        const response = await fetch(`${API}/home`);

        if (!response.ok) {
            throw new Error("Home API failed");
        }

        const data = await response.json();

        console.log("Home data:", data);

        /*
         Different API responses may use different
         property names, so we check several common ones.
        */

        const series =
            data?.series ||
            data?.results?.series ||
            data?.recentlyAdded ||
            data?.recent ||
            data?.data?.series ||
            [];

        const movies =
            data?.movies ||
            data?.results?.movies ||
            data?.data?.movies ||
            [];

        const popular =
            data?.popular ||
            data?.results?.popular ||
            data?.top10 ||
            data?.data?.popular ||
            series;

        renderGrid(seriesGrid, series);
        renderGrid(movieGrid, movies);
        renderGrid(topGrid, popular.slice(0, 10));

    } catch (error) {

        console.error(error);

        showMessage(
            seriesGrid,
            "Anime data load नहीं हो पाया।"
        );

        showMessage(
            movieGrid,
            "Movies data load नहीं हो पाया।"
        );

    }

}


/* ====================================================
   RENDER GRID
==================================================== */

function renderGrid(container, items) {

    if (!container) return;

    container.innerHTML = "";

    if (!Array.isArray(items) || items.length === 0) {

        container.innerHTML = `
            <p class="muted">
                अभी कोई data उपलब्ध नहीं है।
            </p>
        `;

        return;
    }

    items.forEach((item, index) => {

        container.appendChild(
            createCard(item, index + 1)
        );

    });

}


/* ====================================================
   MESSAGE
==================================================== */

function showMessage(container, message) {

    if (!container) return;

    container.innerHTML = `
        <p class="muted">${escapeHTML(message)}</p>
    `;

}


/* ====================================================
   SEARCH
==================================================== */

let searchTimer = null;

if (searchInput) {

    searchInput.addEventListener("input", () => {

        clearTimeout(searchTimer);

        const query =
            searchInput.value.trim();

        if (!query) {

            loadHome();

            return;
        }

        searchTimer = setTimeout(() => {

            searchAnime(query);

        }, 400);

    });

}


async function searchAnime(query) {

    try {

        const response = await fetch(
            `${API}/search?s=${encodeURIComponent(query)}&page=1`
        );

        if (!response.ok) {
            throw new Error("Search failed");
        }

        const data = await response.json();

        console.log("Search:", data);

        const results =
            data?.results?.results ||
            data?.results ||
            data?.data ||
            [];

        renderGrid(seriesGrid, results);

        if (movieGrid) {
            movieGrid.innerHTML = "";
        }

        if (topGrid) {
            topGrid.innerHTML = "";
        }

    } catch (error) {

        console.error(error);

        showMessage(
            seriesGrid,
            "Search करने में समस्या हुई।"
        );

    }

}


/* ====================================================
   OPEN ANIME
==================================================== */

async function openAnime(id, title) {

    currentAnime = id;
    currentSeason = 1;
    currentEpisode = 1;

    watchTitle.textContent =
        title || "Watch Episode";

    modal.classList.add("show");

    try {

        const response = await fetch(
            `${API}/episodes?id=${encodeURIComponent(id)}&season=1`
        );

        if (!response.ok) {
            throw new Error("Episodes API failed");
        }

        const data = await response.json();

        console.log("Episodes:", data);

        /*
          Episode buttons can be added here when the API
          returns episode information.
        */

    } catch (error) {

        console.error(error);

    }

}


/* ====================================================
   WATCH
==================================================== */

function watch(title, id = null) {

    currentAnime =
        id || title;

    currentSeason = 1;
    currentEpisode = 1;

    if (watchTitle) {

        watchTitle.textContent =
            title || "Watch Episode";

    }

    if (modal) {

        modal.classList.add("show");

    }

}


/* ====================================================
   CLOSE MODAL
==================================================== */

function closeModal() {

    if (!modal) return;

    modal.classList.remove("show");

}


/* ====================================================
   CLOSE WHEN CLICKING OUTSIDE
==================================================== */

if (modal) {

    modal.addEventListener("click", (event) => {

        if (event.target === modal) {
            closeModal();
        }

    });

}


/* ====================================================
   ESC KEY
==================================================== */

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        closeModal();

    }

});


/* ====================================================
   SERVER BUTTONS
==================================================== */

document.querySelectorAll(".servers button")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".servers button")
                .forEach(btn =>
                    btn.classList.remove("active")
                );

            button.classList.add("active");

            console.log(
                "Selected server:",
                button.textContent
            );

        });

    });


/* ====================================================
   PREVIOUS / NEXT
==================================================== */

const controlButtons =
    document.querySelectorAll(".controls button");

if (controlButtons.length >= 2) {

    controlButtons[0].addEventListener(
        "click",
        () => {

            if (currentEpisode > 1) {

                currentEpisode--;

                loadEpisode();

            }

        }
    );


    controlButtons[1].addEventListener(
        "click",
        () => {

            currentEpisode++;

            loadEpisode();

        }
    );

}


/* ====================================================
   LOAD EPISODE / STREAM
==================================================== */

async function loadEpisode() {

    if (!currentAnime) return;

    console.log(
        "Loading:",
        currentAnime,
        "Season:",
        currentSeason,
        "Episode:",
        currentEpisode
    );

    try {

        const response = await fetch(
            `${API}/stream?id=${encodeURIComponent(currentAnime)}&season=${currentSeason}&ep=${currentEpisode}`
        );

        if (!response.ok) {
            throw new Error("Stream API failed");
        }

        const data = await response.json();

        console.log("Stream data:", data);

        /*
          The API response can contain the actual stream
          URL. We do not download or host the video here.
        */

        const player =
            document.querySelector(".player");

        if (!player) return;

        const streamUrl =
            data?.url ||
            data?.stream ||
            data?.link ||
            data?.sources?.[0]?.url;

        if (streamUrl) {

            player.innerHTML = `
                <video
                    controls
                    autoplay
                    playsinline
                    style="width:100%;height:100%;background:#000;"
                >
                    <source
                        src="${escapeHTML(streamUrl)}"
                        type="video/mp4"
                    >
                    Your browser does not support video playback.
                </video>
            `;

        } else {

            player.innerHTML = `
                <div>
                    <div style="font-size:45px;">▶</div>
                    <p style="color:#777;margin-top:10px;">
                        Stream available नहीं है।
                    </p>
                </div>
            `;

        }

    } catch (error) {

        console.error(error);

        const player =
            document.querySelector(".player");

        if (player) {

            player.innerHTML = `
                <div>
                    <div style="font-size:45px;">⚠</div>
                    <p style="color:#777;margin-top:10px;">
                        Episode load नहीं हो पाया।
                    </p>
                </div>
            `;

        }

    }

}


/* ====================================================
   MOBILE MENU
==================================================== */

const menuButton =
    document.getElementById("menu");

if (menuButton) {

    menuButton.addEventListener("click", () => {

        document
            .querySelector("nav")
            ?.classList.toggle("open");

    });

}


/* ====================================================
   INITIAL LOAD
==================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadHome();

    }
);
