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
let checkChannelsOnLoad = localStorage.getItem('checkChannelsOnLoad') === 'true';

// 👇 Переводы (Смотрят → Популярные)
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
        "Не определено": "Не определено"
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
        "Не определено": "Undefined"
    }
};

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
let miniPlayers = new Map(); // { url: { container, plyr, hls } }
let focusTimer = null;
let loadedPlaylists = {};
let navigationState = 'channels';
let currentWatchedChannel = null;
let watchStartTime = null;
let globalPlyrInstance = null;
let cachedGlobalPlaylist = null;

// 👇 Дерево категорий
const categoryTree = {
  "Просмотренные": {},
  "Прямо сейчас": {},
  "Популярные": {}, // ← переименовано
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
    "Австралия": "https://iptv-org.github.io/iptv/countries/au.m3u",
    "Австрия": "https://iptv-org.github.io/iptv/countries/at.m3u",
    "Азербайджан": "https://iptv-org.github.io/iptv/countries/az.m3u",
    "Албания": "https://iptv-org.github.io/iptv/countries/al.m3u",
    "Алжир": "https://iptv-org.github.io/iptv/countries/dz.m3u",
    "Ангола": "https://iptv-org.github.io/iptv/countries/ao.m3u",
    "Андорра": "https://iptv-org.github.io/iptv/countries/ad.m3u",
    "Аргентина": "https://iptv-org.github.io/iptv/countries/ar.m3u",
    "Армения": "https://iptv-org.github.io/iptv/countries/am.m3u",
    "Афганистан": "https://iptv-org.github.io/iptv/countries/af.m3u",
    "Багамы": "https://iptv-org.github.io/iptv/countries/bs.m3u",
    "Бангладеш": "https://iptv-org.github.io/iptv/countries/bd.m3u",
    "Барбадос": "https://iptv-org.github.io/iptv/countries/bb.m3u",
    "Бахрейн": "https://iptv-org.github.io/iptv/countries/bh.m3u",
    "Беларусь": "https://iptv-org.github.io/iptv/countries/by.m3u",
    "Белиз": "https://iptv-org.github.io/iptv/countries/bz.m3u",
    "Бенин": "https://iptv-org.github.io/iptv/countries/bj.m3u",
    "Бермуды": "https://iptv-org.github.io/iptv/countries/bm.m3u",
    "Болгария": "https://iptv-org.github.io/iptv/countries/bg.m3u",
    "Боливия": "https://iptv-org.github.io/iptv/countries/bo.m3u",
    "Бонайре": "https://iptv-org.github.io/iptv/countries/bq.m3u",
    "Босния и Герцеговина": "https://iptv-org.github.io/iptv/countries/ba.m3u",
    "Бразилия": "https://iptv-org.github.io/iptv/countries/br.m3u",
    "Британские Виргинские острова": "https://iptv-org.github.io/iptv/countries/vg.m3u",
    "Бруней": "https://iptv-org.github.io/iptv/countries/bn.m3u",
    "Буркина-Фасо": "https://iptv-org.github.io/iptv/countries/bf.m3u",
    "Бутан": "https://iptv-org.github.io/iptv/countries/bt.m3u",
    "Ватикан": "https://iptv-org.github.io/iptv/countries/va.m3u",
    "Великобритания": "https://iptv-org.github.io/iptv/countries/uk.m3u",
    "Венгрия": "https://iptv-org.github.io/iptv/countries/hu.m3u",
    "Венесуэла": "https://iptv-org.github.io/iptv/countries/ve.m3u",
    "Вьетнам": "https://iptv-org.github.io/iptv/countries/vn.m3u",
    "Гаити": "https://iptv-org.github.io/iptv/countries/ht.m3u",
    "Гайана": "https://iptv-org.github.io/iptv/countries/gy.m3u",
    "Гамбия": "https://iptv-org.github.io/iptv/countries/gm.m3u",
    "Гана": "https://iptv-org.github.io/iptv/countries/gh.m3u",
    "Гваделупа": "https://iptv-org.github.io/iptv/countries/gp.m3u",
    "Гватемала": "https://iptv-org.github.io/iptv/countries/gt.m3u",
    "Гвинея": "https://iptv-org.github.io/iptv/countries/gn.m3u",
    "Гернси": "https://iptv-org.github.io/iptv/countries/gg.m3u",
    "Германия": "https://iptv-org.github.io/iptv/countries/de.m3u",
    "Гондурас": "https://iptv-org.github.io/iptv/countries/hn.m3u",
    "Гонконг": "https://iptv-org.github.io/iptv/countries/hk.m3u",
    "Греция": "https://iptv-org.github.io/iptv/countries/gr.m3u",
    "Грузия": "https://iptv-org.github.io/iptv/countries/ge.m3u",
    "Гуам": "https://iptv-org.github.io/iptv/countries/gu.m3u",
    "Дания": "https://iptv-org.github.io/iptv/countries/dk.m3u",
    "Демократическая Республика Конго": "https://iptv-org.github.io/iptv/countries/cd.m3u",
    "Джибути": "https://iptv-org.github.io/iptv/countries/dj.m3u",
    "Доминиканская Республика": "https://iptv-org.github.io/iptv/countries/do.m3u",
    "Египет": "https://iptv-org.github.io/iptv/countries/eg.m3u",
    "Западная Сахара": "https://iptv-org.github.io/iptv/countries/eh.m3u",
    "Зимбабве": "https://iptv-org.github.io/iptv/countries/zw.m3u",
    "Израиль": "https://iptv-org.github.io/iptv/countries/il.m3u",
    "Индия": "https://iptv-org.github.io/iptv/countries/in.m3u",
    "Индонезия": "https://iptv-org.github.io/iptv/countries/id.m3u",
    "Иордания": "https://iptv-org.github.io/iptv/countries/jo.m3u",
    "Ирак": "https://iptv-org.github.io/iptv/countries/iq.m3u",
    "Иран": "https://iptv-org.github.io/iptv/countries/ir.m3u",
    "Ирландия": "https://iptv-org.github.io/iptv/countries/ie.m3u",
    "Исландия": "https://iptv-org.github.io/iptv/countries/is.m3u",
    "Испания": "https://iptv-org.github.io/iptv/countries/es.m3u",
    "Италия": "https://iptv-org.github.io/iptv/countries/it.m3u",
    "Йемен": "https://iptv-org.github.io/iptv/countries/ye.m3u",
    "Кабо-Верде": "https://iptv-org.github.io/iptv/countries/cv.m3u",
    "Казахстан": "https://iptv-org.github.io/iptv/countries/kz.m3u",
    "Камбоджа": "https://iptv-org.github.io/iptv/countries/kh.m3u",
    "Камерун": "https://iptv-org.github.io/iptv/countries/cm.m3u",
    "Канада": "https://iptv-org.github.io/iptv/countries/ca.m3u",
    "Катар": "https://iptv-org.github.io/iptv/countries/qa.m3u",
    "Кения": "https://iptv-org.github.io/iptv/countries/ke.m3u",
    "Кипр": "https://iptv-org.github.io/iptv/countries/cy.m3u",
    "Киргизия": "https://iptv-org.github.io/iptv/countries/kg.m3u",
    "Китай": "https://iptv-org.github.io/iptv/countries/cn.m3u",
    "Колумбия": "https://iptv-org.github.io/iptv/countries/co.m3u",
    "Коморы": "https://iptv-org.github.io/iptv/countries/km.m3u",
    "Конго": "https://iptv-org.github.io/iptv/countries/cg.m3u",
    "Косово": "https://iptv-org.github.io/iptv/countries/xk.m3u",
    "Коста-Рика": "https://iptv-org.github.io/iptv/countries/cr.m3u",
    "Кот-д'Ивуар": "https://iptv-org.github.io/iptv/countries/ci.m3u",
    "Куба": "https://iptv-org.github.io/iptv/countries/cu.m3u",
    "Кувейт": "https://iptv-org.github.io/iptv/countries/kw.m3u",
    "Кюрасао": "https://iptv-org.github.io/iptv/countries/cw.m3u",
    "Лаос": "https://iptv-org.github.io/iptv/countries/la.m3u",
    "Латвия": "https://iptv-org.github.io/iptv/countries/lv.m3u",
    "Лесото": "https://iptv-org.github.io/iptv/countries/ls.m3u",
    "Ливан": "https://iptv-org.github.io/iptv/countries/lb.m3u",
    "Ливия": "https://iptv-org.github.io/iptv/countries/ly.m3u",
    "Литва": "https://iptv-org.github.io/iptv/countries/lt.m3u",
    "Лихтенштейн": "https://iptv-org.github.io/iptv/countries/li.m3u",
    "Люксембург": "https://iptv-org.github.io/iptv/countries/lu.m3u",
    "Маврикий": "https://iptv-org.github.io/iptv/countries/mu.m3u",
    "Мавритания": "https://iptv-org.github.io/iptv/countries/mr.m3u",
    "Мадагаскар": "https://iptv-org.github.io/iptv/countries/mg.m3u",
    "Макао": "https://iptv-org.github.io/iptv/countries/mo.m3u",
    "Малави": "https://iptv-org.github.io/iptv/countries/mw.m3u",
    "Малайзия": "https://iptv-org.github.io/iptv/countries/my.m3u",
    "Мали": "https://iptv-org.github.io/iptv/countries/ml.m3u",
    "Мальдивы": "https://iptv-org.github.io/iptv/countries/mv.m3u",
    "Мальта": "https://iptv-org.github.io/iptv/countries/mt.m3u",
    "Марокко": "https://iptv-org.github.io/iptv/countries/ma.m3u",
    "Мартиника": "https://iptv-org.github.io/iptv/countries/mq.m3u",
    "Мексика": "https://iptv-org.github.io/iptv/countries/mx.m3u",
    "Мозамбик": "https://iptv-org.github.io/iptv/countries/mz.m3u",
    "Молдова": "https://iptv-org.github.io/iptv/countries/md.m3u",
    "Монако": "https://iptv-org.github.io/iptv/countries/mc.m3u",
    "Монголия": "https://iptv-org.github.io/iptv/countries/mn.m3u",
    "Мьянма": "https://iptv-org.github.io/iptv/countries/mm.m3u",
    "Намибия": "https://iptv-org.github.io/iptv/countries/na.m3u",
    "Непал": "https://iptv-org.github.io/iptv/countries/np.m3u",
    "Нигер": "https://iptv-org.github.io/iptv/countries/ne.m3u",
    "Нигерия": "https://iptv-org.github.io/iptv/countries/ng.m3u",
    "Нидерланды": "https://iptv-org.github.io/iptv/countries/nl.m3u",
    "Никарагуа": "https://iptv-org.github.io/iptv/countries/ni.m3u",
    "Новая Зеландия": "https://iptv-org.github.io/iptv/countries/nz.m3u",
    "Норвегия": "https://iptv-org.github.io/iptv/countries/no.m3u",
    "ОАЭ": "https://iptv-org.github.io/iptv/countries/ae.m3u",
    "Оман": "https://iptv-org.github.io/iptv/countries/om.m3u",
    "Пакистан": "https://iptv-org.github.io/iptv/countries/pk.m3u",
    "Палестина": "https://iptv-org.github.io/iptv/countries/ps.m3u",
    "Панама": "https://iptv-org.github.io/iptv/countries/pa.m3u",
    "Папуа — Новая Гвинея": "https://iptv-org.github.io/iptv/countries/pg.m3u",
    "Парагвай": "https://iptv-org.github.io/iptv/countries/py.m3u",
    "Перу": "https://iptv-org.github.io/iptv/countries/pe.m3u",
    "Польша": "https://iptv-org.github.io/iptv/countries/pl.m3u",
    "Португалия": "https://iptv-org.github.io/iptv/countries/pt.m3u",
    "Пуэрто-Рико": "https://iptv-org.github.io/iptv/countries/pr.m3u",
    "Реюньон": "https://iptv-org.github.io/iptv/countries/re.m3u",
    "Россия": "https://iptv-org.github.io/iptv/countries/ru.m3u",
    "Руанда": "https://iptv-org.github.io/iptv/countries/rw.m3u",
    "Румыния": "https://iptv-org.github.io/iptv/countries/ro.m3u",
    "Сальвадор": "https://iptv-org.github.io/iptv/countries/sv.m3u",
    "Самоа": "https://iptv-org.github.io/iptv/countries/ws.m3u",
    "Сан-Марино": "https://iptv-org.github.io/iptv/countries/sm.m3u",
    "Саудовская Аравия": "https://iptv-org.github.io/iptv/countries/sa.m3u",
    "Северная Корея": "https://iptv-org.github.io/iptv/countries/kp.m3u",
    "Северная Македония": "https://iptv-org.github.io/iptv/countries/mk.m3u",
    "Сенегал": "https://iptv-org.github.io/iptv/countries/sn.m3u",
    "Сент-Китс и Невис": "https://iptv-org.github.io/iptv/countries/kn.m3u",
    "Сент-Люсия": "https://iptv-org.github.io/iptv/countries/lc.m3u",
    "Сербия": "https://iptv-org.github.io/iptv/countries/rs.m3u",
    "Сингапур": "https://iptv-org.github.io/iptv/countries/sg.m3u",
    "Синт-Мартен": "https://iptv-org.github.io/iptv/countries/sx.m3u",
    "Сирия": "https://iptv-org.github.io/iptv/countries/sy.m3u",
    "Словакия": "https://iptv-org.github.io/iptv/countries/sk.m3u",
    "Словения": "https://iptv-org.github.io/iptv/countries/si.m3u",
    "Сомали": "https://iptv-org.github.io/iptv/countries/so.m3u",
    "Судан": "https://iptv-org.github.io/iptv/countries/sd.m3u",
    "Суринам": "https://iptv-org.github.io/iptv/countries/sr.m3u",
    "США": "https://iptv-org.github.io/iptv/countries/us.m3u",
    "Таджикистан": "https://iptv-org.github.io/iptv/countries/tj.m3u",
    "Таиланд": "https://iptv-org.github.io/iptv/countries/th.m3u",
    "Тайвань": "https://iptv-org.github.io/iptv/countries/tw.m3u",
    "Танзания": "https://iptv-org.github.io/iptv/countries/tz.m3u",
    "Того": "https://iptv-org.github.io/iptv/countries/tg.m3u",
    "Тонга": "https://iptv-org.github.io/iptv/countries/to.m3u",
    "Тринидад и Тобаго": "https://iptv-org.github.io/iptv/countries/tt.m3u",
    "Тунис": "https://iptv-org.github.io/iptv/countries/tn.m3u",
    "Туркменистан": "https://iptv-org.github.io/iptv/countries/tm.m3u",
    "Турция": "https://iptv-org.github.io/iptv/countries/tr.m3u",
    "Уганда": "https://iptv-org.github.io/iptv/countries/ug.m3u",
    "Узбекистан": "https://iptv-org.github.io/iptv/countries/uz.m3u",
    "Украина": "https://iptv-org.github.io/iptv/countries/ua.m3u",
    "Уругвай": "https://iptv-org.github.io/iptv/countries/uy.m3u",
    "Фарерские острова": "https://iptv-org.github.io/iptv/countries/fo.m3u",
    "Фиджи": "https://iptv-org.github.io/iptv/countries/fj.m3u",
    "Филиппины": "https://iptv-org.github.io/iptv/countries/ph.m3u",
    "Финляндия": "https://iptv-org.github.io/iptv/countries/fi.m3u",
    "Франция": "https://iptv-org.github.io/iptv/countries/fr.m3u",
    "Французская Полинезия": "https://iptv-org.github.io/iptv/countries/pf.m3u",
    "Хорватия": "https://iptv-org.github.io/iptv/countries/hr.m3u",
    "Чад": "https://iptv-org.github.io/iptv/countries/td.m3u",
    "Черногория": "https://iptv-org.github.io/iptv/countries/me.m3u",
    "Чехия": "https://iptv-org.github.io/iptv/countries/cz.m3u",
    "Чили": "https://iptv-org.github.io/iptv/countries/cl.m3u",
    "Швейцария": "https://iptv-org.github.io/iptv/countries/ch.m3u",
    "Швеция": "https://iptv-org.github.io/iptv/countries/se.m3u",
    "Шри-Ланка": "https://iptv-org.github.io/iptv/countries/lk.m3u",
    "Эквадор": "https://iptv-org.github.io/iptv/countries/ec.m3u",
    "Экваториальная Гвинея": "https://iptv-org.github.io/iptv/countries/gq.m3u",
    "Эритрея": "https://iptv-org.github.io/iptv/countries/er.m3u",
    "Эстония": "https://iptv-org.github.io/iptv/countries/ee.m3u",
    "Эфиопия": "https://iptv-org.github.io/iptv/countries/et.m3u",
    "Южная Африка": "https://iptv-org.github.io/iptv/countries/za.m3u",
    "Южная Корея": "https://iptv-org.github.io/iptv/countries/kr.m3u",
    "Ямайка": "https://iptv-org.github.io/iptv/countries/jm.m3u",
    "Япония": "https://iptv-org.github.io/iptv/countries/jp.m3u",
    "Американские Виргинские острова": "https://iptv-org.github.io/iptv/countries/vi.m3u",
    "Международные": "https://iptv-org.github.io/iptv/countries/int.m3u",
    "Не определено": "https://iptv-org.github.io/iptv/countries/undefined.m3u"
  },
  "Языки": {
    "Аколи": "https://iptv-org.github.io/iptv/languages/ach.m3u",
    "Адхола": "https://iptv-org.github.io/iptv/languages/adh.m3u",
    "Айизо гбе": "https://iptv-org.github.io/iptv/languages/ayb.m3u",
    "Аймара": "https://iptv-org.github.io/iptv/languages/aym.m3u",
    "Албанский": "https://iptv-org.github.io/iptv/languages/sqi.m3u",
    "Алжирский жестовый": "https://iptv-org.github.io/iptv/languages/asp.m3u",
    "Алур": "https://iptv-org.github.io/iptv/languages/alz.m3u",
    "Амхарский": "https://iptv-org.github.io/iptv/languages/amh.m3u",
    "Арабский": "https://iptv-org.github.io/iptv/languages/ara.m3u",
    "Армянский": "https://iptv-org.github.io/iptv/languages/hye.m3u",
    "Ассамский": "https://iptv-org.github.io/iptv/languages/asm.m3u",
    "Ассирийский неоарамейский": "https://iptv-org.github.io/iptv/languages/aii.m3u",
    "Афар": "https://iptv-org.github.io/iptv/languages/aar.m3u",
    "Африкаанс": "https://iptv-org.github.io/iptv/languages/afr.m3u",
    "Азербайджанский": "https://iptv-org.github.io/iptv/languages/aze.m3u",
    "Баатонум": "https://iptv-org.github.io/iptv/languages/bba.m3u",
    "Бамбара": "https://iptv-org.github.io/iptv/languages/bam.m3u",
    "Баскский": "https://iptv-org.github.io/iptv/languages/eus.m3u",
    "Башкирский": "https://iptv-org.github.io/iptv/languages/bak.m3u",
    "Белорусский": "https://iptv-org.github.io/iptv/languages/bel.m3u",
    "Бенгальский": "https://iptv-org.github.io/iptv/languages/ben.m3u",
    "Бирманский": "https://iptv-org.github.io/iptv/languages/mya.m3u",
    "Боджпури": "https://iptv-org.github.io/iptv/languages/bho.m3u",
    "Болгарский": "https://iptv-org.github.io/iptv/languages/bul.m3u",
    "Боснийский": "https://iptv-org.github.io/iptv/languages/bos.m3u",
    "Валлийский": "https://iptv-org.github.io/iptv/languages/cym.m3u",
    "Венгерский": "https://iptv-org.github.io/iptv/languages/hun.m3u",
    "Венда": "https://iptv-org.github.io/iptv/languages/ven.m3u",
    "Вьетнамский": "https://iptv-org.github.io/iptv/languages/vie.m3u",
    "Ганда": "https://iptv-org.github.io/iptv/languages/lug.m3u",
    "Гаитянский": "https://iptv-org.github.io/iptv/languages/hat.m3u",
    "Ген": "https://iptv-org.github.io/iptv/languages/gej.m3u",
    "Гикую": "https://iptv-org.github.io/iptv/languages/kik.m3u",
    "Голландский": "https://iptv-org.github.io/iptv/languages/nld.m3u",
    "Гоан Конкани": "https://iptv-org.github.io/iptv/languages/gom.m3u",
    "Греческий": "https://iptv-org.github.io/iptv/languages/ell.m3u",
    "Грузинский": "https://iptv-org.github.io/iptv/languages/kat.m3u",
    "Гуджарати": "https://iptv-org.github.io/iptv/languages/guj.m3u",
    "Гун": "https://iptv-org.github.io/iptv/languages/guw.m3u",
    "Гэльский": "https://iptv-org.github.io/iptv/languages/gla.m3u",
    "Датский": "https://iptv-org.github.io/iptv/languages/dan.m3u",
    "Дари (Парси)": "https://iptv-org.github.io/iptv/languages/prd.m3u",
    "Денди (Бенин)": "https://iptv-org.github.io/iptv/languages/ddn.m3u",
    "Дивехи": "https://iptv-org.github.io/iptv/languages/div.m3u",
    "Дханвар (Непал)": "https://iptv-org.github.io/iptv/languages/dhw.m3u",
    "Дхолуо": "https://iptv-org.github.io/iptv/languages/luo.m3u",
    "Димили": "https://iptv-org.github.io/iptv/languages/zza.m3u",
    "Дьюла": "https://iptv-org.github.io/iptv/languages/dyu.m3u",
    "Египетский арабский": "https://iptv-org.github.io/iptv/languages/arz.m3u",
    "Западно-фризский": "https://iptv-org.github.io/iptv/languages/fry.m3u",
    "Зарма": "https://iptv-org.github.io/iptv/languages/dje.m3u",
    "Зулу": "https://iptv-org.github.io/iptv/languages/zul.m3u",
    "Иврит": "https://iptv-org.github.io/iptv/languages/heb.m3u",
    "Индонезийский": "https://iptv-org.github.io/iptv/languages/ind.m3u",
    "Инуктитут": "https://iptv-org.github.io/iptv/languages/iku.m3u",
    "Ирландский": "https://iptv-org.github.io/iptv/languages/gle.m3u",
    "Исекири": "https://iptv-org.github.io/iptv/languages/its.m3u",
    "Испанский": "https://iptv-org.github.io/iptv/languages/spa.m3u",
    "Итальянский": "https://iptv-org.github.io/iptv/languages/ita.m3u",
    "Кабийе": "https://iptv-org.github.io/iptv/languages/kbp.m3u",
    "Кабильский": "https://iptv-org.github.io/iptv/languages/kab.m3u",
    "Каннада": "https://iptv-org.github.io/iptv/languages/kan.m3u",
    "Капампанган": "https://iptv-org.github.io/iptv/languages/pam.m3u",
    "Каталанский": "https://iptv-org.github.io/iptv/languages/cat.m3u",
    "Казахский": "https://iptv-org.github.io/iptv/languages/kaz.m3u",
    "Кечуа": "https://iptv-org.github.io/iptv/languages/que.m3u",
    "Киньяруанда": "https://iptv-org.github.io/iptv/languages/kin.m3u",
    "Киргизский": "https://iptv-org.github.io/iptv/languages/kir.m3u",
    "Китуба (Конго)": "https://iptv-org.github.io/iptv/languages/mkw.m3u",
    "Китайский": "https://iptv-org.github.io/iptv/languages/zho.m3u",
    "Конго": "https://iptv-org.github.io/iptv/languages/kon.m3u",
    "Конкани (макроязык)": "https://iptv-org.github.io/iptv/languages/kok.m3u",
    "Корейский": "https://iptv-org.github.io/iptv/languages/kor.m3u",
    "Кумам": "https://iptv-org.github.io/iptv/languages/kdi.m3u",
    "Курдский": "https://iptv-org.github.io/iptv/languages/kur.m3u",
    "Ланго (Уганда)": "https://iptv-org.github.io/iptv/languages/laj.m3u",
    "Латинский": "https://iptv-org.github.io/iptv/languages/lat.m3u",
    "Лаосский": "https://iptv-org.github.io/iptv/languages/lao.m3u",
    "Латышский": "https://iptv-org.github.io/iptv/languages/lav.m3u",
    "Лингала": "https://iptv-org.github.io/iptv/languages/lin.m3u",
    "Литовский": "https://iptv-org.github.io/iptv/languages/lit.m3u",
    "Луба-Лулуа": "https://iptv-org.github.io/iptv/languages/lua.m3u",
    "Лушай": "https://iptv-org.github.io/iptv/languages/lus.m3u",
    "Люксембургский": "https://iptv-org.github.io/iptv/languages/ltz.m3u",
    "Македонский": "https://iptv-org.github.io/iptv/languages/mkd.m3u",
    "Малайский": "https://iptv-org.github.io/iptv/languages/msa.m3u",
    "Малаялам": "https://iptv-org.github.io/iptv/languages/mal.m3u",
    "Мальтийский": "https://iptv-org.github.io/iptv/languages/mlt.m3u",
    "Мандарин китайский": "https://iptv-org.github.io/iptv/languages/cmn.m3u",
    "Мандинка": "https://iptv-org.github.io/iptv/languages/mnk.m3u",
    "Маори": "https://iptv-org.github.io/iptv/languages/mri.m3u",
    "Маратхи": "https://iptv-org.github.io/iptv/languages/mar.m3u",
    "Микенский греческий": "https://iptv-org.github.io/iptv/languages/gmy.m3u",
    "Минь Нань китайский": "https://iptv-org.github.io/iptv/languages/nan.m3u",
    "Монгольский": "https://iptv-org.github.io/iptv/languages/mon.m3u",
    "Морисьен": "https://iptv-org.github.io/iptv/languages/mfe.m3u",
    "Мосси": "https://iptv-org.github.io/iptv/languages/mos.m3u",
    "Немецкий": "https://iptv-org.github.io/iptv/languages/deu.m3u",
    "Непальский": "https://iptv-org.github.io/iptv/languages/nep.m3u",
    "Норвежский": "https://iptv-org.github.io/iptv/languages/nor.m3u",
    "Ньянколе": "https://iptv-org.github.io/iptv/languages/nyn.m3u",
    "Ньоро": "https://iptv-org.github.io/iptv/languages/nyo.m3u",
    "Ория (макроязык)": "https://iptv-org.github.io/iptv/languages/ori.m3u",
    "Панджаби": "https://iptv-org.github.io/iptv/languages/pan.m3u",
    "Папьяменто": "https://iptv-org.github.io/iptv/languages/pap.m3u",
    "Персидский": "https://iptv-org.github.io/iptv/languages/fas.m3u",
    "Польский": "https://iptv-org.github.io/iptv/languages/pol.m3u",
    "Португальский": "https://iptv-org.github.io/iptv/languages/por.m3u",
    "Пулаар": "https://iptv-org.github.io/iptv/languages/fuc.m3u",
    "Пушту": "https://iptv-org.github.io/iptv/languages/pus.m3u",
    "Румынский": "https://iptv-org.github.io/iptv/languages/ron.m3u",
    "Русский": "https://iptv-org.github.io/iptv/languages/rus.m3u",
    "Самоанский": "https://iptv-org.github.io/iptv/languages/smo.m3u",
    "Сантальский": "https://iptv-org.github.io/iptv/languages/sat.m3u",
    "Сент-Люсийский креольский французский": "https://iptv-org.github.io/iptv/languages/acf.m3u",
    "Сербский": "https://iptv-org.github.io/iptv/languages/srp.m3u",
    "Сербо-хорватский": "https://iptv-org.github.io/iptv/languages/hbs.m3u",
    "Сингальский": "https://iptv-org.github.io/iptv/languages/sin.m3u",
    "Словацкий": "https://iptv-org.github.io/iptv/languages/slk.m3u",
    "Словенский": "https://iptv-org.github.io/iptv/languages/slv.m3u",
    "Сомалийский": "https://iptv-org.github.io/iptv/languages/som.m3u",
    "Стандартный арабский": "https://iptv-org.github.io/iptv/languages/arb.m3u",
    "Суахили": "https://iptv-org.github.io/iptv/languages/swa.m3u",
    "Свати": "https://iptv-org.github.io/iptv/languages/ssw.m3u",
    "США": "https://iptv-org.github.io/iptv/languages/eng.m3u",
    "Тагальский": "https://iptv-org.github.io/iptv/languages/tgl.m3u",
    "Таджикский": "https://iptv-org.github.io/iptv/languages/tgk.m3u",
    "Тайский": "https://iptv-org.github.io/iptv/languages/tha.m3u",
    "Тамильский": "https://iptv-org.github.io/iptv/languages/tam.m3u",
    "Татарский": "https://iptv-org.github.io/iptv/languages/tat.m3u",
    "Тачавит": "https://iptv-org.github.io/iptv/languages/shy.m3u",
    "Ташелхит": "https://iptv-org.github.io/iptv/languages/shi.m3u",
    "Таитянский": "https://iptv-org.github.io/iptv/languages/tah.m3u",
    "Телугу": "https://iptv-org.github.io/iptv/languages/tel.m3u",
    "Тигре": "https://iptv-org.github.io/iptv/languages/tig.m3u",
    "Тигринья": "https://iptv-org.github.io/iptv/languages/tir.m3u",
    "Тибетский": "https://iptv-org.github.io/iptv/languages/bod.m3u",
    "Тор": "https://iptv-org.github.io/iptv/languages/ttj.m3u",
    "Тумзабт": "https://iptv-org.github.io/iptv/languages/mzb.m3u",
    "Турецкий": "https://iptv-org.github.io/iptv/languages/tur.m3u",
    "Туркменский": "https://iptv-org.github.io/iptv/languages/tuk.m3u",
    "Узбекский": "https://iptv-org.github.io/iptv/languages/uzb.m3u",
    "Уйгурский": "https://iptv-org.github.io/iptv/languages/uig.m3u",
    "Украинский": "https://iptv-org.github.io/iptv/languages/ukr.m3u",
    "Урду": "https://iptv-org.github.io/iptv/languages/urd.m3u",
    "Фарерский": "https://iptv-org.github.io/iptv/languages/fao.m3u",
    "Фаталика": "https://iptv-org.github.io/iptv/languages/far.m3u",
    "Филиппинский": "https://iptv-org.github.io/iptv/languages/fil.m3u",
    "Финский": "https://iptv-org.github.io/iptv/languages/fin.m3u",
    "Фон": "https://iptv-org.github.io/iptv/languages/fon.m3u",
    "Французский": "https://iptv-org.github.io/iptv/languages/fra.m3u",
    "Фулах": "https://iptv-org.github.io/iptv/languages/ful.m3u",
    "Центральный атлас тамазигхт": "https://iptv-org.github.io/iptv/languages/tzm.m3u",
    "Центральный курдский": "https://iptv-org.github.io/iptv/languages/ckb.m3u",
    "Ченуа": "https://iptv-org.github.io/iptv/languages/cnu.m3u",
    "Чешский": "https://iptv-org.github.io/iptv/languages/ces.m3u",
    "Чига": "https://iptv-org.github.io/iptv/languages/cgg.m3u",
    "Чхаттисгархи": "https://iptv-org.github.io/iptv/languages/hne.m3u",
    "Хауса": "https://iptv-org.github.io/iptv/languages/hau.m3u",
    "Хинди": "https://iptv-org.github.io/iptv/languages/hin.m3u",
    "Хмонг": "https://iptv-org.github.io/iptv/languages/hmn.m3u",
    "Хорасани-турецкий": "https://iptv-org.github.io/iptv/languages/kmz.m3u",
    "Хорватский": "https://iptv-org.github.io/iptv/languages/hrv.m3u",
    "Цонга": "https://iptv-org.github.io/iptv/languages/tso.m3u",
    "Черногорский": "https://iptv-org.github.io/iptv/languages/cnr.m3u",
    "Шведский": "https://iptv-org.github.io/iptv/languages/swe.m3u",
    "Эве": "https://iptv-org.github.io/iptv/languages/ewe.m3u",
    "Эстонский": "https://iptv-org.github.io/iptv/languages/est.m3u",
    "Яванский": "https://iptv-org.github.io/iptv/languages/jav.m3u",
    "Якутский": "https://iptv-org.github.io/iptv/languages/sah.m3u",
    "Японский": "https://iptv-org.github.io/iptv/languages/jpn.m3u",
    "Йоруба": "https://iptv-org.github.io/iptv/languages/yor.m3u",
    "Юкатек Майя": "https://iptv-org.github.io/iptv/languages/yua.m3u",
    "Юэ китайский": "https://iptv-org.github.io/iptv/languages/yue.m3u",
    "Южноафриканский жестовый": "https://iptv-org.github.io/iptv/languages/sfs.m3u",
    "Южный ндебеле": "https://iptv-org.github.io/iptv/languages/nbl.m3u",
    "Не определено": "https://iptv-org.github.io/iptv/languages/undefined.m3u"
  },
  "Регионы": {
    "Азия": "https://iptv-org.github.io/iptv/regions/asia.m3u",
    "Азиатско-Тихоокеанский регион": "https://iptv-org.github.io/iptv/regions/apac.m3u",
    "Америка": "https://iptv-org.github.io/iptv/regions/amer.m3u",
    "Арабский мир": "https://iptv-org.github.io/iptv/regions/arab.m3u",
    "АСЕАН": "https://iptv-org.github.io/iptv/regions/asean.m3u",
    "Африка": "https://iptv-org.github.io/iptv/regions/afr.m3u",
    "Африка к югу от Сахары": "https://iptv-org.github.io/iptv/regions/ssa.m3u",
    "Балканы": "https://iptv-org.github.io/iptv/regions/balkan.m3u",
    "Бенилюкс": "https://iptv-org.github.io/iptv/regions/benelux.m3u",
    "Ближний Восток": "https://iptv-org.github.io/iptv/regions/mideast.m3u",
    "Ближний Восток и Северная Африка": "https://iptv-org.github.io/iptv/regions/mena.m3u",
    "Восточная Азия": "https://iptv-org.github.io/iptv/regions/eas.m3u",
    "Восточная Африка": "https://iptv-org.github.io/iptv/regions/eaf.m3u",
    "Всемирный": "https://iptv-org.github.io/iptv/regions/ww.m3u",
    "Европа": "https://iptv-org.github.io/iptv/regions/eur.m3u",
    "Европа, Ближний Восток и Африка": "https://iptv-org.github.io/iptv/regions/emea.m3u",
    "Европейский союз": "https://iptv-org.github.io/iptv/regions/eu.m3u",
    "Западная Азия": "https://iptv-org.github.io/iptv/regions/was.m3u",
    "Западная Африка": "https://iptv-org.github.io/iptv/regions/waf.m3u",
    "Западная Европа": "https://iptv-org.github.io/iptv/regions/wer.m3u",
    "Карибы": "https://iptv-org.github.io/iptv/regions/carib.m3u",
    "Центральная Азия": "https://iptv-org.github.io/iptv/regions/cas.m3u",
    "Центральная Америка": "https://iptv-org.github.io/iptv/regions/cenamer.m3u",
    "Центральная Европа": "https://iptv-org.github.io/iptv/regions/ceu.m3u",
    "Центральная и Восточная Европа": "https://iptv-org.github.io/iptv/regions/cee.m3u",
    "Испаноязычная Америка": "https://iptv-org.github.io/iptv/regions/hispam.m3u",
    "Латинская Америка": "https://iptv-org.github.io/iptv/regions/latam.m3u",
    "Латинская Америка и Карибы": "https://iptv-org.github.io/iptv/regions/lac.m3u",
    "Магриб": "https://iptv-org.github.io/iptv/regions/maghreb.m3u",
    "Океания": "https://iptv-org.github.io/iptv/regions/oce.m3u",
    "Организация Объединённых Наций": "https://iptv-org.github.io/iptv/regions/un.m3u",
    "Северная Америка": "https://iptv-org.github.io/iptv/regions/noram.m3u",
    "Северная Америка (континент)": "https://iptv-org.github.io/iptv/regions/nam.m3u",
    "Северная Европа": "https://iptv-org.github.io/iptv/regions/neu.m3u",
    "Страны Северной Европы": "https://iptv-org.github.io/iptv/regions/nord.m3u",
    "Совет сотрудничества арабских государств Персидского залива": "https://iptv-org.github.io/iptv/regions/gcc.m3u",
    "СНГ": "https://iptv-org.github.io/iptv/regions/cis.m3u",
    "Южная Азия": "https://iptv-org.github.io/iptv/regions/sas.m3u",
    "Южная Америка": "https://iptv-org.github.io/iptv/regions/southam.m3u",
    "Южная Африка": "https://iptv-org.github.io/iptv/regions/saf.m3u",
    "Южная Европа": "https://iptv-org.github.io/iptv/regions/ser.m3u",
    "Юго-Восточная Азия": "https://iptv-org.github.io/iptv/regions/sea.m3u"
  }
};

