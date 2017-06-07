var menu;
var nav;

function menutoggle(){
	menu = document.getElementById("menu-tool");
    nav  = document.getElementById("nav");

	menu.onclick = function () {
		if(window.getComputedStyle(nav, null).right=="-200px"){
			nav.style.right="20px";
		}else{
			nav.style.right="-200px";
		}
		event.stopPropagation();//阻止事件向上冒泡
		event.cancelBubble = true;//兼容IE
	}
	/*点击空白处关闭菜单*/
	document.onclick = function () {
		if(window.getComputedStyle(nav, null).right!="-200px"){
			nav.style.right="-200px";
		}
	}
	/*向下滑动到一定程度隐藏菜单*/
	if (getScrollTop()>200){
		if(window.getComputedStyle(nav, null).right!="-200px"){
			nav.style.right="-200px";
		}
	}
}

if (document.all){
    window.attachEvent("onload",menutoggle);
}
else{
    window.addEventListener("load",menutoggle,false);
}