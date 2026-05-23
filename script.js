// DOM элементы
const channelsContainer = document.getElementById('channelsContainer');
const mainCategoriesPanel = document.getElementById('mainCategoriesPanel');
const subCategoriesPanel = document.getElementById('subCategoriesPanel');
const playerModal = document.getElementById('playerModal');
const videoPlayerElement = document.getElementById('videoPlayerElement');
const closeModal = document.getElementById('closeModal');
const initialLoader = document.getElementById('initialLoader');
const toastContainer = document.getElementById('toastContainer');

// Firebase: Инициализация
const firebaseConfig = {
  apiKey: "AIzaSyD9mAjCqyhJix9Tiyr-vQXWj-Mejysws44",
  authDomain: "tv-channels-watching.firebaseapp.com",
  databaseURL: "https://tv-channels-watching-default-rtdb.firebaseio.com",
  projectId: "tv-channels-watching",
  storageBucket: "tv-channels-watching.firebasestorage.app",
  messagingSenderId: "625169237639",
  appId: "1:625169237639:web:beeed9dc2d424aeb269a22",
  measurementId: "G-B1HFTLJ7BM"
};
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Глобальные переменные
let currentLanguage = localStorage.getItem('appLanguage') || 'ru';
let checkChannelsOnLoad = localStorage.getItem('checkChannelsOnLoad') === 'true';
let openInExternalPlayer = localStorage.getItem('openInExternalPlayer') === 'true';

let currentMainCategory = 'Просмотренные';
let currentSubcategory = '';
let currentMainCategoryIndex = 0;
let currentSubCategoryIndex = 0;
let currentChannelIndex = 0;
let currentMiniPlayer = null;
let miniPlayers = new Map();
let focusTimer = null;
let loadedPlaylists = {};
let navigationState = 'channels';
let searchTimeout = null;
let currentWatchedChannel = null;
let watchStartTime = null;

// Базовый словарь переводов (добавьте свои переводы)
const translations = {
    ru: {
        "Проверять каналы": "Проверять каналы",
        "Просмотренные": "Просмотренные",
        "Прямо сейчас": "Прямо сейчас",
        "Смотрят": "Популярные",
        "Свой плейлист": "Свой плейлист",
        "Пользовательские плейлисты": "Пользовательские плейлисты",
        "Каналы не найдены": "Каналы не найдены",
        "Загрузка...": "Загрузка...",
        "Ошибка инициализации": "Ошибка инициализации",
        "Ошибка приложения": "Ошибка приложения",
        "Канал не отвечает": "Канал не отвечает",
        "Канал недоступен": "Канал недоступен",
        "Нажмите на видео для воспроизведения": "Нажмите на видео для воспроизведения",
        "Формат не поддерживается": "Формат не поддерживается",
        "Не удалось загрузить плейлист": "Не удалось загрузить плейлист",
        "Плейлист загружен!": "Плейлист загружен!",
        "Введите ссылку": "Введите ссылку",
        "Язык изменён на Русский": "Язык изменён на Русский",
        "Language changed to English": "Язык изменён на Английский",
        "Случайный канал": "Случайный канал",
        "Не удалось найти доступный канал": "Не удалось найти доступный канал",
        "Попробуйте позже": "Попробуйте позже",
        "Еще один!": "Еще один!",
        "Поиск по каналам": "Поиск по каналам",
        "Проверка доступности...": "Проверка доступности...",
        "каналов": "каналов",
        "Открыть в стороннем плеере": "Открыть в стороннем плеере",
        "Открыть в плеере": "Открыть в плеере",
        "Открыть все в плейлисте": "Открыть все в плейлисте",
        "Сторонний плеер включен": "Сторонний плеер включен",
        "Сторонний плеер выключен": "Сторонний плеер выключен",
        "Экспорт M3U плейлиста": "Экспорт M3U плейлиста",
        "Закрыть": "Закрыть",
        "Копировать все ссылки": "Копировать все ссылки",
        "Ссылки скопированы": "Ссылки скопированы",
        "Ошибка копирования": "Ошибка копирования",
        "Нет каналов для открытия": "Нет каналов для открытия",
        "Открыто во внешнем плеере": "Открыто во внешнем плеере",
        "Буферизация...": "Буферизация...",
        "Международные": "Международные"
    },
    en: {
        "Проверять каналы": "Check Channels",
        "Просмотренные": "Watched",
        "Прямо сейчас": "Watching Now",
        "Смотрят": "Popular",
        "Свой плейлист": "Custom Playlist",
        "Пользовательские плейлисты": "User Playlists",
        "Каналы не найдены": "Channels not found",
        "Загрузка...": "Loading...",
        "Ошибка инициализации": "Initialization Error",
        "Ошибка приложения": "Application Error",
        "Канал не отвечает": "Channel is not responding",
        "Канал недоступен": "Channel is unavailable",
        "Нажмите на видео для воспроизведения": "Click on video to play",
        "Формат не поддерживается": "Format not supported",
        "Не удалось загрузить плейлист": "Failed to load playlist",
        "Плейлист загружен!": "Playlist loaded!",
        "Введите ссылку": "Enter URL",
        "Язык изменён на Русский": "Language changed to Russian",
        "Language changed to English": "Language changed to English",
        "Случайный канал": "Random Channel",
        "Не удалось найти доступный канал": "Failed to find an available channel",
        "Попробуйте позже": "Please try again later",
        "Еще один!": "Another one!",
        "Поиск по каналам": "Search channels",
        "Проверка доступности...": "Checking availability...",
        "каналов": "channels",
        "Открыть в стороннем плеере": "Open in external player",
        "Открыть в плеере": "Open in player",
        "Открыть все в плейлисте": "Open all in playlist",
        "Сторонний плеер включен": "External player enabled",
        "Сторонний плеер выключен": "External player disabled",
        "Экспорт M3U плейлиста": "Export M3U playlist",
        "Закрыть": "Close",
        "Копировать все ссылки": "Copy all URLs",
        "Ссылки скопированы": "URLs copied",
        "Ошибка копирования": "Copy error",
        "Нет каналов для открытия": "No channels to open",
        "Открыто во внешнем плеере": "Opened in external player",
        "Буферизация...": "Buffering...",
        "Международные": "International"
    }
};

