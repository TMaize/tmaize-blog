/**
 * 文字冒泡插件
 */
function text_bubble() {
    var ele = document.createElement("style");
    ele.innerText = "@keyframes fadeOutUp {from{opacity: 1;}to {opacity: 0;transform: translate3d(0, -350%, 0);}}";

    document.body.insertBefore(ele, document.body.firstChild);

    var clickTips = ["富强", "民主", "文明", "和谐", "自由", "平等", "公正", "法治", "爱国", "敬业", "诚信", "友善"];

    function bubble(ev) {

        var span = document.createElement('span');
        span.innerText = clickTips[parseInt(Math.random() * clickTips.length)];

        span.setAttribute("style", "z-index:999;position:absolute;left:" + ev.pageX + "px;top:" + (ev.pageY - 20) + "px;animation-duration:1s;" +
            "animation-fill-mode:both;animation-name:fadeOutUp;");
        document.body.appendChild(span);
        //WebKit
        if (typeof document.body.style.WebkitAnimation != "undefined") {
            span.addEventListener("webkitAnimationEnd", function() {
                document.body.removeChild(span);
            });
        } else {
            span.addEventListener("animationend", function() {
                document.body.removeChild(span);
            });
        }
	}
	
    //绑定事件
    if (window.attachEvent) {
        window.attachEvent("onclick", bubble);
    } else if (window.addEventListener) {
        window.addEventListener("click", bubble, false);
    }
}

/**
 * 菜单按钮功能
 */
function menutoggle() {
    var menu = document.getElementById("menu-tool");
    var nav = document.getElementById("nav");

    //按钮点击
    menu.onclick = function(ev) {
        var right;
        if (nav.currentStyle) {
            right = nav.currentStyle.right;
        } else {
            right = window.getComputedStyle(nav, null).right;
        }
        if (right == "-200px") {
            nav.style.right = "20px";
        } else {
            nav.style.right = "-200px";
        }
        if (window.event) { //这是IE浏览器
            ev.cancelBubble = true; //阻止冒泡事件
        } else if (ev && ev.stopPropagation) { //这是其他浏览器
            ev.stopPropagation(); //阻止冒泡事件
        }
    }

    //点击空白处关闭菜单
    function closeMenuAtOther() {
        var right;
        if (nav.currentStyle) {
            right = nav.currentStyle.right;
        } else {
            right = window.getComputedStyle(nav, null).right;
        }
        if (right != "-200px") {
            nav.style.right = "-200px";
        }
    }

    //滚动到一定高度自动关闭
    function onscrollmenutoggle() {
        var scrollTop = 0;
        if (document.documentElement && document.documentElement.scrollTop) {
            scrollTop = document.documentElement.scrollTop;
        } else if (document.body) {
            scrollTop = document.body.scrollTop;
        }
        if (scrollTop > 200) {
            nav.style.right = "-200px";
        }
    }

    //绑定事件
    if (window.attachEvent) {
        window.attachEvent("onclick", closeMenuAtOther);
        window.attachEvent("onscroll", onscrollmenutoggle);
    } else if (window.addEventListener) {
        window.addEventListener("click", closeMenuAtOther, false);
        window.addEventListener("scroll", onscrollmenutoggle, false);
    }
}

/**
 * 回到顶部
 */
function toTop() {
    function top() {
        var totop = document.getElementById("totop");
        var scrollTop = 0;
        if (document.documentElement && document.documentElement.scrollTop) {
            scrollTop = document.documentElement.scrollTop;
        } else if (document.body) {
            scrollTop = document.body.scrollTop;
        }
        if (scrollTop > 200) {
            totop.style.display = "block";
        } else {
            totop.style.display = "none";
        }
    }
    /*绑定事件*/
    if (window.attachEvent) {
        window.attachEvent("onscroll", top);
    } else if (window.addEventListener) {
        window.addEventListener("scroll", top, false);
    }
}

/*绑定事件*/
if (window.attachEvent) {
    window.attachEvent("onload", text_bubble);
    window.attachEvent("onload", menutoggle);
    window.attachEvent("onload", toTop);
} else if (window.addEventListener) {
    window.addEventListener("load", text_bubble, false);
    window.addEventListener("load", menutoggle, false);
    window.addEventListener("load", toTop, false);
}