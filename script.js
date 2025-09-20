// DOM элементы
var channelsContainer = document.getElementById('channelsContainer');
var mainCategoriesPanel = document.getElementById('mainCategoriesPanel');
var subCategoriesPanel = document.getElementById('subCategoriesPanel');
var playerModal = document.getElementById('playerModal');
var videoPlayerElement = document.getElementById('videoPlayerElement');
var closeModal = document.getElementById('closeModal');
var initialLoader = document.getElementById('initialLoader');
var toastContainer = document.getElementById('toastContainer');

// Глобальные переменные
var currentMainCategory = 'Просмотренные';
var currentSubcategory = '';
var currentMainCategoryIndex = 0;
var currentSubCategoryIndex = 0;
var currentChannelIndex = 0;
var currentMiniPlayer = null;
var miniPlayers = new Map();
var focusTimer = null;
var loadedPlaylists = {};
var navigationState = 'channels';

// Просмотренные
var currentWatchedChannel = null;
var watchStartTime = null;

// 👇 Язык интерфейса
var currentLanguage = 'ru'; // по умолчанию

// Тексты интерфейса
var translations = {
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
        english: "Английский",
        spanish: "Испанский",
        french: "Французский",
        german: "Немецкий",
        italian: "Итальянский",
        portuguese: "Португальский",
        chinese: "Китайский",
        japanese: "Японский",
        korean: "Корейский",
        arabic: "Арабский",
        turkish: "Турецкий",
        hindi: "Хинди",
        loading: "Загрузка...",
        errorInit: "Ошибка инициализации",
        errorApp: "Ошибка приложения",
        errorLoad: "Ошибка загрузки каналов",
        channelNotFound: "Каналы не найдены",
        channelUnavailable: "Канал недоступен",
        formatNotSupported: "Формат не поддерживается",
        clickToPlay: "Нажмите на видео для воспроизведения",
        addToWatchedSuccess: function(name) { return '✅ Канал "' + name + '" добавлен в "Просмотренные"'; },
        alreadyInWatched: function(name) { return 'ℹ️ Канал "' + name + '" уже в "Просмотренные"'; },
        lastPlaylistLoaded: function(main, sub) { return '📂 Загружен последний плейлист: ' + main + ' → ' + sub; },
        defaultPlaylist: '📂 Используем плейлист по умолчанию: "Просмотренные"',
        playlistSaved: function(main, sub) { return '💾 Сохранён плейлист: ' + main + ' → ' + sub; },
        saveError: '❌ Не удалось сохранить последний плейлист:',
        parseError: '❌ Ошибка парсинга watchedChannels:',
        resetPlaylist: 'Последний плейлист сброшен',
        scrollRestored: 'Позиция прокрутки восстановлена',
        determiningLocation: 'Определение вашего местоположения...'
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
        english: "English",
        spanish: "Spanish",
        french: "French",
        german: "German",
        italian: "Italian",
        portuguese: "Portuguese",
        chinese: "Chinese",
        japanese: "Japanese",
        korean: "Korean",
        arabic: "Arabic",
        turkish: "Turkish",
        hindi: "Hindi",
        loading: "Loading...",
        errorInit: "Initialization error",
        errorApp: "Application error",
        errorLoad: "Failed to load channels",
        channelNotFound: "Channels not found",
        channelUnavailable: "Channel unavailable",
        formatNotSupported: "Format not supported",
        clickToPlay: "Click video to play",
        addToWatchedSuccess: function(name) { return '✅ Channel "' + name + '" added to "Watched"'; },
        alreadyInWatched: function(name) { return 'ℹ️ Channel "' + name + '" already in "Watched"'; },
        lastPlaylistLoaded: function(main, sub) { return '📂 Loaded last playlist: ' + main + ' → ' + sub; },
        defaultPlaylist: '📂 Using default playlist: "Watched"',
        playlistSaved: function(main, sub) { return '💾 Playlist saved: ' + main + ' → ' + sub; },
        saveError: '❌ Failed to save last playlist:',
        parseError: '❌ Error parsing watchedChannels:',
        resetPlaylist: 'Last playlist reset',
        scrollRestored: 'Scroll position restored',
        determiningLocation: 'Detecting your location...'
    }
};

