// 搜索功能
blog.addLoadEvent(function() {
  // 缓存字符
  var texts = []
  var items = document.getElementsByClassName('search-item')
  for (var i = 0; i < items.length; i++) {
    texts.push(items[i].innerText.replace(/\s/g, '').toLowerCase())
  }
  var text_input = document.getElementById('search-input')
  var oldInput = ''
  blog.addEvent(text_input, 'input', function() {
    var newInput = blog.trim(text_input.value)
    if (blog.trim(newInput) == '') {
      // 隐藏所有
      for (var i = 0; i < texts.length; i++) {
        setItemStatus(i, false)
      }
      return
    }
    if (oldInput != blog.trim(newInput)) {
      oldInput = newInput
      // 隐藏所有
      for (var i = 0; i < texts.length; i++) {
        setItemStatus(i, false)
      }
      // 重新根据关键词显示
      search(newInput)
    }
  })

  function search(keywords) {
    // 大小写不敏感
    keywords = keywords.toLowerCase().split(/\s+/)
    for (var i = 0; i < texts.length; i++) {
      for (var j = 0; j < keywords.length; j++) {
        if (texts[i].indexOf(keywords[j]) != -1) {
          setItemStatus(i, true)
          break
        }
      }
    }
  }
  function setItemStatus(index, show) {
    var item = document.getElementsByClassName('search-item')[index]
    if (!item) {
      return
    }
    if (show) {
      item.style.display = 'block'
    } else {
      item.style.display = 'none'
    }
  }
})
