// DOM элементы
const channelsContainer = document.getElementById('channelsContainer');
const categoriesContainer = document.getElementById('categoriesContainer');
const playerModal = document.getElementById('playerModal');
const videoPlayerElement = document.getElementById('videoPlayerElement');
const closeModal = document.getElementById('closeModal');
const initialLoader = document.getElementById('initialLoader');
const toastContainer = document.getElementById('toastContainer');

// Глобальные переменные
let categoryChannels = {}; // Кэш: { 'Новости': [...], 'Спорт': [...] }
let categories = [];
let currentCategoryIndex = 0;
let currentChannelIndex = 0;
let currentMiniPlayer = null;
let miniPlayers = new Map();
let focusTimer = null;

// Карта категорий → URL плейлистов
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

// Инициализация приложения — только рендер категорий, без загрузки данных
function initApp() {
    categories = ['Все каналы', ...Object.keys(categoryPlaylists)];
    renderCategories();
    
    // Сразу показываем интерфейс — без загрузки
    initialLoader.style.display = 'none';
    
    // Фокус на первую категорию
    setTimeout(() => {
        const firstBtn = document.querySelector('.category-btn');
        if (firstBtn) firstBtn.focus();
    }, 100);
}

// Загрузка каналов для конкретной категории
async function loadCategory(categoryName) {
    if (categoryName === 'Все каналы') {
        // "Все каналы" = объединение всех загруженных категорий
        return getAllChannels();
    }

    // Если уже загружено — возвращаем из кэша
    if (categoryChannels[categoryName]) {
        return categoryChannels[categoryName];
    }

    // Иначе — грузим
    const url = categoryPlaylists[categoryName];
    if (!url) return [];

    try {
        initialLoader.style.display = 'flex';
        const content = await fetchM3U(url);
        const parsedChannels = parseM3UContentForCategory(content, categoryName);
        const filtered = filterBlacklistedChannels(parsedChannels);
        categoryChannels[categoryName] = filtered;
        return filtered;
    } catch (error) {
        console.error(`Ошибка загрузки ${categoryName}:`, error);
        showToast(`Ошибка загрузки ${categoryName}`);
        return [];
    } finally {
        initialLoader.style.display = 'none';
    }
}

// Получить все каналы (из уже загруженных категорий)
function getAllChannels() {
    let all = [];
    for (let cat in categoryChannels) {
        all = [...all, ...categoryChannels[cat]];
    }
    return all;
}

// Загрузка M3U
async function fetchM3U(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
}

// Парсинг M3U для категории
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
                
                const logoMatch = infoLine.match(/tvg-logo="([^"]*)"/);
                const logo = logoMatch ? logoMatch[1] : '';
                
                channels.push({
                    name,
                    url: urlLine.trim(),
                    group: assignedCategory,
                    logo
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
            handleCategorySelect(index, category);
        });
        
        categoriesContainer.appendChild(btn);
    });
}

// Обработка выбора категории
function handleCategorySelect(index, categoryName) {
    setActiveCategory(index);
    loadAndRenderCategory(categoryName);
}

