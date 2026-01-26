// ============================================
// World TV - Полный скрипт со всеми функциями
// ============================================

// DOM элементы
const channelsContainer = document.getElementById('channelsContainer');
const mainCategoriesPanel = document.getElementById('mainCategoriesPanel');
const subCategoriesPanel = document.getElementById('subCategoriesPanel');
const playerModal = document.getElementById('playerModal');
const videoPlayerElement = document.getElementById('videoPlayerElement');
const closeModal = document.getElementById('closeModal');
const initialLoader = document.getElementById('initialLoader');
const toastContainer = document.getElementById('toastContainer');

// 👇 Элементы для шаринга
let shareModal = null;
let shareCloseBtn = null;
let currentShareData = null;

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
        "Каналы не найдены": "Каналы не найдены"
    },
 en: {
  // === Системные и UI-сообщения (уже были) ===
  "Проверять каналы": "Check Channels",
  "Просмотренные": "Watched",
  "Прямо сейчас": "Watching Now",
  "Популярные": "Popular",
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
  "Каналы не найдены": "Channels not found",

  // === Категории ===
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
  "Не определено": "Undefined",
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
  "XXX": "Adult",

  // === Страны ===
  "Австралия": "Australia",
  "Австрия": "Austria",
  "Азербайджан": "Azerbaijan",
  "Албания": "Albania",
  "Алжир": "Algeria",
  "Ангола": "Angola",
  "Андорра": "Andorra",
  "Аргентина": "Argentina",
  "Армения": "Armenia",
  "Афганистан": "Afghanistan",
  "Багамы": "Bahamas",
  "Бангладеш": "Bangladesh",
  "Барбадос": "Barbados",
  "Бахрейн": "Bahrain",
  "Беларусь": "Belarus",
  "Бенин": "Benin",
  "Бермуды": "Bermuda",
  "Болгария": "Bulgaria",
  "Боливия": "Bolivia",
  "Бонайре": "Bonaire",
  "Босния и Герцеговина": "Bosnia and Herzegovina",
  "Бразилия": "Brazil",
  "Британские Виргинские острова": "British Virgin Islands",
  "Бруней": "Brunei",
  "Буркина-Фасо": "Burkina Faso",
  "Бутан": "Bhutan",
  "Ватикан": "Vatican",
  "Великобритания": "United Kingdom",
  "Венгрия": "Hungary",
  "Венесуэла": "Venezuela",
  "Вьетнам": "Vietnam",
  "Гаити": "Haiti",
  "Гайана": "Guyana",
  "Гамбия": "Gambia",
  "Гана": "Ghana",
  "Гваделупа": "Guadeloupe",
  "Гватемала": "Guatemala",
  "Гвинея": "Guinea",
  "Гернси": "Guernsey",
  "Германия": "Germany",
  "Гондурас": "Honduras",
  "Гонконг": "Hong Kong",
  "Греция": "Greece",
  "Грузия": "Georgia",
  "Гуам": "Guam",
  "Дания": "Denmark",
  "Демократическая Республика Конго": "Democratic Republic of the Congo",
  "Джибути": "Djibouti",
  "Доминиканская Республика": "Dominican Republic",
  "Египет": "Egypt",
  "Западная Сахара": "Western Sahara",
  "Зимбабве": "Zimbabwe",
  "Израиль": "Israel",
  "Индия": "India",
  "Индонезия": "Indonesia",
  "Иордания": "Jordan",
  "Ирак": "Iraq",
  "Иран": "Iran",
  "Ирландия": "Ireland",
  "Исландия": "Iceland",
  "Испания": "Spain",
  "Италия": "Italy",
  "Йемен": "Yemen",
  "Кабо-Верде": "Cape Verde",
  "Казахстан": "Kazakhstan",
  "Камбоджа": "Cambodia",
  "Камерун": "Cameroon",
  "Канада": "Canada",
  "Катар": "Qatar",
  "Кения": "Kenya",
  "Кипр": "Cyprus",
  "Киргизия": "Kyrgyzstan",
  "Китай": "China",
  "Колумбия": "Colombia",
  "Коморы": "Comoros",
  "Конго": "Congo",
  "Косово": "Kosovo",
  "Коста-Рика": "Costa Rica",
  "Кот-д'Ивуар": "Ivory Coast",
  "Куба": "Cuba",
  "Кувейт": "Kuwait",
  "Кюрасао": "Curaçao",
  "Лаос": "Laos",
  "Латвия": "Latvia",
  "Лесото": "Lesotho",
  "Ливан": "Lebanon",
  "Ливия": "Libya",
  "Литва": "Lithuania",
  "Лихтенштейн": "Liechtenstein",
  "Люксембург": "Luxembourg",
  "Маврикий": "Mauritius",
  "Мавритания": "Mauritania",
  "Мадагаскар": "Madagascar",
  "Макао": "Macao",
  "Малави": "Malawi",
  "Малайзия": "Malaysia",
  "Мали": "Mali",
  "Мальдивы": "Maldives",
  "Мальта": "Malta",
  "Марокко": "Morocco",
  "Мартиника": "Martinique",
  "Мексика": "Mexico",
  "Мозамбик": "Mozambique",
  "Молдова": "Moldova",
  "Монако": "Monaco",
  "Монголия": "Mongolia",
  "Мьянма": "Myanmar",
  "Намибия": "Namibia",
  "Непал": "Nepal",
  "Нигер": "Niger",
  "Нигерия": "Nigeria",
  "Нидерланды": "Netherlands",
  "Никарагуа": "Nicaragua",
  "Новая Зеландия": "New Zealand",
  "Норвегия": "Norway",
  "ОАЭ": "UAE",
  "Оман": "Oman",
  "Пакистан": "Pakistan",
  "Палестина": "Palestine",
  "Панама": "Panama",
  "Папуа — Новая Гвинея": "Papua New Guinea",
  "Парагвай": "Paraguay",
  "Перу": "Peru",
  "Польша": "Poland",
  "Португалия": "Portugal",
  "Пуэрто-Рико": "Puerto Rico",
  "Реюньон": "Réunion",
  "Россия": "Russia",
  "Руанда": "Rwanda",
  "Румыния": "Romania",
  "Сальвадор": "El Salvador",
  "Самоа": "Samoa",
  "Сан-Марино": "San Marino",
  "Саудовская Аравия": "Saudi Arabia",
  "Северная Корея": "North Korea",
  "Северная Македония": "North Macedonia",
  "Сенегал": "Senegal",
  "Сент-Китс и Невис": "Saint Kitts and Nevis",
  "Сент-Люсия": "Saint Lucia",
  "Сербия": "Serbia",
  "Сингапур": "Singapore",
  "Синт-Мартен": "Sint Maarten",
  "Сирия": "Syria",
  "Словакия": "Slovakia",
  "Словения": "Slovenia",
  "Сомали": "Somalia",
  "Судан": "Sudan",
  "Суринам": "Suriname",
  "США": "USA",
  "Таджикистан": "Tajikistan",
  "Таиланд": "Thailand",
  "Тайвань": "Taiwan",
  "Танзания": "Tanzania",
  "Того": "Togo",
  "Тонга": "Tonga",
  "Тринидад и Тобаго": "Trinidad and Tobago",
  "Тунис": "Tunisia",
  "Туркменистан": "Turkmenistan",
  "Турция": "Turkey",
  "Уганда": "Uganda",
  "Узбекистан": "Uzbekistan",
  "Украина": "Ukraine",
  "Уругвай": "Uruguay",
  "Фарерские острова": "Faroe Islands",
  "Фиджи": "Fiji",
  "Филиппины": "Philippines",
  "Финляндия": "Finland",
  "Франция": "France",
  "Французская Полинезия": "French Polynesia",
  "Хорватия": "Croatia",
  "Чад": "Chad",
  "Черногория": "Montenegro",
  "Чехия": "Czechia",
  "Чили": "Chile",
  "Швейцария": "Switzerland",
  "Швеция": "Sweden",
  "Шри-Ланка": "Sri Lanka",
  "Эквадор": "Ecuador",
  "Экваториальная Гвинея": "Equatorial Guinea",
  "Эритрея": "Eritrea",
  "Эстония": "Estonia",
  "Эфиопия": "Ethiopia",
  "Южная Африка": "South Africa",
  "Южная Корея": "South Korea",
  "Ямайка": "Jamaica",
  "Япония": "Japan",
  "Американские Виргинские острова": "US Virgin Islands",
  "Международные": "International",

  // === Языки ===
  "Албанский": "Albanian",
  "Амхарский": "Amharic",
  "Арабский": "Arabic",
  "Армянский": "Armenian",
  "Ассамский": "Assamese",
  "Африкаанс": "Afrikaans",
  "Азербайджанский": "Azerbaijani",
  "Баскский": "Basque",
  "Белорусский": "Belarusian",
  "Бенгальский": "Bengali",
  "Болгарский": "Bulgarian",
  "Боснийский": "Bosnian",
  "Валлийский": "Welsh",
  "Венгерский": "Hungarian",
  "Вьетнамский": "Vietnamese",
  "Голландский": "Dutch",
  "Греческий": "Greek",
  "Грузинский": "Georgian",
  "Датский": "Danish",
  "Иврит": "Hebrew",
  "Индонезийский": "Indonesian",
  "Ирландский": "Irish",
  "Испанский": "Spanish",
  "Итальянский": "Italian",
  "Казахский": "Kazakh",
  "Китайский": "Chinese",
  "Корейский": "Korean",
  "Латышский": "Latvian",
  "Литовский": "Lithuanian",
  "Македонский": "Macedonian",
  "Малайский": "Malay",
  "Немецкий": "German",
  "Непальский": "Nepali",
  "Норвежский": "Norwegian",
  "Персидский": "Persian",
  "Польский": "Polish",
  "Португальский": "Portuguese",
  "Румынский": "Romanian",
  "Русский": "Russian",
  "Сербский": "Serbian",
  "Словацкий": "Slovak",
  "Словенский": "Slovenian",
  "Тайский": "Thai",
  "Тамильский": "Tamil",
  "Турецкий": "Turkish",
  "Узбекский": "Uzbek",
  "Украинский": "Ukrainian",
  "Урду": "Urdu",
  "Финский": "Finnish",
  "Французский": "French",
  "Хинди": "Hindi",
  "Хорватский": "Croatian",
  "Чешский": "Czech",
  "Шведский": "Swedish",
  "Эстонский": "Estonian",
  "Японский": "Japanese",
  "Яванский": "Javanese",
  "Не определено": "Undefined",

  // === Регионы ===
  "Азия": "Asia",
  "Азиатско-Тихоокеанский регион": "Asia-Pacific",
  "Америка": "Americas",
  "Арабский мир": "Arab World",
  "АСЕАН": "ASEAN",
  "Африка": "Africa",
  "Африка к югу от Сахары": "Sub-Saharan Africa",
  "Балканы": "Balkans",
  "Бенилюкс": "Benelux",
  "Ближний Восток": "Middle East",
  "Ближний Восток и Северная Африка": "MENA",
  "Восточная Азия": "East Asia",
  "Восточная Африка": "East Africa",
  "Всемирный": "Worldwide",
  "Европа": "Europe",
  "Европа, Ближний Восток и Африка": "EMEA",
  "Европейский союз": "European Union",
  "Западная Азия": "West Asia",
  "Западная Африка": "West Africa",
  "Западная Европа": "Western Europe",
  "Карибы": "Caribbean",
  "Центральная Азия": "Central Asia",
  "Центральная Америка": "Central America",
  "Центральная Европа": "Central Europe",
  "Центральная и Восточная Европа": "Central and Eastern Europe",
  "Испаноязычная Америка": "Hispanic America",
  "Латинская Америка": "Latin America",
  "Латинская Америка и Карибы": "Latin America and Caribbean",
  "Магриб": "Maghreb",
  "Океания": "Oceania",
  "Организация Объединённых Наций": "United Nations",
  "Северная Америка": "North America",
  "Северная Европа": "Northern Europe",
  "Страны Северной Европы": "Nordic Countries",
  "Совет сотрудничества арабских государств Персидского залива": "GCC",
  "СНГ": "CIS",
  "Южная Азия": "South Asia",
  "Южная Америка": "South America",
  "Южная Африка": "Southern Africa",
  "Южная Европа": "Southern Europe",
  "Юго-Восточная Азия": "Southeast Asia"
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

// 👇 Просмотренные
let currentWatchedChannel = null;
let watchStartTime = null;

// 👇 Для "Популярные"
let watchingBySubcategory = null;

// 👇 Для "Случайный канал"
let cachedGlobalPlaylist = null;

// 👇 Интервалы
let watchingNowInterval = null;
let watchingNowTimerInterval = null;

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

// ============================================
// ФУНКЦИОНАЛ ШАРИНГА КАНАЛОВ
// ============================================

// Инициализация модального окна шаринга
function initShareModal() {
    shareModal = document.getElementById('shareModal');
    shareCloseBtn = document.getElementById('shareCloseBtn');
    
    if (!shareModal || !shareCloseBtn) return;
    
    shareCloseBtn.addEventListener('click', () => {
        shareModal.style.display = 'none';
        currentShareData = null;
    });
    
    shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            shareModal.style.display = 'none';
            currentShareData = null;
        }
    });
    
    const socialButtons = shareModal.querySelectorAll('[data-platform]');
    socialButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const platform = btn.getAttribute('data-platform');
            shareChannel(platform);
        });
    });
    
    document.addEventListener('keydown', (e) => {
        if (shareModal.style.display === 'flex' && e.key === 'Escape') {
            shareModal.style.display = 'none';
            currentShareData = null;
        }
    });
}

