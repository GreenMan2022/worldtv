// ============================================
// World TV - Полный скрипт со всеми функциями
// ============================================

// DOM элементы
const channelsContainer = document.getElementById('channelsContainer');
const mainCategoriesPanel = document.getElementById('mainCategoriesPanel');
const subCategoriesPanel = document.getElementById('subCategoriesPanel');
const playerModal = document.getElementById('playerModal');
const videoPlayerElement = document.getElementById('videoPlayerElement');
const closeModal = document.getElementById('closeModal');
const initialLoader = document.getElementById('initialLoader');
const toastContainer = document.getElementById('toastContainer');

// 👇 Элементы для шаринга
let shareModal = null;
let shareCloseBtn = null;
let currentShareData = null;

// 👇 Firebase: Инициализация
let app, database;
try {
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
    app = firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    console.log("✅ Firebase инициализирован");
} catch (e) {
    console.warn("⚠️ Firebase не загружен, работаем в offline режиме");
}

// 👇 Язык интерфейса
let currentLanguage = localStorage.getItem('appLanguage') || 'ru';

// 👇 Флаг проверки каналов
let checkChannelsOnLoad = localStorage.getItem('checkChannelsOnLoad') === 'true';

// 👇 Словарь переводов
const translations = {
    ru: {
        "Поделиться каналом": "Поделиться каналом",
        "Поделиться": "Поделиться",
        "Ссылка скопирована в буфер обмена!": "Ссылка скопирована в буфер обмена!",
        "Не удалось скопировать ссылку": "Не удалось скопировать ссылку",
        "Добавьте своё сообщение (необязательно)...": "Добавьте своё сообщение (необязательно)...",
        "Проверять каналы": "Проверять каналы",
        "Просмотренные": "Просмотренные",
        "Прямо сейчас": "Прямо сейчас",
        "Популярные": "Популярные",
        "Свой плейлист": "Свой плейлист",
        "Пользовательские плейлисты": "Пользовательские плейлисты",
        "Случайный канал": "Случайный канал",
        "Категории": "Категории",
        "Страны": "Страны",
        "Языки": "Языки",
        "Регионы": "Регионы",
        "Поиск по каналам": "Поиск по каналам",
        "Каналы не найдены": "Каналы не найдены",
        "Загрузка...": "Загрузка...",
        "Ошибка": "Ошибка",
        "Ошибка загрузки": "Ошибка загрузки",
        "Ошибка сохранения": "Ошибка сохранения",
        "Введите ссылку": "Введите ссылку",
        "Загрузить плейлист": "Загрузить плейлист",
        "Плейлист загружен!": "Плейлист загружен!",
        "Не удалось загрузить плейлист": "Не удалось загрузить плейлист",
        "Плейлист не загружен.": "Плейлист не загружен.",
        "Перейдите в подменю и выберите «Загрузить по ссылке»": "Перейдите в подменю и выберите «Загрузить по ссылке»",
        "Загрузка списка плейлистов...": "Загрузка списка плейлистов...",
        "Плейлисты не найдены": "Плейлисты не найдены",
        "Пока никто в мире не смотрит...": "Пока никто в мире не смотрит...",
        "Включите канал на 60+ сек — и вы первым появитесь здесь!": "Включите канал на 60+ сек — и вы первым появитесь здесь!",
        "Прямо сейчас никто не смотрит...": "Прямо сейчас никто не смотрит...",
        "Включите канал — и станьте первым!": "Включите канал — и станьте первым!",
        "Не удалось найти доступный канал": "Не удалось найти доступный канал",
        "Попробуйте позже": "Попробуйте позже",
        "Еще один!": "Еще один!",
    },
    en: {
        "Поделиться каналом": "Share channel",
        "Поделиться": "Share",
        "Ссылка скопирована в буфер обмена!": "Link copied to clipboard!",
        "Не удалось скопировать ссылку": "Failed to copy link",
        "Добавьте своё сообщение (необязательно)...": "Add your message (optional)...",
        "Проверять каналы": "Check Channels",
        "Просмотренные": "Watched",
        "Прямо сейчас": "Watching Now",
        "Популярные": "Popular",
        "Свой плейлист": "Custom Playlist",
        "Пользовательские плейлисты": "User Playlists",
        "Случайный канал": "Random Channel",
        "Категории": "Categories",
        "Страны": "Countries",
        "Языки": "Languages",
        "Регионы": "Regions",
        "Поиск по каналам": "Search channels",
        "Каналы не найдены": "Channels not found",
        "Загрузка...": "Loading...",
        "Ошибка": "Error",
        "Ошибка загрузки": "Loading error",
        "Ошибка сохранения": "Save error",
        "Введите ссылку": "Enter URL",
        "Загрузить плейлист": "Load Playlist",
        "Плейлист загружен!": "Playlist loaded!",
        "Не удалось загрузить плейлист": "Failed to load playlist",
        "Плейлист не загружен.": "Playlist is not loaded.",
        "Перейдите в подменю и выберите «Загручить по ссылке»": "Go to submenu and select 'Load from URL'",
        "Загрузка списка плейлистов...": "Loading playlists...",
        "Плейлисты не найдены": "Playlists not found",
        "Пока никто в мире не смотрит...": "No one in the world is watching yet...",
        "Включите канал на 60+ сек — и вы первым появитесь здесь!": "Turn on a channel for 60+ sec to be the first one here!",
        "Прямо сейчас никто не смотрит...": "No one is watching right now...",
        "Включите канал — и станьте первым!": "Turn on a channel to be the first!",
        "Не удалось найти доступный канал": "Failed to find an available channel",
        "Попробуйте позже": "Please try again later",
        "Еще один!": "Another one!",
    }
};

// Функция перевода
function translateText(key) {
    return translations[currentLanguage][key] || key;
}

// Глобальные переменные
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

// 👇 Просмотренные
let currentWatchedChannel = null;
let watchStartTime = null;

// 👇 Для "Популярные"
let watchingBySubcategory = null;

// 👇 Для "Случайный канал"
let cachedGlobalPlaylist = null;

// 👇 Интервалы
let watchingNowInterval = null;

// 👇 Дерево категорий
const categoryTree = {
    "Просмотренные": {},
    "Прямо сейчас": {},
    "Популярные": {},
    "Свой плейлист": {},
    "Пользовательские плейлисты": {},
    "Случайный канал": {},
    "Категории": {
        "Новости": "https://iptv-org.github.io/iptv/categories/news.m3u",
        "Спорт": "https://iptv-org.github.io/iptv/categories/sports.m3u",
        "Музыка": "https://iptv-org.github.io/iptv/categories/music.m3u",
        "Кино": "https://iptv-org.github.io/iptv/categories/movies.m3u",
        "Детские": "https://iptv-org.github.io/iptv/categories/kids.m3u",
    },
    "Страны": {
        "Россия": "https://iptv-org.github.io/iptv/countries/ru.m3u",
        "США": "https://iptv-org.github.io/iptv/countries/us.m3u",
        "Великобритания": "https://iptv-org.github.io/iptv/countries/uk.m3u",
    },
    "Языки": {
        "Русский": "https://iptv-org.github.io/iptv/languages/rus.m3u",
        "Английский": "https://iptv-org.github.io/iptv/languages/eng.m3u",
    },
    "Регионы": {
        "Европа": "https://iptv-org.github.io/iptv/regions/eur.m3u",
        "Азия": "https://iptv-org.github.io/iptv/regions/asia.m3u",
    }
};

// ============================================
// ФУНКЦИОНАЛ ШАРИНГА КАНАЛОВ
// ============================================

