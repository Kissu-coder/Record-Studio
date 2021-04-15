    const { desktopCapturer, remote } = require('electron');

    const { dialog, Menu } = remote;

    const { writeFile } = require('fs');

    const videoElement = document.querySelector('video');

    let mediaRecorder;
    const recordedChunks = [];

    const videoStatus = document.getElementsByClassName('video-status')[0];
    videoStatus.textContent = "Waiting for you to start recording x3";

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
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.mimeType = 'video/webm';

        // register event handlers
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.onstop = handleStop;

        // captures all recorded chunks
        function handleDataAvailable(e) {
            console.log('Video data available!');
            recordedChunks.push(e.data);
        }

        async function handleStop(e) {
            const blob = new Blob(recordedChunks, {
                type: 'video/webm'
            });

            const buffer = Buffer.from(await blob.arrayBuffer());
            //raw data done!!!!!


            const { filePath } = await dialog.showSaveDialog({
                buttonLabel: 'Save Video!',
                defaultPath: 'video.webm'
            });

            console.log(filePath);
                writeFile(filePath, buffer, () => console.log("Video Saved successfully!!!!"));
        }
  
        // Buttons - Event Listeners
        const startBtn = document.getElementById('startBtn');
        startBtn.onclick = (e) => {
            mediaRecorder.start();
            startBtn.classList.add('is-danger');
            startBtn.innerText = 'Recording';
            startBtn.disabled = true;
            stopBtn.disabled = false;
            videoStatus.textContent = "Recording :D";
            
        };
        const stopBtn = document.getElementById('stopBtn');
        stopBtn.disabled = true;
        stopBtn.onclick = e => {
            mediaRecorder.stop();
            startBtn.classList.remove('is-danger');
            startBtn.innerText = 'Start';
            startBtn.disabled = false;
            stopBtn.disabled = true;
            videoStatus.textContent = "Recording finished!";
        };

    }
