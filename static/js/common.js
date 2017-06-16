function getScrollTop() {
	var scrollTop = 0;
	if (document.documentElement && document.documentElement.scrollTop) {
		scrollTop = document.documentElement.scrollTop;
	}
	else if (document.body) {
		scrollTop = document.body.scrollTop;
	}
	return scrollTop;
}

function showSheHuiZhuYi() {
	function f(ev) {
		var clickTips = ["富强", "民主", "文明", "和谐", "自由", "平等", "公正" ,"法治", "爱国", "敬业", "诚信", "友善"];
		var span = document.createElement('span');
		span.innerText = clickTips[parseInt(Math.random()*clickTips.length)];
		span.setAttribute("style","z-index:999;position:absolute;left:"+ev.pageX+"px;top:"+(ev.pageY-20)+"px;animation-duration:1s;" +
				"animation-fill-mode:both;animation-name:fadeOutUp;");
		document.body.appendChild(span);
		//WebKit
		if(typeof document.body.style.WebkitAnimation!="undefined"){
			span.addEventListener("webkitAnimationEnd",function () {
				document.body.removeChild(span);
			});
		}else{
			span.addEventListener("animationend",function () {
				document.body.removeChild(span);
			});
		}
	}
	if (document.all){
		window.attachEvent("onclick",f);
	}
	else{
		window.addEventListener("click",f,false);
	}
}

if (document.all){
	window.attachEvent("onload",showSheHuiZhuYi);
}
else{
	window.addEventListener("load",showSheHuiZhuYi,false);
}