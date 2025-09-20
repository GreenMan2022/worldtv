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

// 👇 Просмотренные: Новые переменные
let currentWatchedChannel = null; // { name, url, group, logo }
let watchStartTime = null;        // timestamp открытия плеера

// Структура плейлистов
const categoryTree = {
  "Просмотренные": {},
  "Свой плейлист": {}, // ← ДОБАВЛЕНО
  "Категории": {
    "Новости": "https://iptv-org.github.io/iptv/categories/news.m3u  ",
    "Спорт": "https://iptv-org.github.io/iptv/categories/sports.m3u  ",
    "Футбол": "https://iptv-org.github.io/iptv/categories/football.m3u  ",
    "Баскетбол": "https://iptv-org.github.io/iptv/categories/basketball.m3u  ",
    "Теннис": "https://iptv-org.github.io/iptv/categories/tennis.m3u  ",
    "Кино": "https://iptv-org.github.io/iptv/categories/movies.m3u  ",
    "Боевики": "https://iptv-org.github.io/iptv/categories/action.m3u  ",
    "Комедии": "https://iptv-org.github.io/iptv/categories/comedy.m3u  ",
    "Драмы": "https://iptv-org.github.io/iptv/categories/drama.m3u  ",
    "Развлечения": "https://iptv-org.github.io/iptv/categories/entertainment.m3u  ",
    "Документальные": "https://iptv-org.github.io/iptv/categories/documentary.m3u  ",
    "Детские": "https://iptv-org.github.io/iptv/categories/kids.m3u  ",
    "Музыка": "https://iptv-org.github.io/iptv/categories/music.m3u  ",
    "Поп": "https://iptv-org.github.io/iptv/categories/pop.m3u  ",
    "Рок": "https://iptv-org.github.io/iptv/categories/rock.m3u  ",
    "Хип-хоп": "https://iptv-org.github.io/iptv/categories/hiphop.m3u  "
  },
  "Страны": {
    "Россия": "https://iptv-org.github.io/iptv/countries/ru.m3u  ",
    "США": "https://iptv-org.github.io/iptv/countries/us.m3u  ",
    "Великобритания": "https://iptv-org.github.io/iptv/countries/gb.m3u  ",
    "Германия": "https://iptv-org.github.io/iptv/countries/de.m3u  ",
    "Франция": "https://iptv-org.github.io/iptv/countries/fr.m3u  ",
    "Италия": "https://iptv-org.github.io/iptv/countries/it.m3u  ",
    "Испания": "https://iptv-org.github.io/iptv/countries/es.m3u  ",
    "Китай": "https://iptv-org.github.io/iptv/countries/cn.m3u  ",
    "Япония": "https://iptv-org.github.io/iptv/countries/jp.m3u  ",
    "Корея": "https://iptv-org.github.io/iptv/countries/kr.m3u  ",
    "Индия": "https://iptv-org.github.io/iptv/countries/in.m3u  ",
    "Бразилия": "https://iptv-org.github.io/iptv/countries/br.m3u  ",
    "Канада": "https://iptv-org.github.io/iptv/countries/ca.m3u  ",
    "Австралия": "https://iptv-org.github.io/iptv/countries/au.m3u  "
  },
  "Языки": {
    "Русский": "https://iptv-org.github.io/iptv/languages/rus.m3u  ",
    "Английский": "https://iptv-org.github.io/iptv/languages/eng.m3u  ",
    "Испанский": "https://iptv-org.github.io/iptv/languages/spa.m3u  ",
    "Французский": "https://iptv-org.github.io/iptv/languages/fra.m3u  ",
    "Немецкий": "https://iptv-org.github.io/iptv/languages/deu.m3u  ",
    "Итальянский": "https://iptv-org.github.io/iptv/languages/ita.m3u  ",
    "Португальский": "https://iptv-org.github.io/iptv/languages/por.m3u  ",
    "Китайский": "https://iptv-org.github.io/iptv/languages/zho.m3u  ",
    "Японский": "https://iptv-org.github.io/iptv/languages/jpn.m3u  ",
    "Корейский": "https://iptv-org.github.io/iptv/languages/kor.m3u  ",
    "Арабский": "https://iptv-org.github.io/iptv/languages/ara.m3u  ",
    "Турецкий": "https://iptv-org.github.io/iptv/languages/tur.m3u  ",
    "Хинди": "https://iptv-org.github.io/iptv/languages/hin.m3u  "
  }
};

