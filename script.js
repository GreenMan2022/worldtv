// DOM элементы
const channelsContainer = document.getElementById('channelsContainer');
const playerModal = document.getElementById('playerModal');
const videoPlayerElement = document.getElementById('videoPlayerElement');
const closeModal = document.getElementById('closeModal');
const initialLoader = document.getElementById('initialLoader');
const toastContainer = document.getElementById('toastContainer');

// Глобальные переменные
let channels = [];
let currentMiniPlayer = null; // Текущий активный мини-плеер
let miniPlayers = new Map();  // Кэш контейнеров по URL

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

// Загрузка плейлиста — с тестовыми каналами (включая example.com для проверки)
function loadM3UFromUrl(url) {
    const testPlaylist = `#EXTM3U
#EXTINF:-1 tvg-name="Test Channel 1" group-title="Test",Test Channel 1
https://example.com/stream1
#EXTINF:-1 tvg-name="Télé-Québec" group-title="News",Télé-Québec
https://mnmedias.api.telequebec.tv/m3u8/29880.m3u8
#EXTINF:-1 tvg-name="Big Buck Bunny" group-title="Movies",Big Buck Bunny
https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
#EXTINF:-1 tvg-name="NASA TV" group-title="Documentary",NASA TV
https://ntv1.akamaized.net/hls/live/2014559/NTV1/master_2000.m3u8
#EXTINF:-1 tvg-name="France 24" group-title="News",France 24
https://static.france24.com/live/F24_EN_LO_HLS/live_web.m3u8
#EXTINF:-1 tvg-name="MTV Classic" group-title="Music",MTV Classic
https://stream.mtv.fi/mtv_classic/playlist.m3u8`;

    parseM3UContent(testPlaylist);
    initialLoader.style.display = 'none';
}

// Парсинг M3U
function parseM3UContent(content) {
    channels = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#EXTINF:')) {
            const infoLine = lines[i];
            const urlLine = lines[i + 1];
            
            if (urlLine && !urlLine.startsWith('#')) {
                let name = infoLine.split(',')[1] || 'Канал';
                name = name.trim();
                
                const groupMatch = infoLine.match(/group-title="([^"]*)"/);
                const group = groupMatch ? groupMatch[1] : 'Other';
                
                const logoMatch = infoLine.match(/tvg-logo="([^"]*)"/);
                const logo = logoMatch ? logoMatch[1] : '';
                
                channels.push({
                    name,
                    url: urlLine.trim(),
                    group,
                    logo
                });
            }
        }
    }
    
    renderChannels(channels);
}

