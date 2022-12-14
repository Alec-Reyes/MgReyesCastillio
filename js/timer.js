var timer = {
  timerInterval: null,
  startTime: 0,
  starting: false,
  times: [],
  scrambles: []
};

//function for formatting milliseconds into readable time
function formatMs(t){
  var ms = t % 1000;
  t = (t - ms) / 1000;
  var secs = t % 60;
  t = (t - secs) / 60;

  let s = "";

  if(t > 0) s += t + ":";
  if(secs < 10 && t > 0) s += "0";
  s += secs + ".";
  if(ms < 100) s += 0;
  s += Math.floor(ms / 10);
  
  return s;
}

//saves the times to the browser
function saveTimes(){
  localStorage.setItem("times", timer.times.length > 0 ? timer.times : "");
  localStorage.setItem("scrambles", timer.scrambles.length > 0 ? timer.scrambles : "");
}

//loads times from the browser
function loadTimes(){
  let arr = localStorage.getItem("times");
  let scr = localStorage.getItem("scrambles");
  arr = arr.split(",");
  scr = scr.split(",");

  arr.forEach(function(t){
    if(!Number.isInteger(parseInt(t))) return;
    t = parseInt(t);
    timer.times.push(t);
    addTime(t);
  });

  if(scr[0].length == 0) return;
  scr.forEach((s) => timer.scrambles.push(s));
}

//adds a time to the ol
function addTime(time){
  let t = document.createElement("li");
  t.innerHTML = "<strong>" + (document.getElementById("recent-times").firstElementChild.childElementCount + 1) + ". </strong>" + formatMs(time);
  document.getElementById("recent-times").firstElementChild.prepend(t);
}

//sets the stats
function computeStats(){
  let mean = 0;
  if(timer.times.length > 0){
    timer.times.forEach((t) => mean += t);
    mean /= timer.times.length;
  }
  document.getElementById("mean").innerHTML = "<strong>Mean: </strong>" + formatMs(Math.round(mean));

  let ao3 = 0;
  if(timer.times.length >= 3){
    for(let i = 0; i < 3; i++) ao3 += timer.times[timer.times.length - (i + 1)];
    ao3 /= 3;
  }
  document.getElementById("ao3").innerHTML = "<strong>Ao3: </strong>" + formatMs(Math.round(ao3));

  let ao5 = 0;
  if(timer.times.length >= 5){
    for(let i = 0; i < 5; i++) ao5 += timer.times[timer.times.length - (i + 1)];
    ao5 /= 5;
  }
  document.getElementById("ao5").innerHTML = "<strong>Ao5: </strong>" + formatMs(Math.round(ao5));

  let ao12 = 0;
  if(timer.times.length >= 12){
    for(let i = 0; i < 12; i++) ao12 += timer.times[timer.times.length - (i + 1)];
    ao12 /= 12;
  }
  document.getElementById("ao12").innerHTML = "<strong>Ao12: </strong>" + formatMs(Math.round(ao12));

  let ao100 = 0;
  if(timer.times.length >= 100){
    for(let i = 0; i < 100; i++) ao100 += timer.times[timer.times.length - (i + 1)];
    ao100 /= 100;
  }
  document.getElementById("ao100").innerHTML = "<strong>Ao100: </strong>" + formatMs(Math.round(ao100));
}

