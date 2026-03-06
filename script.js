const splash = document.getElementById('splash-screen'), instr = document.getElementById('instructions-screen'),
      app = document.getElementById('main-app'), grid = document.getElementById('stations-grid'),
      playerZone = document.getElementById('player-zone'), audio = document.getElementById('audio-player'),
      transcript = document.getElementById('transcript-box'), popup = document.getElementById('translation-popup'),
      gameZone = document.getElementById('game-zone'), gameBoard = document.getElementById('game-board'),
      feedbackArea = document.getElementById('quiz-feedback-area'), ptsVal = document.getElementById('points-val');

let lifetimeScore = parseInt(localStorage.getItem('classicFootballersScore')) || 0;
let completedLessons = JSON.parse(localStorage.getItem('completedClassicFootballersLessons')) || [];
if(ptsVal) ptsVal.innerText = lifetimeScore;

let wordBucket = []; let currentQ = 0; let attempts = 0; let totalScore = 0; let firstCard = null;

const stations = [
    {file:"01_LevYashin.mp3", title:"Lev Yashin"},
    {file:"02_GordonBanks.mp3", title:"Gordon Banks"},
    {file:"03_DinoZoff.mp3", title:"Dino Zoff"},
    {file:"04_FranzBeckenbauer.mp3", title:"Franz Beckenbauer"},
    {file:"05_BobbyMoore.mp3", title:"Bobby Moore"},
    {file:"06_CarlosAlberto.mp3", title:"Carlos Alberto"},
    {file:"07_DanielPassarella.mp3", title:"Daniel Passarella"},
    {file:"08_GiacintoFacchetti.mp3", title:"Giacinto Facchetti"},
    {file:"09_GaetanoScirea.mp3", title:"Gaetano Scirea"},
    {file:"10_RuudKrol.mp3", title:"Ruud Krol"},
    {file:"11_EliasFigueroa.mp3", title:"Elias Figueroa"},
    {file:"12_JohnCharles.mp3", title:"John Charles"},
    {file:"13_DiegoMaradona.mp3", title:"Diego Maradona"},
    {file:"14_MichelPlatini.mp3", title:"Michel Platini"},
    {file:"15_BobbyCharlton.mp3", title:"Bobby Charlton"},
    {file:"16_Zico.mp3", title:"Zico"},
    {file:"17_GeorgeBest.mp3", title:"George Best"},
    {file:"18_Rivellino.mp3", title:"Rivellino"},
    {file:"19_Socrates.mp3", title:"Sócrates"},
    {file:"20_JohanNeeskens.mp3", title:"Johan Neeskens"},
    {file:"21_Didi.mp3", title:"Didi"},
    {file:"22_RaymondKopa.mp3", title:"Raymond Kopa"},
    {file:"23_LuisSuarez.mp3", title:"Luis Suárez (Spain)"},
    {file:"24_GianniRivera.mp3", title:"Gianni Rivera"},
    {file:"25_TeofiloCubillas.mp3", title:"Teófilo Cubillas"},
    {file:"26_Falcao.mp3", title:"Falcão"},
    {file:"27_Pele.mp3", title:"Pelé"},
    {file:"28_JohanCruyff.mp3", title:"Johan Cruyff"},
    {file:"29_AlfredoDiStefano.mp3", title:"Alfredo Di Stéfano"},
    {file:"30_FerencPuskas.mp3", title:"Ferenc Puskás"},
    {file:"31_Garrincha.mp3", title:"Garrincha"},
    {file:"32_Eusebio.mp3", title:"Eusébio"},
    {file:"33_GerdMuller.mp3", title:"Gerd Müller"},
    {file:"34_Jairzinho.mp3", title:"Jairzinho"},
    {file:"35_PaoloRossi.mp3", title:"Paolo Rossi"},
    {file:"36_KarlHeinzRummenigge.mp3", title:"Karl-Heinz Rummenigge"},
    {file:"37_KennyDalglish.mp3", title:"Kenny Dalglish"},
    {file:"38_KevinKeegan.mp3", title:"Kevin Keegan"},
    {file:"39_MarioKempes.mp3", title:"Mario Kempes"},
    {file:"40_SandorKocsis.mp3", title:"Sándor Kocsis"},
    {file:"41_JustFontaine.mp3", title:"Just Fontaine"},
    {file:"42_GiuseppeMeazza.mp3", title:"Giuseppe Meazza"},
    {file:"43_StanleyMatthews.mp3", title:"Stanley Matthews"},
    {file:"44_TomFinney.mp3", title:"Tom Finney"},
    {file:"45_GunnarNordahl.mp3", title:"Gunnar Nordahl"},
    {file:"46_FranciscoGento.mp3", title:"Francisco Gento"},
    {file:"47_SandroMazzola.mp3", title:"Sandro Mazzola"},
    {file:"48_UweSeeler.mp3", title:"Uwe Seeler"},
    {file:"49_DenisLaw.mp3", title:"Denis Law"},
    {file:"50_JimmyGreaves.mp3", title:"Jimmy Greaves"}
];

