// DOM элементы
const channelsContainer = document.getElementById('channelsContainer');
const mainCategoriesPanel = document.getElementById('mainCategoriesPanel');
const subCategoriesPanel = document.getElementById('subCategoriesPanel');
const playerModal = document.getElementById('playerModal');
const videoPlayerElement = document.getElementById('videoPlayerElement');
const closeModal = document.getElementById('closeModal');
const initialLoader = document.getElementById('initialLoader');
const toastContainer = document.getElementById('toastContainer');

// Firebase: Инициализация
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

// Глобальные переменные
let currentLanguage = localStorage.getItem('appLanguage') || 'ru';
let checkChannelsOnLoad = localStorage.getItem('checkChannelsOnLoad') === 'true';
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
        "Каналы не найдены": "Каналы не найдены",
        "Проверка доступности...": "Проверка доступности...",
        "каналов": "каналов",
        "Не удалось загрузить": "Не удалось загрузить",
        "Плейлист не найден": "Плейлист не найден",
        "Поиск...": "Поиск...",
        "Проверка каналов включена": "Проверка каналов включена",
        "Проверка каналов отключена": "Проверка каналов отключена",
        "Международные": "Международные",
        "Не определено": "Не определено"
    },
 en: {
  // === Системные и UI-сообщения (уже были) ===
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
  "Каналы не найдены": "Channels not found",
  "Проверка доступности...": "Checking availability...",
  "каналов": "channels",
  "Не удалось загрузить": "Failed to load",
  "Плейлист не найден": "Playlist not found",
  "Поиск...": "Searching...",
  "Проверка каналов включена": "Channel checking enabled",
  "Проверка каналов отключена": "Channel checking disabled",
  "Международные": "International",
  "Не определено": "Undefined",

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
let searchTimeout = null;

// 👇 Просмотренные: Новые переменные
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

// Функция перевода
function translateText(key) {
    return translations[currentLanguage][key] || key;
}

// ============= ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =============

function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

function openInExternalPlayerFunc(url, name) {
    try {
        window.open(url, '_blank');
        showToast(`📺 ${translateText("Открыто во внешнем плеере")}: ${name}`);
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                setTimeout(() => showToast(`🔗 ${translateText("Ссылка скопирована! Вставьте в плеер")}`, 2000), 2000);
            });
        }
    } catch (error) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url);
            showToast(translateText("Ссылка скопирована в буфер"));
        }
    }
}