function openShareModal(channel) {
    if (!shareModal) return;
    
    currentShareData = {
        name: channel.name,
        url: channel.url,
        group: channel.group,
        logo: channel.logo || '',
        pageUrl: window.location.href.split('?')[0]
    };
    
    const channelInfo = document.getElementById('shareChannelInfo');
    if (channelInfo) {
        channelInfo.innerHTML = `
            <strong>${channel.name}</strong>
            ${channel.group ? `<div>Категория: ${channel.group}</div>` : ''}
            <div style="margin-top: 5px; font-size: 12px; color: #888;">
                ${translateText('Поделиться каналом')}
            </div>
        `;
    }
    
    const messageInput = document.getElementById('shareCustomMessage');
    if (messageInput) {
        messageInput.value = '';
        messageInput.placeholder = translateText('Добавьте своё сообщение (необязательно)...');
    }
    
    shareModal.style.display = 'flex';
    
    setTimeout(() => {
        if (messageInput) messageInput.focus();
    }, 100);
}

function generateShareText(platform, channelData, customMessage = '') {
    const channelName = channelData.name;
    const channelGroup = channelData.group ? ` (${channelData.group})` : '';
    const pageUrl = channelData.pageUrl;
    
    let baseMessage = `Смотрите ${channelName}${channelGroup} на World TV!`;
    
    if (customMessage.trim()) {
        baseMessage = `${customMessage}\n\n${baseMessage}`;
    }
    
    switch(platform) {
        case 'twitter':
            const maxLength = 280 - pageUrl.length - 5;
            if (baseMessage.length > maxLength) {
                baseMessage = baseMessage.substring(0, maxLength - 3) + '...';
            }
            return `${baseMessage} ${pageUrl}`;
            
        case 'whatsapp':
            return `${baseMessage}\n\n${pageUrl}`;
            
        case 'telegram':
        case 'vk':
        case 'facebook':
        case 'reddit':
        case 'linkedin':
        case 'pinterest':
            return `${baseMessage}\n\nСсылка: ${pageUrl}`;
            
        case 'copy':
        default:
            return `${baseMessage}\n\nСсылка на канал: ${pageUrl}`;
    }
}

