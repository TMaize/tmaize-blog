// 搜索功能
blog.addLoadEvent(function() {
  // 标题等信息
  var infos = []
  // 正文内容
  var contents = []
  // 本地无缓存/站点重新编译，弹框阻塞，加载全文检索内容
  if (!localStorage.db || localStorage.dbVersion != blog.buildAt) {
    var loading = blog.loading()
    blog.ajax(
      {
        timeout: 20000,
        url: blog.baseUrl + 'static/other/search.xml'
      },
      function(data) {
        loading.hide()
        localStorage.db = data
        localStorage.dbVersion = blog.buildAt
      },
      function(err) {
        loading.hide()
        console.error('全文检索数据加载失败...')
        localStorage.removeItem('db')
        localStorage.removeItem('dbVersion')
      }
    )
  }

  if (localStorage.db) {
    var root = document.createElement('div')
    root.innerHTML = localStorage.db
    root.querySelectorAll('li').forEach(function(content) {
      var str = content.innerHTML
      var distill = /\[CDATA\[(.*)\]\]/
      var result = distill.exec(str)
      if (result) {
        str = result[1]
      }
      str = str.replace(/^\s+|\s+$/g, '')
      var temp = document.createElement('div')
      temp.innerHTML = str
      str = temp.innerText
      temp = null
      articles.push(str)
    })
  }
  document.querySelectorAll('.search-list li').forEach(function(info) {
    infos.push(info.innerText.replace(/\s/g, '').toLowerCase())
  })
  // TODO
  for (var i = 0; i < items.length; i++) {}
  var text_input = document.getElementById('search-input')
  var oldInput = ''
  blog.addEvent(text_input, 'input', function() {
    var newInput = blog.trim(text_input.value)
    if (blog.trim(newInput) == '') {
      // 隐藏所有
      for (var i = 0; i < infos.length; i++) {
        setItemStatus(i, false)
      }
      return
    }
    if (oldInput != blog.trim(newInput)) {
      oldInput = newInput
      // 隐藏所有
      for (var i = 0; i < infos.length; i++) {
        setItemStatus(i, false)
      }
      // 重新根据关键词显示
      search(newInput)
    }
  })

  function search(keywords) {
    // 大小写不敏感
    keywords = keywords.toLowerCase().split(/\s+/)
    for (var i = 0; i < infos.length; i++) {
      for (var j = 0; j < keywords.length; j++) {
        if (infos[i].indexOf(keywords[j]) != -1) {
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