// Закрытие модального окна
closeModal.addEventListener('click', function() {
    playerModal.style.display = 'none';
    videoPlayerElement.pause();
    videoPlayerElement.src = '';

    // 👇 Просмотренные: Проверка времени при закрытии
    if (currentWatchedChannel && watchStartTime) {
        const watchedSeconds = Math.floor((Date.now() - watchStartTime) / 1000);
        console.log(`📺 Просмотрено: ${watchedSeconds} секунд`);

        if (watchedSeconds >= 60) {
            addToWatched(
                currentWatchedChannel.name,
                currentWatchedChannel.url,
                currentWatchedChannel.group,
                currentWatchedChannel.logo
            );
        }

        // Сброс
        currentWatchedChannel = null;
        watchStartTime = null;
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

// 👇 Просмотренные: Добавление в localStorage — с защитой от ошибок
function addToWatched(name, url, group, logo) {
    // Безопасное получение массива из localStorage
    let watched;
    try {
        const raw = localStorage.getItem('watchedChannels');
        watched = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(watched)) {
            console.warn('⚠️ watchedChannels не массив — сброс');
            watched = [];
        }
    } catch (e) {
        console.error('❌ Ошибка парсинга watchedChannels:', e);
        watched = [];
    }

    // Проверка дубликатов
    if (watched.some(item => item.url === url)) {
        console.log(`ℹ️ Канал "${name}" уже в "Просмотренные"`);
        return;
    }

    // Добавляем
    watched.push({ name, url, group, logo });
    try {
        localStorage.setItem('watchedChannels', JSON.stringify(watched));
        console.log(`✅ Канал "${name}" добавлен в "Просмотренные"`);
    } catch (e) {
        console.error('❌ Не удалось сохранить в localStorage:', e);
        showToast('Ошибка сохранения');
        return;
    }

    // Если сейчас открыта категория "Просмотренные" — обновляем
    if (currentMainCategory === 'Просмотренные') {
        loadAndRenderChannels('Просмотренные', '');
    }
}

// 👇 Свой плейлист: Загрузка по ссылке
async function loadPlaylistFromURL() {
    const urlInput = document.getElementById('playlistURL');
    const url = urlInput.value.trim();
    if (!url) {
        showToast('Введите ссылку');
        return;
    }

    initialLoader.style.display = 'flex';
    try {
        const content = await fetchM3U(url);
        const channels = parseM3UContent(content, 'Свой плейлист');
        localStorage.setItem('customPlaylist', JSON.stringify(channels));
        showToast('Плейлист загружен!');
        loadAndRenderChannels('Свой плейлист', '');
    } catch (err) {
        console.error('Ошибка загрузки по URL:', err);
        showToast('Не удалось загрузить плейлист');
    } finally {
        initialLoader.style.display = 'none';
    }
}

// 👇 Свой плейлист: Показать интерфейс загрузки
function showCustomPlaylistUploadUI() {
    channelsContainer.innerHTML = `
        <div style="padding: 40px; text-align: center; color: #aaa; width: 100%;">
            <h3>Загрузите свой плейлист</h3>
            <p>Поддерживается формат M3U</p>
            
            <div style="margin: 30px 0; display: flex; flex-direction: column; gap: 15px; align-items: center;">
                <input type="file" id="uploadM3UFile" accept=".m3u,.m3u8" style="display: none;">
                <button onclick="document.getElementById('uploadM3UFile').click()" 
                        style="padding: 12px 24px; background: #ff375f; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    Загрузить файл
                </button>
                
                <div style="width: 100%; max-width: 400px;">
                    <input type="text" id="playlistURL" 
                           placeholder="https://example.com/playlist.m3u" 
                           style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #444; background: #222; color: white; margin-bottom: 10px;">
                    <button onclick="loadPlaylistFromURL()" 
                            style="width: 100%; padding: 10px; background: #ff5e41; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        Загрузить по ссылке
                    </button>
                </div>

                <button onclick="localStorage.removeItem('customPlaylist'); showCustomPlaylistUploadUI();" 
                        style="margin-top: 10px; padding: 8px 16px; background: #555; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    Очистить и загрузить заново
                </button>
            </div>
        </div>
    `;

    // Обработчик загрузки файла
    const fileInput = document.getElementById('uploadM3UFile');
    fileInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async function(event) {
            try {
                const content = event.target.result;
                const channels = parseM3UContent(content, 'Свой плейлист');
                localStorage.setItem('customPlaylist', JSON.stringify(channels));
                showToast('Плейлист загружен!');
                loadAndRenderChannels('Свой плейлист', '');
            } catch (err) {
                console.error('Ошибка загрузки файла:', err);
                showToast('Ошибка загрузки файла');
            }
        };
        reader.readAsText(file);
    });
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
        
        btn.addEventListener('click', () => selectMainCategory(cat, index));
        btn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
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
        
        btn.addEventListener('click', () => selectSubcategory(subcat, index));
        btn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
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
    currentSubcategory = '';
    currentSubCategoryIndex = 0;

    renderSubCategories();

    // 👇 Сразу загружаем каналы, если выбрана категория без подкатегорий (например, "Просмотренные" или "Свой плейлист")
    if (!categoryTree[categoryName] || Object.keys(categoryTree[categoryName]).length === 0) {
        loadAndRenderChannels(currentMainCategory, currentSubcategory);
    }

    setTimeout(() => {
        const buttons = mainCategoriesPanel.querySelectorAll('.category-btn');
        if (buttons[index]) buttons[index].focus();
    }, 100);
}

