// DOM элементы
const channelsContainer = document.getElementById('channelsContainer');
const mainCategoriesPanel = document.getElementById('mainCategoriesPanel');
const subCategoriesPanel = document.getElementById('subCategoriesPanel');
const playerModal = document.getElementById('playerModal');
const videoPlayerElement = document.getElementById('videoPlayerElement');
const closeModal = document.getElementById('closeModal');
const initialLoader = document.getElementById('initialLoader');
const toastContainer = document.getElementById('toastContainer');

// 👇 Firebase: Инициализация
const firebaseConfig = {
  apiKey: "AIzaSyD9mAjCqyhJix9Tiyr-vQXWj-Mejysws44",
  authDomain: "tv-channels-watching.firebaseapp.com",
  databaseURL: "https://tv-channels-watching-default-rtdb.firebaseio.com",
  projectId: "tv-channels-watching",
  storageBucket: "tv-channels-watching.firebasestorage.app",
  messagingSenderId: "625169237639",
  appId: "1:625169237639:web:beeed9dc2d424aeb269a22",
  measurementId: "G-B1HFTLJ7BM"
};
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 👇 Язык интерфейса
let currentLanguage = localStorage.getItem('appLanguage') || 'ru';

// 👇 Флаг проверки каналов
let checkChannelsOnLoad = localStorage.getItem('checkChannelsOnLoad') === 'true';

// 👇 НОВЫЙ ФЛАГ: Открывать в стороннем плеере
let openInExternalPlayer = localStorage.getItem('openInExternalPlayer') === 'true';