// ДЕРЕВО КАТЕГОРИЙ - ВСТАВЬТЕ СВОЕ ЗДЕСЬ
const categoryTree = {
  "Просмотренные": {},
  "Прямо сейчас": {},
  "Популярные": {},
  "Свой плейлист": {},
  "Пользовательские плейлисты": {},
  "Случайный канал": {},
  // ДОБАВЬТЕ ВАШИ КАТЕГОРИИ, СТРАНЫ, ЯЗЫКИ, РЕГИОНЫ
};

// Функция перевода
function translateText(key) {
    return translations[currentLanguage][key] || key;
}

// ============= ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =============

function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

function openInExternalPlayerFunc(url, name) {
    try {
        window.open(url, '_blank');
        showToast(`📺 ${translateText("Открыто во внешнем плеере")}: ${name}`);
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                setTimeout(() => showToast(`🔗 ${translateText("Ссылка скопирована! Вставьте в плеер")}`, 2000), 2000);
            });
        }
    } catch (error) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url);
            showToast(translateText("Ссылка скопирована в буфер"));
        }
    }
}

function exportToM3U(channels, filename = 'playlist.m3u') {
    let m3uContent = '#EXTM3U\n';
    channels.forEach(channel => {
        let name = channel.name.replace(/#/g, '');
        let logoAttr = channel.logo ? ` tvg-logo="${channel.logo}"` : '';
        let groupAttr = channel.group ? ` group-title="${channel.group}"` : '';
        m3uContent += `#EXTINF:-1${logoAttr}${groupAttr},${name}\n${channel.url}\n`;
    });
    const blob = new Blob([m3uContent], { type: 'audio/x-mpegurl' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    showToast(`📥 ${translateText("Экспорт M3U плейлиста")}: ${channels.length} ${translateText("каналов")}`);
}

function openAllInExternalPlayerFunc(channels) {
    if (!channels || channels.length === 0) {
        showToast(translateText("Нет каналов для открытия"));
        return;
    }
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: #1a1a1a; border-radius: 12px; padding: 20px; z-index: 10000;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3); min-width: 280px; border: 1px solid #444;
    `;
    dialog.innerHTML = `
        <h3 style="margin: 0 0 15px 0; color: white;">${translateText("Открыть все в плейлисте")}</h3>
        <div style="margin-bottom: 15px; color: #ccc;">${channels.length} ${translateText("каналов")}</div>
        <button id="exportM3UBtn" style="width:100%; padding:10px; margin-bottom:10px; background:linear-gradient(90deg,#3a86ff,#4cc9f0); border:none; border-radius:6px; color:white; cursor:pointer;">${translateText("Экспорт M3U плейлиста")}</button>
        <button id="copyAllUrlsBtn" style="width:100%; padding:10px; margin-bottom:10px; background:linear-gradient(90deg,#20bf6b,#26de81); border:none; border-radius:6px; color:white; cursor:pointer;">📋 ${translateText("Копировать все ссылки")}</button>
        <button id="closeDialogBtn" style="width:100%; padding:10px; background:#444; border:none; border-radius:6px; color:white; cursor:pointer;">${translateText("Закрыть")}</button>
    `;
    document.body.appendChild(dialog);
    document.getElementById('exportM3UBtn').onclick = () => { exportToM3U(channels, `${currentMainCategory}_${currentSubcategory || 'all'}.m3u`); dialog.remove(); };
    document.getElementById('copyAllUrlsBtn').onclick = () => {
        navigator.clipboard.writeText(channels.map(ch => ch.url).join('\n')).then(() => {
            showToast(`📋 ${translateText("Ссылки скопированы")} (${channels.length})`);
            dialog.remove();
        }).catch(() => showToast(translateText("Ошибка копирования")));
    };
    document.getElementById('closeDialogBtn').onclick = () => dialog.remove();
    dialog.addEventListener('click', (e) => e.stopPropagation());
    setTimeout(() => {
        document.addEventListener('click', function closeOnClick(e) {
            if (!dialog.contains(e.target)) { dialog.remove(); document.removeEventListener('click', closeOnClick); }
        });
    }, 100);
}

function toggleExternalPlayer() {
    openInExternalPlayer = !openInExternalPlayer;
    localStorage.setItem('openInExternalPlayer', openInExternalPlayer);
    const toggleBtn = document.getElementById('externalPlayerToggle');
    if (toggleBtn) {
        toggleBtn.textContent = openInExternalPlayer ? '📱 ' + translateText('Открыть в стороннем плеере') : '🎬 ' + translateText('Открыть в стороннем плеере');
        toggleBtn.classList.toggle('active', openInExternalPlayer);
    }
    showToast(openInExternalPlayer ? translateText("Сторонний плеер включен") : translateText("Сторонний плеер выключен"));
}

async function addToPopular(name, url, group, logo) {
    try {
        const key = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
        const snapshot = await database.ref('popular/' + key).get();
        let data = snapshot.exists() ? snapshot.val() : { name, url, group, logo, views: 0, createdAt: Date.now() };
        data.views = (data.views || 0) + 1;
        await database.ref('popular/' + key).set(data);
    } catch (error) { console.error("Firebase error:", error); }
}

async function updateWatchingNow(name, url, group, logo) {
    try {
        const key = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
        await database.ref('watching/' + key).set({ name, url, group, logo, lastWatched: Date.now() });
    } catch (error) { console.error("Firebase error:", error); }
}

function addToWatched(name, url, group, logo) {
    let watched;
    try {
        const raw = localStorage.getItem('watchedChannels');
        watched = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(watched)) watched = [];
    } catch (e) { watched = []; }
    if (watched.some(item => item.url === url || item.name === name)) return;
    watched.push({ name, url, group, logo, watchedAt: Date.now() });
    localStorage.setItem('watchedChannels', JSON.stringify(watched));
    if (currentMainCategory === 'Просмотренные') loadAndRenderChannels('Просмотренные', '');
}

async function fetchM3U(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
}

function parseM3UContent(content, assignedCategory) {
    const channels = [];
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#EXTINF:')) {
            const infoLine = lines[i];
            let urlLine = lines[i + 1];
            while (urlLine && urlLine.trim() === '') { i++; urlLine = lines[i + 1]; }
            if (urlLine && !urlLine.startsWith('#')) {
                let name = infoLine.split(',')[1] || 'Канал';
                const tvgNameMatch = infoLine.match(/tvg-name="([^"]*)"/);
                if (tvgNameMatch) name = tvgNameMatch[1];
                name = name.trim();
                const logoMatch = infoLine.match(/tvg-logo="([^"]*)"/);
                const logo = logoMatch ? logoMatch[1] : '';
                let group = assignedCategory;
                const groupMatch = infoLine.match(/tvg-group-title="([^"]*)"/);
                if (groupMatch && groupMatch[1]) group = groupMatch[1].trim();
                channels.push({ name, url: urlLine.trim(), group, logo });
            }
        }
    }
    return channels;
}

function checkChannelAvailability(url) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.muted = true;
        let manifestLoaded = false, errorOccurred = false, hlsInstance = null;
        const timeoutId = setTimeout(() => {
            if (!manifestLoaded && !errorOccurred) { cleanup(); resolve(false); }
        }, 5000);
        function cleanup() {
            clearTimeout(timeoutId);
            if (hlsInstance) { try { hlsInstance.destroy(); } catch(e) {} }
            video.pause(); video.src = ''; video.load();
        }
        if (Hls.isSupported()) {
            hlsInstance = new Hls();
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => { manifestLoaded = true; cleanup(); resolve(true); });
            hlsInstance.on(Hls.Events.ERROR, () => { errorOccurred = true; cleanup(); resolve(false); });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.addEventListener('loadedmetadata', () => { manifestLoaded = true; cleanup(); resolve(true); }, { once: true });
            video.addEventListener('error', () => { errorOccurred = true; cleanup(); resolve(false); }, { once: true });
        } else { cleanup(); resolve(false); }
        video.play().catch(() => {});
    });
}

async function fetchAndCachePlaylist(url, group) {
    const content = await fetchM3U(url);
    let channels = parseM3UContent(content, group);
    if (!checkChannelsOnLoad || channels.length === 0) {
        loadedPlaylists[url] = channels;
        renderChannels(channels);
        return channels;
    }
    initialLoader.style.display = 'flex';
    initialLoader.innerHTML = `<div style="text-align:center;color:white;"><div>${translateText("Проверка доступности...")}</div><div id="checkProgress">0/${channels.length}</div></div>`;
    let availableChannels = [], checkedCount = 0;
    const updateDisplay = () => {
        loadedPlaylists[url] = [...availableChannels];
        renderChannels([...availableChannels]);
        const prog = document.getElementById('checkProgress');
        if (prog) prog.textContent = `${checkedCount}/${channels.length}`;
    };
    const CONCURRENT_CHECK = 3;
    for (let i = 0; i < channels.length; i += CONCURRENT_CHECK) {
        const batch = channels.slice(i, i + CONCURRENT_CHECK);
        await Promise.allSettled(batch.map(async (channel) => {
            try {
                const isAvailable = await checkChannelAvailability(channel.url);
                checkedCount++;
                if (isAvailable) { availableChannels.push(channel); updateDisplay(); }
            } catch (error) { checkedCount++; updateDisplay(); }
        }));
    }
    loadedPlaylists[url] = [...availableChannels];
    renderChannels([...availableChannels]);
    initialLoader.style.display = 'none';
    return availableChannels;
}

// ============= ОСНОВНОЙ ПЛЕЕР =============

function openFullScreenPlayer(name, url, group, logo) {
    if (openInExternalPlayer) {
        stopAllMiniPlayers();
        openInExternalPlayerFunc(url, name);
        addToWatched(name, url, group, logo);
        addToPopular(name, url, group, logo);
        updateWatchingNow(name, url, group, logo);
        return;
    }
    
    stopAllMiniPlayers();
    currentWatchedChannel = { name, url, group, logo };
    watchStartTime = Date.now();
    updateWatchingNow(name, url, group, logo);
    
    playerModal.style.display = 'flex';
    
    if (videoPlayerElement.hls) {
        try { videoPlayerElement.hls.destroy(); } catch(e) {}
        delete videoPlayerElement.hls;
    }
    videoPlayerElement.pause();
    videoPlayerElement.src = '';
    videoPlayerElement.load();
    videoPlayerElement.muted = false;
    
    const oldBtn = document.getElementById('externalPlayerModalBtn');
    if (oldBtn) oldBtn.remove();
    
    const modalContent = document.querySelector('.modal-content');
    const externalBtn = document.createElement('button');
    externalBtn.id = 'externalPlayerModalBtn';
    externalBtn.innerHTML = '📱 ' + translateText("Открыть в плеере");
    externalBtn.style.cssText = `position:absolute; bottom:20px; right:70px; padding:10px 20px; background:linear-gradient(90deg,#ff375f,#ff5e41); border:none; border-radius:8px; color:white; cursor:pointer; font-size:14px; z-index:1001;`;
    externalBtn.onclick = () => openInExternalPlayerFunc(url, name);
    modalContent.appendChild(externalBtn);
    
    let manifestLoaded = false;
    let hlsInstance = null;
    let reconnectAttempts = 0;
    let stallDetectionTimer = null;
    let lastPlayTime = 0;
    let stallCount = 0;
    
    function startStallDetection() {
        if (stallDetectionTimer) clearInterval(stallDetectionTimer);
        stallDetectionTimer = setInterval(() => {
            if (!videoPlayerElement.paused && videoPlayerElement.currentTime === lastPlayTime) {
                stallCount++;
                if (stallCount >= 3 && hlsInstance) {
                    console.log("🔄 Перезапуск потока из-за зависания");
                    try { hlsInstance.stopLoad(); setTimeout(() => hlsInstance.startLoad(), 1000); } catch(e) {}
                    stallCount = 0;
                }
            } else {
                lastPlayTime = videoPlayerElement.currentTime;
                if (stallCount > 0) stallCount--;
            }
        }, 5000);
    }
    
    function stopStallDetection() {
        if (stallDetectionTimer) { clearInterval(stallDetectionTimer); stallDetectionTimer = null; }
    }
    
    function attemptReconnect() {
        if (reconnectAttempts >= 5) {
            showToast(translateText('Канал недоступен'));
            playerModal.style.display = 'none';
            return;
        }
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 10000);
        setTimeout(() => {
            if (playerModal.style.display === 'flex' && hlsInstance) {
                try { hlsInstance.stopLoad(); hlsInstance.loadSource(url); } catch(e) {}
            }
        }, delay);
    }
    
    const timeoutId = setTimeout(() => {
        if (!manifestLoaded) {
            showToast(translateText('Канал не отвечает'));
            playerModal.style.display = 'none';
            stopStallDetection();
            if (hlsInstance) { try { hlsInstance.destroy(); } catch(e) {} }
        }
    }, 20000);
    
    if (Hls.isSupported()) {
        hlsInstance = new Hls({
            liveDurationInfinity: true,
            enableWorker: true,
            lowLatencyMode: false,
            manifestLoadingTimeOut: 10000,
            manifestLoadingMaxRetry: 3,
            levelLoadingTimeOut: 10000,
            levelLoadingMaxRetry: 4,
            fragLoadingTimeOut: 20000,
            fragLoadingMaxRetry: 6,
            startPosition: -1,
            backBufferLength: 30,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            liveSyncDurationCount: 3,
            liveMaxLatencyDurationCount: 6,
            enableWebVTT: false,
            enableCEA708Captions: false
        });
        
        videoPlayerElement.hls = hlsInstance;
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(videoPlayerElement);
        
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
            clearTimeout(timeoutId);
            manifestLoaded = true;
            reconnectAttempts = 0;
            videoPlayerElement.play().then(() => {
                lastPlayTime = videoPlayerElement.currentTime;
                startStallDetection();
            }).catch(() => {
                showToast(translateText("Нажмите на видео для воспроизведения"));
                videoPlayerElement.addEventListener('click', () => videoPlayerElement.play().catch(()=>{}), { once: true });
            });
            setTimeout(() => requestNativeFullscreen(), 1000);
        });
        
        hlsInstance.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                switch(data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        attemptReconnect();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        try { hlsInstance.recoverMediaError(); } catch(e) { attemptReconnect(); }
                        break;
                    default:
                        showToast(translateText('Канал недоступен'));
                        playerModal.style.display = 'none';
                        stopStallDetection();
                        break;
                }
            } else if (data.details === 'fragLoadError' || data.details === 'fragParsingError') {
                setTimeout(() => { if (hlsInstance && playerModal.style.display === 'flex') hlsInstance.startLoad(); }, 2000);
            }
        });
        
        videoPlayerElement.addEventListener('waiting', () => showToast(translateText("Буферизация..."), 1000));
        videoPlayerElement.addEventListener('error', (e) => {
            if (videoPlayerElement.error?.code === 3) attemptReconnect();
        });
        
    } else if (videoPlayerElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoPlayerElement.src = url;
        videoPlayerElement.addEventListener('loadedmetadata', () => {
            clearTimeout(timeoutId);
            manifestLoaded = true;
            videoPlayerElement.play().then(() => {
                lastPlayTime = videoPlayerElement.currentTime;
                startStallDetection();
            }).catch(() => {
                showToast(translateText("Нажмите на видео для воспроизведения"));
                videoPlayerElement.addEventListener('click', () => videoPlayerElement.play().catch(()=>{}), { once: true });
            });
            setTimeout(() => requestNativeFullscreen(), 1000);
        });
        videoPlayerElement.addEventListener('error', () => {
            showToast(translateText('Канал недоступен'));
            playerModal.style.display = 'none';
            stopStallDetection();
        });
        videoPlayerElement.addEventListener('stalled', () => { if (hlsInstance) attemptReconnect(); });
    } else {
        clearTimeout(timeoutId);
        showToast(translateText('Формат не поддерживается'));
        playerModal.style.display = 'none';
    }
    
    const originalCloseHandler = closeModal.onclick;
    closeModal.onclick = () => {
        stopStallDetection();
        if (videoPlayerElement.hls) { try { videoPlayerElement.hls.destroy(); } catch(e) {} delete videoPlayerElement.hls; }
        videoPlayerElement.pause();
        videoPlayerElement.src = '';
        videoPlayerElement.load();
        playerModal.style.display = 'none';
        const btn = document.getElementById('externalPlayerModalBtn');
        if (btn) btn.remove();
        setTimeout(() => { closeModal.onclick = originalCloseHandler; }, 100);
        if (currentWatchedChannel && watchStartTime) {
            const watchedSeconds = Math.floor((Date.now() - watchStartTime) / 1000);
            if (watchedSeconds >= 60) {
                addToWatched(currentWatchedChannel.name, currentWatchedChannel.url, currentWatchedChannel.group, currentWatchedChannel.logo);
                addToPopular(currentWatchedChannel.name, currentWatchedChannel.url, currentWatchedChannel.group, currentWatchedChannel.logo);
                updateWatchingNow(currentWatchedChannel.name, currentWatchedChannel.url, currentWatchedChannel.group, currentWatchedChannel.logo);
            }
            currentWatchedChannel = null;
            watchStartTime = null;
        }
    };
}

