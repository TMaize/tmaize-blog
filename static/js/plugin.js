// 打印主题标识
blog.addLoadEvent(function() {
  console.info(
    'Theme By %chttps://github.com/TMaize/tmaize-blog',
    'color: #FF0000;'
  )
})

// 新建DIV包裹TABLE
blog.addLoadEvent(function() {
  // 文章页生效
  if (document.getElementsByClassName('page-post').length == 0) {
    return
  }
  var tables = document.getElementsByTagName('table')
  for (var i = 0; i < tables.length; i++) {
    var table = tables[i]
    var elem = document.createElement('div')
    elem.setAttribute('class', 'table-container')
    table.parentNode.insertBefore(elem, table)
    elem.appendChild(table)
  }
})

// // 菜单展开/关闭
// blog.addLoadEvent(function () {
//     var menu = document.getElementsByClassName('header')[0].getElementsByClassName('menu')[0];
//     blog.addEvent(document.getElementsByClassName('header')[0].getElementsByClassName('icon')[0], 'click', function (event) {
//         blog.toggleClass(menu, 'show');
//         event.stopPropagation();
//     });
//     blog.addEvent(window, 'click', function (event) {
//         blog.removeClass(menu, 'show');
//     });
//     blog.addEvent(window, 'scroll', function () {
//         blog.removeClass(menu, 'show');
//     });
// });

// 回到顶部
// blog.addLoadEvent(function () {
//     var upDom = document.getElementsByClassName('footer')[0].getElementsByClassName('up')[0];
//     function getScrollTop() {
//         if (document.documentElement && document.documentElement.scrollTop) {
//             return document.documentElement.scrollTop;
//         } else if (document.body) {
//             return document.body.scrollTop;
//         }
//     }

//     blog.addEvent(window, 'scroll', function () {
//         if (getScrollTop() > 200) {
//             blog.addClass(upDom, 'show');
//         } else {
//             blog.removeClass(upDom, 'show');
//         }
//     });

//     blog.addEvent(upDom, 'click', function () {
//         if (document.documentElement && document.documentElement.scrollTop) {
//             document.documentElement.scrollTop = 0;
//         } else if (document.body) {
//             document.body.scrollTop = 0;
//         }
//     });
// });

// 文字冒泡-社会主义核心价值观
// blog.addLoadEvent(function () {
//     var texts = ["富强", "民主", "文明", "和谐", "自由", "平等", "公正", "法治", "爱国", "敬业", "诚信", "友善"];
//     blog.addEvent(window, 'click', function (ev) {
//         var span = document.createElement('span');
//         span.innerText = texts[parseInt(Math.random() * texts.length)];
//         span.setAttribute("style", "left:" + ev.pageX + "px;top:" + (ev.pageY - 20) + "px;");
//         span.className = "bubble select-none";
//         document.body.appendChild(span);
//         //动画结束后移除，事件和动画的时间要一致
//         //考虑到兼容性，不使用webkitAnimationEnd
//         setTimeout(function () {
//             document.body.removeChild(span);
//         }, 1000);
//     });
// });
