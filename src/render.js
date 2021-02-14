const { desktopCapturer, remote } = require('electron');
const { Menu } = remote;

const videoElement = document.querySelector('video');
const startBtn = document.querySelector('startBtn');
const stopBtn = document.querySelector('stopBtn');
const videoSelectBtn = document.getElementById('videoSelection');
console.log(videoSelectBtn)

videoSelectBtn.onclick = getVideoSources();

async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    });

    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectSource()
            };
        })
    );

    videoOptionsMenu.popup();
    console.log(videoOptionsMenu)
}