// Инициализация модального окна шаринга
function initShareModal() {
    shareModal = document.getElementById('shareModal');
    shareCloseBtn = document.getElementById('shareCloseBtn');
    
    if (!shareModal || !shareCloseBtn) {
        console.warn('Элементы шаринга не найдены');
        return;
    }
    
    shareCloseBtn.addEventListener('click', () => {
        shareModal.style.display = 'none';
        currentShareData = null;
    });
    
    shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            shareModal.style.display = 'none';
            currentShareData = null;
        }
    });
    
    const socialButtons = shareModal.querySelectorAll('[data-platform]');
    socialButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const platform = btn.getAttribute('data-platform');
            shareChannel(platform);
        });
    });
    
    document.addEventListener('keydown', (e) => {
        if (shareModal.style.display === 'flex' && e.key === 'Escape') {
            shareModal.style.display = 'none';
            currentShareData = null;
        }
    });
}

// Веб-шаринг API (если поддерживается браузером)
function initWebShareAPI() {
    // Проверяем поддержку Web Share API
    if (navigator.share) {
        console.log('Web Share API поддерживается');
        // Можно добавить кнопку нативного шаринга в будущем
    }
}

// Открытие модального окна шаринга
function openShareModal(channel) {
    if (!shareModal) {
        console.error('Модальное окно шаринга не инициализировано');
        return;
    }
    
    currentShareData = {
        name: channel.name,
        url: channel.url,
        group: channel.group,
        logo: channel.logo || '',
        pageUrl: window.location.href.split('?')[0]
    };
    
    const channelInfo = document.getElementById('shareChannelInfo');
    if (channelInfo) {
        channelInfo.innerHTML = `
            <strong>${channel.name}</strong>
            ${channel.group ? `<div>Категория: ${channel.group}</div>` : ''}
            <div style="margin-top: 5px; font-size: 12px; color: #888;">
                ${translateText('Поделиться каналом')}
            </div>
        `;
    }
    
    const messageInput = document.getElementById('shareCustomMessage');
    if (messageInput) {
        messageInput.value = '';
        messageInput.placeholder = translateText('Добавьте своё сообщение (необязательно)...');
    }
    
    shareModal.style.display = 'flex';
    
    setTimeout(() => {
        if (messageInput) messageInput.focus();
    }, 100);
}

// Генерация текста для шаринга
function generateShareText(platform, channelData, customMessage = '') {
    const channelName = channelData.name;
    const channelGroup = channelData.group ? ` (${channelData.group})` : '';
    const pageUrl = channelData.pageUrl;
    
    let baseMessage = `Смотрите ${channelName}${channelGroup} на World TV!`;
    
    if (customMessage.trim()) {
        baseMessage = `${customMessage}\n\n${baseMessage}`;
    }
    
    switch(platform) {
        case 'twitter':
            const maxLength = 280 - pageUrl.length - 5;
            if (baseMessage.length > maxLength) {
                baseMessage = baseMessage.substring(0, maxLength - 3) + '...';
            }
            return `${baseMessage} ${pageUrl}`;
            
        case 'whatsapp':
            return `${baseMessage}\n\n${pageUrl}`;
            
        case 'telegram':
        case 'vk':
        case 'facebook':
        case 'reddit':
        case 'linkedin':
        case 'pinterest':
            return `${baseMessage}\n\nСсылка: ${pageUrl}`;
            
        case 'copy':
        default:
            return `${baseMessage}\n\nСсылка на канал: ${pageUrl}`;
    }
}

// Генерация URL для шаринга
function generateShareUrl(platform, text) {
    const encodedText = encodeURIComponent(text);
    
    switch(platform) {
        case 'telegram': return `https://t.me/share/url?url=${encodedText}`;
        case 'whatsapp': return `https://api.whatsapp.com/send?text=${encodedText}`;
        case 'vk': return `https://vk.com/share.php?url=${encodeURIComponent(window.location.href)}&title=${encodedText}`;
        case 'twitter': return `https://twitter.com/intent/tweet?text=${encodedText}`;
        case 'facebook': return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodedText}`;
        case 'reddit': return `https://www.reddit.com/submit?url=${encodeURIComponent(window.location.href)}&title=${encodedText}`;
        case 'linkedin': return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
        case 'pinterest': return `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&description=${encodedText}`;
        default: return '';
    }
}

// Основная функция шаринга
function shareChannel(platform) {
    if (!currentShareData) {
        showToast(translateText('Ошибка'));
        return;
    }
    
    const customMessage = document.getElementById('shareCustomMessage')?.value || '';
    const shareText = generateShareText(platform, currentShareData, customMessage);
    
    if (platform === 'copy') {
        navigator.clipboard.writeText(shareText).then(() => {
            showToast(translateText('Ссылка скопирована в буфер обмена!'));
            shareModal.style.display = 'none';
            currentShareData = null;
        }).catch(err => {
            console.error('Ошибка копирования:', err);
            showToast(translateText('Не удалось скопировать ссылку'));
        });
        return;
    }
    
    const shareUrl = generateShareUrl(platform, shareText);
    
    if (shareUrl) {
        const width = 600;
        const height = 500;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        
        window.open(shareUrl, 'shareWindow', `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`);
        
        setTimeout(() => {
            shareModal.style.display = 'none';
            currentShareData = null;
        }, 300);
    } else {
        showToast(translateText('Не удалось создать ссылку для шаринга'));
    }
}

// Функция для нативного шаринга
function nativeShare(channel) {
    if (!navigator.share) {
        openShareModal(channel);
        return;
    }
    
    const shareData = {
        title: `World TV: ${channel.name}`,
        text: `Смотрите ${channel.name} на World TV! ${channel.group ? `Категория: ${channel.group}` : ''}`,
        url: window.location.href.split('?')[0]
    };
    
    navigator.share(shareData)
        .then(() => console.log('Успешный шаринг'))
        .catch(error => {
            console.log('Ошибка шаринга:', error);
            openShareModal(channel);
        });
}

// ============================================
// ОСНОВНЫЕ ФУНКЦИИ
// ============================================

// Показать уведомление
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Закрытие модального окна плеера
closeModal.addEventListener('click', function() {
    playerModal.style.display = 'none';
    videoPlayerElement.pause();
    videoPlayerElement.src = '';
    if (videoPlayerElement.hls) {
        videoPlayerElement.hls.destroy();
        delete videoPlayerElement.hls;
    }
    stopAllMiniPlayers();
    
    if (currentWatchedChannel && watchStartTime) {
        const watchedSeconds = Math.floor((Date.now() - watchStartTime) / 1000);
        if (watchedSeconds >= 60) {
            addToWatched(
                currentWatchedChannel.name,
                currentWatchedChannel.url,
                currentWatchedChannel.group,
                currentWatchedChannel.logo
            );
            addToPopular(
                currentWatchedChannel.name,
                currentWatchedChannel.url,
                currentWatchedChannel.group,
                currentWatchedChannel.logo
            );
        }
        currentWatchedChannel = null;
        watchStartTime = null;
    }
});

// 👇 Добавление в просмотренные
function addToWatched(name, url, group, logo) {
    let watched;
    try {
        const raw = localStorage.getItem('watchedChannels');
        watched = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(watched)) watched = [];
    } catch (e) {
        watched = [];
    }
    
    if (watched.some(item => item.url === url)) return;
    
    watched.push({ name, url, group, logo });
    try {
        localStorage.setItem('watchedChannels', JSON.stringify(watched));
    } catch (e) {
        showToast(translateText('Ошибка сохранения'));
    }
    
    if (currentMainCategory === 'Просмотренные') {
        loadAndRenderChannels('Просмотренные', '');
    }
}

