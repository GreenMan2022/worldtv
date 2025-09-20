// DOM элементы
const channelsContainer = document.getElementById('channelsContainer');
const mainCategoriesPanel = document.getElementById('mainCategoriesPanel');
const subCategoriesPanel = document.getElementById('subCategoriesPanel');
const playerModal = document.getElementById('playerModal');
const videoPlayerElement = document.getElementById('videoPlayerElement');
const closeModal = document.getElementById('closeModal');
const initialLoader = document.getElementById('initialLoader');
const toastContainer = document.getElementById('toastContainer');

// Глобальные переменные
let currentMainCategory = 'Просмотренные'; // Стартуем с "Просмотренные"
let currentSubcategory = '';
let currentMainCategoryIndex = 0;
let currentSubCategoryIndex = 0;
let currentChannelIndex = 0;
let currentMiniPlayer = null;
let miniPlayers = new Map();
let focusTimer = null;
let loadedPlaylists = {};
let navigationState = 'channels'; // 'channels' | 'mainCategories' | 'subCategories'

// 👇 Просмотренные: Таймер для отсчёта 60 секунд с момента открытия плеера
let watchTimer = null;

// Структура плейлистов — ТОЛЬКО РЕАЛЬНЫЕ ССЫЛКИ
const categoryTree = {
  "Просмотренные": {}, // Пустая категория — заполняется динамически
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
    if (watchTimer) {
        clearTimeout(watchTimer);
        watchTimer = null;
        console.log("❌ Таймер просмотра сброшен (плеер закрыт до 60 сек)");
    }
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

// 👇 Просмотренные: Добавление канала в просмотренные
function addToWatched(name, url, group, logo) {
    let watched = JSON.parse(localStorage.getItem('watchedChannels') || '[]');
    
    // Проверка на дубликат
    const exists = watched.some(item => item.url === url);
    if (exists) {
        console.log(`ℹ️ Канал "${name}" уже есть в "Просмотренные"`);
        return;
    }

    // Добавляем новый канал
    watched.push({ name, url, group, logo });
    localStorage.setItem('watchedChannels', JSON.stringify(watched));
    console.log(`✅ Канал "${name}" добавлен в "Просмотренные"`);

    // Обновляем кэш плейлиста, если категория "Просмотренные" активна
    if (currentMainCategory === 'Просмотренные') {
        loadAndRenderChannels('Просмотренные', '');
    }
}

// Инициализация приложения
function initApp() {
    const safetyTimeout = setTimeout(() => {
        initialLoader.style.display = 'none';
        showToast("Ошибка инициализации");
    }, 10000);

    try {
        currentMainCategory = 'Просмотренные';
        renderMainCategories();
        renderSubCategories();
        loadAndRenderChannels(currentMainCategory, currentSubcategory);
        
        setTimeout(() => {
            const firstChannel = document.querySelector('.channel-card');
            if (firstChannel) firstChannel.focus();
        }, 500);
        
        clearTimeout(safetyTimeout);
    } catch (error) {
        clearTimeout(safetyTimeout);
        console.error("Ошибка инициализации:", error);
        initialLoader.style.display = 'none';
        showToast("Ошибка приложения");
    }
}

// Отображение главных категорий
function renderMainCategories() {
    mainCategoriesPanel.innerHTML = '';
    
    const mainCategories = Object.keys(categoryTree);
    
    mainCategories.forEach((cat, index) => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = cat;
        if (cat === currentMainCategory) {
            btn.classList.add('active');
            currentMainCategoryIndex = index;
        }
        
        btn.addEventListener('click', () => {
            selectMainCategory(cat, index);
        });
        
        // Обработка Enter и Пробела
        btn.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
        
        mainCategoriesPanel.appendChild(btn);
    });
}

// Отображение подкатегорий
function renderSubCategories() {
    subCategoriesPanel.innerHTML = '';
    subCategoriesPanel.style.display = 'none';
    
    if (!categoryTree[currentMainCategory]) return;
    
    const subcategories = Object.keys(categoryTree[currentMainCategory]);
    
    subcategories.forEach((subcat, index) => {
        const btn = document.createElement('button');
        btn.className = 'subcategory-btn';
        btn.textContent = subcat;
        if (subcat === currentSubcategory) {
            btn.classList.add('active');
            currentSubCategoryIndex = index;
        }
        
        btn.addEventListener('click', () => {
            selectSubcategory(subcat, index);
        });
        
        // Обработка Enter и Пробела
        btn.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
        
        subCategoriesPanel.appendChild(btn);
    });
    
    if (subcategories.length > 0) {
        subCategoriesPanel.style.display = 'flex';
    }
}

