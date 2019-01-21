/**
 * 工具，允许多次onload不被覆盖
 * @param {方法} func
 */
blog.addLoadEvent = function(func) {
  var oldonload = window.onload
  if (typeof window.onload != 'function') {
    window.onload = func
  } else {
    window.onload = function() {
      oldonload()
      func()
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
blog.addEvent = function(dom, eventName, func, useCapture) {
  if (window.attachEvent) {
    dom.attachEvent('on' + eventName, func)
  } else if (window.addEventListener) {
    if (useCapture != undefined && useCapture === true) {
      dom.addEventListener(eventName, func, true)
    } else {
      dom.addEventListener(eventName, func, false)
    }
  }
}

/**
 * 工具，DOM添加某个class
 * @param {单个DOM节点} dom
 * @param {class名} className
 */
blog.addClass = function(dom, className) {
  if (!blog.hasClass(dom, className)) {
    var c = dom.className || ''
    dom.className = c + ' ' + className
    dom.className = blog.trim(dom.className)
  }
}

/**
 * 工具，DOM是否有某个class
 * @param {单个DOM节点} dom
 * @param {class名} className
 */
blog.hasClass = function(dom, className) {
  var list = (dom.className || '').split(/\s+/)
  for (var i = 0; i < list.length; i++) {
    if (list[i] == className) return true
  }
  return false
}

/**
 * 工具，DOM删除某个class
 * @param {单个DOM节点} dom
 * @param {class名} className
 */
blog.removeClass = function(dom, className) {
  if (blog.hasClass(dom, className)) {
    var list = (dom.className || '').split(/\s+/)
    var newName = ''
    for (var i = 0; i < list.length; i++) {
      if (list[i] != className) newName = newName + ' ' + list[i]
    }
    dom.className = blog.trim(newName)
  }
}

/**
 * 工具，DOM切换某个class
 * @param {单个DOM节点} dom
 * @param {class名} className
 */
blog.toggleClass = function(dom, className) {
  if (blog.hasClass(dom, className)) {
    blog.removeClass(dom, className)
  } else {
    blog.addClass(dom, className)
  }
}

/**
 * 工具，兼容问题，某些OPPO手机不支持ES5的trim方法
 * @param {字符串} str
 */
blog.trim = function(str) {
  return str.replace(/^\s+|\s+$/g, '')
}

/**
 * 工具，转换实体字符防止XSS
 * @param {字符串} str
 */
blog.encodeHtml = function(html) {
  var o = document.createElement('div')
  o.innerText = html
  var temp = o.innerHTML
  o = null
  return temp
}
