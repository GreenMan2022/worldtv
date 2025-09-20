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

// Просмотренные
let currentWatchedChannel = null;
let watchStartTime = null;

// 👇 Язык интерфейса
let currentLanguage = 'ru'; // по умолчанию

// Тексты интерфейса
const translations = {
    ru: {
        categories: "Категории",
        countries: "Страны",
        languages: "Языки",
        watched: "Просмотренные",
        news: "Новости",
        sports: "Спорт",
        football: "Футбол",
        basketball: "Баскетбол",
        tennis: "Теннис",
        movies: "Кино",
        action: "Боевики",
        comedy: "Комедии",
        drama: "Драмы",
        entertainment: "Развлечения",
        documentary: "Документальные",
        kids: "Детские",
        music: "Музыка",
        pop: "Поп",
        rock: "Рок",
        hiphop: "Хип-хоп",
        russia: "Россия",
        usa: "США",
        uk: "Великобритания",
        germany: "Германия",
        france: "Франция",
        italy: "Италия",
        spain: "Испания",
        china: "Китай",
        japan: "Япония",
        korea: "Корея",
        india: "Индия",
        brazil: "Бразилия",
        canada: "Канада",
        australia: "Австралия",
        russian: "Русский",
        english: "Английский",
        spanish: "Испанский",
        french: "Французский",
        german: "Немецкий",
        italian: "Итальянский",
        portuguese: "Португальский",
        chinese: "Китайский",
        japanese: "Японский",
        korean: "Корейский",
        arabic: "Арабский",
        turkish: "Турецкий",
        hindi: "Хинди",
        loading: "Загрузка...",
        errorInit: "Ошибка инициализации",
        errorApp: "Ошибка приложения",
        errorLoad: "Ошибка загрузки каналов",
        channelNotFound: "Каналы не найдены",
        channelUnavailable: "Канал недоступен",
        formatNotSupported: "Формат не поддерживается",
        clickToPlay: "Нажмите на видео для воспроизведения",
        addToWatchedSuccess: (name) => `✅ Канал "${name}" добавлен в "Просмотренные"`,
        alreadyInWatched: (name) => `ℹ️ Канал "${name}" уже в "Просмотренные"`,
        lastPlaylistLoaded: (main, sub) => `📂 Загружен последний плейлист: ${main} → ${sub}`,
        defaultPlaylist: '📂 Используем плейлист по умолчанию: "Просмотренные"',
        playlistSaved: (main, sub) => `💾 Сохранён плейлист: ${main} → ${sub}`,
        saveError: '❌ Не удалось сохранить последний плейлист:',
        parseError: '❌ Ошибка парсинга watchedChannels:',
        resetPlaylist: 'Последний плейлист сброшен',
        scrollRestored: 'Позиция прокрутки восстановлена',
        determiningLocation: 'Определение вашего местоположения...'
    },
    en: {
        categories: "Categories",
        countries: "Countries",
        languages: "Languages",
        watched: "Watched",
        news: "News",
        sports: "Sports",
        football: "Football",
        basketball: "Basketball",
        tennis: "Tennis",
        movies: "Movies",
        action: "Action",
        comedy: "Comedy",
        drama: "Drama",
        entertainment: "Entertainment",
        documentary: "Documentary",
        kids: "Kids",
        music: "Music",
        pop: "Pop",
        rock: "Rock",
        hiphop: "Hip-Hop",
        russia: "Russia",
        usa: "USA",
        uk: "United Kingdom",
        germany: "Germany",
        france: "France",
        italy: "Italy",
        spain: "Spain",
        china: "China",
        japan: "Japan",
        korea: "Korea",
        india: "India",
        brazil: "Brazil",
        canada: "Canada",
        australia: "Australia",
        russian: "Russian",
        english: "English",
        spanish: "Spanish",
        french: "French",
        german: "German",
        italian: "Italian",
        portuguese: "Portuguese",
        chinese: "Chinese",
        japanese: "Japanese",
        korean: "Korean",
        arabic: "Arabic",
        turkish: "Turkish",
        hindi: "Hindi",
        loading: "Loading...",
        errorInit: "Initialization error",
        errorApp: "Application error",
        errorLoad: "Failed to load channels",
        channelNotFound: "Channels not found",
        channelUnavailable: "Channel unavailable",
        formatNotSupported: "Format not supported",
        clickToPlay: "Click video to play",
        addToWatchedSuccess: (name) => `✅ Channel "${name}" added to "Watched"`,
        alreadyInWatched: (name) => `ℹ️ Channel "${name}" already in "Watched"`,
        lastPlaylistLoaded: (main, sub) => `📂 Loaded last playlist: ${main} → ${sub}`,
        defaultPlaylist: '📂 Using default playlist: "Watched"',
        playlistSaved: (main, sub) => `💾 Playlist saved: ${main} → ${sub}`,
        saveError: '❌ Failed to save last playlist:',
        parseError: '❌ Error parsing watchedChannels:',
        resetPlaylist: 'Last playlist reset',
        scrollRestored: 'Scroll position restored',
        determiningLocation: 'Detecting your location...'
    }
};