// 👇 Безопасная функция перевода — БЕЗ spread-оператора (ES5-совместимая)
function t(key) {
    var dict = translations[currentLanguage] || translations['en'];
    var str = dict[key];

    // Если перевод не найден — fallback на английский или ключ
    if (str === undefined) {
        console.warn('⚠️ Перевод "' + key + '" не найден для языка ' + currentLanguage);
        str = translations['en'] && translations['en'][key] ? translations['en'][key] : key;
    }

    // Если это функция — вызываем с аргументами
    if (typeof str === 'function') {
        var args = [];
        for (var i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        return str.apply(null, args);
    }

    // Если строка — возвращаем как есть
    return str;
}

// 👇 Определение языка по IP — с таймаутом 3 сек и fallback
function detectLanguageByIP() {
    return new Promise(function(resolve, reject) {
        var timeoutId = setTimeout(function() {
            console.warn('⚠️ Таймаут определения языка — устанавливаем английский');
            currentLanguage = 'en';
            try {
                localStorage.setItem('userLanguage', currentLanguage);
            } catch (e) {}
            resolve();
        }, 3000); // 3 секунды

        // Если уже определено — не повторяем
        var savedLang = localStorage.getItem('userLanguage');
        if (savedLang) {
            clearTimeout(timeoutId);
            currentLanguage = savedLang;
            resolve();
            return;
        }

        var countryCode = null;

        // Попробуем ipapi.co
        fetch('https://ipapi.co/json/', {
            method: 'GET',
            mode: 'cors'
        })
        .then(function(response) {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('HTTP ' + response.status);
            }
        })
        .then(function(data) {
            countryCode = data.country_code;
            console.log('🌍 Определена страна: ' + countryCode);
            finalize();
        })
        .catch(function(e) {
            console.warn('⚠️ ipapi.co недоступен:', e.message);
            tryFallback();
        });

        function tryFallback() {
            if (countryCode) {
                finalize();
                return;
            }

            // Fallback: попробуем ipwho.is
            fetch('https://ipwho.is/', {
                method: 'GET',
                mode: 'cors'
            })
            .then(function(response) {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Fallback failed');
            })
            .then(function(data) {
                countryCode = data.country_code;
                console.log('🌍 Определена страна (через ipwho.is): ' + countryCode);
                finalize();
            })
            .catch(function(e) {
                console.warn('⚠️ ipwho.is недоступен:', e.message);
                finalize();
            });
        }

        function finalize() {
            clearTimeout(timeoutId); // Отменяем таймаут

            // Если всё ещё не определено — ставим английский
            currentLanguage = countryCode === 'RU' ? 'ru' : 'en';

            // Сохраняем выбор
            try {
                localStorage.setItem('userLanguage', currentLanguage);
                console.log('🌐 Установлен язык: ' + currentLanguage);
            } catch (e) {
                console.error('❌ Не удалось сохранить язык в localStorage:', e);
            }
            resolve();
        }
    });
}

// 👇 Функция для получения дерева категорий с учётом текущего языка
function getCategoryTree() {
    return {
        watched: {},
        categories: {
            news: "https://iptv-org.github.io/iptv/categories/news.m3u",
            sports: "https://iptv-org.github.io/iptv/categories/sports.m3u",
            football: "https://iptv-org.github.io/iptv/categories/football.m3u",
            basketball: "https://iptv-org.github.io/iptv/categories/basketball.m3u",
            tennis: "https://iptv-org.github.io/iptv/categories/tennis.m3u",
            movies: "https://iptv-org.github.io/iptv/categories/movies.m3u",
            action: "https://iptv-org.github.io/iptv/categories/action.m3u",
            comedy: "https://iptv-org.github.io/iptv/categories/comedy.m3u",
            drama: "https://iptv-org.github.io/iptv/categories/drama.m3u",
            entertainment: "https://iptv-org.github.io/iptv/categories/entertainment.m3u",
            documentary: "https://iptv-org.github.io/iptv/categories/documentary.m3u",
            kids: "https://iptv-org.github.io/iptv/categories/kids.m3u",
            music: "https://iptv-org.github.io/iptv/categories/music.m3u",
            pop: "https://iptv-org.github.io/iptv/categories/pop.m3u",
            rock: "https://iptv-org.github.io/iptv/categories/rock.m3u",
            hiphop: "https://iptv-org.github.io/iptv/categories/hiphop.m3u"
        },
        countries: {
            russia: "https://iptv-org.github.io/iptv/countries/ru.m3u",
            usa: "https://iptv-org.github.io/iptv/countries/us.m3u",
            uk: "https://iptv-org.github.io/iptv/countries/gb.m3u",
            germany: "https://iptv-org.github.io/iptv/countries/de.m3u",
            france: "https://iptv-org.github.io/iptv/countries/fr.m3u",
            italy: "https://iptv-org.github.io/iptv/countries/it.m3u",
            spain: "https://iptv-org.github.io/iptv/countries/es.m3u",
            china: "https://iptv-org.github.io/iptv/countries/cn.m3u",
            japan: "https://iptv-org.github.io/iptv/countries/jp.m3u",
            korea: "https://iptv-org.github.io/iptv/countries/kr.m3u",
            india: "https://iptv-org.github.io/iptv/countries/in.m3u",
            brazil: "https://iptv-org.github.io/iptv/countries/br.m3u",
            canada: "https://iptv-org.github.io/iptv/countries/ca.m3u",
            australia: "https://iptv-org.github.io/iptv/countries/au.m3u"
        },
        languages: {
            russian: "https://iptv-org.github.io/iptv/languages/rus.m3u",
            english: "https://iptv-org.github.io/iptv/languages/eng.m3u",
            spanish: "https://iptv-org.github.io/iptv/languages/spa.m3u",
            french: "https://iptv-org.github.io/iptv/languages/fra.m3u",
            german: "https://iptv-org.github.io/iptv/languages/deu.m3u",
            italian: "https://iptv-org.github.io/iptv/languages/ita.m3u",
            portuguese: "https://iptv-org.github.io/iptv/languages/por.m3u",
            chinese: "https://iptv-org.github.io/iptv/languages/zho.m3u",
            japanese: "https://iptv-org.github.io/iptv/languages/jpn.m3u",
            korean: "https://iptv-org.github.io/iptv/languages/kor.m3u",
            arabic: "https://iptv-org.github.io/iptv/languages/ara.m3u",
            turkish: "https://iptv-org.github.io/iptv/languages/tur.m3u",
            hindi: "https://iptv-org.github.io/iptv/languages/hin.m3u"
        }
    };
}

