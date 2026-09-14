const series = [
  'Mushoku Tensei: Jobless Reincarnation',
  'JoJo’s Bizarre Adventure',
  'Kaiju No. 8',
  'BLACK TORCH',
  'Welcome to Demon School! Iruma-kun',
  'Sparks of Tomorrow',
  'The Case Study of Vanitas',
  'Demon’s Shadow Realm'
];

const movies = [
  'Death Note Relight 2: L’s Successors',
  'Demon Slayer: Infinity Castle',
  'Solo Leveling ReAwakening',
  'Death Note Relight 1: Visions of a God',
  'Iron Man: Rise of Technovore',
  'Arco',
  'Naruto the Movie',
  'Baki Hanma VS Kengan Ashura'
];

function make(a, id) {
  document.getElementById(id).innerHTML = a.map((x, i) => `
    <article class="card" onclick="watch('${x.replaceAll("'", "\\'")}')">
      <div class="poster">${x}</div>

      <div class="body">
        <h3>${x}</h3>

        <div class="year">
          ${2026 - i % 5}
        </div>

        <small>
          ★ ${(8.1 + i % 5 * 0.17).toFixed(2)}
          • Hindi Dub
        </small>
      </div>
    </article>
  `).join('');
}

make(series, 'sg');
make(movies, 'mg');
make(series.slice(0, 10), 'tg');

document.getElementById('search').oninput = e => {
  const q = e.target.value.toLowerCase();

  document.querySelectorAll('.card').forEach(c => {
    c.style.display =
      c.innerText.toLowerCase().includes(q) ? '' : 'none';
  });
};

function watch(t) {
  document.getElementById('wt').textContent = t;
  document.getElementById('modal').classList.add('show');
}

function closeModal() {
  document.getElementById('modal').classList.remove('show');
}

document.getElementById('login').onclick = () => {
  alert('Login UI can be connected to your backend.');
};

document.getElementById('menu').onclick = () => {
  const nav = document.querySelector('nav');

  nav.style.display =
    nav.style.display === 'flex' ? 'none' : 'flex';
};