// 👇 Безопасная функция перевода — принимает аргументы
function t(key, ...args) {
    const dict = translations[currentLanguage] || translations['en'];
    let str = dict[key];

    // Если перевод не найден — fallback на английский или ключ
    if (str === undefined) {
        console.warn(`⚠️ Перевод "${key}" не найден для языка ${currentLanguage}`);
        str = translations['en']?.[key] || key;
    }

    // Если это функция — вызываем с аргументами
    if (typeof str === 'function') {
        return str(...args);
    }

    // Если строка — возвращаем как есть
    return str;
}

// 👇 Определение языка по IP — с fallback и защитой от ошибок
async function detectLanguageByIP() {
    // Если уже определено — не повторяем
    const savedLang = localStorage.getItem('userLanguage');
    if (savedLang) {
        currentLanguage = savedLang;
        return;
    }

    let countryCode = null;

    // Попробуем ipapi.co
    try {
        const response = await fetch('https://ipapi.co/json/', {
            method: 'GET',
            mode: 'cors'
        });
        if (response.ok) {
            const data = await response.json();
            countryCode = data.country_code;
            console.log(`🌍 Определена страна: ${countryCode}`);
        }
    } catch (e) {
        console.warn('⚠️ ipapi.co недоступен:', e.message);
    }

    // Fallback: попробуем ipwho.is
    if (!countryCode) {
        try {
            const response = await fetch('https://ipwho.is/', {
                method: 'GET',
                mode: 'cors'
            });
            if (response.ok) {
                const data = await response.json();
                countryCode = data.country_code;
                console.log(`🌍 Определена страна (через ipwho.is): ${countryCode}`);
            }
        } catch (e) {
            console.warn('⚠️ ipwho.is недоступен:', e.message);
        }
    }

    // Если всё ещё не определено — ставим английский
    currentLanguage = countryCode === 'RU' ? 'ru' : 'en';

    // Сохраняем выбор
    try {
        localStorage.setItem('userLanguage', currentLanguage);
        console.log(`🌐 Установлен язык: ${currentLanguage}`);
    } catch (e) {
        console.error('❌ Не удалось сохранить язык в localStorage:', e);
    }
}

