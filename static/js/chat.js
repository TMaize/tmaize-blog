
function hidetip() {
	var tip = document.getElementById("loadingtip");
	tip.style.display = "none";
}

if (document.all){
    window.attachEvent("onload",hidetip);
}
else{
    window.addEventListener("load",hidetip,false);
}