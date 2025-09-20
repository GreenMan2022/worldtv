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

// Инициализируем Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 👇 Язык интерфейса
let currentLanguage = localStorage.getItem('appLanguage') || 'ru';

// 👇 Словарь переводов
const translations = {
    ru: {
        "Просмотренные": "Просмотренные",
        "Прямо сейчас": "Прямо сейчас",
        "Смотрят": "Смотрят",
        "Свой плейлист": "Свой плейлист",
        "Категории": "Категории",
        "Страны": "Страны",
        "Языки": "Языки",
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
        "Language changed to English": "Язык изменён на Английский"
    },
    en: {
        "Просмотренные": "Watched",
        "Прямо сейчас": "Watching Now",
        "Смотрят": "Popular",
        "Свой плейлист": "My Playlist",
        "Категории": "Categories",
        "Страны": "Countries",
        "Языки": "Languages",
        "Загрузите плейлист по ссылке": "Upload playlist via URL",
        "Поддерживается формат M3U": "M3U format supported",
        "Загрузить плейлист": "Load Playlist",
        "Плейлист не загружен.": "Playlist not loaded.",
        "Перейдите в подменю и выберите «Загрузить по ссылке»": "Go to submenu and select 'Load from URL'",
        "Пока никто в мире не смотрит...": "No one is watching globally...",
        "Включите канал на 60+ сек — и вы первым появитесь здесь!": "Watch any channel for 60+ sec to appear here!",
        "Прямо сейчас никто не смотрит...": "No one is watching right now...",
        "Включите канал — и станьте первым!": "Start watching to be the first!",
        "Каналы не найдены": "Channels not found",
        "Загрузка...": "Loading...",
        "Загрузка": "Loading",
        "Ошибка инициализации": "Initialization error",
        "Ошибка приложения": "App error",
        "Ошибка сохранения": "Save error",
        "Канал не отвечает": "Channel not responding",
        "Канал недоступен": "Channel unavailable",
        "Нажмите на видео для воспроизведения": "Click video to play",
        "Формат не поддерживается": "Format not supported",
        "Не удалось загрузить плейлист": "Failed to load playlist",
        "Плейлист загружен!": "Playlist loaded!",
        "Введите ссылку": "Enter URL",
        "Язык изменён на Русский": "Language changed to Russian",
        "Language changed to English": "Language changed to English"
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

// 👇 Просмотренные: Новые переменные
let currentWatchedChannel = null; // { name, url, group, logo }
let watchStartTime = null;        // timestamp открытия плеера

// Структура плейлистов
const categoryTree = {
  "Просмотренные": {},
  "Прямо сейчас": {},
  "Смотрят": {},
  "Свой плейлист": {},
  "Категории": {
    "Анимация": "https://iptv-org.github.io/iptv/categories/animation.m3u",
    "Авто": "https://iptv-org.github.io/iptv/categories/auto.m3u",
    "Бизнес": "https://iptv-org.github.io/iptv/categories/business.m3u",
    "Классика": "https://iptv-org.github.io/iptv/categories/classic.m3u",
    "Комедии": "https://iptv-org.github.io/iptv/categories/comedy.m3u",
    "Кулинария": "https://iptv-org.github.io/iptv/categories/cooking.m3u",
    "Культура": "https://iptv-org.github.io/iptv/categories/culture.m3u",
    "Документальные": "https://iptv-org.github.io/iptv/categories/documentary.m3u",
    "Образование": "https://iptv-org.github.io/iptv/categories/education.m3u",
    "Развлечения": "https://iptv-org.github.io/iptv/categories/entertainment.m3u",
    "Семейные": "https://iptv-org.github.io/iptv/categories/family.m3u",
    "Общие": "https://iptv-org.github.io/iptv/categories/general.m3u",
    "Интерактивные": "https://iptv-org.github.io/iptv/categories/interactive.m3u",
    "Детские": "https://iptv-org.github.io/iptv/categories/kids.m3u",
    "Законодательные": "https://iptv-org.github.io/iptv/categories/legislative.m3u",
    "Образ жизни": "https://iptv-org.github.io/iptv/categories/lifestyle.m3u",
    "Кино": "https://iptv-org.github.io/iptv/categories/movies.m3u",
    "Музыка": "https://iptv-org.github.io/iptv/categories/music.m3u",
    "Новости": "https://iptv-org.github.io/iptv/categories/news.m3u",
    "Активный отдых": "https://iptv-org.github.io/iptv/categories/outdoor.m3u",
    "Общественные": "https://iptv-org.github.io/iptv/categories/public.m3u",
    "Релакс": "https://iptv-org.github.io/iptv/categories/relax.m3u",
    "Религиозные": "https://iptv-org.github.io/iptv/categories/religious.m3u",
    "Наука": "https://iptv-org.github.io/iptv/categories/science.m3u",
    "Сериалы": "https://iptv-org.github.io/iptv/categories/series.m3u",
    "Шопинг": "https://iptv-org.github.io/iptv/categories/shop.m3u",
    "Спорт": "https://iptv-org.github.io/iptv/categories/sports.m3u",
    "Путешествия": "https://iptv-org.github.io/iptv/categories/travel.m3u",
    "Погода": "https://iptv-org.github.io/iptv/categories/weather.m3u",
    "XXX": "https://iptv-org.github.io/iptv/categories/xxx.m3u",
    "Не определено": "https://iptv-org.github.io/iptv/categories/undefined.m3u"
  },
  "Страны": {
    "Афганистан": "https://iptv-org.github.io/iptv/countries/af.m3u",
    "Албания": "https://iptv-org.github.io/iptv/countries/al.m3u",
    "Алжир": "https://iptv-org.github.io/iptv/countries/dz.m3u",
    "Андорра": "https://iptv-org.github.io/iptv/countries/ad.m3u",
    "Ангола": "https://iptv-org.github.io/iptv/countries/ao.m3u",
    "Аргентина": "https://iptv-org.github.io/iptv/countries/ar.m3u",
    "Армения": "https://iptv-org.github.io/iptv/countries/am.m3u",
    "Аруба": "https://iptv-org.github.io/iptv/countries/aw.m3u",
    "Австралия": "https://iptv-org.github.io/iptv/countries/au.m3u",
    "Австрия": "https://iptv-org.github.io/iptv/countries/at.m3u",
    "Азербайджан": "https://iptv-org.github.io/iptv/countries/az.m3u",
    "Багамы": "https://iptv-org.github.io/iptv/countries/bs.m3u",
    "Бахрейн": "https://iptv-org.github.io/iptv/countries/bh.m3u",
    "Бангладеш": "https://iptv-org.github.io/iptv/countries/bd.m3u",
    "Барбадос": "https://iptv-org.github.io/iptv/countries/bb.m3u",
    "Беларусь": "https://iptv-org.github.io/iptv/countries/by.m3u",
    "Бельгия": "https://iptv-org.github.io/iptv/countries/be.m3u",
    "Бенин": "https://iptv-org.github.io/iptv/countries/bj.m3u",
    "Бермуды": "https://iptv-org.github.io/iptv/countries/bm.m3u",
    "Бутан": "https://iptv-org.github.io/iptv/countries/bt.m3u",
    "Боливия": "https://iptv-org.github.io/iptv/countries/bo.m3u",
    "Бонайре": "https://iptv-org.github.io/iptv/countries/bq.m3u",
    "Босния и Герцеговина": "https://iptv-org.github.io/iptv/countries/ba.m3u",
    "Бразилия": "https://iptv-org.github.io/iptv/countries/br.m3u",
    "Британские Виргинские острова": "https://iptv-org.github.io/iptv/countries/vg.m3u",
    "Бруней": "https://iptv-org.github.io/iptv/countries/bn.m3u",
    "Болгария": "https://iptv-org.github.io/iptv/countries/bg.m3u",
    "Буркина-Фасо": "https://iptv-org.github.io/iptv/countries/bf.m3u",
    "Камбоджа": "https://iptv-org.github.io/iptv/countries/kh.m3u",
    "Камерун": "https://iptv-org.github.io/iptv/countries/cm.m3u",
    "Канада": "https://iptv-org.github.io/iptv/countries/ca.m3u",
    "Кабо-Верде": "https://iptv-org.github.io/iptv/countries/cv.m3u",
    "Чад": "https://iptv-org.github.io/iptv/countries/td.m3u",
    "Чили": "https://iptv-org.github.io/iptv/countries/cl.m3u",
    "Китай": "https://iptv-org.github.io/iptv/countries/cn.m3u",
    "Колумбия": "https://iptv-org.github.io/iptv/countries/co.m3u",
    "Коста-Рика": "https://iptv-org.github.io/iptv/countries/cr.m3u",
    "Хорватия": "https://iptv-org.github.io/iptv/countries/hr.m3u",
    "Куба": "https://iptv-org.github.io/iptv/countries/cu.m3u",
    "Кюрасао": "https://iptv-org.github.io/iptv/countries/cw.m3u",
    "Кипр": "https://iptv-org.github.io/iptv/countries/cy.m3u",
    "Чехия": "https://iptv-org.github.io/iptv/countries/cz.m3u",
    "Демократическая Республика Конго": "https://iptv-org.github.io/iptv/countries/cd.m3u",
    "Дания": "https://iptv-org.github.io/iptv/countries/dk.m3u",
    "Джибути": "https://iptv-org.github.io/iptv/countries/dj.m3u",
    "Доминиканская Республика": "https://iptv-org.github.io/iptv/countries/do.m3u",
    "Эквадор": "https://iptv-org.github.io/iptv/countries/ec.m3u",
    "Египет": "https://iptv-org.github.io/iptv/countries/eg.m3u",
    "Сальвадор": "https://iptv-org.github.io/iptv/countries/sv.m3u",
    "Экваториальная Гвинея": "https://iptv-org.github.io/iptv/countries/gq.m3u",
    "Эритрея": "https://iptv-org.github.io/iptv/countries/er.m3u",
    "Эстония": "https://iptv-org.github.io/iptv/countries/ee.m3u",
    "Эфиопия": "https://iptv-org.github.io/iptv/countries/et.m3u",
    "Фарерские острова": "https://iptv-org.github.io/iptv/countries/fo.m3u",
    "Финляндия": "https://iptv-org.github.io/iptv/countries/fi.m3u",
    "Франция": "https://iptv-org.github.io/iptv/countries/fr.m3u",
    "Французская Полинезия": "https://iptv-org.github.io/iptv/countries/pf.m3u",
    "Габон": "https://iptv-org.github.io/iptv/countries/ga.m3u",
    "Гамбия": "https://iptv-org.github.io/iptv/countries/gm.m3u",
    "Грузия": "https://iptv-org.github.io/iptv/countries/ge.m3u",
    "Германия": "https://iptv-org.github.io/iptv/countries/de.m3u",
    "Гана": "https://iptv-org.github.io/iptv/countries/gh.m3u",
    "Греция": "https://iptv-org.github.io/iptv/countries/gr.m3u",
    "Гваделупа": "https://iptv-org.github.io/iptv/countries/gp.m3u",
    "Гуам": "https://iptv-org.github.io/iptv/countries/gu.m3u",
    "Гватемала": "https://iptv-org.github.io/iptv/countries/gt.m3u",
    "Гернси": "https://iptv-org.github.io/iptv/countries/gg.m3u",
    "Гвинея": "https://iptv-org.github.io/iptv/countries/gn.m3u",
    "Гайана": "https://iptv-org.github.io/iptv/countries/gy.m3u",
    "Гаити": "https://iptv-org.github.io/iptv/countries/ht.m3u",
    "Гондурас": "https://iptv-org.github.io/iptv/countries/hn.m3u",
    "Гонконг": "https://iptv-org.github.io/iptv/countries/hk.m3u",
    "Венгрия": "https://iptv-org.github.io/iptv/countries/hu.m3u",
    "Исландия": "https://iptv-org.github.io/iptv/countries/is.m3u",
    "Индия": "https://iptv-org.github.io/iptv/countries/in.m3u",
    "Индонезия": "https://iptv-org.github.io/iptv/countries/id.m3u",
    "Иран": "https://iptv-org.github.io/iptv/countries/ir.m3u",
    "Ирак": "https://iptv-org.github.io/iptv/countries/iq.m3u",
    "Ирландия": "https://iptv-org.github.io/iptv/countries/ie.m3u",
    "Израиль": "https://iptv-org.github.io/iptv/countries/il.m3u",
    "Италия": "https://iptv-org.github.io/iptv/countries/it.m3u",
    "Кот-д'Ивуар": "https://iptv-org.github.io/iptv/countries/ci.m3u",
    "Ямайка": "https://iptv-org.github.io/iptv/countries/jm.m3u",
    "Япония": "https://iptv-org.github.io/iptv/countries/jp.m3u",
    "Иордания": "https://iptv-org.github.io/iptv/countries/jo.m3u",
    "Казахстан": "https://iptv-org.github.io/iptv/countries/kz.m3u",
    "Кения": "https://iptv-org.github.io/iptv/countries/ke.m3u",
    "Косово": "https://iptv-org.github.io/iptv/countries/xk.m3u",
    "Кувейт": "https://iptv-org.github.io/iptv/countries/kw.m3u",
    "Киргизия": "https://iptv-org.github.io/iptv/countries/kg.m3u",
    "Лаос": "https://iptv-org.github.io/iptv/countries/la.m3u",
    "Латвия": "https://iptv-org.github.io/iptv/countries/lv.m3u",
    "Ливан": "https://iptv-org.github.io/iptv/countries/lb.m3u",
    "Либерия": "https://iptv-org.github.io/iptv/countries/lr.m3u",
    "Ливия": "https://iptv-org.github.io/iptv/countries/ly.m3u",
    "Лихтенштейн": "https://iptv-org.github.io/iptv/countries/li.m3u",
    "Литва": "https://iptv-org.github.io/iptv/countries/lt.m3u",
    "Люксембург": "https://iptv-org.github.io/iptv/countries/lu.m3u",
    "Макао": "https://iptv-org.github.io/iptv/countries/mo.m3u",
    "Малайзия": "https://iptv-org.github.io/iptv/countries/my.m3u",
    "Мальдивы": "https://iptv-org.github.io/iptv/countries/mv.m3u",
    "Мали": "https://iptv-org.github.io/iptv/countries/ml.m3u",
    "Мальта": "https://iptv-org.github.io/iptv/countries/mt.m3u",
    "Мартиника": "https://iptv-org.github.io/iptv/countries/mq.m3u",
    "Мавритания": "https://iptv-org.github.io/iptv/countries/mr.m3u",
    "Маврикий": "https://iptv-org.github.io/iptv/countries/mu.m3u",
    "Мексика": "https://iptv-org.github.io/iptv/countries/mx.m3u",
    "Молдова": "https://iptv-org.github.io/iptv/countries/md.m3u",
    "Монако": "https://iptv-org.github.io/iptv/countries/mc.m3u",
    "Монголия": "https://iptv-org.github.io/iptv/countries/mn.m3u",
    "Черногория": "https://iptv-org.github.io/iptv/countries/me.m3u",
    "Марокко": "https://iptv-org.github.io/iptv/countries/ma.m3u",
    "Мозамбик": "https://iptv-org.github.io/iptv/countries/mz.m3u",
    "Мьянма": "https://iptv-org.github.io/iptv/countries/mm.m3u",
    "Намибия": "https://iptv-org.github.io/iptv/countries/na.m3u",
    "Непал": "https://iptv-org.github.io/iptv/countries/np.m3u",
    "Нидерланды": "https://iptv-org.github.io/iptv/countries/nl.m3u",
    "Новая Зеландия": "https://iptv-org.github.io/iptv/countries/nz.m3u",
    "Никарагуа": "https://iptv-org.github.io/iptv/countries/ni.m3u",
    "Нигер": "https://iptv-org.github.io/iptv/countries/ne.m3u",
    "Нигерия": "https://iptv-org.github.io/iptv/countries/ng.m3u",
    "Северная Корея": "https://iptv-org.github.io/iptv/countries/kp.m3u",
    "Северная Македония": "https://iptv-org.github.io/iptv/countries/mk.m3u",
    "Норвегия": "https://iptv-org.github.io/iptv/countries/no.m3u",
    "Оман": "https://iptv-org.github.io/iptv/countries/om.m3u",
    "Пакистан": "https://iptv-org.github.io/iptv/countries/pk.m3u",
    "Палестина": "https://iptv-org.github.io/iptv/countries/ps.m3u",
    "Панама": "https://iptv-org.github.io/iptv/countries/pa.m3u",
    "Папуа — Новая Гвинея": "https://iptv-org.github.io/iptv/countries/pg.m3u",
    "Парагвай": "https://iptv-org.github.io/iptv/countries/py.m3u",
    "Перу": "https://iptv-org.github.io/iptv/countries/pe.m3u",
    "Филиппины": "https://iptv-org.github.io/iptv/countries/ph.m3u",
    "Польша": "https://iptv-org.github.io/iptv/countries/pl.m3u",
    "Португалия": "https://iptv-org.github.io/iptv/countries/pt.m3u",
    "Пуэрто-Рико": "https://iptv-org.github.io/iptv/countries/pr.m3u",
    "Катар": "https://iptv-org.github.io/iptv/countries/qa.m3u",
    "Республика Конго": "https://iptv-org.github.io/iptv/countries/cg.m3u",
    "Реюньон": "https://iptv-org.github.io/iptv/countries/re.m3u",
    "Румыния": "https://iptv-org.github.io/iptv/countries/ro.m3u",
    "Россия": "https://iptv-org.github.io/iptv/countries/ru.m3u",
    "Руанда": "https://iptv-org.github.io/iptv/countries/rw.m3u",
    "Сент-Китс и Невис": "https://iptv-org.github.io/iptv/countries/kn.m3u",
    "Сент-Люсия": "https://iptv-org.github.io/iptv/countries/lc.m3u",
    "Самоа": "https://iptv-org.github.io/iptv/countries/ws.m3u",
    "Сан-Марино": "https://iptv-org.github.io/iptv/countries/sm.m3u",
    "Саудовская Аравия": "https://iptv-org.github.io/iptv/countries/sa.m3u",
    "Сенегал": "https://iptv-org.github.io/iptv/countries/sn.m3u",
    "Сербия": "https://iptv-org.github.io/iptv/countries/rs.m3u",
    "Сингапур": "https://iptv-org.github.io/iptv/countries/sg.m3u",
    "Синт-Мартен": "https://iptv-org.github.io/iptv/countries/sx.m3u",
    "Словакия": "https://iptv-org.github.io/iptv/countries/sk.m3u",
    "Словения": "https://iptv-org.github.io/iptv/countries/si.m3u",
    "Сомали": "https://iptv-org.github.io/iptv/countries/so.m3u",
    "Южная Африка": "https://iptv-org.github.io/iptv/countries/za.m3u",
    "Южная Корея": "https://iptv-org.github.io/iptv/countries/kr.m3u",
    "Испания": "https://iptv-org.github.io/iptv/countries/es.m3u",
    "Шри-Ланка": "https://iptv-org.github.io/iptv/countries/lk.m3u",
    "Судан": "https://iptv-org.github.io/iptv/countries/sd.m3u",
    "Суринам": "https://iptv-org.github.io/iptv/countries/sr.m3u",
    "Швеция": "https://iptv-org.github.io/iptv/countries/se.m3u",
    "Швейцария": "https://iptv-org.github.io/iptv/countries/ch.m3u",
    "Сирия": "https://iptv-org.github.io/iptv/countries/sy.m3u",
    "Тайвань": "https://iptv-org.github.io/iptv/countries/tw.m3u",
    "Таджикистан": "https://iptv-org.github.io/iptv/countries/tj.m3u",
    "Танзания": "https://iptv-org.github.io/iptv/countries/tz.m3u",
    "Таиланд": "https://iptv-org.github.io/iptv/countries/th.m3u",
    "Того": "https://iptv-org.github.io/iptv/countries/tg.m3u",
    "Тринидад и Тобаго": "https://iptv-org.github.io/iptv/countries/tt.m3u",
    "Тунис": "https://iptv-org.github.io/iptv/countries/tn.m3u",
    "Турция": "https://iptv-org.github.io/iptv/countries/tr.m3u",
    "Туркменистан": "https://iptv-org.github.io/iptv/countries/tm.m3u",
    "Американские Виргинские острова": "https://iptv-org.github.io/iptv/countries/vi.m3u",
    "Уганда": "https://iptv-org.github.io/iptv/countries/ug.m3u",
    "Украина": "https://iptv-org.github.io/iptv/countries/ua.m3u",
    "ОАЭ": "https://iptv-org.github.io/iptv/countries/ae.m3u",
    "Великобритания": "https://iptv-org.github.io/iptv/countries/uk.m3u",
    "США": "https://iptv-org.github.io/iptv/countries/us.m3u",
    "Уругвай": "https://iptv-org.github.io/iptv/countries/uy.m3u",
    "Узбекистан": "https://iptv-org.github.io/iptv/countries/uz.m3u",
    "Ватикан": "https://iptv-org.github.io/iptv/countries/va.m3u",
    "Венесуэла": "https://iptv-org.github.io/iptv/countries/ve.m3u",
    "Вьетнам": "https://iptv-org.github.io/iptv/countries/vn.m3u",
    "Западная Сахара": "https://iptv-org.github.io/iptv/countries/eh.m3u",
    "Йемен": "https://iptv-org.github.io/iptv/countries/ye.m3u",
    "Зимбабве": "https://iptv-org.github.io/iptv/countries/zw.m3u",
    "Международные": "https://iptv-org.github.io/iptv/countries/int.m3u",
    "Не определено": "https://iptv-org.github.io/iptv/countries/undefined.m3u"
  },
  "Языки": {
    "Аколи": "https://iptv-org.github.io/iptv/languages/ach.m3u",
    "Адхола": "https://iptv-org.github.io/iptv/languages/adh.m3u",
    "Афар": "https://iptv-org.github.io/iptv/languages/aar.m3u",
    "Африкаанс": "https://iptv-org.github.io/iptv/languages/afr.m3u",
    "Албанский": "https://iptv-org.github.io/iptv/languages/sqi.m3u",
    "Алжирский жестовый": "https://iptv-org.github.io/iptv/languages/asp.m3u",
    "Алур": "https://iptv-org.github.io/iptv/languages/alz.m3u",
    "Амхарский": "https://iptv-org.github.io/iptv/languages/amh.m3u",
    "Арабский": "https://iptv-org.github.io/iptv/languages/ara.m3u",
    "Армянский": "https://iptv-org.github.io/iptv/languages/hye.m3u",
    "Ассамский": "https://iptv-org.github.io/iptv/languages/asm.m3u",
    "Ассирийский неоарамейский": "https://iptv-org.github.io/iptv/languages/aii.m3u",
    "Айизо гбе": "https://iptv-org.github.io/iptv/languages/ayb.m3u",
    "Аймара": "https://iptv-org.github.io/iptv/languages/aym.m3u",
    "Азербайджанский": "https://iptv-org.github.io/iptv/languages/aze.m3u",
    "Баатонум": "https://iptv-org.github.io/iptv/languages/bba.m3u",
    "Бамбара": "https://iptv-org.github.io/iptv/languages/bam.m3u",
    "Башкирский": "https://iptv-org.github.io/iptv/languages/bak.m3u",
    "Баскский": "https://iptv-org.github.io/iptv/languages/eus.m3u",
    "Белорусский": "https://iptv-org.github.io/iptv/languages/bel.m3u",
    "Бенгальский": "https://iptv-org.github.io/iptv/languages/ben.m3u",
    "Бходжпури": "https://iptv-org.github.io/iptv/languages/bho.m3u",
    "Боснийский": "https://iptv-org.github.io/iptv/languages/bos.m3u",
    "Болгарский": "https://iptv-org.github.io/iptv/languages/bul.m3u",
    "Бирманский": "https://iptv-org.github.io/iptv/languages/mya.m3u",
    "Каталанский": "https://iptv-org.github.io/iptv/languages/cat.m3u",
    "Центральный атлас тамазигхт": "https://iptv-org.github.io/iptv/languages/tzm.m3u",
    "Центральный курдский": "https://iptv-org.github.io/iptv/languages/ckb.m3u",
    "Ченуа": "https://iptv-org.github.io/iptv/languages/cnu.m3u",
    "Чхаттисгархи": "https://iptv-org.github.io/iptv/languages/hne.m3u",
    "Чига": "https://iptv-org.github.io/iptv/languages/cgg.m3u",
    "Китайский": "https://iptv-org.github.io/iptv/languages/zho.m3u",
    "Хорватский": "https://iptv-org.github.io/iptv/languages/hrv.m3u",
    "Чешский": "https://iptv-org.github.io/iptv/languages/ces.m3u",
    "Датский": "https://iptv-org.github.io/iptv/languages/dan.m3u",
    "Дари (Парси)": "https://iptv-org.github.io/iptv/languages/prd.m3u",
    "Денди (Бенин)": "https://iptv-org.github.io/iptv/languages/ddn.m3u",
    "Дханвар (Непал)": "https://iptv-org.github.io/iptv/languages/dhw.m3u",
    "Дивехи": "https://iptv-org.github.io/iptv/languages/div.m3u",
    "Дхолуо": "https://iptv-org.github.io/iptv/languages/luo.m3u",
    "Димили": "https://iptv-org.github.io/iptv/languages/zza.m3u",
    "Голландский": "https://iptv-org.github.io/iptv/languages/nld.m3u",
    "Дьюла": "https://iptv-org.github.io/iptv/languages/dyu.m3u",
    "Египетский арабский": "https://iptv-org.github.io/iptv/languages/arz.m3u",
    "Английский": "https://iptv-org.github.io/iptv/languages/eng.m3u",
    "Эстонский": "https://iptv-org.github.io/iptv/languages/est.m3u",
    "Эве": "https://iptv-org.github.io/iptv/languages/ewe.m3u",
    "Фарерский": "https://iptv-org.github.io/iptv/languages/fao.m3u",
    "Фаталика": "https://iptv-org.github.io/iptv/languages/far.m3u",
    "Филиппинский": "https://iptv-org.github.io/iptv/languages/fil.m3u",
    "Финский": "https://iptv-org.github.io/iptv/languages/fin.m3u",
    "Фон": "https://iptv-org.github.io/iptv/languages/fon.m3u",
    "Французский": "https://iptv-org.github.io/iptv/languages/fra.m3u",
    "Фулах": "https://iptv-org.github.io/iptv/languages/ful.m3u",
    "Гэльский": "https://iptv-org.github.io/iptv/languages/gla.m3u",
    "Ганда": "https://iptv-org.github.io/iptv/languages/lug.m3u",
    "Ген": "https://iptv-org.github.io/iptv/languages/gej.m3u",
    "Грузинский": "https://iptv-org.github.io/iptv/languages/kat.m3u",
    "Немецкий": "https://iptv-org.github.io/iptv/languages/deu.m3u",
    "Гикую": "https://iptv-org.github.io/iptv/languages/kik.m3u",
    "Гоан Конкани": "https://iptv-org.github.io/iptv/languages/gom.m3u",
    "Греческий": "https://iptv-org.github.io/iptv/languages/ell.m3u",
    "Гваделупский креольский французский": "https://iptv-org.github.io/iptv/languages/gcf.m3u",
    "Гуджарати": "https://iptv-org.github.io/iptv/languages/guj.m3u",
    "Гун": "https://iptv-org.github.io/iptv/languages/guw.m3u",
    "Гаитянский": "https://iptv-org.github.io/iptv/languages/hat.m3u",
    "Хауса": "https://iptv-org.github.io/iptv/languages/hau.m3u",
    "Иврит": "https://iptv-org.github.io/iptv/languages/heb.m3u",
    "Хинди": "https://iptv-org.github.io/iptv/languages/hin.m3u",
    "Хмонг": "https://iptv-org.github.io/iptv/languages/hmn.m3u",
    "Венгерский": "https://iptv-org.github.io/iptv/languages/hun.m3u",
    "Исландский": "https://iptv-org.github.io/iptv/languages/isl.m3u",
    "Индонезийский": "https://iptv-org.github.io/iptv/languages/ind.m3u",
    "Инуктитут": "https://iptv-org.github.io/iptv/languages/iku.m3u",
    "Ирландский": "https://iptv-org.github.io/iptv/languages/gle.m3u",
    "Исекири": "https://iptv-org.github.io/iptv/languages/its.m3u",
    "Итальянский": "https://iptv-org.github.io/iptv/languages/ita.m3u",
    "Японский": "https://iptv-org.github.io/iptv/languages/jpn.m3u",
    "Яванский": "https://iptv-org.github.io/iptv/languages/jav.m3u",
    "Кабийе": "https://iptv-org.github.io/iptv/languages/kbp.m3u",
    "Кабильский": "https://iptv-org.github.io/iptv/languages/kab.m3u",
    "Каннада": "https://iptv-org.github.io/iptv/languages/kan.m3u",
    "Капампанган": "https://iptv-org.github.io/iptv/languages/pam.m3u",
    "Казахский": "https://iptv-org.github.io/iptv/languages/kaz.m3u",
    "Кхмерский": "https://iptv-org.github.io/iptv/languages/khm.m3u",
    "Хорасани-турецкий": "https://iptv-org.github.io/iptv/languages/kmz.m3u",
    "Киньяруанда": "https://iptv-org.github.io/iptv/languages/kin.m3u",
    "Киргизский": "https://iptv-org.github.io/iptv/languages/kir.m3u",
    "Китуба (Конго)": "https://iptv-org.github.io/iptv/languages/mkw.m3u",
    "Конго": "https://iptv-org.github.io/iptv/languages/kon.m3u",
    "Конкани (макроязык)": "https://iptv-org.github.io/iptv/languages/kok.m3u",
    "Корейский": "https://iptv-org.github.io/iptv/languages/kor.m3u",
    "Кумам": "https://iptv-org.github.io/iptv/languages/kdi.m3u",
    "Курдский": "https://iptv-org.github.io/iptv/languages/kur.m3u",
    "Ланго (Уганда)": "https://iptv-org.github.io/iptv/languages/laj.m3u",
    "Лаосский": "https://iptv-org.github.io/iptv/languages/lao.m3u",
    "Латинский": "https://iptv-org.github.io/iptv/languages/lat.m3u",
    "Латышский": "https://iptv-org.github.io/iptv/languages/lav.m3u",
    "Люксембургский": "https://iptv-org.github.io/iptv/languages/ltz.m3u",
    "Лингала": "https://iptv-org.github.io/iptv/languages/lin.m3u",
    "Литовский": "https://iptv-org.github.io/iptv/languages/lit.m3u",
    "Луба-Лулуа": "https://iptv-org.github.io/iptv/languages/lua.m3u",
    "Лушай": "https://iptv-org.github.io/iptv/languages/lus.m3u",
    "Македонский": "https://iptv-org.github.io/iptv/languages/mkd.m3u",
    "Малайский": "https://iptv-org.github.io/iptv/languages/msa.m3u",
    "Малаялам": "https://iptv-org.github.io/iptv/languages/mal.m3u",
    "Мальтийский": "https://iptv-org.github.io/iptv/languages/mlt.m3u",
    "Мандарин китайский": "https://iptv-org.github.io/iptv/languages/cmn.m3u",
    "Мандинка": "https://iptv-org.github.io/iptv/languages/mnk.m3u",
    "Маори": "https://iptv-org.github.io/iptv/languages/mri.m3u",
    "Маратхи": "https://iptv-org.github.io/iptv/languages/mar.m3u",
    "Минь Нань китайский": "https://iptv-org.github.io/iptv/languages/nan.m3u",
    "Монгольский": "https://iptv-org.github.io/iptv/languages/mon.m3u",
    "Черногорский": "https://iptv-org.github.io/iptv/languages/cnr.m3u",
    "Морисьен": "https://iptv-org.github.io/iptv/languages/mfe.m3u",
    "Марокканский жестовый": "https://iptv-org.github.io/iptv/languages/xms.m3u",
    "Мосси": "https://iptv-org.github.io/iptv/languages/mos.m3u",
    "Микенский греческий": "https://iptv-org.github.io/iptv/languages/gmy.m3u",
    "Непальский": "https://iptv-org.github.io/iptv/languages/nep.m3u",
    "Норвежский": "https://iptv-org.github.io/iptv/languages/nor.m3u",
    "Ньянколе": "https://iptv-org.github.io/iptv/languages/nyn.m3u",
    "Ньоро": "https://iptv-org.github.io/iptv/languages/nyo.m3u",
    "Ория (макроязык)": "https://iptv-org.github.io/iptv/languages/ori.m3u",
    "Панджаби": "https://iptv-org.github.io/iptv/languages/pan.m3u",
    "Папьяменто": "https://iptv-org.github.io/iptv/languages/pap.m3u",
    "Пушту": "https://iptv-org.github.io/iptv/languages/pus.m3u",
    "Персидский": "https://iptv-org.github.io/iptv/languages/fas.m3u",
    "Польский": "https://iptv-org.github.io/iptv/languages/pol.m3u",
    "Португальский": "https://iptv-org.github.io/iptv/languages/por.m3u",
    "Пулаар": "https://iptv-org.github.io/iptv/languages/fuc.m3u",
    "Кечуа": "https://iptv-org.github.io/iptv/languages/que.m3u",
    "Румынский": "https://iptv-org.github.io/iptv/languages/ron.m3u",
    "Русский": "https://iptv-org.github.io/iptv/languages/rus.m3u",
    "Сент-Люсийский креольский французский": "https://iptv-org.github.io/iptv/languages/acf.m3u",
    "Самоанский": "https://iptv-org.github.io/iptv/languages/smo.m3u",
    "Сантальский": "https://iptv-org.github.io/iptv/languages/sat.m3u",
    "Сербский": "https://iptv-org.github.io/iptv/languages/srp.m3u",
    "Сербо-хорватский": "https://iptv-org.github.io/iptv/languages/hbs.m3u",
    "Сингальский": "https://iptv-org.github.io/iptv/languages/sin.m3u",
    "Словацкий": "https://iptv-org.github.io/iptv/languages/slk.m3u",
    "Словенский": "https://iptv-org.github.io/iptv/languages/slv.m3u",
    "Сомалийский": "https://iptv-org.github.io/iptv/languages/som.m3u",
    "Южноафриканский жестовый": "https://iptv-org.github.io/iptv/languages/sfs.m3u",
    "Южный ндебеле": "https://iptv-org.github.io/iptv/languages/nbl.m3u",
    "Испанский": "https://iptv-org.github.io/iptv/languages/spa.m3u",
    "Стандартный арабский": "https://iptv-org.github.io/iptv/languages/arb.m3u",
    "Суахили": "https://iptv-org.github.io/iptv/languages/swa.m3u",
    "Свати": "https://iptv-org.github.io/iptv/languages/ssw.m3u",
    "Шведский": "https://iptv-org.github.io/iptv/languages/swe.m3u",
    "Тачавит": "https://iptv-org.github.io/iptv/languages/shy.m3u",
    "Ташелхит": "https://iptv-org.github.io/iptv/languages/shi.m3u",
    "Тагальский": "https://iptv-org.github.io/iptv/languages/tgl.m3u",
    "Таитянский": "https://iptv-org.github.io/iptv/languages/tah.m3u",
    "Таджикский": "https://iptv-org.github.io/iptv/languages/tgk.m3u",
    "Тамашек": "https://iptv-org.github.io/iptv/languages/tmh.m3u",
    "Тамашек": "https://iptv-org.github.io/iptv/languages/taq.m3u",
    "Тамильский": "https://iptv-org.github.io/iptv/languages/tam.m3u",
    "Тарифит": "https://iptv-org.github.io/iptv/languages/rif.m3u",
    "Татарский": "https://iptv-org.github.io/iptv/languages/tat.m3u",
    "Телугу": "https://iptv-org.github.io/iptv/languages/tel.m3u",
    "Тайский": "https://iptv-org.github.io/iptv/languages/tha.m3u",
    "Тибетский": "https://iptv-org.github.io/iptv/languages/bod.m3u",
    "Тигре": "https://iptv-org.github.io/iptv/languages/tig.m3u",
    "Тигринья": "https://iptv-org.github.io/iptv/languages/tir.m3u",
    "Торо": "https://iptv-org.github.io/iptv/languages/ttj.m3u",
    "Цонга": "https://iptv-org.github.io/iptv/languages/tso.m3u",
    "Тумзабт": "https://iptv-org.github.io/iptv/languages/mzb.m3u",
    "Турецкий": "https://iptv-org.github.io/iptv/languages/tur.m3u",
    "Туркменский": "https://iptv-org.github.io/iptv/languages/tuk.m3u",
    "Уйгурский": "https://iptv-org.github.io/iptv/languages/uig.m3u",
    "Украинский": "https://iptv-org.github.io/iptv/languages/ukr.m3u",
    "Урду": "https://iptv-org.github.io/iptv/languages/urd.m3u",
    "Узбекский": "https://iptv-org.github.io/iptv/languages/uzb.m3u",
    "Венда": "https://iptv-org.github.io/iptv/languages/ven.m3u",
    "Вьетнамский": "https://iptv-org.github.io/iptv/languages/vie.m3u",
    "Валлийский": "https://iptv-org.github.io/iptv/languages/cym.m3u",
    "Западно-фризский": "https://iptv-org.github.io/iptv/languages/fry.m3u",
    "Волоф": "https://iptv-org.github.io/iptv/languages/wol.m3u",
    "Коса": "https://iptv-org.github.io/iptv/languages/xho.m3u",
    "Якутский": "https://iptv-org.github.io/iptv/languages/sah.m3u",
    "Йоруба": "https://iptv-org.github.io/iptv/languages/yor.m3u",
    "Юкатек Майя": "https://iptv-org.github.io/iptv/languages/yua.m3u",
    "Юэ китайский": "https://iptv-org.github.io/iptv/languages/yue.m3u",
    "Зарма": "https://iptv-org.github.io/iptv/languages/dje.m3u",
    "Зулу": "https://iptv-org.github.io/iptv/languages/zul.m3u",
    "Не определено": "https://iptv-org.github.io/iptv/languages/undefined.m3u"
  },
  "Регионы": {
    "Африка": "https://iptv-org.github.io/iptv/regions/afr.m3u",
    "Америка": "https://iptv-org.github.io/iptv/regions/amer.m3u",
    "Арабский мир": "https://iptv-org.github.io/iptv/regions/arab.m3u",
    "Азия": "https://iptv-org.github.io/iptv/regions/asia.m3u",
    "Азиатско-Тихоокеанский регион": "https://iptv-org.github.io/iptv/regions/apac.m3u",
    "АСЕАН": "https://iptv-org.github.io/iptv/regions/asean.m3u",
    "Балканы": "https://iptv-org.github.io/iptv/regions/balkan.m3u",
    "Бенилюкс": "https://iptv-org.github.io/iptv/regions/benelux.m3u",
    "Карибы": "https://iptv-org.github.io/iptv/regions/carib.m3u",
    "Центральная Америка": "https://iptv-org.github.io/iptv/regions/cenamer.m3u",
    "Центральная и Восточная Европа": "https://iptv-org.github.io/iptv/regions/cee.m3u",
    "Центральная Азия": "https://iptv-org.github.io/iptv/regions/cas.m3u",
    "Центральная Европа": "https://iptv-org.github.io/iptv/regions/ceu.m3u",
    "СНГ": "https://iptv-org.github.io/iptv/regions/cis.m3u",
    "Восточная Африка": "https://iptv-org.github.io/iptv/regions/eaf.m3u",
    "Восточная Азия": "https://iptv-org.github.io/iptv/regions/eas.m3u",
    "Европа": "https://iptv-org.github.io/iptv/regions/eur.m3u",
    "Европа, Ближний Восток и Африка": "https://iptv-org.github.io/iptv/regions/emea.m3u",
    "Европейский союз": "https://iptv-org.github.io/iptv/regions/eu.m3u",
    "Совет сотрудничества арабских государств Персидского залива": "https://iptv-org.github.io/iptv/regions/gcc.m3u",
    "Испаноязычная Америка": "https://iptv-org.github.io/iptv/regions/hispam.m3u",
    "Латинская Америка": "https://iptv-org.github.io/iptv/regions/latam.m3u",
    "Латинская Америка и Карибы": "https://iptv-org.github.io/iptv/regions/lac.m3u",
    "Магриб": "https://iptv-org.github.io/iptv/regions/maghreb.m3u",
    "Ближний Восток": "https://iptv-org.github.io/iptv/regions/mideast.m3u",
    "Ближний Восток и Северная Африка": "https://iptv-org.github.io/iptv/regions/mena.m3u",
    "Страны Северной Европы": "https://iptv-org.github.io/iptv/regions/nord.m3u",
    "Северная Америка": "https://iptv-org.github.io/iptv/regions/noram.m3u",
    "Северная Америка (континент)": "https://iptv-org.github.io/iptv/regions/nam.m3u",
    "Северная Европа": "https://iptv-org.github.io/iptv/regions/neu.m3u",
    "Океания": "https://iptv-org.github.io/iptv/regions/oce.m3u",
    "Южная Америка": "https://iptv-org.github.io/iptv/regions/southam.m3u",
    "Южная Азия": "https://iptv-org.github.io/iptv/regions/sas.m3u",
    "Юго-Восточная Азия": "https://iptv-org.github.io/iptv/regions/sea.m3u",
    "Южная Африка": "https://iptv-org.github.io/iptv/regions/saf.m3u",
    "Южная Европа": "https://iptv-org.github.io/iptv/regions/ser.m3u",
    "Африка к югу от Сахары": "https://iptv-org.github.io/iptv/regions/ssa.m3u",
    "Организация Объединённых Наций": "https://iptv-org.github.io/iptv/regions/un.m3u",
    "Западная Африка": "https://iptv-org.github.io/iptv/regions/waf.m3u",
    "Западная Азия": "https://iptv-org.github.io/iptv/regions/was.m3u",
    "Западная Европа": "https://iptv-org.github.io/iptv/regions/wer.m3u",
    "Всемирный": "https://iptv-org.github.io/iptv/regions/ww.m3u"
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
            addToWatching(
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

// 👇 Просмотренные: Добавление в localStorage
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
        console.error('❌ Ошибка парсинга watchedChannels:', e);
        watched = [];
    }

    if (watched.some(item => item.url === url)) {
        console.log(`ℹ️ Канал "${name}" уже в "Просмотренные"`);
        return;
    }

    watched.push({ name, url, group, logo });
    try {
        localStorage.setItem('watchedChannels', JSON.stringify(watched));
        console.log(`✅ Канал "${name}" добавлен в "Просмотренные"`);
    } catch (e) {
        console.error('❌ Не удалось сохранить в localStorage:', e);
        showToast(translateText('Ошибка сохранения'));
        return;
    }

    if (currentMainCategory === 'Просмотренные') {
        loadAndRenderChannels('Просмотренные', '');
    }
}

// 👇 Добавление в глобальный "Смотрят" (Firebase)
async function addToWatching(name, url, group, logo) {
    try {
        const now = Date.now();
        const key = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);

        const snapshot = await database.ref('watching/' + key).get();
        let data = snapshot.exists() ? snapshot.val() : {
            name,
            url,
            group,
            logo,
            views: 0,
            lastWatched: 0,
            createdAt: now
        };

        data.views = (data.views || 0) + 1;
        data.lastWatched = now;
        data.name = name;
        data.logo = logo;

        await database.ref('watching/' + key).set(data);
        console.log(`🌍 Глобально добавлен в "Смотрят": ${name}`);

    } catch (error) {
        console.error("❌ Ошибка Firebase addToWatching:", error);
    }
}

// 👇 Загрузка плейлиста по URL
async function loadPlaylistFromURL() {
    const urlInput = document.getElementById('playlistURL');
    const url = urlInput.value.trim();
    if (!url) {
        showToast(translateText('Введите ссылку'));
        urlInput.focus();
        return;
    }

    initialLoader.style.display = 'flex';

    try {
        const content = await fetchM3U(url);
        const channels = parseM3UContent(content, translateText('Свой плейлист'));

        if (channels.length === 0) {
            throw new Error('Плейлист пуст или не содержит поддерживаемых каналов');
        }

        localStorage.setItem('customPlaylist', JSON.stringify(channels));
        showToast(translateText('Плейлист загружен!'));

        renderChannels(channels);

        setTimeout(() => {
            const firstChannel = document.querySelector('.channel-card');
            if (firstChannel) firstChannel.focus();
            navigationState = 'channels';
        }, 100);

    } catch (err) {
        console.error('Ошибка загрузки по URL:', err);
        showToast(translateText('Не удалось загрузить плейлист'));
    } finally {
        initialLoader.style.display = 'none';
    }
}

// 👇 Отображаем кастомное подменю для "Свой плейлист"
function renderCustomPlaylistSubmenu() {
    subCategoriesPanel.innerHTML = '';
    subCategoriesPanel.style.display = 'flex';

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.gap = '10px';
    wrapper.style.alignItems = 'center';
    wrapper.style.padding = '0 10px';

    const input = document.createElement('input');
    input.id = 'playlistURL';
    input.type = 'text';
    input.placeholder = 'https://example.com/playlist.m3u';
    input.style.padding = '8px 12px';
    input.style.borderRadius = '6px';
    input.style.border = '1px solid #444';
    input.style.background = '#222';
    input.style.color = 'white';
    input.style.fontSize = '13px';
    input.setAttribute('tabindex', '0');

    const button = document.createElement('button');
    button.textContent = translateText('Загрузить плейлист');
    button.style.padding = '8px 16px';
    button.style.borderRadius = '6px';
    button.style.border = 'none';
    button.style.background = 'linear-gradient(90deg, #ff375f, #ff5e41)';
    button.style.color = 'white';
    button.style.cursor = 'pointer';
    button.style.fontSize = '13px';
    button.setAttribute('tabindex', '0');

    button.addEventListener('click', loadPlaylistFromURL);
    button.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
    });

    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            loadPlaylistFromURL();
        }
    });

    wrapper.appendChild(input);
    wrapper.appendChild(button);
    subCategoriesPanel.appendChild(wrapper);

    setTimeout(() => {
        input.focus();
        navigationState = 'customInput';
    }, 100);
}