function requestNativeFullscreen() {
    const elem = videoPlayerElement;
    if (elem.requestFullscreen) elem.requestFullscreen().catch(()=>{});
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen().catch(()=>{});
}

// ============= МИНИ-ПЛЕЕРЫ =============

function createMiniPlayer(url) {
    if (miniPlayers.has(url)) return miniPlayers.get(url);
    const container = document.createElement('div');
    container.className = 'mini-player';
    container.dataset.url = url;
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.style.cssText = 'width:100%; height:100%; background:#000;';
    container.appendChild(video);
    miniPlayers.set(url, container);
    return container;
}

function initializeMiniPlayer(video, url, miniPlayer, icon) {
    video.dataset.initialized = 'true';
    let manifestLoaded = false, networkErrorOccurred = false, hlsInstance = null;
    const timeoutId = setTimeout(() => {
        if (!manifestLoaded && !networkErrorOccurred) {
            if (hlsInstance) { try { hlsInstance.destroy(); } catch(e) {} }
            miniPlayer.style.display = 'none';
            icon.style.display = 'block';
        }
    }, 30000);
    
    if (Hls.isSupported()) {
        hlsInstance = new Hls();
        video.hlsInstance = hlsInstance;
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
            clearTimeout(timeoutId);
            manifestLoaded = true;
            video.play().catch(()=>{});
        });
        hlsInstance.on(Hls.Events.ERROR, () => {
            networkErrorOccurred = true;
            clearTimeout(timeoutId);
            miniPlayer.style.display = 'none';
            icon.style.display = 'block';
            video.pause();
            if (video.hlsInstance) { try { video.hlsInstance.destroy(); } catch(e) {} delete video.hlsInstance; }
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', () => { clearTimeout(timeoutId); manifestLoaded = true; video.play().catch(()=>{}); });
        video.addEventListener('error', () => { clearTimeout(timeoutId); miniPlayer.style.display = 'none'; icon.style.display = 'block'; video.pause(); });
    }
}