// 👇 Добавление в глобальный "Популярные"
async function addToPopular(name, url, group, logo) {
    if (!database) {
        console.warn('Firebase не доступен');
        return;
    }
    
    try {
        const key = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
        const snapshot = await database.ref('popular/' + key).get();
        let data = snapshot.exists() ? snapshot.val() : {
            name,
            url,
            group,
            logo,
            views: 0,
            createdAt: Date.now()
        };
        data.views = (data.views || 0) + 1;
        data.name = name;
        data.logo = logo;
        await database.ref('popular/' + key).set(data);
    } catch (error) {
        console.error("❌ Ошибка Firebase addToPopular:", error);
    }
}

// 👇 Добавление/обновление в "Прямо сейчас"
async function updateWatchingNow(name, url, group, logo) {
    if (!database) {
        console.warn('Firebase не доступен');
        return;
    }
    
    try {
        const key = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
        const now = Date.now();
        await database.ref('watching/' + key).set({
            name,
            url,
            group,
            logo,
            lastWatched: now
        });
    } catch (error) {
        console.error("❌ Ошибка Firebase updateWatchingNow:", error);
    }
}

// 👇 Загрузка плейлиста по URL
async function loadPlaylistFromURL() {
    const urlInput = document.getElementById('playlistURL');
    const url = urlInput.value.trim();
    if (!url) {
        showToast(translateText('Введите ссылку'));
        urlInput.focus();
        return;
    }
    
    initialLoader.style.display = 'flex';
    try {
        const content = await fetchM3U(url);
        const channels = parseM3UContent(content, translateText('Свой плейлист'));
        if (channels.length === 0) {
            throw new Error('Плейлист пуст');
        }
        
        localStorage.setItem('customPlaylist', JSON.stringify(channels));
        showToast(translateText('Плейлист загружен!'));
        renderChannels(channels);
        
        setTimeout(() => {
            const firstChannel = document.querySelector('.channel-card');
            if (firstChannel) firstChannel.focus();
            navigationState = 'channels';
        }, 100);
    } catch (err) {
        console.error('Ошибка загрузки по URL:', err);
        showToast(translateText('Не удалось загрузить плейлист'));
    } finally {
        initialLoader.style.display = 'none';
    }
}

// 👇 Добавление плейлиста в Firebase
async function addToPublicPlaylists(url, name, channelCount) {
    if (!database) {
        console.warn('Firebase не доступен');
        return;
    }
    
    try {
        const key = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
        const now = Date.now();
        const snapshot = await database.ref('publicPlaylists/' + key).get();
        if (snapshot.exists()) {
            showToast(translateText('Плейлист уже существует в коллекции.'));
            return;
        }
        await database.ref('publicPlaylists/' + key).set({
            name: name,
            url: url,
            channelCount: channelCount,
            addedAt: now,
            addedBy: 'anonymous'
        });
        showToast(translateText('Плейлист успешно добавлен в общую коллекцию!'));
    } catch (error) {
        console.error("❌ Ошибка при добавлении плейлиста в коллекцию:", error);
        showToast(translateText('Ошибка при добавлении плейлиста в коллекцию'));
    }
}

// 👇 Отображаем кастомное подменю для "Свой плейлист"
function renderCustomPlaylistSubmenu() {
    subCategoriesPanel.innerHTML = '';
    subCategoriesPanel.style.display = 'flex';
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.gap = '10px';
    wrapper.style.alignItems = 'center';
    wrapper.style.padding = '0 10px';
    wrapper.style.width = '100%';
    
    const input = document.createElement('input');
    input.id = 'playlistURL';
    input.type = 'text';
    input.placeholder = 'https://example.com/playlist.m3u';
    input.style.flex = '1';
    input.style.padding = '8px 12px';
    input.style.borderRadius = '6px';
    input.style.border = '1px solid #444';
    input.style.background = '#222';
    input.style.color = 'white';
    input.style.fontSize = '13px';
    input.setAttribute('tabindex', '0');
    
    const button = document.createElement('button');
    button.textContent = translateText('Загрузить плейлист');
    button.style.padding = '8px 16px';
    button.style.borderRadius = '6px';
    button.style.border = 'none';
    button.style.background = 'linear-gradient(90deg, #ff375f, #ff5e41)';
    button.style.color = 'white';
    button.style.cursor = 'pointer';
    button.style.fontSize = '13px';
    button.setAttribute('tabindex', '0');
    
    button.addEventListener('click', loadPlaylistFromURL);
    button.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
    });
    
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            loadPlaylistFromURL();
        }
    });
    
    wrapper.appendChild(input);
    wrapper.appendChild(button);
    subCategoriesPanel.appendChild(wrapper);
    
    setTimeout(() => {
        input.focus();
        navigationState = 'customInput';
    }, 100);
}

// 👇 Подменю для "Просмотренные" с поиском
function renderWatchedSubmenu() {
    subCategoriesPanel.innerHTML = '';
    subCategoriesPanel.style.display = 'flex';
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.gap = '10px';
    wrapper.style.alignItems = 'center';
    wrapper.style.padding = '0 10px';
    wrapper.style.width = '100%';

    const input = document.createElement('input');
    input.id = 'watchedSearchInput';
    input.type = 'text';
    input.placeholder = translateText("Поиск по каналам");
    input.style.flex = '1';
    input.style.padding = '8px 12px';
    input.style.borderRadius = '6px';
    input.style.border = '1px solid #444';
    input.style.background = '#222';
    input.style.color = 'white';
    input.style.fontSize = '13px';
    input.setAttribute('tabindex', '0');

    const button = document.createElement('button');
    button.textContent = '🔍';
    button.style.padding = '8px 12px';
    button.style.borderRadius = '6px';
    button.style.border = 'none';
    button.style.background = 'linear-gradient(90deg, #3a86ff, #4cc9f0)';
    button.style.color = 'white';
    button.style.cursor = 'pointer';
    button.style.fontSize = '13px';
    button.setAttribute('tabindex', '0');

    button.addEventListener('click', performWatchedSearch);
    button.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
    });

    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performWatchedSearch();
        }
    });

    wrapper.appendChild(input);
    wrapper.appendChild(button);
    subCategoriesPanel.appendChild(wrapper);

    setTimeout(() => {
        input.focus();
        navigationState = 'watchedInput';
    }, 100);
}

// 👇 Поиск по просмотренным каналам
async function performWatchedSearch() {
    const input = document.getElementById('watchedSearchInput');
    const query = input.value.trim().toLowerCase();
    if (!query) {
        loadAndRenderChannels('Просмотренные', '');
        return;
    }

    initialLoader.style.display = 'none';
    channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Поиск...")}</div>`;
    
    let allResults = [];
    const seen = new Set();

    const allUrls = [];
    for (const mainCat in categoryTree) {
        const subCatMap = categoryTree[mainCat];
        if (typeof subCatMap === 'object' && subCatMap !== null) {
            for (const url of Object.values(subCatMap)) {
                if (typeof url === 'string' && url.endsWith('.m3u')) {
                    allUrls.push({ url, group: mainCat });
                }
            }
        }
    }

    const updateResults = (newChannels) => {
        const filtered = newChannels.filter(ch => {
            if (seen.has(ch.url)) return false;
            const matches = ch.name.toLowerCase().includes(query) ||
                           (ch.group && ch.group.toLowerCase().includes(query));
            if (matches) seen.add(ch.url);
            return matches;
        });

        if (filtered.length === 0) return;

        allResults.push(...filtered);
        renderChannels(allResults);
    };

    const CONCURRENT_LIMIT = 5;
    for (let i = 0; i < allUrls.length; i += CONCURRENT_LIMIT) {
        const batch = allUrls.slice(i, i + CONCURRENT_LIMIT);
        await Promise.allSettled(
            batch.map(async (item) => {
                if (loadedPlaylists[item.url]) {
                    updateResults(loadedPlaylists[item.url]);
                    return;
                }
                try {
                    const content = await fetchM3U(item.url);
                    const parsed = parseM3UContent(content, item.group);
                    loadedPlaylists[item.url] = parsed;
                    updateResults(parsed);
                } catch (err) {
                    loadedPlaylists[item.url] = [];
                }
            })
        );
    }

    if (allResults.length === 0) {
        channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Каналы не найдены")}</div>`;
    }
}