// Применяем переводы к дереву категорий
function applyTranslationsToTree(tree) {
    var translatedTree = {};
    for (var key in tree) {
        if (tree.hasOwnProperty(key)) {
            var translatedKey = t(key);
            if (typeof tree[key] === 'object' && !Array.isArray(tree[key]) && tree[key] !== null) {
                translatedTree[translatedKey] = applyTranslationsToTree(tree[key]);
            } else {
                translatedTree[translatedKey] = tree[key];
            }
        }
    }
    return translatedTree;
}

// Закрытие модального окна
closeModal.addEventListener('click', function() {
    playerModal.style.display = 'none';
    videoPlayerElement.pause();
    videoPlayerElement.src = '';

    if (currentWatchedChannel && watchStartTime) {
        var watchedSeconds = Math.floor((Date.now() - watchStartTime) / 1000);
        console.log('📺 Просмотрено: ' + watchedSeconds + ' секунд');

        if (watchedSeconds >= 60) {
            addToWatched(
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
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    
    setTimeout(function() {
        toast.remove();
    }, 3000);
}

// Просмотренные: Добавление в localStorage — с защитой от ошибок
function addToWatched(name, url, group, logo) {
    var watched;
    try {
        var raw = localStorage.getItem('watchedChannels');
        watched = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(watched)) {
            console.warn('⚠️ watchedChannels не массив — сброс');
            watched = [];
        }
    } catch (e) {
        console.error(t('parseError'), e);
        watched = [];
    }

    var exists = false;
    for (var i = 0; i < watched.length; i++) {
        if (watched[i].url === url) {
            exists = true;
            break;
        }
    }

    if (exists) {
        console.log(t('alreadyInWatched', name));
        return;
    }

    watched.push({ name: name, url: url, group: group, logo: logo });
    try {
        localStorage.setItem('watchedChannels', JSON.stringify(watched));
        console.log(t('addToWatchedSuccess', name));
    } catch (e) {
        console.error('❌ Не удалось сохранить в localStorage:', e);
        showToast('Ошибка сохранения');
        return;
    }

    if (currentMainCategory === t('watched')) {
        loadAndRenderChannels(t('watched'), '');
    }
}

// 👇 Сохранение позиции скролла
function saveScrollPosition() {
    if (navigationState === 'channels') {
        try {
            var key = 'scroll_' + currentMainCategory + '_' + currentSubcategory;
            localStorage.setItem(key, channelsContainer.scrollTop.toString());
        } catch (e) {
            console.error('❌ Не удалось сохранить позицию скролла:', e);
        }
    }
}

// 👇 Восстановление позиции скролла
function restoreScrollPosition() {
    try {
        var key = 'scroll_' + currentMainCategory + '_' + currentSubcategory;
        var saved = localStorage.getItem(key);
        if (saved) {
            setTimeout(function() {
                channelsContainer.scrollTop = parseInt(saved);
                console.log(t('scrollRestored'));
            }, 100);
        }
    } catch (e) {
        console.error('❌ Не удалось восстановить позицию скролла:', e);
    }
}

// Инициализация приложения — БЕЗ await, чтобы не блокировать загрузку
function initApp() {
    var safetyTimeout = setTimeout(function() {
        initialLoader.style.display = 'none';
        showToast(t('errorInit'));
    }, 10000);

    try {
        // 👇 Запускаем определение языка АСИНХРОННО, без await
        detectLanguageByIP().then(function() {
            // После определения языка — перерисовываем меню
            renderMainCategories();
            renderSubCategories();
            // Если текущая категория — "Просмотренные", перезагружаем каналы
            if (currentMainCategory === t('watched')) {
                loadAndRenderChannels(currentMainCategory, currentSubcategory);
            }
        }).catch(function(e) {
            console.error('❌ Ошибка после определения языка:', e);
        });

        // 👇 Загружаем последний плейлист (или "Просмотренные" по умолчанию)
        var lastMain = localStorage.getItem('lastMainCategory');
        var lastSub = localStorage.getItem('lastSubcategory');

        var categoryTree = applyTranslationsToTree(getCategoryTree());

        if (lastMain && lastSub && categoryTree[lastMain] && categoryTree[lastMain][lastSub]) {
            currentMainCategory = lastMain;
            currentSubcategory = lastSub;
            console.log(t('lastPlaylistLoaded', lastMain, lastSub));
        } else {
            currentMainCategory = t('watched');
            currentSubcategory = '';
            console.log(t('defaultPlaylist'));
        }

        // Рендерим интерфейс немедленно
        renderMainCategories();
        renderSubCategories();
        loadAndRenderChannels(currentMainCategory, currentSubcategory);
        
        setTimeout(function() {
            var firstChannel = document.querySelector('.channel-card');
            if (firstChannel) firstChannel.focus();
            restoreScrollPosition();
        }, 500);

        channelsContainer.addEventListener('scroll', debounce(saveScrollPosition, 300));
        
        clearTimeout(safetyTimeout);

        // 👇 Аварийное скрытие лоадера через 5 сек
        setTimeout(function() {
            if (initialLoader.style.display !== 'none') {
                console.warn('⚠️ Принудительное скрытие initialLoader');
                initialLoader.style.display = 'none';
            }
        }, 5000);

    } catch (error) {
        clearTimeout(safetyTimeout);
        console.error("❌ Критическая ошибка инициализации:", error);
        initialLoader.style.display = 'none';
        showToast(t('errorApp'));
    }
}

// Debounce функция — без spread-оператора
function debounce(func, wait) {
    var timeout;
    return function executedFunction() {
        var args = arguments;
        var context = this;
        var later = function() {
            clearTimeout(timeout);
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Отображение главных категорий
function renderMainCategories() {
    mainCategoriesPanel.innerHTML = '';
    var categoryTree = applyTranslationsToTree(getCategoryTree());
    var mainCategories = Object.keys(categoryTree);
    
    for (var i = 0; i < mainCategories.length; i++) {
        var cat = mainCategories[i];
        var btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = cat;
        if (cat === currentMainCategory) {
            btn.classList.add('active');
            currentMainCategoryIndex = i;
        }
        
        btn.addEventListener('click', function(cat, index) {
            return function() {
                selectMainCategory(cat, index);
            };
        }(cat, i));
        
        btn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
        
        mainCategoriesPanel.appendChild(btn);
    }
}

// Отображение подкатегорий
function renderSubCategories() {
    subCategoriesPanel.innerHTML = '';
    subCategoriesPanel.style.display = 'none';
    
    var categoryTree = applyTranslationsToTree(getCategoryTree());
    if (!categoryTree[currentMainCategory]) return;
    var subcategories = Object.keys(categoryTree[currentMainCategory]);
    
    for (var i = 0; i < subcategories.length; i++) {
        var subcat = subcategories[i];
        var btn = document.createElement('button');
        btn.className = 'subcategory-btn';
        btn.textContent = subcat;
        if (subcat === currentSubcategory) {
            btn.classList.add('active');
            currentSubCategoryIndex = i;
        }
        
        btn.addEventListener('click', function(subcat, index) {
            return function() {
                selectSubcategory(subcat, index);
            };
        }(subcat, i));
        
        btn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
        
        subCategoriesPanel.appendChild(btn);
    }
    
    if (subcategories.length > 0) {
        subCategoriesPanel.style.display = 'flex';
    }
}

// Выбор главной категории
function selectMainCategory(categoryName, index) {
    currentMainCategory = categoryName;
    currentMainCategoryIndex = index;
    var categoryTree = applyTranslationsToTree(getCategoryTree());
    var firstSub = categoryTree[categoryName] ? Object.keys(categoryTree[categoryName])[0] : '';
    currentSubcategory = firstSub || '';
    currentSubCategoryIndex = 0;
    renderSubCategories();
    
    setTimeout(function() {
        var buttons = mainCategoriesPanel.querySelectorAll('.category-btn');
        if (buttons[index]) buttons[index].focus();
    }, 100);
}

// Выбор подкатегории + сохранение в localStorage
function selectSubcategory(subcategoryName, index) {
    currentSubcategory = subcategoryName;
    currentSubCategoryIndex = index;

    try {
        localStorage.setItem('lastMainCategory', currentMainCategory);
        localStorage.setItem('lastSubcategory', subcategoryName);
        console.log(t('playlistSaved', currentMainCategory, subcategoryName));
    } catch (e) {
        console.error(t('saveError'), e);
    }

    loadAndRenderChannels(currentMainCategory, currentSubcategory);
    
    setTimeout(function() {
        var firstChannel = document.querySelector('.channel-card');
        if (firstChannel) firstChannel.focus();
    }, 100);
}

// Обновить активную кнопку в главном меню
function updateMainCategoryActive() {
    var buttons = mainCategoriesPanel.querySelectorAll('.category-btn');
    for (var i = 0; i < buttons.length; i++) {
        if (i === currentMainCategoryIndex) {
            buttons[i].classList.add('active');
        } else {
            buttons[i].classList.remove('active');
        }
    }
}

// Обновить активную кнопку в подменю
function updateSubCategoryActive() {
    var buttons = subCategoriesPanel.querySelectorAll('.subcategory-btn');
    for (var i = 0; i < buttons.length; i++) {
        if (i === currentSubCategoryIndex) {
            buttons[i].classList.add('active');
        } else {
            buttons[i].classList.remove('active');
        }
    }
}

// Загрузка и отображение каналов
function loadAndRenderChannels(mainCategory, subcategory) {
    var categoryTree = applyTranslationsToTree(getCategoryTree());

    if (mainCategory === t('watched')) {
        initialLoader.style.display = 'none';
        var watched;
        try {
            var raw = localStorage.getItem('watchedChannels');
            watched = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(watched)) {
                console.warn('⚠️ watchedChannels не массив — сброс при загрузке');
                watched = [];
                localStorage.setItem('watchedChannels', '[]');
            }
        } catch (e) {
            console.error('❌ Ошибка парсинга при загрузке:', e);
            watched = [];
            localStorage.setItem('watchedChannels', '[]');
        }
        renderChannels(watched);
        return;
    }

    if (!categoryTree[mainCategory] || !categoryTree[mainCategory][subcategory]) {
        renderChannels([]);
        return;
    }
    
    var url = categoryTree[mainCategory][subcategory];
    initialLoader.style.display = 'flex';
    
    try {
        if (loadedPlaylists[url]) {
            renderChannels(loadedPlaylists[url]);
        } else {
            fetchM3U(url).then(function(content) {
                var channels = parseM3UContent(content, subcategory);
                loadedPlaylists[url] = channels;
                renderChannels(channels);
            }).catch(function(error) {
                console.error("Ошибка загрузки:", error);
                showToast(t('errorLoad'));
                renderChannels([]);
            }).finally(function() {
                initialLoader.style.display = 'none';
                setTimeout(function() {
                    var firstChannel = document.querySelector('.channel-card');
                    if (firstChannel) firstChannel.focus();
                    restoreScrollPosition();
                }, 100);
            });
        }
    } catch (error) {
        console.error("Ошибка загрузки:", error);
        showToast(t('errorLoad'));
        renderChannels([]);
        initialLoader.style.display = 'none';
        setTimeout(function() {
            var firstChannel = document.querySelector('.channel-card');
            if (firstChannel) firstChannel.focus();
            restoreScrollPosition();
        }, 100);
    }
}

// Загрузка M3U
function fetchM3U(url) {
    return fetch(url).then(function(response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.text();
    });
}

// Парсинг M3U
function parseM3UContent(content, assignedCategory) {
    var channels = [];
    var lines = content.split('\n');
    
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#EXTINF:')) {
            var infoLine = lines[i];
            var urlLine = lines[i + 1];
            
            if (urlLine && !urlLine.startsWith('#')) {
                var name = infoLine.split(',')[1] || 'Канал';
                name = name.trim();
                
                var logoMatch = infoLine.match(/tvg-logo="([^"]*)"/);
                var logo = logoMatch ? logoMatch[1] : '';
                
                channels.push({ name: name, url: urlLine.trim(), group: assignedCategory, logo: logo });
            }
        }
    }
    return filterBlacklistedChannels(channels);
}

// Фильтрация по чёрному списку
function filterBlacklistedChannels(channelsList) {
    var blacklist = JSON.parse(localStorage.getItem('blacklist') || '[]');
    var filtered = [];
    for (var i = 0; i < channelsList.length; i++) {
        if (blacklist.indexOf(channelsList[i].url) === -1) {
            filtered.push(channelsList[i]);
        }
    }
    return filtered;
}

// Отрисовка каналов
function renderChannels(channelsToRender) {
    channelsContainer.innerHTML = '';
    
    if (channelsToRender.length === 0) {
        channelsContainer.innerHTML = '<div style="color:#aaa; padding:40px; text-align:center">' +
            (initialLoader.style.display === 'none' ? t('channelNotFound') : t('loading')) +
            '</div>';
        return;
    }
    
    for (var i = 0; i < channelsToRender.length; i++) {
        var channel = channelsToRender[i];
        var groupIcon = getGroupIcon(channel.group);
        var channelCard = document.createElement('div');
        channelCard.className = 'channel-card';
        channelCard.setAttribute('tabindex', '0');
        channelCard.dataset.index = i;
        
        var mediaContainer = document.createElement('div');
        mediaContainer.className = 'channel-media';
        
        if (channel.logo) {
            var img = document.createElement('img');
            img.src = channel.logo;
            img.alt = channel.name;
            img.onerror = function() { this.style.display = 'none'; };
            mediaContainer.appendChild(img);
        }
        
        var icon = document.createElement('i');
        icon.className = 'fas ' + groupIcon;
        mediaContainer.appendChild(icon);
        
        var miniPlayer = createMiniPlayer(channel.url);
        mediaContainer.appendChild(miniPlayer);
        
        var infoContainer = document.createElement('div');
        infoContainer.className = 'channel-info';
        infoContainer.innerHTML = '<h3>' + channel.name + '</h3><p>' + channel.group + '</p>';
        
        channelCard.appendChild(mediaContainer);
        channelCard.appendChild(infoContainer);
        
        channelCard.addEventListener('focus', function() {
            currentChannelIndex = parseInt(this.dataset.index);
            
            if (focusTimer) clearTimeout(focusTimer);
            
            if (currentMiniPlayer && currentMiniPlayer !== miniPlayer) {
                currentMiniPlayer.style.display = 'none';
                var prevIcon = currentMiniPlayer.parentElement.querySelector('i');
                if (prevIcon) prevIcon.style.display = 'block';
                var prevVideo = currentMiniPlayer.querySelector('video');
                if (prevVideo) prevVideo.pause();
            }
            
            miniPlayer.style.display = 'block';
            icon.style.display = 'none';
            currentMiniPlayer = miniPlayer;
            
            focusTimer = setTimeout(function() {
                var video = miniPlayer.querySelector('video');
                if (!video.dataset.initialized) {
                    initializeMiniPlayer(video, channel.url, miniPlayer, icon);
                } else if (video.paused) {
                    video.play().catch(function(e) { console.log("Autoplay:", e); });
                }
            }, 3000);
        });
        
        channelCard.addEventListener('blur', function() {
            if (focusTimer) clearTimeout(focusTimer);
            setTimeout(function() {
                if (!channelCard.contains(document.activeElement)) {
                    miniPlayer.style.display = 'none';
                    icon.style.display = 'block';
                    var video = miniPlayer.querySelector('video');
                    if (video) video.pause();
                }
            }, 100);
        });
        
        channelCard.addEventListener('click', function(name, url, group, logo) {
            return function() {
                openFullScreenPlayer(name, url, group, logo);
            };
        }(channel.name, channel.url, channel.group, channel.logo));
        
        channelCard.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                openFullScreenPlayer(channel.name, channel.url, channel.group, channel.logo);
            }
        });
        
        channelsContainer.appendChild(channelCard);
    }
}