function stopAllMiniPlayers() {
    miniPlayers.forEach((container) => {
        const video = container.querySelector('video');
        if (video) {
            video.pause();
            if (video.hlsInstance) { try { video.hlsInstance.destroy(); } catch(e) {} delete video.hlsInstance; }
            video.src = '';
            video.load();
        }
        container.style.display = 'none';
        const card = container.closest('.channel-card');
        if (card) {
            const icon = card.querySelector('.channel-media i');
            if (icon) icon.style.display = 'block';
        }
    });
}

function getGroupIcon(group) {
    const g = group.toLowerCase();
    if (g.includes('новости')) return 'fa-newspaper';
    if (g.includes('спорт')) return 'fa-futbol';
    if (g.includes('кино')) return 'fa-film';
    if (g.includes('музыка')) return 'fa-music';
    if (g.includes('детск')) return 'fa-child';
    if (g.includes('документ')) return 'fa-video';
    if (g.includes('развлеч')) return 'fa-theater-masks';
    return 'fa-tv';
}

// ============= ОТРИСОВКА КАНАЛОВ =============

function renderChannels(channelsToRender) {
    channelsContainer.innerHTML = '';
    if (channelsToRender.length === 0) {
        channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Каналы не найдены")}</div>`;
        return;
    }
    channelsToRender.forEach((channel, index) => {
        const groupIcon = getGroupIcon(channel.group);
        const card = document.createElement('div');
        card.className = 'channel-card';
        card.setAttribute('tabindex', '0');
        card.dataset.index = index;
        card.dataset.url = channel.url;
        
        const media = document.createElement('div');
        media.className = 'channel-media';
        if (channel.logo) {
            const img = document.createElement('img');
            img.src = channel.logo;
            img.alt = channel.name;
            img.onerror = () => img.style.display = 'none';
            media.appendChild(img);
        }
        const icon = document.createElement('i');
        icon.className = `fas ${groupIcon}`;
        media.appendChild(icon);
        const miniPlayer = createMiniPlayer(channel.url);
        media.appendChild(miniPlayer);
        
        let viewsText = '';
        if (channel.views) viewsText = ` 👥 ${channel.views}`;
        if (currentMainCategory === 'Прямо сейчас' && channel.lastWatched && Date.now() - channel.lastWatched < 600000) viewsText += ` ⚡`;
        
        const info = document.createElement('div');
        info.className = 'channel-info';
        info.innerHTML = `<h3>${channel.name}${viewsText}</h3><p>${channel.group}</p>`;
        card.appendChild(media);
        card.appendChild(info);
        
        card.addEventListener('focus', () => {
            currentChannelIndex = parseInt(card.dataset.index);
            if (focusTimer) clearTimeout(focusTimer);
            if (currentMiniPlayer && currentMiniPlayer !== miniPlayer) {
                currentMiniPlayer.style.display = 'none';
                const prevIcon = currentMiniPlayer.parentElement?.querySelector('i');
                if (prevIcon) prevIcon.style.display = 'block';
                const prevVideo = currentMiniPlayer.querySelector('video');
                if (prevVideo) prevVideo.pause();
            }
            miniPlayer.style.display = 'block';
            icon.style.display = 'none';
            currentMiniPlayer = miniPlayer;
            focusTimer = setTimeout(() => {
                const video = miniPlayer.querySelector('video');
                if (!video.dataset.initialized) initializeMiniPlayer(video, channel.url, miniPlayer, icon);
                else if (video.paused) video.play().catch(()=>{});
            }, 3000);
        });
        card.addEventListener('blur', () => {
            if (focusTimer) clearTimeout(focusTimer);
            setTimeout(() => {
                if (!card.contains(document.activeElement)) {
                    miniPlayer.style.display = 'none';
                    icon.style.display = 'block';
                    const video = miniPlayer.querySelector('video');
                    if (video) video.pause();
                }
            }, 100);
        });
        card.addEventListener('click', () => openFullScreenPlayer(channel.name, channel.url, channel.group, channel.logo));
        card.addEventListener('keydown', (e) => { if (e.key === 'Enter') openFullScreenPlayer(channel.name, channel.url, channel.group, channel.logo); });
        channelsContainer.appendChild(card);
    });
}

