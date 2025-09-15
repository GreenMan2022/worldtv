document.addEventListener('DOMContentLoaded', () => {
    const channelsList = document.getElementById('channels-list');
    const videoPlayer = document.getElementById('videoPlayer');

    async function fetchChannels() {
        try {
            const response = await fetch('https://iptv-org.github.io/iptv/index.m3u8');
            if (!response.ok) throw new Error(`Ошибка при получении данных (${response.status})`);

            const data = await response.text();
            return parseM3U(data);
        } catch (err) {
            console.error(err.message);
        }
    }

    function parseM3U(data) {
        const lines = data.split('\n');
        const channels = [];

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('#EXTINF')) {
                const info = lines[i].split(',');
                const name = info[info.length - 1].trim();
                const url = lines[i + 1].trim();
                channels.push({ name, url });
                i++;
            }
        }

        return channels;
    }

    async function renderChannels() {
        const channelsData = await fetchChannels();

        for (const channel of channelsData) {
            let li = document.createElement('li');
            li.className = 'channel-item';
            li.textContent = channel.name;
            li.setAttribute("tabIndex", "0");
            li.addEventListener('click', () => playChannel(channel.url));
            channelsList.appendChild(li);
        }
    }

    function playChannel(url) {
        videoPlayer.src = url;
        videoPlayer.load();
        videoPlayer.play();
    }

    renderChannels();
});
