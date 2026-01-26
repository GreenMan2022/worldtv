<DOCUMENT filename="script.js">
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
"Западная Сахара": "https://iptv-org.github.io/ipt...(truncated 77973 characters)... let errorCount = 0;
hls.on(Hls.Events.ERROR, (event, data) => {
console.warn('HLS Error:', data.type, data.details, data.fatal);
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
} else if (currentMainCategory === 'Просмотренные') {
const input = document.getElementById('watchedSearchInput');
if (input) {
input.focus();
navigationState = 'watchedInput';
return;
}
} else if (currentMainCategory === 'Пользовательские плейлисты') {
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
else if (navigationState === 'watchedInput') {
const input = document.getElementById('watchedSearchInput');
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
return;
}
} else if (currentMainCategory === 'Просмотренные') {
const input = document.getElementById('watchedSearchInput');
if (input) {
input.focus();
navigationState = 'watchedInput';
return;
}
} else if (currentMainCategory === 'Пользовательские плейлисты') {
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
} else if (navigationState === 'subCategories' || navigationState === 'customInput' || navigationState === 'watchedInput') {
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
} else if (currentMainCategory === 'Просмотренные') {
const input = document.getElementById('watchedSearchInput');
if (input) {
input.focus();
navigationState = 'watchedInput';
}
} else if (currentMainCategory === 'Пользовательские плейлисты') {
navigationState = 'subCategories';
subCategoriesPanel.style.display = 'flex';
setTimeout(() => {
const buttons = subCategoriesPanel.querySelectorAll('.subcategory-btn');
if (buttons.length > 0) {
buttons[0].focus();
currentSubCategoryIndex = 0;
}
}, 100);
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
} else if (navigationState === 'subCategories' || navigationState === 'customInput' || navigationState === 'watchedInput') {
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
} else if (currentMainCategory === 'Просмотренные') {
const input = document.getElementById('watchedSearchInput');
if (input) {
input.focus();
navigationState = 'watchedInput';
}
} else if (currentMainCategory === 'Пользовательские плейлисты') {
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
if (currentMainCategory === 'Пользовательские плейлисты') {
selectPublicPlaylist(JSON.parse(buttons[currentSubCategoryIndex].title), currentSubCategoryIndex);
} else {
selectSubcategory(buttons[currentSubCategoryIndex].textContent, currentSubCategoryIndex);
}
}
} else if (navigationState === 'customInput') {
const active = document.activeElement;
if (active.id === 'playlistURL') {
loadPlaylistFromURL();
} else if (active.tagName === 'BUTTON') {
active.click();
}
} else if (navigationState === 'watchedInput') {
const active = document.activeElement;
if (active.id === 'watchedSearchInput') {
performWatchedSearch();
} else if (active.tagName === 'BUTTON') {
active.click();
}
} else if (navigationState === 'channels' && document.activeElement.classList.contains('channel-card')) {
const card = document.activeElement;
const index = parseInt(card.dataset.index);
let list;
if (currentMainCategory === 'Просмотренные') {
list = JSON.parse(localStorage.getItem('watchedChannels') || '[]');
} else if (currentMainCategory === 'Популярные' || currentMainCategory === 'Прямо сейчас') {
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
} else if (currentMainCategory === 'Пользовательские плейлисты') {
const playlistUrl = Object.values(loadedPlaylists).find(pl => pl.some(ch => ch.url === card.dataset.url))?.[0]?.url;
if (playlistUrl) {
list = loadedPlaylists[playlistUrl] || [];
}
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
if (navigationState === 'subCategories' || navigationState === 'customInput' || navigationState === 'watchedInput') {
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
// 👇 Очищаем интервал при закрытии вкладки
window.addEventListener('beforeunload', () => {
if (window.watchingNowInterval) clearInterval(window.watchingNowInterval);
if (window.watchingNowTimerInterval) clearInterval(window.watchingNowTimerInterval);
});
// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
initApp();
});
// ============= MOUSE WHEEL SCROLL FOR HORIZONTAL MENUS =============
function initMouseWheelScroll() {
const scrollContainers = [
document.getElementById('mainCategoriesPanel'),
document.getElementById('subCategoriesPanel')
];
scrollContainers.forEach(container => {
if (!container) return;
container.addEventListener('wheel', function(e) {
if (e.deltaY === 0) return;
e.preventDefault();
this.scrollLeft += e.deltaY;
}, { passive: false });
container.addEventListener('mouseenter', () => {
container.style.cursor = 'grab';
});
container.addEventListener('mousedown', () => {
container.style.cursor = 'grabbing';
});
container.addEventListener('mouseup', () => {
container.style.cursor = 'grab';
});
container.addEventListener('mouseleave', () => {
container.style.cursor = 'default';
});
});
}
// Запускаем после инициализации приложения
document.addEventListener('DOMContentLoaded', () => {
initMouseWheelScroll();
});
// ────────────────────────────────────────────────
// Шаринг ссылок на канал (модалка с выбором соцсетей)
// ────────────────────────────────────────────────
// Определение языка пользователя (один раз при загрузке)
const userLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
const isRussian = userLang.startsWith('ru');
// Переменная для хранения текущего канала при открытии модалки
let currentShareChannel = null;
// Открытие модального окна шаринга
function openShareModal(channel) {
if (!channel || !channel.url) {
showToast(isRussian ? 'Ошибка: нет ссылки на канал' : 'Error: no channel link');
return;
}
currentShareChannel = channel;
document.getElementById('shareChannelName').textContent =
isRussian ? Канал: ${channel.name || 'Без названия'} : Channel: ${channel.name || 'Unnamed'};
document.getElementById('shareModal').style.display = 'flex';
}
// Закрытие модалки
function closeShareModal() {
document.getElementById('shareModal').style.display = 'none';
currentShareChannel = null;
}
// Скопировать прямую M3U-ссылку
function copyDirectLink() {
if (!currentShareChannel) return;
const name = currentShareChannel.name || (isRussian ? 'Канал' : 'Channel');
const url = currentShareChannel.url;
const m3uContent = #EXTINF:-1 tvg-name="${name}",${name}\n${url};
navigator.clipboard.writeText(m3uContent).then(() => {
showToast(isRussian ? 'M3U-ссылка скопирована!' : 'M3U link copied!');
}).catch(err => {
console.error(err);
showToast(isRussian ? 'Не удалось скопировать' : 'Failed to copy');
});
closeShareModal();
}
// Текст для публикации в соцсетях
function getShareText() {
const site = 'https://worldtv.onrender.com/';
if (isRussian) {
return Смотрю ${currentShareChannel.name} бесплатно на WorldTV! Сотни каналов онлайн без регистрации → ${site};
} else {
return Watching ${currentShareChannel.name} for free on WorldTV! Hundreds of channels online no sign-up → ${site};
}
}
// VK — на стену
function shareToVK() {
if (!currentShareChannel) return;
const url = encodeURIComponent('https://worldtv.onrender.com/');
const title = encodeURIComponent(currentShareChannel.name || 'IPTV Channel');
const desc = encodeURIComponent(getShareText());
const vkUrl = https://vk.com/share.php?url=${url}&title=${title}&description=${desc};
window.open(vkUrl, '_blank', 'width=620,height=480');
closeShareModal();
}
// Facebook — на timeline
function shareToFacebook() {
if (!currentShareChannel) return;
const url = encodeURIComponent('https://worldtv.onrender.com/');
const fbUrl = https://www.facebook.com/sharer/sharer.php?u=${url};
window.open(fbUrl, '_blank', 'width=620,height=480');
closeShareModal();
}
// Twitter/X — в ленту профиля
function shareToTwitter() {
if (!currentShareChannel) return;
const text = encodeURIComponent(getShareText());
const twUrl = https://twitter.com/intent/tweet?text=${text}&url=https://worldtv.onrender.com/;
window.open(twUrl, '_blank', 'width=620,height=480');
closeShareModal();
}
// LinkedIn — на профиль
function shareToLinkedIn() {
if (!currentShareChannel) return;
const url = encodeURIComponent('https://worldtv.onrender.com/');
const title = encodeURIComponent(currentShareChannel.name || 'IPTV Channel');
const summary = encodeURIComponent(getShareText());
const liUrl = https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}&summary=${summary};
window.open(liUrl, '_blank', 'width=620,height=480');
closeShareModal();
}
// Reddit — как пост (виден публично)
function shareToReddit() {
if (!currentShareChannel) return;
const url = encodeURIComponent('https://worldtv.onrender.com/');
const title = encodeURIComponent(${currentShareChannel.name || 'Channel'} — ${getShareText().substring(0, 120)}...);
const rdUrl = https://www.reddit.com/submit?url=${url}&title=${title};
window.open(rdUrl, '_blank', 'width=620,height=480');
closeShareModal();
}
</DOCUMENT>
