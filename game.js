const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const songs = [
  {title:"Fresh Start",week:"Week 1",bpm:110,duration:35,seed:1},
  {title:"Neon Showdown",week:"Week 1",bpm:125,duration:40,seed:2},
  {title:"Last One Standing",week:"Week 1",bpm:140,duration:45,seed:3}
];
let currentSong=songs[0], notes=[], active=false, paused=false, raf=0, startAt=0, elapsed=0;
let score=0, combo=0, misses=0, health=100, hits=0, totalNotes=0, lastFrame=0;
let speed=1, volume=.6, difficulty="normal";
const arrows=["←","↓","↑","→"], keys={ArrowLeft:0,ArrowDown:1,ArrowUp:2,ArrowRight:3,a:0,s:1,w:2,d:3};

function showScreen(id){ $$(".screen").forEach(x=>x.classList.toggle("active",x.id===id)); }
$$("[data-screen]").forEach(b=>b.addEventListener("click",()=>showScreen(b.dataset.screen)));
function renderSongs(){
  $("#songList").innerHTML=songs.map((s,i)=>`<article class="song-card"><h3>${s.title}</h3><p>${s.week} · ${s.bpm} BPM · ${s.duration}s</p><button data-song="${i}">PLAY ▶</button></article>`).join("");
  $$("[data-song]").forEach(b=>b.addEventListener("click",()=>startSong(songs[+b.dataset.song])));
}
renderSongs();
$("#storyStart").onclick=()=>startSong(songs[0]);
$("#scrollSpeed").oninput=e=>{speed=+e.target.value;$("#speedValue").textContent=speed.toFixed(1)+"x"};
$("#volume").oninput=e=>{volume=+e.target.value/100;$("#volumeValue").textContent=e.target.value+"%"};
$("#difficulty").onchange=e=>difficulty=e.target.value;

