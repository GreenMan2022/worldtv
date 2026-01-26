// ============================================
// World TV - Основной скрипт приложения
// Версия с функционалом "Поделиться каналом"
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

// 👇 Firebase: Инициализация (заглушка - замените на свои данные)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// 👇 Язык интерфейса
let currentLanguage = localStorage.getItem('appLanguage') || 'ru';

// 👇 Флаг проверки каналов
let checkChannelsOnLoad = localStorage.getItem('checkChannelsOnLoad') === 'true';

// 👇 Словарь переводов (сокращенная версия - добавьте полную)
const translations = {
    ru: {
        "Поделиться каналом": "Поделиться каналом",
        "Поделиться": "Поделиться",
        "Ссылка скопирована в буфер обмена!": "Ссылка скопирована в буфер обмена!",
        "Не удалось скопировать ссылку": "Не удалось скопировать ссылку",
        "Добавьте своё сообщение (необязательно)...": "Добавьте своё сообщение (необязательно)...",
        "Проверять каналы": "Проверять каналы",
        "Просмотренные": "Просмотренные",
        "Прямо сейчас": "Прямо сейчас",
        "Смотрят": "Популярные",
        "Свой плейлист": "Свой плейлист",
        "Пользовательские плейлисты": "Пользовательские плейлисты",
        "Случайный канал": "Случайный канал",
        "Поиск по каналам": "Поиск по каналам",
        "Каналы не найдены": "Каналы не найдены",
        "Загрузка...": "Загрузка...",
        "Ошибка": "Ошибка",
        // Добавьте остальные переводы...
    },
    en: {
        "Поделиться каналом": "Share channel",
        "Поделиться": "Share",
        "Ссылка скопирована в буфер обмена!": "Link copied to clipboard!",
        "Не удалось скопировать ссылку": "Failed to copy link",
        "Добавьте своё сообщение (необязательно)...": "Add your message (optional)...",
        "Проверять каналы": "Check Channels",
        "Просмотренные": "Watched",
        "Прямо сейчас": "Watching Now",
        "Смотрят": "Popular",
        "Свой плейлист": "Custom Playlist",
        "Пользовательские плейлисты": "User Playlists",
        "Случайный канал": "Random Channel",
        "Поиск по каналам": "Search channels",
        "Каналы не найдены": "Channels not found",
        "Загрузка...": "Loading...",
        "Ошибка": "Error",
        // Добавьте остальные переводы...
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

// 👇 Дерево категорий (сокращенная версия - добавьте полную)
const categoryTree = {
    "Просмотренные": {},
    "Прямо сейчас": {},
    "Популярные": {},
    "Свой плейлист": {},
    "Пользовательские плейлисты": {},
    "Случайный канал": {},
    "Категории": {
        "Новости": "https://iptv-org.github.io/iptv/categories/news.m3u",
        "Спорт": "https://iptv-org.github.io/iptv/categories/sports.m3u",
        "Музыка": "https://iptv-org.github.io/iptv/categories/music.m3u",
        // Добавьте остальные категории...
    },
    "Страны": {
        "Россия": "https://iptv-org.github.io/iptv/countries/ru.m3u",
        "США": "https://iptv-org.github.io/iptv/countries/us.m3u",
        // Добавьте остальные страны...
    },
    "Языки": {},
    "Регионы": {}
};

// ============================================
// ФУНКЦИОНАЛ ШАРИНГА КАНАЛОВ
// ============================================

// Инициализация модального окна шаринга
function initShareModal() {
    shareModal = document.getElementById('shareModal');
    shareCloseBtn = document.getElementById('shareCloseBtn');
    
    if (!shareModal || !shareCloseBtn) {
        console.warn('Элементы шаринга не найдены');
        return;
    }
    
    // Закрытие модального окна
    shareCloseBtn.addEventListener('click', () => {
        shareModal.style.display = 'none';
        currentShareData = null;
    });
    
    // Закрытие по клику вне окна
    shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            shareModal.style.display = 'none';
            currentShareData = null;
        }
    });
    
    // Обработка выбора соцсети
    const socialButtons = shareModal.querySelectorAll('[data-platform]');
    socialButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const platform = btn.getAttribute('data-platform');
            shareChannel(platform);
        });
        
        // Обработка клавиатуры
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const platform = btn.getAttribute('data-platform');
                shareChannel(platform);
            }
        });
    });
    
    // Обработка клавиатуры для модального окна
    document.addEventListener('keydown', (e) => {
        if (shareModal.style.display === 'flex' && e.key === 'Escape') {
            shareModal.style.display = 'none';
            currentShareData = null;
        }
    });
}