// Создание контейнера мини-плеера БЕЗ инициализации видео (ленивая загрузка)
function createMiniPlayer(url) {
    if (miniPlayers.has(url)) {
        return miniPlayers.get(url);
    }

    const container = document.createElement('div');
    container.className = 'mini-player';
    container.dataset.url = url; // Сохраняем URL для будущей загрузки
    
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

// Обработка ошибки потока
function handleStreamError(url, container) {
    showToast('Канал недоступен');
    console.error("Ошибка воспроизведения:", url);

    // Удаляем из всех карточек
    document.querySelectorAll('.channel-card').forEach(card => {
        const miniPlayer = card.querySelector('.mini-player');
        if (miniPlayer && miniPlayer.contains(container.querySelector('video'))) {
            miniPlayer.style.display = 'none';
            const icon = card.querySelector('.channel-media i');
            if (icon) icon.style.display = 'block';
        }
    });
}

// Отрисовка каналов
function renderChannels(channelsToRender) {
    channelsContainer.innerHTML = '';
    
    channelsToRender.forEach(channel => {
        const groupIcon = getGroupIcon(channel.group);
        
        const channelCard = document.createElement('div');
        channelCard.className = 'channel-card';
        channelCard.setAttribute('tabindex', '0');
        
        // Медиа-контейнер (логотип или мини-плеер)
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
        
        // Мини-плеер (изначально скрыт) — создаем, но НЕ инициализируем
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
        
        // Фокус — показываем мини-плеер и ИНИЦИАЛИЗИРУЕМ видео
        channelCard.addEventListener('focus', function() {
            // Скрываем предыдущий мини-плеер
            if (currentMiniPlayer && currentMiniPlayer !== miniPlayer) {
                currentMiniPlayer.style.display = 'none';
                const prevIcon = currentMiniPlayer.parentElement.querySelector('i');
                if (prevIcon) prevIcon.style.display = 'block';
                
                // Останавливаем предыдущее видео
                const prevVideo = currentMiniPlayer.querySelector('video');
                if (prevVideo) prevVideo.pause();
            }
            
            // Показываем текущий
            miniPlayer.style.display = 'block';
            icon.style.display = 'none';
            currentMiniPlayer = miniPlayer;
            
            // Получаем видео-элемент
            const video = miniPlayer.querySelector('video');
            
            // Инициализируем HLS ТОЛЬКО ПРИ ПЕРВОМ ФОКУСЕ
            if (!video.dataset.initialized) {
                video.dataset.initialized = 'true';
                const url = miniPlayer.dataset.url;
                
                if (Hls.isSupported()) {
                    const hls = new Hls();
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        console.log("Мини-плеер: поток загружен", url);
                        video.play().catch(e => {
                            console.log("Autoplay blocked:", e);
                        });
                    });
                    hls.on(Hls.Events.ERROR, function(event, data) {
                        if (data.fatal) {
                            handleStreamError(url, miniPlayer);
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                    video.addEventListener('loadedmetadata', () => {
                        video.play().catch(e => {
                            console.log("Autoplay blocked:", e);
                        });
                    });
                    video.addEventListener('error', () => {
                        handleStreamError(url, miniPlayer);
                    });
                } else {
                    handleStreamError(url, miniPlayer);
                }
            } else {
                // Если уже инициализировано — просто играем
                if (video.paused) {
                    video.play().catch(e => {
                        console.log("Autoplay blocked:", e);
                    });
                }
            }
        });
        
        // Блюр — скрываем мини-плеер
        channelCard.addEventListener('blur', function() {
            setTimeout(() => {
                // Проверяем, что фокус не внутри этой же карточки
                if (!channelCard.contains(document.activeElement)) {
                    miniPlayer.style.display = 'none';
                    icon.style.display = 'block';
                    const video = miniPlayer.querySelector('video');
                    if (video) video.pause();
                }
            }, 100);
        });
        
        // ВРЕМЕННО ОТКЛЮЧЕНО — для тестирования только превью
        // channelCard.addEventListener('click', function() { ... });
        // channelCard.addEventListener('keydown', function(e) { ... });

        channelsContainer.appendChild(channelCard);
    });

    // Фокус на первый канал
    setTimeout(() => {
        const firstCard = document.querySelector('.channel-card');
        if (firstCard) firstCard.focus();
    }, 500);
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
let currentFocusIndex = 0;

function updateFocusableElements() {
    return Array.from(document.querySelectorAll('.channel-card'));
}

function moveFocus(direction) {
    const focusableElements = updateFocusableElements();
    if (focusableElements.length === 0) return;

    if (focusableElements[currentFocusIndex]) {
        focusableElements[currentFocusIndex].blur();
    }

    switch(direction) {
        case 'down':
        case 'right':
            currentFocusIndex = (currentFocusIndex + 1) % focusableElements.length;
            break;
        case 'up':
        case 'left':
            currentFocusIndex = (currentFocusIndex - 1 + focusableElements.length) % focusableElements.length;
            break;
    }

    if (focusableElements[currentFocusIndex]) {
        focusableElements[currentFocusIndex].focus();
        focusableElements[currentFocusIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }
}

document.addEventListener('keydown', function(e) {
    if (playerModal.style.display === 'flex') {
        if (e.key === 'Escape') {
            closeModal.click();
        }
        return;
    }

    switch(e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
            e.preventDefault();
            moveFocus('down');
            break;
        case 'ArrowUp':
        case 'ArrowLeft':
            e.preventDefault();
            moveFocus('up');
            break;
        case 'Enter':
            e.preventDefault();
            // ВРЕМЕННО НИЧЕГО НЕ ДЕЛАЕМ
            break;
    }
});

// Загрузка при старте
document.addEventListener('DOMContentLoaded', () => {
    loadM3UFromUrl('https://iptv-org.github.io/iptv/index.m3u');
});