// ============= ЗАГРУЗКА КАНАЛОВ =============

async function loadAndRenderChannels(mainCategory, subcategory) {
    if (mainCategory === 'Просмотренные') {
        initialLoader.style.display = 'none';
        const watched = JSON.parse(localStorage.getItem('watchedChannels') || '[]');
        renderChannels(watched);
        return;
    }
    if (mainCategory === 'Прямо сейчас') {
        initialLoader.style.display = 'none';
        channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Загрузка...")}</div>`;
        miniPlayers.clear();
        const loadWatchingNow = async () => {
            try {
                const snapshot = await database.ref('watching').get();
                let watchingNow = [];
                if (snapshot.exists()) {
                    const now = Date.now();
                    watchingNow = Object.values(snapshot.val()).filter(ch => (now - ch.lastWatched) < 600000);
                    watchingNow.sort((a, b) => b.lastWatched - a.lastWatched);
                }
                renderChannels(watchingNow);
            } catch(e) { console.error(e); }
        };
        await loadWatchingNow();
        if (window.watchingNowInterval) clearInterval(window.watchingNowInterval);
        window.watchingNowInterval = setInterval(loadWatchingNow, 10000);
        return;
    }
    if (mainCategory === 'Популярные') {
        initialLoader.style.display = 'flex';
        try {
            const snapshot = await database.ref('popular').get();
            let popular = snapshot.exists() ? Object.values(snapshot.val()).sort((a,b) => b.views - a.views) : [];
            renderChannels(popular);
        } catch(e) { console.error(e); }
        finally { initialLoader.style.display = 'none'; }
        return;
    }
    if (mainCategory === 'Свой плейлист') {
        initialLoader.style.display = 'none';
        const custom = JSON.parse(localStorage.getItem('customPlaylist') || '[]');
        renderChannels(custom);
        return;
    }
    if (mainCategory === 'Случайный канал') {
        loadRandomChannel();
        return;
    }
    if (!categoryTree[mainCategory]?.[subcategory]) { renderChannels([]); return; }
    
    const url = categoryTree[mainCategory][subcategory];
    initialLoader.style.display = 'flex';
    try {
        const channels = loadedPlaylists[url] || await fetchAndCachePlaylist(url, subcategory);
        renderChannels(channels);
    } catch(e) { renderChannels([]); }
    finally { initialLoader.style.display = 'none'; }
}

