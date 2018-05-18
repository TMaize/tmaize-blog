
/**
 * 工具，允许多次onload不被覆盖
 * @param {方法} func 
 */
blog.addLoadEvent = function (func) {
    var oldonload = window.onload;
    if (typeof window.onload != 'function') {
        window.onload = func;
    } else {
        window.onload = function () {
            oldonload();
            func();
        }
    }
}

/**
 * 工具，兼容的方式添加事件
 * @param {单个DOM节点} dom 
 * @param {事件名} eventName 
 * @param {事件方法} func 
 * @param {是否捕获} useCapture 
 */
blog.addEvent = function (dom, eventName, func, useCapture) {
    if (window.attachEvent) {
        dom.attachEvent("on" + eventName, func);
    } else if (window.addEventListener) {
        if (useCapture != undefined && useCapture === true) {
            dom.addEventListener(eventName, func, true);
        } else {
            dom.addEventListener(eventName, func, false);
        }
    }
}

/**
 * 工具，DOM添加某个class
 * @param {单个DOM节点} dom 
 * @param {class名} className 
 */
blog.addClass = function (dom, className) {
    if (!blog.hasClass(dom, className)) {
        var c = dom.className || '';
        dom.className = c + " " + className;
        dom.className = blog.trim(dom.className);
    }
}

/**
 * 工具，DOM是否有某个class
 * @param {单个DOM节点} dom 
 * @param {class名} className 
 */
blog.hasClass = function (dom, className) {
    var list = (dom.className || '').split(/\s+/);
    for (var i = 0; i < list.length; i++) {
        if (list[i] == className)
            return true;
    }
    return false;
}

/**
 * 工具，DOM删除某个class
 * @param {单个DOM节点} dom 
 * @param {class名} className 
 */
blog.removeClass = function (dom, className) {
    if (blog.hasClass(dom, className)) {
        var list = (dom.className || '').split(/\s+/);
        var newName = '';
        for (var i = 0; i < list.length; i++) {
            if (list[i] != className)
                newName = newName + ' ' + list[i];
        }
        dom.className = blog.trim(newName);
    }
}

/**
 * 工具，DOM切换某个class
 * @param {单个DOM节点} dom 
 * @param {class名} className 
 */
blog.toggleClass = function (dom, className) {
    if (blog.hasClass(dom, className)) {
        blog.removeClass(dom, className);
    } else {
        blog.addClass(dom, className);
    }
}

/**
 * 工具，兼容问题，某些OPPO手机不支持ES5的trim方法
 * @param {字符串} str 
 */
blog.trim = function (str) {
    return str.replace(/^\s+|\s+$/g, '');
}

/***********************************************************************/

// 菜单展开/关闭
blog.addLoadEvent(function () {
    var menu = document.getElementsByClassName('header')[0].getElementsByClassName('menu')[0];
    blog.addEvent(document.getElementsByClassName('header')[0].getElementsByClassName('icon')[0], 'click', function (event) {
        blog.toggleClass(menu, 'show');
        event.stopPropagation();
    });
    blog.addEvent(window, 'click', function (event) {
        blog.removeClass(menu, 'show');
    });
    blog.addEvent(window, 'scroll', function () {
        blog.removeClass(menu, 'show');
    });
});


// 回到顶部
blog.addLoadEvent(function () {
    var upDom = document.getElementsByClassName('footer')[0].getElementsByClassName('up')[0];
    function getScrollTop() {
        if (document.documentElement && document.documentElement.scrollTop) {
            return document.documentElement.scrollTop;
        } else if (document.body) {
            return document.body.scrollTop;
        }
    }

    blog.addEvent(window, 'scroll', function () {
        if (getScrollTop() > 200) {
            blog.addClass(upDom, 'show');
        } else {
            blog.removeClass(upDom, 'show');
        }
    });

    blog.addEvent(upDom, 'click', function () {
        if (document.documentElement && document.documentElement.scrollTop) {
            document.documentElement.scrollTop = 0;
        } else if (document.body) {
            document.body.scrollTop = 0;
        }
    });
});


// 文字冒泡-社会主义核心价值观
blog.addLoadEvent(function () {
    var texts = ["富强", "民主", "文明", "和谐", "自由", "平等", "公正", "法治", "爱国", "敬业", "诚信", "友善"];
    blog.addEvent(window, 'click', function (ev) {
        var span = document.createElement('span');
        span.innerText = texts[parseInt(Math.random() * texts.length)];
        span.setAttribute("style", "left:" + ev.pageX + "px;top:" + (ev.pageY - 20) + "px;");
        span.className = "bubble select-none";
        document.body.appendChild(span);
        //动画结束后移除，事件和动画的时间要一致
        //考虑到兼容性，不使用webkitAnimationEnd
        setTimeout(function () {
            document.body.removeChild(span);
        }, 1000);
    });
});

//主题标识
blog.addLoadEvent(function () {
    console.info("Author Blog %chttp://blog.tmaize.net", "color: #FF0000;");
    console.info("Github Site %chttps://github.com/TMaize/tmaize-blog", "color: #FF0000;");
});