// 👇 Установка языка
function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('appLanguage', lang);
    const flags = mainCategoriesPanel.querySelectorAll('.category-btn');
    flags.forEach(flag => {
        if (flag.textContent === '🇷🇺') {
            flag.classList.toggle('active', lang === 'ru');
        } else if (flag.textContent === '🇬🇧') {
            flag.classList.toggle('active', lang === 'en');
        }
    });
    renderMainCategories();
    renderSubCategories();
    loadAndRenderChannels(currentMainCategory, currentSubcategory);
    showToast(lang === 'ru' ? "Язык изменён на Русский" : "Language changed to English");
}

// 👇 Переключение флага проверки каналов
function toggleChannelCheck() {
    checkChannelsOnLoad = !checkChannelsOnLoad;
    localStorage.setItem('checkChannelsOnLoad', checkChannelsOnLoad);
    const flags = mainCategoriesPanel.querySelectorAll('.category-btn');
    flags.forEach(flag => {
        if (flag.textContent.includes(translateText('Проверять каналы'))) {
            flag.textContent = checkChannelsOnLoad ? '✅ ' + translateText('Проверять каналы') : '🔲 ' + translateText('Проверять каналы');
            flag.classList.toggle('active', checkChannelsOnLoad);
        }
    });
    showToast(checkChannelsOnLoad ? 
        "Проверка каналов включена" : 
        "Проверка каналов отключена"
    );
}

// Отображение главных категорий + флаги языка
function renderMainCategories() {
    mainCategoriesPanel.innerHTML = '';
    const mainCategories = Object.keys(categoryTree);
    mainCategories.forEach((cat, index) => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = translateText(cat);
        if (cat === currentMainCategory) {
            btn.classList.add('active');
            currentMainCategoryIndex = index;
        }
        btn.addEventListener('click', () => selectMainCategory(cat, index));
        btn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
        mainCategoriesPanel.appendChild(btn);
    });
    
    const spacer = document.createElement('div');
    spacer.style.width = '20px';
    mainCategoriesPanel.appendChild(spacer);
    
    const ruFlag = document.createElement('button');
    ruFlag.className = 'category-btn';
    ruFlag.textContent = '🇷🇺';
    ruFlag.style.minWidth = '40px';
    ruFlag.style.padding = '8px';
    if (currentLanguage === 'ru') ruFlag.classList.add('active');
    ruFlag.addEventListener('click', () => setLanguage('ru'));
    mainCategoriesPanel.appendChild(ruFlag);
    
    const enFlag = document.createElement('button');
    enFlag.className = 'category-btn';
    enFlag.textContent = '🇬🇧';
    enFlag.style.minWidth = '40px';
    enFlag.style.padding = '8px';
    if (currentLanguage === 'en') enFlag.classList.add('active');
    enFlag.addEventListener('click', () => setLanguage('en'));
    mainCategoriesPanel.appendChild(enFlag);
    
    const spacer2 = document.createElement('div');
    spacer2.style.width = '20px';
    mainCategoriesPanel.appendChild(spacer2);
    
    const checkFlag = document.createElement('button');
    checkFlag.className = 'category-btn';
    checkFlag.textContent = checkChannelsOnLoad ? '✅ ' + translateText('Проверять каналы') : '🔲 ' + translateText('Проверять каналы');
    checkFlag.style.minWidth = '140px';
    checkFlag.style.padding = '8px';
    checkFlag.style.fontSize = '12px';
    if (checkChannelsOnLoad) checkFlag.classList.add('active');
    checkFlag.addEventListener('click', toggleChannelCheck);
    mainCategoriesPanel.appendChild(checkFlag);
}

// Отображение подкатегорий
function renderSubCategories() {
    subCategoriesPanel.innerHTML = '';
    
    if (currentMainCategory === 'Свой плейлист') {
        renderCustomPlaylistSubmenu();
        return;
    }
    if (currentMainCategory === 'Просмотренные') {
        renderWatchedSubmenu();
        return;
    }
    if (currentMainCategory === 'Пользовательские плейлисты') {
        subCategoriesPanel.innerHTML = '';
        subCategoriesPanel.style.display = 'flex';
        subCategoriesPanel.innerHTML = `<div style="color:#aaa; padding:20px; text-align:center">${translateText("Загрузка списка плейлистов...")}</div>`;
        loadAndRenderPublicPlaylists();
        return;
    }
    if (currentMainCategory === 'Случайный канал') {
        subCategoriesPanel.innerHTML = '';
        subCategoriesPanel.style.display = 'flex';
        const btn = document.createElement('button');
        btn.className = 'subcategory-btn';
        btn.textContent = '🎲 ' + translateText("Еще один!");
        btn.addEventListener('click', () => loadRandomChannel());
        subCategoriesPanel.appendChild(btn);
        return;
    }
    
    subCategoriesPanel.innerHTML = '';
    subCategoriesPanel.style.display = 'none';
    if (!categoryTree[currentMainCategory]) return;
    
    const subcategories = Object.keys(categoryTree[currentMainCategory]);
    subcategories.forEach((subcat, index) => {
        const btn = document.createElement('button');
        btn.className = 'subcategory-btn';
        btn.textContent = translateText(subcat);
        if (subcat === currentSubcategory) {
            btn.classList.add('active');
            currentSubCategoryIndex = index;
        }
        btn.addEventListener('click', () => selectSubcategory(subcat, index));
        subCategoriesPanel.appendChild(btn);
    });
    
    if (subcategories.length > 0) {
        subCategoriesPanel.style.display = 'flex';
    }
}

// 👇 Загрузка и отображение списка публичных плейлистов
async function loadAndRenderPublicPlaylists() {
    if (!database) {
        subCategoriesPanel.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">Firebase не доступен</div>`;
        return;
    }
    
    try {
        const snapshot = await database.ref('publicPlaylists').get();
        let publicPlaylists = [];
        if (snapshot.exists()) {
            publicPlaylists = Object.values(snapshot.val());
            publicPlaylists.sort((a, b) => b.addedAt - a.addedAt);
        }
        subCategoriesPanel.innerHTML = '';
        if (publicPlaylists.length === 0) {
            subCategoriesPanel.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Плейлисты не найдены")}</div>`;
            return;
        }
        publicPlaylists.forEach((playlist, index) => {
            const btn = document.createElement('button');
            btn.className = 'subcategory-btn';
            btn.innerHTML = `<strong>${playlist.name}</strong><br><small>${playlist.channelCount || 0} каналов</small>`;
            btn.title = JSON.stringify(playlist);
            btn.style.textAlign = 'left';
            btn.style.justifyContent = 'flex-start';
            btn.style.padding = '12px 16px';
            if (currentSubcategory === playlist.name) {
                btn.classList.add('active');
                currentSubCategoryIndex = index;
            }
            btn.addEventListener('click', () => selectPublicPlaylist(playlist, index));
            subCategoriesPanel.appendChild(btn);
        });
    } catch (error) {
        console.error("❌ Ошибка загрузки публичных плейлистов:", error);
        subCategoriesPanel.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Ошибка загрузки")}</div>`;
    }
}

