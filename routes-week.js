const ROUTE_DAYS = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

let selectedRouteDay = new Date().getDay();

function getRouteDayName(day) {
  return ROUTE_DAYS[day];
}

function getClientsForRouteDay(clients, day) {
  const dayName = getRouteDayName(day);

  return clients.filter(client => {
    if (client.service_days && client.service_days.length) {
      return client.service_days.includes(dayName);
    }

    return String(client.service_day || '')
      .split(',')
      .map(value => value.trim())
      .includes(dayName);
  });
}

function selectRouteDay(day) {
  selectedRouteDay = day;
  renderRoutes();
}

function setupRouteWeek() {
  const section = document.getElementById('routes');
  if (!section || document.getElementById('routeWeekBox')) return;

  const panel = section.querySelector('.panel');
  if (!panel) return;

  const box = document.createElement('div');
  box.id = 'routeWeekBox';
  box.style.cssText =
    'display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:15px';

  ROUTE_DAYS.forEach((name, index) => {
    const button = document.createElement('button');

    button.className = 'btn light routeWeekBtn';
    button.dataset.day = index;
    button.textContent = name.slice(0, 3).toUpperCase();

    button.onclick = () => {
      selectRouteDay(index);
    };

    box.appendChild(button);
  });

  panel.parentElement.insertBefore(box, panel);

  const title = section.querySelector('h1');
  if (title) title.textContent = '🚗 Rota da semana';

  const muted = section.querySelector('.muted');
  if (muted) muted.textContent = 'Escolha o dia para ver os clientes agendados';

  updateRouteWeekButtons();
}

function updateRouteWeekButtons() {
  document.querySelectorAll('.routeWeekBtn').forEach(button => {
    const active = Number(button.dataset.day) === selectedRouteDay;

    button.style.fontWeight = active ? '800' : '600';
    button.style.border =
      active ? '2px solid #087bc1' : '1px solid #d7d9e3';
  });

  const title = document.getElementById('routeSelectedDay');

  if (title) {
    title.textContent = getRouteDayName(selectedRouteDay);
  }
}

async function renderRoutes() {
  const clients = await getClients();
  const dayName = getRouteDayName(selectedRouteDay);
  const arr = getClientsForRouteDay(clients, selectedRouteDay);

  setupRouteWeek();
  updateRouteWeekButtons();

  const title = document.getElementById('routeSelectedDay');

  if (title) {
    title.textContent = dayName;
  }

  const list = document.getElementById('routeList');

  if (!list) return;

  list.innerHTML = arr.length
    ? arr.map((client, index) =>
        `<div class="row">
          <span>
            <b>${index + 1}. ${esc(client.name)}</b>
            <br>
            <span class="muted">
              Horário não definido · ${esc(client.address || 'Sem endereço')}
            </span>
          </span>
          <span class="badge blue">Fixo</span>
        </div>`
      ).join('')
    : `<div class="empty">
        Não há clientes fixos programados para ${dayName}.
      </div>`;
}

async function openMaps() {
  const clients = await getClients();
  const dayName = getRouteDayName(selectedRouteDay);

  const addresses = getClientsForRouteDay(clients, selectedRouteDay)
    .map(client => client.address)
    .filter(Boolean);

  if (!addresses.length) {
    return alert(
      'Não há endereços de clientes fixos para ' + dayName + '.'
    );
  }

  window.open(
    'https://www.google.com/maps/dir/' +
      addresses.map(encodeURIComponent).join('/'),
    '_blank'
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupRouteWeek);
} else {
  setupRouteWeek();
}