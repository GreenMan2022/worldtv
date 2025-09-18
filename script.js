// DOM элементы
const channelsContainer = document.getElementById('channelsContainer');
const categoriesContainer = document.getElementById('categoriesContainer');
const categoriesPanel = document.getElementById('categoriesPanel');
const playerModal = document.getElementById('playerModal');
const videoPlayerElement = document.getElementById('videoPlayerElement');
const closeModal = document.getElementById('closeModal');
const initialLoader = document.getElementById('initialLoader');
const toastContainer = document.getElementById('toastContainer');

// Глобальные переменные
let currentMainCategory = 'Категории'; // Главная категория
let currentSubcategory = '';            // Подкатегория
let navigationState = 'channels';       // 'channels' | 'mainCategories' | 'subCategories'
let currentChannelIndex = 0;
let currentMiniPlayer = null;
let miniPlayers = new Map();
let focusTimer = null;
let loadedPlaylists = {};

// Структура плейлистов (реальные ссылки, без example.com)
const categoryTree = {
  "Категории": {
    "Новости": "https://iptv-org.github.io/iptv/categories/news.m3u",
    "Спорт": "https://iptv-org.github.io/iptv/categories/sports.m3u",
    "Футбол": "https://iptv-org.github.io/iptv/categories/football.m3u",
    "Баскетбол": "https://iptv-org.github.io/iptv/categories/basketball.m3u",
    "Теннис": "https://iptv-org.github.io/iptv/categories/tennis.m3u",
    "Кино": "https://iptv-org.github.io/iptv/categories/movies.m3u",
    "Боевики": "https://iptv-org.github.io/iptv/categories/action.m3u",
    "Комедии": "https://iptv-org.github.io/iptv/categories/comedy.m3u",
    "Драмы": "https://iptv-org.github.io/iptv/categories/drama.m3u",
    "Развлечения": "https://iptv-org.github.io/iptv/categories/entertainment.m3u",
    "Документальные": "https://iptv-org.github.io/iptv/categories/documentary.m3u",
    "Детские": "https://iptv-org.github.io/iptv/categories/kids.m3u",
    "Музыка": "https://iptv-org.github.io/iptv/categories/music.m3u",
    "Поп": "https://iptv-org.github.io/iptv/categories/pop.m3u",
    "Рок": "https://iptv-org.github.io/iptv/categories/rock.m3u",
    "Хип-хоп": "https://iptv-org.github.io/iptv/categories/hiphop.m3u"
  },
  "Страны": {
    "Россия": "https://iptv-org.github.io/iptv/countries/ru.m3u",
    "США": "https://iptv-org.github.io/iptv/countries/us.m3u",
    "Великобритания": "https://iptv-org.github.io/iptv/countries/gb.m3u",
    "Германия": "https://iptv-org.github.io/iptv/countries/de.m3u",
    "Франция": "https://iptv-org.github.io/iptv/countries/fr.m3u",
    "Италия": "https://iptv-org.github.io/iptv/countries/it.m3u",
    "Испания": "https://iptv-org.github.io/iptv/countries/es.m3u",
    "Китай": "https://iptv-org.github.io/iptv/countries/cn.m3u",
    "Япония": "https://iptv-org.github.io/iptv/countries/jp.m3u",
    "Корея": "https://iptv-org.github.io/iptv/countries/kr.m3u",
    "Индия": "https://iptv-org.github.io/iptv/countries/in.m3u",
    "Бразилия": "https://iptv-org.github.io/iptv/countries/br.m3u",
    "Канада": "https://iptv-org.github.io/iptv/countries/ca.m3u",
    "Австралия": "https://iptv-org.github.io/iptv/countries/au.m3u"
  },
  "Языки": {
    "Acoli": "https://iptv-org.github.io/iptv/languages/ach.m3u",
    "Adhola": "https://iptv-org.github.io/iptv/languages/adh.m3u",
    "Afar": "https://iptv-org.github.io/iptv/languages/aar.m3u",
    "Afrikaans": "https://iptv-org.github.io/iptv/languages/afr.m3u",
    "Albanian": "https://iptv-org.github.io/iptv/languages/sqi.m3u",
    "Algerian Sign Language": "https://iptv-org.github.io/iptv/languages/asp.m3u",
    "Alur": "https://iptv-org.github.io/iptv/languages/alz.m3u",
    "Amharic": "https://iptv-org.github.io/iptv/languages/amh.m3u",
    "Arabic": "https://iptv-org.github.io/iptv/languages/ara.m3u",
    "Armenian": "https://iptv-org.github.io/iptv/languages/hye.m3u",
    "Assamese": "https://iptv-org.github.io/iptv/languages/asm.m3u",
    "Assyrian Neo-Aramaic": "https://iptv-org.github.io/iptv/languages/aii.m3u",
    "Ayizo Gbe": "https://iptv-org.github.io/iptv/languages/ayb.m3u",
    "Aymara": "https://iptv-org.github.io/iptv/languages/aym.m3u",
    "Azerbaijani": "https://iptv-org.github.io/iptv/languages/aze.m3u",
    "Baatonum": "https://iptv-org.github.io/iptv/languages/bba.m3u",
    "Bambara": "https://iptv-org.github.io/iptv/languages/bam.m3u",
    "Bashkir": "https://iptv-org.github.io/iptv/languages/bak.m3u",
    "Basque": "https://iptv-org.github.io/iptv/languages/eus.m3u",
    "Belarusian": "https://iptv-org.github.io/iptv/languages/bel.m3u",
    "Bengali": "https://iptv-org.github.io/iptv/languages/ben.m3u",
    "Bhojpuri": "https://iptv-org.github.io/iptv/languages/bho.m3u",
    "Bosnian": "https://iptv-org.github.io/iptv/languages/bos.m3u",
    "Bulgarian": "https://iptv-org.github.io/iptv/languages/bul.m3u",
    "Burmese": "https://iptv-org.github.io/iptv/languages/mya.m3u",
    "Catalan": "https://iptv-org.github.io/iptv/languages/cat.m3u",
    "Central Atlas Tamazight": "https://iptv-org.github.io/iptv/languages/tzm.m3u",
    "Central Kurdish": "https://iptv-org.github.io/iptv/languages/ckb.m3u",
    "Chenoua": "https://iptv-org.github.io/iptv/languages/cnu.m3u",
    "Chhattisgarhi": "https://iptv-org.github.io/iptv/languages/hne.m3u",
    "Chiga": "https://iptv-org.github.io/iptv/languages/cgg.m3u",
    "Chinese": "https://iptv-org.github.io/iptv/languages/zho.m3u",
    "Croatian": "https://iptv-org.github.io/iptv/languages/hrv.m3u",
    "Czech": "https://iptv-org.github.io/iptv/languages/ces.m3u",
    "Danish": "https://iptv-org.github.io/iptv/languages/dan.m3u",
    "Dari (Parsi)": "https://iptv-org.github.io/iptv/languages/prd.m3u",
    "Dendi (Benin)": "https://iptv-org.github.io/iptv/languages/ddn.m3u",
    "Dhanwar (Nepal)": "https://iptv-org.github.io/iptv/languages/dhw.m3u",
    "Dhivehi": "https://iptv-org.github.io/iptv/languages/div.m3u",
    "Dholuo": "https://iptv-org.github.io/iptv/languages/luo.m3u",
    "Dimili": "https://iptv-org.github.io/iptv/languages/zza.m3u",
    "Dutch": "https://iptv-org.github.io/iptv/languages/nld.m3u",
    "Dyula": "https://iptv-org.github.io/iptv/languages/dyu.m3u",
    "Egyptian Arabic": "https://iptv-org.github.io/iptv/languages/arz.m3u",
    "English": "https://iptv-org.github.io/iptv/languages/eng.m3u",
    "Estonian": "https://iptv-org.github.io/iptv/languages/est.m3u",
    "Ewe": "https://iptv-org.github.io/iptv/languages/ewe.m3u",
    "Faroese": "https://iptv-org.github.io/iptv/languages/fao.m3u",
    "Fataleka": "https://iptv-org.github.io/iptv/languages/far.m3u",
    "Filipino": "https://iptv-org.github.io/iptv/languages/fil.m3u",
    "Finnish": "https://iptv-org.github.io/iptv/languages/fin.m3u",
    "Fon": "https://iptv-org.github.io/iptv/languages/fon.m3u",
    "French": "https://iptv-org.github.io/iptv/languages/fra.m3u",
    "Fulah": "https://iptv-org.github.io/iptv/languages/ful.m3u",
    "Gaelic": "https://iptv-org.github.io/iptv/languages/gla.m3u",
    "Ganda": "https://iptv-org.github.io/iptv/languages/lug.m3u",
    "Gen": "https://iptv-org.github.io/iptv/languages/gej.m3u",
    "Georgian": "https://iptv-org.github.io/iptv/languages/kat.m3u",
    "German": "https://iptv-org.github.io/iptv/languages/deu.m3u",
    "Gikuyu": "https://iptv-org.github.io/iptv/languages/kik.m3u",
    "Goan Konkani": "https://iptv-org.github.io/iptv/languages/gom.m3u",
    "Greek": "https://iptv-org.github.io/iptv/languages/ell.m3u",
    "Guadeloupean Creole French": "https://iptv-org.github.io/iptv/languages/gcf.m3u",
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
    "Kazakh": "https://iptv-org.github.io/iptv/languages/kaz.m3u",
    "Khmer": "https://iptv-org.github.io/iptv/languages/khm.m3u",
    "Khorasani Turkish": "https://iptv-org.github.io/iptv/languages/kmz.m3u",
    "Kinyarwanda": "https://iptv-org.github.io/iptv/languages/kin.m3u",
    "Kirghiz": "https://iptv-org.github.io/iptv/languages/kir.m3u",
    "Kituba (Congo)": "https://iptv-org.github.io/iptv/languages/mkw.m3u",
    "Kongo": "https://iptv-org.github.io/iptv/languages/kon.m3u",
    "Konkani (macrolanguage)": "https://iptv-org.github.io/iptv/languages/kok.m3u",
    "Korean": "https://iptv-org.github.io/iptv/languages/kor.m3u",
    "Kumam": "https://iptv-org.github.io/iptv/languages/kdi.m3u",
    "Kurdish": "https://iptv-org.github.io/iptv/languages/kur.m3u",
    "Lango (Uganda)": "https://iptv-org.github.io/iptv/languages/laj.m3u",
    "Lao": "https://iptv-org.github.io/iptv/languages/lao.m3u",
    "Latin": "https://iptv-org.github.io/iptv/languages/lat.m3u",
    "Latvian": "https://iptv-org.github.io/iptv/languages/lav.m3u",
    "Letzeburgesch": "https://iptv-org.github.io/iptv/languages/ltz.m3u",
    "Lingala": "https://iptv-org.github.io/iptv/languages/lin.m3u",
    "Lithuanian": "https://iptv-org.github.io/iptv/languages/lit.m3u",
    "Luba-Lulua": "https://iptv-org.github.io/iptv/languages/lua.m3u",
    "Lushai": "https://iptv-org.github.io/iptv/languages/lus.m3u",
    "Macedonian": "https://iptv-org.github.io/iptv/languages/mkd.m3u",
    "Malay": "https://iptv-org.github.io/iptv/languages/msa.m3u",
    "Malayalam": "https://iptv-org.github.io/iptv/languages/mal.m3u",
    "Maltese": "https://iptv-org.github.io/iptv/languages/mlt.m3u",
    "Mandarin Chinese": "https://iptv-org.github.io/iptv/languages/cmn.m3u",
    "Mandinka": "https://iptv-org.github.io/iptv/languages/mnk.m3u",
    "Maori": "https://iptv-org.github.io/iptv/languages/mri.m3u",
    "Marathi": "https://iptv-org.github.io/iptv/languages/mar.m3u",
    "Min Nan Chinese": "https://iptv-org.github.io/iptv/languages/nan.m3u",
    "Mongolian": "https://iptv-org.github.io/iptv/languages/mon.m3u",
    "Montenegrin": "https://iptv-org.github.io/iptv/languages/cnr.m3u",
    "Morisyen": "https://iptv-org.github.io/iptv/languages/mfe.m3u",
    "Moroccan Sign Language": "https://iptv-org.github.io/iptv/languages/xms.m3u",
    "Mossi": "https://iptv-org.github.io/iptv/languages/mos.m3u",
    "Mycenaean Greek": "https://iptv-org.github.io/iptv/languages/gmy.m3u",
    "Nepali": "https://iptv-org.github.io/iptv/languages/nep.m3u",
    "Norwegian": "https://iptv-org.github.io/iptv/languages/nor.m3u",
    "Nyankole": "https://iptv-org.github.io/iptv/languages/nyn.m3u",
    "Nyoro": "https://iptv-org.github.io/iptv/languages/nyo.m3u",
    "Oriya (macrolanguage)": "https://iptv-org.github.io/iptv/languages/ori.m3u",
    "Panjabi": "https://iptv-org.github.io/iptv/languages/pan.m3u",
    "Papiamento": "https://iptv-org.github.io/iptv/languages/pap.m3u",
    "Pashto": "https://iptv-org.github.io/iptv/languages/pus.m3u",
    "Persian": "https://iptv-org.github.io/iptv/languages/fas.m3u",
    "Polish": "https://iptv-org.github.io/iptv/languages/pol.m3u",
    "Portuguese": "https://iptv-org.github.io/iptv/languages/por.m3u",
    "Pulaar": "https://iptv-org.github.io/iptv/languages/fuc.m3u",
    "Quechua": "https://iptv-org.github.io/iptv/languages/que.m3u",
    "Romanian": "https://iptv-org.github.io/iptv/languages/ron.m3u",
    "Russian": "https://iptv-org.github.io/iptv/languages/rus.m3u",
    "Saint Lucian Creole French": "https://iptv-org.github.io/iptv/languages/acf.m3u",
    "Samoan": "https://iptv-org.github.io/iptv/languages/smo.m3u",
    "Santali": "https://iptv-org.github.io/iptv/languages/sat.m3u",
    "Serbian": "https://iptv-org.github.io/iptv/languages/srp.m3u",
    "Serbo-Croatian": "https://iptv-org.github.io/iptv/languages/hbs.m3u",
    "Sinhala": "https://iptv-org.github.io/iptv/languages/sin.m3u",
    "Slovak": "https://iptv-org.github.io/iptv/languages/slk.m3u",
    "Slovenian": "https://iptv-org.github.io/iptv/languages/slv.m3u",
    "Somali": "https://iptv-org.github.io/iptv/languages/som.m3u",
    "South African Sign Language": "https://iptv-org.github.io/iptv/languages/sfs.m3u",
    "South Ndebele": "https://iptv-org.github.io/iptv/languages/nbl.m3u",
    "Spanish": "https://iptv-org.github.io/iptv/languages/spa.m3u",
    "Standard Arabic": "https://iptv-org.github.io/iptv/languages/arb.m3u",
    "Swahili": "https://iptv-org.github.io/iptv/languages/swa.m3u",
    "Swati": "https://iptv-org.github.io/iptv/languages/ssw.m3u",
    "Swedish": "https://iptv-org.github.io/iptv/languages/swe.m3u",
    "Tachawit": "https://iptv-org.github.io/iptv/languages/shy.m3u",
    "Tachelhit": "https://iptv-org.github.io/iptv/languages/shi.m3u",
    "Tagalog": "https://iptv-org.github.io/iptv/languages/tgl.m3u",
    "Tahitian": "https://iptv-org.github.io/iptv/languages/tah.m3u",
    "Tajik": "https://iptv-org.github.io/iptv/languages/tgk.m3u",
    "Tamashek": "https://iptv-org.github.io/iptv/languages/tmh.m3u",
    "Tamasheq": "https://iptv-org.github.io/iptv/languages/taq.m3u",
    "Tamil": "https://iptv-org.github.io/iptv/languages/tam.m3u",
    "Tarifit": "https://iptv-org.github.io/iptv/languages/rif.m3u",
    "Tatar": "https://iptv-org.github.io/iptv/languages/tat.m3u",
    "Telugu": "https://iptv-org.github.io/iptv/languages/tel.m3u",
    "Thai": "https://iptv-org.github.io/iptv/languages/tha.m3u",
    "Tibetan": "https://iptv-org.github.io/iptv/languages/bod.m3u",
    "Tigre": "https://iptv-org.github.io/iptv/languages/tig.m3u",
    "Tigrinya": "https://iptv-org.github.io/iptv/languages/tir.m3u",
    "Tooro": "https://iptv-org.github.io/iptv/languages/ttj.m3u",
    "Tsonga": "https://iptv-org.github.io/iptv/languages/tso.m3u",
    "Tumzabt": "https://iptv-org.github.io/iptv/languages/mzb.m3u",
    "Turkish": "https://iptv-org.github.io/iptv/languages/tur.m3u",
    "Turkmen": "https://iptv-org.github.io/iptv/languages/tuk.m3u",
    "Uighur": "https://iptv-org.github.io/iptv/languages/uig.m3u",
    "Ukrainian": "https://iptv-org.github.io/iptv/languages/ukr.m3u",
    "Urdu": "https://iptv-org.github.io/iptv/languages/urd.m3u",
    "Uzbek": "https://iptv-org.github.io/iptv/languages/uzb.m3u",
    "Venda": "https://iptv-org.github.io/iptv/languages/ven.m3u",
    "Vietnamese": "https://iptv-org.github.io/iptv/languages/vie.m3u",
    "Welsh": "https://iptv-org.github.io/iptv/languages/cym.m3u",
    "Western Frisian": "https://iptv-org.github.io/iptv/languages/fry.m3u",
    "Wolof": "https://iptv-org.github.io/iptv/languages/wol.m3u",
    "Xhosa": "https://iptv-org.github.io/iptv/languages/xho.m3u",
    "Yakut": "https://iptv-org.github.io/iptv/languages/sah.m3u",
    "Yoruba": "https://iptv-org.github.io/iptv/languages/yor.m3u",
    "Yucatec Maya": "https://iptv-org.github.io/iptv/languages/yua.m3u",
    "Yue Chinese": "https://iptv-org.github.io/iptv/languages/yue.m3u",
    "Zarma": "https://iptv-org.github.io/iptv/languages/dje.m3u",
    "Zulu": "https://iptv-org.github.io/iptv/languages/zul.m3u",
    "Undefined": "https://iptv-org.github.io/iptv/languages/undefined.m3u"
  }
};
// Закрытие модального окна
closeModal.addEventListener('click', function() {
    playerModal.style.display = 'none';
    videoPlayerElement.pause();
    videoPlayerElement.src = '';
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

// Инициализация приложения
function initApp() {
    const safetyTimeout = setTimeout(() => {
        initialLoader.style.display = 'none';
        showToast("Ошибка инициализации");
    }, 10000);

    try {
        // Устанавливаем начальные значения
        currentMainCategory = 'Категории';
        const firstSub = Object.keys(categoryTree['Категории'])[0];
        currentSubcategory = firstSub || '';
        
        // Рендерим панель (пока скрыта)
        renderCategoriesPanel();
        
        // Загружаем первый плейлист
        loadAndRenderChannels(currentMainCategory, currentSubcategory);
        
        // Фокус на первый канал
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

// Отображение панели категорий
function renderCategoriesPanel() {
    categoriesPanel.innerHTML = '';
    
    if (navigationState === 'mainCategories') {
        // Показываем главные категории
        const mainCategories = Object.keys(categoryTree);
        
        mainCategories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'category-btn';
            btn.textContent = cat;
            if (cat === currentMainCategory) btn.classList.add('active');
            
            btn.addEventListener('click', () => {
                selectMainCategory(cat);
            });
            
            categoriesPanel.appendChild(btn);
        });
    } else if (navigationState === 'subCategories') {
        // Показываем подкатегории
        const subcategories = categoryTree[currentMainCategory] ? Object.keys(categoryTree[currentMainCategory]) : [];
        
        subcategories.forEach(subcat => {
            const btn = document.createElement('button');
            btn.className = 'category-btn';
            btn.textContent = subcat;
            if (subcat === currentSubcategory) btn.classList.add('active');
            
            btn.addEventListener('click', () => {
                selectSubcategory(subcat);
            });
            
            categoriesPanel.appendChild(btn);
        });
    }
}

// Выбор главной категории
function selectMainCategory(categoryName) {
    currentMainCategory = categoryName;
    const firstSub = categoryTree[categoryName] ? Object.keys(categoryTree[categoryName])[0] : '';
    currentSubcategory = firstSub || '';
    navigationState = 'subCategories';
    renderCategoriesPanel();
    
    // Фокус на первую подкатегорию
    setTimeout(() => {
        const firstBtn = categoriesPanel.querySelector('.category-btn');
        if (firstBtn) firstBtn.focus();
    }, 100);
}

// Выбор подкатегории
function selectSubcategory(subcategoryName) {
    currentSubcategory = subcategoryName;
    navigationState = 'channels';
    categoriesPanel.style.display = 'none';
    
    loadAndRenderChannels(currentMainCategory, currentSubcategory);
}

// Загрузка и отображение каналов
async function loadAndRenderChannels(mainCategory, subcategory) {
    if (!categoryTree[mainCategory] || !categoryTree[mainCategory][subcategory]) {
        renderChannels([]);
        return;
    }
    
    const url = categoryTree[mainCategory][subcategory];
    initialLoader.style.display = 'flex';
    
    try {
        let channels = [];
        
        if (loadedPlaylists[url]) {
            channels = loadedPlaylists[url];
        } else {
            const content = await fetchM3U(url);
            channels = parseM3UContent(content, subcategory);
            loadedPlaylists[url] = channels;
        }
        
        renderChannels(channels);
    } catch (error) {
        console.error("Ошибка загрузки плейлиста:", error);
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
                
                channels.push({
                    name,
                    url: urlLine.trim(),
                    group: assignedCategory,
                    logo
                });
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
        
        // Информация о канале
        const infoContainer = document.createElement('div');
        infoContainer.className = 'channel-info';
        infoContainer.innerHTML = `
            <h3>${channel.name}</h3>
            <p>${channel.group}</p>
        `;
        
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
            if (focusTimer) {
                clearTimeout(focusTimer);
                focusTimer = null;
            }
            
            setTimeout(() => {
                if (!channelCard.contains(document.activeElement)) {
                    miniPlayer.style.display = 'none';
                    icon.style.display = 'block';
                    const video = miniPlayer.querySelector('video');
                    if (video) video.pause();
                }
            }, 100);
        });
        
        // Клик и Enter
        channelCard.addEventListener('click', () => openFullScreenPlayer(channel.name, channel.url));
        channelCard.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                openFullScreenPlayer(channel.name, channel.url);
            }
        });
        
        channelsContainer.appendChild(channelCard);
    });
}