// 👇 Словарь переводов
const translations = {
    ru: {
        "Проверять каналы": "Проверять каналы",
        "Просмотренные": "Просмотренные",
        "Прямо сейчас": "Прямо сейчас",
        "Смотрят": "Популярные",
        "Свой плейлист": "Свой плейлист",
        "Пользовательские плейлисты": "Пользовательские плейлисты",
        "Добавить в общую коллекцию": "Добавить в общую коллекцию",
        "Плейлист успешно добавлен в общую коллекцию!": "Плейлист успешно добавлен в общую коллекцию!",
        "Плейлист уже существует в коллекции.": "Плейлист уже существует в коллекции.",
        "Ошибка при добавлении плейлиста в коллекцию": "Ошибка при добавлении плейлиста в коллекцию",
        "Загрузка списка плейлистов...": "Загрузка списка плейлистов...",
        "Плейлисты не найдены": "Плейлисты не найдены",
        "Название плейлиста": "Название плейлиста",
        "Введите название для вашего плейлиста": "Введите название для вашего плейлиста",
        "Категории": "Категории",
        "Страны": "Страны",
        "Языки": "Языки",
        "Регионы": "Регионы",
        "Загрузите плейлист по ссылке": "Загрузите плейлист по ссылке",
        "Поддерживается формат M3U": "Поддерживается формат M3U",
        "Загрузить плейлист": "Загрузить плейлист",
        "Плейлист не загружен.": "Плейлист не загружен.",
        "Перейдите в подменю и выберите «Загрузить по ссылке»": "Перейдите в подменю и выберите «Загрузить по ссылке»",
        "Пока никто в мире не смотрит...": "Пока никто в мире не смотрит...",
        "Включите канал на 60+ сек — и вы первым появитесь здесь!": "Включите канал на 60+ сек — и вы первым появитесь здесь!",
        "Прямо сейчас никто не смотрит...": "Прямо сейчас никто не смотрит...",
        "Включите канал — и станьте первым!": "Включите канал — и станьте первым!",
        "Каналы не найдены": "Каналы не найдены",
        "Загрузка...": "Загрузка...",
        "Загрузка": "Загрузка",
        "Ошибка инициализации": "Ошибка инициализации",
        "Ошибка приложения": "Ошибка приложения",
        "Ошибка сохранения": "Ошибка сохранения",
        "Канал не отвечает": "Канал не отвечает",
        "Канал недоступен": "Канал недоступен",
        "Нажмите на видео для воспроизведения": "Нажмите на видео для воспроизведения",
        "Формат не поддерживается": "Формат не поддерживается",
        "Не удалось загрузить плейлист": "Не удалось загрузить плейлист",
        "Плейлист загружен!": "Плейлист загружен!",
        "Введите ссылку": "Введите ссылку",
        "Язык изменён на Русский": "Язык изменён на Русский",
        "Language changed to English": "Язык изменён на Английский",
        "Случайный канал": "Случайный канал",
        "Не удалось найти доступный канал": "Не удалось найти доступный канал",
        "Попробуйте позже": "Попробуйте позже",
        "Еще один!": "Еще один!",
        "Поиск по каналам": "Поиск по каналам",
        "Проверка доступности...": "Проверка доступности...",
        "каналов": "каналов",
        "Не удалось загрузить": "Не удалось загрузить",
        "Плейлист не найден": "Плейлист не найден",
        "Поиск...": "Поиск...",
        "Проверка каналов включена": "Проверка каналов включена",
        "Проверка каналов отключена": "Проверка каналов отключена",
        "Международные": "Международные",
        "Не определено": "Не определено",
        "Открыть в стороннем плеере": "Открыть в стороннем плеере",
        "Открыть в плеере": "Открыть в плеере",
        "Открыть все в плейлисте": "Открыть все в плейлисте",
        "Сторонний плеер включен": "Сторонний плеер включен",
        "Сторонний плеер выключен": "Сторонний плеер выключен",
        "Экспорт M3U плейлиста": "Экспорт M3U плейлиста",
        "Открыть во внешнем плеере": "Открыть во внешнем плеере",
        "Закрыть": "Закрыть",
        "Копировать все ссылки": "Копировать все ссылки",
        "Ссылки скопированы": "Ссылки скопированы",
        "Ошибка копирования": "Ошибка копирования",
        "Нет каналов для открытия": "Нет каналов для открытия",
        "Открыто во внешнем плеере": "Открыто во внешнем плеере",
        "Ссылка скопирована! Вставьте в плеер": "Ссылка скопирована! Вставьте в плеер"
    },
    en: {
        "Проверять каналы": "Check Channels",
        "Просмотренные": "Watched",
        "Прямо сейчас": "Watching Now",
        "Смотрят": "Popular",
        "Свой плейлист": "Custom Playlist",
        "Пользовательские плейлисты": "User Playlists",
        "Добавить в общую коллекцию": "Add to Public Collection",
        "Плейлист успешно добавлен в общую коллекцию!": "Playlist successfully added to public collection!",
        "Плейлист уже существует в коллекции.": "Playlist already exists in the collection.",
        "Ошибка при добавлении плейлиста в коллекцию": "Error adding playlist to collection",
        "Загрузка списка плейлистов...": "Loading playlists...",
        "Плейлисты не найдены": "Playlists not found",
        "Название плейлиста": "Playlist Name",
        "Введите название для вашего плейлиста": "Enter a name for your playlist",
        "Категории": "Categories",
        "Страны": "Countries",
        "Языки": "Languages",
        "Регионы": "Regions",
        "Загрузите плейлист по ссылке": "Load playlist from URL",
        "Поддерживается формат M3U": "M3U format supported",
        "Загрузить плейлист": "Load Playlist",
        "Плейлист не загружен.": "Playlist is not loaded.",
        "Перейдите в подменю и выберите «Загрузить по ссылке»": "Go to submenu and select 'Load from URL'",
        "Пока никто в мире не смотрит...": "No one in the world is watching yet...",
        "Включите канал на 60+ сек — и вы первым появитесь здесь!": "Turn on a channel for 60+ sec to be the first one here!",
        "Прямо сейчас никто не смотрит...": "No one is watching right now...",
        "Включите канал — и станьте первым!": "Turn on a channel to be the first!",
        "Каналы не найдены": "Channels not found",
        "Загрузка...": "Loading...",
        "Загрузка": "Loading",
        "Ошибка инициализации": "Initialization Error",
        "Ошибка приложения": "Application Error",
        "Ошибка сохранения": "Save Error",
        "Канал не отвечает": "Channel is not responding",
        "Канал недоступен": "Channel is unavailable",
        "Нажмите на видео для воспроизведения": "Click on video to play",
        "Формат не поддерживается": "Format not supported",
        "Не удалось загрузить плейлист": "Failed to load playlist",
        "Плейлист загружен!": "Playlist loaded!",
        "Введите ссылку": "Enter URL",
        "Язык изменён на Русский": "Language changed to Russian",
        "Language changed to English": "Language changed to English",
        "Случайный канал": "Random Channel",
        "Не удалось найти доступный канал": "Failed to find an available channel",
        "Попробуйте позже": "Please try again later",
        "Еще один!": "Another one!",
        "Поиск по каналам": "Search channels",
        "Проверка доступности...": "Checking availability...",
        "каналов": "channels",
        "Не удалось загрузить": "Failed to load",
        "Плейлист не найден": "Playlist not found",
        "Поиск...": "Searching...",
        "Проверка каналов включена": "Channel checking enabled",
        "Проверка каналов отключена": "Channel checking disabled",
        "Международные": "International",
        "Не определено": "Undefined",
        "Открыть в стороннем плеере": "Open in external player",
        "Открыть в плеере": "Open in player",
        "Открыть все в плейлисте": "Open all in playlist",
        "Сторонний плеер включен": "External player enabled",
        "Сторонний плеер выключен": "External player disabled",
        "Экспорт M3U плейлиста": "Export M3U playlist",
        "Открыть во внешнем плеере": "Open in external player",
        "Закрыть": "Close",
        "Копировать все ссылки": "Copy all URLs",
        "Ссылки скопированы": "URLs copied",
        "Ошибка копирования": "Copy error",
        "Нет каналов для открытия": "No channels to open",
        "Открыто во внешнем плеере": "Opened in external player",
        "Ссылка скопирована! Вставьте в плеер": "URL copied! Paste in player",
        "Авто": "Cars",
        "Анимация": "Animation",
        "Бизнес": "Business",
        "Детские": "Kids",
        "Документальные": "Documentary",
        "Законодательные": "Legislative",
        "Интерактивные": "Interactive",
        "Кино": "Movies",
        "Классика": "Classic",
        "Комедии": "Comedy",
        "Кулинария": "Cooking",
        "Культура": "Culture",
        "Музыка": "Music",
        "Наука": "Science",
        "Новости": "News",
        "Образ жизни": "Lifestyle",
        "Образование": "Education",
        "Общие": "General",
        "Погода": "Weather",
        "Развлечения": "Entertainment",
        "Религиозные": "Religious",
        "Релакс": "Relax",
        "Семейные": "Family",
        "Сериалы": "Series",
        "Спорт": "Sports",
        "Шопинг": "Shopping",
        "Путешествия": "Travel",
        "Общественные": "Public",
        "Активный отдых": "Outdoor",
        "XXX": "Adult"
    }
};

// Функция перевода
function translateText(key) {
    return translations[currentLanguage][key] || key;
}

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
let searchTimeout = null;
let currentWatchedChannel = null;
let watchStartTime = null;