function exportToM3U(channels, filename = 'playlist.m3u') {
    let m3uContent = '#EXTM3U\n';
    channels.forEach(channel => {
        let name = channel.name.replace(/#/g, '');
        let logoAttr = channel.logo ? ` tvg-logo="${channel.logo}"` : '';
        let groupAttr = channel.group ? ` group-title="${channel.group}"` : '';
        m3uContent += `#EXTINF:-1${logoAttr}${groupAttr},${name}\n${channel.url}\n`;
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

function openAllInExternalPlayerFunc(channels) {
    if (!channels || channels.length === 0) {
        showToast(translateText("Нет каналов для открытия"));
        return;
    }
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: #1a1a1a; border-radius: 12px; padding: 20px; z-index: 10000;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3); min-width: 280px; border: 1px solid #444;
    `;
    dialog.innerHTML = `
        <h3 style="margin: 0 0 15px 0; color: white;">${translateText("Открыть все в плейлисте")}</h3>
        <div style="margin-bottom: 15px; color: #ccc;">${channels.length} ${translateText("каналов")}</div>
        <button id="exportM3UBtn" style="width:100%; padding:10px; margin-bottom:10px; background:linear-gradient(90deg,#3a86ff,#4cc9f0); border:none; border-radius:6px; color:white; cursor:pointer;">${translateText("Экспорт M3U плейлиста")}</button>
        <button id="copyAllUrlsBtn" style="width:100%; padding:10px; margin-bottom:10px; background:linear-gradient(90deg,#20bf6b,#26de81); border:none; border-radius:6px; color:white; cursor:pointer;">📋 ${translateText("Копировать все ссылки")}</button>
        <button id="closeDialogBtn" style="width:100%; padding:10px; background:#444; border:none; border-radius:6px; color:white; cursor:pointer;">${translateText("Закрыть")}</button>
    `;
    document.body.appendChild(dialog);
    document.getElementById('exportM3UBtn').onclick = () => { exportToM3U(channels, `${currentMainCategory}_${currentSubcategory || 'all'}.m3u`); dialog.remove(); };
    document.getElementById('copyAllUrlsBtn').onclick = () => {
        navigator.clipboard.writeText(channels.map(ch => ch.url).join('\n')).then(() => {
            showToast(`📋 ${translateText("Ссылки скопированы")} (${channels.length})`);
            dialog.remove();
        }).catch(() => showToast(translateText("Ошибка копирования")));
    };
    document.getElementById('closeDialogBtn').onclick = () => dialog.remove();
    dialog.addEventListener('click', (e) => e.stopPropagation());
    setTimeout(() => {
        document.addEventListener('click', function closeOnClick(e) {
            if (!dialog.contains(e.target)) { dialog.remove(); document.removeEventListener('click', closeOnClick); }
        });
    }, 100);
}

function toggleExternalPlayer() {
    openInExternalPlayer = !openInExternalPlayer;
    localStorage.setItem('openInExternalPlayer', openInExternalPlayer);
    const toggleBtn = document.getElementById('externalPlayerToggle');
    if (toggleBtn) {
        toggleBtn.textContent = openInExternalPlayer ? '📱 ' + translateText('Открыть в стороннем плеере') : '🎬 ' + translateText('Открыть в стороннем плеере');
        toggleBtn.classList.toggle('active', openInExternalPlayer);
    }
    showToast(openInExternalPlayer ? translateText("Сторонний плеер включен") : translateText("Сторонний плеер выключен"));
}

async function addToPopular(name, url, group, logo) {
    try {
        const key = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
        const snapshot = await database.ref('popular/' + key).get();
        let data = snapshot.exists() ? snapshot.val() : { name, url, group, logo, views: 0, createdAt: Date.now() };
        data.views = (data.views || 0) + 1;
        await database.ref('popular/' + key).set(data);
    } catch (error) { console.error("Firebase error:", error); }
}

async function updateWatchingNow(name, url, group, logo) {
    try {
        const key = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
        await database.ref('watching/' + key).set({ name, url, group, logo, lastWatched: Date.now() });
    } catch (error) { console.error("Firebase error:", error); }
}

function addToWatched(name, url, group, logo) {
    let watched;
    try {
        const raw = localStorage.getItem('watchedChannels');
        watched = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(watched)) watched = [];
    } catch (e) { watched = []; }
    if (watched.some(item => item.url === url || item.name === name)) return;
    watched.push({ name, url, group, logo, watchedAt: Date.now() });
    localStorage.setItem('watchedChannels', JSON.stringify(watched));
    if (currentMainCategory === 'Просмотренные') loadAndRenderChannels('Просмотренные', '');
}

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
            let urlLine = lines[i + 1];
            while (urlLine && urlLine.trim() === '') { i++; urlLine = lines[i + 1]; }
            if (urlLine && !urlLine.startsWith('#')) {
                let name = infoLine.split(',')[1] || 'Канал';
                const tvgNameMatch = infoLine.match(/tvg-name="([^"]*)"/);
                if (tvgNameMatch) name = tvgNameMatch[1];
                name = name.trim();
                const logoMatch = infoLine.match(/tvg-logo="([^"]*)"/);
                const logo = logoMatch ? logoMatch[1] : '';
                let group = assignedCategory;
                const groupMatch = infoLine.match(/tvg-group-title="([^"]*)"/);
                if (groupMatch && groupMatch[1]) group = groupMatch[1].trim();
                channels.push({ name, url: urlLine.trim(), group, logo });
            }
        }
    }
    return channels;
}

function checkChannelAvailability(url) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.muted = true;
        let manifestLoaded = false, errorOccurred = false, hlsInstance = null;
        const timeoutId = setTimeout(() => {
            if (!manifestLoaded && !errorOccurred) { cleanup(); resolve(false); }
        }, 5000);
        function cleanup() {
            clearTimeout(timeoutId);
            if (hlsInstance) { try { hlsInstance.destroy(); } catch(e) {} }
            video.pause(); video.src = ''; video.load();
        }
        if (Hls.isSupported()) {
            hlsInstance = new Hls();
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => { manifestLoaded = true; cleanup(); resolve(true); });
            hlsInstance.on(Hls.Events.ERROR, () => { errorOccurred = true; cleanup(); resolve(false); });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.addEventListener('loadedmetadata', () => { manifestLoaded = true; cleanup(); resolve(true); }, { once: true });
            video.addEventListener('error', () => { errorOccurred = true; cleanup(); resolve(false); }, { once: true });
        } else { cleanup(); resolve(false); }
        video.play().catch(() => {});
    });
}

async function fetchAndCachePlaylist(url, group) {
    const content = await fetchM3U(url);
    let channels = parseM3UContent(content, group);
    if (!checkChannelsOnLoad || channels.length === 0) {
        loadedPlaylists[url] = channels;
        renderChannels(channels);
        return channels;
    }
    initialLoader.style.display = 'flex';
    initialLoader.innerHTML = `<div style="text-align:center;color:white;"><div>${translateText("Проверка доступности...")}</div><div id="checkProgress">0/${channels.length}</div></div>`;
    let availableChannels = [], checkedCount = 0;
    const updateDisplay = () => {
        loadedPlaylists[url] = [...availableChannels];
        renderChannels([...availableChannels]);
        const prog = document.getElementById('checkProgress');
        if (prog) prog.textContent = `${checkedCount}/${channels.length}`;
    };
    const CONCURRENT_CHECK = 3;
    for (let i = 0; i < channels.length; i += CONCURRENT_CHECK) {
        const batch = channels.slice(i, i + CONCURRENT_CHECK);
        await Promise.allSettled(batch.map(async (channel) => {
            try {
                const isAvailable = await checkChannelAvailability(channel.url);
                checkedCount++;
                if (isAvailable) { availableChannels.push(channel); updateDisplay(); }
            } catch (error) { checkedCount++; updateDisplay(); }
        }));
    }
    loadedPlaylists[url] = [...availableChannels];
    renderChannels([...availableChannels]);
    initialLoader.style.display = 'none';
    return availableChannels;
}

// ============= ОСНОВНОЙ ПЛЕЕР =============

function openFullScreenPlayer(name, url, group, logo) {
    if (openInExternalPlayer) {
        stopAllMiniPlayers();
        openInExternalPlayerFunc(url, name);
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
    
    if (videoPlayerElement.hls) {
        try { videoPlayerElement.hls.destroy(); } catch(e) {}
        delete videoPlayerElement.hls;
    }
    videoPlayerElement.pause();
    videoPlayerElement.src = '';
    videoPlayerElement.load();
    videoPlayerElement.muted = false;
    
    const oldBtn = document.getElementById('externalPlayerModalBtn');
    if (oldBtn) oldBtn.remove();
    
    const modalContent = document.querySelector('.modal-content');
    const externalBtn = document.createElement('button');
    externalBtn.id = 'externalPlayerModalBtn';
    externalBtn.innerHTML = '📱 ' + translateText("Открыть в плеере");
    externalBtn.style.cssText = `position:absolute; bottom:20px; right:70px; padding:10px 20px; background:linear-gradient(90deg,#ff375f,#ff5e41); border:none; border-radius:8px; color:white; cursor:pointer; font-size:14px; z-index:1001;`;
    externalBtn.onclick = () => openInExternalPlayerFunc(url, name);
    modalContent.appendChild(externalBtn);
    
    let manifestLoaded = false;
    let hlsInstance = null;
    let reconnectAttempts = 0;
    let stallDetectionTimer = null;
    let lastPlayTime = 0;
    let stallCount = 0;
    
    function startStallDetection() {
        if (stallDetectionTimer) clearInterval(stallDetectionTimer);
        stallDetectionTimer = setInterval(() => {
            if (!videoPlayerElement.paused && videoPlayerElement.currentTime === lastPlayTime) {
                stallCount++;
                if (stallCount >= 3 && hlsInstance) {
                    console.log("🔄 Перезапуск потока из-за зависания");
                    try { hlsInstance.stopLoad(); setTimeout(() => hlsInstance.startLoad(), 1000); } catch(e) {}
                    stallCount = 0;
                }
            } else {
                lastPlayTime = videoPlayerElement.currentTime;
                if (stallCount > 0) stallCount--;
            }
        }, 5000);
    }
    
    function stopStallDetection() {
        if (stallDetectionTimer) { clearInterval(stallDetectionTimer); stallDetectionTimer = null; }
    }
    
    function attemptReconnect() {
        if (reconnectAttempts >= 5) {
            showToast(translateText('Канал недоступен'));
            playerModal.style.display = 'none';
            return;
        }
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 10000);
        setTimeout(() => {
            if (playerModal.style.display === 'flex' && hlsInstance) {
                try { hlsInstance.stopLoad(); hlsInstance.loadSource(url); } catch(e) {}
            }
        }, delay);
    }
    
    const timeoutId = setTimeout(() => {
        if (!manifestLoaded) {
            showToast(translateText('Канал не отвечает'));
            playerModal.style.display = 'none';
            stopStallDetection();
            if (hlsInstance) { try { hlsInstance.destroy(); } catch(e) {} }
        }
    }, 20000);
    
    if (Hls.isSupported()) {
        hlsInstance = new Hls({
            liveDurationInfinity: true,
            enableWorker: true,
            lowLatencyMode: false,
            manifestLoadingTimeOut: 10000,
            manifestLoadingMaxRetry: 3,
            levelLoadingTimeOut: 10000,
            levelLoadingMaxRetry: 4,
            fragLoadingTimeOut: 20000,
            fragLoadingMaxRetry: 6,
            startPosition: -1,
            backBufferLength: 30,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            liveSyncDurationCount: 3,
            liveMaxLatencyDurationCount: 6,
            enableWebVTT: false,
            enableCEA708Captions: false
        });
        
        videoPlayerElement.hls = hlsInstance;
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(videoPlayerElement);
        
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
            clearTimeout(timeoutId);
            manifestLoaded = true;
            reconnectAttempts = 0;
            videoPlayerElement.play().then(() => {
                lastPlayTime = videoPlayerElement.currentTime;
                startStallDetection();
            }).catch(() => {
                showToast(translateText("Нажмите на видео для воспроизведения"));
                videoPlayerElement.addEventListener('click', () => videoPlayerElement.play().catch(()=>{}), { once: true });
            });
            setTimeout(() => requestNativeFullscreen(), 1000);
        });
        
        hlsInstance.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                switch(data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        attemptReconnect();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        try { hlsInstance.recoverMediaError(); } catch(e) { attemptReconnect(); }
                        break;
                    default:
                        showToast(translateText('Канал недоступен'));
                        playerModal.style.display = 'none';
                        stopStallDetection();
                        break;
                }
            } else if (data.details === 'fragLoadError' || data.details === 'fragParsingError') {
                setTimeout(() => { if (hlsInstance && playerModal.style.display === 'flex') hlsInstance.startLoad(); }, 2000);
            }
        });
        
        videoPlayerElement.addEventListener('waiting', () => showToast(translateText("Буферизация..."), 1000));
        videoPlayerElement.addEventListener('error', (e) => {
            if (videoPlayerElement.error?.code === 3) attemptReconnect();
        });
        
    } else if (videoPlayerElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoPlayerElement.src = url;
        videoPlayerElement.addEventListener('loadedmetadata', () => {
            clearTimeout(timeoutId);
            manifestLoaded = true;
            videoPlayerElement.play().then(() => {
                lastPlayTime = videoPlayerElement.currentTime;
                startStallDetection();
            }).catch(() => {
                showToast(translateText("Нажмите на видео для воспроизведения"));
                videoPlayerElement.addEventListener('click', () => videoPlayerElement.play().catch(()=>{}), { once: true });
            });
            setTimeout(() => requestNativeFullscreen(), 1000);
        });
        videoPlayerElement.addEventListener('error', () => {
            showToast(translateText('Канал недоступен'));
            playerModal.style.display = 'none';
            stopStallDetection();
        });
        videoPlayerElement.addEventListener('stalled', () => { if (hlsInstance) attemptReconnect(); });
    } else {
        clearTimeout(timeoutId);
        showToast(translateText('Формат не поддерживается'));
        playerModal.style.display = 'none';
    }
    
    const originalCloseHandler = closeModal.onclick;
    closeModal.onclick = () => {
        stopStallDetection();
        if (videoPlayerElement.hls) { try { videoPlayerElement.hls.destroy(); } catch(e) {} delete videoPlayerElement.hls; }
        videoPlayerElement.pause();
        videoPlayerElement.src = '';
        videoPlayerElement.load();
        playerModal.style.display = 'none';
        const btn = document.getElementById('externalPlayerModalBtn');
        if (btn) btn.remove();
        setTimeout(() => { closeModal.onclick = originalCloseHandler; }, 100);
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
    };
}