function computeBest(){
  let bSingle = Infinity;
  let bAo3 = Infinity;
  let bAo5 = Infinity;
  let bAo12 = Infinity;
  let bAo100 = Infinity;

  for(let i = 0; i < timer.times.length; i++){
    if(timer.times[i] < bSingle) bSingle = timer.times[i];

    if(i >= 2){
      let ao3 = 0;
      for(let j = 0; j < 3; j++) ao3 += timer.times[i - j];
      ao3 /= 3;
      if(ao3 < bAo3) bAo3 = ao3;
    }

    if(i >= 4){
      let ao5 = 0;
      for(let j = 0; j < 5; j++) ao5 += timer.times[i - j];
      ao5 /= 5;
      if(ao5 < bAo5) bAo5 = ao5;
    }

    if(i >= 11){
      let ao12 = 0;
      for(let j = 0; j < 12; j++) ao12   += timer.times[i - j];
      ao12 /= 12;
      if(ao12 < bAo12) bAo12 = ao12;
    }

    if(i >= 99){
      let ao100 = 0;
      for(let j = 0; j < 100; j++) ao100 += timer.times[i - j];
      ao100 /= 100;
      if(ao100 < bAo100) bAo100 = ao100;
    }
  }  

  document.getElementById("b-single").innerHTML = "<strong>Single: </strong>" + formatMs(Math.floor(bSingle == Infinity ? 0 : bSingle));
  document.getElementById("b-ao3").innerHTML = "<strong>Ao3: </strong>" + formatMs(Math.floor(bAo3 == Infinity ? 0 : bAo3));
  document.getElementById("b-ao5").innerHTML = "<strong>Ao5: </strong>" + formatMs(Math.floor(bAo5 == Infinity ? 0 : bAo5));
  document.getElementById("b-ao12").innerHTML = "<strong>Ao12: </strong>" + formatMs(Math.floor(bAo12 == Infinity ? 0 : bAo12));
  document.getElementById("b-ao100").innerHTML = "<strong>Ao100: </strong>" + formatMs(Math.floor(bAo100 == Infinity ? 0 : bAo100));
}

function generateScramble(){
  const faces = "RUFLDB";
  let scramble = "";
  let prev = "";

  for(let i = 0; i < 20; i++){
    let f = prev;
    let moves = scramble.split(" ");
    while(f == prev || (i >= 2 && f == moves[i - 2].charAt(0) && faces.indexOf(f) % 3 == faces.indexOf(moves[i - 1].charAt(0)) % 3)) f = faces.charAt(Math.floor(Math.random() * 6));
    prev = f;
    scramble += f;
    let move = Math.floor(Math.random() * 4);
    if(move == 1) scramble += "2";
    else if(move == 2) scramble += "'";
    scramble += " ";
  }
  document.getElementById("scramble").textContent = scramble.substring(0, scramble.length - 1);
}

function initAndStopTimer(){
  let timerElement = document.getElementById("timer").firstElementChild;
  if(!timer.starting){
    timer.starting = true;
    timerElement.style.color = "#55FF33";
    document.getElementById("timer").style.backgroundColor = "#dedede";
  }else if(timer.timerInterval != null){
    clearInterval(timer.timerInterval);
    timer.timerInterval = null;
    timer.starting = false;
    let time = new Date().getTime() - timer.startTime;
    timerElement.innerText = formatMs(time);
    addTime(time);
    timer.times.push(time);
    timer.scrambles.push(document.getElementById("scramble").textContent);
    saveTimes();
    computeStats();
    computeBest();
    generateScramble();
  }
}

function startTimer(){
  let timerElement = document.getElementById("timer").firstElementChild;
  if(timer.timerInterval == null && timer.starting){
    timerElement.style.color = "black";
    document.getElementById("timer").style.backgroundColor = "white";
    timer.startTime = new Date().getTime();
    timer.timerInterval = setInterval(function (){
      timerElement.innerText = formatMs(new Date().getTime() - timer.startTime);
    }, 2);
  }
}