// 👇 Дерево категорий
const categoryTree = {
  "Просмотренные": {},
  "Прямо сейчас": {},
  "Популярные": {},
  "Свой плейлист": {},
  "Пользовательские плейлисты": {},
  "Случайный канал": {},
  "Категории": {
    "Авто": "https://iptv-org.github.io/iptv/categories/auto.m3u",
    "Анимация": "https://iptv-org.github.io/iptv/categories/animation.m3u",
    "Бизнес": "https://iptv-org.github.io/iptv/categories/business.m3u",
    "Детские": "https://iptv-org.github.io/iptv/categories/kids.m3u",
    "Документальные": "https://iptv-org.github.io/iptv/categories/documentary.m3u",
    "Законодательные": "https://iptv-org.github.io/iptv/categories/legislative.m3u",
    "Интерактивные": "https://iptv-org.github.io/iptv/categories/interactive.m3u",
    "Кино": "https://iptv-org.github.io/iptv/categories/movies.m3u",
    "Классика": "https://iptv-org.github.io/iptv/categories/classic.m3u",
    "Комедии": "https://iptv-org.github.io/iptv/categories/comedy.m3u",
    "Кулинария": "https://iptv-org.github.io/iptv/categories/cooking.m3u",
    "Культура": "https://iptv-org.github.io/iptv/categories/culture.m3u",
    "Музыка": "https://iptv-org.github.io/iptv/categories/music.m3u",
    "Наука": "https://iptv-org.github.io/iptv/categories/science.m3u",
    "Не определено": "https://iptv-org.github.io/iptv/categories/undefined.m3u",
    "Новости": "https://iptv-org.github.io/iptv/categories/news.m3u",
    "Образ жизни": "https://iptv-org.github.io/iptv/categories/lifestyle.m3u",
    "Образование": "https://iptv-org.github.io/iptv/categories/education.m3u",
    "Общие": "https://iptv-org.github.io/iptv/categories/general.m3u",
    "Погода": "https://iptv-org.github.io/iptv/categories/weather.m3u",
    "Развлечения": "https://iptv-org.github.io/iptv/categories/entertainment.m3u",
    "Религиозные": "https://iptv-org.github.io/iptv/categories/religious.m3u",
    "Релакс": "https://iptv-org.github.io/iptv/categories/relax.m3u",
    "Семейные": "https://iptv-org.github.io/iptv/categories/family.m3u",
    "Сериалы": "https://iptv-org.github.io/iptv/categories/series.m3u",
    "Спорт": "https://iptv-org.github.io/iptv/categories/sports.m3u",
    "Шопинг": "https://iptv-org.github.io/iptv/categories/shop.m3u",
    "Путешествия": "https://iptv-org.github.io/iptv/categories/travel.m3u",
    "Общественные": "https://iptv-org.github.io/iptv/categories/public.m3u",
    "Активный отдых": "https://iptv-org.github.io/iptv/categories/outdoor.m3u",
    "XXX": "https://iptv-org.github.io/iptv/categories/xxx.m3u"
  },
  "Страны": {
    "Россия": "https://iptv-org.github.io/iptv/countries/ru.m3u",
    "США": "https://iptv-org.github.io/iptv/countries/us.m3u",
    "Великобритания": "https://iptv-org.github.io/iptv/countries/uk.m3u",
    "Германия": "https://iptv-org.github.io/iptv/countries/de.m3u",
    "Франция": "https://iptv-org.github.io/iptv/countries/fr.m3u",
    "Италия": "https://iptv-org.github.io/iptv/countries/it.m3u",
    "Испания": "https://iptv-org.github.io/iptv/countries/es.m3u",
    "Канада": "https://iptv-org.github.io/iptv/countries/ca.m3u",
    "Австралия": "https://iptv-org.github.io/iptv/countries/au.m3u",
    "Япония": "https://iptv-org.github.io/iptv/countries/jp.m3u",
    "Китай": "https://iptv-org.github.io/iptv/countries/cn.m3u",
    "Индия": "https://iptv-org.github.io/iptv/countries/in.m3u",
    "Бразилия": "https://iptv-org.github.io/iptv/countries/br.m3u",
    "Международные": "https://iptv-org.github.io/iptv/countries/int.m3u"
  },
  "Языки": {
    "Русский": "https://iptv-org.github.io/iptv/languages/rus.m3u",
    "Английский": "https://iptv-org.github.io/iptv/languages/eng.m3u",
    "Испанский": "https://iptv-org.github.io/iptv/languages/spa.m3u",
    "Французский": "https://iptv-org.github.io/iptv/languages/fra.m3u",
    "Немецкий": "https://iptv-org.github.io/iptv/languages/deu.m3u",
    "Итальянский": "https://iptv-org.github.io/iptv/languages/ita.m3u",
    "Португальский": "https://iptv-org.github.io/iptv/languages/por.m3u",
    "Арабский": "https://iptv-org.github.io/iptv/languages/ara.m3u",
    "Китайский": "https://iptv-org.github.io/iptv/languages/zho.m3u",
    "Японский": "https://iptv-org.github.io/iptv/languages/jpn.m3u",
    "Корейский": "https://iptv-org.github.io/iptv/languages/kor.m3u"
  },
  "Регионы": {
    "Европа": "https://iptv-org.github.io/iptv/regions/eur.m3u",
    "Азия": "https://iptv-org.github.io/iptv/regions/asia.m3u",
    "Африка": "https://iptv-org.github.io/iptv/regions/afr.m3u",
    "Северная Америка": "https://iptv-org.github.io/iptv/regions/noram.m3u",
    "Южная Америка": "https://iptv-org.github.io/iptv/regions/southam.m3u",
    "Океания": "https://iptv-org.github.io/iptv/regions/oce.m3u",
    "Всемирный": "https://iptv-org.github.io/iptv/regions/ww.m3u"
  }
};

// НОВАЯ ФУНКЦИЯ: Открытие во внешнем плеере
function openInExternalPlayer(url, name) {
    try {
        window.open(url, '_blank');
        showToast(`📺 ${translateText("Открыто во внешнем плеере")}: ${name}`);
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                setTimeout(() => {
                    showToast(`🔗 ${translateText("Ссылка скопирована! Вставьте в плеер")}`);
                }, 2000);
            });
        }
        
        console.log(`📱 Открытие во внешнем плеере: ${name} - ${url}`);
    } catch (error) {
        console.error("Ошибка открытия во внешнем плеере:", error);
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url);
            showToast(translateText("Ссылка скопирована в буфер"));
        }
    }
}

