// DOM элементы
const channelsContainer = document.getElementById('channelsContainer');
const categoriesContainer = document.getElementById('categoriesContainer');
const playerModal = document.getElementById('playerModal');
const videoPlayerElement = document.getElementById('videoPlayerElement');
const closeModal = document.getElementById('closeModal');
const initialLoader = document.getElementById('initialLoader');
const toastContainer = document.getElementById('toastContainer');

// Глобальные переменные
let categoryTree = {}; // { categoryName: { subcategoryName: url, ... }, ... }
let currentCategory = '';
let currentSubcategory = '';
let currentChannelIndex = 0;
let currentMiniPlayer = null;
let miniPlayers = new Map();
let focusTimer = null;
let loadedPlaylists = {}; // Кэш загруженных плейлистов: { url: [...channels] }

// Структура категорий и подкатегорий (извлечена из PLAYLISTS.md)
const categoryStructure = {
    'Новости': {
        'Все новости': 'https://iptv-org.github.io/iptv/categories/news.m3u',
        '24/7 Новости': 'https://iptv-org.github.io/iptv/categories/news24.m3u',
        'Бизнес Новости': 'https://iptv-org.github.io/iptv/categories/business-news.m3u',
        'Погода': 'https://iptv-org.github.io/iptv/categories/weather.m3u'
    },
    'Спорт': {
        'Все спорт': 'https://iptv-org.github.io/iptv/categories/sports.m3u',
        'Футбол': 'https://iptv-org.github.io/iptv/categories/football.m3u',
        'Баскетбол': 'https://iptv-org.github.io/iptv/categories/basketball.m3u',
        'Теннис': 'https://iptv-org.github.io/iptv/categories/tennis.m3u',
        'Гольф': 'https://iptv-org.github.io/iptv/categories/golf.m3u',
        'ММА': 'https://iptv-org.github.io/iptv/categories/mma.m3u',
        'Формула 1': 'https://iptv-org.github.io/iptv/categories/formula1.m3u',
        'Мотоспорт': 'https://iptv-org.github.io/iptv/categories/motorsport.m3u',
        'Хоккей': 'https://iptv-org.github.io/iptv/categories/hockey.m3u',
        'Бокс': 'https://iptv-org.github.io/iptv/categories/boxing.m3u'
    },
    'Кино': {
        'Все кино': 'https://iptv-org.github.io/iptv/categories/movies.m3u',
        'Боевики': 'https://iptv-org.github.io/iptv/categories/action.m3u',
        'Комедии': 'https://iptv-org.github.io/iptv/categories/comedy.m3u',
        'Драмы': 'https://iptv-org.github.io/iptv/categories/drama.m3u',
        'Ужасы': 'https://iptv-org.github.io/iptv/categories/horror.m3u',
        'Романтика': 'https://iptv-org.github.io/iptv/categories/romance.m3u',
        'Триллеры': 'https://iptv-org.github.io/iptv/categories/thriller.m3u',
        'Фантастика': 'https://iptv-org.github.io/iptv/categories/sci-fi.m3u',
        'Вестерны': 'https://iptv-org.github.io/iptv/categories/western.m3u'
    },
    'Музыка': {
        'Все музыка': 'https://iptv-org.github.io/iptv/categories/music.m3u',
        'Поп': 'https://iptv-org.github.io/iptv/categories/pop.m3u',
        'Рок': 'https://iptv-org.github.io/iptv/categories/rock.m3u',
        'Хип-хоп': 'https://iptv-org.github.io/iptv/categories/hiphop.m3u',
        'Электроника': 'https://iptv-org.github.io/iptv/categories/electronic.m3u',
        'Джаз': 'https://iptv-org.github.io/iptv/categories/jazz.m3u',
        'Классика': 'https://iptv-org.github.io/iptv/categories/classic.m3u',
        'Кантри': 'https://iptv-org.github.io/iptv/categories/country.m3u',
        'Метал': 'https://iptv-org.github.io/iptv/categories/metal.m3u'
    },
    'Детские': {
        'Все детские': 'https://iptv-org.github.io/iptv/categories/kids.m3u',
        'Мультфильмы': 'https://iptv-org.github.io/iptv/categories/cartoons.m3u',
        'Образование': 'https://iptv-org.github.io/iptv/categories/educational.m3u',
        'Для малышей': 'https://iptv-org.github.io/iptv/categories/preschool.m3u'
    },
    'Документальные': {
        'Все документальные': 'https://iptv-org.github.io/iptv/categories/documentary.m3u',
        'История': 'https://iptv-org.github.io/iptv/categories/history.m3u',
        'Наука': 'https://iptv-org.github.io/iptv/categories/science.m3u',
        'Природа': 'https://iptv-org.github.io/iptv/categories/nature.m3u',
        'Путешествия': 'https://iptv-org.github.io/iptv/categories/travel.m3u',
        'Технологии': 'https://iptv-org.github.io/iptv/categories/technology.m3u'
    },
    'Развлечения': {
        'Все развлечения': 'https://iptv-org.github.io/iptv/categories/entertainment.m3u',
        'Реалити-шоу': 'https://iptv-org.github.io/iptv/categories/reality.m3u',
        'Ток-шоу': 'https://iptv-org.github.io/iptv/categories/talk.m3u',
        'Игры': 'https://iptv-org.github.io/iptv/categories/games.m3u',
        'Юмор': 'https://iptv-org.github.io/iptv/categories/comedy.m3u'
    }
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

// Инициализация приложения
function initApp() {
    // Создаём плоскую структуру для удобства навигации
    categoryTree = categoryStructure;
    
    // Получаем список основных категорий
    const mainCategories = Object.keys(categoryTree);
    currentCategory = mainCategories[0];
    currentSubcategory = Object.keys(categoryTree[currentCategory])[0];
    
    renderCategories();
    renderSubcategories();
    loadAndRenderPlaylist(currentCategory, currentSubcategory);
}

// Отображение основных категорий
function renderCategories() {
    categoriesContainer.innerHTML = '';
    
    const mainCategories = Object.keys(categoryTree);
    mainCategories.forEach((category, index) => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = category;
        if (category === currentCategory) btn.classList.add('active');
        
        btn.addEventListener('click', () => {
            selectCategory(category);
        });
        
        categoriesContainer.appendChild(btn);
    });
}

