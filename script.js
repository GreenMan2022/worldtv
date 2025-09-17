// DOM элементы
const channelsContainer = document.getElementById('channelsContainer');
const categoriesContainer = document.getElementById('categoriesContainer');
const playerModal = document.getElementById('playerModal');
const videoPlayerElement = document.getElementById('videoPlayerElement');
const closeModal = document.getElementById('closeModal');
const initialLoader = document.getElementById('initialLoader');
const toastContainer = document.getElementById('toastContainer');

// Глобальные переменные
let channels = []; // Все каналы (для категории "Все каналы")
let categoryChannels = {}; // Кэш каналов по категориям: { 'News': [...], 'Sports': [...] }
let categories = ['Все каналы']; // Список категорий
let currentCategoryIndex = 0;
let currentChannelIndex = 0;
let currentMiniPlayer = null;
let miniPlayers = new Map();
let focusTimer = null;

// Карта категорий → URL плейлистов (из https://github.com/iptv-org/iptv/blob/master/PLAYLISTS.md)
const categoryPlaylists = {
    'Новости': 'https://iptv-org.github.io/iptv/categories/news.m3u',
    'Спорт': 'https://iptv-org.github.io/iptv/categories/sports.m3u',
    'Кино': 'https://iptv-org.github.io/iptv/categories/movies.m3u',
    'Развлечения': 'https://iptv-org.github.io/iptv/categories/entertainment.m3u',
    'Документальные': 'https://iptv-org.github.io/iptv/categories/documentary.m3u',
    'Детские': 'https://iptv-org.github.io/iptv/categories/kids.m3u',
    'Музыка': 'https://iptv-org.github.io/iptv/categories/music.m3u',
    'Авто': 'https://iptv-org.github.io/iptv/categories/auto.m3u',
    'Игры': 'https://iptv-org.github.io/iptv/categories/games.m3u',
    'Религия': 'https://iptv-org.github.io/iptv/categories/religion.m3u',
    'Покупки': 'https://iptv-org.github.io/iptv/categories/shopping.m3u',
    'Технологии': 'https://iptv-org.github.io/iptv/categories/technology.m3u'
};

// Закрытие модального окна
closeModal.addEventListener('click', function() {
    playerModal.style.display = 'none';
    videoPlayerElement.pause();
    videoPlayerElement.src = '';
});

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

// Инициализация приложения — загружаем список категорий
function initApp() {
    // Добавляем категории из categoryPlaylists
    categories = ['Все каналы', ...Object.keys(categoryPlaylists)];
    renderCategories();
    loadCategory('Все каналы'); // Начинаем с "Все каналы" — будем грузить все плейлисты
}

// Загрузка каналов для конкретной категории
async function loadCategory(categoryName) {
    if (categoryName === 'Все каналы') {
        await loadAllCategories();
    } else {
        await loadSingleCategory(categoryName);
    }
    renderChannelsByCategory(categoryName);
}

// Загрузка всех категорий (для "Все каналы")
async function loadAllCategories() {
    channels = []; // Сбросим все каналы

    const promises = Object.entries(categoryPlaylists).map(async ([categoryName, url]) => {
        try {
            const content = await fetchM3U(url);
            const categoryChs = parseM3UContentForCategory(content, categoryName);
            categoryChannels[categoryName] = categoryChs;
            channels = [...channels, ...categoryChs];
        } catch (error) {
            console.error(`Ошибка загрузки категории ${categoryName}:`, error);
        }
    });

    await Promise.all(promises);
}

// Загрузка одной категории
async function loadSingleCategory(categoryName) {
    if (categoryChannels[categoryName] && categoryChannels[categoryName].length > 0) {
        return; // Уже загружено
    }

    const url = categoryPlaylists[categoryName];
    if (!url) return;

    try {
        const content = await fetchM3U(url);
        const parsedChannels = parseM3UContentForCategory(content, categoryName);
        categoryChannels[categoryName] = parsedChannels;
    } catch (error) {
        console.error(`Ошибка загрузки категории ${categoryName}:`, error);
        showToast(`Ошибка загрузки ${categoryName}`);
    }
}