function requestNativeFullscreen() {
    const elem = videoPlayerElement;
    if (elem.requestFullscreen) elem.requestFullscreen().catch(()=>{});
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen().catch(()=>{});
}

// ============= МИНИ-ПЛЕЕРЫ =============

function createMiniPlayer(url) {
    if (miniPlayers.has(url)) return miniPlayers.get(url);
    const container = document.createElement('div');
    container.className = 'mini-player';
    container.dataset.url = url;
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.style.cssText = 'width:100%; height:100%; background:#000;';
    container.appendChild(video);
    miniPlayers.set(url, container);
    return container;
}

function initializeMiniPlayer(video, url, miniPlayer, icon) {
    video.dataset.initialized = 'true';
    let manifestLoaded = false, networkErrorOccurred = false, hlsInstance = null;
    const timeoutId = setTimeout(() => {
        if (!manifestLoaded && !networkErrorOccurred) {
            if (hlsInstance) { try { hlsInstance.destroy(); } catch(e) {} }
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
            video.play().catch(()=>{});
        });
        hlsInstance.on(Hls.Events.ERROR, () => {
            networkErrorOccurred = true;
            clearTimeout(timeoutId);
            miniPlayer.style.display = 'none';
            icon.style.display = 'block';
            video.pause();
            if (video.hlsInstance) { try { video.hlsInstance.destroy(); } catch(e) {} delete video.hlsInstance; }
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', () => { clearTimeout(timeoutId); manifestLoaded = true; video.play().catch(()=>{}); });
        video.addEventListener('error', () => { clearTimeout(timeoutId); miniPlayer.style.display = 'none'; icon.style.display = 'block'; video.pause(); });
    }
}

function stopAllMiniPlayers() {
    miniPlayers.forEach((container) => {
        const video = container.querySelector('video');
        if (video) {
            video.pause();
            if (video.hlsInstance) { try { video.hlsInstance.destroy(); } catch(e) {} delete video.hlsInstance; }
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
    const g = group.toLowerCase();
    if (g.includes('новости')) return 'fa-newspaper';
    if (g.includes('спорт')) return 'fa-futbol';
    if (g.includes('кино')) return 'fa-film';
    if (g.includes('музыка')) return 'fa-music';
    if (g.includes('детск')) return 'fa-child';
    if (g.includes('документ')) return 'fa-video';
    if (g.includes('развлеч')) return 'fa-theater-masks';
    return 'fa-tv';
}

// ============= ОТРИСОВКА КАНАЛОВ =============

function renderChannels(channelsToRender) {
    channelsContainer.innerHTML = '';
    if (channelsToRender.length === 0) {
        channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Каналы не найдены")}</div>`;
        return;
    }
    channelsToRender.forEach((channel, index) => {
        const groupIcon = getGroupIcon(channel.group);
        const card = document.createElement('div');
        card.className = 'channel-card';
        card.setAttribute('tabindex', '0');
        card.dataset.index = index;
        card.dataset.url = channel.url;
        
        const media = document.createElement('div');
        media.className = 'channel-media';
        if (channel.logo) {
            const img = document.createElement('img');
            img.src = channel.logo;
            img.alt = channel.name;
            img.onerror = () => img.style.display = 'none';
            media.appendChild(img);
        }
        const icon = document.createElement('i');
        icon.className = `fas ${groupIcon}`;
        media.appendChild(icon);
        const miniPlayer = createMiniPlayer(channel.url);
        media.appendChild(miniPlayer);
        
        let viewsText = '';
        if (channel.views) viewsText = ` 👥 ${channel.views}`;
        if (currentMainCategory === 'Прямо сейчас' && channel.lastWatched && Date.now() - channel.lastWatched < 600000) viewsText += ` ⚡`;
        
        const info = document.createElement('div');
        info.className = 'channel-info';
        info.innerHTML = `<h3>${channel.name}${viewsText}</h3><p>${channel.group}</p>`;
        card.appendChild(media);
        card.appendChild(info);
        
        card.addEventListener('focus', () => {
            currentChannelIndex = parseInt(card.dataset.index);
            if (focusTimer) clearTimeout(focusTimer);
            if (currentMiniPlayer && currentMiniPlayer !== miniPlayer) {
                currentMiniPlayer.style.display = 'none';
                const prevIcon = currentMiniPlayer.parentElement?.querySelector('i');
                if (prevIcon) prevIcon.style.display = 'block';
                const prevVideo = currentMiniPlayer.querySelector('video');
                if (prevVideo) prevVideo.pause();
            }
            miniPlayer.style.display = 'block';
            icon.style.display = 'none';
            currentMiniPlayer = miniPlayer;
            focusTimer = setTimeout(() => {
                const video = miniPlayer.querySelector('video');
                if (!video.dataset.initialized) initializeMiniPlayer(video, channel.url, miniPlayer, icon);
                else if (video.paused) video.play().catch(()=>{});
            }, 3000);
        });
        card.addEventListener('blur', () => {
            if (focusTimer) clearTimeout(focusTimer);
            setTimeout(() => {
                if (!card.contains(document.activeElement)) {
                    miniPlayer.style.display = 'none';
                    icon.style.display = 'block';
                    const video = miniPlayer.querySelector('video');
                    if (video) video.pause();
                }
            }, 100);
        });
        card.addEventListener('click', () => openFullScreenPlayer(channel.name, channel.url, channel.group, channel.logo));
        card.addEventListener('keydown', (e) => { if (e.key === 'Enter') openFullScreenPlayer(channel.name, channel.url, channel.group, channel.logo); });
        channelsContainer.appendChild(card);
    });
}

// ============= ЗАГРУЗКА КАНАЛОВ =============

async function loadAndRenderChannels(mainCategory, subcategory) {
    if (mainCategory === 'Просмотренные') {
        initialLoader.style.display = 'none';
        const watched = JSON.parse(localStorage.getItem('watchedChannels') || '[]');
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
                    watchingNow = Object.values(snapshot.val()).filter(ch => (now - ch.lastWatched) < 600000);
                    watchingNow.sort((a, b) => b.lastWatched - a.lastWatched);
                }
                renderChannels(watchingNow);
            } catch(e) { console.error(e); }
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
            let popular = snapshot.exists() ? Object.values(snapshot.val()).sort((a,b) => b.views - a.views) : [];
            renderChannels(popular);
        } catch(e) { console.error(e); }
        finally { initialLoader.style.display = 'none'; }
        return;
    }
    if (mainCategory === 'Свой плейлист') {
        initialLoader.style.display = 'none';
        const custom = JSON.parse(localStorage.getItem('customPlaylist') || '[]');
        renderChannels(custom);
        return;
    }
    if (mainCategory === 'Случайный канал') {
        loadRandomChannel();
        return;
    }
    if (!categoryTree[mainCategory]?.[subcategory]) { renderChannels([]); return; }
    
    const url = categoryTree[mainCategory][subcategory];
    initialLoader.style.display = 'flex';
    try {
        const channels = loadedPlaylists[url] || await fetchAndCachePlaylist(url, subcategory);
        renderChannels(channels);
    } catch(e) { renderChannels([]); }
    finally { initialLoader.style.display = 'none'; }
}

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
        renderChannels(shuffled.slice(0, 6));
    } catch(e) {
        channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Не удалось найти доступный канал")}</div>`;
    } finally { initialLoader.style.display = 'none'; }
}