let cachedGlobalPlaylist = null;
async function loadRandomChannel() {
    initialLoader.style.display = 'flex';
    try {
        if (!cachedGlobalPlaylist) {
            const content = await fetchM3U('https://iptv-org.github.io/iptv/index.m3u');
            cachedGlobalPlaylist = parseM3UContent(content, translateText('Международные'));
        }
        const shuffled = [...cachedGlobalPlaylist];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        renderChannels(shuffled.slice(0, 6));
    } catch(e) {
        channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Не удалось найти доступный канал")}</div>`;
    } finally { initialLoader.style.display = 'none'; }
}

// ============= UI КОМПОНЕНТЫ =============

function renderMainCategories() {
    mainCategoriesPanel.innerHTML = '';
    Object.keys(categoryTree).forEach((cat, index) => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = translateText(cat);
        if (cat === currentMainCategory) btn.classList.add('active');
        btn.addEventListener('click', () => {
            currentMainCategory = cat;
            currentSubcategory = '';
            renderSubCategories();
            loadAndRenderChannels(cat, '');
            updateMainCategoryActive();
        });
        mainCategoriesPanel.appendChild(btn);
    });
    
    const spacer = document.createElement('div'); spacer.style.width = '20px';
    mainCategoriesPanel.appendChild(spacer);
    
    const ruBtn = document.createElement('button');
    ruBtn.className = 'category-btn';
    ruBtn.textContent = '🇷🇺';
    if (currentLanguage === 'ru') ruBtn.classList.add('active');
    ruBtn.onclick = () => setLanguage('ru');
    mainCategoriesPanel.appendChild(ruBtn);
    
    const enBtn = document.createElement('button');
    enBtn.className = 'category-btn';
    enBtn.textContent = '🇬🇧';
    if (currentLanguage === 'en') enBtn.classList.add('active');
    enBtn.onclick = () => setLanguage('en');
    mainCategoriesPanel.appendChild(enBtn);
    
    const externalBtn = document.createElement('button');
    externalBtn.id = 'externalPlayerToggle';
    externalBtn.className = 'category-btn';
    externalBtn.textContent = openInExternalPlayer ? '📱 ' + translateText('Открыть в стороннем плеере') : '🎬 ' + translateText('Открыть в стороннем плеере');
    externalBtn.style.minWidth = '160px';
    if (openInExternalPlayer) externalBtn.classList.add('active');
    externalBtn.onclick = toggleExternalPlayer;
    mainCategoriesPanel.appendChild(externalBtn);
    
    const checkBtn = document.createElement('button');
    checkBtn.className = 'category-btn';
    checkBtn.textContent = checkChannelsOnLoad ? '✅ ' + translateText('Проверять каналы') : '🔲 ' + translateText('Проверять каналы');
    checkBtn.onclick = () => {
        checkChannelsOnLoad = !checkChannelsOnLoad;
        localStorage.setItem('checkChannelsOnLoad', checkChannelsOnLoad);
        checkBtn.textContent = checkChannelsOnLoad ? '✅ ' + translateText('Проверять каналы') : '🔲 ' + translateText('Проверять каналы');
        showToast(checkChannelsOnLoad ? translateText("Проверка каналов включена") : translateText("Проверка каналов отключена"));
    };
    mainCategoriesPanel.appendChild(checkBtn);
}

