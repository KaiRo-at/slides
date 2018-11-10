/******************************
 * JavaScript for talk slides *
 *      by Robert Kaiser      *
 *      <kairo@kairo.at>      *
 *     (for FOSDEM 2011)      *
 ******************************/

var slides = {};
var articleNodes;
var currentSlide;
var currentIdx;
var defaultIdx = 1; // set to slide index to show by default
var firstIdx = 2; // set no value if to use first available
var lastIdx; // set no value if to use last available

var pageTitle, headerText, subHeaderText;
var navPrev, navNext, navPrevNolink, navNextNolink;

// Slide timer - color variation of headerText
// Time per slide is total presentation length divided by number of slides
// except start and end slide.
var presLengthSeconds = 15 * 60;
var slideStart, timerMSec;

// Called when the document has been loaded.
window.onload = function() {
  pageTitle = document.getElementsByTagName("title")[0];
  headerText = document.getElementById("header-text");
  subHeaderText = document.getElementById("subheader-text");
  navPrev = document.getElementById("nav-prev");
  navNext = document.getElementById("nav-next");
  navPrevNolink = document.getElementById("nav-prev-nolink");
  navNextNolink = document.getElementById("nav-next-nolink");
  articleNodes = document.getElementsByTagName("article");

  if (!firstIdx)
    firstIdx = 0;
  if (!lastIdx)
    lastIdx = articleNodes.length - 1;
  var slideSeconds = presLengthSeconds / (lastIdx - firstIdx);
  timerMSec = 1000 * (slideSeconds / 3);

  // Get a list of all slides (articles).
  subHeaderText.textContent = articleNodes.length + " slides...";
  for (var i = 0; i < articleNodes.length; ++i) {
    subHeaderText.textContent = "Indexing slide " + i + " / " + articleNodes.length;
    if (!articleNodes[i].id)
      articleNodes[i].id = "slide_" + i;

    slides[articleNodes[i].id] = {
        "idx": i,
        "name": articleNodes[i].id,
        "title": articleNodes[i].dataset.title ? articleNodes[i].dataset.title : articleNodes[i].id,
        "obj": articleNodes[i],
        "timeSeconds": articleNodes[i].dataset.seconds ? articleNodes[i].dataset.seconds : slideSeconds,
    };

    if (location.hash.length &&
        (location.hash == "#" + articleNodes[i].id || location.hash == "#" + i)) {
      articleNodes[i].setAttribute("aria-selected", "true");
      currentSlide = slides[articleNodes[i].id];
      currentIdx = i;
    }
  }

  if (!currentSlide) {
    currentIdx = defaultIdx;
    currentSlide = slides[articleNodes[currentIdx].id];
    currentSlide.obj.setAttribute("aria-selected", "true");
    location.hash = "#" + currentSlide.name;
  }
  updateDisplay();
  document.getElementById("hidesdesc").onclick = function(event) {
    document.getElementById("slidesdesc").classList.toggle("hidden");
  }
}

// Called when the hash part of the location changes.
function locationHashChanged() {
  if (location.hash.length > 1) {
    var hashtag = location.hash.substring(1);
    // If not a number, treat as ID
    if (isNaN(hashtag) && slides[hashtag]) {
      currentSlide.obj.removeAttribute("aria-selected");
      currentSlide = slides[hashtag];
      currentIdx = currentSlide.idx;
      currentSlide.obj.setAttribute("aria-selected", "true");
      updateDisplay();
    }
    else if (articleNodes[hashtag]) {
      currentSlide.obj.removeAttribute("aria-selected");
      currentIdx = hashtag;
      currentSlide = slides[articleNodes[currentIdx].id];
      currentSlide.obj.setAttribute("aria-selected", "true");
      updateDisplay();
    }
  }
}
window.onhashchange = locationHashChanged;

