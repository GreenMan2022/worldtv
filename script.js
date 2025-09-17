// DOM элементы
const m3uInput = document.getElementById('m3uFile');
const dropZone = document.getElementById('dropZone');
const loadUrlBtn = document.getElementById('loadUrlBtn');
const playlistUrl = document.getElementById('playlistUrl');
const searchInput = document.getElementById('searchInput');
const countryFilter = document.getElementById('countryFilter');
const channelsContainer = document.getElementById('channelsContainer');
const statsInfo = document.getElementById('statsInfo');
const loadingIndicator = document.getElementById('loadingIndicator');
const playerModal = document.getElementById('playerModal');
const modalTitle = document.getElementById('modalTitle');
const videoPlayerElement = document.getElementById('videoPlayerElement');
const closeModal = document.getElementById('closeModal');

// Данные приложения
let channels = [];
let filteredChannels = [];

// Скрыть индикатор загрузки по умолчанию (он будет показан при загрузке)
loadingIndicator.style.display = 'block';

// Обработка загрузки файла
m3uInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        loadM3UFile(file);
    }
});

// Обработка перетаскивания файла
dropZone.addEventListener('dragover', function(e) {
    e.preventDefault();
    dropZone.style.borderColor = '#ff375f';
    dropZone.style.background = 'rgba(255, 255, 255, 0.1)';
});

dropZone.addEventListener('dragleave', function() {
    dropZone.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    dropZone.style.background = 'rgba(255, 255, 255, 0.05)';
});

dropZone.addEventListener('drop', function(e) {
    e.preventDefault();
    dropZone.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    dropZone.style.background = 'rgba(255, 255, 255, 0.05)';
    
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.m3u') || file.name.endsWith('.m3u8'))) {
        loadM3UFile(file);
    } else {
        alert('Пожалуйста, загрузите файл с расширением .m3u или .m3u8');
    }
});

// Загрузка по URL
loadUrlBtn.addEventListener('click', function() {
    const url = playlistUrl.value.trim();
    if (url) {
        loadM3UFromUrl(url);
    } else {
        alert('Пожалуйста, введите URL M3U плейлиста');
    }
});

// Поиск и фильтрация
searchInput.addEventListener('input', filterChannels);
countryFilter.addEventListener('change', filterChannels);

// Категории
const categoryButtons = document.querySelectorAll('.category-btn');
categoryButtons.forEach(button => {
    button.addEventListener('click', function() {
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        filterChannels();
    });
});

// Модальное окно
closeModal.addEventListener('click', function() {
    playerModal.style.display = 'none';
    videoPlayerElement.pause();
    videoPlayerElement.src = '';
});

// Функция загрузки M3U файла
function loadM3UFile(file) {
    loadingIndicator.style.display = 'block';
    channelsContainer.innerHTML = '';
    
    const reader = new FileReader();
    reader.onload = function(e) {
        parseM3UContent(e.target.result);
    };
    reader.readAsText(file);
}

// Функция загрузки M3U по URL
function loadM3UFromUrl(url) {
    loadingIndicator.style.display = 'block';
    channelsContainer.innerHTML = '';
    statsInfo.textContent = "Загрузка плейлиста...";
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => parseM3UContent(data))
        .catch(error => {
            loadingIndicator.style.display = 'none';
            alert('Ошибка загрузки плейлиста: ' + error.message);
            statsInfo.textContent = "Ошибка загрузки. Попробуйте другой источник.";
        });
}