// Создание мини-плеера
function createMiniPlayer(url) {
    if (miniPlayers.has(url)) return miniPlayers.get(url);

    var container = document.createElement('div');
    container.className = 'mini-player';
    container.dataset.url = url;
    
    var video = document.createElement('video');
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
    var manifestLoaded = false;
    var networkErrorOccurred = false;

    var timeoutId = setTimeout(function() {
        if (!manifestLoaded && !networkErrorOccurred) {
            console.warn("Таймаут:", url);
            showToast(t('channelUnavailable'));
            addToBlacklist(url);
            miniPlayer.style.display = 'none';
            icon.style.display = 'block';
        }
    }, 30000);

    if (Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            clearTimeout(timeoutId);
            manifestLoaded = true;
            video.play().catch(function(e) {
                console.log("Autoplay blocked:", e);
                showToast(t('clickToPlay'));
            });
        });
        
        hls.on(Hls.Events.ERROR, function(event, data) {
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
        video.addEventListener('loadedmetadata', function() {
            clearTimeout(timeoutId);
            manifestLoaded = true;
            video.play().catch(function(e) {
                console.log("Autoplay blocked:", e);
                showToast(t('clickToPlay'));
            });
        });
        video.addEventListener('error', function() {
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
    showToast(t('channelUnavailable'));
    console.error("Ошибка потока:", url);
    var icon = container.parentElement.querySelector('i');
    if (icon) icon.style.display = 'block';
    container.style.display = 'none';
}

// Добавление в чёрный список
function addToBlacklist(url) {
    var blacklist = JSON.parse(localStorage.getItem('blacklist') || '[]');
    if (blacklist.indexOf(url) === -1) {
        blacklist.push(url);
        localStorage.setItem('blacklist', JSON.stringify(blacklist));
    }
}

// Открытие полноэкранного плеера
function openFullScreenPlayer(name, url, group, logo) {
    currentWatchedChannel = { name: name, url: url, group: group, logo: logo };
    watchStartTime = Date.now();

    playerModal.style.display = 'flex';
    videoPlayerElement.src = '';
    videoPlayerElement.load();
    videoPlayerElement.muted = false;

    var manifestLoaded = false;

    var timeoutId = setTimeout(function() {
        if (!manifestLoaded) {
            console.warn("Таймаут полный экран:", url);
            showToast(t('channelUnavailable'));
            addToBlacklist(url);
            playerModal.style.display = 'none';
        }
    }, 30000);

    if (Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(videoPlayerElement);
        
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            clearTimeout(timeoutId);
            manifestLoaded = true;
            videoPlayerElement.play().catch(function(e) {
                console.log("Autoplay blocked:", e);
                showToast(t('clickToPlay'));
            });
            setTimeout(function() { requestNativeFullscreen(); }, 1000);
        });
        
        hls.on(Hls.Events.ERROR, function(event, data) {
            if (data.fatal) {
                clearTimeout(timeoutId);
                showToast(t('channelUnavailable'));
                addToBlacklist(url);
                playerModal.style.display = 'none';
            }
        });
    } else if (videoPlayerElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoPlayerElement.src = url;
        videoPlayerElement.addEventListener('loadedmetadata', function() {
            clearTimeout(timeoutId);
            manifestLoaded = true;
            videoPlayerElement.play().catch(function(e) {
                console.log("Autoplay blocked:", e);
                showToast(t('clickToPlay'));
            });
            setTimeout(function() { requestNativeFullscreen(); }, 1000);
        });
        videoPlayerElement.addEventListener('error', function() {
            clearTimeout(timeoutId);
            showToast(t('channelUnavailable'));
            addToBlacklist(url);
            playerModal.style.display = 'none';
        });
    } else {
        clearTimeout(timeoutId);
        showToast(t('formatNotSupported'));
        playerModal.style.display = 'none';
    }
}

// Fullscreen API
function requestNativeFullscreen() {
    var elem = videoPlayerElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(function(err) { console.log("Fullscreen:", err); });
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen().catch(function(err) { console.log("Fullscreen:", err); });
    }
}

