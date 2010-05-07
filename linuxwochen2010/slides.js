/******************************
 * JavaScript for talk slides *
 *      by Robert Kaiser      *
 *      <kairo@kairo.at>      *
 *     (for FOSDEM 2007)      *
 ******************************/

// do timed color variation on slides
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

(function() {
  function go(where) {
    where = where || "next";
    var links = document.getElementsByTagName("link");
    for (var i = 0; i < links.length; ++i) {
      if (links[i].rel == where) {
        window.location.href = links[i].href;
        break;
      }
    }
  }

  function handleClick(e) {
    e = e || event;
    var target = (window.event) ? e.srcElement : e.target;
    if (e.which == 1 && target.nodeName != "A" && target.nodeName != "VIDEO")
      go("next");
  }

  function handleKeyPress(e) {
    e = e || event;
    switch (e.keyCode) {
      case e.DOM_VK_LEFT:
        go("previous"); break;
      case e.DOM_VK_RIGHT:
        go("next"); break;
    }
  }

  window.onclick = handleClick;
  window.onkeypress = handleKeyPress;
})();

// end slide
function showEvent() {
  document.getElementById("eventbox").style.display = "block";
  document.getElementById("eventtext").style.display = "block";
}