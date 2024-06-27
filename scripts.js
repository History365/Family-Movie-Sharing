document.addEventListener("DOMContentLoaded", function() {
    const videoLinks = document.querySelectorAll('.category-list .video a');
    const mainVideo = document.getElementById('mainVideo');
    const downloadMainVideo = document.getElementById('downloadMainVideo');
    const moviesLink = document.getElementById('moviesLink');
    const tvShowsLink = document.getElementById('tvShowsLink');
    const homeLink = document.getElementById('homeLink');
    const myListLink = document.getElementById('myListLink');
    const searchInput = document.getElementById('searchInput');
    const signInButton = document.getElementById('signInButton');
    const signUpButton = document.getElementById('signUpButton');
    const signInModal = document.getElementById('signInModal');
    const signUpModal = document.getElementById('signUpModal');
    const closeButtons = document.querySelectorAll('.close-button');
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    const continueWatchingList = document.getElementById('continueWatchingList');
    const profileSelect = document.getElementById('profileSelect');
    const addProfileButton = document.getElementById('addProfileButton');
    const signOutButton = document.getElementById('signOutButton');

    let isSignedIn = false;
    let currentUser = null;
    let currentProfile = null;

    // Show sign-in modal on load if not signed in
    if (!localStorage.getItem('currentUser')) {
        signInModal.style.display = 'flex';
    } else {
        currentUser = localStorage.getItem('currentUser');
        loadProfiles();
        loadContinueWatching();
    }

    videoLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const videoSrc = this.getAttribute('data-video');
            mainVideo.querySelector('source').src = videoSrc;
            mainVideo.load();
            mainVideo.play();
            downloadMainVideo.href = videoSrc;
        });
    });

    signInButton.addEventListener('click', function() {
        signInModal.style.display = 'flex';
    });

    signUpButton.addEventListener('click', function() {
        signUpModal.style.display = 'flex';
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            signInModal.style.display = 'none';
            signUpModal.style.display = 'none';
        });
    });

    window.addEventListener('click', function(event) {
        if (event.target === signInModal) {
            signInModal.style.display = 'none';
        }
        if (event.target === signUpModal) {
            signUpModal.style.display = 'none';
        }
    });

    signInForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('signInUsername').value;
        const password = document.getElementById('signInPassword').value;
        const users = JSON.parse(localStorage.getItem('users')) || [];

        const user = users.find(user => user.username === username && user.password === password);
        if (user) {
            isSignedIn = true;
            currentUser = user.username;
            localStorage.setItem('currentUser', currentUser);
            signInModal.style.display = 'none';
            loadProfiles();
            loadContinueWatching();
        } else {
            alert('Invalid credentials');
        }
    });

    signUpForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('signUpUsername').value;
        const password = document.getElementById('signUpPassword').value;
        const users = JSON.parse(localStorage.getItem('users')) || [];

        if (users.find(user => user.username === username)) {
            alert('Username already exists');
        } else {
            users.push({ username, password });
            localStorage.setItem('users', JSON.stringify(users));
            signUpModal.style.display = 'none';
            alert('Account created successfully');
        }
    });

    mainVideo.addEventListener('timeupdate', function() {
        if (isSignedIn) {
            saveContinueWatching(mainVideo.querySelector('source').src, mainVideo.currentTime);
        }
    });

    addProfileButton.addEventListener('click', function() {
        const profileName = prompt('Enter profile name:');
        if (profileName) {
            addProfile(profileName);
        }
    });

    profileSelect.addEventListener('change', function() {
        currentProfile = this.value;
        loadContinueWatching();
    });

    signOutButton.addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        location.reload();
    });

    function loadProfiles() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(user => user.username === currentUser);
        if (user && user.profiles) {
            profileSelect.innerHTML = '';
            user.profiles.forEach(profile => {
                const option = document.createElement('option');
                option.value = profile;
                option.textContent = profile;
                profileSelect.appendChild(option);
            });
            currentProfile = profileSelect.value;
        } else {
            addProfile('Default');
        }
    }

    function addProfile(profileName) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(user => user.username === currentUser);
        if (user) {
            if (!user.profiles) {
                user.profiles = [];
            }
            user.profiles.push(profileName);
            localStorage.setItem('users', JSON.stringify(users));
            loadProfiles();
        }
    }

    function loadContinueWatching() {
        continueWatchingList.innerHTML = '';
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(user => user.username === currentUser);
        if (user && user.continueWatching && user.continueWatching[currentProfile]) {
            user.continueWatching[currentProfile].forEach(item => {
                const videoElement = document.createElement('div');
                videoElement.className = 'video';
                videoElement.innerHTML = `
                    <a href="#" data-video="${item.video}">
                        <img src="${item.thumbnail}" alt="${item.title}">
                        <span>${item.title}</span>
                    </a>
                `;
                continueWatchingList.appendChild(videoElement);

                videoElement.querySelector('a').addEventListener('click', function(event) {
                    event.preventDefault();
                    mainVideo.querySelector('source').src = this.getAttribute('data-video');
                    mainVideo.currentTime = item.time;
                    mainVideo.load();
                    mainVideo.play();
                    downloadMainVideo.href = item.video;
                });
            });
        }
    }

    function saveContinueWatching(video, time) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(user => user.username === currentUser);
        if (user) {
            if (!user.continueWatching) {
                user.continueWatching = {};
            }
            if (!user.continueWatching[currentProfile]) {
                user.continueWatching[currentProfile] = [];
            }
            const existingItem = user.continueWatching[currentProfile].find(item => item.video === video);
            if (existingItem) {
                existingItem.time = time;
            } else {
                user.continueWatching[currentProfile].push({ video, time, title: 'Video Title', thumbnail: 'thumbnail.jpg' });
            }
            localStorage.setItem('users', JSON.stringify(users));
        }
    }
});