// ============= UI КОМПОНЕНТЫ =============

function renderMainCategories() {
    mainCategoriesPanel.innerHTML = '';
    Object.keys(categoryTree).forEach((cat, index) => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = translateText(cat);
        if (cat === currentMainCategory) btn.classList.add('active');
        btn.addEventListener('click', () => {
            currentMainCategory = cat;
            currentSubcategory = '';
            renderSubCategories();
            loadAndRenderChannels(cat, '');
            updateMainCategoryActive();
        });
        mainCategoriesPanel.appendChild(btn);
    });
    
    const spacer = document.createElement('div'); spacer.style.width = '20px';
    mainCategoriesPanel.appendChild(spacer);
    
    const ruBtn = document.createElement('button');
    ruBtn.className = 'category-btn';
    ruBtn.textContent = '🇷🇺';
    if (currentLanguage === 'ru') ruBtn.classList.add('active');
    ruBtn.onclick = () => setLanguage('ru');
    mainCategoriesPanel.appendChild(ruBtn);
    
    const enBtn = document.createElement('button');
    enBtn.className = 'category-btn';
    enBtn.textContent = '🇬🇧';
    if (currentLanguage === 'en') enBtn.classList.add('active');
    enBtn.onclick = () => setLanguage('en');
    mainCategoriesPanel.appendChild(enBtn);
    
    const externalBtn = document.createElement('button');
    externalBtn.id = 'externalPlayerToggle';
    externalBtn.className = 'category-btn';
    externalBtn.textContent = openInExternalPlayer ? '📱 ' + translateText('Открыть в стороннем плеере') : '🎬 ' + translateText('Открыть в стороннем плеере');
    externalBtn.style.minWidth = '160px';
    if (openInExternalPlayer) externalBtn.classList.add('active');
    externalBtn.onclick = toggleExternalPlayer;
    mainCategoriesPanel.appendChild(externalBtn);
    
    const checkBtn = document.createElement('button');
    checkBtn.className = 'category-btn';
    checkBtn.textContent = checkChannelsOnLoad ? '✅ ' + translateText('Проверять каналы') : '🔲 ' + translateText('Проверять каналы');
    checkBtn.onclick = () => {
        checkChannelsOnLoad = !checkChannelsOnLoad;
        localStorage.setItem('checkChannelsOnLoad', checkChannelsOnLoad);
        checkBtn.textContent = checkChannelsOnLoad ? '✅ ' + translateText('Проверять каналы') : '🔲 ' + translateText('Проверять каналы');
        showToast(checkChannelsOnLoad ? translateText("Проверка каналов включена") : translateText("Проверка каналов отключена"));
    };
    mainCategoriesPanel.appendChild(checkBtn);
}