// Update the display after we updated what slide is shown.
function updateDisplay() {
  if (currentIdx >= firstIdx && currentIdx <= lastIdx &&
      currentSlide.name != "toc")
    subHeaderText.textContent = (currentIdx - firstIdx + 1) + "/" +
                                (lastIdx - firstIdx + 1) + " - " +
                                currentSlide.title;
  else
    subHeaderText.textContent = currentSlide.title;
  pageTitle.textContent = headerText.textContent + ": " + currentSlide.title;
  if (currentIdx > firstIdx && currentSlide.name != "toc") {
    navPrev.hidden = false;
    navPrev.href = "#" + articleNodes[currentIdx - 1].id;
    navPrevNolink.hidden = true;
  }
  else {
    navPrev.hidden = true;
    navPrevNolink.hidden = false;
  }
  if (currentIdx < lastIdx && currentSlide.name != "toc") {
    navNext.hidden = false;
    navNext.href = "#" + articleNodes[currentIdx + 1].id;
    navNextNolink.hidden = true;
  }
  else {
    navNext.hidden = true;
    navNextNolink.hidden = false;
  }
  headerText.className = "";
  slideStart = new Date();
  timerMSec = 1000 * (currentSlide.timeSeconds / 3);
  if (currentSlide.name == "toc")
    createTOC();
  else
    setTimeout(timerFired, timerMSec);
}

// Create TOC list.
function createTOC() {
 var list = document.getElementById("toc-list");
 if (!list.getElementsByTagName("li").length) {
   for (var slide in slides) {
     if (slide != "toc") {
       var item = document.createElement("li");
       var link = document.createElement("a");
       var slideHeaders = slides[slide].obj.getElementsByTagName("h1");
       if (slideHeaders.length)
         link.textContent = slideHeaders[0].textContent;
       else
         link.textContent = slides[slide].title;
       link.href = "#" + slides[slide].name;
       item.appendChild(link);
       list.appendChild(item);
     }
   }
 }
}

// Do timed color variation on slides.
function timerFired() {
  var slideCurrent = new Date();
  var secondsDiff = Math.round((slideCurrent.getTime() - slideStart.getTime()) / 1000);
  if (secondsDiff >= currentSlide.timeSeconds) {
    headerText.className = "overtime";
  }
  else if (secondsDiff >= Math.round(2 * currentSlide.timeSeconds / 3)) {
    headerText.className = "ontime";
    setTimeout(timerFired, timerMSec);
  }
  else if (secondsDiff >= Math.round(currentSlide.timeSeconds / 3)) {
    headerText.className = "neartime";
    setTimeout(timerFired, timerMSec);
  }
  else {
    // We should never come here, but if we do, go into a 100ms loop until we get over the upcoming step.
    setTimeout(timerFired, 100);
  }
}

// Keyboard/click nav functionality, mostly inherited from FOSDEM 2007.
(function() {
  function go(where) {
    where = where || "next";
    var navElem = document.getElementById("nav-" + where);
    if (!navElem.hidden)
      window.location.href = navElem.href;
  }

  function handleClick(e) {
    e = e || event;
    var target = (window.event) ? e.srcElement : e.target;
    if (e.which == 1 && target.nodeName != "A" && target.nodeName != "VIDEO" && !target.classList.contains("noadvance"))
      go("next");
  }

  function handleKeyPress(e) {
    e = e || event;
    switch (e.key) {
      // See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode#Constants_for_keyCode_value
      case "ArrowLeft":
      case "ArrowDown":
      case "Left": // non-standard, old browsers
      case "Down": // non-standard, old browsers
      case "PageDown":
      case "P":
      case "p":
      case "H": //8bitdo Zero "X"
      case "h": //8bitdo Zero "X"
        go("prev"); break;
      case "ArrowRight":
      case "ArrowUp":
      case "Right": // non-standard, old browsers
      case "Up": // non-standard, old browsers
      case "PageUp":
      case "N":
      case "n":
      case "J": //8bitdo Zero "B"
      case "j": //8bitdo Zero "B"
        go("next"); break;
      case "Home":
      case "I": //8bitdo Zero "Y"
      case "i": //8bitdo Zero "Y"
        go("start"); break;
      case "End":
      case "G": //8bitdo Zero "A"
      case "g": //8bitdo Zero "A"
        go("toc"); break;
    }
  }

  window.onclick = handleClick;
  window.onkeydown = handleKeyPress;
})();
