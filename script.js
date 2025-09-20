// Global variables
let currentPlaylist = null;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadPlaylistsFromConfig();
    loadFromLocalStorage();
    setupEventListeners();
});

// Load playlists from external config
async function loadPlaylistsFromConfig() {
    try {
        const response = await fetch('/playlists.json');
        if (!response.ok) return;
        
        const config = await response.json();
        displayPlaylistsList(config.playlists);
    } catch (error) {
        console.log('No external playlists config found, using default interface');
    }
}

// Display available playlists
function displayPlaylistsList(playlists) {
    const playlistList = document.getElementById('playlistList');
    if (!playlistList || !playlists) return;

    playlistList.innerHTML = '';

    playlists.forEach(playlist => {
        const li = document.createElement('li');
        li.innerHTML = `
            <button class="playlist-item" data-url="${playlist.url}">
                <span class="playlist-name">${playlist.name}</span>
                ${playlist.description ? `<span class="playlist-desc">${playlist.description}</span>` : ''}
            </button>
        `;

        const button = li.querySelector('button');
        button.addEventListener('click', () => {
            loadPlaylistFromUrl(playlist.url, playlist.name);
        });

        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                loadPlaylistFromUrl(playlist.url, playlist.name);
            }
        });

        playlistList.appendChild(li);
    });

    // Show playlist list section
    document.getElementById('playlistsSection').style.display = 'block';
}

// Load playlist from URL
async function loadPlaylistFromUrl(url, name) {
    try {
        document.getElementById('loading').style.display = 'block';
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch playlist');
        
        const content = await response.text();
        parseM3U(content, name, url);
        
    } catch (error) {
        console.error('Error loading playlist:', error);
        alert('Error loading playlist: ' + error.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Upload button
    document.getElementById('uploadBtn').addEventListener('click', function() {
        document.getElementById('fileInput').click();
    });

    // File input
    document.getElementById('fileInput').addEventListener('change', function(e) {
        handleFileUpload(e.target.files[0]);
    });

    // URL input form
    document.getElementById('urlForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const url = document.getElementById('playlistUrl').value;
        const name = document.getElementById('playlistName').value || 'Custom Playlist';
        loadPlaylistFromUrl(url, name);
    });

    // Search
    document.getElementById('searchInput').addEventListener('input', function(e) {
        filterChannels(e.target.value);
    });

    // Favorites button
    document.getElementById('favoritesBtn').addEventListener('click', function() {
        const favoritesContainer = document.getElementById('favoritesContainer');
        favoritesContainer.style.display = favoritesContainer.style.display === 'none' ? 'block' : 'none';
    });

    // Back button
    document.getElementById('backBtn').addEventListener('click', function() {
        document.getElementById('mainContent').style.display = 'none';
        document.getElementById('setup').style.display = 'block';
        document.getElementById('playerContainer').style.display = 'none';
    });

    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', function() {
        const settings = document.getElementById('settings');
        settings.style.display = settings.style.display === 'none' ? 'block' : 'none';
    });

    // Save settings
    document.getElementById('saveSettings').addEventListener('click', function() {
        saveSettings();
    });

    // Clear data
    document.getElementById('clearData').addEventListener('click', function() {
        clearAllData();
    });
}

// Handle file upload
function handleFileUpload(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        parseM3U(e.target.result, file.name, null);
    };
    reader.readAsText(file);
}

// Parse M3U content
function parseM3U(content, name, url) {
    const lines = content.split('\n');
    const channels = [];
    let currentChannel = null;
    let group = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('#EXTINF')) {
            currentChannel = {
                name: extractName(line),
                logo: extractLogo(line),
                group: extractGroup(line) || 'General',
                url: ''
            };
        } else if (currentChannel && line.trim() && !line.startsWith('#')) {
            currentChannel.url = line.trim();
            channels.push(currentChannel);
            currentChannel = null;
        }
    }

    currentPlaylist = {
        name: name,
        url: url,
        channels: groupChannels(channels),
        lastUpdated: new Date().toISOString()
    };

    saveToLocalStorage();
    displayPlaylist();
}

// Extract channel name from EXTINF line
function extractName(line) {
    const nameMatch = line.match(/,(.*?)(?=\s*$)/);
    return nameMatch ? nameMatch[1].trim() : 'Unknown Channel';
}

// Extract logo URL from EXTINF line
function extractLogo(line) {
    const logoMatch = line.match(/tvg-logo="([^"]*)"/);
    return logoMatch ? logoMatch[1] : '';
}

// Extract group title from EXTINF line
function extractGroup(line) {
    const groupMatch = line.match(/group-title="([^"]*)"/);
    return groupMatch ? groupMatch[1] : '';
}

// Group channels by category
function groupChannels(channels) {
    const groups = {};
    
    channels.forEach(channel => {
        if (!groups[channel.group]) {
            groups[channel.group] = [];
        }
        groups[channel.group].push(channel);
    });

    return Object.entries(groups)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, channels]) => ({
            name: name,
            channels: channels.sort((a, b) => a.name.localeCompare(b.name))
        }));
}

// Display the main playlist
function displayPlaylist() {
    const mainContent = document.getElementById('mainContent');
    const playlistInfo = document.getElementById('playlistInfo');
    
    mainContent.style.display = 'block';
    document.getElementById('setup').style.display = 'none';

    playlistInfo.textContent = currentPlaylist.name;

    displayGroups();
    updateFavoritesList();
}