// 👇 Выбор публичного плейлиста для загрузки
async function selectPublicPlaylist(playlist, index) {
    currentSubcategory = playlist.name;
    currentSubCategoryIndex = index;
    loadAndRenderChannels('Пользовательские плейлисты', playlist.name);
}

// 👇 Загрузка и кэширование плейлиста с опциональной проверкой каналов
async function fetchAndCachePlaylist(url, group) {
    const content = await fetchM3U(url);
    let channels = parseM3UContent(content, group);
    if (!checkChannelsOnLoad || channels.length === 0) {
        loadedPlaylists[url] = channels;
        renderChannels(channels);
        return channels;
    }
    
    initialLoader.style.display = 'flex';
    initialLoader.innerHTML = `
        <div style="text-align:center; color:white;">
            <div>${translateText("Проверка доступности...")}</div>
            <div id="checkProgress" style="margin-top:10px;">0/${channels.length}</div>
        </div>
    `;
    
    const progressElement = document.getElementById('checkProgress');
    let availableChannels = [];
    let checkedCount = 0;
    
    const updateDisplay = () => {
        loadedPlaylists[url] = [...availableChannels];
        renderChannels([...availableChannels]);
        if (progressElement) {
            progressElement.textContent = `${checkedCount}/${channels.length}`;
        }
    };
    
    // Проверяем каналы
    for (const channel of channels) {
        try {
            const isAvailable = await checkChannelAvailability(channel.url);
            checkedCount++;
            if (isAvailable) {
                availableChannels.push(channel);
            } else {
                addToBlacklist(channel.url);
            }
            updateDisplay();
        } catch (error) {
            checkedCount++;
            updateDisplay();
        }
    }
    
    initialLoader.style.display = 'none';
    loadedPlaylists[url] = [...availableChannels];
    renderChannels([...availableChannels]);
    return availableChannels;
}

// Выбор главной категории
function selectMainCategory(categoryName, index) {
    if (currentMainCategory === 'Популярные') {
        watchingBySubcategory = null;
    }
    if (currentMainCategory === 'Прямо сейчас' && watchingNowInterval) {
        clearInterval(watchingNowInterval);
        watchingNowInterval = null;
    }
    
    currentMainCategory = categoryName;
    currentMainCategoryIndex = index;
    currentSubcategory = '';
    currentSubCategoryIndex = 0;
    
    renderSubCategories();
    
    if (categoryName === 'Свой плейлист') {
        loadAndRenderChannels('Свой плейлист', '');
        navigationState = 'customInput';
    } else if (categoryName === 'Популярные' || categoryName === 'Прямо сейчас') {
        loadAndRenderChannels(categoryName, '');
    } else if (categoryName === 'Пользовательские плейлисты') {
        // Уже обрабатывается в renderSubCategories
    } else if (categoryName === 'Случайный канал') {
        loadRandomChannel();
    } else if (!categoryTree[categoryName] || Object.keys(categoryTree[categoryName]).length === 0) {
        loadAndRenderChannels(currentMainCategory, currentSubcategory);
    }
    
    setTimeout(() => {
        const buttons = mainCategoriesPanel.querySelectorAll('.category-btn');
        if (buttons[index]) buttons[index].focus();
    }, 100);
}

// 👇 Выбор подкатегории
function selectSubcategory(subcategoryName, index) {
    if (currentMainCategory === 'Прямо сейчас' && watchingNowInterval) {
        clearInterval(watchingNowInterval);
        watchingNowInterval = null;
    }
    
    currentSubcategory = subcategoryName;
    currentSubCategoryIndex = index;
    
    if (currentMainCategory === 'Популярные' && watchingBySubcategory) {
        const channelsToShow = watchingBySubcategory[subcategoryName] || [];
        renderChannels(channelsToShow);
    } else {
        loadAndRenderChannels(currentMainCategory, currentSubcategory);
    }
    
    setTimeout(() => {
        const firstChannel = document.querySelector('.channel-card');
        if (firstChannel) firstChannel.focus();
        navigationState = 'channels';
    }, 100);
}

