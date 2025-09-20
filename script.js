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
let watchTimer = null;

// Язык интерфейса
let currentLanguage = 'ru';

// Тексты
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
        english: "Английский"
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
        english: "English"
    }
};

// Перевод
function t(key) {
    return translations[currentLanguage][key] || key;
}

// Определение языка по IP (без блокировки)
function detectLanguage() {
    fetch('https://ipapi.co/json/')
        .then(r => r.json())
        .then(data => {
            currentLanguage = data.country_code === 'RU' ? 'ru' : 'en';
            localStorage.setItem('userLanguage', currentLanguage);
            location.reload(); // Перезагружаем для применения
        })
        .catch(() => {
            // При ошибке оставляем 'ru' или сохранённый
            const saved = localStorage.getItem('userLanguage');
            if (saved) currentLanguage = saved;
        });
}

// Структура категорий — статическая, с переводами
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
        [t('english')]: "https://iptv-org.github.io/iptv/languages/eng.m3u"
    }
};

// Смена языка
function switchLanguage() {
    currentLanguage = currentLanguage === 'ru' ? 'en' : 'ru';
    localStorage.setItem('userLanguage', currentLanguage);
    location.reload(); // Просто перезагружаем — самый надёжный способ
}

// Закрытие модального окна
closeModal.addEventListener('click', function() {
    playerModal.style.display = 'none';
    videoPlayerElement.pause();
    videoPlayerElement.src = '';
    if (watchTimer) {
        clearTimeout(watchTimer);
        watchTimer = null;
    }
});

// Уведомление
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Добавление в просмотренные
function addToWatched(name, url, group, logo) {
    let watched = JSON.parse(localStorage.getItem('watchedChannels') || '[]');
    if (watched.some(ch => ch.url === url)) return;
    watched.push({ name, url, group, logo });
    localStorage.setItem('watchedChannels', JSON.stringify(watched));
    if (currentMainCategory === t('watched')) {
        loadAndRenderChannels(t('watched'), '');
    }
}

// Инициализация
function initApp() {
    const savedLang = localStorage.getItem('userLanguage');
    if (savedLang) {
        currentLanguage = savedLang;
    } else {
        detectLanguage(); // Запускаем асинхронно, не ждём
    }

    // Восстанавливаем последний плейлист
    const lastMain = localStorage.getItem('lastMainCategory');
    const lastSub = localStorage.getItem('lastSubcategory');
    if (lastMain && lastSub && categoryTree[lastMain]?.[lastSub]) {
        currentMainCategory = lastMain;
        currentSubcategory = lastSub;
    }

    renderMainCategories();
    renderSubCategories();
    loadAndRenderChannels(currentMainCategory, currentSubcategory);

    setTimeout(() => {
        const first = document.querySelector('.channel-card');
        if (first) first.focus();
    }, 500);
}

// Главные категории
function renderMainCategories() {
    mainCategoriesPanel.innerHTML = '';
    const cats = Object.keys(categoryTree);
    cats.forEach((cat, i) => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = cat;
        if (cat === currentMainCategory) {
            btn.classList.add('active');
            currentMainCategoryIndex = i;
        }
        btn.onclick = () => selectMainCategory(cat, i);
        mainCategoriesPanel.appendChild(btn);
    });

    // 👇 Кнопка смены языка
    const langBtn = document.createElement('button');
    langBtn.className = 'category-btn';
    langBtn.textContent = currentLanguage === 'ru' ? '🇬🇧 EN' : '🇷🇺 RU';
    langBtn.style.backgroundColor = '#555';
    langBtn.onclick = switchLanguage;
    mainCategoriesPanel.appendChild(langBtn);
}

// Подкатегории
function renderSubCategories() {
    subCategoriesPanel.innerHTML = '';
    subCategoriesPanel.style.display = 'none';
    if (!categoryTree[currentMainCategory]) return;
    const subs = Object.keys(categoryTree[currentMainCategory]);
    subs.forEach((sub, i) => {
        const btn = document.createElement('button');
        btn.className = 'subcategory-btn';
        btn.textContent = sub;
        if (sub === currentSubcategory) {
            btn.classList.add('active');
            currentSubCategoryIndex = i;
        }
        btn.onclick = () => selectSubcategory(sub, i);
        subCategoriesPanel.appendChild(btn);
    });
    if (subs.length > 0) subCategoriesPanel.style.display = 'flex';
}