// 👇 Установка языка
function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('appLanguage', lang);

    const flags = mainCategoriesPanel.querySelectorAll('.category-btn');
    flags.forEach(flag => {
        if (flag.textContent === '🇷🇺') {
            flag.classList.toggle('active', lang === 'ru');
        } else if (flag.textContent === '🇬🇧') {
            flag.classList.toggle('active', lang === 'en');
        }
    });

    renderMainCategories();
    renderSubCategories();
    loadAndRenderChannels(currentMainCategory, currentSubcategory);

    showToast(translateText(lang === 'ru' ? "Язык изменён на Русский" : "Language changed to English"));
}

// Отображение главных категорий + флаги языка
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
        btn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
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
    ruFlag.style.padding = '8px';
    if (currentLanguage === 'ru') ruFlag.classList.add('active');
    ruFlag.addEventListener('click', () => setLanguage('ru'));
    ruFlag.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setLanguage('ru');
        }
    });
    mainCategoriesPanel.appendChild(ruFlag);

    const enFlag = document.createElement('button');
    enFlag.className = 'category-btn';
    enFlag.textContent = '🇬🇧';
    enFlag.style.minWidth = '40px';
    enFlag.style.padding = '8px';
    if (currentLanguage === 'en') enFlag.classList.add('active');
    enFlag.addEventListener('click', () => setLanguage('en'));
    enFlag.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setLanguage('en');
        }
    });
    mainCategoriesPanel.appendChild(enFlag);
}