// Функция парсинга M3U контента
function parseM3UContent(content) {
    channels = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#EXTINF:')) {
            const infoLine = lines[i];
            const urlLine = lines[i + 1];
            
            if (urlLine && !urlLine.startsWith('#')) {
                // Извлечение названия канала
                let name = infoLine.split(',')[1] || 'Неизвестный канал';
                name = name.trim();
                
                // Извлечение атрибутов
                const groupMatch = infoLine.match(/group-title="([^"]*)"/);
                const group = groupMatch ? groupMatch[1] : 'Other';
                
                const logoMatch = infoLine.match(/tvg-logo="([^"]*)"/);
                const logo = logoMatch ? logoMatch[1] : '';
                
                const countryMatch = infoLine.match(/tvg-country="([^"]*)"/);
                const country = countryMatch ? countryMatch[1] : 'Неизвестно';
                
                channels.push({
                    name,
                    url: urlLine.trim(),
                    group,
                    logo,
                    country
                });
            }
        }
    }
    
    renderChannels(channels);
    updateStats();
    loadingIndicator.style.display = 'none';
}

// Функция отрисовки каналов
function renderChannels(channelsToRender) {
    channelsContainer.innerHTML = '';
    
    if (channelsToRender.length === 0) {
        channelsContainer.innerHTML = `
            <div class="loading">
                <i class="fas fa-tv"></i>
                <p>Каналы не найдены</p>
            </div>
        `;
        return;
    }
    
    channelsToRender.forEach(channel => {
        const groupIcon = getGroupIcon(channel.group);
        
        const channelCard = document.createElement('div');
        channelCard.className = 'channel-card';
        channelCard.setAttribute('tabindex', '0');
        channelCard.innerHTML = `
            <div class="channel-img">
                ${channel.logo ? 
                  `<img src="${channel.logo}" alt="${channel.name}" onerror="this.style.display='none'" style="width: 100%; height: 100%; object-fit: cover;">` : 
                  `<i class="fas ${groupIcon}"></i>`
                }
            </div>
            <div class="channel-info">
                <h3>${channel.name}</h3>
                <p>${channel.group} • ${channel.country}</p>
                <div class="channel-meta">
                    <div class="channel-country">
                        <i class="fas fa-map-marker-alt"></i> ${channel.country}
                    </div>
                    <button class="watch-btn" data-url="${channel.url}">
                        <i class="fas fa-play"></i> Смотреть
                    </button>
                </div>
            </div>
        `;
        
        channelCard.querySelector('.watch-btn').addEventListener('click', function() {
            openPlayer(channel.name, channel.url);
        });
        
        channelsContainer.appendChild(channelCard);
    });

    // После рендеринга обновляем фокусируемые элементы
    setTimeout(updateFocusableElements, 100);
}

// Функция фильтрации каналов
function filterChannels() {
    const searchText = searchInput.value.toLowerCase();
    const country = countryFilter.value;
    const activeCategory = document.querySelector('.category-btn.active');
    const group = activeCategory ? activeCategory.dataset.group : 'all';
    
    filteredChannels = channels.filter(channel => {
        const matchesSearch = channel.name.toLowerCase().includes(searchText) || 
                            channel.group.toLowerCase().includes(searchText);
        const matchesCountry = country === 'all' || channel.country === country;
        const matchesGroup = group === 'all' || channel.group.toLowerCase().includes(group);
        
        return matchesSearch && matchesCountry && matchesGroup;
    });
    
    renderChannels(filteredChannels);
    updateStats();
}

// Функция обновления статистики
function updateStats() {
    const total = channels.length;
    const showing = filteredChannels.length;
    statsInfo.textContent = `Показано: ${showing} из ${total} каналов`;
}

// Функция открытия плеера
function openPlayer(name, url) {
    modalTitle.textContent = name;
    playerModal.style.display = 'flex';

    // Очистка предыдущего источника
    videoPlayerElement.src = '';
    videoPlayerElement.load();

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(videoPlayerElement);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            videoPlayerElement.play().catch(e => console.log("Autoplay blocked:", e));
        });
        hls.on(Hls.Events.ERROR, function(event, data) {
            if (data.fatal) {
                switch(data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        console.error("Сетевая ошибка:", data);
                        alert("Сетевая ошибка при загрузке потока.");
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        console.error("Ошибка медиа:", data);
                        alert("Ошибка воспроизведения видео.");
                        break;
                    default:
                        console.error("Неизвестная ошибка HLS:", data);
                        alert("Не удалось воспроизвести поток.");
                        break;
                }
            }
        });
    } else if (videoPlayerElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Для Safari
        videoPlayerElement.src = url;
        videoPlayerElement.addEventListener('loadedmetadata', function() {
            videoPlayerElement.play().catch(e => console.log("Autoplay blocked:", e));
        });
    } else {
        alert('Ваш браузер не поддерживает воспроизведение HLS-потоков.');
    }
}