// Открытие модального окна шаринга
function openShareModal(channel) {
    if (!shareModal) {
        console.error('Модальное окно шаринга не инициализировано');
        return;
    }
    
    currentShareData = {
        name: channel.name,
        url: channel.url,
        group: channel.group,
        logo: channel.logo || '',
        pageUrl: window.location.href.split('?')[0]
    };
    
    // Обновляем информацию о канале
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
    
    // Сбрасываем пользовательское сообщение
    const messageInput = document.getElementById('shareCustomMessage');
    if (messageInput) {
        messageInput.value = '';
        messageInput.placeholder = translateText('Добавьте своё сообщение (необязательно)...');
    }
    
    // Показываем модальное окно
    shareModal.style.display = 'flex';
    
    // Фокус на поле ввода сообщения
    setTimeout(() => {
        if (messageInput) {
            messageInput.focus();
        }
    }, 100);
}

// Генерация текста для шаринга
function generateShareText(platform, channelData, customMessage = '') {
    const channelName = channelData.name;
    const channelGroup = channelData.group ? ` (${channelData.group})` : '';
    const pageUrl = channelData.pageUrl;
    
    let baseMessage = `Смотрите ${channelName}${channelGroup} на World TV!`;
    
    if (customMessage.trim()) {
        baseMessage = `${customMessage}\n\n${baseMessage}`;
    }
    
    // Платформ-специфичные форматы
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

// Генерация URL для шаринга
function generateShareUrl(platform, text) {
    const encodedText = encodeURIComponent(text);
    
    switch(platform) {
        case 'telegram':
            return `https://t.me/share/url?url=${encodedText}`;
            
        case 'whatsapp':
            return `https://api.whatsapp.com/send?text=${encodedText}`;
            
        case 'vk':
            return `https://vk.com/share.php?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(text)}`;
            
        case 'twitter':
            return `https://twitter.com/intent/tweet?text=${encodedText}`;
            
        case 'facebook':
            return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodedText}`;
            
        case 'reddit':
            return `https://www.reddit.com/submit?url=${encodeURIComponent(window.location.href)}&title=${encodedText}`;
            
        case 'linkedin':
            return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
            
        case 'pinterest':
            return `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&description=${encodedText}`;
            
        default:
            return '';
    }
}

// Основная функция шаринга
function shareChannel(platform) {
    if (!currentShareData) {
        showToast(translateText('Ошибка'));
        return;
    }
    
    const customMessage = document.getElementById('shareCustomMessage')?.value || '';
    const shareText = generateShareText(platform, currentShareData, customMessage);
    
    if (platform === 'copy') {
        // Копирование в буфер обмена
        navigator.clipboard.writeText(shareText).then(() => {
            showToast(translateText('Ссылка скопирована в буфер обмена!'));
            shareModal.style.display = 'none';
            currentShareData = null;
        }).catch(err => {
            console.error('Ошибка копирования: ', err);
            showToast(translateText('Не удалось скопировать ссылку'));
        });
        return;
    }
    
    const shareUrl = generateShareUrl(platform, shareText);
    
    if (shareUrl) {
        // Открываем в новом окне
        const width = 600;
        const height = 500;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        
        window.open(
            shareUrl,
            'shareWindow',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );
        
        // Закрываем модальное окно через небольшую задержку
        setTimeout(() => {
            shareModal.style.display = 'none';
            currentShareData = null;
        }, 300);
    } else {
        showToast(translateText('Не удалось создать ссылку для шаринга'));
    }
}

// Веб-шаринг API (если поддерживается браузером)
function initWebShareAPI() {
    // Проверяем поддержку Web Share API
    if (navigator.share) {
        console.log('Web Share API поддерживается');
    }
}

