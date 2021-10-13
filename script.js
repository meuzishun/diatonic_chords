const myAudioCtx = new AudioContext();
const triadBtns = [...document.querySelectorAll('.triad')];
const audioFiles = {};
let currentlyPlaying;

const progressionOptions = {
    I: ['I', 'I6', 'I64', 'ii', 'ii6', 'iii', 'IV', 'IV6', 'IV64', 'V', 'V6', 'V64', 'vi', 'viio', 'viio6'],
    I6: ['ii6', 'IV', 'V', 'V64', 'viio6'],
    I64: ['V'],
    ii: ['V', 'V6'],
    ii6: ['I64', 'V'],
    iii: ['IV', 'vi'],
    IV: ['I', 'I6', 'I64', 'ii', 'ii6', 'V', 'viio', 'viio6'],
    IV6: ['V'],
    IV64: ['I'],
    V: ['I', 'I6', 'vi'],
    V6: ['I'],
    V64: ['I', 'I6'],
    vi: ['ii', 'ii6', 'IV'],
    viio: ['iii'],
    viio6: ['I', 'I6']
}

// async function getFile(audioContext, filepath) {
//     const response = await fetch(filepath);
//     const arrayBuffer = await response.arrayBuffer();
//     const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
//     return audioBuffer;
// }

function storeBuffer(audioBuffer, fileName) {
    audioBuffer.midi = fileName;
    audioFiles[fileName] = audioBuffer;
}

function loadAudioFile(audioContext, fileName) {
    fetch(`audio/${fileName}.wav`)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer)
    .then(audioBuffer => storeBuffer(audioBuffer, fileName)));
}

//! Ok, so... it looks like returning fetch (or whatever sorta promise) will return THE PROMISE (with a pending, fulfilled or rejected status), not the fulfilled value (which you might think would happen).  So whatever you plan to do with the value of the fulfilled promise, you must do it in a .then() chained function(?)?  It seems like that at least works... is it the only way (other than async await)?  Time will tell...
// getFile(myAudioCtx, `I`);

// Promise.all([test]).then(values => {
//     console.log(values);
// });

// async function storeBuffer(fileName) {
//     const audioFile = await getFile(myAudioCtx, `audio/${fileName}.wav`);
//     audioFile.midi = fileName;
//     audioFiles[fileName] = audioFile;
// }

// function storeBuffer(fileName) {
    // const audioFile = getFile(myAudioCtx, `audio/${fileName}.wav`);
    // console.log(audioFile);
    // audioFile.midi = fileName;
    // audioFiles[fileName] = audioFile;
// }

// triadBtns.forEach(btn => storeBuffer(btn.dataset.file));
triadBtns.forEach(btn => loadAudioFile(myAudioCtx, btn.dataset.file));

const createSample = function(audioBuffer) {
    const sample = myAudioCtx.createBufferSource();
    sample.buffer = audioBuffer;
    return sample;
}

const checkCurrentPlaying = function(sample) {
    if (currentlyPlaying) {
        currentlyPlaying.stop();
    }
    currentlyPlaying = sample;
}

const highlightPossibleChords = function(chords) {
    triadBtns.forEach(btn => {
        btn.classList.add('not-possible');
        btn.removeEventListener('click', playChord);
    });
    chords.forEach(chord => {
        const btn = document.getElementById(chord);
        btn.classList.remove('not-possible');
        btn.addEventListener('click', playChord);
    });

}

const chooseOptions = function(id) {
    const nextPossibleChords = progressionOptions[id];
    highlightPossibleChords(nextPossibleChords);
}

const playChord = function(e) {
    const file = e.currentTarget.dataset.file;
    const sample = createSample(audioFiles[file]);
    sample.connect(myAudioCtx.destination);
    checkCurrentPlaying(sample);
    sample.start();
    chooseOptions(file);
}

triadBtns.forEach(btn => {
    btn.addEventListener('click', playChord);
});

