/******************************
 * JavaScript for talk slides *
 *      by Robert Kaiser      *
 *      <kairo@kairo.at>      *
 *     (for FOSDEM 2007)      *
 ******************************/

function docClicked(event) {
  if (event.target.nodeName != "A") {
    location.href = document.getElementById('goNext').href;
  }
}

// do timed color variantion on slides
var slide_seconds = 3*60;
var slide_start = new Date();

function timerFired() {
  var slide_current = new Date();
  var seconds_diff = Math.round((slide_current.getTime() - slide_start.getTime()) / 1000);
  if (seconds_diff >= slide_seconds) {
    document.getElementById("header-text").className = "overtime";
  }
  else if (seconds_diff >= Math.round(2*slide_seconds/3)) {
    document.getElementById("header-text").className = "ontime";
    setTimeout("timerFired()", 1000*(slide_seconds/3));
  }
  else if (seconds_diff >= Math.round(slide_seconds/3)) {
    document.getElementById("header-text").className = "neartime";
    setTimeout("timerFired()", 1000*(slide_seconds/3));
  }
  else {
    // we should never come here, but if we do, go into a 1s loop until we get over the upcoming step
    setTimeout("timerFired()", 1000);
  }
}

setTimeout("timerFired()", 1000*(slide_seconds/3));