// Display channel groups
function displayGroups() {
    const groupsContainer = document.getElementById('groups');
    groupsContainer.innerHTML = '';

    currentPlaylist.channels.forEach(group => {
        const groupElement = document.createElement('button');
        groupElement.className = 'group';
        groupElement.innerHTML = `
            <span class="group-name">${group.name}</span>
            <span class="group-count">${group.channels.length}</span>
        `;
        
        groupElement.addEventListener('click', function() {
            toggleGroup(group);
        });

        groupElement.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleGroup(group);
            }
        });

        groupsContainer.appendChild(groupElement);
    });
}

// Toggle group expansion
function toggleGroup(group) {
    const channelsContainer = document.getElementById('channels');
    channelsContainer.innerHTML = '';

    if (channelsContainer.dataset.group === group.name) {
        channelsContainer.dataset.group = '';
        channelsContainer.style.display = 'none';
        return;
    }

    channelsContainer.dataset.group = group.name;
    channelsContainer.style.display = 'block';

    group.channels.forEach(channel => {
        const isFavorite = favorites.some(fav => 
            fav.url === channel.url && fav.name === channel.name
        );

        const channelElement = document.createElement('button');
        channelElement.className = 'channel';
        channelElement.innerHTML = `
            <img src="${channel.logo || 'icons/default-channel.png'}" alt="${channel.name}" class="channel-logo">
            <span class="channel-name">${channel.name}</span>
            <span class="favorite-icon">${isFavorite ? '★' : '☆'}</span>
        `;
        
        channelElement.addEventListener('click', function() {
            playChannel(channel);
        });

        channelElement.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                playChannel(channel);
            }
        });

        // Double click to toggle favorite
        channelElement.addEventListener('dblclick', function(e) {
            e.stopPropagation();
            toggleFavorite(channel);
        });

        channelsContainer.appendChild(channelElement);
    });
}

// Play selected channel
function playChannel(channel) {
    const videoPlayer = document.getElementById('videoPlayer');
    const playerContainer = document.getElementById('playerContainer');
    const channelInfo = document.getElementById('channelInfo');

    playerContainer.style.display = 'block';
    channelInfo.textContent = channel.name;

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(channel.url);
        hls.attachMedia(videoPlayer);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            videoPlayer.play().catch(function(error) {
                console.error('Playback error:', error);
            });
        });
    } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
        videoPlayer.src = channel.url;
        videoPlayer.play().catch(function(error) {
            console.error('Playback error:', error);
        });
    } else {
        alert('HLS is not supported in your browser');
    }

    addToHistory(channel);
}

// Toggle favorite channel
function toggleFavorite(channel) {
    const index = favorites.findIndex(fav => 
        fav.url === channel.url && fav.name === channel.name
    );

    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(channel);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesList();
    
    // Refresh current view to update favorite icons
    if (currentPlaylist) {
        const currentGroup = document.getElementById('channels').dataset.group;
        if (currentGroup) {
            const group = currentPlaylist.channels.find(g => g.name === currentGroup);
            if (group) {
                toggleGroup(group);
            }
        }
    }
}

// Update favorites list
function updateFavoritesList() {
    const favoritesList = document.getElementById('favoritesList');
    if (!favoritesList) return;

    favoritesList.innerHTML = '';

    favorites.forEach(channel => {
        const li = document.createElement('li');
        
        const button = document.createElement('button');
        button.className = 'favorite-item';
        button.innerHTML = `
            <img src="${channel.logo || 'icons/default-channel.png'}" alt="${channel.name}" class="favorite-logo">
            <span class="favorite-name">${channel.name}</span>
        `;
        
        button.addEventListener('click', function() {
            playChannel(channel);
        });

        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                playChannel(channel);
            }
        });

        li.appendChild(button);
        favoritesList.appendChild(li);
    });
}

// Filter channels by search query
function filterChannels(query) {
    const channels = document.querySelectorAll('.channel');
    const searchTerm = query.toLowerCase();

    channels.forEach(channel => {
        const name = channel.querySelector('.channel-name').textContent.toLowerCase();
        channel.style.display = name.includes(searchTerm) ? 'flex' : 'none';
    });
}

// Add channel to history
function addToHistory(channel) {
    let history = JSON.parse(localStorage.getItem('history')) || [];
    history = history.filter(item => item.url !== channel.url);
    history.unshift({
        name: channel.name,
        url: channel.url,
        logo: channel.logo,
        watchedAt: new Date().toISOString()
    });
    history = history.slice(0, 50);
    localStorage.setItem('history', JSON.stringify(history));
}

// Save to localStorage
function saveToLocalStorage() {
    if (currentPlaylist) {
        localStorage.setItem('currentPlaylist', JSON.stringify(currentPlaylist));
    }
}

// Load from localStorage
function loadFromLocalStorage() {
    const savedPlaylist = localStorage.getItem('currentPlaylist');
    if (savedPlaylist) {
        currentPlaylist = JSON.parse(savedPlaylist);
        displayPlaylist();
    }
}

// Save settings
function saveSettings() {
    const settings = {
        autoPlay: document.getElementById('autoPlay').checked,
        quality: document.getElementById('quality').value
    };
    
    localStorage.setItem('settings', JSON.stringify(settings));
    document.getElementById('settings').style.display = 'none';
    alert('Settings saved!');
}

// Clear all data
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        localStorage.clear();
        location.reload();
    }
}