// Иконка по группе
function getGroupIcon(group) {
    group = group.toLowerCase();
    if (group.includes('новости') || group.includes('news')) return 'fa-newspaper';
    if (group.includes('спорт') || group.includes('sports') || group.includes('football') || group.includes('basketball') || group.includes('tennis')) return 'fa-futbol';
    if (group.includes('кино') || group.includes('movies') || group.includes('action') || group.includes('comedy') || group.includes('drama')) return 'fa-film';
    if (group.includes('музыка') || group.includes('music') || group.includes('pop') || group.includes('rock') || group.includes('hiphop')) return 'fa-music';
    if (group.includes('детск') || group.includes('kids')) return 'fa-child';
    if (group.includes('документ') || group.includes('documentary')) return 'fa-video';
    if (group.includes('развлеч') || group.includes('entertainment')) return 'fa-theater-masks';
    return 'fa-tv';
}

// Перемещение фокуса
function moveFocus(direction) {
    if (navigationState === 'channels') {
        var cards = document.querySelectorAll('.channel-card');
        if (cards.length === 0) return;
        var currentIndex = Array.prototype.indexOf.call(cards, document.activeElement);
        var cols = Math.floor(channelsContainer.offsetWidth / 280) || 1;
        var nextIndex = currentIndex;

        switch(direction) {
            case 'right': nextIndex = (currentIndex + 1) % cards.length; break;
            case 'left': nextIndex = (currentIndex - 1 + cards.length) % cards.length; break;
            case 'down': nextIndex = (currentIndex + cols) % cards.length; break;
            case 'up': nextIndex = (currentIndex - cols + cards.length) % cards.length; break;
        }

        if (nextIndex >= 0 && nextIndex < cards.length) {
            cards[nextIndex].focus();
        }
    } else if (navigationState === 'mainCategories') {
        var buttons = mainCategoriesPanel.querySelectorAll('.category-btn');
        if (buttons.length === 0) return;
        var nextIndex = direction === 'right'
            ? (currentMainCategoryIndex + 1) % buttons.length
            : (currentMainCategoryIndex - 1 + buttons.length) % buttons.length;
        currentMainCategoryIndex = nextIndex;
        currentMainCategory = buttons[nextIndex].textContent;
        updateMainCategoryActive();
        buttons[nextIndex].focus();
    } else if (navigationState === 'subCategories') {
        var buttons = subCategoriesPanel.querySelectorAll('.subcategory-btn');
        if (buttons.length === 0) return;
        var nextIndex = direction === 'right'
            ? (currentSubCategoryIndex + 1) % buttons.length
            : (currentSubCategoryIndex - 1 + buttons.length) % buttons.length;
        currentSubCategoryIndex = nextIndex;
        currentSubcategory = buttons[nextIndex].textContent;
        updateSubCategoryActive();
        buttons[nextIndex].focus();
    }
}