function updateMainCategoryActive() {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    const btns = mainCategoriesPanel.querySelectorAll('.category-btn');
    for (let btn of btns) {
        if (btn.textContent === translateText(currentMainCategory) ||
            (btn.textContent === '🇷🇺' && currentLanguage === 'ru') ||
            (btn.textContent === '🇬🇧' && currentLanguage === 'en') ||
            (btn.id === 'externalPlayerToggle' && openInExternalPlayer) ||
            (btn.textContent.includes('Проверять') && checkChannelsOnLoad)) {
            btn.classList.add('active');
        }
    }
}

function renderSubCategories() {
    if (currentMainCategory === 'Свой плейлист') {
        subCategoriesPanel.innerHTML = '';
        subCategoriesPanel.style.display = 'flex';
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'https://example.com/playlist.m3u';
        input.style.cssText = 'padding:8px 12px; border-radius:6px; border:1px solid #444; background:#222; color:white; flex:1;';
        const btn = document.createElement('button');
        btn.textContent = translateText('Загрузить плейлист');
        btn.style.cssText = 'padding:8px 16px; border-radius:6px; border:none; background:linear-gradient(90deg,#ff375f,#ff5e41); color:white; cursor:pointer;';
        btn.onclick = async () => {
            const url = input.value.trim();
            if (!url) return;
            try {
                const content = await fetchM3U(url);
                const channels = parseM3UContent(content, translateText('Свой плейлист'));
                localStorage.setItem('customPlaylist', JSON.stringify(channels));
                showToast(translateText('Плейлист загружен!'));
                loadAndRenderChannels('Свой плейлист', '');
            } catch(e) { showToast(translateText('Не удалось загрузить плейлист')); }
        };
        subCategoriesPanel.appendChild(input);
        subCategoriesPanel.appendChild(btn);
        return;
    }
    if (currentMainCategory === 'Просмотренные') {
        subCategoriesPanel.innerHTML = '';
        subCategoriesPanel.style.display = 'flex';
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = translateText("Поиск по каналам");
        input.style.cssText = 'padding:8px 12px; border-radius:6px; border:1px solid #444; background:#222; color:white; width:100%;';
        input.oninput = (e) => {
            const query = e.target.value.toLowerCase();
            const watched = JSON.parse(localStorage.getItem('watchedChannels') || '[]');
            renderChannels(watched.filter(ch => ch.name.toLowerCase().includes(query)));
        };
        subCategoriesPanel.appendChild(input);
        return;
    }
    subCategoriesPanel.innerHTML = '';
    if (!categoryTree[currentMainCategory]) return;
    const subcats = Object.keys(categoryTree[currentMainCategory]);
    subcats.forEach((sub, idx) => {
        const btn = document.createElement('button');
        btn.className = 'subcategory-btn';
        btn.textContent = translateText(sub);
        if (sub === currentSubcategory) btn.classList.add('active');
        btn.onclick = () => {
            currentSubcategory = sub;
            loadAndRenderChannels(currentMainCategory, sub);
            updateSubCategoryActive();
        };
        subCategoriesPanel.appendChild(btn);
    });
    if (subcats.length && currentSubcategory) {
        const exportBtn = document.createElement('button');
        exportBtn.className = 'subcategory-btn';
        exportBtn.textContent = '📱 ' + translateText("Открыть все в плейлисте");
        exportBtn.style.background = 'linear-gradient(90deg,#20bf6b,#26de81)';
        exportBtn.style.marginLeft = 'auto';
        exportBtn.onclick = async () => {
            const url = categoryTree[currentMainCategory][currentSubcategory];
            if (url) {
                try {
                    let ch = loadedPlaylists[url];
                    if (!ch) {
                        const content = await fetchM3U(url);
                        ch = parseM3UContent(content, currentSubcategory);
                    }
                    if (ch?.length) openAllInExternalPlayerFunc(ch);
                } catch(e) { showToast(translateText("Ошибка загрузки каналов")); }
            }
        };
        subCategoriesPanel.appendChild(exportBtn);
    }
    if (subcats.length) subCategoriesPanel.style.display = 'flex';
}