// 👇 Структура плейлистов — с поддержкой перевода
const categoryTree = {
    [t('watched')]: {},
    [t('categories')]: {
        [t('news')]: "https://iptv-org.github.io/iptv/categories/news.m3u",
        [t('sports')]: "https://iptv-org.github.io/iptv/categories/sports.m3u",
        [t('football')]: "https://iptv-org.github.io/iptv/categories/football.m3u",
        [t('basketball')]: "https://iptv-org.github.io/iptv/categories/basketball.m3u",
        [t('tennis')]: "https://iptv-org.github.io/iptv/categories/tennis.m3u",
        [t('movies')]: "https://iptv-org.github.io/iptv/categories/movies.m3u",
        [t('action')]: "https://iptv-org.github.io/iptv/categories/action.m3u",
        [t('comedy')]: "https://iptv-org.github.io/iptv/categories/comedy.m3u",
        [t('drama')]: "https://iptv-org.github.io/iptv/categories/drama.m3u",
        [t('entertainment')]: "https://iptv-org.github.io/iptv/categories/entertainment.m3u",
        [t('documentary')]: "https://iptv-org.github.io/iptv/categories/documentary.m3u",
        [t('kids')]: "https://iptv-org.github.io/iptv/categories/kids.m3u",
        [t('music')]: "https://iptv-org.github.io/iptv/categories/music.m3u",
        [t('pop')]: "https://iptv-org.github.io/iptv/categories/pop.m3u",
        [t('rock')]: "https://iptv-org.github.io/iptv/categories/rock.m3u",
        [t('hiphop')]: "https://iptv-org.github.io/iptv/categories/hiphop.m3u"
    },
    [t('countries')]: {
        [t('russia')]: "https://iptv-org.github.io/iptv/countries/ru.m3u",
        [t('usa')]: "https://iptv-org.github.io/iptv/countries/us.m3u",
        [t('uk')]: "https://iptv-org.github.io/iptv/countries/gb.m3u",
        [t('germany')]: "https://iptv-org.github.io/iptv/countries/de.m3u",
        [t('france')]: "https://iptv-org.github.io/iptv/countries/fr.m3u",
        [t('italy')]: "https://iptv-org.github.io/iptv/countries/it.m3u",
        [t('spain')]: "https://iptv-org.github.io/iptv/countries/es.m3u",
        [t('china')]: "https://iptv-org.github.io/iptv/countries/cn.m3u",
        [t('japan')]: "https://iptv-org.github.io/iptv/countries/jp.m3u",
        [t('korea')]: "https://iptv-org.github.io/iptv/countries/kr.m3u",
        [t('india')]: "https://iptv-org.github.io/iptv/countries/in.m3u",
        [t('brazil')]: "https://iptv-org.github.io/iptv/countries/br.m3u",
        [t('canada')]: "https://iptv-org.github.io/iptv/countries/ca.m3u",
        [t('australia')]: "https://iptv-org.github.io/iptv/countries/au.m3u"
    },
    [t('languages')]: {
        [t('russian')]: "https://iptv-org.github.io/iptv/languages/rus.m3u",
        [t('english')]: "https://iptv-org.github.io/iptv/languages/eng.m3u",
        [t('spanish')]: "https://iptv-org.github.io/iptv/languages/spa.m3u",
        [t('french')]: "https://iptv-org.github.io/iptv/languages/fra.m3u",
        [t('german')]: "https://iptv-org.github.io/iptv/languages/deu.m3u",
        [t('italian')]: "https://iptv-org.github.io/iptv/languages/ita.m3u",
        [t('portuguese')]: "https://iptv-org.github.io/iptv/languages/por.m3u",
        [t('chinese')]: "https://iptv-org.github.io/iptv/languages/zho.m3u",
        [t('japanese')]: "https://iptv-org.github.io/iptv/languages/jpn.m3u",
        [t('korean')]: "https://iptv-org.github.io/iptv/languages/kor.m3u",
        [t('arabic')]: "https://iptv-org.github.io/iptv/languages/ara.m3u",
        [t('turkish')]: "https://iptv-org.github.io/iptv/languages/tur.m3u",
        [t('hindi')]: "https://iptv-org.github.io/iptv/languages/hin.m3u"
    }
};

