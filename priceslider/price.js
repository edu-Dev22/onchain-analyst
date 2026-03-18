const minVal = document.querySelector(".min-val");
const maxVal = document.querySelector(".max-val");

const minTooltip = document.querySelector(".min-tooltip");
const maxTooltip = document.querySelector(".max-tooltip");

const range = document.querySelector(".slider-track");




function setArea(){

const max = parseInt(maxVal.max);

range.style.left = (minVal.value / max) * 100 + "%";

range.style.right = 100 - (maxVal.value / max) * 100 + "%";

}

function slideMin(){

minTooltip.innerHTML = minVal.value;

setArea();

}

function slideMax(){

maxTooltip.innerHTML = maxVal.value;

setArea();

}