// ===== ЗАКРЫТИЕ ПЛЕЕРА =====
closeModal.addEventListener('click', function() {
    if (globalPlyrInstance) {
        globalPlyrInstance.destroy();
        globalPlyrInstance = null;
    }
    playerModal.style.display = 'none';
    if (currentWatchedChannel && watchStartTime) {
        const watchedSeconds = Math.floor((Date.now() - watchStartTime) / 1000);
        if (watchedSeconds >= 60) {
            addToWatched(
                currentWatchedChannel.name,
                currentWatchedChannel.url,
                currentWatchedChannel.group,
                currentWatchedChannel.logo
            );
            addToPopular(
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

// ===== УВЕДОМЛЕНИЯ =====
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ===== ЛОКАЛЬНЫЕ "ПРОСМОТРЕННЫЕ" =====
function addToWatched(name, url, group, logo) {
    let watched = JSON.parse(localStorage.getItem('watchedChannels') || '[]');
    if (!Array.isArray(watched)) watched = [];
    if (!watched.some(item => item.url === url)) {
        watched.push({ name, url, group, logo });
        localStorage.setItem('watchedChannels', JSON.stringify(watched));
    }
}

// ===== ГЛОБАЛЬНЫЕ "ПОПУЛЯРНЫЕ" (Firebase) — БЕЗ УДАЛЕНИЯ =====
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
        console.error("Firebase addToPopular:", error);
    }
}

// ===== ПОЛНОЭКРАННЫЙ ПЛЕЕР (Plyr) =====
function openFullScreenPlayer(name, url, group, logo) {
    currentWatchedChannel = { name, url, group, logo };
    watchStartTime = Date.now();
    playerModal.style.display = 'flex';
    videoPlayerElement.src = '';
    videoPlayerElement.load();

    if (globalPlyrInstance) {
        globalPlyrInstance.destroy();
    }

    let hls = null;
    if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(videoPlayerElement);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            globalPlyrInstance = new Plyr(videoPlayerElement, {
                tooltips: { controls: true },
                fullscreen: { enabled: true },
                i18n: {
                    restart: translateText('Начать сначала'),
                    rewind: translateText('Назад на 10 сек'),
                    play: translateText('Воспроизвести'),
                    pause: translateText('Пауза'),
                    fastForward: translateText('Вперёд на 10 сек')
                }
            });
        });
        hls.on(Hls.Events.ERROR, () => {
            showToast(translateText('Канал недоступен'));
            closeModal.click();
        });
    } else if (videoPlayerElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoPlayerElement.src = url;
        videoPlayerElement.addEventListener('loadedmetadata', () => {
            globalPlyrInstance = new Plyr(videoPlayerElement, {
                tooltips: { controls: true },
                fullscreen: { enabled: true }
            });
        });
        videoPlayerElement.addEventListener('error', () => {
            showToast(translateText('Канал недоступен'));
            closeModal.click();
        });
    } else {
        showToast(translateText('Формат не поддерживается'));
        playerModal.style.display = 'none';
    }
}

