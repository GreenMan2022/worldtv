// DOM элементы
const channelsContainer = document.getElementById('channelsContainer');
const playerModal = document.getElementById('playerModal');
const videoPlayerElement = document.getElementById('videoPlayerElement');
const closeModal = document.getElementById('closeModal');
const initialLoader = document.getElementById('initialLoader');

// Данные
let channels = [];

// Закрытие модального окна
closeModal.addEventListener('click', function() {
    playerModal.style.display = 'none';
    videoPlayerElement.pause();
    videoPlayerElement.src = '';
});

// Загрузка плейлиста
function loadM3UFromUrl(url) {
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
        })
        .then(data => {
            parseM3UContent(data);
            initialLoader.style.display = 'none'; // Скрываем загрузчик
        })
        .catch(error => {
            console.error('Ошибка загрузки:', error);
            initialLoader.innerHTML = `<p style="color:red">Ошибка загрузки каналов</p>`;
        });
}

// Парсинг M3U
function parseM3UContent(content) {
    channels = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#EXTINF:')) {
            const infoLine = lines[i];
            const urlLine = lines[i + 1];
            
            if (urlLine && !urlLine.startsWith('#')) {
                let name = infoLine.split(',')[1] || 'Канал';
                name = name.trim();
                
                const groupMatch = infoLine.match(/group-title="([^"]*)"/);
                const group = groupMatch ? groupMatch[1] : 'Other';
                
                const logoMatch = infoLine.match(/tvg-logo="([^"]*)"/);
                const logo = logoMatch ? logoMatch[1] : '';
                
                channels.push({
                    name,
                    url: urlLine.trim(),
                    group,
                    logo
                });
            }
        }
    }
    
    // Фильтруем по чёрному списку
    filterBlacklistedChannels();
    renderChannels(channels);
}

// Фильтрация по чёрному списку
function filterBlacklistedChannels() {
    const blacklist = JSON.parse(localStorage.getItem('blacklist') || '[]');
    const before = channels.length;
    channels = channels.filter(channel => !blacklist.includes(channel.url));
    console.log(`Отфильтровано ${before - channels.length} каналов по чёрному списку`);
}

// Отрисовка каналов
function renderChannels(channelsToRender) {
    channelsContainer.innerHTML = '';
    
    channelsToRender.forEach(channel => {
        const groupIcon = getGroupIcon(channel.group);
        
        const channelCard = document.createElement('div');
        channelCard.className = 'channel-card';
        channelCard.setAttribute('tabindex', '0');
        channelCard.innerHTML = `
            <div class="channel-img">
                ${channel.logo ? 
                  `<img src="${channel.logo}" alt="${channel.name}" onerror="this.style.display='none'">` : 
                  `<i class="fas ${groupIcon}"></i>`
                }
            </div>
            <div class="channel-info">
                <h3>${channel.name}</h3>
                <p>${channel.group}</p>
            </div>
        `;
        
        channelCard.addEventListener('click', function() {
            openPlayer(channel.name, channel.url);
        });
        
        // Для пульта — Enter тоже сработает
        channelCard.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                openPlayer(channel.name, channel.url);
            }
        });
        
        channelsContainer.appendChild(channelCard);
    });

    // Фокус на первый канал
    setTimeout(() => {
        const firstCard = document.querySelector('.channel-card');
        if (firstCard) firstCard.focus();
    }, 500);
}

// Открытие плеера
function openPlayer(name, url) {
    playerModal.style.display = 'flex';
    videoPlayerElement.src = '';
    videoPlayerElement.load();

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(videoPlayerElement);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoPlayerElement.play().catch(e => console.log("Autoplay blocked:", e));
        });
        hls.on(Hls.Events.ERROR, function(event, data) {
            if (data.fatal) {
                addToBlacklist(url);
                playerModal.style.display = 'none';
                console.error("Ошибка воспроизведения:", data);
            }
        });
    } else if (videoPlayerElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoPlayerElement.src = url;
        videoPlayerElement.addEventListener('loadedmetadata', () => {
            videoPlayerElement.play().catch(e => console.log("Autoplay blocked:", e));
        });
        videoPlayerElement.addEventListener('error', () => {
            addToBlacklist(url);
            playerModal.style.display = 'none';
        });
    } else {
        // Браузер не поддерживает HLS — тоже в чёрный список
        addToBlacklist(url);
        playerModal.style.display = 'none';
    }
}

// Добавление в чёрный список
function addToBlacklist(url) {
    let blacklist = JSON.parse(localStorage.getItem('blacklist') || '[]');
    if (!blacklist.includes(url)) {
        blacklist.push(url);
        localStorage.setItem('blacklist', JSON.stringify(blacklist));
        console.log(`Канал добавлен в чёрный список:`, url);
    }
}

// Иконка по группе
function getGroupIcon(group) {
    group = group.toLowerCase();
    if (group.includes('news')) return 'fa-newspaper';
    if (group.includes('sport')) return 'fa-futbol';
    if (group.includes('movie')) return 'fa-film';
    if (group.includes('music')) return 'fa-music';
    if (group.includes('kid')) return 'fa-child';
    if (group.includes('doc')) return 'fa-video';
    return 'fa-tv';
}

// ========= НАВИГАЦИЯ С ПУЛЬТА =========
let currentFocusIndex = 0;
let focusableElements = [];

function updateFocusableElements() {
    focusableElements = Array.from(document.querySelectorAll('.channel-card'));
}

function moveFocus(direction) {
    updateFocusableElements();
    if (focusableElements.length === 0) return;

    if (focusableElements[currentFocusIndex]) {
        focusableElements[currentFocusIndex].blur();
    }

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

    if (focusableElements[currentFocusIndex]) {
        focusableElements[currentFocusIndex].focus();
        focusableElements[currentFocusIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }
}

document.addEventListener('keydown', function(e) {
    if (playerModal.style.display === 'flex') {
        if (e.key === 'Escape') {
            closeModal.click();
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
            if (document.activeElement.classList.contains('channel-card')) {
                const card = document.activeElement;
                const index = Array.from(channelsContainer.children).indexOf(card);
                if (index >= 0 && index < channels.length) {
                    const channel = channels[index];
                    openPlayer(channel.name, channel.url);
                }
            }
            break;
    }
});

// ========= ЗАГРУЗКА ПРИ СТАРТЕ =========
document.addEventListener('DOMContentLoaded', () => {
    loadM3UFromUrl('https://iptv-org.github.io/iptv/index.m3u');
});