// Отображение подкатегорий (или кастомного UI)
function renderSubCategories() {
    if (currentMainCategory === 'Свой плейлист') {
        renderCustomPlaylistSubmenu();
        return;
    }

    subCategoriesPanel.innerHTML = '';
    subCategoriesPanel.style.display = 'none';

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
    if (currentMainCategory === 'Прямо сейчас' && window.watchingNowInterval) {
        clearInterval(window.watchingNowInterval);
        window.watchingNowInterval = null;
        if (document.getElementById('reloadTimer')) {
            document.getElementById('reloadTimer').remove();
        }
    }

    currentMainCategory = categoryName;
    currentMainCategoryIndex = index;
    currentSubcategory = '';
    currentSubCategoryIndex = 0;

    renderSubCategories();

    if (categoryName === 'Свой плейлист') {
        loadAndRenderChannels('Свой плейлист', '');
        navigationState = 'customInput';
    } else if (categoryName === 'Смотрят' || categoryName === 'Прямо сейчас') {
        loadAndRenderChannels(categoryName, '');
    } else if (!categoryTree[categoryName] || Object.keys(categoryTree[categoryName]).length === 0) {
        loadAndRenderChannels(currentMainCategory, currentSubcategory);
    }

    setTimeout(() => {
        const buttons = mainCategoriesPanel.querySelectorAll('.category-btn');
        if (buttons[index]) buttons[index].focus();
    }, 100);
}