// ===== МИНИ-ПЛЕЕР (Plyr) =====
function createMiniPlayer(url) {
    if (miniPlayers.has(url)) return miniPlayers.get(url).container;

    const container = document.createElement('div');
    container.className = 'mini-player';
    const video = document.createElement('video');
    video.playsInline = true;
    video.muted = true;
    container.appendChild(video);

    miniPlayers.set(url, { container, plyr: null, hls: null, video });
    return container;
}

function initializeMiniPlayer(video, url, container, icon) {
    let hls = null;
    if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            const { plyr } = miniPlayers.get(url) || {};
            if (plyr) plyr.destroy();
            const newPlyr = new Plyr(video, {
                controls: [],
                tooltips: { controls: false },
                fullscreen: { enabled: false },
                keyboard: { focused: false }
            });
            miniPlayers.set(url, { container, plyr: newPlyr, hls, video });
            newPlyr.play().catch(() => {});
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
            const { plyr } = miniPlayers.get(url) || {};
            if (plyr) plyr.destroy();
            const newPlyr = new Plyr(video, {
                controls: [], tooltips: { controls: false }, fullscreen: { enabled: false }
            });
            miniPlayers.set(url, { container, plyr: newPlyr, hls: null, video });
            newPlyr.play().catch(() => {});
        });
    }
}