if(!window.toload) window.toload = [];
//adds load function to queue
window.toload.push(function(){
  let timerElement = document.getElementById("timer").firstElementChild;
  let lastTouchEnd = 0;
  let prevLi = null;

  if(!localStorage.getItem("times")) saveTimes();
  loadTimes();
  computeStats();
  computeBest();
  generateScramble();

  //deleting single time
  document.getElementById("settings-delete").onclick = function(){
    timer.times.splice(document.getElementById("settings").timeIndex, 1);
    timer.scrambles.splice(document.getElementById("settings").timeIndex, 1);
    saveTimes();
    computeStats();
    computeBest();
    generateScramble();
    let list = "";
    for(let i = timer.times.length - 1; i >= 0; i--) list += "<li>" + (i + 1) + ". " + formatMs(timer.times[i]) + "</li>";
    document.getElementById("recent-times").firstElementChild.innerHTML = list;
    document.getElementById("settings").style.display = "none";
    //adds back window scrollbar
    document.body.style.overflow = "auto";
    document.body.style.userSelect = "auto";
  }

  //deleting all times
  document.getElementById("settings-reset").onclick = function(){
    timer.times = [];
    timer.scrambles = [];
    saveTimes();
    computeStats();
    computeBest();
    generateScramble();
    document.getElementById("recent-times").firstElementChild.innerHTML = "";
    document.getElementById("settings").style.display = "none";
    //adds back window scrollbar
    document.body.style.overflow = "auto";
    document.body.style.userSelect = "auto";
  }

  if(!window.tomouseover) window.tomouseover = [];
  window.tomouseover.push(function(e){
    if(prevLi != null){
      prevLi.style.backgroundColor = "white";
      prevLi = null;
    }
    if(e.target.nodeName == "LI" && e.target.parentNode.parentNode.id == "recent-times"){
      e.target.style.backgroundColor = "lightgrey";
      prevLi = e.target;
    }
    if(e.target.id == "timer" || e.target.parentNode.id == "timer"){
      document.getElementById("timer").style.backgroundColor = "#dedede";
    }else{
      document.getElementById("timer").style.backgroundColor = "";
    }
  });

  if(!window.tomousedown) window.tomousedown = [];
  window.tomousedown.push(function(e){
    if(e.target.id == "settings" || e.target.id == "settings-close"){
      document.getElementById("settings").style.display = "none";
      //adds back window scrollbar
      document.body.style.overflow = "auto";
      document.body.style.userSelect = "auto";
    }
    if(e.target.nodeName == "LI" && e.target.parentNode.parentNode.id == "recent-times"){
      document.getElementById("settings").style.display = "block";
      document.getElementById("settings").firstElementChild.scrollTop = 0;

      let arr = e.target.textContent.split(" ");
      let index = parseInt(arr[0].substring(0, arr[0].length - 1)) - 1;
      let time = timer.times[index];
      let scramble = timer.scrambles[index];

      document.getElementById("settings-time").textContent = formatMs(time);
      document.getElementById("settings-scramble").textContent = scramble;
      document.getElementById("settings").timeIndex = index;

      //removes window scrollbar
      document.body.style.overflow = "hidden";
      document.body.style.userSelect = "none";
    }
    //starts and stops timer
    if((e.target.id == "timer" || e.target.parentNode.id == "timer") && new Date().getTime() - lastTouchEnd > 10){
      initAndStopTimer();
    }
  });

  if(!window.tomouseup) window.tomouseup = [];
  window.tomouseup.push(function(e){
    if(timer.starting && new Date().getTime() - lastTouchEnd > 10){
      e.preventDefault();
      startTimer();
    }
  });

  //event handler for touching the box
  if(!window.totouchstart) window.totouchstart = [];
  window.totouchstart.push(function(e){
    for (let i = 0; i < e.targetTouches.length; i++) {
      if(e.targetTouches[i].target.id == "timer" || e.target.parentNode.id == "timer"){
        initAndStopTimer();
        return;
      }
    }
  });

  //event handler for untouching the box
  if(!window.totouchend) window.totouchend = [];
  window.totouchend.push(function(e){
    lastTouchEnd = new Date().getTime();
    startTimer();
  });

  //event handler for holding space down
  if(!window.tokeydown) window.tokeydown = [];
  window.tokeydown.push(function(e){
    if(e.code == "Space"){
      e.preventDefault();
      initAndStopTimer();
    }
  });

  //event handler for releasing space
  if(!window.tokeyup) window.tokeyup = [];
  window.tokeyup.push(function(e){
    if(e.code == "Space" && timer.starting){
      e.preventDefault();
      startTimer();
    }
  });

  //sets height of recent times
  if(!window.toresize) window.toresize = [];
  window.toresize.push(function() {
    if(window.innerWidth <= 745){
      document.getElementById("recent-times").style.height = document.getElementById("top-times").clientHeight + "px";
    }
    else{ 
      document.getElementById("recent-times").style.height = "";
    }
  });

  if(window.innerWidth <= 745){
    document.getElementById("recent-times").style.height = document.getElementById("top-times").clientHeight + "px";
  }
  else{ 
    document.getElementById("recent-times").style.height = "";
  }
});