// Установка активной категории
function setActiveCategory(index) {
    currentCategoryIndex = index;
    currentChannelIndex = 0;
    
    document.querySelectorAll('.category-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });

    const activeBtn = document.querySelectorAll('.category-btn')[index];
    if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
}

// Загрузка и отображение каналов категории
async function loadAndRenderCategory(categoryName) {
    const channels = await loadCategory(categoryName);
    renderChannels(channels);
}

// Отрисовка каналов
function renderChannels(channelsToRender) {
    channelsContainer.innerHTML = '';
    
    if (channelsToRender.length === 0) {
        channelsContainer.innerHTML = `
            <div style="color:#aaa; padding:40px; text-align:center">
                ${initialLoader.style.display === 'none' ? 'Каналы не найдены' : 'Загрузка...'}
            </div>`;
        return;
    }
    
    channelsToRender.forEach((channel, index) => {
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
        
        // Фокус
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
                    video.play().catch(e => console.log("Autoplay:", e));
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
            console.warn("Таймаут:", url);
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
            video.play().catch(e => console.log("Autoplay:", e));
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal && data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                networkErrorOccurred = true;
                clearTimeout(timeoutId);
                if (data.details === 'manifestLoadError' || data.details === 'manifestLoadTimeOut' ||
                    (data.response && (data.response.code >= 400 || data.response.code === 0))) {
                    handleStreamError(url, miniPlayer);
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
            video.play().catch(e => console.log("Autoplay:", e));
        });
        video.addEventListener('error', () => {
            clearTimeout(timeoutId);
            const error = video.error;
            if (error && (error.code === error.MEDIA_ERR_SRC_NOT_SUPPORTED || error.code === error.MEDIA_ERR_NETWORK)) {
                handleStreamError(url, miniPlayer);
                addToBlacklist(url);
                miniPlayer.style.display = 'none';
                icon.style.display = 'block';
            }
        });
    }
}

// Обработка ошибки
function handleStreamError(url, container) {
    showToast('Канал недоступен');
    console.error("Ошибка:", url);
    const icon = container.parentElement.querySelector('i');
    if (icon) icon.style.display = 'block';
    container.style.display = 'none';
}

// Добавление в чёрный список
function addToBlacklist(url) {
    let blacklist = JSON.parse(localStorage.getItem('blacklist') || '[]');
    if (!blacklist.includes(url)) {
        blacklist.push(url);
        localStorage.setItem('blacklist', JSON.stringify(blacklist));
    }
}

// Открытие полноэкранного плеера
function openFullScreenPlayer(name, url) {
    playerModal.style.display = 'flex';
    videoPlayerElement.src = '';
    videoPlayerElement.load();
    videoPlayerElement.muted = false;

    let manifestLoaded = false;

    const timeoutId = setTimeout(() => {
        if (!manifestLoaded) {
            console.warn("Таймаут полный экран:", url);
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
            videoPlayerElement.play().catch(e => console.log("Autoplay:", e));
            setTimeout(() => requestNativeFullscreen(), 1000);
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                clearTimeout(timeoutId);
                showToast('Канал недоступен');
                addToBlacklist(url);
                playerModal.style.display = 'none';
            }
        });
    } else if (videoPlayerElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoPlayerElement.src = url;
        videoPlayerElement.addEventListener('loadedmetadata', () => {
            clearTimeout(timeoutId);
            manifestLoaded = true;
            videoPlayerElement.play().catch(e => console.log("Autoplay:", e));
            setTimeout(() => requestNativeFullscreen(), 1000);
        });
        videoPlayerElement.addEventListener('error', () => {
            clearTimeout(timeoutId);
            showToast('Канал недоступен');
            addToBlacklist(url);
            playerModal.style.display = 'none';
        });
    } else {
        clearTimeout(timeoutId);
        showToast('Формат не поддерживается');
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

// Навигация с пульта
document.addEventListener('keydown', function(e) {
    if (playerModal.style.display === 'flex') {
        if (e.key === 'Escape') closeModal.click();
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
            const nextCat = categories[currentCategoryIndex];
            setActiveCategory(currentCategoryIndex);
            loadAndRenderCategory(nextCat);
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            currentCategoryIndex = (currentCategoryIndex - 1 + categories.length) % categories.length;
            const prevCat = categories[currentCategoryIndex];
            setActiveCategory(currentCategoryIndex);
            loadAndRenderCategory(prevCat);
            break;
            
        case 'Enter':
            e.preventDefault();
            if (document.activeElement.classList.contains('channel-card')) {
                const card = document.activeElement;
                const index = parseInt(card.dataset.index);
                const cat = categories[currentCategoryIndex];
                
                let targetChannels = [];
                if (cat === 'Все каналы') {
                    targetChannels = getAllChannels();
                } else {
                    targetChannels = categoryChannels[cat] || [];
                }
                
                if (index >= 0 && index < targetChannels.length) {
                    const channel = targetChannels[index];
                    openFullScreenPlayer(channel.name, channel.url);
                }
            } else if (document.activeElement.classList.contains('category-btn')) {
                const idx = Array.from(categoryButtons).indexOf(document.activeElement);
                if (idx >= 0) {
                    handleCategorySelect(idx, categories[idx]);
                }
            }
            break;
    }
});

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});