// ===== ПРОВЕРКА ДОСТУПНОСТИ =====
function checkChannelAvailability(url) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        let manifestLoaded = false;
        const timeout = setTimeout(() => {
            if (!manifestLoaded) resolve(false);
        }, 5000);

        const cleanup = () => {
            clearTimeout(timeout);
            if (hls) hls.destroy();
            video.src = '';
        };

        let hls = null;
        if (Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                manifestLoaded = true;
                cleanup();
                resolve(true);
            });
            hls.on(Hls.Events.ERROR, () => {
                cleanup();
                resolve(false);
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.addEventListener('loadedmetadata', () => {
                manifestLoaded = true;
                cleanup();
                resolve(true);
            });
            video.addEventListener('error', () => {
                cleanup();
                resolve(false);
            });
        } else {
            cleanup();
            resolve(false);
        }
    });
}

// ===== СЛУЧАЙНЫЙ КАНАЛ (ТОЛЬКО index.m3u) =====
async function loadRandomChannel() {
    initialLoader.style.display = 'flex';
    channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center;">${translateText("Загрузка...")}</div>`;

    try {
        if (!cachedGlobalPlaylist) {
            const res = await fetch('https://iptv-org.github.io/iptv/index.m3u');
            const text = await res.text();
            cachedGlobalPlaylist = parseM3UContent(text, translateText('Международные'));
        }

        const blacklist = JSON.parse(localStorage.getItem('blacklist') || '[]');
        let candidates = cachedGlobalPlaylist.filter(ch => !blacklist.includes(ch.url));
        candidates.sort(() => 0.5 - Math.random());

        const valid = [];
        const MAX_CHECKS = 12;
        const TARGET = 6;
        for (let i = 0; i < Math.min(20, candidates.length) && valid.length < TARGET && i < MAX_CHECKS; i++) {
            if (await checkChannelAvailability(candidates[i].url)) {
                valid.push(candidates[i]);
            } else {
                addToBlacklist(candidates[i].url);
            }
        }

        renderChannels(valid.length ? valid : null);
    } catch (e) {
        console.error(e);
        channelsContainer.innerHTML = `<div style="color:#aaa; padding:60px 20px; text-align:center; font-size:16px;">
            <i class="fas fa-exclamation-triangle" style="font-size:48px; margin-bottom:20px;"></i><br>
            ${translateText("Не удалось найти доступный канал")}<br>
            ${translateText("Попробуйте позже")}
        </div>`;
    } finally {
        initialLoader.style.display = 'none';
    }
}