// Функция получения иконки для группы
function getGroupIcon(group) {
    group = group.toLowerCase();
    
    if (group.includes('news') || group.includes('новости')) return 'fa-newspaper';
    if (group.includes('sport') || group.includes('спорт')) return 'fa-futbol';
    if (group.includes('movie') || group.includes('кино')) return 'fa-film';
    if (group.includes('music') || group.includes('музыка')) return 'fa-music';
    if (group.includes('kid') || group.includes('детск')) return 'fa-child';
    if (group.includes('doc') || group.includes('документ')) return 'fa-video';
    
    return 'fa-tv';
}

// ========= ДОБАВЛЕНИЕ ПОДДЕРЖКИ ПУЛЬТА ДУ / КЛАВИАТУРЫ =========

let currentFocusIndex = 0;
let focusableElements = [];

function updateFocusableElements() {
    const selector = '.channel-card, .watch-btn, .category-btn, .search-input, .filter-select, .m3u-label, .load-btn, .close-btn';
    focusableElements = Array.from(document.querySelectorAll(selector));
}

function moveFocus(direction) {
    updateFocusableElements();
    if (focusableElements.length === 0) return;

    // Убираем фокус с текущего
    if (focusableElements[currentFocusIndex]) {
        focusableElements[currentFocusIndex].blur();
    }

    // Вычисляем новый индекс
    switch(direction) {
        case 'down':
        case 'right':
            currentFocusIndex = (currentFocusIndex + 1) % focusableElements.length;
            break;
        case 'up':
        case 'left':
            currentFocusIndex = (currentFocusIndex - 1 + focusableElements.length) % focusableElements.length;
            break;
    }

    // Устанавливаем фокус
    if (focusableElements[currentFocusIndex]) {
        focusableElements[currentFocusIndex].focus();
        
        // Прокручиваем к элементу, если он вне видимости
        focusableElements[currentFocusIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
        });
    }
}

// Обработка нажатий клавиш
document.addEventListener('keydown', function(e) {
    // Игнорируем, если в фокусе input или select (чтобы не ломать ввод текста)
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        // Разрешаем Enter в input для отправки формы (если нужно)
        if (e.key === 'Enter' && document.activeElement === playlistUrl) {
            loadUrlBtn.click();
        }
        return;
    }

    switch(e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
            e.preventDefault();
            moveFocus('down');
            break;
        case 'ArrowUp':
        case 'ArrowLeft':
            e.preventDefault();
            moveFocus('up');
            break;
        case 'Enter':
            e.preventDefault();
            if (document.activeElement.classList.contains('watch-btn')) {
                document.activeElement.click();
            } else if (document.activeElement.classList.contains('channel-card')) {
                const watchBtn = document.activeElement.querySelector('.watch-btn');
                if (watchBtn) watchBtn.click();
            } else {
                document.activeElement.click();
            }
            break;
        case 'Escape':
            if (playerModal.style.display === 'flex') {
                closeModal.click();
            }
            break;
    }
});

// Инициализация после загрузки страницы
window.addEventListener('DOMContentLoaded', () => {
    // Автоматическая загрузка плейлиста
    loadM3UFromUrl('https://iptv-org.github.io/iptv/index.m3u');
    
    // Инициализация навигации
    updateFocusableElements();
    
    // Через 3 секунды устанавливаем фокус на первый элемент (после загрузки каналов)
    setTimeout(() => {
        updateFocusableElements();
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }, 3000);
});
