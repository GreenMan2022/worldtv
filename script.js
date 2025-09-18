// DOM элементы
const channelsContainer = document.getElementById('channelsContainer');
const categoriesContainer = document.getElementById('categoriesContainer');
const subcategoriesContainer = document.getElementById('subcategoriesContainer');
const playerModal = document.getElementById('playerModal');
const videoPlayerElement = document.getElementById('videoPlayerElement');
const closeModal = document.getElementById('closeModal');
const initialLoader = document.getElementById('initialLoader');
const toastContainer = document.getElementById('toastContainer');

// Глобальные переменные
let mainCategories = ['Категории', 'Страны', 'Языки'];
let currentMainCategory = 'Страны';
let currentSubcategory = 'Россия';
let currentChannelIndex = 0;
let currentMiniPlayer = null;
let miniPlayers = new Map();
let focusTimer = null;
let loadedPlaylists = {};

// Состояния навигации
let navigationState = 'mainMenu'; // 'mainMenu' | 'subMenu' | 'channels'

// Встроенная структура плейлистов
const categoryTree = {
  "Категории": {
    "Новости": "https://iptv-org.github.io/iptv/categories/news.m3u",
    "Спорт": "https://iptv-org.github.io/iptv/categories/sports.m3u",
    "Футбол": "https://iptv-org.github.io/iptv/categories/football.m3u",
    "Баскетбол": "https://iptv-org.github.io/iptv/categories/basketball.m3u",
    "Теннис": "https://iptv-org.github.io/iptv/categories/tennis.m3u",
    "Кино": "https://iptv-org.github.io/iptv/categories/movies.m3u",
    "Боевики": "https://iptv-org.github.io/iptv/categories/action.m3u",
    "Комедии": "https://iptv-org.github.io/iptv/categories/comedy.m3u",
    "Драмы": "https://iptv-org.github.io/iptv/categories/drama.m3u",
    "Развлечения": "https://iptv-org.github.io/iptv/categories/entertainment.m3u",
    "Документальные": "https://iptv-org.github.io/iptv/categories/documentary.m3u",
    "Детские": "https://iptv-org.github.io/iptv/categories/kids.m3u",
    "Музыка": "https://iptv-org.github.io/iptv/categories/music.m3u",
    "Поп": "https://iptv-org.github.io/iptv/categories/pop.m3u",
    "Рок": "https://iptv-org.github.io/iptv/categories/rock.m3u",
    "Хип-хоп": "https://iptv-org.github.io/iptv/categories/hiphop.m3u"
  },
  "Страны": {
    "Россия": "https://iptv-org.github.io/iptv/countries/ru.m3u",
    "США": "https://iptv-org.github.io/iptv/countries/us.m3u",
    "Великобритания": "https://iptv-org.github.io/iptv/countries/gb.m3u",
    "Германия": "https://iptv-org.github.io/iptv/countries/de.m3u",
    "Франция": "https://iptv-org.github.io/iptv/countries/fr.m3u",
    "Италия": "https://iptv-org.github.io/iptv/countries/it.m3u",
    "Испания": "https://iptv-org.github.io/iptv/countries/es.m3u",
    "Китай": "https://iptv-org.github.io/iptv/countries/cn.m3u",
    "Япония": "https://iptv-org.github.io/iptv/countries/jp.m3u",
    "Корея": "https://iptv-org.github.io/iptv/countries/kr.m3u",
    "Индия": "https://iptv-org.github.io/iptv/countries/in.m3u",
    "Бразилия": "https://iptv-org.github.io/iptv/countries/br.m3u",
    "Канада": "https://iptv-org.github.io/iptv/countries/ca.m3u",
    "Австралия": "https://iptv-org.github.io/iptv/countries/au.m3u"
  },
  "Языки": {
    "Русский": "https://iptv-org.github.io/iptv/languages/rus.m3u",
    "Английский": "https://iptv-org.github.io/iptv/languages/eng.m3u",
    "Испанский": "https://iptv-org.github.io/iptv/languages/spa.m3u",
    "Французский": "https://iptv-org.github.io/iptv/languages/fra.m3u",
    "Немецкий": "https://iptv-org.github.io/iptv/languages/deu.m3u",
    "Итальянский": "https://iptv-org.github.io/iptv/languages/ita.m3u",
    "Португальский": "https://iptv-org.github.io/iptv/languages/por.m3u",
    "Китайский": "https://iptv-org.github.io/iptv/languages/zho.m3u",
    "Японский": "https://iptv-org.github.io/iptv/languages/jpn.m3u",
    "Корейский": "https://iptv-org.github.io/iptv/languages/kor.m3u",
    "Арабский": "https://iptv-org.github.io/iptv/languages/ara.m3u",
    "Турецкий": "https://iptv-org.github.io/iptv/languages/tur.m3u",
    "Хинди": "https://iptv-org.github.io/iptv/languages/hin.m3u"
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
async function initApp() {
    initialLoader.style.display = 'flex';
    
    const safetyTimeout = setTimeout(() => {
        console.warn("Аварийное скрытие лоадера");
        initialLoader.style.display = 'none';
        showToast("Ошибка инициализации приложения");
    }, 10000);

    try {
        renderMainCategories();
        renderSubcategories();
        
        // Начинаем с главного меню
        navigationState = 'mainMenu';
        focusOnMainMenu();
        
        clearTimeout(safetyTimeout);
    } catch (error) {
        clearTimeout(safetyTimeout);
        console.error("Критическая ошибка в initApp:", error);
        initialLoader.style.display = 'none';
        showToast("Критическая ошибка приложения");
    }
}

// Фокус на главное меню
function focusOnMainMenu() {
    setTimeout(() => {
        const btn = document.querySelector('.category-btn.active');
        if (btn) btn.focus();
    }, 100);
}

// Отображение главных категорий
function renderMainCategories() {
    categoriesContainer.innerHTML = '';
    
    mainCategories.forEach((category, index) => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = category;
        if (category === currentMainCategory) btn.classList.add('active');
        
        btn.addEventListener('click', () => {
            selectMainCategory(category);
        });
        
        categoriesContainer.appendChild(btn);
    });
}

// Отображение подкатегорий
function renderSubcategories() {
    const container = document.getElementById('subcategoriesContainer');
    if (!container) {
        console.error("Элемент subcategoriesContainer не найден!");
        return;
    }
    
    container.innerHTML = '';
    
    const subcategories = categoryTree[currentMainCategory] ? Object.keys(categoryTree[currentMainCategory]) : [];
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

// Выбор главной категории
function selectMainCategory(categoryName) {
    currentMainCategory = categoryName;
    const firstSub = categoryTree[categoryName] ? Object.keys(categoryTree[categoryName])[0] : '';
    currentSubcategory = firstSub;
    
    renderMainCategories();
    renderSubcategories();
}

// Выбор подкатегории
function selectSubcategory(subcategoryName) {
    currentSubcategory = subcategoryName;
    renderSubcategories();
    
    loadAndRenderPlaylist(currentMainCategory, currentSubcategory, () => {
        setTimeout(() => {
            navigationState = 'channels';
            const firstChannel = document.querySelector('.channel-card');
            if (firstChannel) firstChannel.focus();
        }, 100);
    });
}

// Загрузка и отображение плейлиста
async function loadAndRenderPlaylist(mainCategory, subcategory, callback = null) {
    if (!categoryTree[mainCategory] || !categoryTree[mainCategory][subcategory]) {
        renderChannels([]);
        if (callback) callback();
        return;
    }
    
    const url = categoryTree[mainCategory][subcategory];
    initialLoader.style.display = 'flex';
    
    try {
        let channels = [];
        
        if (loadedPlaylists[url]) {
            channels = loadedPlaylists[url];
        } else {
            const content = await fetchM3U(url);
            channels = parseM3UContent(content, subcategory);
            loadedPlaylists[url] = channels;
        }
        
        renderChannels(channels);
    } catch (error) {
        console.error("Ошибка загрузки плейлиста:", error);
        showToast("Ошибка загрузки каналов");
        renderChannels([]);
    } finally {
        initialLoader.style.display = 'none';
        if (callback) callback();
    }
}

// Остальные функции без изменений (fetchM3U, parseM3UContent, renderChannels, createMiniPlayer, initializeMiniPlayer, handleStreamError, addToBlacklist, openFullScreenPlayer, requestNativeFullscreen, getGroupIcon)

// ... (все функции renderChannels, createMiniPlayer и т.д. остаются как в предыдущей версии)

// Навигация с пульта — ПОЛНОСТЬЮ ПЕРЕПИСАНА
document.addEventListener('keydown', function(e) {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const subcategoryButtons = document.querySelectorAll('.subcategory-btn');
    const channelCards = document.querySelectorAll('.channel-card');

    if (playerModal.style.display === 'flex') {
        if (e.key === 'Escape') closeModal.click();
        return;
    }

    // Обработка Escape / Back
    if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        if (navigationState === 'channels') {
            // Возврат к подкатегориям
            navigationState = 'subMenu';
            const activeSubBtn = document.querySelector('.subcategory-btn.active');
            if (activeSubBtn) activeSubBtn.focus();
        } else if (navigationState === 'subMenu') {
            // Возврат к главным категориям
            navigationState = 'mainMenu';
            const activeMainBtn = document.querySelector('.category-btn.active');
            if (activeMainBtn) activeMainBtn.focus();
        }
        return;
    }

    switch(navigationState) {
        case 'mainMenu':
            handleMainMenuNavigation(e, categoryButtons);
            break;
        case 'subMenu':
            handleSubMenuNavigation(e, subcategoryButtons);
            break;
        case 'channels':
            handleChannelsNavigation(e, channelCards);
            break;
    }
});

// Навигация в главном меню
function handleMainMenuNavigation(e, categoryButtons) {
    switch(e.key) {
        case 'ArrowDown':
        case 'ArrowUp':
            e.preventDefault();
            const currentIndex = Array.from(categoryButtons).findIndex(btn => btn.classList.contains('active'));
            let nextIndex;
            if (e.key === 'ArrowDown') {
                nextIndex = (currentIndex + 1) % categoryButtons.length;
            } else {
                nextIndex = (currentIndex - 1 + categoryButtons.length) % categoryButtons.length;
            }
            selectMainCategory(mainCategories[nextIndex]);
            categoryButtons[nextIndex].focus();
            break;
            
        case 'ArrowLeft':
        case 'ArrowRight':
            e.preventDefault();
            const currIndex = Array.from(categoryButtons).findIndex(btn => btn.classList.contains('active'));
            let nxtIndex;
            if (e.key === 'ArrowRight') {
                nxtIndex = (currIndex + 1) % categoryButtons.length;
            } else {
                nxtIndex = (currIndex - 1 + categoryButtons.length) % categoryButtons.length;
            }
            selectMainCategory(mainCategories[nxtIndex]);
            categoryButtons[nxtIndex].focus();
            break;
            
        case 'Enter':
            e.preventDefault();
            // Переход к подкатегориям
            navigationState = 'subMenu';
            setTimeout(() => {
                const firstSubBtn = document.querySelector('.subcategory-btn');
                if (firstSubBtn) firstSubBtn.focus();
            }, 100);
            break;
    }
}

// Навигация в подменю
function handleSubMenuNavigation(e, subcategoryButtons) {
    switch(e.key) {
        case 'ArrowDown':
        case 'ArrowUp':
            e.preventDefault();
            const currentIndex = Array.from(subcategoryButtons).findIndex(btn => btn.classList.contains('active'));
            let nextIndex;
            if (e.key === 'ArrowDown') {
                nextIndex = (currentIndex + 1) % subcategoryButtons.length;
            } else {
                nextIndex = (currentIndex - 1 + subcategoryButtons.length) % subcategoryButtons.length;
            }
            const subcategoryName = subcategoryButtons[nextIndex].textContent;
            currentSubcategory = subcategoryName;
            renderSubcategories();
            subcategoryButtons[nextIndex].focus();
            break;
            
        case 'Enter':
            e.preventDefault();
            // Загрузка плейлиста и переход к каналам
            loadAndRenderPlaylist(currentMainCategory, currentSubcategory, () => {
                setTimeout(() => {
                    navigationState = 'channels';
                    const firstChannel = document.querySelector('.channel-card');
                    if (firstChannel) firstChannel.focus();
                }, 100);
            });
            break;
    }
}

// Навигация по каналам
function handleChannelsNavigation(e, channelCards) {
    switch(e.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
            e.preventDefault();
            if (channelCards.length > 0) {
                if (e.key === 'ArrowRight') {
                    currentChannelIndex = (currentChannelIndex + 1) % channelCards.length;
                } else {
                    currentChannelIndex = (currentChannelIndex - 1 + channelCards.length) % channelCards.length;
                }
                channelCards[currentChannelIndex].focus();
            }
            break;
    }
}

// Остальные функции (fetchM3U, parseM3UContent и т.д.) — вставьте из предыдущей версии

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

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});
