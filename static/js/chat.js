
function hidetip() {
	var tip = document.getElementById("loadingtip");
	tip.style.display = "none";
}

/*绑定事件*/
if (window.attachEvent) { 
	window.attachEvent("onload", hidetip);
} else if (window.addEventListener) { 
	window.addEventListener("load", hidetip, false);
}