// Выбор главной категории
function selectMainCategory(categoryName, index) {
    currentMainCategory = categoryName;
    currentMainCategoryIndex = index;
    const firstSub = categoryTree[categoryName] ? Object.keys(categoryTree[categoryName])[0] : '';
    currentSubcategory = firstSub || '';
    currentSubCategoryIndex = 0;
    renderSubCategories();
    
    // Фокус на кнопку
    setTimeout(() => {
        const buttons = mainCategoriesPanel.querySelectorAll('.category-btn');
        if (buttons[index]) {
            buttons[index].focus();
        }
    }, 100);
}

// Выбор подкатегории
function selectSubcategory(subcategoryName, index) {
    currentSubcategory = subcategoryName;
    currentSubCategoryIndex = index;
    loadAndRenderChannels(currentMainCategory, currentSubcategory);
    
    // Фокус на канал
    setTimeout(() => {
        const firstChannel = document.querySelector('.channel-card');
        if (firstChannel) firstChannel.focus();
    }, 100);
}

// Обновить активную кнопку в главном меню
function updateMainCategoryActive() {
    const buttons = mainCategoriesPanel.querySelectorAll('.category-btn');
    buttons.forEach((btn, i) => {
        if (i === currentMainCategoryIndex) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Обновить активную кнопку в подменю
function updateSubCategoryActive() {
    const buttons = subCategoriesPanel.querySelectorAll('.subcategory-btn');
    buttons.forEach((btn, i) => {
        if (i === currentSubCategoryIndex) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Загрузка и отображение каналов
async function loadAndRenderChannels(mainCategory, subcategory) {
    // 👇 Просмотренные: Обработка категории "Просмотренные"
    if (mainCategory === 'Просмотренные') {
        initialLoader.style.display = 'none';
        const watched = JSON.parse(localStorage.getItem('watchedChannels') || '[]');
        renderChannels(watched);
        return;
    }

    if (!categoryTree[mainCategory] || !categoryTree[mainCategory][subcategory]) {
        renderChannels([]);
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
        channelCard.addEventListener('click', () => openFullScreenPlayer(channel.name, channel.url, channel.group, channel.logo));
        channelCard.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                openFullScreenPlayer(channel.name, channel.url, channel.group, channel.logo);
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

// 👇 Просмотренные: Основная функция открытия плеера
function openFullScreenPlayer(name, url, group, logo) {
    // Сброс предыдущего таймера
    if (watchTimer) {
        clearTimeout(watchTimer);
        watchTimer = null;
    }

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

    // 👇 ЗАПУСКАЕМ ТАЙМЕР НА 60 СЕКУНД СРАЗУ ПРИ ОТКРЫТИИ ПЛЕЕРА
    watchTimer = setTimeout(() => {
        addToWatched(name, url, group, logo);
        watchTimer = null; // Очищаем, чтобы не дублировать
    }, 60000); // 60 секунд

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(videoPlayerElement);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            clearTimeout(timeoutId);
            manifestLoaded = true;
            videoPlayerElement.play().catch(e => {
                console.log("Autoplay blocked:", e);
                showToast("Нажмите на видео для воспроизведения");
            });
            setTimeout(() => requestNativeFullscreen(), 1000);
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                clearTimeout(timeoutId);
                if (watchTimer) clearTimeout(watchTimer);
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
            videoPlayerElement.play().catch(e => {
                console.log("Autoplay blocked:", e);
                showToast("Нажмите на видео для воспроизведения");
            });
            setTimeout(() => requestNativeFullscreen(), 1000);
        });
        videoPlayerElement.addEventListener('error', () => {
            clearTimeout(timeoutId);
            if (watchTimer) clearTimeout(watchTimer);
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

// Перемещение фокуса
function moveFocus(direction) {
    if (navigationState === 'channels') {
        const channelCards = document.querySelectorAll('.channel-card');
        if (channelCards.length === 0) return;
        
        const currentIndex = Array.from(channelCards).indexOf(document.activeElement);
        let nextIndex = currentIndex;
        
        const cols = Math.floor(channelsContainer.offsetWidth / 280) || 1;
        
        switch(direction) {
            case 'right':
                nextIndex = (currentIndex + 1) % channelCards.length;
                break;
            case 'left':
                nextIndex = (currentIndex - 1 + channelCards.length) % channelCards.length;
                break;
            case 'down':
                nextIndex = (currentIndex + cols) % channelCards.length;
                if (nextIndex >= channelCards.length) nextIndex = channelCards.length - 1;
                break;
            case 'up':
                nextIndex = (currentIndex - cols + channelCards.length) % channelCards.length;
                break;
        }
        
        if (nextIndex >= 0 && nextIndex < channelCards.length) {
            channelCards[nextIndex].focus();
        }
    } else if (navigationState === 'mainCategories') {
        const buttons = mainCategoriesPanel.querySelectorAll('.category-btn');
        if (buttons.length === 0) return;
        
        let nextIndex;
        
        if (direction === 'right') {
            nextIndex = (currentMainCategoryIndex + 1) % buttons.length;
        } else if (direction === 'left') {
            nextIndex = (currentMainCategoryIndex - 1 + buttons.length) % buttons.length;
        } else {
            return;
        }
        
        currentMainCategoryIndex = nextIndex;
        currentMainCategory = buttons[nextIndex].textContent;
        updateMainCategoryActive();
        buttons[nextIndex].focus();
    } else if (navigationState === 'subCategories') {
        const buttons = subCategoriesPanel.querySelectorAll('.subcategory-btn');
        if (buttons.length === 0) return;
        
        let nextIndex;
        
        if (direction === 'right') {
            nextIndex = (currentSubCategoryIndex + 1) % buttons.length;
        } else if (direction === 'left') {
            nextIndex = (currentSubCategoryIndex - 1 + buttons.length) % buttons.length;
        } else {
            return;
        }
        
        currentSubCategoryIndex = nextIndex;
        currentSubcategory = buttons[nextIndex].textContent;
        updateSubCategoryActive();
        buttons[nextIndex].focus();
    }
}

// Основной обработчик клавиш
document.addEventListener('keydown', function(e) {
    if (playerModal.style.display === 'flex') {
        if (e.key === 'Escape') closeModal.click();
        return;
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'].includes(e.key)) {
        e.preventDefault();
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        moveFocus(e.key === 'ArrowRight' ? 'right' : 'left');
        return;
    }

    switch(e.key) {
        case 'ArrowUp':
            navigationState = 'mainCategories';
            mainCategoriesPanel.style.display = 'flex';
            subCategoriesPanel.style.display = 'none';
            
            setTimeout(() => {
                const buttons = mainCategoriesPanel.querySelectorAll('.category-btn');
                if (buttons[currentMainCategoryIndex]) {
                    buttons[currentMainCategoryIndex].focus();
                } else if (buttons.length > 0) {
                    currentMainCategoryIndex = 0;
                    buttons[0].focus();
                    currentMainCategory = buttons[0].textContent;
                    updateMainCategoryActive();
                }
            }, 100);
            break;
            
        case 'ArrowDown':
            navigationState = 'channels';
            mainCategoriesPanel.style.display = 'flex';
            subCategoriesPanel.style.display = 'none';
            
            setTimeout(() => {
                const firstChannel = document.querySelector('.channel-card');
                if (firstChannel) firstChannel.focus();
            }, 100);
            break;
            
        case 'Enter':
            if (navigationState === 'mainCategories') {
                navigationState = 'subCategories';
                subCategoriesPanel.style.display = 'flex';
                
                setTimeout(() => {
                    const buttons = subCategoriesPanel.querySelectorAll('.subcategory-btn');
                    if (buttons.length > 0) {
                        buttons[0].focus();
                        currentSubCategoryIndex = 0;
                        currentSubcategory = buttons[0].textContent;
                        updateSubCategoryActive();
                    }
                }, 100);
            } else if (navigationState === 'subCategories') {
                const buttons = subCategoriesPanel.querySelectorAll('.subcategory-btn');
                if (buttons[currentSubCategoryIndex]) {
                    selectSubcategory(buttons[currentSubCategoryIndex].textContent, currentSubCategoryIndex);
                } else if (buttons.length > 0) {
                    selectSubcategory(buttons[0].textContent, 0);
                }
            } else if (navigationState === 'channels') {
                if (document.activeElement.classList.contains('channel-card')) {
                    const card = document.activeElement;
                    const index = parseInt(card.dataset.index);
                    if (currentMainCategory === 'Просмотренные') {
                        const watched = JSON.parse(localStorage.getItem('watchedChannels') || '[]');
                        if (index >= 0 && index < watched.length) {
                            const channel = watched[index];
                            openFullScreenPlayer(channel.name, channel.url, channel.group, channel.logo);
                        }
                    } else {
                        const url = categoryTree[currentMainCategory][currentSubcategory];
                        const channels = loadedPlaylists[url] || [];
                        if (index >= 0 && index < channels.length) {
                            const channel = channels[index];
                            openFullScreenPlayer(channel.name, channel.url, channel.group, channel.logo);
                        }
                    }
                }
            }
            break;
            
        case 'Escape':
            if (navigationState === 'subCategories') {
                navigationState = 'mainCategories';
                setTimeout(() => {
                    const buttons = mainCategoriesPanel.querySelectorAll('.category-btn');
                    if (buttons[currentMainCategoryIndex]) {
                        buttons[currentMainCategoryIndex].focus();
                    }
                }, 100);
            } else if (navigationState === 'mainCategories') {
                navigationState = 'channels';
                setTimeout(() => {
                    const firstChannel = document.querySelector('.channel-card');
                    if (firstChannel) firstChannel.focus();
                }, 100);
            }
            break;
    }
});

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});