// Закрытие модального окна
closeModal.addEventListener('click', function() {
    playerModal.style.display = 'none';
    videoPlayerElement.pause();
    videoPlayerElement.src = '';

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

// Просмотренные: Добавление в localStorage — с защитой от ошибок
function addToWatched(name, url, group, logo) {
    let watched;
    try {
        const raw = localStorage.getItem('watchedChannels');
        watched = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(watched)) {
            console.warn('⚠️ watchedChannels не массив — сброс');
            watched = [];
        }
    } catch (e) {
        console.error(t('parseError'), e);
        watched = [];
    }

    if (watched.some(item => item.url === url)) {
        console.log(t('alreadyInWatched', name));
        return;
    }

    watched.push({ name, url, group, logo });
    try {
        localStorage.setItem('watchedChannels', JSON.stringify(watched));
        console.log(t('addToWatchedSuccess', name));
    } catch (e) {
        console.error('❌ Не удалось сохранить в localStorage:', e);
        showToast('Ошибка сохранения');
        return;
    }

    if (currentMainCategory === t('watched')) {
        loadAndRenderChannels(t('watched'), '');
    }
}

// 👇 Сохранение позиции скролла
function saveScrollPosition() {
    if (navigationState === 'channels') {
        try {
            const key = `scroll_${currentMainCategory}_${currentSubcategory}`;
            localStorage.setItem(key, channelsContainer.scrollTop.toString());
        } catch (e) {
            console.error('❌ Не удалось сохранить позицию скролла:', e);
        }
    }
}

// 👇 Восстановление позиции скролла
function restoreScrollPosition() {
    try {
        const key = `scroll_${currentMainCategory}_${currentSubcategory}`;
        const saved = localStorage.getItem(key);
        if (saved) {
            setTimeout(() => {
                channelsContainer.scrollTop = parseInt(saved);
                console.log(t('scrollRestored'));
            }, 100);
        }
    } catch (e) {
        console.error('❌ Не удалось восстановить позицию скролла:', e);
    }
}

// Инициализация приложения
async function initApp() {
    const safetyTimeout = setTimeout(() => {
        initialLoader.style.display = 'none';
        showToast(t('errorInit'));
    }, 10000);

    try {
        // 👇 Определяем язык асинхронно, без блокировки
        detectLanguageByIP().catch(e => {
            console.error('❌ Ошибка определения языка:', e);
            currentLanguage = 'en';
            try { localStorage.setItem('userLanguage', currentLanguage); } catch {}
        });

        // 👇 Загружаем последний плейлист
        let lastMain = localStorage.getItem('lastMainCategory');
        let lastSub = localStorage.getItem('lastSubcategory');

        if (lastMain && lastSub && categoryTree[lastMain] && categoryTree[lastMain][lastSub]) {
            currentMainCategory = lastMain;
            currentSubcategory = lastSub;
            console.log(t('lastPlaylistLoaded', lastMain, lastSub));
        } else {
            currentMainCategory = t('watched');
            currentSubcategory = '';
            console.log(t('defaultPlaylist'));
        }

        renderMainCategories();
        renderSubCategories();
        loadAndRenderChannels(currentMainCategory, currentSubcategory);
        
        setTimeout(() => {
            const firstChannel = document.querySelector('.channel-card');
            if (firstChannel) firstChannel.focus();
            restoreScrollPosition();
        }, 500);

        channelsContainer.addEventListener('scroll', debounce(saveScrollPosition, 300));
        
        clearTimeout(safetyTimeout);
    } catch (error) {
        clearTimeout(safetyTimeout);
        console.error("❌ Критическая ошибка инициализации:", error);
        initialLoader.style.display = 'none';
        showToast(t('errorApp'));
    }
}

// Debounce функция
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
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
    const firstSub = categoryTree[categoryName] ? Object.keys(categoryTree[categoryName])[0] : '';
    currentSubcategory = firstSub || '';
    currentSubCategoryIndex = 0;
    renderSubCategories();
    
    setTimeout(() => {
        const buttons = mainCategoriesPanel.querySelectorAll('.category-btn');
        if (buttons[index]) buttons[index].focus();
    }, 100);
}

