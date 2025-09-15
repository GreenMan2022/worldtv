document.addEventListener('DOMContentLoaded', () => {
    const channelsList = document.getElementById('channels-list');
    
    // Функция для загрузки данных с GitHub
    async function fetchChannels() {
        try {
            const response = await fetch('https://api.github.com/repos/your_username/your_repo_name/contents/channels.json');
            if (!response.ok) throw new Error(`Ошибка при получении данных (${response.status})`);
            
            const data = await response.json();
            return JSON.parse(atob(data.content));
        } catch (err) {
            console.error(err.message);
        }
    }

    // Отображение каналов
    async function renderChannels() {
        const channelsData = await fetchChannels();
        
        for (const channel of channelsData.channels) {
            let li = document.createElement('li');
            li.className = 'channel-item';
            li.textContent = channel.name;
            li.setAttribute("tabIndex", "0");
            channelsList.appendChild(li);
        }
    }

    // Обработка клавиш клавиатуры / пульта
    window.addEventListener('keydown', event => {
        switch(event.keyCode || event.which) {
            case 38: // вверх
                focusPreviousItem();
                break;
            case 40: // вниз
                focusNextItem();
                break;
            default:
                break;
        }
    });

    // Навигация по списку каналов
    function focusNextItem() {
        const currentFocus = document.querySelector('.active');
        if(currentFocus && currentFocus.nextSibling) {
            currentFocus.classList.remove('active');
            currentFocus.nextSibling.focus();
            currentFocus.nextSibling.classList.add('active');
        }
    }

    function focusPreviousItem() {
        const currentFocus = document.querySelector('.active');
        if(currentFocus && currentFocus.previousSibling) {
            currentFocus.classList.remove('active');
            currentFocus.previousSibling.focus();
            currentFocus.previousSibling.classList.add('active');
        }
    }

    renderChannels();
});