// Отображение подкатегорий
function renderSubcategories() {
    const subcategoriesContainer = document.getElementById('subcategoriesContainer');
    if (!subcategoriesContainer) {
        const container = document.createElement('div');
        container.id = 'subcategoriesContainer';
        container.className = 'subcategories-container';
        categoriesContainer.parentNode.insertBefore(container, channelsContainer);
    }
    
    const container = document.getElementById('subcategoriesContainer');
    container.innerHTML = '';
    
    const subcategories = Object.keys(categoryTree[currentCategory]);
    subcategories.forEach((subcategory, index) => {
        const btn = document.createElement('button');
        btn.className = 'subcategory-btn';
        btn.textContent = subcategory;
        if (subcategory === currentSubcategory) btn.classList.add('active');
        
        btn.addEventListener('click', () => {
            selectSubcategory(subcategory);
        });
        
        container.appendChild(btn);
    });
}

// Выбор основной категории
function selectCategory(categoryName) {
    currentCategory = categoryName;
    currentSubcategory = Object.keys(categoryTree[categoryName])[0]; // Первая подкатегория
    
    renderCategories();
    renderSubcategories();
    loadAndRenderPlaylist(currentCategory, currentSubcategory);
}

// Выбор подкатегории
function selectSubcategory(subcategoryName) {
    currentSubcategory = subcategoryName;
    renderSubcategories();
    loadAndRenderPlaylist(currentCategory, currentSubcategory);
}

