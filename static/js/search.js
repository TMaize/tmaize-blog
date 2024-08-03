// 加载所有文章数据，优先使用localStorage缓存
function loadAllPostData(callback) {
  if (localStorage.db && localStorage.dbVersion == blog.buildAt) {
    document.querySelector('.page-search .icon-loading').style.opacity = 0
    callback ? callback(localStorage.db) : ''
    return
  }

  localStorage.removeItem('dbVersion')
  localStorage.removeItem('db')

  blog.ajax(
    {
      timeout: 20000,
      url: blog.baseurl + '/static/xml/search.xml?t=' + blog.buildAt
    },
    function (data) {
      document.querySelector('.page-search .icon-loading').style.opacity = 0
      localStorage.db = data
      localStorage.dbVersion = blog.buildAt
      callback ? callback(data) : ''
    },
    function () {
      console.error('全文检索数据加载失败...')
      callback ? callback(null) : ''
    }
  )
}

// 搜索功能
blog.addLoadEvent(function () {
  // 标题等信息
  let titles = []
  // 正文内容
  let contents = []
  // 低版本chrome，输入拼音的过程中也会触发input事件
  let inputLock = false
  // 输入框
  let input = document.getElementById('search-input')

  // 非搜索页面
  if (!input) {
    return
  }

  loadAllPostData(function (data) {
    titles = parseTitle()
    contents = parseContent(data)
    search(input.value)
  })

  function parseTitle() {
    let arr = []
    let doms = document.querySelectorAll('.list-search .title')
    for (let i = 0; i < doms.length; i++) {
      arr.push(doms[i].innerHTML)
    }
    return arr
  }

  function parseContent(data) {
    let arr = []
    let root = document.createElement('div')
    root.innerHTML = data
    let doms = root.querySelectorAll('li')
    for (let i = 0; i < doms.length; i++) {
      arr.push(doms[i].innerHTML)
    }
    return arr
  }

  function search(key) {
    // <>& 替换
    key = blog.trim(key)
    key = key.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    let doms = document.querySelectorAll('.list-search li')
    let h1 = '<span class="hint">'
    let h2 = '</span>'
    for (let i = 0; i < doms.length; i++) {
      let title = titles[i]
      let content = contents[i]
      let dom_li = doms[i]
      let dom_title = dom_li.querySelector('.title')
      let dom_content = dom_li.querySelector('.content')

      dom_title.innerHTML = title
      dom_content.innerHTML = ''

      // 空字符隐藏
      if (key == '') {
        dom_li.setAttribute('hidden', true)
        continue
      }
      let hide = true

      // 搜索标题
      const idx1 = title.toLowerCase().indexOf(key.toLowerCase())
      if (idx1 != -1) {
        hide = false
        dom_title.innerHTML =  title.substring(0, idx1) + h1 + title.substring(idx1, idx1 + key.length) + h2 + title.substring(idx1 + key.length)
      }

      // 搜索内容
      const idx2 = content.toLowerCase().indexOf(key.toLowerCase())
      if (idx2 != -1) {
        hide = false
        const left = Math.max(idx2 - 20, 0)
        const right = Math.min(left + Math.max(key.length, 100), content.length)
        const newContent = content.substring(left, right)
        const idx = newContent.toLowerCase().indexOf(key.toLowerCase())
        const innerHTML = newContent.substring(0, idx) + h1 + newContent.substring(idx, idx + key.length) + h2 + newContent.substring(idx + key.length)
        dom_content.innerHTML = innerHTML + '...'
      }
      // 内容未命中标题命中，内容直接展示前100个字符
      if (idx1 !== -1 && idx2 == -1) {
        dom_content.innerHTML = content.substring(0, 100) + '...'
      }
      if (hide) {
        dom_li.setAttribute('hidden', true)
      } else {
        dom_li.removeAttribute('hidden')
      }
    }
  }

  blog.addEvent(input, 'input', function (event) {
    if (!inputLock) {
      search(event.target.value)
    }
  })

  blog.addEvent(input, 'compositionstart', function (event) {
    inputLock = true
  })

  blog.addEvent(input, 'compositionend', function (event) {
    inputLock = false
    search(event.target.value)
  })
})