function generateShareUrl(platform, text) {
    const encodedText = encodeURIComponent(text);
    
    switch(platform) {
        case 'telegram': return `https://t.me/share/url?url=${encodedText}`;
        case 'whatsapp': return `https://api.whatsapp.com/send?text=${encodedText}`;
        case 'vk': return `https://vk.com/share.php?url=${encodeURIComponent(window.location.href)}&title=${encodedText}`;
        case 'twitter': return `https://twitter.com/intent/tweet?text=${encodedText}`;
        case 'facebook': return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodedText}`;
        case 'reddit': return `https://www.reddit.com/submit?url=${encodeURIComponent(window.location.href)}&title=${encodedText}`;
        case 'linkedin': return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
        case 'pinterest': return `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&description=${encodedText}`;
        default: return '';
    }
}

function shareChannel(platform) {
    if (!currentShareData) return;
    
    const customMessage = document.getElementById('shareCustomMessage')?.value || '';
    const shareText = generateShareText(platform, currentShareData, customMessage);
    
    if (platform === 'copy') {
        navigator.clipboard.writeText(shareText).then(() => {
            showToast(translateText('Ссылка скопирована в буфер обмена!'));
            shareModal.style.display = 'none';
            currentShareData = null;
        }).catch(err => {
            console.error('Ошибка копирования:', err);
            showToast(translateText('Не удалось скопировать ссылку'));
        });
        return;
    }
    
    const shareUrl = generateShareUrl(platform, shareText);
    
    if (shareUrl) {
        const width = 600;
        const height = 500;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        
        window.open(shareUrl, 'shareWindow', `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`);
        
        setTimeout(() => {
            shareModal.style.display = 'none';
            currentShareData = null;
        }, 300);
    } else {
        showToast(translateText('Не удалось создать ссылку для шаринга'));
    }
}

function nativeShare(channel) {
    if (!navigator.share) {
        openShareModal(channel);
        return;
    }
    
    const shareData = {
        title: `World TV: ${channel.name}`,
        text: `Смотрите ${channel.name} на World TV! ${channel.group ? `Категория: ${channel.group}` : ''}`,
        url: window.location.href.split('?')[0]
    };
    
    navigator.share(shareData)
        .then(() => console.log('Успешный шаринг'))
        .catch(error => {
            console.log('Ошибка шаринга:', error);
            openShareModal(channel);
        });
}

// ============================================
// ОСНОВНЫЕ ФУНКЦИИ ИЗ ИСХОДНОГО КОДА
// ============================================

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