// НОВАЯ ФУНКЦИЯ: Экспорт всех каналов в M3U
function exportToM3U(channels, filename = 'playlist.m3u') {
    let m3uContent = '#EXTM3U\n';
    
    channels.forEach(channel => {
        let name = channel.name.replace(/#/g, '');
        let logoAttr = channel.logo ? ` tvg-logo="${channel.logo}"` : '';
        let groupAttr = channel.group ? ` group-title="${channel.group}"` : '';
        
        m3uContent += `#EXTINF:-1${logoAttr}${groupAttr},${name}\n`;
        m3uContent += `${channel.url}\n`;
    });
    
    const blob = new Blob([m3uContent], { type: 'audio/x-mpegurl' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    showToast(`📥 ${translateText("Экспорт M3U плейлиста")}: ${channels.length} ${translateText("каналов")}`);
}

// НОВАЯ ФУНКЦИЯ: Открыть все каналы в плейлисте
function openAllInExternalPlayer(channels) {
    if (!channels || channels.length === 0) {
        showToast(translateText("Нет каналов для открытия"));
        return;
    }
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #1a1a1a;
        border-radius: 12px;
        padding: 20px;
        z-index: 10000;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        min-width: 280px;
        border: 1px solid #444;
    `;
    
    dialog.innerHTML = `
        <h3 style="margin: 0 0 15px 0; color: white;">${translateText("Открыть все в плейлисте")}</h3>
        <div style="margin-bottom: 15px; color: #ccc;">
            ${channels.length} ${translateText("каналов")}
        </div>
        <button id="exportM3UBtn" style="
            width: 100%;
            padding: 10px;
            margin-bottom: 10px;
            background: linear-gradient(90deg, #3a86ff, #4cc9f0);
            border: none;
            border-radius: 6px;
            color: white;
            cursor: pointer;
        ">${translateText("Экспорт M3U плейлиста")}</button>
        <button id="copyAllUrlsBtn" style="
            width: 100%;
            padding: 10px;
            margin-bottom: 10px;
            background: linear-gradient(90deg, #20bf6b, #26de81);
            border: none;
            border-radius: 6px;
            color: white;
            cursor: pointer;
        ">📋 ${translateText("Копировать все ссылки")}</button>
        <button id="closeDialogBtn" style="
            width: 100%;
            padding: 10px;
            background: #444;
            border: none;
            border-radius: 6px;
            color: white;
            cursor: pointer;
        ">${translateText("Закрыть")}</button>
    `;
    
    document.body.appendChild(dialog);
    
    document.getElementById('exportM3UBtn').onclick = () => {
        exportToM3U(channels, `${currentMainCategory}_${currentSubcategory || 'all'}.m3u`);
        dialog.remove();
    };
    
    document.getElementById('copyAllUrlsBtn').onclick = () => {
        const urls = channels.map(ch => ch.url).join('\n');
        navigator.clipboard.writeText(urls).then(() => {
            showToast(`📋 ${translateText("Ссылки скопированы")} (${channels.length})`);
            dialog.remove();
        }).catch(() => {
            showToast(translateText("Ошибка копирования"));
        });
    };
    
    document.getElementById('closeDialogBtn').onclick = () => dialog.remove();
    
    dialog.addEventListener('click', (e) => e.stopPropagation());
    setTimeout(() => {
        document.addEventListener('click', function closeOnClick(e) {
            if (!dialog.contains(e.target)) {
                dialog.remove();
                document.removeEventListener('click', closeOnClick);
            }
        });
    }, 100);
}

// 👇 Переключение флага стороннего плеера
function toggleExternalPlayer() {
    openInExternalPlayer = !openInExternalPlayer;
    localStorage.setItem('openInExternalPlayer', openInExternalPlayer);
    
    const toggleBtn = document.getElementById('externalPlayerToggle');
    if (toggleBtn) {
        toggleBtn.textContent = openInExternalPlayer ? '📱 ' + translateText('Открыть в стороннем плеере') : '🎬 ' + translateText('Открыть в стороннем плеере');
        toggleBtn.classList.toggle('active', openInExternalPlayer);
    }
    
    showToast(openInExternalPlayer ? 
        translateText("Сторонний плеер включен") : 
        translateText("Сторонний плеер выключен")
    );
}

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

// Добавление в просмотренные
function addToWatched(name, url, group, logo) {
    let watched;
    try {
        const raw = localStorage.getItem('watchedChannels');
        watched = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(watched)) {
            watched = [];
        }
    } catch (e) {
        watched = [];
    }
    
    if (watched.some(item => item.url === url || item.name === name)) {
        return;
    }
    
    watched.push({ name, url, group, logo, watchedAt: Date.now() });
    
    try {
        localStorage.setItem('watchedChannels', JSON.stringify(watched));
    } catch (e) {
        console.error('Ошибка сохранения:', e);
    }
    
    if (currentMainCategory === 'Просмотренные') {
        loadAndRenderChannels('Просмотренные', '');
    }
}

// Добавление в популярные
async function addToPopular(name, url, group, logo) {
    try {
        const key = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
        const snapshot = await database.ref('popular/' + key).get();
        let data = snapshot.exists() ? snapshot.val() : {
            name, url, group, logo, views: 0, createdAt: Date.now()
        };
        data.views = (data.views || 0) + 1;
        data.name = name;
        data.logo = logo;
        await database.ref('popular/' + key).set(data);
    } catch (error) {
        console.error("Ошибка Firebase:", error);
    }
}

// Обновление "Прямо сейчас"
async function updateWatchingNow(name, url, group, logo) {
    try {
        const key = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
        await database.ref('watching/' + key).set({
            name, url, group, logo, lastWatched: Date.now()
        });
    } catch (error) {
        console.error("Ошибка Firebase:", error);
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
            let urlLine = lines[i + 1];
            
            while (urlLine && urlLine.trim() === '') {
                i++;
                urlLine = lines[i + 1];
            }
            
            if (urlLine && !urlLine.startsWith('#')) {
                let name = infoLine.split(',')[1] || 'Канал';
                if (name.includes('tvg-name=')) {
                    const tvgNameMatch = infoLine.match(/tvg-name="([^"]*)"/);
                    if (tvgNameMatch) name = tvgNameMatch[1];
                }
                name = name.trim();
                const logoMatch = infoLine.match(/tvg-logo="([^"]*)"/);
                const logo = logoMatch ? logoMatch[1] : '';
                let group = assignedCategory;
                const groupMatch = infoLine.match(/tvg-group-title="([^"]*)"/);
                if (groupMatch && groupMatch[1]) {
                    group = groupMatch[1].trim();
                }
                channels.push({ name, url: urlLine.trim(), group, logo });
            }
        }
    }
    return channels;
}

// Проверка доступности канала
function checkChannelAvailability(url) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        let manifestLoaded = false;
        let errorOccurred = false;
        let hlsInstance = null;
        
        const timeoutId = setTimeout(() => {
            if (!manifestLoaded && !errorOccurred) {
                cleanup();
                resolve(false);
            }
        }, 5000);
        
        function cleanup() {
            clearTimeout(timeoutId);
            if (hlsInstance) {
                try { hlsInstance.destroy(); } catch(e) {}
                hlsInstance = null;
            }
            video.pause();
            video.src = '';
            video.load();
        }
        
        if (Hls.isSupported()) {
            hlsInstance = new Hls();
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                manifestLoaded = true;
                cleanup();
                resolve(true);
            });
            hlsInstance.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    errorOccurred = true;
                    cleanup();
                    resolve(false);
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.addEventListener('loadedmetadata', () => {
                manifestLoaded = true;
                cleanup();
                resolve(true);
            }, { once: true });
            video.addEventListener('error', () => {
                errorOccurred = true;
                cleanup();
                resolve(false);
            }, { once: true });
        } else {
            cleanup();
            resolve(false);
        }
        
        video.play().catch(() => {});
    });
}

// Загрузка и кэширование плейлиста
async function fetchAndCachePlaylist(url, group) {
    const content = await fetchM3U(url);
    let channels = parseM3UContent(content, group);
    
    if (!checkChannelsOnLoad || channels.length === 0) {
        loadedPlaylists[url] = channels;
        renderChannels(channels);
        return channels;
    }
    
    initialLoader.style.display = 'flex';
    const progressDiv = document.createElement('div');
    progressDiv.style.textAlign = 'center';
    progressDiv.style.color = 'white';
    progressDiv.innerHTML = `
        <div>${translateText("Проверка доступности...")}</div>
        <div id="checkProgress" style="margin-top:10px;">0/${channels.length}</div>
    `;
    initialLoader.innerHTML = '';
    initialLoader.appendChild(progressDiv);
    
    const progressElement = document.getElementById('checkProgress');
    let availableChannels = [];
    let checkedCount = 0;
    
    const updateDisplay = () => {
        loadedPlaylists[url] = [...availableChannels];
        renderChannels([...availableChannels]);
        if (progressElement) {
            progressElement.textContent = `${checkedCount}/${channels.length}`;
        }
    };
    
    const CONCURRENT_CHECK = 3;
    for (let i = 0; i < channels.length; i += CONCURRENT_CHECK) {
        const batch = channels.slice(i, i + CONCURRENT_CHECK);
        await Promise.allSettled(
            batch.map(async (channel) => {
                try {
                    const isAvailable = await checkChannelAvailability(channel.url);
                    checkedCount++;
                    if (isAvailable) {
                        availableChannels.push(channel);
                        updateDisplay();
                    }
                } catch (error) {
                    checkedCount++;
                    updateDisplay();
                }
            })
        );
    }
    
    loadedPlaylists[url] = [...availableChannels];
    renderChannels([...availableChannels]);
    initialLoader.style.display = 'none';
    return availableChannels;
}

// Функция открытия полноэкранного плеера с поддержкой внешнего плеера
function openFullScreenPlayer(name, url, group, logo) {
    if (openInExternalPlayer) {
        stopAllMiniPlayers();
        openInExternalPlayer(url, name);
        addToWatched(name, url, group, logo);
        addToPopular(name, url, group, logo);
        updateWatchingNow(name, url, group, logo);
        return;
    }
    
    stopAllMiniPlayers();
    currentWatchedChannel = { name, url, group, logo };
    watchStartTime = Date.now();
    updateWatchingNow(name, url, group, logo);
    
    playerModal.style.display = 'flex';
    videoPlayerElement.src = '';
    videoPlayerElement.load();
    videoPlayerElement.muted = false;
    
    const existingBtn = document.getElementById('externalPlayerModalBtn');
    if (!existingBtn) {
        const modalContent = document.querySelector('.modal-content');
        const externalBtn = document.createElement('button');
        externalBtn.id = 'externalPlayerModalBtn';
        externalBtn.innerHTML = '📱 ' + translateText("Открыть в плеере");
        externalBtn.style.cssText = `
            position: absolute;
            bottom: 20px;
            right: 70px;
            padding: 10px 20px;
            background: linear-gradient(90deg, #ff375f, #ff5e41);
            border: none;
            border-radius: 8px;
            color: white;
            cursor: pointer;
            font-size: 14px;
            z-index: 1001;
        `;
        externalBtn.onclick = () => {
            openInExternalPlayer(url, name);
        };
        modalContent.appendChild(externalBtn);
    }
    
    let manifestLoaded = false;
    let hlsInstance = null;
    
    const timeoutId = setTimeout(() => {
        if (!manifestLoaded) {
            showToast(translateText('Канал не отвечает'));
            playerModal.style.display = 'none';
            if (hlsInstance) {
                try { hlsInstance.destroy(); } catch(e) {}
            }
        }
    }, 30000);
    
    if (Hls.isSupported()) {
        hlsInstance = new Hls({
            liveDurationInfinity: true,
            enableWorker: true,
            lowLatencyMode: false,
            manifestLoadingTimeOut: 15000,
            levelLoadingTimeOut: 15000,
            fragLoadingTimeOut: 15000
        });
        videoPlayerElement.hls = hlsInstance;
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(videoPlayerElement);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
            clearTimeout(timeoutId);
            manifestLoaded = true;
            videoPlayerElement.play().catch(e => {
                showToast(translateText("Нажмите на видео для воспроизведения"));
            });
            setTimeout(() => requestNativeFullscreen(), 1000);
        });
        
        let errorCount = 0;
        hlsInstance.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                errorCount++;
                if (errorCount >= 2) {
                    clearTimeout(timeoutId);
                    showToast(translateText('Канал недоступен'));
                    playerModal.style.display = 'none';
                    if (videoPlayerElement.hls) {
                        try { videoPlayerElement.hls.destroy(); } catch(e) {}
                        delete videoPlayerElement.hls;
                    }
                } else {
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    }
                }
            }
        });
    } else if (videoPlayerElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoPlayerElement.src = url;
        videoPlayerElement.addEventListener('loadedmetadata', () => {
            clearTimeout(timeoutId);
            manifestLoaded = true;
            videoPlayerElement.play().catch(e => {
                showToast(translateText("Нажмите на видео для воспроизведения"));
            });
            setTimeout(() => requestNativeFullscreen(), 1000);
        }, { once: true });
        videoPlayerElement.addEventListener('error', () => {
            clearTimeout(timeoutId);
            showToast(translateText('Канал недоступен'));
            playerModal.style.display = 'none';
        }, { once: true });
    } else {
        clearTimeout(timeoutId);
        showToast(translateText('Формат не поддерживается'));
        playerModal.style.display = 'none';
    }
}

function requestNativeFullscreen() {
    const elem = videoPlayerElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen().catch(() => {});
    }
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

function initializeMiniPlayer(video, url, miniPlayer, icon) {
    video.dataset.initialized = 'true';
    let manifestLoaded = false;
    let networkErrorOccurred = false;
    let hlsInstance = null;
    
    const timeoutId = setTimeout(() => {
        if (!manifestLoaded && !networkErrorOccurred) {
            if (hlsInstance) {
                try { hlsInstance.destroy(); } catch(e) {}
            }
            miniPlayer.style.display = 'none';
            icon.style.display = 'block';
        }
    }, 30000);
    
    if (Hls.isSupported()) {
        hlsInstance = new Hls();
        video.hlsInstance = hlsInstance;
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
            clearTimeout(timeoutId);
            manifestLoaded = true;
            video.play().catch(() => {});
        });
        hlsInstance.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal && data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                networkErrorOccurred = true;
                clearTimeout(timeoutId);
                miniPlayer.style.display = 'none';
                icon.style.display = 'block';
                video.pause();
                if (video.hlsInstance) {
                    try { video.hlsInstance.destroy(); } catch(e) {}
                    delete video.hlsInstance;
                }
            }
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
            clearTimeout(timeoutId);
            manifestLoaded = true;
            video.play().catch(() => {});
        });
        video.addEventListener('error', () => {
            clearTimeout(timeoutId);
            miniPlayer.style.display = 'none';
            icon.style.display = 'block';
            video.pause();
        });
    }
}

function stopAllMiniPlayers() {
    miniPlayers.forEach((container) => {
        const video = container.querySelector('video');
        if (video) {
            video.pause();
            if (video.hlsInstance) {
                try { video.hlsInstance.destroy(); } catch(e) {}
                delete video.hlsInstance;
            }
            video.src = '';
            video.load();
        }
        container.style.display = 'none';
        const card = container.closest('.channel-card');
        if (card) {
            const icon = card.querySelector('.channel-media i');
            if (icon) icon.style.display = 'block';
        }
    });
}

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

// Отрисовка каналов
function renderChannels(channelsToRender) {
    channelsContainer.innerHTML = '';
    if (channelsToRender.length === 0) {
        channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Каналы не найдены")}</div>`;
        return;
    }
    
    channelsToRender.forEach((channel, index) => {
        const groupIcon = getGroupIcon(channel.group);
        const channelCard = document.createElement('div');
        channelCard.className = 'channel-card';
        channelCard.setAttribute('tabindex', '0');
        channelCard.dataset.index = index;
        channelCard.dataset.url = channel.url;
        
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
        
        let viewsText = '';
        if (channel.views) {
            viewsText = ` 👥 ${channel.views}`;
        }
        if (currentMainCategory === 'Прямо сейчас' && channel.lastWatched) {
            const now = Date.now();
            if (now - channel.lastWatched < 600000) {
                viewsText += ` ⚡`;
            }
        }
        
        const infoContainer = document.createElement('div');
        infoContainer.className = 'channel-info';
        infoContainer.innerHTML = `<h3>${channel.name}${viewsText}</h3><p>${channel.group}</p>`;
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
                    video.play().catch(() => {});
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

// Загрузка и отображение каналов
async function loadAndRenderChannels(mainCategory, subcategory) {
    if (mainCategory === 'Просмотренные') {
        initialLoader.style.display = 'none';
        let watched;
        try {
            const raw = localStorage.getItem('watchedChannels');
            watched = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(watched)) watched = [];
        } catch (e) {
            watched = [];
        }
        renderChannels(watched);
        return;
    }
    
    if (mainCategory === 'Прямо сейчас') {
        initialLoader.style.display = 'none';
        channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Загрузка...")}</div>`;
        miniPlayers.clear();
        
        const loadWatchingNow = async () => {
            try {
                const snapshot = await database.ref('watching').get();
                let watchingNow = [];
                if (snapshot.exists()) {
                    const now = Date.now();
                    watchingNow = Object.values(snapshot.val()).filter(channel => {
                        return (now - channel.lastWatched) < 600000;
                    });
                    watchingNow.sort((a, b) => b.lastWatched - a.lastWatched);
                }
                renderChannels(watchingNow);
            } catch (error) {
                console.error("Ошибка:", error);
            }
        };
        await loadWatchingNow();
        if (window.watchingNowInterval) clearInterval(window.watchingNowInterval);
        window.watchingNowInterval = setInterval(loadWatchingNow, 10000);
        return;
    }
    
    if (mainCategory === 'Популярные') {
        initialLoader.style.display = 'flex';
        try {
            const snapshot = await database.ref('popular').get();
            let popular = [];
            if (snapshot.exists()) {
                popular = Object.values(snapshot.val());
                popular.sort((a, b) => b.views - a.views);
            }
            renderChannels(popular);
        } catch (error) {
            console.error("Ошибка:", error);
        } finally {
            initialLoader.style.display = 'none';
        }
        return;
    }
    
    if (mainCategory === 'Свой плейлист') {
        initialLoader.style.display = 'none';
        let customPlaylist;
        try {
            const raw = localStorage.getItem('customPlaylist');
            customPlaylist = raw ? JSON.parse(raw) : [];
        } catch (e) {
            customPlaylist = [];
        }
        renderChannels(customPlaylist);
        return;
    }
    
    if (mainCategory === 'Случайный канал') {
        loadRandomChannel();
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
        renderChannels([]);
    } finally {
        initialLoader.style.display = 'none';
    }
}

// Загрузка случайного канала
let cachedGlobalPlaylist = null;
async function loadRandomChannel() {
    initialLoader.style.display = 'flex';
    try {
        if (!cachedGlobalPlaylist) {
            const content = await fetchM3U('https://iptv-org.github.io/iptv/index.m3u');
            cachedGlobalPlaylist = parseM3UContent(content, translateText('Международные'));
        }
        
        const shuffled = [...cachedGlobalPlaylist];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        const selectedChannels = shuffled.slice(0, 6);
        renderChannels(selectedChannels);
    } catch (error) {
        console.error("Ошибка:", error);
        channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Не удалось найти доступный канал")}</div>`;
    } finally {
        initialLoader.style.display = 'none';
    }
}

// Отображение главных категорий
function renderMainCategories() {
    mainCategoriesPanel.innerHTML = '';
    const mainCategories = Object.keys(categoryTree);
    mainCategories.forEach((cat, index) => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = translateText(cat);
        if (cat === currentMainCategory) {
            btn.classList.add('active');
            currentMainCategoryIndex = index;
        }
        btn.addEventListener('click', () => {
            currentMainCategory = cat;
            currentMainCategoryIndex = index;
            currentSubcategory = '';
            renderSubCategories();
            loadAndRenderChannels(cat, '');
            updateMainCategoryActive();
        });
        mainCategoriesPanel.appendChild(btn);
    });
    
    const spacer = document.createElement('div');
    spacer.style.width = '20px';
    mainCategoriesPanel.appendChild(spacer);
    
    const ruFlag = document.createElement('button');
    ruFlag.className = 'category-btn';
    ruFlag.textContent = '🇷🇺';
    ruFlag.style.minWidth = '40px';
    if (currentLanguage === 'ru') ruFlag.classList.add('active');
    ruFlag.addEventListener('click', () => setLanguage('ru'));
    mainCategoriesPanel.appendChild(ruFlag);
    
    const enFlag = document.createElement('button');
    enFlag.className = 'category-btn';
    enFlag.textContent = '🇬🇧';
    enFlag.style.minWidth = '40px';
    if (currentLanguage === 'en') enFlag.classList.add('active');
    enFlag.addEventListener('click', () => setLanguage('en'));
    mainCategoriesPanel.appendChild(enFlag);
    
    const externalBtn = document.createElement('button');
    externalBtn.id = 'externalPlayerToggle';
    externalBtn.className = 'category-btn';
    externalBtn.textContent = openInExternalPlayer ? '📱 ' + translateText('Открыть в стороннем плеере') : '🎬 ' + translateText('Открыть в стороннем плеере');
    externalBtn.style.minWidth = '160px';
    if (openInExternalPlayer) externalBtn.classList.add('active');
    externalBtn.addEventListener('click', toggleExternalPlayer);
    mainCategoriesPanel.appendChild(externalBtn);
    
    const checkBtn = document.createElement('button');
    checkBtn.className = 'category-btn';
    checkBtn.textContent = checkChannelsOnLoad ? '✅ ' + translateText('Проверять каналы') : '🔲 ' + translateText('Проверять каналы');
    checkBtn.style.minWidth = '140px';
    if (checkChannelsOnLoad) checkBtn.classList.add('active');
    checkBtn.addEventListener('click', () => {
        checkChannelsOnLoad = !checkChannelsOnLoad;
        localStorage.setItem('checkChannelsOnLoad', checkChannelsOnLoad);
        checkBtn.textContent = checkChannelsOnLoad ? '✅ ' + translateText('Проверять каналы') : '🔲 ' + translateText('Проверять каналы');
        checkBtn.classList.toggle('active', checkChannelsOnLoad);
        showToast(checkChannelsOnLoad ? translateText("Проверка каналов включена") : translateText("Проверка каналов отключена"));
    });
    mainCategoriesPanel.appendChild(checkBtn);
}

function updateMainCategoryActive() {
    const buttons = mainCategoriesPanel.querySelectorAll('.category-btn');
    buttons.forEach((btn, i) => {
        if (btn.textContent === translateText(currentMainCategory) || 
            (btn.textContent === '🇷🇺' && currentLanguage === 'ru') ||
            (btn.textContent === '🇬🇧' && currentLanguage === 'en') ||
            (btn.id === 'externalPlayerToggle' && openInExternalPlayer) ||
            (btn.textContent.includes('Проверять') && checkChannelsOnLoad)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Отображение подкатегорий
function renderSubCategories() {
    if (currentMainCategory === 'Свой плейлист') {
        subCategoriesPanel.innerHTML = '';
        subCategoriesPanel.style.display = 'flex';
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'https://example.com/playlist.m3u';
        input.style.padding = '8px 12px';
        input.style.borderRadius = '6px';
        input.style.border = '1px solid #444';
        input.style.background = '#222';
        input.style.color = 'white';
        const button = document.createElement('button');
        button.textContent = translateText('Загрузить плейлист');
        button.style.padding = '8px 16px';
        button.style.borderRadius = '6px';
        button.style.border = 'none';
        button.style.background = 'linear-gradient(90deg, #ff375f, #ff5e41)';
        button.style.color = 'white';
        button.style.cursor = 'pointer';
        button.onclick = async () => {
            const url = input.value.trim();
            if (!url) return;
            try {
                const content = await fetchM3U(url);
                const channels = parseM3UContent(content, translateText('Свой плейлист'));
                localStorage.setItem('customPlaylist', JSON.stringify(channels));
                showToast(translateText('Плейлист загружен!'));
                loadAndRenderChannels('Свой плейлист', '');
            } catch (err) {
                showToast(translateText('Не удалось загрузить плейлист'));
            }
        };
        subCategoriesPanel.appendChild(input);
        subCategoriesPanel.appendChild(button);
        return;
    }
    
    if (currentMainCategory === 'Просмотренные') {
        subCategoriesPanel.innerHTML = '';
        subCategoriesPanel.style.display = 'flex';
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = translateText("Поиск по каналам");
        input.style.padding = '8px 12px';
        input.style.borderRadius = '6px';
        input.style.border = '1px solid #444';
        input.style.background = '#222';
        input.style.color = 'white';
        input.oninput = (e) => {
            const query = e.target.value.toLowerCase();
            const watched = JSON.parse(localStorage.getItem('watchedChannels') || '[]');
            const filtered = watched.filter(ch => ch.name.toLowerCase().includes(query));
            renderChannels(filtered);
        };
        subCategoriesPanel.appendChild(input);
        return;
    }
    
    subCategoriesPanel.innerHTML = '';
    if (!categoryTree[currentMainCategory]) return;
    
    const subcategories = Object.keys(categoryTree[currentMainCategory]);
    subcategories.forEach((subcat, index) => {
        const btn = document.createElement('button');
        btn.className = 'subcategory-btn';
        btn.textContent = translateText(subcat);
        if (subcat === currentSubcategory) {
            btn.classList.add('active');
            currentSubCategoryIndex = index;
        }
        btn.addEventListener('click', () => {
            currentSubcategory = subcat;
            currentSubCategoryIndex = index;
            loadAndRenderChannels(currentMainCategory, subcat);
            updateSubCategoryActive();
        });
        subCategoriesPanel.appendChild(btn);
    });
    
    if (subcategories.length > 0 && currentSubcategory) {
        const exportBtn = document.createElement('button');
        exportBtn.className = 'subcategory-btn';
        exportBtn.textContent = '📱 ' + translateText("Открыть все в плейлисте");
        exportBtn.style.background = 'linear-gradient(90deg, #20bf6b, #26de81)';
        exportBtn.style.marginLeft = 'auto';
        exportBtn.onclick = async () => {
            const url = categoryTree[currentMainCategory][currentSubcategory];
            if (url) {
                try {
                    let channels = loadedPlaylists[url];
                    if (!channels) {
                        const content = await fetchM3U(url);
                        channels = parseM3UContent(content, currentSubcategory);
                    }
                    if (channels && channels.length > 0) {
                        openAllInExternalPlayer(channels);
                    }
                } catch (error) {
                    showToast(translateText("Ошибка загрузки каналов"));
                }
            }
        };
        subCategoriesPanel.appendChild(exportBtn);
    }
    
    if (subcategories.length > 0) {
        subCategoriesPanel.style.display = 'flex';
    }
}

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

// Установка языка
function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('appLanguage', lang);
    renderMainCategories();
    renderSubCategories();
    loadAndRenderChannels(currentMainCategory, currentSubcategory);
    showToast(translateText(lang === 'ru' ? "Язык изменён на Русский" : "Language changed to English"));
}

// Закрытие модального окна
closeModal.addEventListener('click', () => {
    playerModal.style.display = 'none';
    videoPlayerElement.pause();
    const externalBtn = document.getElementById('externalPlayerModalBtn');
    if (externalBtn) externalBtn.remove();
    if (videoPlayerElement.hls) {
        try { videoPlayerElement.hls.destroy(); } catch(e) {}
        delete videoPlayerElement.hls;
    }
    videoPlayerElement.src = '';
    videoPlayerElement.load();
    stopAllMiniPlayers();
    
    if (currentWatchedChannel && watchStartTime) {
        const watchedSeconds = Math.floor((Date.now() - watchStartTime) / 1000);
        if (watchedSeconds >= 60) {
            addToWatched(currentWatchedChannel.name, currentWatchedChannel.url, currentWatchedChannel.group, currentWatchedChannel.logo);
            addToPopular(currentWatchedChannel.name, currentWatchedChannel.url, currentWatchedChannel.group, currentWatchedChannel.logo);
            updateWatchingNow(currentWatchedChannel.name, currentWatchedChannel.url, currentWatchedChannel.group, currentWatchedChannel.logo);
        }
        currentWatchedChannel = null;
        watchStartTime = null;
    }
});

// Инициализация
function initApp() {
    currentLanguage = localStorage.getItem('appLanguage') || 'ru';
    openInExternalPlayer = localStorage.getItem('openInExternalPlayer') === 'true';
    checkChannelsOnLoad = localStorage.getItem('checkChannelsOnLoad') === 'true';
    
    const safetyTimeout = setTimeout(() => {
        initialLoader.style.display = 'none';
        showToast(translateText("Ошибка инициализации"));
    }, 10000);
    
    try {
        currentMainCategory = 'Просмотренные';
        renderMainCategories();
        renderSubCategories();
        loadAndRenderChannels(currentMainCategory, '');
        setTimeout(() => {
            const firstChannel = document.querySelector('.channel-card');
            if (firstChannel) firstChannel.focus();
        }, 500);
        clearTimeout(safetyTimeout);
    } catch (error) {
        clearTimeout(safetyTimeout);
        console.error("Ошибка инициализации:", error);
        initialLoader.style.display = 'none';
        showToast(translateText("Ошибка приложения"));
    }
}

// Обработка клавиш
document.addEventListener('keydown', (e) => {
    if (playerModal.style.display === 'flex') {
        if (e.key === 'Escape') closeModal.click();
        return;
    }
});

window.addEventListener('beforeunload', () => {
    if (window.watchingNowInterval) clearInterval(window.watchingNowInterval);
});

function initMouseWheelScroll() {
    const containers = [mainCategoriesPanel, subCategoriesPanel];
    containers.forEach(container => {
        if (!container) return;
        container.addEventListener('wheel', (e) => {
            if (e.deltaY === 0) return;
            e.preventDefault();
            container.scrollLeft += e.deltaY;
        }, { passive: false });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    initMouseWheelScroll();
});