function addToBlacklist(url) {
    const list = JSON.parse(localStorage.getItem('blacklist') || '[]');
    if (!list.includes(url)) {
        list.push(url);
        localStorage.setItem('blacklist', JSON.stringify(list));
    }
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
async function fetchM3U(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
}

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
                let group = assignedCategory;
                const groupMatch = infoLine.match(/tvg-group-title="([^"]*)"/);
                if (groupMatch && groupMatch[1]) {
                    group = groupMatch[1].trim();
                }
                channels.push({ name, url: urlLine.trim(), group, logo });
            }
        }
    }
    return filterBlacklistedChannels(channels);
}

function filterBlacklistedChannels(channelsList) {
    const blacklist = JSON.parse(localStorage.getItem('blacklist') || '[]');
    return channelsList.filter(channel => !blacklist.includes(channel.url));
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

// ===== ОТРИСОВКА КАНАЛОВ =====
function renderChannels(channelsToRender) {
    channelsContainer.innerHTML = '';
    if (!channelsToRender || channelsToRender.length === 0) {
        channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center;">${translateText("Каналы не найдены")}</div>`;
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
        if (channel.views) viewsText = ` 👥 ${channel.views}`;

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
                    video.dataset.initialized = 'true';
                    initializeMiniPlayer(video, channel.url, miniPlayer, icon);
                } else if (video.paused) {
                    video.play().catch(e => console.log("Autoplay:", e));
                }
            }, 2000);
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