// Закрытие модального окна плеера
closeModal.addEventListener('click', function() {
    playerModal.style.display = 'none';
    videoPlayerElement.pause();
    videoPlayerElement.src = '';
    if (videoPlayerElement.hls) {
        videoPlayerElement.hls.destroy();
        delete videoPlayerElement.hls;
    }
    stopAllMiniPlayers();
    
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

// 👇 Просмотренные: Добавление в localStorage
function addToWatched(name, url, group, logo) {
    let watched;
    try {
        const raw = localStorage.getItem('watchedChannels');
        watched = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(watched)) watched = [];
    } catch (e) {
        watched = [];
    }
    
    if (watched.some(item => item.url === url)) return;
    
    watched.push({ name, url, group, logo });
    try {
        localStorage.setItem('watchedChannels', JSON.stringify(watched));
    } catch (e) {
        showToast(translateText('Ошибка сохранения'));
    }
    
    if (currentMainCategory === 'Просмотренные') {
        loadAndRenderChannels('Просмотренные', '');
    }
}

// 👇 Добавление в глобальный "Популярные" (Firebase)
async function addToPopular(name, url, group, logo) {
    try {
        const key = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
        const snapshot = await database.ref('popular/' + key).get();
        let data = snapshot.exists() ? snapshot.val() : {
            name,
            url,
            group,
            logo,
            views: 0,
            createdAt: Date.now()
        };
        data.views = (data.views || 0) + 1;
        data.name = name;
        data.logo = logo;
        await database.ref('popular/' + key).set(data);
    } catch (error) {
        console.error("❌ Ошибка Firebase addToPopular:", error);
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
            throw new Error('Плейлист пуст');
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

// 👇 НОВАЯ ФУНКЦИЯ: Добавление плейлиста в Firebase
async function addToPublicPlaylists(url, name, channelCount) {
    try {
        const key = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
        const now = Date.now();
        const snapshot = await database.ref('publicPlaylists/' + key).get();
        if (snapshot.exists()) {
            showToast(translateText('Плейлист уже существует в коллекции.'));
            return;
        }
        await database.ref('publicPlaylists/' + key).set({
            name: name,
            url: url,
            channelCount: channelCount,
            addedAt: now,
            addedBy: 'anonymous'
        });
        showToast(translateText('Плейлист успешно добавлен в общую коллекцию!'));
    } catch (error) {
        console.error("❌ Ошибка при добавлении плейлиста в коллекцию:", error);
        showToast(translateText('Ошибка при добавлении плейлиста в коллекцию'));
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
    wrapper.style.width = '100%';
    
    const input = document.createElement('input');
    input.id = 'playlistURL';
    input.type = 'text';
    input.placeholder = 'https://example.com/playlist.m3u';
    input.style.flex = '1';
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

// 👇 Подменю для "Просмотренные" с поиском
function renderWatchedSubmenu() {
    subCategoriesPanel.innerHTML = '';
    subCategoriesPanel.style.display = 'flex';
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.gap = '10px';
    wrapper.style.alignItems = 'center';
    wrapper.style.padding = '0 10px';
    wrapper.style.width = '100%';

    const input = document.createElement('input');
    input.id = 'watchedSearchInput';
    input.type = 'text';
    input.placeholder = translateText("Поиск по каналам");
    input.style.flex = '1';
    input.style.padding = '8px 12px';
    input.style.borderRadius = '6px';
    input.style.border = '1px solid #444';
    input.style.background = '#222';
    input.style.color = 'white';
    input.style.fontSize = '13px';
    input.setAttribute('tabindex', '0');

    const button = document.createElement('button');
    button.textContent = '🔍';
    button.style.padding = '8px 12px';
    button.style.borderRadius = '6px';
    button.style.border = 'none';
    button.style.background = 'linear-gradient(90deg, #3a86ff, #4cc9f0)';
    button.style.color = 'white';
    button.style.cursor = 'pointer';
    button.style.fontSize = '13px';
    button.setAttribute('tabindex', '0');

    button.addEventListener('click', performWatchedSearch);
    button.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
    });

    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performWatchedSearch();
        }
    });

    wrapper.appendChild(input);
    wrapper.appendChild(button);
    subCategoriesPanel.appendChild(wrapper);

    setTimeout(() => {
        input.focus();
        navigationState = 'watchedInput';
    }, 100);
}

// 👇 Поиск по просмотренным каналам
async function performWatchedSearch() {
    const input = document.getElementById('watchedSearchInput');
    const query = input.value.trim().toLowerCase();
    if (!query) {
        loadAndRenderChannels('Просмотренные', '');
        return;
    }

    initialLoader.style.display = 'none';
    channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Поиск...")}</div>`;
    
    let allResults = [];
    const seen = new Set();

    const allUrls = [];
    for (const mainCat in categoryTree) {
        const subCatMap = categoryTree[mainCat];
        if (typeof subCatMap === 'object' && subCatMap !== null) {
            for (const url of Object.values(subCatMap)) {
                if (typeof url === 'string' && url.endsWith('.m3u')) {
                    allUrls.push({ url, group: mainCat });
                }
            }
        }
    }

    const updateResults = (newChannels) => {
        const filtered = newChannels.filter(ch => {
            if (seen.has(ch.url)) return false;
            const matches = ch.name.toLowerCase().includes(query) ||
                           (ch.group && ch.group.toLowerCase().includes(query));
            if (matches) seen.add(ch.url);
            return matches;
        });

        if (filtered.length === 0) return;

        allResults.push(...filtered);
        renderChannels(allResults);
    };

    const CONCURRENT_LIMIT = 5;
    for (let i = 0; i < allUrls.length; i += CONCURRENT_LIMIT) {
        const batch = allUrls.slice(i, i + CONCURRENT_LIMIT);
        await Promise.allSettled(
            batch.map(async (item) => {
                if (loadedPlaylists[item.url]) {
                    updateResults(loadedPlaylists[item.url]);
                    return;
                }
                try {
                    const content = await fetchM3U(item.url);
                    const parsed = parseM3UContent(content, item.group);
                    loadedPlaylists[item.url] = parsed;
                    updateResults(parsed);
                } catch (err) {
                    loadedPlaylists[item.url] = [];
                }
            })
        );
    }

    if (allResults.length === 0) {
        channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Каналы не найдены")}</div>`;
    }
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
    showToast(lang === 'ru' ? "Язык изменён на Русский" : "Language changed to English");
}