// Выбор главной категории
function selectMainCategory(cat, index) {
    currentMainCategory = cat;
    currentMainCategoryIndex = index;
    const firstSub = Object.keys(categoryTree[cat])[0] || '';
    currentSubcategory = firstSub;
    currentSubCategoryIndex = 0;
    renderSubCategories();
    loadAndRenderChannels(cat, firstSub);
}

// Выбор подкатегории
function selectSubcategory(sub, index) {
    currentSubcategory = sub;
    currentSubCategoryIndex = index;
    localStorage.setItem('lastMainCategory', currentMainCategory);
    localStorage.setItem('lastSubcategory', sub);
    loadAndRenderChannels(currentMainCategory, sub);
}

// Загрузка каналов
async function loadAndRenderChannels(main, sub) {
    if (main === t('watched')) {
        const watched = JSON.parse(localStorage.getItem('watchedChannels') || '[]');
        renderChannels(watched);
        return;
    }

    if (!categoryTree[main] || !categoryTree[main][sub]) {
        renderChannels([]);
        return;
    }

    const url = categoryTree[main][sub];
    initialLoader.style.display = 'flex';

    try {
        let channels = loadedPlaylists[url];
        if (!channels) {
            const res = await fetch(url);
            const text = await res.text();
            channels = parseM3U(text, sub);
            loadedPlaylists[url] = channels;
        }
        renderChannels(channels);
    } catch (e) {
        showToast('Ошибка загрузки');
        renderChannels([]);
    } finally {
        initialLoader.style.display = 'none';
    }
}

// Парсинг M3U
function parseM3U(content, group) {
    const channels = [];
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#EXTINF:')) {
            const url = lines[i + 1]?.trim();
            if (url && !url.startsWith('#')) {
                const name = lines[i].split(',')[1]?.trim() || 'Канал';
                channels.push({ name, url, group });
            }
        }
    }
    return channels.filter(ch => !JSON.parse(localStorage.getItem('blacklist') || '[]').includes(ch.url));
}

// Рендер каналов
function renderChannels(list) {
    channelsContainer.innerHTML = '';
    if (list.length === 0) {
        channelsContainer.innerHTML = '<div style="color:#aaa; padding:40px; text-align:center">Каналы не найдены</div>';
        return;
    }

    list.forEach((ch, i) => {
        const card = document.createElement('div');
        card.className = 'channel-card';
        card.tabIndex = 0;
        card.dataset.index = i;
        card.innerHTML = `<div class="channel-media"><i class="fas fa-tv"></i></div><div class="channel-info"><h3>${ch.name}</h3><p>${ch.group}</p></div>`;

        card.onclick = () => openFullScreenPlayer(ch.name, ch.url, ch.group);
        card.onkeydown = (e) => { if (e.key === 'Enter') openFullScreenPlayer(ch.name, ch.url, ch.group); };

        channelsContainer.appendChild(card);
    });
}

// Открытие плеера
function openFullScreenPlayer(name, url, group) {
    // Сбрасываем предыдущий таймер
    if (watchTimer) clearTimeout(watchTimer);

    playerModal.style.display = 'flex';
    videoPlayerElement.src = url;
    videoPlayerElement.play().catch(() => showToast('Нажмите для воспроизведения'));

    // Запускаем таймер на 60 секунд
    watchTimer = setTimeout(() => {
        addToWatched(name, url, group, '');
        watchTimer = null;
    }, 60000);
}

// Fullscreen
function requestFullscreen() {
    if (videoPlayerElement.requestFullscreen) videoPlayerElement.requestFullscreen();
    else if (videoPlayerElement.webkitRequestFullscreen) videoPlayerElement.webkitRequestFullscreen();
}

// Иконка по группе
function getGroupIcon(group) {
    if (group.includes('новости') || group.includes('news')) return 'fa-newspaper';
    if (group.includes('спорт') || group.includes('sports')) return 'fa-futbol';
    if (group.includes('кино') || group.includes('movies')) return 'fa-film';
    if (group.includes('музыка') || group.includes('music')) return 'fa-music';
    if (group.includes('детск') || group.includes('kids')) return 'fa-child';
    return 'fa-tv';
}

// Навигация клавишами (минимальная)
document.addEventListener('keydown', function(e) {
    if (playerModal.style.display === 'flex') {
        if (e.key === 'Escape') closeModal.click();
        return;
    }

    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const cards = document.querySelectorAll('.channel-card');
        const current = document.activeElement;
        const index = Array.from(cards).indexOf(current);
        if (index === -1) return;

        const nextIndex = e.key === 'ArrowRight' ? (index + 1) % cards.length : (index - 1 + cards.length) % cards.length;
        cards[nextIndex]?.focus();
    }
});

// Старт
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});