// ===== НАВИГАЦИЯ И КАТЕГОРИИ =====
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
        btn.addEventListener('click', () => selectMainCategory(cat, index));
        mainCategoriesPanel.appendChild(btn);
    });
}

function selectMainCategory(categoryName, index) {
    currentMainCategory = categoryName;
    currentMainCategoryIndex = index;
    currentSubcategory = '';
    currentSubCategoryIndex = 0;
    if (categoryName === 'Случайный канал') {
        loadRandomChannel();
    } else if (categoryName === 'Популярные') {
        loadPopularChannels();
    } else if (categoryName === 'Просмотренные') {
        loadWatchedChannels();
    } else {
        renderChannels([]);
    }
    setTimeout(() => {
        const first = document.querySelector('.channel-card');
        if (first) first.focus();
    }, 100);
}

async function loadPopularChannels() {
    initialLoader.style.display = 'flex';
    try {
        const snapshot = await database.ref('popular').get();
        let popular = [];
        if (snapshot.exists()) {
            popular = Object.values(snapshot.val());
            popular.sort((a, b) => b.views - a.views);
        }
        renderChannels(popular);
    } catch (e) {
        console.error(e);
        renderChannels([]);
    } finally {
        initialLoader.style.display = 'none';
    }
}

function loadWatchedChannels() {
    const watched = JSON.parse(localStorage.getItem('watchedChannels') || '[]');
    renderChannels(watched);
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
function initApp() {
    renderMainCategories();
    selectMainCategory('Просмотренные', 0);
}

document.addEventListener('DOMContentLoaded', initApp);