// Выбор подкатегории + сохранение в localStorage
function selectSubcategory(subcategoryName, index) {
    currentSubcategory = subcategoryName;
    currentSubCategoryIndex = index;

    try {
        localStorage.setItem('lastMainCategory', currentMainCategory);
        localStorage.setItem('lastSubcategory', subcategoryName);
        console.log(t('playlistSaved', currentMainCategory, subcategoryName));
    } catch (e) {
        console.error(t('saveError'), e);
    }

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
    if (mainCategory === t('watched')) {
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
        showToast(t('errorLoad'));
        renderChannels([]);
    } finally {
        initialLoader.style.display = 'none';
        setTimeout(() => {
            const firstChannel = document.querySelector('.channel-card');
            if (firstChannel) firstChannel.focus();
            restoreScrollPosition();
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
                ${initialLoader.style.display === 'none' ? t('channelNotFound') : t('loading')}
            </div>`;
        return;
    }
    
    channelsToRender.forEach((channel, index) => {
        const groupIcon = getGroupIcon(channel.group);
        const channelCard = document.createElement('div');
        channelCard.className = 'channel-card';
        channelCard.setAttribute('tabindex', '0');
        channelCard.dataset.index = index;
        
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
        
        const miniPlayer = createMiniPlayer(channel.url);
        mediaContainer.appendChild(miniPlayer);
        
        const infoContainer = document.createElement('div');
        infoContainer.className = 'channel-info';
        infoContainer.innerHTML = `<h3>${channel.name}</h3><p>${channel.group}</p>`;
        
        channelCard.appendChild(mediaContainer);
        channelCard.appendChild(infoContainer);
        
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
            showToast(t('channelUnavailable'));
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
            video.play().catch(e => {
                console.log("Autoplay blocked:", e);
                showToast(t('clickToPlay'));
            });
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
            video.play().catch(e => {
                console.log("Autoplay blocked:", e);
                showToast(t('clickToPlay'));
            });
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
    showToast(t('channelUnavailable'));
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

// Открытие полноэкранного плеера
function openFullScreenPlayer(name, url, group, logo) {
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
            showToast(t('channelUnavailable'));
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
                showToast(t('clickToPlay'));
            });
            setTimeout(() => requestNativeFullscreen(), 1000);
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                clearTimeout(timeoutId);
                showToast(t('channelUnavailable'));
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
                showToast(t('clickToPlay'));
            });
            setTimeout(() => requestNativeFullscreen(), 1000);
        });
        videoPlayerElement.addEventListener('error', () => {
            clearTimeout(timeoutId);
            showToast(t('channelUnavailable'));
            addToBlacklist(url);
            playerModal.style.display = 'none';
        });
    } else {
        clearTimeout(timeoutId);
        showToast(t('formatNotSupported'));
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
    if (group.includes('новости') || group.includes('news')) return 'fa-newspaper';
    if (group.includes('спорт') || group.includes('sports') || group.includes('football') || group.includes('basketball') || group.includes('tennis')) return 'fa-futbol';
    if (group.includes('кино') || group.includes('movies') || group.includes('action') || group.includes('comedy') || group.includes('drama')) return 'fa-film';
    if (group.includes('музыка') || group.includes('music') || group.includes('pop') || group.includes('rock') || group.includes('hiphop')) return 'fa-music';
    if (group.includes('детск') || group.includes('kids')) return 'fa-child';
    if (group.includes('документ') || group.includes('documentary')) return 'fa-video';
    if (group.includes('развлеч') || group.includes('entertainment')) return 'fa-theater-masks';
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
                const list = currentMainCategory === t('watched')
                    ? JSON.parse(localStorage.getItem('watchedChannels') || '[]')
                    : loadedPlaylists[categoryTree[currentMainCategory][currentSubcategory]] || [];
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
