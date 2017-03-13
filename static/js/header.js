var menu;
var nav;
var navopen = false;

function menutoggle(){
	menu = document.getElementById("menu-tool");
    nav  = document.getElementById("nav");
    menu.onclick = function () {
        if (navopen){
            nav.style.display = "none";
            navopen = false;
        }else {
            nav.style.display = "block";
            navopen = true;
        }
		event.stopPropagation();//阻止事件向上冒泡
        event.cancelBubble = true;//兼容IE
    }
}
function haha(){
    document.onclick = function () {
        if(navopen){
			nav.style.display = "none";
			navopen = false;
		}
    }

	window.onresize = function () {
        console.info("winonresize........");
		if(document.body.clientWidth>540){
			nav.style.display = "block";
			var navopen = false;
		}
    }
}


if (document.all){
    window.attachEvent("onload",menutoggle);
	window.attachEvent("onload",haha);
}
else{
    window.addEventListener("load",menutoggle,false);
	window.addEventListener("load",haha,false);
}