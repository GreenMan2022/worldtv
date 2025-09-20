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
let currentMainCategory = 'Категории';
let currentSubcategory = '';
let currentMainCategoryIndex = 0;
let currentSubCategoryIndex = 0;
let currentChannelIndex = 0;
let currentMiniPlayer = null;
let miniPlayers = new Map();
let focusTimer = null;
let loadedPlaylists = {};
let navigationState = 'channels'; // 'channels' | 'mainCategories' | 'subCategories'

// Структура плейлистов — ТОЛЬКО РЕАЛЬНЫЕ ССЫЛКИ
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
  },
  "Страны": {
    "Afghanistan": "https://iptv-org.github.io/iptv/countries/af.m3u",
    "Albania": "https://iptv-org.github.io/iptv/countries/al.m3u",
    "🇦🇱 Albania": "https://iptv-org.github.io/iptv/countries/al.m3u",
    "Algeria": "https://iptv-org.github.io/iptv/countries/dz.m3u",
    "🇩🇿 Algeria": "https://iptv-org.github.io/iptv/countries/dz.m3u",
    "Andorra": "https://iptv-org.github.io/iptv/countries/ad.m3u",
    "🇦🇩 Andorra": "https://iptv-org.github.io/iptv/countries/ad.m3u",
    "Angola": "https://iptv-org.github.io/iptv/countries/ao.m3u",
    "🇦🇴 Angola": "https://iptv-org.github.io/iptv/countries/ao.m3u",
    "Argentina": "https://iptv-org.github.io/iptv/countries/ar.m3u",
    "🇦🇷 Argentina": "https://iptv-org.github.io/iptv/countries/ar.m3u",
    "Armenia": "https://iptv-org.github.io/iptv/countries/am.m3u",
    "🇦🇲 Armenia": "https://iptv-org.github.io/iptv/countries/am.m3u",
    "Aruba": "https://iptv-org.github.io/iptv/countries/aw.m3u",
    "🇦🇼 Aruba": "https://iptv-org.github.io/iptv/countries/aw.m3u",
    "Australia": "https://iptv-org.github.io/iptv/countries/au.m3u",
    "🇦🇺 Australia": "https://iptv-org.github.io/iptv/countries/au.m3u",
    "Austria": "https://iptv-org.github.io/iptv/countries/at.m3u",
    "🇦🇹 Austria": "https://iptv-org.github.io/iptv/countries/at.m3u",
    "Azerbaijan": "https://iptv-org.github.io/iptv/countries/az.m3u",
    "🇦🇿 Azerbaijan": "https://iptv-org.github.io/iptv/countries/az.m3u",
    "Bahamas": "https://iptv-org.github.io/iptv/countries/bs.m3u",
    "🇧🇸 Bahamas": "https://iptv-org.github.io/iptv/countries/bs.m3u",
    "Bahrain": "https://iptv-org.github.io/iptv/countries/bh.m3u",
    "🇧🇭 Bahrain": "https://iptv-org.github.io/iptv/countries/bh.m3u",
    "Bangladesh": "https://iptv-org.github.io/iptv/countries/bd.m3u",
    "🇧🇩 Bangladesh": "https://iptv-org.github.io/iptv/countries/bd.m3u",
    "Barbados": "https://iptv-org.github.io/iptv/countries/bb.m3u",
    "🇧🇧 Barbados": "https://iptv-org.github.io/iptv/countries/bb.m3u",
    "Belarus": "https://iptv-org.github.io/iptv/countries/by.m3u",
    "🇧🇾 Belarus": "https://iptv-org.github.io/iptv/countries/by.m3u",
    "Belgium": "https://iptv-org.github.io/iptv/countries/be.m3u",
    "🇧🇪 Belgium": "https://iptv-org.github.io/iptv/countries/be.m3u",
    "Benin": "https://iptv-org.github.io/iptv/countries/bj.m3u",
    "🇧🇯 Benin": "https://iptv-org.github.io/iptv/countries/bj.m3u",
    "Bermuda": "https://iptv-org.github.io/iptv/countries/bm.m3u",
    "🇧🇲 Bermuda": "https://iptv-org.github.io/iptv/countries/bm.m3u",
    "Bhutan": "https://iptv-org.github.io/iptv/countries/bt.m3u",
    "🇧🇹 Bhutan": "https://iptv-org.github.io/iptv/countries/bt.m3u",
    "Bolivia": "https://iptv-org.github.io/iptv/countries/bo.m3u",
    "🇧🇴 Bolivia": "https://iptv-org.github.io/iptv/countries/bo.m3u",
    "Bonaire": "https://iptv-org.github.io/iptv/countries/bq.m3u",
    "🇧🇶 Bonaire": "https://iptv-org.github.io/iptv/countries/bq.m3u",
    "Bosnia and Herzegovina": "https://iptv-org.github.io/iptv/countries/ba.m3u",
    "🇧🇦 Bosnia and Herzegovina": "https://iptv-org.github.io/iptv/countries/ba.m3u",
    "Brazil": "https://iptv-org.github.io/iptv/countries/br.m3u",
    "🇧🇷 Brazil": "https://iptv-org.github.io/iptv/countries/br.m3u",
    "British Virgin Islands": "https://iptv-org.github.io/iptv/countries/vg.m3u",
    "🇻🇬 British Virgin Islands": "https://iptv-org.github.io/iptv/countries/vg.m3u",
    "Brunei": "https://iptv-org.github.io/iptv/countries/bn.m3u",
    "🇧🇳 Brunei": "https://iptv-org.github.io/iptv/countries/bn.m3u",
    "Bulgaria": "https://iptv-org.github.io/iptv/countries/bg.m3u",
    "🇧🇬 Bulgaria": "https://iptv-org.github.io/iptv/countries/bg.m3u",
    "Burkina Faso": "https://iptv-org.github.io/iptv/countries/bf.m3u",
    "🇧🇫 Burkina Faso": "https://iptv-org.github.io/iptv/countries/bf.m3u",
    "Cambodia": "https://iptv-org.github.io/iptv/countries/kh.m3u",
    "🇰🇭 Cambodia": "https://iptv-org.github.io/iptv/countries/kh.m3u",
    "Cameroon": "https://iptv-org.github.io/iptv/countries/cm.m3u",
    "🇨🇲 Cameroon": "https://iptv-org.github.io/iptv/countries/cm.m3u",
    "Canada": "https://iptv-org.github.io/iptv/countries/ca.m3u",
    "🇨🇦 Canada": "https://iptv-org.github.io/iptv/countries/ca.m3u",
    "Cape Verde": "https://iptv-org.github.io/iptv/countries/cv.m3u",
    "🇨🇻 Cape Verde": "https://iptv-org.github.io/iptv/countries/cv.m3u",
    "Chad": "https://iptv-org.github.io/iptv/countries/td.m3u",
    "🇹🇩 Chad": "https://iptv-org.github.io/iptv/countries/td.m3u",
    "Chile": "https://iptv-org.github.io/iptv/countries/cl.m3u",
    "🇨🇱 Chile": "https://iptv-org.github.io/iptv/countries/cl.m3u",
    "China": "https://iptv-org.github.io/iptv/countries/cn.m3u",
    "🇨🇳 China": "https://iptv-org.github.io/iptv/countries/cn.m3u",
    "Colombia": "https://iptv-org.github.io/iptv/countries/co.m3u",
    "🇨🇴 Colombia": "https://iptv-org.github.io/iptv/countries/co.m3u",
    "Costa Rica": "https://iptv-org.github.io/iptv/countries/cr.m3u",
    "🇨🇷 Costa Rica": "https://iptv-org.github.io/iptv/countries/cr.m3u",
    "Croatia": "https://iptv-org.github.io/iptv/countries/hr.m3u",
    "🇭🇷 Croatia": "https://iptv-org.github.io/iptv/countries/hr.m3u",
    "Cuba": "https://iptv-org.github.io/iptv/countries/cu.m3u",
    "🇨🇺 Cuba": "https://iptv-org.github.io/iptv/countries/cu.m3u",
    "Curacao": "https://iptv-org.github.io/iptv/countries/cw.m3u",
    "🇨🇼 Curacao": "https://iptv-org.github.io/iptv/countries/cw.m3u",
    "Cyprus": "https://iptv-org.github.io/iptv/countries/cy.m3u",
    "🇨🇾 Cyprus": "https://iptv-org.github.io/iptv/countries/cy.m3u",
    "Czech Republic": "https://iptv-org.github.io/iptv/countries/cz.m3u",
    "🇨🇿 Czech Republic": "https://iptv-org.github.io/iptv/countries/cz.m3u",
    "Democratic Republic of the Congo": "https://iptv-org.github.io/iptv/countries/cd.m3u",
    "🇨🇩 Democratic Republic of the Congo": "https://iptv-org.github.io/iptv/countries/cd.m3u",
    "Denmark": "https://iptv-org.github.io/iptv/countries/dk.m3u",
    "🇩🇰 Denmark": "https://iptv-org.github.io/iptv/countries/dk.m3u",
    "Djibouti": "https://iptv-org.github.io/iptv/countries/dj.m3u",
    "🇩🇯 Djibouti": "https://iptv-org.github.io/iptv/countries/dj.m3u",
    "Dominican Republic": "https://iptv-org.github.io/iptv/countries/do.m3u",
    "🇩🇴 Dominican Republic": "https://iptv-org.github.io/iptv/countries/do.m3u",
    "Ecuador": "https://iptv-org.github.io/iptv/countries/ec.m3u",
    "🇪🇨 Ecuador": "https://iptv-org.github.io/iptv/countries/ec.m3u",
    "Egypt": "https://iptv-org.github.io/iptv/countries/eg.m3u",
    "🇪🇬 Egypt": "https://iptv-org.github.io/iptv/countries/eg.m3u",
    "El Salvador": "https://iptv-org.github.io/iptv/countries/sv.m3u",
    "🇸🇻 El Salvador": "https://iptv-org.github.io/iptv/countries/sv.m3u",
    "Equatorial Guinea": "https://iptv-org.github.io/iptv/countries/gq.m3u",
    "🇬🇶 Equatorial Guinea": "https://iptv-org.github.io/iptv/countries/gq.m3u",
    "Eritrea": "https://iptv-org.github.io/iptv/countries/er.m3u",
    "🇪🇷 Eritrea": "https://iptv-org.github.io/iptv/countries/er.m3u",
    "Estonia": "https://iptv-org.github.io/iptv/countries/ee.m3u",
    "🇪🇪 Estonia": "https://iptv-org.github.io/iptv/countries/ee.m3u",
    "Ethiopia": "https://iptv-org.github.io/iptv/countries/et.m3u",
    "🇪🇹 Ethiopia": "https://iptv-org.github.io/iptv/countries/et.m3u",
    "Faroe Islands": "https://iptv-org.github.io/iptv/countries/fo.m3u",
    "🇫🇴 Faroe Islands": "https://iptv-org.github.io/iptv/countries/fo.m3u",
    "Finland": "https://iptv-org.github.io/iptv/countries/fi.m3u",
    "🇫🇮 Finland": "https://iptv-org.github.io/iptv/countries/fi.m3u",
    "France": "https://iptv-org.github.io/iptv/countries/fr.m3u",
    "🇫🇷 France": "https://iptv-org.github.io/iptv/countries/fr.m3u",
    "French Polynesia": "https://iptv-org.github.io/iptv/countries/pf.m3u",
    "🇵🇫 French Polynesia": "https://iptv-org.github.io/iptv/countries/pf.m3u",
    "Gabon": "https://iptv-org.github.io/iptv/countries/ga.m3u",
    "🇬🇦 Gabon": "https://iptv-org.github.io/iptv/countries/ga.m3u",
    "Gambia": "https://iptv-org.github.io/iptv/countries/gm.m3u",
    "🇬🇲 Gambia": "https://iptv-org.github.io/iptv/countries/gm.m3u",
    "Georgia": "https://iptv-org.github.io/iptv/countries/ge.m3u",
    "🇬🇪 Georgia": "https://iptv-org.github.io/iptv/countries/ge.m3u",
    "Germany": "https://iptv-org.github.io/iptv/countries/de.m3u",
    "🇩🇪 Germany": "https://iptv-org.github.io/iptv/countries/de.m3u",
    "Ghana": "https://iptv-org.github.io/iptv/countries/gh.m3u",
    "🇬🇭 Ghana": "https://iptv-org.github.io/iptv/countries/gh.m3u",
    "Greece": "https://iptv-org.github.io/iptv/countries/gr.m3u",
    "🇬🇷 Greece": "https://iptv-org.github.io/iptv/countries/gr.m3u",
    "Guadeloupe": "https://iptv-org.github.io/iptv/countries/gp.m3u",
    "🇬🇵 Guadeloupe": "https://iptv-org.github.io/iptv/countries/gp.m3u",
    "Guam": "https://iptv-org.github.io/iptv/countries/gu.m3u",
    "🇬🇺 Guam": "https://iptv-org.github.io/iptv/countries/gu.m3u",
    "Guatemala": "https://iptv-org.github.io/iptv/countries/gt.m3u",
    "🇬🇹 Guatemala": "https://iptv-org.github.io/iptv/countries/gt.m3u",
    "Guernsey": "https://iptv-org.github.io/iptv/countries/gg.m3u",
    "🇬🇬 Guernsey": "https://iptv-org.github.io/iptv/countries/gg.m3u",
    "Guinea": "https://iptv-org.github.io/iptv/countries/gn.m3u",
    "🇬🇳 Guinea": "https://iptv-org.github.io/iptv/countries/gn.m3u",
    "Guyana": "https://iptv-org.github.io/iptv/countries/gy.m3u",
    "🇬🇾 Guyana": "https://iptv-org.github.io/iptv/countries/gy.m3u",
    "Haiti": "https://iptv-org.github.io/iptv/countries/ht.m3u",
    "🇭🇹 Haiti": "https://iptv-org.github.io/iptv/countries/ht.m3u",
    "Honduras": "https://iptv-org.github.io/iptv/countries/hn.m3u",
    "🇭🇳 Honduras": "https://iptv-org.github.io/iptv/countries/hn.m3u",
    "Hong Kong": "https://iptv-org.github.io/iptv/countries/hk.m3u",
    "🇭🇰 Hong Kong": "https://iptv-org.github.io/iptv/countries/hk.m3u",
    "Hungary": "https://iptv-org.github.io/iptv/countries/hu.m3u",
    "🇭🇺 Hungary": "https://iptv-org.github.io/iptv/countries/hu.m3u",
    "Iceland": "https://iptv-org.github.io/iptv/countries/is.m3u",
    "🇮🇸 Iceland": "https://iptv-org.github.io/iptv/countries/is.m3u",
    "India": "https://iptv-org.github.io/iptv/countries/in.m3u",
    "🇮🇳 India": "https://iptv-org.github.io/iptv/countries/in.m3u",
    "Indonesia": "https://iptv-org.github.io/iptv/countries/id.m3u",
    "🇮🇩 Indonesia": "https://iptv-org.github.io/iptv/countries/id.m3u",
    "Iran": "https://iptv-org.github.io/iptv/countries/ir.m3u",
    "🇮🇷 Iran": "https://iptv-org.github.io/iptv/countries/ir.m3u",
    "Iraq": "https://iptv-org.github.io/iptv/countries/iq.m3u",
    "🇮🇶 Iraq": "https://iptv-org.github.io/iptv/countries/iq.m3u",
    "Ireland": "https://iptv-org.github.io/iptv/countries/ie.m3u",
    "🇮🇪 Ireland": "https://iptv-org.github.io/iptv/countries/ie.m3u",
    "Israel": "https://iptv-org.github.io/iptv/countries/il.m3u",
    "🇮🇱 Israel": "https://iptv-org.github.io/iptv/countries/il.m3u",
    "Italy": "https://iptv-org.github.io/iptv/countries/it.m3u",
    "🇮🇹 Italy": "https://iptv-org.github.io/iptv/countries/it.m3u",
    "Ivory Coast": "https://iptv-org.github.io/iptv/countries/ci.m3u",
    "🇨🇮 Ivory Coast": "https://iptv-org.github.io/iptv/countries/ci.m3u",
    "Jamaica": "https://iptv-org.github.io/iptv/countries/jm.m3u",
    "🇯🇲 Jamaica": "https://iptv-org.github.io/iptv/countries/jm.m3u",
    "Japan": "https://iptv-org.github.io/iptv/countries/jp.m3u",
    "🇯🇵 Japan": "https://iptv-org.github.io/iptv/countries/jp.m3u",
    "Jordan": "https://iptv-org.github.io/iptv/countries/jo.m3u",
    "🇯🇴 Jordan": "https://iptv-org.github.io/iptv/countries/jo.m3u",
    "Kazakhstan": "https://iptv-org.github.io/iptv/countries/kz.m3u",
    "🇰🇿 Kazakhstan": "https://iptv-org.github.io/iptv/countries/kz.m3u",
    "Kenya": "https://iptv-org.github.io/iptv/countries/ke.m3u",
    "🇰🇪 Kenya": "https://iptv-org.github.io/iptv/countries/ke.m3u",
    "Kosovo": "https://iptv-org.github.io/iptv/countries/xk.m3u",
    "🇽🇰 Kosovo": "https://iptv-org.github.io/iptv/countries/xk.m3u",
    "Kuwait": "https://iptv-org.github.io/iptv/countries/kw.m3u",
    "🇰🇼 Kuwait": "https://iptv-org.github.io/iptv/countries/kw.m3u",
    "Kyrgyzstan": "https://iptv-org.github.io/iptv/countries/kg.m3u",
    "🇰🇬 Kyrgyzstan": "https://iptv-org.github.io/iptv/countries/kg.m3u",
    "Laos": "https://iptv-org.github.io/iptv/countries/la.m3u",
    "🇱🇦 Laos": "https://iptv-org.github.io/iptv/countries/la.m3u",
    "Latvia": "https://iptv-org.github.io/iptv/countries/lv.m3u",
    "🇱🇻 Latvia": "https://iptv-org.github.io/iptv/countries/lv.m3u",
    "Lebanon": "https://iptv-org.github.io/iptv/countries/lb.m3u",
    "🇱🇧 Lebanon": "https://iptv-org.github.io/iptv/countries/lb.m3u",
    "Liberia": "https://iptv-org.github.io/iptv/countries/lr.m3u",
    "🇱🇷 Liberia": "https://iptv-org.github.io/iptv/countries/lr.m3u",
    "Libya": "https://iptv-org.github.io/iptv/countries/ly.m3u",
    "🇱🇾 Libya": "https://iptv-org.github.io/iptv/countries/ly.m3u",
    "Liechtenstein": "https://iptv-org.github.io/iptv/countries/li.m3u",
    "🇱🇮 Liechtenstein": "https://iptv-org.github.io/iptv/countries/li.m3u",
    "Lithuania": "https://iptv-org.github.io/iptv/countries/lt.m3u",
    "🇱🇹 Lithuania": "https://iptv-org.github.io/iptv/countries/lt.m3u",
    "Luxembourg": "https://iptv-org.github.io/iptv/countries/lu.m3u",
    "🇱🇺 Luxembourg": "https://iptv-org.github.io/iptv/countries/lu.m3u",
    "Macao": "https://iptv-org.github.io/iptv/countries/mo.m3u",
    "🇲🇴 Macao": "https://iptv-org.github.io/iptv/countries/mo.m3u",
    "Malaysia": "https://iptv-org.github.io/iptv/countries/my.m3u",
    "🇲🇾 Malaysia": "https://iptv-org.github.io/iptv/countries/my.m3u",
    "Maldives": "https://iptv-org.github.io/iptv/countries/mv.m3u",
    "🇲🇻 Maldives": "https://iptv-org.github.io/iptv/countries/mv.m3u",
    "Mali": "https://iptv-org.github.io/iptv/countries/ml.m3u",
    "🇲🇱 Mali": "https://iptv-org.github.io/iptv/countries/ml.m3u",
    "Malta": "https://iptv-org.github.io/iptv/countries/mt.m3u",
    "🇲🇹 Malta": "https://iptv-org.github.io/iptv/countries/mt.m3u",
    "Martinique": "https://iptv-org.github.io/iptv/countries/mq.m3u",
    "🇲🇶 Martinique": "https://iptv-org.github.io/iptv/countries/mq.m3u",
    "Mauritania": "https://iptv-org.github.io/iptv/countries/mr.m3u",
    "🇲🇷 Mauritania": "https://iptv-org.github.io/iptv/countries/mr.m3u",
    "Mauritius": "https://iptv-org.github.io/iptv/countries/mu.m3u",
    "🇲🇺 Mauritius": "https://iptv-org.github.io/iptv/countries/mu.m3u",
    "Mexico": "https://iptv-org.github.io/iptv/countries/mx.m3u",
    "🇲🇽 Mexico": "https://iptv-org.github.io/iptv/countries/mx.m3u",
    "Moldova": "https://iptv-org.github.io/iptv/countries/md.m3u",
    "🇲🇩 Moldova": "https://iptv-org.github.io/iptv/countries/md.m3u",
    "Monaco": "https://iptv-org.github.io/iptv/countries/mc.m3u",
    "🇲🇨 Monaco": "https://iptv-org.github.io/iptv/countries/mc.m3u",
    "Mongolia": "https://iptv-org.github.io/iptv/countries/mn.m3u",
    "🇲🇳 Mongolia": "https://iptv-org.github.io/iptv/countries/mn.m3u",
    "Montenegro": "https://iptv-org.github.io/iptv/countries/me.m3u",
    "🇲🇪 Montenegro": "https://iptv-org.github.io/iptv/countries/me.m3u",
    "Morocco": "https://iptv-org.github.io/iptv/countries/ma.m3u",
    "🇲🇦 Morocco": "https://iptv-org.github.io/iptv/countries/ma.m3u",
    "Mozambique": "https://iptv-org.github.io/iptv/countries/mz.m3u",
    "🇲🇿 Mozambique": "https://iptv-org.github.io/iptv/countries/mz.m3u",
    "Myanmar": "https://iptv-org.github.io/iptv/countries/mm.m3u",
    "🇲🇲 Myanmar": "https://iptv-org.github.io/iptv/countries/mm.m3u",
    "Namibia": "https://iptv-org.github.io/iptv/countries/na.m3u",
    "🇳🇦 Namibia": "https://iptv-org.github.io/iptv/countries/na.m3u",
    "Nepal": "https://iptv-org.github.io/iptv/countries/np.m3u",
    "🇳🇵 Nepal": "https://iptv-org.github.io/iptv/countries/np.m3u",
    "Netherlands": "https://iptv-org.github.io/iptv/countries/nl.m3u",
    "🇳🇱 Netherlands": "https://iptv-org.github.io/iptv/countries/nl.m3u",
    "New Zealand": "https://iptv-org.github.io/iptv/countries/nz.m3u",
    "🇳🇿 New Zealand": "https://iptv-org.github.io/iptv/countries/nz.m3u",
    "Nicaragua": "https://iptv-org.github.io/iptv/countries/ni.m3u",
    "🇳🇮 Nicaragua": "https://iptv-org.github.io/iptv/countries/ni.m3u",
    "Niger": "https://iptv-org.github.io/iptv/countries/ne.m3u",
    "🇳🇪 Niger": "https://iptv-org.github.io/iptv/countries/ne.m3u",
    "Nigeria": "https://iptv-org.github.io/iptv/countries/ng.m3u",
    "🇳🇬 Nigeria": "https://iptv-org.github.io/iptv/countries/ng.m3u",
    "North Korea": "https://iptv-org.github.io/iptv/countries/kp.m3u",
    "🇰🇵 North Korea": "https://iptv-org.github.io/iptv/countries/kp.m3u",
    "North Macedonia": "https://iptv-org.github.io/iptv/countries/mk.m3u",
    "🇲🇰 North Macedonia": "https://iptv-org.github.io/iptv/countries/mk.m3u",
    "Norway": "https://iptv-org.github.io/iptv/countries/no.m3u",
    "🇳🇴 Norway": "https://iptv-org.github.io/iptv/countries/no.m3u",
    "Oman": "https://iptv-org.github.io/iptv/countries/om.m3u",
    "🇴🇲 Oman": "https://iptv-org.github.io/iptv/countries/om.m3u",
    "Pakistan": "https://iptv-org.github.io/iptv/countries/pk.m3u",
    "🇵🇰 Pakistan": "https://iptv-org.github.io/iptv/countries/pk.m3u",
    "Palestine": "https://iptv-org.github.io/iptv/countries/ps.m3u",
    "🇵🇸 Palestine": "https://iptv-org.github.io/iptv/countries/ps.m3u",
    "Panama": "https://iptv-org.github.io/iptv/countries/pa.m3u",
    "🇵🇦 Panama": "https://iptv-org.github.io/iptv/countries/pa.m3u",
    "Papua New Guinea": "https://iptv-org.github.io/iptv/countries/pg.m3u",
    "🇵🇬 Papua New Guinea": "https://iptv-org.github.io/iptv/countries/pg.m3u",
    "Paraguay": "https://iptv-org.github.io/iptv/countries/py.m3u",
    "🇵🇾 Paraguay": "https://iptv-org.github.io/iptv/countries/py.m3u",
    "Peru": "https://iptv-org.github.io/iptv/countries/pe.m3u",
    "🇵🇪 Peru": "https://iptv-org.github.io/iptv/countries/pe.m3u",
    "Philippines": "https://iptv-org.github.io/iptv/countries/ph.m3u",
    "🇵🇭 Philippines": "https://iptv-org.github.io/iptv/countries/ph.m3u",
    "Poland": "https://iptv-org.github.io/iptv/countries/pl.m3u",
    "🇵🇱 Poland": "https://iptv-org.github.io/iptv/countries/pl.m3u",
    "Portugal": "https://iptv-org.github.io/iptv/countries/pt.m3u",
    "🇵🇹 Portugal": "https://iptv-org.github.io/iptv/countries/pt.m3u",
    "Puerto Rico": "https://iptv-org.github.io/iptv/countries/pr.m3u",
    "🇵🇷 Puerto Rico": "https://iptv-org.github.io/iptv/countries/pr.m3u",
    "Qatar": "https://iptv-org.github.io/iptv/countries/qa.m3u",
    "🇶🇦 Qatar": "https://iptv-org.github.io/iptv/countries/qa.m3u",
    "Republic of the Congo": "https://iptv-org.github.io/iptv/countries/cg.m3u",
    "🇨🇬 Republic of the Congo": "https://iptv-org.github.io/iptv/countries/cg.m3u",
    "Reunion": "https://iptv-org.github.io/iptv/countries/re.m3u",
    "🇷🇪 Reunion": "https://iptv-org.github.io/iptv/countries/re.m3u",
    "Romania": "https://iptv-org.github.io/iptv/countries/ro.m3u",
    "🇷🇴 Romania": "https://iptv-org.github.io/iptv/countries/ro.m3u",
    "Russia": "https://iptv-org.github.io/iptv/countries/ru.m3u",
    "🇷🇺 Russia": "https://iptv-org.github.io/iptv/countries/ru.m3u",
    "Rwanda": "https://iptv-org.github.io/iptv/countries/rw.m3u",
    "🇷🇼 Rwanda": "https://iptv-org.github.io/iptv/countries/rw.m3u",
    "Saint Kitts and Nevis": "https://iptv-org.github.io/iptv/countries/kn.m3u",
    "🇰🇳 Saint Kitts and Nevis": "https://iptv-org.github.io/iptv/countries/kn.m3u",
    "Saint Lucia": "https://iptv-org.github.io/iptv/countries/lc.m3u",
    "🇱🇨 Saint Lucia": "https://iptv-org.github.io/iptv/countries/lc.m3u",
    "Samoa": "https://iptv-org.github.io/iptv/countries/ws.m3u",
    "🇼🇸 Samoa": "https://iptv-org.github.io/iptv/countries/ws.m3u",
    "San Marino": "https://iptv-org.github.io/iptv/countries/sm.m3u",
    "🇸🇲 San Marino": "https://iptv-org.github.io/iptv/countries/sm.m3u",
    "Saudi Arabia": "https://iptv-org.github.io/iptv/countries/sa.m3u",
    "🇸🇦 Saudi Arabia": "https://iptv-org.github.io/iptv/countries/sa.m3u",
    "Senegal": "https://iptv-org.github.io/iptv/countries/sn.m3u",
    "🇸🇳 Senegal": "https://iptv-org.github.io/iptv/countries/sn.m3u",
    "Serbia": "https://iptv-org.github.io/iptv/countries/rs.m3u",
    "🇷🇸 Serbia": "https://iptv-org.github.io/iptv/countries/rs.m3u",
    "Singapore": "https://iptv-org.github.io/iptv/countries/sg.m3u",
    "🇸🇬 Singapore": "https://iptv-org.github.io/iptv/countries/sg.m3u",
    "Sint Maarten": "https://iptv-org.github.io/iptv/countries/sx.m3u",
    "🇸🇽 Sint Maarten": "https://iptv-org.github.io/iptv/countries/sx.m3u",
    "Slovakia": "https://iptv-org.github.io/iptv/countries/sk.m3u",
    "🇸🇰 Slovakia": "https://iptv-org.github.io/iptv/countries/sk.m3u",
    "Slovenia": "https://iptv-org.github.io/iptv/countries/si.m3u",
    "🇸🇮 Slovenia": "https://iptv-org.github.io/iptv/countries/si.m3u",
    "Somalia": "https://iptv-org.github.io/iptv/countries/so.m3u",
    "🇸🇴 Somalia": "https://iptv-org.github.io/iptv/countries/so.m3u",
    "South Africa": "https://iptv-org.github.io/iptv/countries/za.m3u",
    "🇿🇦 South Africa": "https://iptv-org.github.io/iptv/countries/za.m3u",
    "South Korea": "https://iptv-org.github.io/iptv/countries/kr.m3u",
    "🇰🇷 South Korea": "https://iptv-org.github.io/iptv/countries/kr.m3u",
    "Spain": "https://iptv-org.github.io/iptv/countries/es.m3u",
    "🇪🇸 Spain": "https://iptv-org.github.io/iptv/countries/es.m3u",
    "Sri Lanka": "https://iptv-org.github.io/iptv/countries/lk.m3u",
    "🇱🇰 Sri Lanka": "https://iptv-org.github.io/iptv/countries/lk.m3u",
    "Sudan": "https://iptv-org.github.io/iptv/countries/sd.m3u",
    "🇸🇩 Sudan": "https://iptv-org.github.io/iptv/countries/sd.m3u",
    "Suriname": "https://iptv-org.github.io/iptv/countries/sr.m3u",
    "🇸🇷 Suriname": "https://iptv-org.github.io/iptv/countries/sr.m3u",
    "Sweden": "https://iptv-org.github.io/iptv/countries/se.m3u",
    "🇸🇪 Sweden": "https://iptv-org.github.io/iptv/countries/se.m3u",
    "Switzerland": "https://iptv-org.github.io/iptv/countries/ch.m3u",
    "🇨🇭 Switzerland": "https://iptv-org.github.io/iptv/countries/ch.m3u",
    "Syria": "https://iptv-org.github.io/iptv/countries/sy.m3u",
    "🇸🇾 Syria": "https://iptv-org.github.io/iptv/countries/sy.m3u",
    "Taiwan": "https://iptv-org.github.io/iptv/countries/tw.m3u",
    "🇹🇼 Taiwan": "https://iptv-org.github.io/iptv/countries/tw.m3u",
    "Tajikistan": "https://iptv-org.github.io/iptv/countries/tj.m3u",
    "🇹🇯 Tajikistan": "https://iptv-org.github.io/iptv/countries/tj.m3u",
    "Tanzania": "https://iptv-org.github.io/iptv/countries/tz.m3u",
    "🇹🇿 Tanzania": "https://iptv-org.github.io/iptv/countries/tz.m3u",
    "Thailand": "https://iptv-org.github.io/iptv/countries/th.m3u",
    "🇹🇭 Thailand": "https://iptv-org.github.io/iptv/countries/th.m3u",
    "Togo": "https://iptv-org.github.io/iptv/countries/tg.m3u",
    "🇹🇬 Togo": "https://iptv-org.github.io/iptv/countries/tg.m3u",
    "Trinidad and Tobago": "https://iptv-org.github.io/iptv/countries/tt.m3u",
    "🇹🇹 Trinidad and Tobago": "https://iptv-org.github.io/iptv/countries/tt.m3u",
    "Tunisia": "https://iptv-org.github.io/iptv/countries/tn.m3u",
    "🇹🇳 Tunisia": "https://iptv-org.github.io/iptv/countries/tn.m3u",
    "Turkiye": "https://iptv-org.github.io/iptv/countries/tr.m3u",
    "🇹🇷 Turkiye": "https://iptv-org.github.io/iptv/countries/tr.m3u",
    "Turkmenistan": "https://iptv-org.github.io/iptv/countries/tm.m3u",
    "🇹🇲 Turkmenistan": "https://iptv-org.github.io/iptv/countries/tm.m3u",
    "U.S. Virgin Islands": "https://iptv-org.github.io/iptv/countries/vi.m3u",
    "🇻🇮 U.S. Virgin Islands": "https://iptv-org.github.io/iptv/countries/vi.m3u",
    "Uganda": "https://iptv-org.github.io/iptv/countries/ug.m3u",
    "🇺🇬 Uganda": "https://iptv-org.github.io/iptv/countries/ug.m3u",
    "Ukraine": "https://iptv-org.github.io/iptv/countries/ua.m3u",
    "🇺🇦 Ukraine": "https://iptv-org.github.io/iptv/countries/ua.m3u",
    "United Arab Emirates": "https://iptv-org.github.io/iptv/countries/ae.m3u",
    "🇦🇪 United Arab Emirates": "https://iptv-org.github.io/iptv/countries/ae.m3u",
    "United Kingdom": "https://iptv-org.github.io/iptv/countries/uk.m3u",
    "🇬🇧 United Kingdom": "https://iptv-org.github.io/iptv/countries/uk.m3u",
    "United States": "https://iptv-org.github.io/iptv/countries/us.m3u",
    "🇺🇸 United States": "https://iptv-org.github.io/iptv/countries/us.m3u",
    "Uruguay": "https://iptv-org.github.io/iptv/countries/uy.m3u",
    "🇺🇾 Uruguay": "https://iptv-org.github.io/iptv/countries/uy.m3u",
    "Uzbekistan": "https://iptv-org.github.io/iptv/countries/uz.m3u",
    "🇺🇿 Uzbekistan": "https://iptv-org.github.io/iptv/countries/uz.m3u",
    "Vatican City": "https://iptv-org.github.io/iptv/countries/va.m3u",
    "🇻🇦 Vatican City": "https://iptv-org.github.io/iptv/countries/va.m3u",
    "Venezuela": "https://iptv-org.github.io/iptv/countries/ve.m3u",
    "🇻🇪 Venezuela": "https://iptv-org.github.io/iptv/countries/ve.m3u",
    "Vietnam": "https://iptv-org.github.io/iptv/countries/vn.m3u",
    "🇻🇳 Vietnam": "https://iptv-org.github.io/iptv/countries/vn.m3u",
    "Western Sahara": "https://iptv-org.github.io/iptv/countries/eh.m3u",
    "🇪🇭 Western Sahara": "https://iptv-org.github.io/iptv/countries/eh.m3u",
    "Yemen": "https://iptv-org.github.io/iptv/countries/ye.m3u",
    "🇾🇪 Yemen": "https://iptv-org.github.io/iptv/countries/ye.m3u",
    "Zimbabwe": "https://iptv-org.github.io/iptv/countries/zw.m3u",
    "🇿🇼 Zimbabwe": "https://iptv-org.github.io/iptv/countries/zw.m3u",
    "🌐 International": "https://iptv-org.github.io/iptv/countries/int.m3u",
    "Undefined": "https://iptv-org.github.io/iptv/countries/undefined.m3u"
  },
  "Регионы": {
    "Africa": "https://iptv-org.github.io/iptv/regions/afr.m3u",
    "Americas": "https://iptv-org.github.io/iptv/regions/amer.m3u",
    "Arab world": "https://iptv-org.github.io/iptv/regions/arab.m3u",
    "Asia": "https://iptv-org.github.io/iptv/regions/asia.m3u",
    "Asia-Pacific": "https://iptv-org.github.io/iptv/regions/apac.m3u",
    "Association of Southeast Asian Nations": "https://iptv-org.github.io/iptv/regions/asean.m3u",
    "Balkan": "https://iptv-org.github.io/iptv/regions/balkan.m3u",
    "Benelux": "https://iptv-org.github.io/iptv/regions/benelux.m3u",
    "Caribbean": "https://iptv-org.github.io/iptv/regions/carib.m3u",
    "Central America": "https://iptv-org.github.io/iptv/regions/cenamer.m3u",
    "Central and Eastern Europe": "https://iptv-org.github.io/iptv/regions/cee.m3u",
    "Central Asia": "https://iptv-org.github.io/iptv/regions/cas.m3u",
    "Central Europe": "https://iptv-org.github.io/iptv/regions/ceu.m3u",
    "Commonwealth of Independent States": "https://iptv-org.github.io/iptv/regions/cis.m3u",
    "East Africa": "https://iptv-org.github.io/iptv/regions/eaf.m3u",
    "East Asia": "https://iptv-org.github.io/iptv/regions/eas.m3u",
    "Europe": "https://iptv-org.github.io/iptv/regions/eur.m3u",
    "Europe, the Middle East and Africa": "https://iptv-org.github.io/iptv/regions/emea.m3u",
    "European Union": "https://iptv-org.github.io/iptv/regions/eu.m3u",
    "Gulf Cooperation Council": "https://iptv-org.github.io/iptv/regions/gcc.m3u",
    "Hispanic America": "https://iptv-org.github.io/iptv/regions/hispam.m3u",
    "Latin America": "https://iptv-org.github.io/iptv/regions/latam.m3u",
    "Latin America and the Caribbean": "https://iptv-org.github.io/iptv/regions/lac.m3u",
    "Maghreb": "https://iptv-org.github.io/iptv/regions/maghreb.m3u",
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
  },
  "Города": {
    "Boston": "https://iptv-org.github.io/iptv/cities/usbos.m3u",
    "Leominster": "https://iptv-org.github.io/iptv/cities/uslmr.m3u",
    "Worcester": "https://iptv-org.github.io/iptv/cities/usorh.m3u",
    "Battle Creek": "https://iptv-org.github.io/iptv/cities/usbtl.m3u",
    "Detroit": "https://iptv-org.github.io/iptv/cities/usdet.m3u",
    "Grand Rapids": "https://iptv-org.github.io/iptv/cities/usgrr.m3u",
    "Lansing": "https://iptv-org.github.io/iptv/cities/uslan.m3u",
    "Traverse City": "https://iptv-org.github.io/iptv/cities/ustvc.m3u",
    "La Plata": "https://iptv-org.github.io/iptv/cities/arlpg.m3u",
    "San Miguel": "https://iptv-org.github.io/iptv/cities/arsmg.m3u",
    "San Pedro": "https://iptv-org.github.io/iptv/cities/arsnp.m3u",
    "Santa Teresita": "https://iptv-org.github.io/iptv/cities/arsst.m3u",
    "Tres Arroyos": "https://iptv-org.github.io/iptv/cities/aroyo.m3u",
    "San Fernando del Valle de Catamarca": "https://iptv-org.github.io/iptv/cities/arsfv.m3u",
    "Resistencia": "https://iptv-org.github.io/iptv/cities/arres.m3u",
    "Trelew": "https://iptv-org.github.io/iptv/cities/arrel.m3u",
    "Buenos Aires": "https://iptv-org.github.io/iptv/cities/arbue.m3u",
    "Villa María": "https://iptv-org.github.io/iptv/cities/arvmr.m3u",
    "Corrientes": "https://iptv-org.github.io/iptv/cities/arcnq.m3u",
    "Formosa": "https://iptv-org.github.io/iptv/cities/arfma.m3u",
    "San Salvador de Jujuy": "https://iptv-org.github.io/iptv/cities/arssj.m3u",
    "Santa Rosa": "https://iptv-org.github.io/iptv/cities/arrsa.m3u",
    "Posadas": "https://iptv-org.github.io/iptv/cities/arpss.m3u",
    "Neuquén": "https://iptv-org.github.io/iptv/cities/arnqn.m3u",
    "Salta": "https://iptv-org.github.io/iptv/cities/arsla.m3u",
    "Caucete": "https://iptv-org.github.io/iptv/cities/arcue.m3u",
    "San Juan": "https://iptv-org.github.io/iptv/cities/aruaq.m3u",
    "Las Heras": "https://iptv-org.github.io/iptv/cities/arlhs.m3u",
    "Pico Truncado": "https://iptv-org.github.io/iptv/cities/arjpt.m3u",
    "Santa Fe": "https://iptv-org.github.io/iptv/cities/arsfn.m3u",
    "Venado Tuerto": "https://iptv-org.github.io/iptv/cities/arvnt.m3u",
    "Santiago del Estero": "https://iptv-org.github.io/iptv/cities/arsde.m3u",
    "San Miguel de Tucumán": "https://iptv-org.github.io/iptv/cities/arsmc.m3u",
    "Sydney": "https://iptv-org.github.io/iptv/cities/ausyd.m3u",
    "Klagenfurt": "https://iptv-org.github.io/iptv/cities/atklu.m3u",
    "Graz": "https://iptv-org.github.io/iptv/cities/atgrz.m3u",
    "Innsbruck": "https://iptv-org.github.io/iptv/cities/atinn.m3u",
    "Cochabamba": "https://iptv-org.github.io/iptv/cities/bocbb.m3u",
    "Oruro": "https://iptv-org.github.io/iptv/cities/booru.m3u",
    "Santa Cruz de la Sierra": "https://iptv-org.github.io/iptv/cities/boscs.m3u",
    "Maceió": "https://iptv-org.github.io/iptv/cities/brmcz.m3u",
    "Brasília": "https://iptv-org.github.io/iptv/cities/brbsb.m3u",
    "Cachoeiro de Itapemirim": "https://iptv-org.github.io/iptv/cities/brcdi.m3u",
    "Colatina": "https://iptv-org.github.io/iptv/cities/brctn.m3u",
    "São Mateus": "https://iptv-org.github.io/iptv/cities/brsms.m3u",
    "Caldas Novas": "https://iptv-org.github.io/iptv/cities/brclv.m3u",
    "Caxias": "https://iptv-org.github.io/iptv/cities/brcxs.m3u",
    "Cuiabá": "https://iptv-org.github.io/iptv/cities/brcba.m3u",
    "Tangará da Serra": "https://iptv-org.github.io/iptv/cities/brtse.m3u",
    "Poços de Caldas": "https://iptv-org.github.io/iptv/cities/brpoo.m3u",
    "São Sebastião do Paraíso": "https://iptv-org.github.io/iptv/cities/brssp.m3u",
    "Uberlândia": "https://iptv-org.github.io/iptv/cities/brudi.m3u",
    "Viçosa": "https://iptv-org.github.io/iptv/cities/brvis.m3u",
    "Castanhal": "https://iptv-org.github.io/iptv/cities/brcas.m3u",
    "João Pessoa": "https://iptv-org.github.io/iptv/cities/brjpa.m3u",
    "Curitiba": "https://iptv-org.github.io/iptv/cities/brcwb.m3u",
    "Surubim": "https://iptv-org.github.io/iptv/cities/brsrb.m3u",
    "Cabo Frio": "https://iptv-org.github.io/iptv/cities/brcfo.m3u",
    "Maricá": "https://iptv-org.github.io/iptv/cities/brmrc.m3u",
    "Nova Friburgo": "https://iptv-org.github.io/iptv/cities/brnfu.m3u",
    "Natal": "https://iptv-org.github.io/iptv/cities/brnat.m3u",
    "Passo Fundo": "https://iptv-org.github.io/iptv/cities/brpfo.m3u",
    "Porto Alegre": "https://iptv-org.github.io/iptv/cities/brpoa.m3u",
    "Balneário Camboriú": "https://iptv-org.github.io/iptv/cities/brbac.m3u",
    "Joinville": "https://iptv-org.github.io/iptv/cities/brjoi.m3u",
    "São José": "https://iptv-org.github.io/iptv/cities/brsje.m3u",
    "Araçatuba": "https://iptv-org.github.io/iptv/cities/braru.m3u",
    "Guarulhos": "https://iptv-org.github.io/iptv/cities/brgus.m3u",
    "Itapetininga": "https://iptv-org.github.io/iptv/cities/briig.m3u",
    "Jundiaí": "https://iptv-org.github.io/iptv/cities/brjun.m3u",
    "Santos": "https://iptv-org.github.io/iptv/cities/brssz.m3u",
    "Sao Paulo": "https://iptv-org.github.io/iptv/cities/brsao.m3u",
    "Sertãozinho": "https://iptv-org.github.io/iptv/cities/brszo.m3u",
    "Calgary": "https://iptv-org.github.io/iptv/cities/cacal.m3u",
    "Edmonton": "https://iptv-org.github.io/iptv/cities/caedm.m3u",
    "Langley": "https://iptv-org.github.io/iptv/cities/calng.m3u",
    "Vancouver": "https://iptv-org.github.io/iptv/cities/cavan.m3u",
    "Victoria": "https://iptv-org.github.io/iptv/cities/cavic.m3u",
    "Neepawa": "https://iptv-org.github.io/iptv/cities/canee.m3u",
    "Winnipeg": "https://iptv-org.github.io/iptv/cities/cawnp.m3u",
    "Fredericton": "https://iptv-org.github.io/iptv/cities/cafre.m3u",
    "Moncton": "https://iptv-org.github.io/iptv/cities/camnt.m3u",
    "St. John's": "https://iptv-org.github.io/iptv/cities/casjf.m3u",
    "Yellowknife": "https://iptv-org.github.io/iptv/cities/cayzf.m3u",
    "Halifax": "https://iptv-org.github.io/iptv/cities/cahal.m3u",
    "Iqaluit": "https://iptv-org.github.io/iptv/cities/caiql.m3u",
    "Ottawa": "https://iptv-org.github.io/iptv/cities/caott.m3u",
    "Toronto": "https://iptv-org.github.io/iptv/cities/cator.m3u",
    "Windsor": "https://iptv-org.github.io/iptv/cities/cawnd.m3u",
    "Charlottetown": "https://iptv-org.github.io/iptv/cities/cacha.m3u",
    "Montréal": "https://iptv-org.github.io/iptv/cities/camtr.m3u",
    "Québec": "https://iptv-org.github.io/iptv/cities/caque.m3u",
    "Rimouski": "https://iptv-org.github.io/iptv/cities/carim.m3u",
    "Saguenay": "https://iptv-org.github.io/iptv/cities/casag.m3u",
    "Sherbrooke": "https://iptv-org.github.io/iptv/cities/casbr.m3u",
    "Témiscaming": "https://iptv-org.github.io/iptv/cities/catcg.m3u",
    "Trois-Rivières": "https://iptv-org.github.io/iptv/cities/catrr.m3u",
    "Regina": "https://iptv-org.github.io/iptv/cities/careg.m3u",
    "Pichilemu": "https://iptv-org.github.io/iptv/cities/clplm.m3u",
    "Barranquilla": "https://iptv-org.github.io/iptv/cities/cobaq.m3u",
    "San Jacinto": "https://iptv-org.github.io/iptv/cities/cosjc.m3u",
    "Manizales": "https://iptv-org.github.io/iptv/cities/comzl.m3u",
    "Neiva": "https://iptv-org.github.io/iptv/cities/conva.m3u",
    "Pasto": "https://iptv-org.github.io/iptv/cities/copso.m3u",
    "San Andrés": "https://iptv-org.github.io/iptv/cities/cosac.m3u",
    "Cali": "https://iptv-org.github.io/iptv/cities/coclo.m3u",
    "San Vito": "https://iptv-org.github.io/iptv/cities/crtoo.m3u",
    "San Marcos de Tarrazú": "https://iptv-org.github.io/iptv/cities/crmtz.m3u",
    "Higuey": "https://iptv-org.github.io/iptv/cities/dohig.m3u",
    "Constanza": "https://iptv-org.github.io/iptv/cities/dolvc.m3u",
    "Bonao": "https://iptv-org.github.io/iptv/cities/dobno.m3u",
    "Puerto Plata": "https://iptv-org.github.io/iptv/cities/dopop.m3u",
    "Santiago de los Caballeros": "https://iptv-org.github.io/iptv/cities/dosti.m3u",
    "Cuenca": "https://iptv-org.github.io/iptv/cities/eccue.m3u",
    "Loja": "https://iptv-org.github.io/iptv/cities/ecloh.m3u",
    "Kyyjärvi": "https://iptv-org.github.io/iptv/cities/fikyy.m3u",
    "Abkhazia": "https://iptv-org.github.io/iptv/subdivisions/ge-ab.m3u",
    "Athens": "https://iptv-org.github.io/iptv/cities/grath.m3u",
    "Kozáni": "https://iptv-org.github.io/iptv/cities/grkzi.m3u",
    "Árta": "https://iptv-org.github.io/iptv/cities/grart.m3u",
    "Ioánnina": "https://iptv-org.github.io/iptv/cities/grioa.m3u",
    "Giannitsá": "https://iptv-org.github.io/iptv/cities/grgak.m3u",
    "Thessaloníki": "https://iptv-org.github.io/iptv/cities/grskg.m3u",
    "Lamía": "https://iptv-org.github.io/iptv/cities/grlam.m3u",
    "Lárisa": "https://iptv-org.github.io/iptv/cities/grlra.m3u",
    "Puerto Barrios": "https://iptv-org.github.io/iptv/cities/gtpbr.m3u",
    "Barberena": "https://iptv-org.github.io/iptv/cities/gtbab.m3u",
    "Sololá": "https://iptv-org.github.io/iptv/cities/gtsol.m3u",
    "Serang": "https://iptv-org.github.io/iptv/cities/idser.m3u",
    "Jakarta": "https://iptv-org.github.io/iptv/cities/idjkt.m3u",
    "Sumedang": "https://iptv-org.github.io/iptv/cities/id5su.m3u",
    "Tasikmalaya": "https://iptv-org.github.io/iptv/cities/idtsy.m3u",
    "Purwokerto": "https://iptv-org.github.io/iptv/cities/idpwl.m3u",
    "Semarang": "https://iptv-org.github.io/iptv/cities/idsrg.m3u",
    "Surakarta": "https://iptv-org.github.io/iptv/cities/idskt.m3u",
    "Kediri": "https://iptv-org.github.io/iptv/cities/idkdr.m3u",
    "Madiun": "https://iptv-org.github.io/iptv/cities/idmdi.m3u",
    "Malang": "https://iptv-org.github.io/iptv/cities/idmlg.m3u",
    "Surabaya": "https://iptv-org.github.io/iptv/cities/idsub.m3u",
    "Tulungagung": "https://iptv-org.github.io/iptv/cities/idtlu.m3u",
    "Banjarmasin": "https://iptv-org.github.io/iptv/cities/idbdj.m3u",
    "Balikpapan": "https://iptv-org.github.io/iptv/cities/idbpn.m3u",
    "Bandar Lampung": "https://iptv-org.github.io/iptv/cities/idtkg.m3u",
    "Makassar": "https://iptv-org.github.io/iptv/cities/idmak.m3u",
    "Manado": "https://iptv-org.github.io/iptv/cities/idmdc.m3u",
    "Padang": "https://iptv-org.github.io/iptv/cities/idpdg.m3u",
    "Yogyakarta": "https://iptv-org.github.io/iptv/cities/idjog.m3u",
    "Tokyo": "https://iptv-org.github.io/iptv/cities/jptyo.m3u",
    "Ulcinj": "https://iptv-org.github.io/iptv/cities/meulc.m3u",
    "Tijuana": "https://iptv-org.github.io/iptv/cities/mxtij.m3u",
    "Ciudad Juárez": "https://iptv-org.github.io/iptv/cities/mxcjs.m3u",
    "Sabinas": "https://iptv-org.github.io/iptv/cities/mxsbn.m3u",
    "Cuernavaca": "https://iptv-org.github.io/iptv/cities/mxcvc.m3u",
    "Santiago de Querétaro": "https://iptv-org.github.io/iptv/cities/mxsqe.m3u",
    "Cancún": "https://iptv-org.github.io/iptv/cities/mxcun.m3u",
    "Mérida": "https://iptv-org.github.io/iptv/cities/mxmid.m3u",
    "Encarnacion": "https://iptv-org.github.io/iptv/cities/pyeno.m3u",
    "Arequipa": "https://iptv-org.github.io/iptv/cities/peaqp.m3u",
    "Satipo": "https://iptv-org.github.io/iptv/cities/pesip.m3u",
    "Lima": "https://iptv-org.github.io/iptv/cities/pelim.m3u",
    "Yurimaguas": "https://iptv-org.github.io/iptv/cities/peyms.m3u",
    "Brazzaville": "https://iptv-org.github.io/iptv/cities/cgbzv.m3u",
    "Krasnodar": "https://iptv-org.github.io/iptv/cities/rukrr.m3u",
    "Vladivostok": "https://iptv-org.github.io/iptv/cities/ruvms.m3u",
    "Busan": "https://iptv-org.github.io/iptv/cities/krpus.m3u",
    "Cheongju": "https://iptv-org.github.io/iptv/cities/krcoj.m3u",
    "Daegu": "https://iptv-org.github.io/iptv/cities/krtae.m3u",
    "Daejeon": "https://iptv-org.github.io/iptv/cities/krtjn.m3u",
    "Chuncheon": "https://iptv-org.github.io/iptv/cities/krchc.m3u",
    "Bucheon": "https://iptv-org.github.io/iptv/cities/krbcn.m3u",
    "Andong": "https://iptv-org.github.io/iptv/cities/kradg.m3u",
    "Jeju": "https://iptv-org.github.io/iptv/cities/krcha.m3u",
    "Jeonju": "https://iptv-org.github.io/iptv/cities/krjnj.m3u",
    "Mokpo": "https://iptv-org.github.io/iptv/cities/krmok.m3u",
    "Yeosu": "https://iptv-org.github.io/iptv/cities/kryos.m3u",
    "Ulsan": "https://iptv-org.github.io/iptv/cities/krusn.m3u",
    "Cabrils": "https://iptv-org.github.io/iptv/cities/escbi.m3u",
    "Cardedeu": "https://iptv-org.github.io/iptv/cities/escdd.m3u",
    "Mataró": "https://iptv-org.github.io/iptv/cities/esmto.m3u",
    "Sabadell": "https://iptv-org.github.io/iptv/cities/essbp.m3u",
    "Vic": "https://iptv-org.github.io/iptv/cities/esvic.m3u",
    "Bilbao": "https://iptv-org.github.io/iptv/cities/esbio.m3u",
    "Algeciras": "https://iptv-org.github.io/iptv/cities/esalg.m3u",
    "Córdoba": "https://iptv-org.github.io/iptv/cities/esodb.m3u",
    "Olot": "https://iptv-org.github.io/iptv/cities/esooe.m3u",
    "Palafrugell": "https://iptv-org.github.io/iptv/cities/espfl.m3u",
    "Granada": "https://iptv-org.github.io/iptv/cities/esgrx.m3u",
    "Huelva": "https://iptv-org.github.io/iptv/cities/eshuv.m3u",
    "Jaén": "https://iptv-org.github.io/iptv/cities/esjae.m3u",
    "Logroño": "https://iptv-org.github.io/iptv/cities/eslgr.m3u",
    "Mogán": "https://iptv-org.github.io/iptv/cities/eszih.m3u",
    "Lleida": "https://iptv-org.github.io/iptv/cities/eslle.m3u",
    "Fuengirola": "https://iptv-org.github.io/iptv/cities/esfgl.m3u",
    "Marbella": "https://iptv-org.github.io/iptv/cities/esmqe.m3u",
    "Pamplona": "https://iptv-org.github.io/iptv/cities/espna.m3u",
    "Las Palmas": "https://iptv-org.github.io/iptv/cities/eslpg.m3u",
    "El Vendrell": "https://iptv-org.github.io/iptv/cities/esdre.m3u",
    "Alzira": "https://iptv-org.github.io/iptv/cities/esazj.m3u",
    "Bocairente": "https://iptv-org.github.io/iptv/cities/esboi.m3u",
    "Juneau": "https://iptv-org.github.io/iptv/cities/usjnu.m3u",
    "Bullhead City": "https://iptv-org.github.io/iptv/cities/usifp.m3u",
    "Glendale": "https://iptv-org.github.io/iptv/cities/usgda.m3u",
    "Phoenix": "https://iptv-org.github.io/iptv/cities/usphx.m3u",
    "Scottsdale": "https://iptv-org.github.io/iptv/cities/usstz.m3u",
    "Tucson": "https://iptv-org.github.io/iptv/cities/ustuz.m3u",
    "Yuma": "https://iptv-org.github.io/iptv/cities/usyum.m3u",
    "Fort Smith": "https://iptv-org.github.io/iptv/cities/usfsm.m3u",
    "Little Rock": "https://iptv-org.github.io/iptv/cities/uslit.m3u",
    "Pine Bluff": "https://iptv-org.github.io/iptv/cities/uspbf.m3u",
    "Arroyo Grande": "https://iptv-org.github.io/iptv/cities/usag2.m3u",
    "Bakersfield": "https://iptv-org.github.io/iptv/cities/usbfl.m3u",
    "Banning": "https://iptv-org.github.io/iptv/cities/usbng.m3u",
    "Beverly Hills": "https://iptv-org.github.io/iptv/cities/usbvh.m3u",
    "Buena Park": "https://iptv-org.github.io/iptv/cities/usbun.m3u",
    "Burbank": "https://iptv-org.github.io/iptv/cities/usbur.m3u",
    "Calabasas": "https://iptv-org.github.io/iptv/cities/uslbj.m3u",
    "Carlsbad": "https://iptv-org.github.io/iptv/cities/uscld.m3u",
    "Ceres": "https://iptv-org.github.io/iptv/cities/uscrz.m3u",
    "Cerritos": "https://iptv-org.github.io/iptv/cities/uscek.m3u",
    "Chatsworth": "https://iptv-org.github.io/iptv/cities/uscwh.m3u",
    "Chino Hills": "https://iptv-org.github.io/iptv/cities/usch3.m3u",
    "Concord": "https://iptv-org.github.io/iptv/cities/usccr.m3u",
    "Costa Mesa": "https://iptv-org.github.io/iptv/cities/usczm.m3u",
    "Cupertino": "https://iptv-org.github.io/iptv/cities/uscuo.m3u",
    "Cypress": "https://iptv-org.github.io/iptv/cities/uscyq.m3u",
    "Del Mar": "https://iptv-org.github.io/iptv/cities/usdma.m3u",
    "El Segundo": "https://iptv-org.github.io/iptv/cities/usels.m3u",
    "Encinitas": "https://iptv-org.github.io/iptv/cities/usxfe.m3u",
    "Eureka": "https://iptv-org.github.io/iptv/cities/useka.m3u",
    "Fairfield": "https://iptv-org.github.io/iptv/cities/ussuu.m3u",
    "Fontana": "https://iptv-org.github.io/iptv/cities/usxfr.m3u",
    "Fort Bragg": "https://iptv-org.github.io/iptv/cities/usfob.m3u",
    "Fresno": "https://iptv-org.github.io/iptv/cities/usfat.m3u",
    "Gilroy": "https://iptv-org.github.io/iptv/cities/usgir.m3u",
    "Glendale": "https://iptv-org.github.io/iptv/cities/usjgx.m3u",
    "Huntington Beach": "https://iptv-org.github.io/iptv/cities/ushtd.m3u",
    "Irvine": "https://iptv-org.github.io/iptv/cities/usivn.m3u",
    "Lakewood": "https://iptv-org.github.io/iptv/cities/uslqq.m3u",
    "Lawndale": "https://iptv-org.github.io/iptv/cities/uslwj.m3u",
    "Lompoc": "https://iptv-org.github.io/iptv/cities/uslpc.m3u",
    "Long Beach": "https://iptv-org.github.io/iptv/cities/uslgb.m3u",
    "Los Angeles": "https://iptv-org.github.io/iptv/cities/uslax.m3u",
    "Los Gatos": "https://iptv-org.github.io/iptv/cities/uslxx.m3u",
    "Lucerne Valley": "https://iptv-org.github.io/iptv/cities/uslcb.m3u",
    "Millbrae": "https://iptv-org.github.io/iptv/cities/usmba.m3u",
    "Monterey": "https://iptv-org.github.io/iptv/cities/usmy3.m3u",
    "Moorpark": "https://iptv-org.github.io/iptv/cities/usmqk.m3u",
    "Morro Bay": "https://iptv-org.github.io/iptv/cities/usmjk.m3u",
    "Nevada City": "https://iptv-org.github.io/iptv/cities/usnfc.m3u",
    "Newport Beach": "https://iptv-org.github.io/iptv/cities/usjnp.m3u",
    "Oakland": "https://iptv-org.github.io/iptv/cities/usoak.m3u",
    "Oceanside": "https://iptv-org.github.io/iptv/cities/usocn.m3u",
    "Ontario": "https://iptv-org.github.io/iptv/cities/usont.m3u",
    "Orange": "https://iptv-org.github.io/iptv/cities/usjor.m3u",
    "Pacifica": "https://iptv-org.github.io/iptv/cities/uspfq.m3u",
    "Palm Springs": "https://iptv-org.github.io/iptv/cities/uspsp.m3u",
    "Palo Alto": "https://iptv-org.github.io/iptv/cities/uspao.m3u",
    "Pinole": "https://iptv-org.github.io/iptv/cities/usp2c.m3u",
    "Placentia": "https://iptv-org.github.io/iptv/cities/uspcc.m3u",
    "Pomona": "https://iptv-org.github.io/iptv/cities/uspqc.m3u",
    "Rancho Cucamonga": "https://iptv-org.github.io/iptv/cities/usrcu.m3u",
    "Riverside": "https://iptv-org.github.io/iptv/cities/usral.m3u",
    "Sacramento": "https://iptv-org.github.io/iptv/cities/ussac.m3u",
    "San Bernardino": "https://iptv-org.github.io/iptv/cities/ussbt.m3u",
    "San Diego": "https://iptv-org.github.io/iptv/cities/ussan.m3u",
    "San Francisco": "https://iptv-org.github.io/iptv/cities/ussfo.m3u",
    "San Jose": "https://iptv-org.github.io/iptv/cities/ussjc.m3u",
    "San Luis Obispo": "https://iptv-org.github.io/iptv/cities/uscsl.m3u",
    "San Rafael": "https://iptv-org.github.io/iptv/cities/ussrf.m3u",
    "Santa Clara": "https://iptv-org.github.io/iptv/cities/usscz.m3u",
    "Santa Cruz": "https://iptv-org.github.io/iptv/cities/ussru.m3u",
    "Santa Maria": "https://iptv-org.github.io/iptv/cities/ussmx.m3u",
    "Santa Monica": "https://iptv-org.github.io/iptv/cities/ussmo.m3u",
    "Seaside": "https://iptv-org.github.io/iptv/cities/usxlu.m3u",
    "Sherman Oaks": "https://iptv-org.github.io/iptv/cities/ussjj.m3u",
    "Sonora": "https://iptv-org.github.io/iptv/cities/ussor.m3u",
    "Stockton": "https://iptv-org.github.io/iptv/cities/ussck.m3u",
    "Temecula": "https://iptv-org.github.io/iptv/cities/ustmc.m3u",
    "Torrance": "https://iptv-org.github.io/iptv/cities/ustoa.m3u",
    "Tracy": "https://iptv-org.github.io/iptv/cities/ustrc.m3u",
    "Vacaville": "https://iptv-org.github.io/iptv/cities/usvcx.m3u",
    "Vallejo": "https://iptv-org.github.io/iptv/cities/usvlo.m3u",
    "Ventura": "https://iptv-org.github.io/iptv/cities/usvnt.m3u",
    "West Hollywood": "https://iptv-org.github.io/iptv/cities/uswwu.m3u",
    "Westminster": "https://iptv-org.github.io/iptv/cities/uswmz.m3u",
    "Whittier": "https://iptv-org.github.io/iptv/cities/uswhr.m3u",
    "Aurora": "https://iptv-org.github.io/iptv/cities/usauc.m3u",
    "Brighton": "https://iptv-org.github.io/iptv/cities/usbgk.m3u",
    "Colorado Springs": "https://iptv-org.github.io/iptv/cities/uscos.m3u",
    "Denver": "https://iptv-org.github.io/iptv/cities/usden.m3u",
    "Fort Collins": "https://iptv-org.github.io/iptv/cities/usfnl.m3u",
    "Golden": "https://iptv-org.github.io/iptv/cities/usgoe.m3u",
    "Lakewood": "https://iptv-org.github.io/iptv/cities/usljk.m3u",
    "Littleton": "https://iptv-org.github.io/iptv/cities/uslto.m3u",
    "Loveland": "https://iptv-org.github.io/iptv/cities/uslov.m3u",
    "Rifle": "https://iptv-org.github.io/iptv/cities/usril.m3u",
    "Thornton": "https://iptv-org.github.io/iptv/cities/ustht.m3u",
    "Bloomfield": "https://iptv-org.github.io/iptv/cities/usaac.m3u",
    "Bolton": "https://iptv-org.github.io/iptv/cities/usbl8.m3u",
    "Bridgeport": "https://iptv-org.github.io/iptv/cities/usbdr.m3u",
    "Clinton": "https://iptv-org.github.io/iptv/cities/usclb.m3u",
    "Enfield": "https://iptv-org.github.io/iptv/cities/usenf.m3u",
    "Higganum": "https://iptv-org.github.io/iptv/cities/ushig.m3u",
    "New Canaan": "https://iptv-org.github.io/iptv/cities/usnwc.m3u",
    "Orange": "https://iptv-org.github.io/iptv/cities/usorb.m3u",
    "Rocky Hill": "https://iptv-org.github.io/iptv/cities/usrok.m3u",
    "Wolcott": "https://iptv-org.github.io/iptv/cities/usxwo.m3u",
    "Georgetown": "https://iptv-org.github.io/iptv/cities/usged.m3u",
    "Wilmington": "https://iptv-org.github.io/iptv/cities/usilg.m3u",
    "Washington": "https://iptv-org.github.io/iptv/cities/uswas.m3u",
    "Bradenton": "https://iptv-org.github.io/iptv/cities/usbbi.m3u",
    "Cape Coral": "https://iptv-org.github.io/iptv/cities/uscc2.m3u",
    "Coral Gables": "https://iptv-org.github.io/iptv/cities/uscgb.m3u",
    "Daytona Beach": "https://iptv-org.github.io/iptv/cities/usdab.m3u",
    "Fernandina Beach": "https://iptv-org.github.io/iptv/cities/usfeb.m3u",
    "Fort Lauderdale": "https://iptv-org.github.io/iptv/cities/usfll.m3u",
    "Fort Myers": "https://iptv-org.github.io/iptv/cities/usfmy.m3u",
    "Fort Pierce": "https://iptv-org.github.io/iptv/cities/usfpr.m3u",
    "Gainesville": "https://iptv-org.github.io/iptv/cities/usgnv.m3u",
    "Jacksonville": "https://iptv-org.github.io/iptv/cities/usjax.m3u",
    "Key West": "https://iptv-org.github.io/iptv/cities/useyw.m3u",
    "Kissimmee": "https://iptv-org.github.io/iptv/cities/usism.m3u",
    "Lakeland": "https://iptv-org.github.io/iptv/cities/uslal.m3u",
    "Leesburg": "https://iptv-org.github.io/iptv/cities/uslee.m3u",
    "Miami": "https://iptv-org.github.io/iptv/cities/usmia.m3u",
    "Miami Beach": "https://iptv-org.github.io/iptv/cities/usiyh.m3u",
    "Naples": "https://iptv-org.github.io/iptv/cities/usapf.m3u",
    "New Port Richey": "https://iptv-org.github.io/iptv/cities/usnrh.m3u",
    "North Miami Beach": "https://iptv-org.github.io/iptv/cities/uszgv.m3u",
    "Orlando": "https://iptv-org.github.io/iptv/cities/usorl.m3u",
    "Pompano Beach": "https://iptv-org.github.io/iptv/cities/usppm.m3u",
    "Sanford": "https://iptv-org.github.io/iptv/cities/ussfb.m3u",
    "Tallahassee": "https://iptv-org.github.io/iptv/cities/ustlh.m3u",
    "Tampa": "https://iptv-org.github.io/iptv/cities/ustpa.m3u",
    "West Palm Beach": "https://iptv-org.github.io/iptv/cities/uspbi.m3u",
    "Athens": "https://iptv-org.github.io/iptv/cities/usahn.m3u",
    "Atlanta": "https://iptv-org.github.io/iptv/cities/usatl.m3u",
    "Cleveland": "https://iptv-org.github.io/iptv/cities/uscqv.m3u",
    "Duluth": "https://iptv-org.github.io/iptv/cities/usdga.m3u",
    "Kingsland": "https://iptv-org.github.io/iptv/cities/usknl.m3u",
    "Macon": "https://iptv-org.github.io/iptv/cities/usmcn.m3u",
    "Monroe": "https://iptv-org.github.io/iptv/cities/usmoe.m3u",
    "Savannah": "https://iptv-org.github.io/iptv/cities/ussav.m3u",
    "Honolulu": "https://iptv-org.github.io/iptv/cities/ushnl.m3u",
    "Kahului": "https://iptv-org.github.io/iptv/cities/usogg.m3u",
    "Nampa": "https://iptv-org.github.io/iptv/cities/usnpa.m3u",
    "Champaign": "https://iptv-org.github.io/iptv/cities/uscmi.m3u",
    "Chicago": "https://iptv-org.github.io/iptv/cities/uschi.m3u",
    "West Frankfort": "https://iptv-org.github.io/iptv/cities/uskft.m3u",
    "Indianapolis": "https://iptv-org.github.io/iptv/cities/usind.m3u",
    "Michigan City": "https://iptv-org.github.io/iptv/cities/usmgc.m3u",
    "Des Moines": "https://iptv-org.github.io/iptv/cities/usdsm.m3u",
    "Ottumwa": "https://iptv-org.github.io/iptv/cities/usotm.m3u",
    "Sioux City": "https://iptv-org.github.io/iptv/cities/ussux.m3u",
    "Lawrence": "https://iptv-org.github.io/iptv/cities/uslwc.m3u",
    "Wichita": "https://iptv-org.github.io/iptv/cities/usict.m3u",
    "Lexington": "https://iptv-org.github.io/iptv/cities/uslex.m3u",
    "Louisville": "https://iptv-org.github.io/iptv/cities/uslui.m3u",
    "Baton Rouge": "https://iptv-org.github.io/iptv/cities/usbtr.m3u",
    "Hammond": "https://iptv-org.github.io/iptv/cities/ushlo.m3u",
    "Lafayette": "https://iptv-org.github.io/iptv/cities/uslft.m3u",
    "New Orleans": "https://iptv-org.github.io/iptv/cities/usmsy.m3u",
    "Auburn": "https://iptv-org.github.io/iptv/cities/usaue.m3u",
    "Annapolis": "https://iptv-org.github.io/iptv/cities/usanp.m3u",
    "Baltimore": "https://iptv-org.github.io/iptv/cities/usbal.m3u",
    "Salisbury": "https://iptv-org.github.io/iptv/cities/ussby.m3u",
    "Belmont": "https://iptv-org.github.io/iptv/cities/usjgt.m3u",
    "Apple Valley": "https://iptv-org.github.io/iptv/cities/usyaw.m3u",
    "Maple Grove": "https://iptv-org.github.io/iptv/cities/usxmg.m3u",
    "Minneapolis": "https://iptv-org.github.io/iptv/cities/usmes.m3u",
    "Columbus": "https://iptv-org.github.io/iptv/cities/usubs.m3u",
    "Gulfport": "https://iptv-org.github.io/iptv/cities/usgpt.m3u",
    "Jackson": "https://iptv-org.github.io/iptv/cities/usjan.m3u",
    "Cape Girardeau": "https://iptv-org.github.io/iptv/cities/uscgi.m3u",
    "Columbia": "https://iptv-org.github.io/iptv/cities/uscou.m3u",
    "Jefferson City": "https://iptv-org.github.io/iptv/cities/usjef.m3u",
    "Kansas City": "https://iptv-org.github.io/iptv/cities/usmkc.m3u",
    "Sedalia": "https://iptv-org.github.io/iptv/cities/usdmo.m3u",
    "Billings": "https://iptv-org.github.io/iptv/cities/usbil.m3u",
    "Bozeman": "https://iptv-org.github.io/iptv/cities/usbzn.m3u",
    "Great Falls": "https://iptv-org.github.io/iptv/cities/usgtf.m3u",
    "Helena": "https://iptv-org.github.io/iptv/cities/ushln.m3u",
    "Missoula": "https://iptv-org.github.io/iptv/cities/usmso.m3u",
    "Lincoln": "https://iptv-org.github.io/iptv/cities/uslnk.m3u",
    "Omaha": "https://iptv-org.github.io/iptv/cities/usoma.m3u",
    "Las Vegas": "https://iptv-org.github.io/iptv/cities/uslas.m3u",
    "Derry": "https://iptv-org.github.io/iptv/cities/usdnp.m3u",
    "Manchester": "https://iptv-org.github.io/iptv/cities/usmht.m3u",
    "Nashua": "https://iptv-org.github.io/iptv/cities/usash.m3u",
    "Teterboro": "https://iptv-org.github.io/iptv/cities/usteb.m3u",
    "Trenton": "https://iptv-org.github.io/iptv/cities/usttn.m3u",
    "Albuquerque": "https://iptv-org.github.io/iptv/cities/usabq.m3u",
    "Buffalo": "https://iptv-org.github.io/iptv/cities/usbuf.m3u",
    "New York City": "https://iptv-org.github.io/iptv/cities/usnyc.m3u",
    "Charlotte": "https://iptv-org.github.io/iptv/cities/usclt.m3u",
    "Jacksonville": "https://iptv-org.github.io/iptv/cities/usoaj.m3u",
    "Raleigh": "https://iptv-org.github.io/iptv/cities/usrag.m3u",
    "Wilmington": "https://iptv-org.github.io/iptv/cities/usilm.m3u",
    "Winston-Salem": "https://iptv-org.github.io/iptv/cities/usint.m3u",
    "Steele": "https://iptv-org.github.io/iptv/cities/usndz.m3u",
    "Cincinnati": "https://iptv-org.github.io/iptv/cities/uscvg.m3u",
    "Cleveland": "https://iptv-org.github.io/iptv/cities/uscle.m3u",
    "Dayton": "https://iptv-org.github.io/iptv/cities/usday.m3u",
    "Lima": "https://iptv-org.github.io/iptv/cities/uslia.m3u",
    "Toledo": "https://iptv-org.github.io/iptv/cities/ustol.m3u",
    "Oklahoma City": "https://iptv-org.github.io/iptv/cities/usokc.m3u",
    "Tulsa": "https://iptv-org.github.io/iptv/cities/ustul.m3u",
    "Coos Bay": "https://iptv-org.github.io/iptv/cities/uscob.m3u",
    "Allentown": "https://iptv-org.github.io/iptv/cities/usawn.m3u",
    "Lancaster": "https://iptv-org.github.io/iptv/cities/uslns.m3u",
    "Philadelphia": "https://iptv-org.github.io/iptv/cities/usphl.m3u",
    "Pittsburgh": "https://iptv-org.github.io/iptv/cities/uspit.m3u",
    "West Chester": "https://iptv-org.github.io/iptv/cities/uswct.m3u",
    "Cranston": "https://iptv-org.github.io/iptv/cities/uscqh.m3u",
    "Columbia": "https://iptv-org.github.io/iptv/cities/uscae.m3u",
    "Greenville": "https://iptv-org.github.io/iptv/cities/usgv9.m3u",
    "Chattanooga": "https://iptv-org.github.io/iptv/cities/uscha.m3u",
    "Jackson": "https://iptv-org.github.io/iptv/cities/usmkl.m3u",
    "Memphis": "https://iptv-org.github.io/iptv/cities/usmem.m3u",
    "Nashville": "https://iptv-org.github.io/iptv/cities/usbna.m3u",
    "Austin": "https://iptv-org.github.io/iptv/cities/usaus.m3u",
    "Corpus Christi": "https://iptv-org.github.io/iptv/cities/uscrp.m3u",
    "Dallas": "https://iptv-org.github.io/iptv/cities/usdal.m3u",
    "El Paso": "https://iptv-org.github.io/iptv/cities/uselp.m3u",
    "Fort Worth": "https://iptv-org.github.io/iptv/cities/usfwt.m3u",
    "Fredericksburg": "https://iptv-org.github.io/iptv/cities/usfxg.m3u",
    "Galveston": "https://iptv-org.github.io/iptv/cities/usgls.m3u",
    "Houston": "https://iptv-org.github.io/iptv/cities/ushou.m3u",
    "San Angelo": "https://iptv-org.github.io/iptv/cities/ussjt.m3u",
    "Snyder": "https://iptv-org.github.io/iptv/cities/ussnk.m3u",
    "Waco": "https://iptv-org.github.io/iptv/cities/usact.m3u",
    "Weslaco": "https://iptv-org.github.io/iptv/cities/uswko.m3u",
    "Salt Lake City": "https://iptv-org.github.io/iptv/cities/usslc.m3u",
    "Harrisonburg": "https://iptv-org.github.io/iptv/cities/ushbv.m3u",
    "Norfolk": "https://iptv-org.github.io/iptv/cities/usorf.m3u",
    "Richmond": "https://iptv-org.github.io/iptv/cities/usric.m3u",
    "Roanoke": "https://iptv-org.github.io/iptv/cities/usroa.m3u",
    "Seattle": "https://iptv-org.github.io/iptv/cities/ussea.m3u",
    "Tacoma": "https://iptv-org.github.io/iptv/cities/ustiw.m3u",
    "Green Bay": "https://iptv-org.github.io/iptv/cities/usgrb.m3u",
    "Milwaukee": "https://iptv-org.github.io/iptv/cities/usmke.m3u",
    "Maracay": "https://iptv-org.github.io/iptv/cities/vemyc.m3u"
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
        currentMainCategory = 'Категории';
        const firstSub = Object.keys(categoryTree['Категории'])[0];
        currentSubcategory = firstSub || '';
        
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
        showToast("Ошибка приложения");
    }
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
        
        btn.addEventListener('click', () => {
            selectMainCategory(cat, index);
        });
        
        // Обработка Enter и Пробела
        btn.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click(); // Явно вызываем click
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
        
        btn.addEventListener('click', () => {
            selectSubcategory(subcat, index);
        });
        
        // Обработка Enter и Пробела
        btn.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click(); // Явно вызываем click
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
    
    // Фокус на кнопку
    setTimeout(() => {
        const buttons = mainCategoriesPanel.querySelectorAll('.category-btn');
        if (buttons[index]) {
            buttons[index].focus();
        }
    }, 100);
}

