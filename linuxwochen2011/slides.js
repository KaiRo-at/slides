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
var lastIdx; // set no value if to use first available

var pageTitle, headerText, subHeaderText;
var navPrev, navNext, navPrevNolink, navNextNolink;

// Called when the document has been loaded.
function docLoaded() {
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

  // Get a list of all slides (articles).
  subHeaderText.textContent = articleNodes.length + " slides...";
  for (var i = 0; i < articleNodes.length; ++i) {
    subHeaderText.textContent = "Indexing slide " + i + " / " + articleNodes.length;
    if (!articleNodes[i].id)
      articleNodes[i].id = "slide_" + i;

    slides[articleNodes[i].id] =
       {"idx": i,
        "name": articleNodes[i].id,
        "title": articleNodes[i].title ? articleNodes[i].title : articleNodes[i].id,
        "obj": articleNodes[i]};

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
  slide_start = new Date();
  if (currentSlide.name == "toc")
    createTOC();
  else
    setTimeout("timerFired()", 1000*(slide_seconds/3));
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
var slide_seconds = 3*60;
var slide_start = new Date();

function timerFired() {
  var slide_current = new Date();
  var seconds_diff = Math.round((slide_current.getTime() - slide_start.getTime()) / 1000);
  if (seconds_diff >= slide_seconds) {
    headerText.className = "overtime";
  }
  else if (seconds_diff >= Math.round(2*slide_seconds/3)) {
    headerText.className = "ontime";
    setTimeout("timerFired()", 1000*(slide_seconds/3));
  }
  else if (seconds_diff >= Math.round(slide_seconds/3)) {
    headerText.className = "neartime";
    setTimeout("timerFired()", 1000*(slide_seconds/3));
  }
  else {
    // We should never come here, but if we do, go into a 1s loop until we get over the upcoming step.
    setTimeout("timerFired()", 1000);
  }
}
setTimeout("timerFired()", 1000*(slide_seconds/3));

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
    if (e.which == 1 && target.nodeName != "A" && target.nodeName != "VIDEO")
      go("next");
  }

  function handleKeyPress(e) {
    e = e || event;
    switch (e.keyCode) {
      case e.DOM_VK_LEFT:
        go("prev"); break;
      case e.DOM_VK_RIGHT:
        go("next"); break;
    }
  }

  window.onclick = handleClick;
  window.onkeypress = handleKeyPress;
})();