// Загрузка и отображение каналов
async function loadAndRenderChannels(mainCategory, subcategory) {
    if (mainCategory === 'Прямо сейчас' && watchingNowInterval) {
        clearInterval(watchingNowInterval);
        watchingNowInterval = null;
    }
    
    if (mainCategory === 'Просмотренные') {
        initialLoader.style.display = 'none';
        let watched;
        try {
            const raw = localStorage.getItem('watchedChannels');
            watched = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(watched)) watched = [];
        } catch (e) {
            watched = [];
        }
        renderChannels(watched);
        return;
    }
    
    if (mainCategory === 'Прямо сейчас') {
        initialLoader.style.display = 'none';
        channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Загрузка...")}</div>`;
        
        const loadWatchingNow = async () => {
            try {
                const snapshot = await database.ref('watching').get();
                let watchingNow = [];
                if (snapshot.exists()) {
                    const now = Date.now();
                    watchingNow = Object.values(snapshot.val()).filter(channel => {
                        return (now - channel.lastWatched) < 600000;
                    });
                    watchingNow.sort((a, b) => b.lastWatched - a.lastWatched);
                }
                renderChannels(watchingNow);
                if (watchingNow.length === 0) {
                    channelsContainer.innerHTML = `
                        <div style="color:#aaa; padding:60px 20px; text-align:center; font-size:16px;">
                            <i class="fas fa-bolt" style="font-size:48px; margin-bottom:20px;"></i><br>
                            ${translateText("Прямо сейчас никто не смотрит...")}<br>
                            ${translateText("Включите канал — и станьте первым!")}
                        </div>`;
                }
            } catch (error) {
                console.error("❌ Ошибка загрузки 'Прямо сейчас':", error);
                channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Ошибка загрузки")}</div>`;
            }
        };
        
        await loadWatchingNow();
        if (watchingNowInterval) clearInterval(watchingNowInterval);
        watchingNowInterval = setInterval(loadWatchingNow, 10000);
        return;
    }
    
    if (mainCategory === 'Популярные') {
        initialLoader.style.display = 'flex';
        channelsContainer.innerHTML = '';
        
        if (!database) {
            channelsContainer.innerHTML = `
                <div style="color:#aaa; padding:60px 20px; text-align:center; font-size:16px;">
                    <i class="fas fa-users" style="font-size:48px; margin-bottom:20px;"></i><br>
                    ${translateText("Пока никто в мире не смотрит...")}<br>
                    ${translateText("Включите канал на 60+ сек — и вы первым появитесь здесь!")}
                </div>`;
            initialLoader.style.display = 'none';
            return;
        }
        
        try {
            const snapshot = await database.ref('popular').get();
            let popular = [];
            if (snapshot.exists()) {
                popular = Object.values(snapshot.val());
                popular.sort((a, b) => b.views - a.views);
            }
            
            const subcategoryMap = {};
            popular.forEach(channel => {
                const group = channel.group || translateText('Не определено');
                if (!subcategoryMap[group]) {
                    subcategoryMap[group] = [];
                }
                subcategoryMap[group].push(channel);
            });
            
            watchingBySubcategory = subcategoryMap;
            
            if (currentSubcategory) {
                renderChannels(subcategoryMap[currentSubcategory] || []);
            } else {
                renderChannels(popular);
            }
            
            // Создаем подкатегории для популярных
            const sortedSubcategories = Object.keys(subcategoryMap).sort();
            subCategoriesPanel.innerHTML = '';
            subCategoriesPanel.style.display = 'none';
            
            sortedSubcategories.forEach((subcat, idx) => {
                const btn = document.createElement('button');
                btn.className = 'subcategory-btn';
                btn.textContent = `${subcat} (${subcategoryMap[subcat].length})`;
                if (subcat === currentSubcategory) {
                    btn.classList.add('active');
                    currentSubCategoryIndex = idx;
                }
                btn.addEventListener('click', () => selectSubcategory(subcat, idx));
                subCategoriesPanel.appendChild(btn);
            });
            
            if (sortedSubcategories.length > 0) {
                subCategoriesPanel.style.display = 'flex';
            }
            
            if (popular.length === 0) {
                channelsContainer.innerHTML = `
                    <div style="color:#aaa; padding:60px 20px; text-align:center; font-size:16px;">
                        <i class="fas fa-users" style="font-size:48px; margin-bottom:20px;"></i><br>
                        ${translateText("Пока никто в мире не смотрит...")}<br>
                        ${translateText("Включите канал на 60+ сек — и вы первым появитесь здесь!")}
                    </div>`;
            }
        } catch (error) {
            console.error("❌ Ошибка загрузки из Firebase:", error);
            showToast(translateText("Ошибка загрузки рейтинга"));
            channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Не удалось загрузить")}</div>`;
        } finally {
            initialLoader.style.display = 'none';
            setTimeout(() => {
                const firstChannel = document.querySelector('.channel-card');
                if (firstChannel) firstChannel.focus();
            }, 100);
        }
        return;
    }
    
    if (mainCategory === 'Свой плейлист') {
        initialLoader.style.display = 'none';
        let customPlaylist;
        try {
            const raw = localStorage.getItem('customPlaylist');
            customPlaylist = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(customPlaylist)) customPlaylist = [];
        } catch (e) {
            customPlaylist = [];
        }
        renderChannels(customPlaylist);
        if (customPlaylist.length === 0) {
            channelsContainer.innerHTML = `
                <div style="color:#aaa; padding:60px 20px; text-align:center; font-size:16px;">
                    <i class="fas fa-list" style="font-size:48px; margin-bottom:20px;"></i><br>
                    ${translateText("Плейлист не загружен.")}<br>
                    ${translateText("Перейдите в подменю и выберите «Загрузить по ссылке»")}
                </div>`;
        }
        return;
    }
    
    if (mainCategory === 'Пользовательские плейлисты') {
        initialLoader.style.display = 'flex';
        channelsContainer.innerHTML = '';
        
        if (!database) {
            channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">Firebase не доступен</div>`;
            initialLoader.style.display = 'none';
            return;
        }
        
        try {
            const snapshot = await database.ref('publicPlaylists').get();
            if (snapshot.exists()) {
                const playlistData = Object.values(snapshot.val()).find(pl => pl.name === subcategory);
                if (playlistData) {
                    const url = playlistData.url;
                    if (!loadedPlaylists[url]) {
                        const content = await fetchM3U(url);
                        const parsed = parseM3UContent(content, playlistData.name);
                        loadedPlaylists[url] = parsed;
                    }
                    const channels = loadedPlaylists[url] || [];
                    renderChannels(channels);
                } else {
                    throw new Error('Плейлист не найден');
                }
            } else {
                throw new Error('Нет публичных плейлистов');
            }
        } catch (error) {
            console.error("❌ Ошибка загрузки публичного плейлиста:", error);
            showToast(translateText("Не удалось загрузить плейлист"));
            channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Плейлист не найден")}</div>`;
        } finally {
            initialLoader.style.display = 'none';
            setTimeout(() => {
                const firstChannel = document.querySelector('.channel-card');
                if (firstChannel) firstChannel.focus();
            }, 100);
        }
        return;
    }
    
    if (mainCategory === 'Случайный канал') {
        loadRandomChannel();
        return;
    }
    
    if (!categoryTree[mainCategory] || !categoryTree[mainCategory][subcategory]) {
        renderChannels([]);
        initialLoader.style.display = 'none';
        return;
    }
    
    const url = categoryTree[mainCategory][subcategory];
    initialLoader.style.display = 'flex';
    
    try {
        let channels = loadedPlaylists[url] || await fetchAndCachePlaylist(url, subcategory);
        renderChannels(channels);
    } catch (error) {
        console.error("Ошибка загрузки плейлиста:", error);
        showToast(translateText("Ошибка загрузки"));
        renderChannels([]);
    } finally {
        initialLoader.style.display = 'none';
        
        setTimeout(() => {
            const firstChannel = document.querySelector('.channel-card');
            if (firstChannel) firstChannel.focus();
        }, 100);
    }
}

// Загрузка M3U
async function fetchM3U(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
}

// Парсинг M3U с поддержкой tvg-group-title
function parseM3UContent(content, assignedCategory) {
    const channels = [];
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#EXTINF:')) {
            const infoLine = lines[i];
            const urlLine = lines[i + 1];
            if (urlLine && !urlLine.startsWith('#')) {
                let name = infoLine.split(',')[1] || 'Канал';
                name = name.trim();
                const logoMatch = infoLine.match(/tvg-logo="([^"]*)"/);
                const logo = logoMatch ? logoMatch[1] : '';
                let group = assignedCategory;
                const groupMatch = infoLine.match(/tvg-group-title="([^"]*)"/);
                if (groupMatch && groupMatch[1]) {
                    group = groupMatch[1].trim();
                }
                channels.push({ name, url: urlLine.trim(), group, logo });
            }
        }
    }
    return filterBlacklistedChannels(channels);
}

// Фильтрация по чёрному списку
function filterBlacklistedChannels(channelsList) {
    const blacklist = JSON.parse(localStorage.getItem('blacklist') || '[]');
    return channelsList.filter(channel => !blacklist.includes(channel.url));
}

// 👇 Загрузка и проверка случайных каналов
async function loadRandomChannel() {
    initialLoader.style.display = 'flex';
    channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Загрузка...")}</div>`;
    
    const MAX_ATTEMPTS = 12;
    const TARGET_COUNT = 6;
    const TIMEOUT_MS = 12000;
    const startTime = Date.now();
    
    try {
        if (!cachedGlobalPlaylist) {
            const content = await fetchM3U('https://iptv-org.github.io/iptv/index.m3u');
            cachedGlobalPlaylist = parseM3UContent(content, translateText('Международные'));
        }
        
        if (cachedGlobalPlaylist.length === 0) {
            throw new Error('Плейлист пуст');
        }
        
        const blacklist = JSON.parse(localStorage.getItem('blacklist') || '[]');
        let candidates = cachedGlobalPlaylist.filter(ch => !blacklist.includes(ch.url));
        
        if (candidates.length === 0) {
            throw new Error('Все каналы в чёрном списке');
        }
        
        candidates.sort(() => 0.5 - Math.random());
        const validChannels = [];
        let checked = 0;
        
        for (const ch of candidates) {
            if (
                validChannels.length >= TARGET_COUNT ||
                checked >= MAX_ATTEMPTS ||
                Date.now() - startTime > TIMEOUT_MS
            ) {
                break;
            }
            checked++;
            try {
                const isOk = await checkChannelAvailability(ch.url);
                if (isOk) {
                    validChannels.push(ch);
                } else {
                    addToBlacklist(ch.url);
                }
            } catch (e) {
                addToBlacklist(ch.url);
            }
        }
        
        if (validChannels.length === 0) {
            channelsContainer.innerHTML = `
                <div style="color:#aaa; padding:60px 20px; text-align:center; font-size:16px;">
                    <i class="fas fa-dice" style="font-size:48px; margin-bottom:20px;"></i><br>
                    ${translateText("Не удалось найти доступный канал")}<br>
                    ${translateText("Попробуйте позже")}
                </div>`;
        } else {
            renderChannels(validChannels);
        }
    } catch (error) {
        console.error("Ошибка в loadRandomChannel:", error);
        channelsContainer.innerHTML = `
            <div style="color:#aaa; padding:60px 20px; text-align:center; font-size:16px;">
                <i class="fas fa-exclamation-triangle" style="font-size:48px; margin-bottom:20px;"></i><br>
                ${translateText("Не удалось загрузить каналы")}<br>
                ${translateText("Попробуйте позже")}
            </div>`;
    } finally {
        initialLoader.style.display = 'none';
        setTimeout(() => {
            const first = document.querySelector('.channel-card');
            if (first) {
                first.focus();
                navigationState = 'channels';
            }
        }, 100);
    }
}