// 👇 Переключение флага проверки каналов
function toggleChannelCheck() {
    checkChannelsOnLoad = !checkChannelsOnLoad;
    localStorage.setItem('checkChannelsOnLoad', checkChannelsOnLoad);
    const flags = mainCategoriesPanel.querySelectorAll('.category-btn');
    flags.forEach(flag => {
        if (flag.textContent.includes(translateText('Проверять каналы'))) {
            flag.textContent = checkChannelsOnLoad ? '✅ ' + translateText('Проверять каналы') : '🔲 ' + translateText('Проверять каналы');
            flag.classList.toggle('active', checkChannelsOnLoad);
        }
    });
    showToast(checkChannelsOnLoad ? 
        "Проверка каналов включена" : 
        "Проверка каналов отключена"
    );
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
    mainCategoriesPanel.appendChild(ruFlag);
    
    const enFlag = document.createElement('button');
    enFlag.className = 'category-btn';
    enFlag.textContent = '🇬🇧';
    enFlag.style.minWidth = '40px';
    enFlag.style.padding = '8px';
    if (currentLanguage === 'en') enFlag.classList.add('active');
    enFlag.addEventListener('click', () => setLanguage('en'));
    mainCategoriesPanel.appendChild(enFlag);
    
    const spacer2 = document.createElement('div');
    spacer2.style.width = '20px';
    mainCategoriesPanel.appendChild(spacer2);
    
    const checkFlag = document.createElement('button');
    checkFlag.className = 'category-btn';
    checkFlag.textContent = checkChannelsOnLoad ? '✅ ' + translateText('Проверять каналы') : '🔲 ' + translateText('Проверять каналы');
    checkFlag.style.minWidth = '140px';
    checkFlag.style.padding = '8px';
    checkFlag.style.fontSize = '12px';
    if (checkChannelsOnLoad) checkFlag.classList.add('active');
    checkFlag.addEventListener('click', toggleChannelCheck);
    mainCategoriesPanel.appendChild(checkFlag);
}

// Отображение подкатегорий (или кастомного UI)
function renderSubCategories() {
    if (currentMainCategory === 'Свой плейлист') {
        renderCustomPlaylistSubmenu();
        return;
    }
    if (currentMainCategory === 'Просмотренные') {
        renderWatchedSubmenu();
        return;
    }
    if (currentMainCategory === 'Пользовательские плейлисты') {
        subCategoriesPanel.innerHTML = '';
        subCategoriesPanel.style.display = 'flex';
        subCategoriesPanel.innerHTML = `<div style="color:#aaa; padding:20px; text-align:center">${translateText("Загрузка списка плейлистов...")}</div>`;
        loadAndRenderPublicPlaylists();
        return;
    }
    if (currentMainCategory === 'Случайный канал') {
        subCategoriesPanel.innerHTML = '';
        subCategoriesPanel.style.display = 'flex';
        const btn = document.createElement('button');
        btn.className = 'subcategory-btn';
        btn.textContent = '🎲 ' + translateText("Еще один!");
        btn.addEventListener('click', () => loadRandomChannel());
        subCategoriesPanel.appendChild(btn);
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
        subCategoriesPanel.appendChild(btn);
    });
    
    if (subcategories.length > 0) {
        subCategoriesPanel.style.display = 'flex';
    }
}

// 👇 Загрузка и отображение списка публичных плейлистов
async function loadAndRenderPublicPlaylists() {
    try {
        const snapshot = await database.ref('publicPlaylists').get();
        let publicPlaylists = [];
        if (snapshot.exists()) {
            publicPlaylists = Object.values(snapshot.val());
            publicPlaylists.sort((a, b) => b.addedAt - a.addedAt);
        }
        subCategoriesPanel.innerHTML = '';
        if (publicPlaylists.length === 0) {
            subCategoriesPanel.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Плейлисты не найдены")}</div>`;
            return;
        }
        publicPlaylists.forEach((playlist, index) => {
            const btn = document.createElement('button');
            btn.className = 'subcategory-btn';
            btn.innerHTML = `<strong>${playlist.name}</strong><br><small>${playlist.channelCount} ${translateText('каналов')}</small>`;
            btn.title = JSON.stringify(playlist);
            btn.style.textAlign = 'left';
            btn.style.justifyContent = 'flex-start';
            btn.style.padding = '12px 16px';
            if (currentSubcategory === playlist.name) {
                btn.classList.add('active');
                currentSubCategoryIndex = index;
            }
            btn.addEventListener('click', () => selectPublicPlaylist(playlist, index));
            subCategoriesPanel.appendChild(btn);
        });
    } catch (error) {
        console.error("❌ Ошибка загрузки публичных плейлистов:", error);
        subCategoriesPanel.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Ошибка загрузки")}</div>`;
    }
}

// 👇 Выбор публичного плейлиста для загрузки
async function selectPublicPlaylist(playlist, index) {
    currentSubcategory = playlist.name;
    currentSubCategoryIndex = index;
    loadAndRenderChannels('Пользовательские плейлисты', playlist.name);
}

// 👇 Загрузка и кэширование плейлиста с опциональной проверкой каналов
async function fetchAndCachePlaylist(url, group) {
    const content = await fetchM3U(url);
    let channels = parseM3UContent(content, group);
    if (!checkChannelsOnLoad || channels.length === 0) {
        loadedPlaylists[url] = channels;
        renderChannels(channels);
        return channels;
    }
    
    initialLoader.style.display = 'flex';
    initialLoader.innerHTML = `
        <div style="text-align:center; color:white;">
            <div>${translateText("Проверка доступности...")}</div>
            <div id="checkProgress" style="margin-top:10px;">0/${channels.length}</div>
        </div>
    `;
    
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
    
    // Проверяем каналы
    for (const channel of channels) {
        try {
            const isAvailable = await checkChannelAvailability(channel.url);
            checkedCount++;
            if (isAvailable) {
                availableChannels.push(channel);
            } else {
                addToBlacklist(channel.url);
            }
            updateDisplay();
        } catch (error) {
            checkedCount++;
            updateDisplay();
        }
    }
    
    initialLoader.style.display = 'none';
    loadedPlaylists[url] = [...availableChannels];
    renderChannels([...availableChannels]);
    return availableChannels;
}

// Выбор главной категории
function selectMainCategory(categoryName, index) {
    if (currentMainCategory === 'Популярные') {
        watchingBySubcategory = null;
    }
    if (currentMainCategory === 'Прямо сейчас' && watchingNowInterval) {
        clearInterval(watchingNowInterval);
        watchingNowInterval = null;
    }
    
    currentMainCategory = categoryName;
    currentMainCategoryIndex = index;
    currentSubcategory = '';
    currentSubCategoryIndex = 0;
    
    renderSubCategories();
    
    if (categoryName === 'Свой плейлист') {
        loadAndRenderChannels('Свой плейлист', '');
        navigationState = 'customInput';
    } else if (categoryName === 'Популярные' || categoryName === 'Прямо сейчас') {
        loadAndRenderChannels(categoryName, '');
    } else if (categoryName === 'Пользовательские плейлисты') {
        // Уже обрабатывается в renderSubCategories
    } else if (categoryName === 'Случайный канал') {
        loadRandomChannel();
    } else if (!categoryTree[categoryName] || Object.keys(categoryTree[categoryName]).length === 0) {
        loadAndRenderChannels(currentMainCategory, currentSubcategory);
    }
    
    setTimeout(() => {
        const buttons = mainCategoriesPanel.querySelectorAll('.category-btn');
        if (buttons[index]) buttons[index].focus();
    }, 100);
}

