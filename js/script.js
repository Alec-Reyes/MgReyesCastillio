window.onload = function() {
  //removes transition lock
  //https://stackoverflow.com/questions/22222810/disable-css-transitions-on-page-load-only
  document.body.classList.remove("preload");
  
  if(window.toload){
    for (let func of window.toload) {
      func();
    }
  }
}