// 👇 Вспомогательная функция для проверки доступности канала
function checkChannelAvailability(url) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        let manifestLoaded = false;
        let errorOccurred = false;
        
        const timeoutId = setTimeout(() => {
            if (!manifestLoaded && !errorOccurred) {
                cleanup();
                resolve(false);
            }
        }, 5000);
        
        function cleanup() {
            clearTimeout(timeoutId);
            if (video.hlsInstance) {
                video.hlsInstance.destroy();
            }
            video.src = '';
            video.load();
        }
        
        if (Hls && Hls.isSupported()) {
            const hlsInstance = new Hls();
            video.hlsInstance = hlsInstance;
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                manifestLoaded = true;
                cleanup();
                resolve(true);
            });
            hlsInstance.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    errorOccurred = true;
                    cleanup();
                    resolve(false);
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.addEventListener('loadedmetadata', () => {
                manifestLoaded = true;
                cleanup();
                resolve(true);
            });
            video.addEventListener('error', () => {
                errorOccurred = true;
                cleanup();
                resolve(false);
            });
        } else {
            cleanup();
            resolve(false);
        }
        video.play().catch(() => {});
    });
}

// Отрисовка каналов
function renderChannels(channelsToRender) {
    channelsContainer.innerHTML = '';
    if (channelsToRender.length === 0 && initialLoader.style.display === 'none') {
        channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Каналы не найдены")}</div>`;
        return;
    }
    
    channelsToRender.forEach((channel, index) => {
        const groupIcon = getGroupIcon(channel.group);
        const channelCard = document.createElement('div');
        channelCard.className = 'channel-card';
        channelCard.setAttribute('tabindex', '0');
        channelCard.dataset.index = index;
        channelCard.dataset.url = channel.url;
        
        const mediaContainer = document.createElement('div');
        mediaContainer.className = 'channel-media';
        
        if (channel.logo) {
            const img = document.createElement('img');
            img.src = channel.logo;
            img.alt = channel.name;
            img.onerror = () => { img.style.display = 'none'; };
            mediaContainer.appendChild(img);
        }
        
        const icon = document.createElement('i');
        icon.className = `fas ${groupIcon}`;
        mediaContainer.appendChild(icon);
        
        // Мини-плеер
        const miniPlayer = createMiniPlayer(channel.url);
        mediaContainer.appendChild(miniPlayer);
        
        // Кнопка "Поделиться"
        const shareBtn = document.createElement('button');
        shareBtn.className = 'channel-share-btn';
        shareBtn.innerHTML = '<i class="fas fa-share-alt"></i>';
        shareBtn.setAttribute('tabindex', '0');
        shareBtn.setAttribute('aria-label', translateText('Поделиться каналом'));
        shareBtn.title = translateText('Поделиться каналом');
        
        shareBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            nativeShare(channel);
        });
        
        shareBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                nativeShare(channel);
            }
        });
        
        mediaContainer.appendChild(shareBtn);
        
        // Информация о канале
        let viewsText = '';
        if (channel.views) {
            viewsText = ` 👥 ${channel.views}`;
        }
        if (currentMainCategory === 'Прямо сейчас' && channel.lastWatched) {
            const now = Date.now();
            if (now - channel.lastWatched < 600000) {
                viewsText += ` ⚡`;
            }
        }
        
        const infoContainer = document.createElement('div');
        infoContainer.className = 'channel-info';
        infoContainer.innerHTML = `<h3>${channel.name}${viewsText}</h3><p>${channel.group}</p>`;
        
        channelCard.appendChild(mediaContainer);
        channelCard.appendChild(infoContainer);
        
        // Обработчики событий для мини-плеера
        channelCard.addEventListener('focus', function() {
            if (watchingNowInterval && currentMainCategory !== 'Прямо сейчас') {
                clearInterval(watchingNowInterval);
                watchingNowInterval = null;
            }
            
            currentChannelIndex = parseInt(this.dataset.index);
            if (focusTimer) clearTimeout(focusTimer);
            
            if (currentMiniPlayer && currentMiniPlayer !== miniPlayer) {
                currentMiniPlayer.style.display = 'none';
                const prevIcon = currentMiniPlayer.parentElement.querySelector('i');
                if (prevIcon) prevIcon.style.display = 'block';
                const prevVideo = currentMiniPlayer.querySelector('video');
                if (prevVideo) prevVideo.pause();
            }
            
            miniPlayer.style.display = 'block';
            icon.style.display = 'none';
            currentMiniPlayer = miniPlayer;
            
            focusTimer = setTimeout(() => {
                const video = miniPlayer.querySelector('video');
                if (!video.dataset.initialized) {
                    initializeMiniPlayer(video, channel.url, miniPlayer, icon);
                } else if (video.paused) {
                    video.play().catch(e => console.log("Autoplay:", e));
                }
            }, 3000);
        });
        
        channelCard.addEventListener('blur', function() {
            if (focusTimer) clearTimeout(focusTimer);
            setTimeout(() => {
                if (!channelCard.contains(document.activeElement)) {
                    miniPlayer.style.display = 'none';
                    icon.style.display = 'block';
                    const video = miniPlayer.querySelector('video');
                    if (video) video.pause();
                }
            }, 100);
        });
        
        // Клик по каналу
        channelCard.addEventListener('click', () => {
            openFullScreenPlayer(channel.name, channel.url, channel.group, channel.logo);
            updateWatchingNow(channel.name, channel.url, channel.group, channel.logo);
        });
        
        channelCard.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                openFullScreenPlayer(channel.name, channel.url, channel.group, channel.logo);
                updateWatchingNow(channel.name, channel.url, channel.group, channel.logo);
            }
        });
        
        channelsContainer.appendChild(channelCard);
    });
}

// Создание мини-плеера
function createMiniPlayer(url) {
    if (miniPlayers.has(url)) return miniPlayers.get(url);
    const container = document.createElement('div');
    container.className = 'mini-player';
    container.dataset.url = url;
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.background = '#000';
    container.appendChild(video);
    miniPlayers.set(url, container);
    return container;
}

// Инициализация мини-плеера
function initializeMiniPlayer(video, url, miniPlayer, icon) {
    video.dataset.initialized = 'true';
    let manifestLoaded = false;
    let networkErrorOccurred = false;
    
    const timeoutId = setTimeout(() => {
        if (!manifestLoaded && !networkErrorOccurred) {
            miniPlayer.style.display = 'none';
            icon.style.display = 'block';
        }
    }, 30000);
    
    if (Hls && Hls.isSupported()) {
        const hls = new Hls();
        video.hlsInstance = hls;
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            clearTimeout(timeoutId);
            manifestLoaded = true;
            video.play().catch(e => console.log("Autoplay (mini):", e));
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal && data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                networkErrorOccurred = true;
                clearTimeout(timeoutId);
                miniPlayer.style.display = 'none';
                icon.style.display = 'block';
                video.pause();
                if (video.hlsInstance) {
                    video.hlsInstance.destroy();
                    delete video.hlsInstance;
                }
            }
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
            clearTimeout(timeoutId);
            manifestLoaded = true;
            video.play().catch(e => console.log("Autoplay (mini):", e));
        });
        video.addEventListener('error', () => {
            clearTimeout(timeoutId);
            miniPlayer.style.display = 'none';
            icon.style.display = 'block';
            video.pause();
        });
    }
}