stations.forEach((s, i) => {
    const btn = document.createElement('div'); btn.className = 'station-tile';
    if(completedLessons.includes(s.file)) btn.classList.add('completed');
    btn.innerHTML = `<b>${i + 1}</b> ${s.title}`;
    btn.onclick = () => { 
        grid.classList.add('hidden'); playerZone.classList.remove('hidden'); 
        document.getElementById('now-playing-title').innerText = s.title; 
        audio.src = s.file; wordBucket = []; 
    };
    grid.appendChild(btn);
});

document.getElementById('btn-start').onclick = () => { splash.classList.add('hidden'); instr.classList.remove('hidden'); };
document.getElementById('btn-enter').onclick = () => { instr.classList.add('hidden'); app.classList.remove('hidden'); };
document.getElementById('btn-back').onclick = () => { location.reload(); };

document.getElementById('ctrl-play').onclick = () => audio.play();
document.getElementById('ctrl-pause').onclick = () => audio.pause();
document.getElementById('ctrl-stop').onclick = () => { audio.pause(); audio.currentTime = 0; };
document.getElementById('btn-blind').onclick = () => { transcript.classList.add('hidden'); gameZone.classList.add('hidden'); audio.play(); };

document.getElementById('btn-read').onclick = () => {
    if (typeof lessonData === 'undefined') { alert("🚨 FATAL ERROR: Your data.js file did not load!"); return; }
    let fn = decodeURIComponent(audio.src.split('/').pop()); 
    if(!lessonData[fn]) { alert("🚨 ERROR: Could not find text data for " + fn); return; }
    
    const data = lessonData[fn][0];
    transcript.classList.remove('hidden'); gameZone.classList.add('hidden'); transcript.innerHTML = "";
    data.text.split(" ").forEach(w => {
        const span = document.createElement('span'); 
        const clean = w.toLowerCase().replace(/[^a-z0-9ğüşöçı]/gi, "");
        span.innerText = w + " "; span.className = "clickable-word";
        span.onclick = (e) => {
            const tr = data.dict[clean];
            if(tr) {
                if (!wordBucket.some(p => p.en === clean)) wordBucket.push({en: clean, tr: tr});
                popup.innerText = tr; popup.style.left = `${e.clientX}px`; popup.style.top = `${e.clientY - 50}px`;
                popup.classList.remove('hidden'); setTimeout(() => popup.classList.add('hidden'), 2000);
            }
        };
        transcript.appendChild(span);
    });
    audio.play();
};

document.getElementById('btn-game').onclick = () => {
    if (typeof lessonData === 'undefined') { alert("🚨 ERROR: data.js is missing or broken!"); return; }
    let fn = decodeURIComponent(audio.src.split('/').pop()); 
    if(!lessonData[fn]) { alert("🚨 ERROR: Could not find match data for " + fn); return; }

    const lesson = lessonData[fn][0];
    transcript.classList.add('hidden'); gameZone.classList.remove('hidden'); feedbackArea.innerHTML = "";
    gameBoard.innerHTML = ""; firstCard = null; gameBoard.style.display = "grid";
    let set = [...wordBucket];
    for (let k in lesson.dict) { if (set.length >= 8) break; if (!set.some(p => p.en === k)) set.push({en: k, tr: lesson.dict[k]}); }
    let deck = [];
    set.forEach(p => { deck.push({text: p.en, match: p.tr}); deck.push({text: p.tr, match: p.en}); });
    deck.sort(() => Math.random() - 0.5);
    deck.forEach(card => {
        const div = document.createElement('div'); div.className = 'game-card'; div.innerText = card.text;
        div.onclick = () => {
            if (div.classList.contains('correct') || div.classList.contains('selected')) return;
            if (firstCard) {
                if (firstCard.innerText === card.match) {
                    div.classList.add('correct'); firstCard.classList.add('correct'); firstCard = null;
                } else {
                    div.classList.add('wrong'); setTimeout(() => { div.classList.remove('wrong'); firstCard.classList.remove('selected'); firstCard = null; }, 500);
                }
            } else { firstCard = div; div.classList.add('selected'); }
        };
        gameBoard.appendChild(div);
    });
};

document.getElementById('btn-bowling').onclick = () => {
    if (typeof lessonData === 'undefined') { alert("🚨 ERROR: data.js is missing or broken!"); return; }
    let fn = decodeURIComponent(audio.src.split('/').pop()); 
    if(!lessonData[fn]) { alert("🚨 ERROR: Could not find quiz data for " + fn); return; }
    
    const lesson = lessonData[fn][0];
    transcript.classList.add('hidden'); gameZone.classList.remove('hidden'); gameBoard.style.display = "none";
    currentQ = 0; totalScore = 0; attempts = 0;
    runQuiz(lesson);
};