function updateMainCategoryActive() {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    const btns = mainCategoriesPanel.querySelectorAll('.category-btn');
    for (let btn of btns) {
        if (btn.textContent === translateText(currentMainCategory) ||
            (btn.textContent === '🇷🇺' && currentLanguage === 'ru') ||
            (btn.textContent === '🇬🇧' && currentLanguage === 'en') ||
            (btn.id === 'externalPlayerToggle' && openInExternalPlayer) ||
            (btn.textContent.includes('Проверять') && checkChannelsOnLoad)) {
            btn.classList.add('active');
        }
    }
}

function renderSubCategories() {
    if (currentMainCategory === 'Свой плейлист') {
        subCategoriesPanel.innerHTML = '';
        subCategoriesPanel.style.display = 'flex';
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'https://example.com/playlist.m3u';
        input.style.cssText = 'padding:8px 12px; border-radius:6px; border:1px solid #444; background:#222; color:white; flex:1;';
        const btn = document.createElement('button');
        btn.textContent = translateText('Загрузить плейлист');
        btn.style.cssText = 'padding:8px 16px; border-radius:6px; border:none; background:linear-gradient(90deg,#ff375f,#ff5e41); color:white; cursor:pointer;';
        btn.onclick = async () => {
            const url = input.value.trim();
            if (!url) return;
            try {
                const content = await fetchM3U(url);
                const channels = parseM3UContent(content, translateText('Свой плейлист'));
                localStorage.setItem('customPlaylist', JSON.stringify(channels));
                showToast(translateText('Плейлист загружен!'));
                loadAndRenderChannels('Свой плейлист', '');
            } catch(e) { showToast(translateText('Не удалось загрузить плейлист')); }
        };
        subCategoriesPanel.appendChild(input);
        subCategoriesPanel.appendChild(btn);
        return;
    }
    if (currentMainCategory === 'Просмотренные') {
        subCategoriesPanel.innerHTML = '';
        subCategoriesPanel.style.display = 'flex';
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = translateText("Поиск по каналам");
        input.style.cssText = 'padding:8px 12px; border-radius:6px; border:1px solid #444; background:#222; color:white; width:100%;';
        input.oninput = (e) => {
            const query = e.target.value.toLowerCase();
            const watched = JSON.parse(localStorage.getItem('watchedChannels') || '[]');
            renderChannels(watched.filter(ch => ch.name.toLowerCase().includes(query)));
        };
        subCategoriesPanel.appendChild(input);
        return;
    }
    subCategoriesPanel.innerHTML = '';
    if (!categoryTree[currentMainCategory]) return;
    const subcats = Object.keys(categoryTree[currentMainCategory]);
    subcats.forEach((sub, idx) => {
        const btn = document.createElement('button');
        btn.className = 'subcategory-btn';
        btn.textContent = translateText(sub);
        if (sub === currentSubcategory) btn.classList.add('active');
        btn.onclick = () => {
            currentSubcategory = sub;
            loadAndRenderChannels(currentMainCategory, sub);
            updateSubCategoryActive();
        };
        subCategoriesPanel.appendChild(btn);
    });
    if (subcats.length && currentSubcategory) {
        const exportBtn = document.createElement('button');
        exportBtn.className = 'subcategory-btn';
        exportBtn.textContent = '📱 ' + translateText("Открыть все в плейлисте");
        exportBtn.style.background = 'linear-gradient(90deg,#20bf6b,#26de81)';
        exportBtn.style.marginLeft = 'auto';
        exportBtn.onclick = async () => {
            const url = categoryTree[currentMainCategory][currentSubcategory];
            if (url) {
                try {
                    let ch = loadedPlaylists[url];
                    if (!ch) {
                        const content = await fetchM3U(url);
                        ch = parseM3UContent(content, currentSubcategory);
                    }
                    if (ch?.length) openAllInExternalPlayerFunc(ch);
                } catch(e) { showToast(translateText("Ошибка загрузки каналов")); }
            }
        };
        subCategoriesPanel.appendChild(exportBtn);
    }
    if (subcats.length) subCategoriesPanel.style.display = 'flex';
}