// 👇 Выбор подкатегории
function selectSubcategory(subcategoryName, index) {
    if (currentMainCategory === 'Прямо сейчас' && watchingNowInterval) {
        clearInterval(watchingNowInterval);
        watchingNowInterval = null;
    }
    
    currentSubcategory = subcategoryName;
    currentSubCategoryIndex = index;
    
    if (currentMainCategory === 'Популярные' && watchingBySubcategory) {
        const channelsToShow = watchingBySubcategory[subcategoryName] || [];
        renderChannels(channelsToShow);
    } else {
        loadAndRenderChannels(currentMainCategory, currentSubcategory);
    }
    
    setTimeout(() => {
        const firstChannel = document.querySelector('.channel-card');
        if (firstChannel) firstChannel.focus();
        navigationState = 'channels';
    }, 100);
}

// Загрузка и отображение каналов
async function loadAndRenderChannels(mainCategory, subcategory) {
    if (mainCategory === 'Прямо сейчас' && watchingNowInterval) {
        clearInterval(watchingNowInterval);
        watchingNowInterval = null;
    }
    
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
        if (watchingNowInterval) clearInterval(watchingNowInterval);
        watchingNowInterval = setInterval(loadWatchingNow, 10000);
        return;
    }
    
    if (mainCategory === 'Популярные') {
        initialLoader.style.display = 'flex';
        channelsContainer.innerHTML = '';
        
        try {
            const snapshot = await database.ref('popular').get();
            let popular = [];
            if (snapshot.exists()) {
                popular = Object.values(snapshot.val());
                popular.sort((a, b) => b.views - a.views);
            }
            
            const subcategoryMap = {};
            popular.forEach(channel => {
                const group = channel.group || translateText('Не определено');
                if (!subcategoryMap[group]) {
                    subcategoryMap[group] = [];
                }
                subcategoryMap[group].push(channel);
            });
            
            watchingBySubcategory = subcategoryMap;
            
            if (currentSubcategory) {
                renderChannels(subcategoryMap[currentSubcategory] || []);
            } else {
                renderChannels(popular);
            }
            
            const sortedSubcategories = Object.keys(subcategoryMap).sort();
            subCategoriesPanel.innerHTML = '';
            subCategoriesPanel.style.display = 'none';
            
            sortedSubcategories.forEach((subcat, idx) => {
                const btn = document.createElement('button');
                btn.className = 'subcategory-btn';
                btn.textContent = `${translateText(subcat)} (${subcategoryMap[subcat].length})`;
                if (subcat === currentSubcategory) {
                    btn.classList.add('active');
                    currentSubCategoryIndex = idx;
                }
                btn.addEventListener('click', () => selectSubcategory(subcat, idx));
                subCategoriesPanel.appendChild(btn);
            });
            
            if (sortedSubcategories.length > 0) {
                subCategoriesPanel.style.display = 'flex';
            }
            
            if (popular.length === 0) {
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
            setTimeout(() => {
                const firstChannel = document.querySelector('.channel-card');
                if (firstChannel) firstChannel.focus();
            }, 100);
        }
        return;
    }
    
    if (mainCategory === 'Свой плейлист') {
        initialLoader.style.display = 'none';
        let customPlaylist;
        try {
            const raw = localStorage.getItem('customPlaylist');
            customPlaylist = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(customPlaylist)) customPlaylist = [];
        } catch (e) {
            customPlaylist = [];
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
    
    if (mainCategory === 'Пользовательские плейлисты') {
        initialLoader.style.display = 'flex';
        channelsContainer.innerHTML = '';
        
        try {
            const snapshot = await database.ref('publicPlaylists').get();
            if (snapshot.exists()) {
                const playlistData = Object.values(snapshot.val()).find(pl => pl.name === subcategory);
                if (playlistData) {
                    const url = playlistData.url;
                    if (!loadedPlaylists[url]) {
                        await fetchAndCachePlaylist(url, playlistData.name);
                    }
                    const channels = loadedPlaylists[url] || [];
                    renderChannels(channels);
                    return;
                }
            }
            throw new Error('Плейлист не найден');
        } catch (error) {
            console.error("❌ Ошибка загрузки публичного плейлиста:", error);
            showToast(translateText("Не удалось загрузить плейлист"));
            channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Плейлист не найден")}</div>`;
        } finally {
            initialLoader.style.display = 'none';
            setTimeout(() => {
                const firstChannel = document.querySelector('.channel-card');
                if (firstChannel) firstChannel.focus();
            }, 100);
        }
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

// 👇 Загрузка и проверка случайных каналов (до 12 шт.)
async function loadRandomChannel() {
    initialLoader.style.display = 'flex';
    channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Загрузка...")}</div>`;
    
    const MAX_ATTEMPTS = 12;
    const TARGET_COUNT = 6;
    const TIMEOUT_MS = 12000;
    const startTime = Date.now();
    
    try {
        if (!cachedGlobalPlaylist) {
            const content = await fetchM3U('https://iptv-org.github.io/iptv/index.m3u');
            cachedGlobalPlaylist = parseM3UContent(content, translateText('Международные'));
        }
        
        if (cachedGlobalPlaylist.length === 0) {
            throw new Error('Плейлист пуст');
        }
        
        const blacklist = JSON.parse(localStorage.getItem('blacklist') || '[]');
        let candidates = cachedGlobalPlaylist.filter(ch => !blacklist.includes(ch.url));
        
        if (candidates.length === 0) {
            throw new Error('Все каналы в чёрном списке');
        }
        
        candidates.sort(() => 0.5 - Math.random());
        const validChannels = [];
        let checked = 0;
        
        for (const ch of candidates) {
            if (
                validChannels.length >= TARGET_COUNT ||
                checked >= MAX_ATTEMPTS ||
                Date.now() - startTime > TIMEOUT_MS
            ) {
                break;
            }
            checked++;
            try {
                const isOk = await checkChannelAvailability(ch.url);
                if (isOk) {
                    validChannels.push(ch);
                } else {
                    addToBlacklist(ch.url);
                }
            } catch (e) {
                addToBlacklist(ch.url);
            }
        }
        
        if (validChannels.length === 0) {
            channelsContainer.innerHTML = `
                <div style="color:#aaa; padding:60px 20px; text-align:center; font-size:16px;">
                    <i class="fas fa-dice" style="font-size:48px; margin-bottom:20px;"></i><br>
                    ${translateText("Не удалось найти доступный канал")}<br>
                    ${translateText("Попробуйте позже")}
                </div>`;
        } else {
            renderChannels(validChannels);
        }
    } catch (error) {
        console.error("Ошибка в loadRandomChannel:", error);
        channelsContainer.innerHTML = `
            <div style="color:#aaa; padding:60px 20px; text-align:center; font-size:16px;">
                <i class="fas fa-exclamation-triangle" style="font-size:48px; margin-bottom:20px;"></i><br>
                ${translateText("Не удалось загрузить каналы")}<br>
                ${translateText("Попробуйте позже")}
            </div>`;
    } finally {
        initialLoader.style.display = 'none';
        setTimeout(() => {
            const first = document.querySelector('.channel-card');
            if (first) {
                first.focus();
                navigationState = 'channels';
            }
        }, 100);
    }
}

// 👇 Вспомогательная функция для проверки доступности канала
function checkChannelAvailability(url) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        let manifestLoaded = false;
        let errorOccurred = false;
        
        const timeoutId = setTimeout(() => {
            if (!manifestLoaded && !errorOccurred) {
                cleanup();
                resolve(false);
            }
        }, 5000);
        
        function cleanup() {
            clearTimeout(timeoutId);
            if (video.hlsInstance) {
                video.hlsInstance.destroy();
            }
            video.src = '';
            video.load();
        }
        
        if (Hls.isSupported()) {
            const hlsInstance = new Hls();
            video.hlsInstance = hlsInstance;
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
            });
            video.addEventListener('error', () => {
                errorOccurred = true;
                cleanup();
                resolve(false);
            });
        } else {
            cleanup();
            resolve(false);
        }
        video.play().catch(() => {});
    });
}

