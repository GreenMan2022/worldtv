// Функция для получения данных из localStorage или создания пустого объекта/массива
function getFromStorage(key, defaultValue) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
}

// Функция для сохранения данных в localStorage
function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Функция для добавления канала в "Просмотренные"
function addToWatched(name, url) {
    const watched = getFromStorage('watchedChannels', {});
    watched[name] = url;
    saveToStorage('watchedChannels', watched);
    // Обновляем categoryTree
    categoryTree["Просмотренные"] = watched;
}

// Функция для добавления канала в "Чёрный список"
function addToBlacklist(name) {
    let blacklist = getFromStorage('blacklist', []);
    if (!blacklist.includes(name)) {
        blacklist.push(name);
        saveToStorage('blacklist', blacklist);
        // Обновляем categoryTree
        categoryTree["Чёрный список"] = blacklist;
    }
}

// Функция для проверки, находится ли канал в чёрном списке
function isBlacklisted(name) {
    const blacklist = getFromStorage('blacklist', []);
    return blacklist.includes(name);
}

// Основной объект categoryTree, включающий все данные из файла
const categoryTree = {
    "Категории": {
        "Animation": "https://iptv-org.github.io/iptv/categories/animation.m3u",
        "Auto": "https://iptv-org.github.io/iptv/categories/auto.m3u",
        "Business": "https://iptv-org.github.io/iptv/categories/business.m3u",
        "Classic": "https://iptv-org.github.io/iptv/categories/classic.m3u",
        "Comedy": "https://iptv-org.github.io/iptv/categories/comedy.m3u",
        "Cooking": "https://iptv-org.github.io/iptv/categories/cooking.m3u",
        "Culture": "https://iptv-org.github.io/iptv/categories/culture.m3u",
        "Documentary": "https://iptv-org.github.io/iptv/categories/documentary.m3u",
        "Education": "https://iptv-org.github.io/iptv/categories/education.m3u",
        "Entertainment": "https://iptv-org.github.io/iptv/categories/entertainment.m3u",
        "Family": "https://iptv-org.github.io/iptv/categories/family.m3u",
        "General": "https://iptv-org.github.io/iptv/categories/general.m3u",
        "Interactive": "https://iptv-org.github.io/iptv/categories/interactive.m3u",
        "Kids": "https://iptv-org.github.io/iptv/categories/kids.m3u",
        "Legislative": "https://iptv-org.github.io/iptv/categories/legislative.m3u",
        "Lifestyle": "https://iptv-org.github.io/iptv/categories/lifestyle.m3u",
        "Movies": "https://iptv-org.github.io/iptv/categories/movies.m3u",
        "Music": "https://iptv-org.github.io/iptv/categories/music.m3u",
        "News": "https://iptv-org.github.io/iptv/categories/news.m3u",
        "Outdoor": "https://iptv-org.github.io/iptv/categories/outdoor.m3u",
        "Public": "https://iptv-org.github.io/iptv/categories/public.m3u",
        "Relax": "https://iptv-org.github.io/iptv/categories/relax.m3u",
        "Religious": "https://iptv-org.github.io/iptv/categories/religious.m3u",
        "Science": "https://iptv-org.github.io/iptv/categories/science.m3u",
        "Series": "https://iptv-org.github.io/iptv/categories/series.m3u",
        "Shop": "https://iptv-org.github.io/iptv/categories/shop.m3u",
        "Sports": "https://iptv-org.github.io/iptv/categories/sports.m3u",
        "Travel": "https://iptv-org.github.io/iptv/categories/travel.m3u",
        "Weather": "https://iptv-org.github.io/iptv/categories/weather.m3u",
        "XXX": "https://iptv-org.github.io/iptv/categories/xxx.m3u",
        "Undefined": "https://iptv-org.github.io/iptv/categories/undefined.m3u"
    },
    "Языки": {
        "Acoli": "https://iptv-org.github.io/iptv/languages/ach.m3u",
        "Adhola": "https://iptv-org.github.io/iptv/languages/adh.m3u",
        "Afar": "https://iptv-org.github.io/iptv/languages/aar.m3u",
        "Afrikaans": "https://iptv-org.github.io/iptv/languages/afr.m3u",
        "Albanian": "https://iptv-org.github.io/iptv/languages/sqi.m3u",
        "Gujarati": "https://iptv-org.github.io/iptv/languages/guj.m3u",
        "Gun": "https://iptv-org.github.io/iptv/languages/guw.m3u",
        "Haitian": "https://iptv-org.github.io/iptv/languages/hat.m3u",
        "Hausa": "https://iptv-org.github.io/iptv/languages/hau.m3u",
        "Hebrew": "https://iptv-org.github.io/iptv/languages/heb.m3u",
        "Hindi": "https://iptv-org.github.io/iptv/languages/hin.m3u",
        "Hmong": "https://iptv-org.github.io/iptv/languages/hmn.m3u",
        "Hungarian": "https://iptv-org.github.io/iptv/languages/hun.m3u",
        "Icelandic": "https://iptv-org.github.io/iptv/languages/isl.m3u",
        "Indonesian": "https://iptv-org.github.io/iptv/languages/ind.m3u",
        "Inuktitut": "https://iptv-org.github.io/iptv/languages/iku.m3u",
        "Irish": "https://iptv-org.github.io/iptv/languages/gle.m3u",
        "Isekiri": "https://iptv-org.github.io/iptv/languages/its.m3u",
        "Italian": "https://iptv-org.github.io/iptv/languages/ita.m3u",
        "Japanese": "https://iptv-org.github.io/iptv/languages/jpn.m3u",
        "Javanese": "https://iptv-org.github.io/iptv/languages/jav.m3u",
        "Kabiyè": "https://iptv-org.github.io/iptv/languages/kbp.m3u",
        "Kabyle": "https://iptv-org.github.io/iptv/languages/kab.m3u",
        "Kannada": "https://iptv-org.github.io/iptv/languages/kan.m3u",
        "Kapampangan": "https://iptv-org.github.io/iptv/languages/pam.m3u",
        "Fulah": "https://iptv-org.github.io/iptv/languages/ful.m3u",
        "Gaelic": "https://iptv-org.github.io/iptv/languages/gla.m3u",
        "Ganda": "https://iptv-org.github.io/iptv/languages/lug.m3u",
        "Gen": "https://iptv-org.github.io/iptv/languages/gej.m3u",
        "Georgian": "https://iptv-org.github.io/iptv/languages/kat.m3u",
        "German": "https://iptv-org.github.io/iptv/languages/deu.m3u",
        "Gikuyu": "https://iptv-org.github.io/iptv/languages/kik.m3u",
        "Goan Konkani": "https://iptv-org.github.io/iptv/languages/gom.m3u",
        "Greek": "https://iptv-org.github.io/iptv/languages/ell.m3u",
        "Guadeloupean Creole French": "https://iptv-org.github.io/iptv/languages/gcf.m3u"
        // ... (остальные языки из файла)
    },
    "Страны": {
        "Afghanistan": "https://iptv-org.github.io/iptv/countries/af.m3u",
        "Albania": "https://iptv-org.github.io/iptv/countries/al.m3u",
        "🇦🇱 Albania": "https://iptv-org.github.io/iptv/countries/al.m3u"
        // ... (остальные страны из файла)
    },
    "Регионы": {
        "Middle East": "https://iptv-org.github.io/iptv/regions/mideast.m3u",
        "Middle East and North Africa": "https://iptv-org.github.io/iptv/regions/mena.m3u",
        "Nordics": "https://iptv-org.github.io/iptv/regions/nord.m3u",
        "North America": "https://iptv-org.github.io/iptv/regions/noram.m3u",
        "Northern America": "https://iptv-org.github.io/iptv/regions/nam.m3u",
        "Northern Europe": "https://iptv-org.github.io/iptv/regions/neu.m3u",
        "Oceania": "https://iptv-org.github.io/iptv/regions/oce.m3u",
        "South America": "https://iptv-org.github.io/iptv/regions/southam.m3u",
        "South Asia": "https://iptv-org.github.io/iptv/regions/sas.m3u",
        "Southeast Asia": "https://iptv-org.github.io/iptv/regions/sea.m3u",
        "Southern Africa": "https://iptv-org.github.io/iptv/regions/saf.m3u",
        "Southern Europe": "https://iptv-org.github.io/iptv/regions/ser.m3u",
        "Sub-Saharan Africa": "https://iptv-org.github.io/iptv/regions/ssa.m3u",
        "United Nations": "https://iptv-org.github.io/iptv/regions/un.m3u",
        "West Africa": "https://iptv-org.github.io/iptv/regions/waf.m3u",
        "West Asia": "https://iptv-org.github.io/iptv/regions/was.m3u",
        "Western Europe": "https://iptv-org.github.io/iptv/regions/wer.m3u",
        "Worldwide": "https://iptv-org.github.io/iptv/regions/ww.m3u"
        // ... (остальные регионы из файла)
    },
    "Города": {
        "Boston": "https://iptv-org.github.io/iptv/cities/usbos.m3u",
        "Leominster": "https://iptv-org.github.io/iptv/cities/uslmr.m3u",
        "Worcester": "https://iptv-org.github.io/iptv/cities/usorh.m3u",
        "Battle Creek": "https://iptv-org.github.io/iptv/cities/usbtl.m3u",
        "Detroit": "https://iptv-org.github.io/iptv/cities/usdet.m3u",
        "Grand Rapids": "https://iptv-org.github.io/iptv/cities/usgrr.m3u",
        "Lansing": "https://iptv-org.github.io/iptv/cities/uslan.m3u",
        "Traverse City": "https://iptv-org.github.io/iptv/cities/ustvc.m3u"
        // ... (остальные города из файла)
    },
    "Просмотренные": getFromStorage('watchedChannels', {}),
    "Чёрный список": getFromStorage('blacklist', [])
};

// === Пример использования ===

// Добавить канал в "Просмотренные"
addToWatched("CNN International", "http://example.com/cnn.m3u8");
addToWatched("Discovery Channel", "http://example.com/discovery.m3u8");

// Добавить канал в "Чёрный список"
addToBlacklist("XXX Channel");
addToBlacklist("Spam Channel");

// Проверить, в чёрном ли списке канал
if (isBlacklisted("XXX Channel")) {
    console.log("Этот канал заблокирован.");
}

// Вывести все просмотренные каналы
console.log("Просмотренные каналы:", categoryTree["Просмотренные"]);

// Вывести весь чёрный список
console.log("Чёрный список:", categoryTree["Чёрный список"]);