function seeded(seed){let x=seed;return()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296}}
function startSong(song){
  currentSong=song; score=0;combo=0;misses=0;health=100;hits=0;elapsed=0;active=true;paused=false;
  const rand=seeded(song.seed), beat=60/song.bpm;
  notes=[];
  const density=difficulty==="easy"?1.5:difficulty==="hard"?.65:1;
  for(let t=2;t<song.duration-1;t+=beat*density){
    notes.push({lane:Math.floor(rand()*4),time:t,hit:false,missed:false,id:notes.length});
    if(difficulty==="hard"&&rand()>.65) notes.push({lane:Math.floor(rand()*4),time:t+beat*.45,hit:false,missed:false,id:notes.length});
  }
  totalNotes=notes.length;$("#songTitle").textContent=song.title.toUpperCase();
  $("#notes").innerHTML="";$("#pauseOverlay").classList.add("hidden");$("#resultOverlay").classList.add("hidden");
  showScreen("game");startAt=performance.now();lastFrame=startAt;cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);
}
const travel=2.1;
const gamepadWasDown = new Map();
function pollGamepad(){
  if (!navigator.getGamepads) return;
  const pads = navigator.getGamepads();
  for (const pad of pads) {
    if (!pad || !pad.connected) continue;
    const laneButtons = [14, 13, 12, 15]; // D-pad: left, down, up, right
    laneButtons.forEach((buttonIndex, lane) => {
      const pressed = !!pad.buttons[buttonIndex]?.pressed;
      const key = `${pad.index}:${buttonIndex}`;
      if (pressed && !gamepadWasDown.get(key)) hitLane(lane);
      gamepadWasDown.set(key, pressed);
    });
    // Face buttons provide an alternate four-lane layout on common controllers.
    [0, 1, 3, 2].forEach((buttonIndex, lane) => {
      const pressed = !!pad.buttons[buttonIndex]?.pressed;
      const key = `${pad.index}:face:${buttonIndex}`;
      if (pressed && !gamepadWasDown.get(key)) hitLane(lane);
      gamepadWasDown.set(key, pressed);
    });
  }
}
function loop(now){
  if(!active||paused)return;
  pollGamepad();
  const dt=Math.min((now-lastFrame)/1000,.05);lastFrame=now;elapsed=(now-startAt)/1000;
  const stage=$("#notes"), receptorY=75;
  stage.innerHTML="";
  notes.forEach(n=>{
    if(n.hit||n.missed)return;
    const y=receptorY+(n.time-elapsed)*190*speed;
    if(y>$("#receptors").offsetTop+100){n.missed=true;registerMiss()}
    else if(y>-80){
      const el=document.createElement("div");el.className="note l"+n.lane;el.textContent=arrows[n.lane];
      el.style.left=`calc(50% + ${(n.lane-1.5)*76}px - 34px)`;el.style.top=y+"px";stage.appendChild(el);
    }
  });
  $("#score").textContent=score.toLocaleString();$("#combo").textContent=combo;
  $("#healthFill").style.width=health+"%";$("#songTime").textContent=`${Math.floor(elapsed/60)}:${String(Math.floor(elapsed%60)).padStart(2,"0")}`;
  if(health<=0){finishSong(false);return}
  if(elapsed>=currentSong.duration){finishSong(true);return}
  raf=requestAnimationFrame(loop);
}
function registerMiss(){misses++;combo=0;health=Math.max(0,health-8);judge("MISS!")}
function judge(text){const j=$("#judgement");j.textContent=text;j.animate([{transform:"translate(-50%,-50%) scale(1.3)",opacity:1},{transform:"translate(-50%,-50%) scale(1)",opacity:.8}],180)}
function hitLane(lane){
  if(!active||paused)return;
  const candidates=notes.filter(n=>n.lane===lane&&!n.hit&&!n.missed).sort((a,b)=>Math.abs(a.time-elapsed)-Math.abs(b.time-elapsed));
  const n=candidates[0];if(!n)return;
  const diff=Math.abs(n.time-elapsed);
  if(diff<.23){n.hit=true;hits++;combo++;score+=diff<.09?350:diff<.16?200:100;health=Math.min(100,health+1);judge(diff<.09?"SICK!":diff<.16?"GOOD!":"OK!");const r=$(`.receptor[data-lane="${lane}"]`);r.classList.add("hit");setTimeout(()=>r.classList.remove("hit"),100)}
  else if(diff<.38){n.hit=true;combo=0;score+=25;judge("BAD")}
}
window.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&$("#game").classList.contains("active")&&active){togglePause();return}
  const lane=keys[e.key]??keys[e.key.toLowerCase()];if(lane!==undefined){e.preventDefault();hitLane(lane)}
});
function togglePause(){if(!active)return;paused=!paused;$("#pauseOverlay").classList.toggle("hidden",!paused);if(!paused){startAt=performance.now()-elapsed*1000;lastFrame=performance.now();raf=requestAnimationFrame(loop)}}
$("#pauseButton").onclick=togglePause;$("#resumeButton").onclick=togglePause;
$("#quitButton").onclick=()=>{active=false;cancelAnimationFrame(raf);showScreen("freeplay")};
function finishSong(won){active=false;cancelAnimationFrame(raf);$("#resultTitle").textContent=won?"NICE WORK!":"YOU RAN OUT OF HEALTH";$("#resultStats").textContent=`Score: ${score.toLocaleString()} · Hits: ${hits}/${totalNotes} · Misses: ${misses}`;$("#resultOverlay").classList.remove("hidden")}
$("#againButton").onclick=()=>startSong(currentSong);
$("#menuButton").onclick=()=>{active=false;showScreen("freeplay")};

// Local mod shelf: filenames are stored in this browser only. No file is uploaded.
const modInput = document.querySelector('#modFile');
const modCollection = document.querySelector('#modCollection');
let localMods = [];
try { localMods = JSON.parse(localStorage.getItem('funkinNightMods') || '[]'); } catch { localMods = []; }
function renderModCollection() {
  if (!modCollection) return;
  if (!localMods.length) { modCollection.innerHTML = '<p class="muted">No local mods added yet.</p>'; return; }
  modCollection.innerHTML = '';
  localMods.forEach((name, index) => {
    const row = document.createElement('div'); row.className = 'mod-item';
    const label = document.createElement('span'); label.textContent = name;
    const remove = document.createElement('button'); remove.textContent = 'REMOVE'; remove.type = 'button';
    remove.addEventListener('click', () => { localMods.splice(index, 1); localStorage.setItem('funkinNightMods', JSON.stringify(localMods)); renderModCollection(); });
    row.append(label, remove); modCollection.append(row);
  });
}
if (modInput) modInput.addEventListener('change', () => {
  const file = modInput.files && modInput.files[0]; if (!file) return;
  if (!/\.(zip|7z|rar)$/i.test(file.name)) { alert('Please choose a ZIP, 7Z, or RAR archive.'); modInput.value = ''; return; }
  if (!localMods.includes(file.name)) { localMods.push(file.name); localStorage.setItem('funkinNightMods', JSON.stringify(localMods)); }
  renderModCollection(); modInput.value = '';
});
renderModCollection();