// Функция для загрузки M3U-файла
async function fetchM3U(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
}

// Парсинг M3U для одной категории
function parseM3UContentForCategory(content, assignedCategory) {
    const channels = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#EXTINF:')) {
            const infoLine = lines[i];
            const urlLine = lines[i + 1];
            
            if (urlLine && !urlLine.startsWith('#')) {
                let name = infoLine.split(',')[1] || 'Канал';
                name = name.trim();
                
                const groupMatch = infoLine.match(/group-title="([^"]*)"/);
                // Используем assignedCategory, а не group-title, чтобы избежать дубликатов
                const group = assignedCategory;
                
                const logoMatch = infoLine.match(/tvg-logo="([^"]*)"/);
                const logo = logoMatch ? logoMatch[1] : '';
                
                // Разделяем спаренные категории (на случай, если они есть)
                const groupList = group.split(';').map(g => g.trim()).filter(g => g.length > 0);
                
                groupList.forEach(g => {
                    channels.push({
                        name,
                        url: urlLine.trim(),
                        group: g,
                        logo
                    });
                });
            }
        }
    }
    
    return channels;
}

// Фильтрация по чёрному списку
function filterBlacklistedChannels(channelsList) {
    const blacklist = JSON.parse(localStorage.getItem('blacklist') || '[]');
    return channelsList.filter(channel => !blacklist.includes(channel.url));
}

// Отображение категорий
function renderCategories() {
    categoriesContainer.innerHTML = '';
    
    categories.forEach((category, index) => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = category;
        if (index === 0) btn.classList.add('active');
        
        btn.addEventListener('click', () => {
            setActiveCategory(index);
            loadAndRenderCategory(category);
        });
        
        categoriesContainer.appendChild(btn);
    });
}

// Установка активной категории + автопрокрутка
function setActiveCategory(index) {
    currentCategoryIndex = index;
    currentChannelIndex = 0;
    
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });

    const activeBtn = categoryButtons[index];
    if (activeBtn) {
        activeBtn.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        });
    }
}

// Загрузка и отображение категории
async function loadAndRenderCategory(categoryName) {
    initialLoader.style.display = 'flex';
    try {
        await loadCategory(categoryName);
        renderChannelsByCategory(categoryName);
    } catch (error) {
        console.error("Ошибка при загрузке категории:", error);
        showToast("Ошибка загрузки каналов");
    } finally {
        initialLoader.style.display = 'none';
    }
}

// Отображение каналов по категории
function renderChannelsByCategory(categoryName) {
    channelsContainer.innerHTML = '';
    
    let filteredChannels = [];
    
    if (categoryName === 'Все каналы') {
        filteredChannels = filterBlacklistedChannels(channels);
    } else {
        const catChs = categoryChannels[categoryName] || [];
        filteredChannels = filterBlacklistedChannels(catChs);
    }
    
    if (filteredChannels.length === 0) {
        channelsContainer.innerHTML = '<div style="color:#aaa;padding:20px;text-align:center">Каналы не найдены</div>';
        return;
    }
    
    filteredChannels.forEach((channel, index) => {
        const groupIcon = getGroupIcon(channel.group);
        
        const channelCard = document.createElement('div');
        channelCard.className = 'channel-card';
        channelCard.setAttribute('tabindex', '0');
        channelCard.dataset.index = index;
        
        // Медиа-контейнер
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
        
        // Информация о канале
        const infoContainer = document.createElement('div');
        infoContainer.className = 'channel-info';
        infoContainer.innerHTML = `
            <h3>${channel.name}</h3>
            <p>${channel.group}</p>
        `;
        
        channelCard.appendChild(mediaContainer);
        channelCard.appendChild(infoContainer);
        
        // Фокус — запускаем таймер на 3 секунды
        channelCard.addEventListener('focus', function() {
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
                    video.play().catch(e => console.log("Autoplay blocked:", e));
                }
            }, 3000);
        });
        
        // Блюр
        channelCard.addEventListener('blur', function() {
            if (focusTimer) {
                clearTimeout(focusTimer);
                focusTimer = null;
            }
            
            setTimeout(() => {
                if (!channelCard.contains(document.activeElement)) {
                    miniPlayer.style.display = 'none';
                    icon.style.display = 'block';
                    const video = miniPlayer.querySelector('video');
                    if (video) video.pause();
                }
            }, 100);
        });
        
        // Клик и Enter
        channelCard.addEventListener('click', () => openFullScreenPlayer(channel.name, channel.url));
        channelCard.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                openFullScreenPlayer(channel.name, channel.url);
            }
        });
        
        channelsContainer.appendChild(channelCard);
    });

    setTimeout(() => {
        const firstCard = channelsContainer.querySelector('.channel-card');
        if (firstCard) firstCard.focus();
    }, 100);
}