// Загрузка и отображение плейлиста
async function loadAndRenderPlaylist(categoryName, subcategoryName) {
    const url = categoryTree[categoryName][subcategoryName];
    
    if (!url) {
        renderChannels([]);
        return;
    }
    
    // Показываем индикатор загрузки
    initialLoader.style.display = 'flex';
    
    try {
        let channels = [];
        
        // Проверяем кэш
        if (loadedPlaylists[url]) {
            channels = loadedPlaylists[url];
        } else {
            const content = await fetchM3U(url);
            channels = parseM3UContent(content, subcategoryName);
            loadedPlaylists[url] = channels; // Кэшируем
        }
        
        renderChannels(channels);
    } catch (error) {
        console.error("Ошибка загрузки плейлиста:", error);
        showToast("Ошибка загрузки каналов");
        renderChannels([]);
    } finally {
        initialLoader.style.display = 'none';
    }
}

// Загрузка M3U
async function fetchM3U(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
}

// Парсинг M3U
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
                
                channels.push({
                    name,
                    url: urlLine.trim(),
                    group: assignedCategory,
                    logo
                });
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
    const categoryButtons = document.querySelectorAll('.category-btn');
    const subcategoryButtons = document.querySelectorAll('.subcategory-btn');
    const channelCards = document.querySelectorAll('.channel-card');

    if (playerModal.style.display === 'flex') {
        if (e.key === 'Escape') closeModal.click();
        return;
    }

    switch(e.key) {
        case 'ArrowDown':
            e.preventDefault();
            // Переключаем подкатегории вперед
            const subcategories = Object.keys(categoryTree[currentCategory]);
            const currentIndex = subcategories.indexOf(currentSubcategory);
            const nextIndex = (currentIndex + 1) % subcategories.length;
            selectSubcategory(subcategories[nextIndex]);
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            // Переключаем подкатегории назад
            const currentSubs = Object.keys(categoryTree[currentCategory]);
            const currIndex = currentSubs.indexOf(currentSubcategory);
            const prevIndex = (currIndex - 1 + currentSubs.length) % currentSubs.length;
            selectSubcategory(currentSubs[prevIndex]);
            break;
            
        case 'ArrowRight':
            e.preventDefault();
            // Перемещение по каналам вперед
            if (channelCards.length > 0) {
                currentChannelIndex = (currentChannelIndex + 1) % channelCards.length;
                channelCards[currentChannelIndex].focus();
            }
            break;
            
        case 'ArrowLeft':
            e.preventDefault();
            // Перемещение по каналам назад
            if (channelCards.length > 0) {
                currentChannelIndex = (currentChannelIndex - 1 + channelCards.length) % channelCards.length;
                channelCards[currentChannelIndex].focus();
            }
            break;
            
        case 'Enter':
            e.preventDefault();
            if (document.activeElement.classList.contains('channel-card')) {
                const card = document.activeElement;
                const index = parseInt(card.dataset.index);
                const subcategories = Object.keys(categoryTree[currentCategory]);
                const url = categoryTree[currentCategory][currentSubcategory];
                const channels = loadedPlaylists[url] || [];
                
                if (index >= 0 && index < channels.length) {
                    const channel = channels[index];
                    openFullScreenPlayer(channel.name, channel.url);
                }
            }
            break;
    }
});

// Добавим стили для подкатегорий (в style.css нужно добавить)
const style = document.createElement('style');
style.textContent = `
.subcategories-container {
    display: flex;
    gap: 10px;
    padding: 10px 20px;
    overflow-x: auto;
    background: rgba(0, 0, 0, 0.2);
    margin: 10px 0;
    scrollbar-width: none;
}
.subcategories-container::-webkit-scrollbar {
    display: none;
}
.subcategory-btn {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    white-space: nowrap;
    font-size: 14px;
    min-width: 100px;
    text-align: center;
    outline: none;
    transition: all 0.2s;
}
.subcategory-btn:hover,
.subcategory-btn.active,
.subcategory-btn:focus {
    background: linear-gradient(90deg, #ff375f, #ff5e41);
    color: white;
}
.subcategory-btn:focus {
    outline: 3px solid #ff375f;
    outline-offset: 2px;
}
`;
document.head.appendChild(style);

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});