// Функция для нативного шаринга через Web Share API
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
// ОСНОВНЫЕ ФУНКЦИИ ПРИЛОЖЕНИЯ
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
    
    // Обработка просмотренных каналов
    if (currentWatchedChannel && watchStartTime) {
        const watchedSeconds = Math.floor((Date.now() - watchStartTime) / 1000);
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

// Добавление в просмотренные
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
        btn.addEventListener('click', () => selectMainCategory(cat, index));
        mainCategoriesPanel.appendChild(btn);
    });
    
    // Флаги языка
    const ruFlag = createLanguageFlag('🇷🇺', 'ru');
    const enFlag = createLanguageFlag('🇬🇧', 'en');
    mainCategoriesPanel.appendChild(ruFlag);
    mainCategoriesPanel.appendChild(enFlag);
}

// Создание флага языка
function createLanguageFlag(flag, lang) {
    const flagBtn = document.createElement('button');
    flagBtn.className = 'category-btn';
    flagBtn.textContent = flag;
    flagBtn.style.minWidth = '40px';
    flagBtn.style.padding = '8px';
    if (currentLanguage === lang) flagBtn.classList.add('active');
    flagBtn.addEventListener('click', () => setLanguage(lang));
    return flagBtn;
}

// Установка языка
function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('appLanguage', lang);
    renderMainCategories();
    renderSubCategories();
    loadAndRenderChannels(currentMainCategory, currentSubcategory);
}

// Отображение подкатегорий
function renderSubCategories() {
    subCategoriesPanel.innerHTML = '';
    subCategoriesPanel.style.display = 'none';
    
    if (!categoryTree[currentMainCategory]) return;
    
    const subcategories = Object.keys(categoryTree[currentMainCategory]);
    if (subcategories.length === 0) return;
    
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
    
    subCategoriesPanel.style.display = 'flex';
}

// Выбор главной категории
function selectMainCategory(categoryName, index) {
    currentMainCategory = categoryName;
    currentMainCategoryIndex = index;
    currentSubcategory = '';
    currentSubCategoryIndex = 0;
    
    renderSubCategories();
    loadAndRenderChannels(currentMainCategory, currentSubcategory);
    
    setTimeout(() => {
        const buttons = mainCategoriesPanel.querySelectorAll('.category-btn');
        if (buttons[index]) buttons[index].focus();
    }, 100);
}

// Выбор подкатегории
function selectSubcategory(subcategoryName, index) {
    currentSubcategory = subcategoryName;
    currentSubCategoryIndex = index;
    loadAndRenderChannels(currentMainCategory, currentSubcategory);
}

// Загрузка и отображение каналов
async function loadAndRenderChannels(mainCategory, subcategory) {
    initialLoader.style.display = 'flex';
    channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Загрузка...")}</div>`;
    
    // Заглушка - замените реальной логикой загрузки каналов
    setTimeout(() => {
        // Примерные данные для тестирования
        const mockChannels = [
            {
                name: "Тестовый канал 1",
                url: "https://test.com/stream1.m3u8",
                group: "Новости",
                logo: ""
            },
            {
                name: "Тестовый канал 2",
                url: "https://test.com/stream2.m3u8",
                group: "Спорт",
                logo: ""
            },
            {
                name: "Тестовый канал 3",
                url: "https://test.com/stream3.m3u8",
                group: "Музыка",
                logo: ""
            }
        ];
        
        if (mainCategory === 'Просмотренные') {
            // Загружаем из localStorage
            const watched = JSON.parse(localStorage.getItem('watchedChannels') || '[]');
            renderChannels(watched);
        } else {
            renderChannels(mockChannels);
        }
        
        initialLoader.style.display = 'none';
    }, 500);
}

