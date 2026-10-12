document.addEventListener('DOMContentLoaded', () => {
  fetchDataAndInit();
});

let siteData = null;

async function fetchDataAndInit() {
  try {
    const res = await fetch('data.json');
    siteData = await res.json();
    renderSite(siteData);
  } catch (err) {
    console.error('Data yüklenirken hata oluştu:', err);
  }
}

function renderSite(data) {
  // Bakım Modu Kontrolü
  const maintenanceScreen = document.getElementById('maintenance-screen');
  const appContainer = document.getElementById('app-container');

  if (data.siteSettings && data.siteSettings.maintenanceMode) {
    maintenanceScreen.classList.remove('hidden');
    appContainer.classList.add('hidden');
    if (data.siteSettings.maintenanceMessage) {
      document.getElementById('maintenance-msg').innerText = data.siteSettings.maintenanceMessage;
    }
    return;
  } else {
    maintenanceScreen.classList.add('hidden');
    appContainer.classList.remove('hidden');
  }

  // Profil Bilgileri
  const profile = data.profile || {};
  document.getElementById('profile-avatar').src = profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';
  document.getElementById('profile-name').innerText = profile.name || 'Miray';
  document.getElementById('profile-handle').innerText = profile.handle || '@miraydubbing';

  // Mavi Tık Kontrolü
  const verifiedBadge = document.getElementById('verified-badge');
  if (profile.showVerifiedBadge) {
    verifiedBadge.classList.remove('hidden');
  } else {
    verifiedBadge.classList.add('hidden');
  }

  // Bio Yazısını Formatlama (**bold** conversion)
  const bioContainer = document.getElementById('profile-bio');
  if (profile.bio) {
    let formattedBio = profile.bio.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    bioContainer.innerHTML = formattedBio;
  }

  // Bağlantılar Listesini Oluşturma
  renderLinks(data.links || []);

  // Dublajlar Listesini Oluşturma
  renderDubbings(data.dubbingProjects || []);

  // Footer Bilgileri
  if (data.footer) {
    document.getElementById('footer-copyright').innerText = data.footer.copyright || '© 2025 Miray. Tüm hakları saklıdır.';
    if (data.footer.eternalProduction) {
      const ep = data.footer.eternalProduction;
      document.getElementById('eternal-title').innerText = ep.title || 'Eternal Production';
      document.getElementById('eternal-tagline').innerText = ep.tagline || 'Profesyonel Seslendirme & Prodüksiyon Hizmetleri';
      document.getElementById('eternal-link').href = ep.url || 'https://eternalproduction.com';
    }
  }
}

function renderLinks(links) {
  const container = document.getElementById('links-container');
  container.innerHTML = '';

  links.forEach(link => {
    const card = document.createElement('a');
    card.className = 'link-card';
    card.href = link.url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    // Icon haritalama
    let iconClass = 'fa-solid fa-link';
    if (link.icon === 'youtube') iconClass = 'fa-brands fa-youtube';
    else if (link.icon === 'instagram') iconClass = 'fa-brands fa-instagram';
    else if (link.icon === 'tiktok') iconClass = 'fa-brands fa-tiktok';
    else if (link.icon === 'discord') iconClass = 'fa-brands fa-discord';
    else if (link.icon === 'mic') iconClass = 'fa-solid fa-microphone-lines';

    card.innerHTML = `
      <div class="link-left">
        <div class="link-icon-box" style="${link.color ? `color: ${link.color};` : ''}">
          <i class="${iconClass}"></i>
        </div>
        <div class="link-details">
          <span class="link-title">${link.title}</span>
          ${link.subtitle ? `<span class="link-subtitle">${link.subtitle}</span>` : ''}
        </div>
      </div>
      <div class="link-right">
        ${link.badge ? `<span class="link-badge">${link.badge}</span>` : ''}
        <i class="fa-solid fa-chevron-right link-arrow"></i>
      </div>
    `;

    container.appendChild(card);
  });
}

function renderDubbings(dubbings) {
  const container = document.getElementById('dubbings-container');
  container.innerHTML = '';

  dubbings.forEach(dub => {
    const card = document.createElement('div');
    card.className = 'dubbing-card';

    const tagsHtml = dub.tags ? dub.tags.map(t => `<span class="dubbing-tag">${t}</span>`).join('') : '';

    card.innerHTML = `
      <div class="dubbing-thumb-wrapper" onclick="openModal('${dub.videoUrl}', '${escapeQuotes(dub.title)}', '${escapeQuotes(dub.description)}')">
        <img src="${dub.thumbnail}" alt="${dub.title}" class="dubbing-thumb">
        <div class="play-overlay">
          <div class="play-btn">
            <i class="fa-solid fa-play"></i>
          </div>
        </div>
        <span class="dubbing-category-badge">${dub.category || 'Dublaj'}</span>
      </div>
      <div class="dubbing-body">
        <span class="dubbing-role">${dub.role || ''}</span>
        <h3 class="dubbing-title">${dub.title}</h3>
        <p class="dubbing-desc">${dub.description}</p>
        <div class="dubbing-tags">
          ${tagsHtml}
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function escapeQuotes(str) {
  if (!str) return '';
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

/* Sekmeler Arası Geçiş */
function switchTab(tabName) {
  const tabLinks = document.getElementById('tab-links');
  const tabDubbings = document.getElementById('tab-dubbings');
  const btnLinks = document.getElementById('tab-links-btn');
  const btnDubbings = document.getElementById('tab-dubbings-btn');

  if (tabName === 'links') {
    tabLinks.classList.remove('hidden');
    tabDubbings.classList.add('hidden');
    btnLinks.classList.add('active');
    btnDubbings.classList.remove('active');
  } else if (tabName === 'dubbings') {
    tabLinks.classList.add('hidden');
    tabDubbings.classList.remove('hidden');
    btnLinks.classList.remove('active');
    btnDubbings.classList.add('active');
  }
}

/* Modal İşlemleri */
function openModal(videoUrl, title, desc) {
  const modal = document.getElementById('video-modal');
  const iframe = document.getElementById('modal-iframe');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');

  iframe.src = videoUrl + "?autoplay=1";
  modalTitle.innerText = title;
  modalDesc.innerText = desc;

  modal.classList.remove('hidden');
}

function closeModal(event) {
  if (event.target.id === 'video-modal') {
    closeModalDirect();
  }
}

function closeModalDirect() {
  const modal = document.getElementById('video-modal');
  const iframe = document.getElementById('modal-iframe');
  iframe.src = '';
  modal.classList.add('hidden');
}