// Выбор подкатегории
function selectSubcategory(subcategoryName, index) {
    currentSubcategory = subcategoryName;
    currentSubCategoryIndex = index;
    loadAndRenderChannels(currentMainCategory, currentSubcategory);
    
    setTimeout(() => {
        const firstChannel = document.querySelector('.channel-card');
        if (firstChannel) firstChannel.focus();
    }, 100);
}

// Обновить активную кнопку в главном меню
function updateMainCategoryActive() {
    const buttons = mainCategoriesPanel.querySelectorAll('.category-btn');
    buttons.forEach((btn, i) => {
        if (i === currentMainCategoryIndex) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

// Обновить активную кнопку в подменю
function updateSubCategoryActive() {
    const buttons = subCategoriesPanel.querySelectorAll('.subcategory-btn');
    buttons.forEach((btn, i) => {
        if (i === currentSubCategoryIndex) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

// Загрузка и отображение каналов
async function loadAndRenderChannels(mainCategory, subcategory) {
    // 👇 Просмотренные: Обработка с защитой
    if (mainCategory === 'Просмотренные') {
        initialLoader.style.display = 'none';
        let watched;
        try {
            const raw = localStorage.getItem('watchedChannels');
            watched = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(watched)) {
                console.warn('⚠️ watchedChannels не массив — сброс при загрузке');
                watched = [];
                localStorage.setItem('watchedChannels', '[]');
            }
        } catch (e) {
            console.error('❌ Ошибка парсинга при загрузке:', e);
            watched = [];
            localStorage.setItem('watchedChannels', '[]');
        }
        renderChannels(watched);
        return;
    }

    // 👇 Свой плейлист: загрузка из localStorage
    if (mainCategory === 'Свой плейлист') {
        initialLoader.style.display = 'none';
        let customPlaylist;
        try {
            const raw = localStorage.getItem('customPlaylist');
            customPlaylist = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(customPlaylist)) {
                console.warn('⚠️ customPlaylist не массив — сброс');
                customPlaylist = [];
                localStorage.removeItem('customPlaylist');
            }
        } catch (e) {
            console.error('❌ Ошибка парсинга customPlaylist:', e);
            customPlaylist = [];
            localStorage.removeItem('customPlaylist');
        }
        renderChannels(customPlaylist);
        // 👇 Если плейлист пуст — показать интерфейс загрузки
        if (customPlaylist.length === 0) {
            showCustomPlaylistUploadUI();
        }
        return;
    }

    if (!categoryTree[mainCategory] || !categoryTree[mainCategory][subcategory]) {
        renderChannels([]);
        return;
    }
    
    const url = categoryTree[mainCategory][subcategory];
    initialLoader.style.display = 'flex';
    
    try {
        let channels = loadedPlaylists[url] || await fetchAndCachePlaylist(url, subcategory);
        renderChannels(channels);
    } catch (error) {
        console.error("Ошибка загрузки:", error);
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

// Загрузка и кэширование плейлиста
async function fetchAndCachePlaylist(url, group) {
    const content = await fetchM3U(url);
    const channels = parseM3UContent(content, group);
    loadedPlaylists[url] = channels;
    return channels;
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
                
                channels.push({ name, url: urlLine.trim(), group: assignedCategory, logo });
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
        
        // Информация
        const infoContainer = document.createElement('div');
        infoContainer.className = 'channel-info';
        infoContainer.innerHTML = `<h3>${channel.name}</h3><p>${channel.group}</p>`;
        
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
        
        // Открытие плеера
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
                handleStreamError(url, miniPlayer);
                addToBlacklist(url);
                miniPlayer.style.display = 'none';
                icon.style.display = 'block';
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
            handleStreamError(url, miniPlayer);
            addToBlacklist(url);
            miniPlayer.style.display = 'none';
            icon.style.display = 'block';
        });
    }
}

// Обработка ошибки потока
function handleStreamError(url, container) {
    showToast('Канал недоступен');
    console.error("Ошибка потока:", url);
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

// 👇 Просмотренные: Открытие полноэкранного плеера
function openFullScreenPlayer(name, url, group, logo) {
    // 👇 Запоминаем канал и время открытия
    currentWatchedChannel = { name, url, group, logo };
    watchStartTime = Date.now();

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
            videoPlayerElement.play().catch(e => {
                console.log("Autoplay blocked:", e);
                showToast("Нажмите на видео для воспроизведения");
            });
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
            videoPlayerElement.play().catch(e => {
                console.log("Autoplay blocked:", e);
                showToast("Нажмите на видео для воспроизведения");
            });
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

// Перемещение фокуса
function moveFocus(direction) {
    if (navigationState === 'channels') {
        const cards = document.querySelectorAll('.channel-card');
        if (cards.length === 0) return;
        const currentIndex = Array.from(cards).indexOf(document.activeElement);
        const cols = Math.floor(channelsContainer.offsetWidth / 280) || 1;
        let nextIndex = currentIndex;

        switch(direction) {
            case 'right': nextIndex = (currentIndex + 1) % cards.length; break;
            case 'left': nextIndex = (currentIndex - 1 + cards.length) % cards.length; break;
            case 'down': nextIndex = (currentIndex + cols) % cards.length; break;
            case 'up': nextIndex = (currentIndex - cols + cards.length) % cards.length; break;
        }

        if (nextIndex >= 0 && nextIndex < cards.length) {
            cards[nextIndex].focus();
        }
    } else if (navigationState === 'mainCategories') {
        const buttons = mainCategoriesPanel.querySelectorAll('.category-btn');
        if (buttons.length === 0) return;
        let nextIndex = direction === 'right'
            ? (currentMainCategoryIndex + 1) % buttons.length
            : (currentMainCategoryIndex - 1 + buttons.length) % buttons.length;
        currentMainCategoryIndex = nextIndex;
        currentMainCategory = buttons[nextIndex].textContent;
        updateMainCategoryActive();
        buttons[nextIndex].focus();
    } else if (navigationState === 'subCategories') {
        const buttons = subCategoriesPanel.querySelectorAll('.subcategory-btn');
        if (buttons.length === 0) return;
        let nextIndex = direction === 'right'
            ? (currentSubCategoryIndex + 1) % buttons.length
            : (currentSubCategoryIndex - 1 + buttons.length) % buttons.length;
        currentSubCategoryIndex = nextIndex;
        currentSubcategory = buttons[nextIndex].textContent;
        updateSubCategoryActive();
        buttons[nextIndex].focus();
    }
}

// Обработчик клавиш
document.addEventListener('keydown', function(e) {
    if (playerModal.style.display === 'flex') {
        if (e.key === 'Escape') closeModal.click();
        return;
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'].includes(e.key)) {
        e.preventDefault();
    }

    switch(e.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
            moveFocus(e.key === 'ArrowRight' ? 'right' : 'left');
            break;
        case 'ArrowUp':
            navigationState = 'mainCategories';
            mainCategoriesPanel.style.display = 'flex';
            subCategoriesPanel.style.display = 'none';
            setTimeout(() => {
                const buttons = mainCategoriesPanel.querySelectorAll('.category-btn');
                if (buttons[currentMainCategoryIndex]) {
                    buttons[currentMainCategoryIndex].focus();
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
                }
            } else if (navigationState === 'channels' && document.activeElement.classList.contains('channel-card')) {
                const card = document.activeElement;
                const index = parseInt(card.dataset.index);
                let list;
                if (currentMainCategory === 'Просмотренные') {
                    list = JSON.parse(localStorage.getItem('watchedChannels') || '[]');
                } else if (currentMainCategory === 'Свой плейлист') {
                    list = JSON.parse(localStorage.getItem('customPlaylist') || '[]');
                } else {
                    list = loadedPlaylists[categoryTree[currentMainCategory][currentSubcategory]] || [];
                }
                if (index >= 0 && index < list.length) {
                    const channel = list[index];
                    openFullScreenPlayer(channel.name, channel.url, channel.group, channel.logo);
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