// 👇 Остановить все мини-плееры
function stopAllMiniPlayers() {
    miniPlayers.forEach((container, url) => {
        const video = container.querySelector('video');
        if (video) {
            video.pause();
            if (video.hlsInstance) {
                video.hlsInstance.destroy();
                delete video.hlsInstance;
            }
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

// Добавление в чёрный список
function addToBlacklist(url) {
    let blacklist = JSON.parse(localStorage.getItem('blacklist') || '[]');
    if (!blacklist.includes(url)) {
        blacklist.push(url);
        localStorage.setItem('blacklist', JSON.stringify(blacklist));
    }
}

// 👇 Открытие полноэкранного плеера
function openFullScreenPlayer(name, url, group, logo) {
    stopAllMiniPlayers();
    currentWatchedChannel = { name, url, group, logo };
    watchStartTime = Date.now();
    
    playerModal.style.display = 'flex';
    videoPlayerElement.src = '';
    videoPlayerElement.load();
    videoPlayerElement.muted = false;
    
    let manifestLoaded = false;
    const timeoutId = setTimeout(() => {
        if (!manifestLoaded) {
            showToast(translateText('Канал не отвечает'));
            addToBlacklist(url);
            playerModal.style.display = 'none';
        }
    }, 30000);
    
    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            liveDurationInfinity: true,
            enableWorker: true,
            lowLatencyMode: false,
            manifestLoadingTimeOut: 15000,
            levelLoadingTimeOut: 15000,
            fragLoadingTimeOut: 15000,
            fragLoadingMaxRetry: 6,
            levelLoadingMaxRetry: 4,
            manifestLoadingMaxRetry: 3
        });
        videoPlayerElement.hls = hls;
        hls.loadSource(url);
        hls.attachMedia(videoPlayerElement);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            clearTimeout(timeoutId);
            manifestLoaded = true;
            videoPlayerElement.play().catch(e => {
                showToast("Нажмите на видео для воспроизведения");
            });
            setTimeout(() => requestNativeFullscreen(), 1000);
        });
        let errorCount = 0;
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                errorCount++;
                if (errorCount >= 2) {
                    clearTimeout(timeoutId);
                    showToast(translateText('Канал недоступен'));
                    addToBlacklist(url);
                    playerModal.style.display = 'none';
                    if (videoPlayerElement.hls) {
                        videoPlayerElement.hls.destroy();
                        delete videoPlayerElement.hls;
                    }
                } else {
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    }
                }
            }
        });
    } else if (videoPlayerElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoPlayerElement.src = url;
        videoPlayerElement.addEventListener('loadedmetadata', () => {
            clearTimeout(timeoutId);
            manifestLoaded = true;
            videoPlayerElement.play().catch(e => {
                showToast("Нажмите на видео для воспроизведения");
            });
            setTimeout(() => requestNativeFullscreen(), 1000);
        });
        videoPlayerElement.addEventListener('error', () => {
            clearTimeout(timeoutId);
            showToast(translateText('Канал недоступен'));
            addToBlacklist(url);
            playerModal.style.display = 'none';
        });
    } else {
        clearTimeout(timeoutId);
        showToast(translateText('Формат не поддерживается'));
        playerModal.style.display = 'none';
    }
}

// Fullscreen API
function requestNativeFullscreen() {
    const elem = videoPlayerElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => console.log("Fullscreen:", err));
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen().catch(err => console.log("Fullscreen:", err));
    }
}

// Иконка по группе
function getGroupIcon(group) {
    if (!group) return 'fa-tv';
    group = group.toLowerCase();
    if (group.includes('новости')) return 'fa-newspaper';
    if (group.includes('спорт')) return 'fa-futbol';
    if (group.includes('кино')) return 'fa-film';
    if (group.includes('музыка')) return 'fa-music';
    if (group.includes('детск')) return 'fa-child';
    if (group.includes('документ')) return 'fa-video';
    if (group.includes('развлеч')) return 'fa-theater-masks';
    return 'fa-tv';
}

// Инициализация приложения
function initApp() {
    try {
        // Инициализация шаринга
        initShareModal();
        initWebShareAPI();
        
        currentMainCategory = 'Просмотренные';
        renderMainCategories();
        renderSubCategories();
        loadAndRenderChannels(currentMainCategory, currentSubcategory);
        
        setTimeout(() => {
            const firstChannel = document.querySelector('.channel-card');
            if (firstChannel) firstChannel.focus();
        }, 500);
        
        initialLoader.style.display = 'none';
    } catch (error) {
        console.error("Ошибка инициализации:", error);
        initialLoader.style.display = 'none';
        showToast(translateText("Ошибка приложения"));
    }
}

// 👇 Очищаем интервал при закрытии вкладки
window.addEventListener('beforeunload', () => {
    if (watchingNowInterval) clearInterval(watchingNowInterval);
});

// Инициализация горизонтального скролла мышью
function initMouseWheelScroll() {
    const scrollContainers = [mainCategoriesPanel, subCategoriesPanel];
    scrollContainers.forEach(container => {
        if (!container) return;
        container.addEventListener('wheel', function(e) {
            if (e.deltaY === 0) return;
            e.preventDefault();
            this.scrollLeft += e.deltaY;
        }, { passive: false });
    });
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    initMouseWheelScroll();
});

// CSS для шаринга и мини-плееров
const shareStyles = `
.channel-share-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.7);
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    font-size: 14px;
    z-index: 10;
    transition: all 0.3s ease;
    opacity: 0.7;
}

.channel-share-btn:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.1);
    opacity: 1;
}

.channel-card:hover .channel-share-btn {
    opacity: 1;
}

.share-modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 1000;
    justify-content: center;
    align-items: center;
}

.share-modal-content {
    background: #1a1a1a;
    border-radius: 12px;
    padding: 24px;
    width: 90%;
    max-width: 400px;
    border: 1px solid #444;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.share-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    color: white;
    font-size: 18px;
}

.share-close-btn {
    background: none;
    border: none;
    color: #aaa;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.share-close-btn:hover {
    color: white;
}

.share-social-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-bottom: 20px;
}

.share-social-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #2a2a2a;
    border: 1px solid #444;
    border-radius: 8px;
    padding: 15px 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: white;
    text-decoration: none;
    border: none;
    font-family: inherit;
}

.share-social-btn:hover {
    transform: translateY(-3px);
    background: #333;
    border-color: #666;
}

.share-social-icon {
    font-size: 24px;
    margin-bottom: 8px;
}

.share-social-name {
    font-size: 12px;
    text-align: center;
}

.share-telegram { color: #0088cc; }
.share-whatsapp { color: #25D366; }
.share-vk { color: #4C75A3; }
.share-twitter { color: #1DA1F2; }
.share-facebook { color: #1877F2; }
.share-reddit { color: #FF4500; }
.share-linkedin { color: #0077B5; }
.share-pinterest { color: #E60023; }
.share-copy { color: #9C27B0; }

.share-custom-message {
    width: 100%;
    padding: 12px;
    border: 1px solid #444;
    border-radius: 6px;
    background: #222;
    color: white;
    font-size: 14px;
    margin-bottom: 15px;
    resize: vertical;
    min-height: 60px;
}

.share-custom-message:focus {
    outline: none;
    border-color: #ff375f;
}

.share-channel-info {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 15px;
    font-size: 13px;
    color: #aaa;
}

.share-channel-info strong {
    color: white;
    display: block;
    margin-bottom: 5px;
}

.mini-player {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000;
    z-index: 1;
}
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = shareStyles;
document.head.appendChild(styleSheet);
