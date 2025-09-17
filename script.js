// DOM элементы
const channelsContainer = document.getElementById('channelsContainer');
const categoriesContainer = document.getElementById('categoriesContainer');
const playerModal = document.getElementById('playerModal');
const videoPlayerElement = document.getElementById('videoPlayerElement');
const closeModal = document.getElementById('closeModal');
const initialLoader = document.getElementById('initialLoader');
const toastContainer = document.getElementById('toastContainer');

// Глобальные переменные
let channels = [];
let categories = [];
let currentCategoryIndex = 0;
let currentChannelIndex = 0;
let currentMiniPlayer = null;
let miniPlayers = new Map();

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
    }, 3000000);
}

// Загрузка реального плейлиста
function loadM3UFromUrl(url) {
    fetch('https://iptv-org.github.io/iptv/index.m3u')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
        })
        .then(data => {
            parseM3UContent(data);
            initialLoader.style.display = 'none';
        })
        .catch(error => {
            console.error('Ошибка загрузки:', error);
            showToast('Ошибка загрузки каналов');
        });
}

// Парсинг M3U
function parseM3UContent(content) {
    channels = [];
    const lines = content.split('\n');
    const categorySet = new Set(['Все каналы']);
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#EXTINF:')) {
            const infoLine = lines[i];
            const urlLine = lines[i + 1];
            
            if (urlLine && !urlLine.startsWith('#')) {
                let name = infoLine.split(',')[1] || 'Канал';
                name = name.trim();
                
                const groupMatch = infoLine.match(/group-title="([^"]*)"/);
                const group = groupMatch ? groupMatch[1] : 'Другое';
                
                const logoMatch = infoLine.match(/tvg-logo="([^"]*)"/);
                const logo = logoMatch ? logoMatch[1] : '';
                
                channels.push({
                    name,
                    url: urlLine.trim(),
                    group,
                    logo
                });
                
                categorySet.add(group);
            }
        }
    }
    
    categories = Array.from(categorySet);
    filterBlacklistedChannels();
    renderCategories();
    renderChannelsByCategory(categories[0]);
}

// Фильтрация по чёрному списку
function filterBlacklistedChannels() {
    const blacklist = JSON.parse(localStorage.getItem('blacklist') || '[]');
    const before = channels.length;
    channels = channels.filter(channel => !blacklist.includes(channel.url));
    console.log(`Отфильтровано ${before - channels.length} каналов по чёрному списку`);
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
            renderChannelsByCategory(category);
        });
        
        categoriesContainer.appendChild(btn);
    });
}

// Установка активной категории
function setActiveCategory(index) {
    currentCategoryIndex = index;
    currentChannelIndex = 0;
    
    document.querySelectorAll('.category-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });
}

// Отображение каналов по категории
function renderChannelsByCategory(categoryName) {
    channelsContainer.innerHTML = '';
    
    let filteredChannels = channels;
    if (categoryName !== 'Все каналы') {
        filteredChannels = channels.filter(channel => channel.group === categoryName);
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
        
        // Фокус
        channelCard.addEventListener('focus', function() {
            currentChannelIndex = parseInt(this.dataset.index);
            
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
            
            const video = miniPlayer.querySelector('video');
            if (!video.dataset.initialized) {
                initializeMiniPlayer(video, channel.url, miniPlayer, icon);
            } else if (video.paused) {
                video.play().catch(e => console.log("Autoplay blocked:", e));
            }
        });
        
        // Блюр
        channelCard.addEventListener('blur', function() {
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

    // Фокус на первый канал
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
    let isBlacklisted = false;

    const timeoutId = setTimeout(() => {
        if (!manifestLoaded && !networkErrorOccurred) {
            console.warn("Таймаут загрузки манифеста (превью):", url);
            showToast('Канал не отвечает');
            addToBlacklist(url);
            isBlacklisted = true;
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
                    isBlacklisted = true;
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
                isBlacklisted = true;
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

    let isBlacklisted = false;
    let manifestLoaded = false;
    let networkErrorOccurred = false;

    const timeoutId = setTimeout(() => {
        if (!manifestLoaded && !networkErrorOccurred) {
            console.warn("Таймаут загрузки манифеста (полный экран):", url);
            showToast('Канал не отвечает');
            addToBlacklist(url);
            isBlacklisted = true;
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
                    isBlacklisted = true;
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
        });
        videoPlayerElement.addEventListener('error', () => {
            clearTimeout(timeoutId);
            const error = videoPlayerElement.error;
            if (error && (error.code === error.MEDIA_ERR_SRC_NOT_SUPPORTED || error.code === error.MEDIA_ERR_NETWORK)) {
                showToast('Канал недоступен');
                addToBlacklist(url);
                isBlacklisted = true;
                playerModal.style.display = 'none';
            }
        });
    } else {
        clearTimeout(timeoutId);
        showToast('Формат не поддерживается');
        playerModal.style.display = 'none';
    }
}

// Иконка по группе
function getGroupIcon(group) {
    group = group.toLowerCase();
    if (group.includes('news')) return 'fa-newspaper';
    if (group.includes('sport')) return 'fa-futbol';
    if (group.includes('movie')) return 'fa-film';
    if (group.includes('music')) return 'fa-music';
    if (group.includes('kid')) return 'fa-child';
    if (group.includes('doc')) return 'fa-video';
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
            renderChannelsByCategory(categories[currentCategoryIndex]);
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            currentCategoryIndex = (currentCategoryIndex - 1 + categories.length) % categories.length;
            setActiveCategory(currentCategoryIndex);
            renderChannelsByCategory(categories[currentCategoryIndex]);
            break;
            
        case 'Enter':
            e.preventDefault();
            if (document.activeElement.classList.contains('channel-card')) {
                const card = document.activeElement;
                const index = parseInt(card.dataset.index);
                const categoryName = categories[currentCategoryIndex];
                let targetChannels = channels;
                if (categoryName !== 'Все каналы') {
                    targetChannels = channels.filter(ch => ch.group === categoryName);
                }
                if (index >= 0 && index < targetChannels.length) {
                    const channel = targetChannels[index];
                    openFullScreenPlayer(channel.name, channel.url);
                }
            } else if (document.activeElement.classList.contains('category-btn')) {
                const index = Array.from(categoryButtons).indexOf(document.activeElement);
                if (index >= 0) {
                    setActiveCategory(index);
                    renderChannelsByCategory(categories[index]);
                }
            }
            break;
    }
});

// Загрузка при старте
document.addEventListener('DOMContentLoaded', () => {
    loadM3UFromUrl('https://iptv-org.github.io/iptv/index.m3u');
});
