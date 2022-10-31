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

window.onload = function() {
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
  
  if(window.toload){
    for (let func of window.toload) {
      func();
    }
  }
}

window.onresize = function() {
  fixHeader();
}