// Создание контейнера мини-плеера
function createMiniPlayer(url) {
    if (miniPlayers.has(url)) {
        return miniPlayers.get(url);
    }

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
            console.warn("Таймаут загрузки манифеста (превью):", url);
            showToast('Канал не отвечает');
            addToBlacklist(url);
            miniPlayer.style.display = 'none';
            icon.style.display = 'block';
        }
    }, 30000);

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            clearTimeout(timeoutId);
            manifestLoaded = true;
            video.play().catch(e => console.log("Autoplay blocked:", e));
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal && data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                networkErrorOccurred = true;
                clearTimeout(timeoutId);
                if (data.details === 'manifestLoadError' || 
                    data.details === 'manifestLoadTimeOut' ||
                    (data.response && (data.response.code >= 400 || data.response.code === 0))) {
                    handleStreamError(url, miniPlayer, true);
                    addToBlacklist(url);
                    miniPlayer.style.display = 'none';
                    icon.style.display = 'block';
                }
            }
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
            clearTimeout(timeoutId);
            manifestLoaded = true;
            video.play().catch(e => console.log("Autoplay blocked:", e));
        });
        video.addEventListener('error', () => {
            clearTimeout(timeoutId);
            const error = video.error;
            if (error && (error.code === error.MEDIA_ERR_SRC_NOT_SUPPORTED || error.code === error.MEDIA_ERR_NETWORK)) {
                handleStreamError(url, miniPlayer, true);
                addToBlacklist(url);
                miniPlayer.style.display = 'none';
                icon.style.display = 'block';
            }
        });
    }
}

// Обработка ошибки
function handleStreamError(url, container, isPreview = true) {
    showToast('Канал недоступен');
    console.error("Ошибка воспроизведения:", url);

    document.querySelectorAll('.channel-card').forEach(card => {
        const miniPlayer = card.querySelector('.mini-player');
        if (miniPlayer && miniPlayer.contains(container.querySelector('video'))) {
            miniPlayer.style.display = 'none';
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
        console.log(`Канал добавлен в чёрный список:`, url);
    }
}

// Открытие полноэкранного плеера
function openFullScreenPlayer(name, url) {
    playerModal.style.display = 'flex';
    videoPlayerElement.src = '';
    videoPlayerElement.load();
    videoPlayerElement.muted = false;

    let manifestLoaded = false;
    let networkErrorOccurred = false;

    const timeoutId = setTimeout(() => {
        if (!manifestLoaded && !networkErrorOccurred) {
            console.warn("Таймаут загрузки манифеста (полный экран):", url);
            showToast('Канал не отвечает');
            addToBlacklist(url);
            playerModal.style.display = 'none';
        }
    }, 30000);

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(videoPlayerElement);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            clearTimeout(timeoutId);
            manifestLoaded = true;
            videoPlayerElement.play().catch(e => console.log("Autoplay blocked:", e));
            setTimeout(() => requestNativeFullscreen(), 1000);
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal && data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                networkErrorOccurred = true;
                clearTimeout(timeoutId);
                if (data.details === 'manifestLoadError' || 
                    data.details === 'manifestLoadTimeOut' ||
                    (data.response && (data.response.code >= 400 || data.response.code === 0))) {
                    showToast('Канал недоступен');
                    addToBlacklist(url);
                    playerModal.style.display = 'none';
                }
            }
        });
    } else if (videoPlayerElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoPlayerElement.src = url;
        videoPlayerElement.addEventListener('loadedmetadata', () => {
            clearTimeout(timeoutId);
            manifestLoaded = true;
            videoPlayerElement.play().catch(e => console.log("Autoplay blocked:", e));
            setTimeout(() => requestNativeFullscreen(), 1000);
        });
        videoPlayerElement.addEventListener('error', () => {
            clearTimeout(timeoutId);
            const error = videoPlayerElement.error;
            if (error && (error.code === error.MEDIA_ERR_SRC_NOT_SUPPORTED || error.code === error.MEDIA_ERR_NETWORK)) {
                showToast('Канал недоступен');
                addToBlacklist(url);
                playerModal.style.display = 'none';
            }
        });
    } else {
        clearTimeout(timeoutId);
        showToast('Формат не поддерживается');
        playerModal.style.display = 'none';
    }
}