// 👇 Добавление/обновление в "Прямо сейчас" (Firebase)
async function updateWatchingNow(name, url, group, logo) {
    try {
        const key = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
        const now = Date.now();
        await database.ref('watching/' + key).set({
            name,
            url,
            group,
            logo,
            lastWatched: now
        });
    } catch (error) {
        console.error("❌ Ошибка Firebase updateWatchingNow:", error);
    }
}

// Загрузка M3U
async function fetchM3U(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
}

// Парсинг M3U с поддержкой tvg-group-title
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
        
        // Мини-плеер
        const miniPlayer = createMiniPlayer(channel.url);
        mediaContainer.appendChild(miniPlayer);
        
        // Кнопка "Поделиться"
        const shareBtn = document.createElement('button');
        shareBtn.className = 'channel-share-btn';
        shareBtn.innerHTML = '<i class="fas fa-share-alt"></i>';
        shareBtn.setAttribute('tabindex', '0');
        shareBtn.setAttribute('aria-label', translateText('Поделиться каналом'));
        shareBtn.title = translateText('Поделиться каналом');
        
        shareBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            nativeShare(channel);
        });
        
        shareBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                nativeShare(channel);
            }
        });
        
        mediaContainer.appendChild(shareBtn);
        
        // Информация о канале
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
        
        // Обработчики событий для мини-плеера
        channelCard.addEventListener('focus', function() {
            if (watchingNowInterval && currentMainCategory !== 'Прямо сейчас') {
                clearInterval(watchingNowInterval);
                watchingNowInterval = null;
            }
            
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
        
        // Клик по каналу
        channelCard.addEventListener('click', () => {
            openFullScreenPlayer(channel.name, channel.url, channel.group, channel.logo);
            updateWatchingNow(channel.name, channel.url, channel.group, channel.logo);
        });
        
        channelCard.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                openFullScreenPlayer(channel.name, channel.url, channel.group, channel.logo);
                updateWatchingNow(channel.name, channel.url, channel.group, channel.logo);
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
            miniPlayer.style.display = 'none';
            icon.style.display = 'block';
        }
    }, 30000);
    
    if (Hls.isSupported()) {
        const hls = new Hls();
        video.hlsInstance = hls;
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            clearTimeout(timeoutId);
            manifestLoaded = true;
            video.play().catch(e => console.log("Autoplay (mini):", e));
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal && data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                networkErrorOccurred = true;
                clearTimeout(timeoutId);
                miniPlayer.style.display = 'none';
                icon.style.display = 'block';
                video.pause();
                if (video.hlsInstance) {
                    video.hlsInstance.destroy();
                    delete video.hlsInstance;
                }
            }
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
            clearTimeout(timeoutId);
            manifestLoaded = true;
            video.play().catch(e => console.log("Autoplay (mini):", e));
        });
        video.addEventListener('error', () => {
            clearTimeout(timeoutId);
            miniPlayer.style.display = 'none';
            icon.style.display = 'block';
            video.pause();
        });
    }
}

