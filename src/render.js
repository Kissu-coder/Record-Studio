const { desktopCapturer, remote } = require('electron');
const { dialog, Menu } = remote;
const { writeFile } = require('fs');

const videoElement = document.querySelector('video');
const startBtn = document.querySelector('startBtn');
const stopBtn = document.querySelector('stopBtn');

const videoSelectBtn = document.getElementById('videoSelection');
videoSelectBtn.onclick = getVideoSources;

async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    });

    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectSource(source)
            };
        })
    );

    videoOptionsMenu.popup();
}

let mediaRecoder;
const recordedChunks = [];

async function selectSource(source) {
    videoSelectBtn.innerText = source.name;

    const constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    };
    //create a stream
    const stream = await navigator.mediaDevices
        .getUserMedia(constraints);

    //preview the source in a video element
    videoElement.srcObject = stream;
    videoElement.play();

    // create the media recoder
    const options = { mimeType: 'video/webm, codecs=vp9' };
    mediaRecoder = new mediaRecoder(stream, options);

    // register event handlers
    mediaRecoder.ondataavailable = handleDataAvailable;
    mediaRecoder.options = handleStop;

    // captures all recorded chunks
    function handleDataAvailable(e) {
        console.log('Video data available!');
        recordedChunks.push(e.data);
    }

    async function handleStop(e) {
        const blob = new Blob(recordedChunks, {
            type: 'video/webm; codecs=vp9'
        });

        const buffer = Buffer.from(await blob.arrayBuffer());
        //raw data done!!!!!


        const { filePath } = await dialog.showSaveDialog({
            buttonLabel: 'Save Video!',
            defaultPath: 'vid-${Date.now()}.webm'
        });
    }
}