function updateSubCategoryActive() {
    document.querySelectorAll('.subcategory-btn').forEach(btn => btn.classList.remove('active'));
    const btns = subCategoriesPanel.querySelectorAll('.subcategory-btn');
    if (btns[currentSubCategoryIndex]) btns[currentSubCategoryIndex].classList.add('active');
}

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('appLanguage', lang);
    renderMainCategories();
    renderSubCategories();
    loadAndRenderChannels(currentMainCategory, currentSubcategory);
    showToast(lang === 'ru' ? "Язык изменён на Русский" : "Language changed to English");
}

// ============= ИНИЦИАЛИЗАЦИЯ =============

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
        setTimeout(() => document.querySelector('.channel-card')?.focus(), 500);
        clearTimeout(safetyTimeout);
    } catch(e) {
        clearTimeout(safetyTimeout);
        initialLoader.style.display = 'none';
        showToast(translateText("Ошибка приложения"));
    }
}

closeModal.addEventListener('click', () => {
    if (videoPlayerElement.hls) { try { videoPlayerElement.hls.destroy(); } catch(e) {} delete videoPlayerElement.hls; }
    videoPlayerElement.pause();
    videoPlayerElement.src = '';
    playerModal.style.display = 'none';
    document.getElementById('externalPlayerModalBtn')?.remove();
    stopAllMiniPlayers();
});

document.addEventListener('keydown', (e) => {
    if (playerModal.style.display === 'flex' && e.key === 'Escape') closeModal.click();
});

window.addEventListener('beforeunload', () => {
    if (window.watchingNowInterval) clearInterval(window.watchingNowInterval);
});

function initMouseWheelScroll() {
    [mainCategoriesPanel, subCategoriesPanel].forEach(container => {
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

// Периодическое восстановление мини-плееров
setInterval(() => {
    if (document.visibilityState === 'visible') {
        miniPlayers.forEach((container) => {
            const video = container.querySelector('video');
            const card = container.closest('.channel-card');
            if (video && card && card.contains(document.activeElement) && video.paused && video.hlsInstance) {
                video.play().catch(()=>{});
            }
        });
    }
}, 30000);
