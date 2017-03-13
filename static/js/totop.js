var totop;

function inittotop() {
	totop = document.getElementById("totop");
}

function totopcroll() {
	if (getScrollTop()>200){
		totop.style.display = "block";
	}else{
		totop.style.display = "none";
	}
}

if (document.all){
    window.attachEvent("onload",inittotop);
	window.attachEvent("onscroll",totopcroll);
}
else{
    window.addEventListener("load",inittotop,false);
	window.addEventListener("scroll",totopcroll,false);
}