function updateSubCategoryActive() {
    document.querySelectorAll('.subcategory-btn').forEach(btn => btn.classList.remove('active'));
    const btns = subCategoriesPanel.querySelectorAll('.subcategory-btn');
    if (btns[currentSubCategoryIndex]) btns[currentSubCategoryIndex].classList.add('active');
}

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('appLanguage', lang);
    renderMainCategories();
    renderSubCategories();
    loadAndRenderChannels(currentMainCategory, currentSubcategory);
    showToast(lang === 'ru' ? "Язык изменён на Русский" : "Language changed to English");
}

// ============= ИНИЦИАЛИЗАЦИЯ =============

function initApp() {
    currentLanguage = localStorage.getItem('appLanguage') || 'ru';
    openInExternalPlayer = localStorage.getItem('openInExternalPlayer') === 'true';
    checkChannelsOnLoad = localStorage.getItem('checkChannelsOnLoad') === 'true';
    
    const safetyTimeout = setTimeout(() => {
        initialLoader.style.display = 'none';
        showToast(translateText("Ошибка инициализации"));
    }, 10000);
    
    try {
        currentMainCategory = 'Просмотренные';
        renderMainCategories();
        renderSubCategories();
        loadAndRenderChannels(currentMainCategory, '');
        setTimeout(() => document.querySelector('.channel-card')?.focus(), 500);
        clearTimeout(safetyTimeout);
    } catch(e) {
        clearTimeout(safetyTimeout);
        initialLoader.style.display = 'none';
        showToast(translateText("Ошибка приложения"));
    }
}

closeModal.addEventListener('click', () => {
    if (videoPlayerElement.hls) { try { videoPlayerElement.hls.destroy(); } catch(e) {} delete videoPlayerElement.hls; }
    videoPlayerElement.pause();
    videoPlayerElement.src = '';
    playerModal.style.display = 'none';
    document.getElementById('externalPlayerModalBtn')?.remove();
    stopAllMiniPlayers();
});

document.addEventListener('keydown', (e) => {
    if (playerModal.style.display === 'flex' && e.key === 'Escape') closeModal.click();
});

window.addEventListener('beforeunload', () => {
    if (window.watchingNowInterval) clearInterval(window.watchingNowInterval);
});

function initMouseWheelScroll() {
    [mainCategoriesPanel, subCategoriesPanel].forEach(container => {
        if (!container) return;
        container.addEventListener('wheel', (e) => {
            if (e.deltaY === 0) return;
            e.preventDefault();
            container.scrollLeft += e.deltaY;
        }, { passive: false });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    initMouseWheelScroll();
});

// Периодическое восстановление мини-плееров
setInterval(() => {
    if (document.visibilityState === 'visible') {
        miniPlayers.forEach((container) => {
            const video = container.querySelector('video');
            const card = container.closest('.channel-card');
            if (video && card && card.contains(document.activeElement) && video.paused && video.hlsInstance) {
                video.play().catch(()=>{});
            }
        });
    }
}, 30000);