// Выбор подкатегории
function selectSubcategory(subcategoryName, index) {
    if (currentMainCategory === 'Прямо сейчас' && window.watchingNowInterval) {
        clearInterval(window.watchingNowInterval);
        window.watchingNowInterval = null;
        if (document.getElementById('reloadTimer')) {
            document.getElementById('reloadTimer').remove();
        }
    }

    currentSubcategory = subcategoryName;
    currentSubCategoryIndex = index;
    loadAndRenderChannels(currentMainCategory, currentSubcategory);

    setTimeout(() => {
        const firstChannel = document.querySelector('.channel-card');
        if (firstChannel) firstChannel.focus();
        navigationState = 'channels';
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
    if (mainCategory === 'Просмотренные') {
        initialLoader.style.display = 'none';
        let watched;
        try {
            const raw = localStorage.getItem('watchedChannels');
            watched = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(watched)) {
                watched = [];
                localStorage.setItem('watchedChannels', '[]');
            }
        } catch (e) {
            watched = [];
            localStorage.setItem('watchedChannels', '[]');
        }
        renderChannels(watched);
        return;
    }

    // 👇 Прямо сейчас
    if (mainCategory === 'Прямо сейчас') {
        initialLoader.style.display = 'none';
        channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Загрузка...")}</div>`;

        const loadWatchingNow = async () => {
            try {
                const snapshot = await database.ref('watching').get();
                let watchingNow = [];

                if (snapshot.exists()) {
                    const now = Date.now();
                    watchingNow = Object.values(snapshot.val()).filter(channel => {
                        return (now - channel.lastWatched) < 600000; // 10 минут
                    });
                    watchingNow.sort((a, b) => b.lastWatched - a.lastWatched);
                }

                renderChannels(watchingNow);

                if (watchingNow.length === 0) {
                    channelsContainer.innerHTML = `
                        <div style="color:#aaa; padding:60px 20px; text-align:center; font-size:16px;">
                            <i class="fas fa-bolt" style="font-size:48px; margin-bottom:20px;"></i><br>
                            ${translateText("Прямо сейчас никто не смотрит...")}<br>
                            ${translateText("Включите канал — и станьте первым!")}
                        </div>`;
                }

            } catch (error) {
                console.error("❌ Ошибка загрузки 'Прямо сейчас':", error);
                channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Ошибка загрузки")}</div>`;
            }
        };

        await loadWatchingNow();

        if (window.watchingNowInterval) {
            clearInterval(window.watchingNowInterval);
        }

        window.watchingNowInterval = setInterval(loadWatchingNow, 10000);

        return;
    }

    // 👇 Смотрят
    if (mainCategory === 'Смотрят') {
        initialLoader.style.display = 'flex';
        channelsContainer.innerHTML = '';

        try {
            const snapshot = await database.ref('watching').get();
            let watching = [];

            if (snapshot.exists()) {
                watching = Object.values(snapshot.val()).filter(channel => {
                    return (Date.now() - channel.lastWatched) < 24 * 60 * 60 * 1000;
                });
                watching.sort((a, b) => b.views - a.views);
            }

            renderChannels(watching);

            if (watching.length === 0) {
                channelsContainer.innerHTML = `
                    <div style="color:#aaa; padding:60px 20px; text-align:center; font-size:16px;">
                        <i class="fas fa-users" style="font-size:48px; margin-bottom:20px;"></i><br>
                        ${translateText("Пока никто в мире не смотрит...")}<br>
                        ${translateText("Включите канал на 60+ сек — и вы первым появитесь здесь!")}
                    </div>`;
            }

        } catch (error) {
            console.error("❌ Ошибка загрузки из Firebase:", error);
            showToast(translateText("Ошибка загрузки рейтинга"));
            channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Не удалось загрузить")}</div>`;
        } finally {
            initialLoader.style.display = 'none';
        }

        return;
    }

    // 👇 Свой плейлист
    if (mainCategory === 'Свой плейлист') {
        initialLoader.style.display = 'none';
        let customPlaylist;
        try {
            const raw = localStorage.getItem('customPlaylist');
            customPlaylist = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(customPlaylist)) {
                customPlaylist = [];
                localStorage.removeItem('customPlaylist');
            }
        } catch (e) {
            customPlaylist = [];
            localStorage.removeItem('customPlaylist');
        }

        renderChannels(customPlaylist);

        if (customPlaylist.length === 0) {
            channelsContainer.innerHTML = `
                <div style="color:#aaa; padding:60px 20px; text-align:center; font-size:16px;">
                    <i class="fas fa-list" style="font-size:48px; margin-bottom:20px;"></i><br>
                    ${translateText("Плейлист не загружен.")}<br>
                    ${translateText("Перейдите в подменю и выберите «Загрузить по ссылке»")}
                </div>`;
        }

        return;
    }

    // 👇 Остальные категории
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
        showToast(translateText("Ошибка загрузки каналов"));
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

    if (channelsToRender.length === 0 && initialLoader.style.display === 'none') {
        channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Каналы не найдены")}</div>`;
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
            showToast(translateText('Канал не отвечает'));
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
    showToast(translateText('Канал недоступен'));
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
            showToast(translateText('Канал не отвечает'));
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
                showToast(translateText("Нажмите на видео для воспроизведения"));
            });
            setTimeout(() => requestNativeFullscreen(), 1000);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                clearTimeout(timeoutId);
                showToast(translateText('Канал недоступен'));
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
                showToast(translateText("Нажмите на видео для воспроизведения"));
            });
            setTimeout(() => requestNativeFullscreen(), 1000);
        });
        videoPlayerElement.addEventListener('error', () => {
            clearTimeout(timeoutId);
            showToast(translateText('Канал недоступен'));
            addToBlacklist(url);
            playerModal.style.display = 'none';
        });
    } else {
        clearTimeout(timeoutId);
        showToast(translateText('Формат не поддерживается'));
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
            case 'up': {
                nextIndex = (currentIndex - cols + cards.length) % cards.length;
                if (nextIndex >= currentIndex) {
                    if (currentMainCategory === 'Свой плейлист') {
                        const input = document.getElementById('playlistURL');
                        if (input) {
                            input.focus();
                            navigationState = 'customInput';
                            return;
                        }
                    } else {
                        navigationState = 'subCategories';
                        subCategoriesPanel.style.display = 'flex';
                        setTimeout(() => {
                            const buttons = subCategoriesPanel.querySelectorAll('.subcategory-btn');
                            if (buttons.length > 0) {
                                buttons[0].focus();
                                currentSubCategoryIndex = 0;
                            }
                        }, 100);
                        return;
                    }
                }
                break;
            }
        }

        if (nextIndex >= 0 && nextIndex < cards.length) {
            cards[nextIndex].focus();
        }
    } 
    else if (navigationState === 'mainCategories') {
        const buttons = mainCategoriesPanel.querySelectorAll('.category-btn');
        if (buttons.length === 0) return;
        let nextIndex = direction === 'right'
            ? (currentMainCategoryIndex + 1) % buttons.length
            : (currentMainCategoryIndex - 1 + buttons.length) % buttons.length;
        currentMainCategoryIndex = nextIndex;
        currentMainCategory = buttons[nextIndex].textContent;
        updateMainCategoryActive();
        buttons[nextIndex].focus();
    } 
    else if (navigationState === 'subCategories') {
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
    else if (navigationState === 'customInput') {
        const input = document.getElementById('playlistURL');
        const button = subCategoriesPanel.querySelector('button');
        if (!input || !button) return;

        if (direction === 'right') {
            button.focus();
        } else if (direction === 'left') {
            input.focus();
        } else if (direction === 'down') {
            const firstChannel = document.querySelector('.channel-card');
            if (firstChannel) {
                firstChannel.focus();
                navigationState = 'channels';
            }
        } else if (direction === 'up') {
            navigationState = 'mainCategories';
            mainCategoriesPanel.style.display = 'flex';
            setTimeout(() => {
                const buttons = mainCategoriesPanel.querySelectorAll('.category-btn');
                if (buttons[currentMainCategoryIndex]) {
                    buttons[currentMainCategoryIndex].focus();
                }
            }, 100);
        }
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
            if (navigationState === 'channels') {
                if (currentMainCategory === 'Свой плейлист') {
                    const input = document.getElementById('playlistURL');
                    if (input) {
                        input.focus();
                        navigationState = 'customInput';
                    }
                } else {
                    navigationState = 'subCategories';
                    subCategoriesPanel.style.display = 'flex';
                    setTimeout(() => {
                        const buttons = subCategoriesPanel.querySelectorAll('.subcategory-btn');
                        if (buttons.length > 0) {
                            buttons[0].focus();
                            currentSubCategoryIndex = 0;
                        }
                    }, 100);
                }
            } else if (navigationState === 'subCategories' || navigationState === 'customInput') {
                navigationState = 'mainCategories';
                mainCategoriesPanel.style.display = 'flex';
                setTimeout(() => {
                    const buttons = mainCategoriesPanel.querySelectorAll('.category-btn');
                    if (buttons[currentMainCategoryIndex]) {
                        buttons[currentMainCategoryIndex].focus();
                    }
                }, 100);
            }
            break;
        case 'ArrowDown':
            if (navigationState === 'mainCategories') {
                if (currentMainCategory === 'Свой плейлист') {
                    const input = document.getElementById('playlistURL');
                    if (input) {
                        input.focus();
                        navigationState = 'customInput';
                    }
                } else {
                    navigationState = 'subCategories';
                    subCategoriesPanel.style.display = 'flex';
                    setTimeout(() => {
                        const buttons = subCategoriesPanel.querySelectorAll('.subcategory-btn');
                        if (buttons.length > 0) {
                            buttons[0].focus();
                            currentSubCategoryIndex = 0;
                        }
                    }, 100);
                }
            } else if (navigationState === 'subCategories' || navigationState === 'customInput') {
                navigationState = 'channels';
                setTimeout(() => {
                    const firstChannel = document.querySelector('.channel-card');
                    if (firstChannel) firstChannel.focus();
                }, 100);
            }
            break;
        case 'Enter':
            if (navigationState === 'mainCategories') {
                if (currentMainCategory === 'Свой плейлист') {
                    const input = document.getElementById('playlistURL');
                    if (input) {
                        input.focus();
                        navigationState = 'customInput';
                    }
                } else {
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
                }
            } else if (navigationState === 'subCategories') {
                const buttons = subCategoriesPanel.querySelectorAll('.subcategory-btn');
                if (buttons[currentSubCategoryIndex]) {
                    selectSubcategory(buttons[currentSubCategoryIndex].textContent, currentSubCategoryIndex);
                }
            } else if (navigationState === 'customInput') {
                const active = document.activeElement;
                if (active.id === 'playlistURL') {
                    loadPlaylistFromURL();
                } else if (active.tagName === 'BUTTON') {
                    active.click();
                }
            } else if (navigationState === 'channels' && document.activeElement.classList.contains('channel-card')) {
                const card = document.activeElement;
                const index = parseInt(card.dataset.index);
                let list;
                if (currentMainCategory === 'Просмотренные') {
                    list = JSON.parse(localStorage.getItem('watchedChannels') || '[]');
                } else if (currentMainCategory === 'Смотрят' || currentMainCategory === 'Прямо сейчас') {
                    const cards = document.querySelectorAll('.channel-card');
                    if (index >= 0 && index < cards.length) {
                        const channel = {
                            name: cards[index].querySelector('h3').textContent.replace(/ 👥 \d+.*$/, ''),
                            url: cards[index].dataset.url || '',
                            group: cards[index].querySelector('p').textContent,
                            logo: ''
                        };
                        openFullScreenPlayer(channel.name, channel.url, channel.group, channel.logo);
                        return;
                    }
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
            if (navigationState === 'subCategories' || navigationState === 'customInput') {
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

// Инициализация приложения
function initApp() {
    currentLanguage = localStorage.getItem('appLanguage') || 'ru';

    const safetyTimeout = setTimeout(() => {
        initialLoader.style.display = 'none';
        showToast(translateText("Ошибка инициализации"));
    }, 10000);

    try {
        currentMainCategory = 'Просмотренные';
        renderMainCategories();
        renderSubCategories();
        loadAndRenderChannels(currentMainCategory, currentSubcategory);

        // 👇 Очистка старых записей в Firebase раз в 24 часа
        const lastCleanup = localStorage.getItem('lastFirebaseCleanup');
        const now = Date.now();
        if (!lastCleanup || now - parseInt(lastCleanup) > 24 * 60 * 60 * 1000) {
            database.ref('watching').once('value', async (snapshot) => {
                if (snapshot.exists()) {
                    const updates = {};
                    const data = snapshot.val();
                    let deleted = 0;
                    for (let key in data) {
                        if (now - data[key].lastWatched > 24 * 60 * 60 * 1000) {
                            updates[key] = null;
                            deleted++;
                        }
                    }
                    if (Object.keys(updates).length > 0) {
                        await database.ref('watching').update(updates);
                        console.log(`🧹 Удалено ${deleted} устаревших записей из "Смотрят"`);
                    }
                }
            });
            localStorage.setItem('lastFirebaseCleanup', now.toString());
        }

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

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});