// 👇 Остановить все мини-плееры перед открытием полноэкранного
function stopAllMiniPlayers() {
    miniPlayers.forEach((container, url) => {
        const video = container.querySelector('video');
        if (video) {
            video.pause();
            if (video.hlsInstance) {
                video.hlsInstance.destroy();
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
    stopAllMiniPlayers();
    currentWatchedChannel = { name, url, group, logo };
    watchStartTime = Date.now();
    
    playerModal.style.display = 'flex';
    videoPlayerElement.src = '';
    videoPlayerElement.load();
    videoPlayerElement.muted = false;
    
    let manifestLoaded = false;
    const timeoutId = setTimeout(() => {
        if (!manifestLoaded) {
            showToast(translateText('Канал не отвечает'));
            addToBlacklist(url);
            playerModal.style.display = 'none';
        }
    }, 30000);
    
    if (Hls.isSupported()) {
        const hls = new Hls({
            liveDurationInfinity: true,
            enableWorker: true,
            lowLatencyMode: false,
            manifestLoadingTimeOut: 15000,
            levelLoadingTimeOut: 15000,
            fragLoadingTimeOut: 15000,
            fragLoadingMaxRetry: 6,
            levelLoadingMaxRetry: 4,
            manifestLoadingMaxRetry: 3
        });
        videoPlayerElement.hls = hls;
        hls.loadSource(url);
        hls.attachMedia(videoPlayerElement);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            clearTimeout(timeoutId);
            manifestLoaded = true;
            videoPlayerElement.play().catch(e => {
                showToast("Нажмите на видео для воспроизведения");
            });
            setTimeout(() => requestNativeFullscreen(), 1000);
        });
        let errorCount = 0;
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                errorCount++;
                if (errorCount >= 2) {
                    clearTimeout(timeoutId);
                    showToast(translateText('Канал недоступен'));
                    addToBlacklist(url);
                    playerModal.style.display = 'none';
                    if (videoPlayerElement.hls) {
                        videoPlayerElement.hls.destroy();
                        delete videoPlayerElement.hls;
                    }
                } else {
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
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
                showToast("Нажмите на видео для воспроизведения");
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
    if (!group) return 'fa-tv';
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

// Перемещение фокуса (упрощенная версия)
function moveFocus(direction) {
    const cards = document.querySelectorAll('.channel-card');
    if (cards.length === 0) return;
    
    const currentIndex = Array.from(cards).indexOf(document.activeElement);
    let nextIndex = currentIndex;
    
    switch(direction) {
        case 'right': nextIndex = (currentIndex + 1) % cards.length; break;
        case 'left': nextIndex = (currentIndex - 1 + cards.length) % cards.length; break;
        case 'down': nextIndex = Math.min(currentIndex + 3, cards.length - 1); break;
        case 'up': nextIndex = Math.max(currentIndex - 3, 0); break;
    }
    
    if (cards[nextIndex]) cards[nextIndex].focus();
}

// Обработчик клавиш (упрощенная версия)
document.addEventListener('keydown', function(e) {
    if (playerModal.style.display === 'flex') {
        if (e.key === 'Escape') closeModal.click();
        return;
    }
    
    if (shareModal && shareModal.style.display === 'flex') {
        if (e.key === 'Escape') {
            shareModal.style.display = 'none';
            currentShareData = null;
        }
        return;
    }
    
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
        e.preventDefault();
    }
    
    switch(e.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'ArrowUp':
        case 'ArrowDown':
            moveFocus(e.key.replace('Arrow', '').toLowerCase());
            break;
        case 'Enter':
            if (document.activeElement.classList.contains('channel-card')) {
                const card = document.activeElement;
                const index = parseInt(card.dataset.index);
                const cards = document.querySelectorAll('.channel-card');
                if (cards[index]) {
                    const channel = {
                        name: cards[index].querySelector('h3').textContent.replace(/ 👥 \d+.*$/, ''),
                        url: cards[index].dataset.url,
                        group: cards[index].querySelector('p').textContent,
                        logo: ''
                    };
                    openFullScreenPlayer(channel.name, channel.url, channel.group, channel.logo);
                    updateWatchingNow(channel.name, channel.url, channel.group, channel.logo);
                }
            }
            break;
    }
});

// Инициализация приложения
function initApp() {
    try {
        initShareModal();
        initWebShareAPI();
        
        currentMainCategory = 'Просмотренные';
        renderMainCategories();
        renderSubCategories();
        loadAndRenderChannels(currentMainCategory, currentSubcategory);
        
        setTimeout(() => {
            const firstChannel = document.querySelector('.channel-card');
            if (firstChannel) firstChannel.focus();
        }, 500);
        
        initialLoader.style.display = 'none';
    } catch (error) {
        console.error("Ошибка инициализации:", error);
        initialLoader.style.display = 'none';
        showToast(translateText("Ошибка приложения"));
    }
}

// 👇 Очищаем интервал при закрытии вкладки
window.addEventListener('beforeunload', () => {
    if (watchingNowInterval) clearInterval(watchingNowInterval);
    if (watchingNowTimerInterval) clearInterval(watchingNowTimerInterval);
});

// Инициализация горизонтального скролла мышью
function initMouseWheelScroll() {
    const scrollContainers = [mainCategoriesPanel, subCategoriesPanel];
    scrollContainers.forEach(container => {
        if (!container) return;
        container.addEventListener('wheel', function(e) {
            if (e.deltaY === 0) return;
            e.preventDefault();
            this.scrollLeft += e.deltaY;
        }, { passive: false });
    });
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    initMouseWheelScroll();
});

// CSS для шаринга
const shareStyles = `
.channel-share-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.7);
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    font-size: 14px;
    z-index: 10;
    transition: all 0.3s ease;
    opacity: 0.7;
}

.channel-share-btn:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.1);
    opacity: 1;
}

.channel-card:hover .channel-share-btn {
    opacity: 1;
}

.share-modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 1000;
    justify-content: center;
    align-items: center;
}

.share-modal-content {
    background: #1a1a1a;
    border-radius: 12px;
    padding: 24px;
    width: 90%;
    max-width: 400px;
    border: 1px solid #444;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.share-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    color: white;
    font-size: 18px;
}

.share-close-btn {
    background: none;
    border: none;
    color: #aaa;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.share-close-btn:hover {
    color: white;
}

.share-social-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-bottom: 20px;
}

.share-social-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #2a2a2a;
    border: 1px solid #444;
    border-radius: 8px;
    padding: 15px 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: white;
    text-decoration: none;
    border: none;
    font-family: inherit;
}

.share-social-btn:hover {
    transform: translateY(-3px);
    background: #333;
    border-color: #666;
}

.share-social-icon {
    font-size: 24px;
    margin-bottom: 8px;
}

.share-social-name {
    font-size: 12px;
    text-align: center;
}

.share-telegram { color: #0088cc; }
.share-whatsapp { color: #25D366; }
.share-vk { color: #4C75A3; }
.share-twitter { color: #1DA1F2; }
.share-facebook { color: #1877F2; }
.share-reddit { color: #FF4500; }
.share-linkedin { color: #0077B5; }
.share-pinterest { color: #E60023; }
.share-copy { color: #9C27B0; }

.share-custom-message {
    width: 100%;
    padding: 12px;
    border: 1px solid #444;
    border-radius: 6px;
    background: #222;
    color: white;
    font-size: 14px;
    margin-bottom: 15px;
    resize: vertical;
    min-height: 60px;
}

.share-custom-message:focus {
    outline: none;
    border-color: #ff375f;
}

.share-channel-info {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 15px;
    font-size: 13px;
    color: #aaa;
}

.share-channel-info strong {
    color: white;
    display: block;
    margin-bottom: 5px;
}

.mini-player {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000;
}
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = shareStyles;
document.head.appendChild(styleSheet);