// Создание контейнера мини-плеера
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
                if (data.details === 'manifestLoadError' || data.details === 'manifestLoadTimeOut' ||
                    (data.response && (data.response.code >= 400 || data.response.code === 0))) {
                    handleStreamError(url, miniPlayer);
                    addToBlacklist(url);
                    miniPlayer.style.display = 'none';
                    icon.style.display = 'block';
                }
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
            const error = video.error;
            if (error && (error.code === error.MEDIA_ERR_SRC_NOT_SUPPORTED || error.code === error.MEDIA_ERR_NETWORK)) {
                handleStreamError(url, miniPlayer);
                addToBlacklist(url);
                miniPlayer.style.display = 'none';
                icon.style.display = 'block';
            }
        });
    }
}

// Обработка ошибки
function handleStreamError(url, container) {
    showToast('Канал недоступен');
    console.error("Ошибка:", url);
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
function openFullScreenPlayer(name, url) {
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
            videoPlayerElement.play().catch(e => console.log("Autoplay:", e));
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
            videoPlayerElement.play().catch(e => console.log("Autoplay:", e));
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

// Навигация с пульта
document.addEventListener('keydown', function(e) {
    if (playerModal.style.display === 'flex') {
        if (e.key === 'Escape') closeModal.click();
        return;
    }

    // Back / Escape — навигация по иерархии
    if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        toggleCategoriesPanel();
        return;
    }

    if (navigationState === 'mainCategories' || navigationState === 'subCategories') {
        handleCategoriesPanelNavigation(e);
    } else {
        handleChannelsNavigation(e);
    }
});

// Переключение панели категорий
function toggleCategoriesPanel() {
    if (navigationState === 'channels') {
        navigationState = 'mainCategories';
        categoriesPanel.style.display = 'block';
        renderCategoriesPanel();
        
        setTimeout(() => {
            const activeBtn = categoriesPanel.querySelector('.category-btn.active');
            if (activeBtn) activeBtn.focus();
            else {
                const firstBtn = categoriesPanel.querySelector('.category-btn');
                if (firstBtn) firstBtn.focus();
            }
        }, 100);
    } else if (navigationState === 'mainCategories') {
        navigationState = 'subCategories';
        renderCategoriesPanel();
        
        setTimeout(() => {
            const firstBtn = categoriesPanel.querySelector('.category-btn');
            if (firstBtn) firstBtn.focus();
        }, 100);
    } else if (navigationState === 'subCategories') {
        navigationState = 'channels';
        categoriesPanel.style.display = 'none';
        
        setTimeout(() => {
            const firstChannel = document.querySelector('.channel-card');
            if (firstChannel) firstChannel.focus();
        }, 100);
    }
}

// Навигация в панели категорий
function handleCategoriesPanelNavigation(e) {
    const buttons = categoriesPanel.querySelectorAll('.category-btn');
    if (buttons.length === 0) return;
    
    const currentIndex = Array.from(buttons).findIndex(btn => btn.classList.contains('active'));
    let nextIndex = currentIndex;
    
    switch(e.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
            e.preventDefault();
            if (e.key === 'ArrowRight') {
                nextIndex = (currentIndex + 1) % buttons.length;
            } else {
                nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
            }
            buttons[nextIndex].focus();
            break;
            
        case 'Enter':
            e.preventDefault();
            const btnText = buttons[nextIndex || currentIndex].textContent;
            
            if (navigationState === 'mainCategories') {
                selectMainCategory(btnText);
            } else if (navigationState === 'subCategories') {
                selectSubcategory(btnText);
            }
            break;
    }
}

// Навигация по каналам
function handleChannelsNavigation(e) {
    const channelCards = document.querySelectorAll('.channel-card');
    if (channelCards.length === 0) return;
    
    const currentIndex = Array.from(channelCards).indexOf(document.activeElement);
    let nextIndex = currentIndex;
    
    switch(e.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'ArrowUp':
        case 'ArrowDown':
            e.preventDefault();
            
            const cols = Math.floor(channelsContainer.offsetWidth / 280) || 1;
            
            switch(e.key) {
                case 'ArrowRight':
                    nextIndex = (currentIndex + 1) % channelCards.length;
                    break;
                case 'ArrowLeft':
                    nextIndex = (currentIndex - 1 + channelCards.length) % channelCards.length;
                    break;
                case 'ArrowDown':
                    nextIndex = (currentIndex + cols) % channelCards.length;
                    if (nextIndex >= channelCards.length) nextIndex = channelCards.length - 1;
                    break;
                case 'ArrowUp':
                    nextIndex = (currentIndex - cols + channelCards.length) % channelCards.length;
                    break;
            }
            
            channelCards[nextIndex].focus();
            break;
            
        case 'Enter':
            e.preventDefault();
            if (document.activeElement.classList.contains('channel-card')) {
                const card = document.activeElement;
                const index = parseInt(card.dataset.index);
                
                const url = categoryTree[currentMainCategory][currentSubcategory];
                const channels = loadedPlaylists[url] || [];
                
                if (index >= 0 && index < channels.length) {
                    const channel = channels[index];
                    openFullScreenPlayer(channel.name, channel.url);
                }
            }
            break;
    }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});