// Функция для запроса нативного полноэкранного режима
function requestNativeFullscreen() {
    const elem = videoPlayerElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => console.log("Fullscreen request failed:", err));
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen().catch(err => console.log("Fullscreen request failed:", err));
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen().catch(err => console.log("Fullscreen request failed:", err));
    }
}

// Иконка по группе
function getGroupIcon(group) {
    group = group.toLowerCase();
    if (group.includes('новости') || group.includes('news')) return 'fa-newspaper';
    if (group.includes('спорт') || group.includes('sports')) return 'fa-futbol';
    if (group.includes('кино') || group.includes('movies')) return 'fa-film';
    if (group.includes('музыка') || group.includes('music')) return 'fa-music';
    if (group.includes('детск') || group.includes('kids')) return 'fa-child';
    if (group.includes('документ') || group.includes('documentary')) return 'fa-video';
    if (group.includes('развлечени') || group.includes('entertainment')) return 'fa-theater-masks';
    return 'fa-tv';
}

// Навигация с пульта
document.addEventListener('keydown', function(e) {
    if (playerModal.style.display === 'flex') {
        if (e.key === 'Escape') {
            closeModal.click();
        }
        return;
    }

    const categoryButtons = document.querySelectorAll('.category-btn');
    const channelCards = document.querySelectorAll('.channel-card');

    switch(e.key) {
        case 'ArrowRight':
            e.preventDefault();
            if (channelCards.length > 0) {
                currentChannelIndex = (currentChannelIndex + 1) % channelCards.length;
                channelCards[currentChannelIndex].focus();
            }
            break;
            
        case 'ArrowLeft':
            e.preventDefault();
            if (channelCards.length > 0) {
                currentChannelIndex = (currentChannelIndex - 1 + channelCards.length) % channelCards.length;
                channelCards[currentChannelIndex].focus();
            }
            break;
            
        case 'ArrowDown':
            e.preventDefault();
            currentCategoryIndex = (currentCategoryIndex + 1) % categories.length;
            setActiveCategory(currentCategoryIndex);
            loadAndRenderCategory(categories[currentCategoryIndex]);
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            currentCategoryIndex = (currentCategoryIndex - 1 + categories.length) % categories.length;
            setActiveCategory(currentCategoryIndex);
            loadAndRenderCategory(categories[currentCategoryIndex]);
            break;
            
        case 'Enter':
            e.preventDefault();
            if (document.activeElement.classList.contains('channel-card')) {
                const card = document.activeElement;
                const index = parseInt(card.dataset.index);
                const categoryName = categories[currentCategoryIndex];
                let targetChannels = [];
                if (categoryName === 'Все каналы') {
                    targetChannels = filterBlacklistedChannels(channels);
                } else {
                    targetChannels = filterBlacklistedChannels(categoryChannels[categoryName] || []);
                }
                if (index >= 0 && index < targetChannels.length) {
                    const channel = targetChannels[index];
                    openFullScreenPlayer(channel.name, channel.url);
                }
            } else if (document.activeElement.classList.contains('category-btn')) {
                const index = Array.from(categoryButtons).indexOf(document.activeElement);
                if (index >= 0) {
                    setActiveCategory(index);
                    loadAndRenderCategory(categories[index]);
                }
            }
            break;
    }
});

// Загрузка при старте
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});