// Выбор подкатегории
function selectSubcategory(subcategoryName, index) {
    currentSubcategory = subcategoryName;
    currentSubCategoryIndex = index;
    loadAndRenderChannels(currentMainCategory, currentSubcategory);
    
    // Фокус на канал
    setTimeout(() => {
        const firstChannel = document.querySelector('.channel-card');
        if (firstChannel) firstChannel.focus();
    }, 100);
}

// Обновить активную кнопку в главном меню
function updateMainCategoryActive() {
    const buttons = mainCategoriesPanel.querySelectorAll('.category-btn');
    buttons.forEach((btn, i) => {
        if (i === currentMainCategoryIndex) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Обновить активную кнопку в подменю
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

// Остальные функции без изменений

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

// Перемещение фокуса
function moveFocus(direction) {
    if (navigationState === 'channels') {
        const channelCards = document.querySelectorAll('.channel-card');
        if (channelCards.length === 0) return;
        
        const currentIndex = Array.from(channelCards).indexOf(document.activeElement);
        let nextIndex = currentIndex;
        
        const cols = Math.floor(channelsContainer.offsetWidth / 280) || 1;
        
        switch(direction) {
            case 'right':
                nextIndex = (currentIndex + 1) % channelCards.length;
                break;
            case 'left':
                nextIndex = (currentIndex - 1 + channelCards.length) % channelCards.length;
                break;
            case 'down':
                nextIndex = (currentIndex + cols) % channelCards.length;
                if (nextIndex >= channelCards.length) nextIndex = channelCards.length - 1;
                break;
            case 'up':
                nextIndex = (currentIndex - cols + channelCards.length) % channelCards.length;
                break;
        }
        
        if (nextIndex >= 0 && nextIndex < channelCards.length) {
            channelCards[nextIndex].focus();
        }
    } else if (navigationState === 'mainCategories') {
        const buttons = mainCategoriesPanel.querySelectorAll('.category-btn');
        if (buttons.length === 0) return;
        
        let nextIndex;
        
        if (direction === 'right') {
            nextIndex = (currentMainCategoryIndex + 1) % buttons.length;
        } else if (direction === 'left') {
            nextIndex = (currentMainCategoryIndex - 1 + buttons.length) % buttons.length;
        } else {
            return;
        }
        
        currentMainCategoryIndex = nextIndex;
        currentMainCategory = buttons[nextIndex].textContent;
        updateMainCategoryActive();
        buttons[nextIndex].focus();
    } else if (navigationState === 'subCategories') {
        const buttons = subCategoriesPanel.querySelectorAll('.subcategory-btn');
        if (buttons.length === 0) return;
        
        let nextIndex;
        
        if (direction === 'right') {
            nextIndex = (currentSubCategoryIndex + 1) % buttons.length;
        } else if (direction === 'left') {
            nextIndex = (currentSubCategoryIndex - 1 + buttons.length) % buttons.length;
        } else {
            return;
        }
        
        currentSubCategoryIndex = nextIndex;
        currentSubcategory = buttons[nextIndex].textContent;
        updateSubCategoryActive();
        buttons[nextIndex].focus();
    }
}

// Основной обработчик клавиш
document.addEventListener('keydown', function(e) {
    if (playerModal.style.display === 'flex') {
        if (e.key === 'Escape') closeModal.click();
        return;
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'].includes(e.key)) {
        e.preventDefault();
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        moveFocus(e.key === 'ArrowRight' ? 'right' : 'left');
        return;
    }

    switch(e.key) {
        case 'ArrowUp':
            navigationState = 'mainCategories';
            mainCategoriesPanel.style.display = 'flex';
            subCategoriesPanel.style.display = 'none';
            
            setTimeout(() => {
                const buttons = mainCategoriesPanel.querySelectorAll('.category-btn');
                if (buttons[currentMainCategoryIndex]) {
                    buttons[currentMainCategoryIndex].focus();
                } else if (buttons.length > 0) {
                    currentMainCategoryIndex = 0;
                    buttons[0].focus();
                    currentMainCategory = buttons[0].textContent;
                    updateMainCategoryActive();
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
                    // Явно вызываем обработчик
                    selectSubcategory(buttons[currentSubCategoryIndex].textContent, currentSubCategoryIndex);
                } else if (buttons.length > 0) {
                    selectSubcategory(buttons[0].textContent, 0);
                }
            } else if (navigationState === 'channels') {
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