// Обработчик клавиш
document.addEventListener('keydown', function(e) {
    if (playerModal.style.display === 'flex') {
        if (e.key === 'Escape') closeModal.click();
        return;
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'].indexOf(e.key) !== -1) {
        e.preventDefault();
    }

    switch(e.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
            moveFocus(e.key === 'ArrowRight' ? 'right' : 'left');
            break;
        case 'ArrowUp':
            navigationState = 'mainCategories';
            mainCategoriesPanel.style.display = 'flex';
            subCategoriesPanel.style.display = 'none';
            setTimeout(function() {
                var buttons = mainCategoriesPanel.querySelectorAll('.category-btn');
                if (buttons[currentMainCategoryIndex]) {
                    buttons[currentMainCategoryIndex].focus();
                }
            }, 100);
            break;
        case 'ArrowDown':
            navigationState = 'channels';
            mainCategoriesPanel.style.display = 'flex';
            subCategoriesPanel.style.display = 'none';
            setTimeout(function() {
                var firstChannel = document.querySelector('.channel-card');
                if (firstChannel) firstChannel.focus();
            }, 100);
            break;
        case 'Enter':
            if (navigationState === 'mainCategories') {
                navigationState = 'subCategories';
                subCategoriesPanel.style.display = 'flex';
                setTimeout(function() {
                    var buttons = subCategoriesPanel.querySelectorAll('.subcategory-btn');
                    if (buttons.length > 0) {
                        buttons[0].focus();
                        currentSubCategoryIndex = 0;
                        currentSubcategory = buttons[0].textContent;
                        updateSubCategoryActive();
                    }
                }, 100);
            } else if (navigationState === 'subCategories') {
                var buttons = subCategoriesPanel.querySelectorAll('.subcategory-btn');
                if (buttons[currentSubCategoryIndex]) {
                    selectSubcategory(buttons[currentSubCategoryIndex].textContent, currentSubCategoryIndex);
                }
            } else if (navigationState === 'channels' && document.activeElement.classList.contains('channel-card')) {
                var card = document.activeElement;
                var index = parseInt(card.dataset.index);
                var categoryTree = applyTranslationsToTree(getCategoryTree());
                var list = currentMainCategory === t('watched')
                    ? JSON.parse(localStorage.getItem('watchedChannels') || '[]')
                    : loadedPlaylists[categoryTree[currentMainCategory][currentSubcategory]] || [];
                if (index >= 0 && index < list.length) {
                    var channel = list[index];
                    openFullScreenPlayer(channel.name, channel.url, channel.group, channel.logo);
                }
            }
            break;
        case 'Escape':
            if (navigationState === 'subCategories') {
                navigationState = 'mainCategories';
                setTimeout(function() {
                    var buttons = mainCategoriesPanel.querySelectorAll('.category-btn');
                    if (buttons[currentMainCategoryIndex]) {
                        buttons[currentMainCategoryIndex].focus();
                    }
                }, 100);
            } else if (navigationState === 'mainCategories') {
                navigationState = 'channels';
                setTimeout(function() {
                    var firstChannel = document.querySelector('.channel-card');
                    if (firstChannel) firstChannel.focus();
                }, 100);
            }
            break;
    }
});

// Запуск приложения
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});
