const events = [
  "beforeprint",
  "beforeunload",
  "error",
  "hashchange",
  "load",
  "message",
  "offline",
  "online",
  "pagehide",
  "pageshow",
  "popstate",
  "resize",
  "storage",
  "unload",
  "keydown",
  "keypress",
  "keyup",
  "click",
  "dblclick",
  "mousedown",
  "mousemove",
  "mouseout",
  "mouseover",
  "mouseup",
  "wheel",
  "copy",
  "cut",
  "paste"
];

//adds a margin to the selectors based on the width of the menu
function fixHeader(){
  let dropdowns = document.getElementsByClassName("nav-dropdown-content");
  if(window.innerWidth <= 560){
    let width = document.getElementById("nav-buttons").clientWidth;
    for(let i = 0; i < dropdowns.length; i++) dropdowns[i].style.marginLeft = width + "px";
  }
  else{ 
    for(let i = 0; i < dropdowns.length; i++) dropdowns[i].style.marginLeft = "";
  }
}

if(!window.toload) window.toload = [];
window.toload.push(function() {
  //toggles header button
  document.getElementById("menu-button").onclick = function() {
    let nav = document.getElementById("nav-buttons");
    if(window.getComputedStyle(nav).display == "block") nav.style.display = "";
    else nav.style.display = "block";
    fixHeader();
  }
  
  //removes transition lock
  //https://stackoverflow.com/questions/22222810/disable-css-transitions-on-page-load-only
  document.body.classList.remove("preload");
});

if(!window.toresize) window.toresize = [];
window.toresize.push(function() {
  fixHeader();
});

if(!window.tomousedown) window.tomousedown = [];
window.tomousedown.push(function(e) {
  let nav = document.getElementById("nav-buttons");
  if(nav.style.display = "block"){
    if(!(e.target == nav || nav.contains(e.target))){
      nav.style.display = "";
    }
  }
});

//puts the queues in the event listeners
events.forEach(function(e) {
  window["on" + e] = function(event){
    if(window["to" + e]){
      for (let func of window["to" + e]) {
        func(event);
      }
    }
  }
});