function runQuiz(lesson) {
    if (currentQ >= 7) { finishQuiz(); return; }
    const qData = lesson.questions[currentQ];
    const storyNum = parseInt(decodeURIComponent(audio.src.split('/').pop()).substring(0,2));
    
    feedbackArea.innerHTML = `
        <div id="quiz-container">
            <div class="score-badge">SCORE: ${totalScore} | Q: ${currentQ+1}/7</div>
            <button id="btn-hear-q" class="mode-btn neon-green">👂 LISTEN TO QUESTION</button>
            <div id="mic-box" class="hidden" style="margin-top:20px;">
                <button id="btn-speak" class="mic-btn">🎤</button>
                <p id="mic-status" style="color:#666; font-weight:bold;">Ready...</p>
            </div>
            <div id="res-area"></div>
        </div>`;

    document.getElementById('btn-hear-q').onclick = () => {
        const utter = new SpeechSynthesisUtterance(qData.q);
        utter.lang = 'en-US'; // Mobile Turkish Browser Fix
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            let selectedVoice;
            if (storyNum % 2 !== 0) {
                selectedVoice = voices.find(v => (v.name.includes("Male") || v.name.includes("David")) && v.lang.startsWith('en'));
            } else {
                selectedVoice = voices.find(v => (v.name.includes("Female") || v.name.includes("Zira") || v.name.includes("Google US English")) && v.lang.startsWith('en'));
            }
            utter.voice = selectedVoice || voices.find(v => v.lang.startsWith('en')) || voices[0];
        }
        utter.onend = () => { document.getElementById('mic-box').classList.remove('hidden'); };
        window.speechSynthesis.speak(utter);
    };

    document.getElementById('btn-speak').onclick = function() {
        const btn = this; const status = document.getElementById('mic-status');
        if (window.currentRec) { window.currentRec.abort(); }
        window.currentRec = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
        window.currentRec.lang = 'en-US';
        window.currentRec.interimResults = false;
        window.currentRec.onstart = () => { btn.classList.add('active'); status.innerText = "Listening..."; };
        window.currentRec.onresult = (e) => {
            document.getElementById('mic-box').classList.add('hidden'); 
            const res = e.results[0][0].transcript.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
            const ans = qData.a_en.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
            if (res === ans) {
                let pts = (attempts === 0) ? 20 : 15; totalScore += pts;
                showResult(true, pts === 20 ? "STRIKE! (+20)" : "SPARE! (+15)", qData, lesson);
            } else {
                attempts++;
                if (attempts === 1) { showResult(false, "MISS! TRY AGAIN", qData, lesson, true); }
                else { showResult(false, "MISS! (0 pts)", qData, lesson, false); }
            }
        };
        window.currentRec.onerror = () => { btn.classList.remove('active'); status.innerText = "Error. Try again."; };
        window.currentRec.start();
    };
}

function showResult(isCorrect, msg, qData, lesson, canRetry = false) {
    const area = document.getElementById('res-area');
    area.innerHTML = `<h1 style="color:${isCorrect?'#39ff14':'#f44'}; font-size: 50px;">${msg}</h1>`;
    if (isCorrect || !canRetry) {
        area.innerHTML += `
            <p class="quiz-q-text">Q: ${qData.q}</p>
            <p class="quiz-a-text">EN: ${qData.a_en}</p>
            <p style="color:#888; font-size:30px; font-weight: bold;">TR: ${qData.a_tr}</p>
            <button id="btn-nxt" class="action-btn-large" style="margin-top:30px;">NEXT QUESTION ⮕</button>`;
        document.getElementById('btn-nxt').onclick = () => { currentQ++; attempts = 0; runQuiz(lesson); };
    } else {
        area.innerHTML += `<button id="btn-retry" class="action-btn-large" style="margin-top:30px;">RETRY FOR SPARE</button>`;
        document.getElementById('btn-retry').onclick = () => {
            area.innerHTML = ""; document.getElementById('mic-box').classList.remove('hidden');
            document.getElementById('btn-speak').classList.remove('active');
            document.getElementById('mic-status').innerText = "Ready for Spare...";
        };
    }
}

function finishQuiz() {
    lifetimeScore += totalScore; localStorage.setItem('classicFootballersScore', lifetimeScore);
    const fn = decodeURIComponent(audio.src.split('/').pop());
    if(!completedLessons.includes(fn)) {
        completedLessons.push(fn); localStorage.setItem('completedClassicFootballersLessons', JSON.stringify(completedLessons));
    }
    feedbackArea.innerHTML = `<h1 style="color:#ccff00; font-size: 60px;">FINISHED!</h1><h2 style="font-size: 40px;">QUIZ SCORE: ${totalScore}</h2><button onclick="location.reload()" class="action-btn-large">SAVE & RETURN</button>`;
}
