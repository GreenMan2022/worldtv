document.addEventListener('DOMContentLoaded', () => {
    const channelsList = document.getElementById('channels-list');
    const videoPlayer = document.getElementById('videoPlayer');
    const searchInput = document.getElementById('search');
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const currentChannelNameEl = document.getElementById('current-channel-name');

    let allChannels = [];
    let currentPage = 1;
    const channelsPerPage = 20;

    // ====================
    // Загрузка и парсинг
    // ====================
    async function fetchChannels() {
        const CACHE_KEY = 'iptv_channels';
        const CACHE_EXPIRY = 1000 * 60 * 60 * 24; // 24 часа

        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_EXPIRY) {
                return data;
            }
        }

        try {
            const proxyUrl = 'https://api.allorigins.win/raw?url=';
            const targetUrl = 'https://iptv-org.github.io/iptv/index.m3u8';
            const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
            if (!response.ok) throw new Error(`Ошибка при получении данных (${response.status})`);

            const data = await response.text();
            const channels = parseM3U(data);

            localStorage.setItem(CACHE_KEY, JSON.stringify({
                data: channels,
                timestamp: Date.now()
            }));

            return channels;
        } catch (err) {
            console.error(err.message);
            if (cached) return JSON.parse(cached).data;
            throw err;
        }
    }

    function parseM3U(data) {
        const lines = data.split('\n');
        const channels = [];

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('#EXTINF')) {
                const line = lines[i];
                const url = lines[i + 1]?.trim();

                if (!url || url.startsWith('#')) continue;

                let group = 'unknown';
                const groupMatch = line.match(/group-title="([^"]*)"/);
                if (groupMatch) {
                    group = groupMatch[1].toLowerCase();
                }

                const parts = line.split(',');
                const name = parts[parts.length - 1].trim();

                channels.push({ name, url, group });
                i++;
            }
        }

        return channels;
    }

    // ====================
    // Рендеринг
    // ====================
    function renderChannelsPage(channels, page) {
        channelsList.innerHTML = '';
        const start = (page - 1) * channelsPerPage;
        const end = start + channelsPerPage;
        const pageChannels = channels.slice(start, end);

        if (pageChannels.length === 0) {
            channelsList.innerHTML = '<li>Каналы не найдены</li>';
            return;
        }

        for (const channel of pageChannels) {
            let li = document.createElement('li');
            li.className = 'channel-item';
            li.textContent = channel.name;
            li.setAttribute("tabIndex", "0");
            li.addEventListener('click', () => playChannel(channel.url, channel.name));
            channelsList.appendChild(li);
        }
    }

    async function renderChannels() {
        loadingEl.classList.remove('hidden');
        channelsList.innerHTML = '';

        try {
            allChannels = await fetchChannels();
            if (allChannels.length === 0) throw new Error("Нет каналов");

            renderChannelsPage(allChannels, 1);
            loadingEl.classList.add('hidden');
        } catch (err) {
            console.error(err);
            loadingEl.classList.add('hidden');
            document.getElementById('error').classList.remove('hidden');
        }
    }

    // ====================
    // Воспроизведение
    // ====================
    function playChannel(url, name) {
    const currentChannelNameEl = document.getElementById('current-channel-name');
    currentChannelNameEl.textContent = name || 'Неизвестный канал';

    const video = document.getElementById('videoPlayer');
    video.src = ''; // очищаем

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(e => console.error("Ошибка воспроизведения:", e));
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                alert("Ошибка потока: " + data.type);
            }
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Для Safari
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
            video.play().catch(e => console.error("Ошибка воспроизведения:", e));
        });
    } else {
        alert("Ваш браузер не поддерживает HLS-потоки.");
    }
}

    // ====================
    // Поиск
    // ====================
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = allChannels.filter(channel => 
            channel.name.toLowerCase().includes(query)
        );
        currentPage = 1;
        renderChannelsPage(filtered, currentPage);
    });

    // ====================
    // Клавиатурная навигация
    // ====================
    document.addEventListener('keydown', (e) => {
        const items = document.querySelectorAll('.channel-item');
        const currentIndex = Array.from(items).findIndex(item => item === document.activeElement);

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (currentIndex < items.length - 1) items[currentIndex + 1].focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentIndex > 0) items[currentIndex - 1].focus();
        } else if (e.key === 'Enter' && document.activeElement.classList.contains('channel-item')) {
            document.activeElement.click();
        }
    });

    // ====================
    // Обработчики
    // ====================
    document.getElementById('retry')?.addEventListener('click', renderChannels);

    // ====================
    // Запуск
    // ====================
    renderChannels();
});