// Отрисовка каналов с кнопкой "Поделиться"
function renderChannels(channelsToRender) {
    channelsContainer.innerHTML = '';
    
    if (channelsToRender.length === 0) {
        channelsContainer.innerHTML = `<div style="color:#aaa; padding:40px; text-align:center">${translateText("Каналы не найдены")}</div>`;
        return;
    }
    
    channelsToRender.forEach((channel, index) => {
        const channelCard = document.createElement('div');
        channelCard.className = 'channel-card';
        channelCard.setAttribute('tabindex', '0');
        channelCard.dataset.index = index;
        
        // Медиа-контейнер
        const mediaContainer = document.createElement('div');
        mediaContainer.className = 'channel-media';
        
        // Логотип канала
        if (channel.logo) {
            const img = document.createElement('img');
            img.src = channel.logo;
            img.alt = channel.name;
            img.onerror = () => { img.style.display = 'none'; };
            mediaContainer.appendChild(img);
        }
        
        // Иконка категории
        const icon = document.createElement('i');
        icon.className = `fas ${getGroupIcon(channel.group)}`;
        mediaContainer.appendChild(icon);
        
        // Кнопка "Поделиться"
        const shareBtn = document.createElement('button');
        shareBtn.className = 'channel-share-btn';
        shareBtn.innerHTML = '<i class="fas fa-share-alt"></i>';
        shareBtn.setAttribute('tabindex', '0');
        shareBtn.setAttribute('aria-label', translateText('Поделиться каналом'));
        shareBtn.title = translateText('Поделиться каналом');
        
        // Обработчик для шаринга
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
        const infoContainer = document.createElement('div');
        infoContainer.className = 'channel-info';
        infoContainer.innerHTML = `<h3>${channel.name}</h3><p>${channel.group}</p>`;
        
        // Собираем карточку
        channelCard.appendChild(mediaContainer);
        channelCard.appendChild(infoContainer);
        
        // Обработчики событий
        channelCard.addEventListener('click', () => {
            openFullScreenPlayer(channel.name, channel.url, channel.group, channel.logo);
        });
        
        channelCard.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                openFullScreenPlayer(channel.name, channel.url, channel.group, channel.logo);
            }
        });
        
        channelsContainer.appendChild(channelCard);
    });
    
    // Фокус на первый канал
    setTimeout(() => {
        const firstChannel = document.querySelector('.channel-card');
        if (firstChannel) firstChannel.focus();
    }, 100);
}

// Иконка по группе
function getGroupIcon(group) {
    if (!group) return 'fa-tv';
    group = group.toLowerCase();
    if (group.includes('новости')) return 'fa-newspaper';
    if (group.includes('спорт')) return 'fa-futbol';
    if (group.includes('кино') || group.includes('фильм')) return 'fa-film';
    if (group.includes('музыка')) return 'fa-music';
    if (group.includes('детск')) return 'fa-child';
    if (group.includes('документ')) return 'fa-video';
    if (group.includes('развлеч')) return 'fa-theater-masks';
    return 'fa-tv';
}

// Открытие полноэкранного плеера
function openFullScreenPlayer(name, url, group, logo) {
    stopAllMiniPlayers();
    currentWatchedChannel = { name, url, group, logo };
    watchStartTime = Date.now();
    
    playerModal.style.display = 'flex';
    videoPlayerElement.src = url;
    videoPlayerElement.load();
    
    showToast(`Загрузка канала: ${name}`);
    
    videoPlayerElement.play().catch(e => {
        console.log("Autoplay blocked:", e);
        showToast("Нажмите на видео для воспроизведения");
    });
}

// Остановка всех мини-плееров
function stopAllMiniPlayers() {
    // Заглушка - реализуйте при необходимости
}

// Навигация с клавиатуры
function moveFocus(direction) {
    // Упрощенная навигация - реализуйте полную версию при необходимости
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

// Обработчик клавиш
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
    
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        moveFocus(e.key.replace('Arrow', '').toLowerCase());
    }
});

// Инициализация приложения
function initApp() {
    try {
        // Инициализация шаринга
        initShareModal();
        initWebShareAPI();
        
        // Рендерим интерфейс
        renderMainCategories();
        renderSubCategories();
        loadAndRenderChannels(currentMainCategory, currentSubcategory);
        
        // Скрываем загрузчик
        setTimeout(() => {
            initialLoader.style.display = 'none';
        }, 1000);
        
    } catch (error) {
        console.error("Ошибка инициализации:", error);
        initialLoader.style.display = 'none';
        showToast(translateText("Ошибка"));
    }
}

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

// CSS для шаринга (динамическое добавление стилей)
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
`;

// Добавляем стили в DOM
const styleSheet = document.createElement("style");
styleSheet.textContent = shareStyles;
document.head.appendChild(styleSheet);
