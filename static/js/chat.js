blog.tmaize = false
blog.addLoadEvent(function() {
  // 都暴露在外面了，希望不会被人乱搞
  var bmobApplicationId = '34f0386ac5bd50fd77fe82190af00faf'
  var bmobRestApiKey = '6f1419c800083315432f2df7dcb503d4'
  var url = window.location.hostname + window.location.pathname
  var count = 0
  var now = 0
  var pageSize = 8
  var list = document.getElementsByClassName('page-chat-list')[0]
  var loadButton = document.getElementsByClassName('page-chat-load')[0]
  var submitButton = document.getElementsByClassName('page-chat-submit')[0]
  var templet = document.getElementsByClassName('page-chat-list-templet')[0]
  templet = templet.innerHTML
  // 初始化Bmob
  Bmob.initialize(bmobApplicationId, bmobRestApiKey)
  var Comment = Bmob.Object.extend('Comment')

  //加载评论条目
  var queryObject = new Bmob.Query(Comment)
  queryObject.equalTo('url', url)
  queryObject.count({
    success: function(c) {
      count = c
      if (c > 0) {
        loadMore(0, pageSize)
      } else {
        loadButton.innerText = '未发现评论'
      }
    },
    error: function(e) {
      loadButton.innerText = '查询总条数失败'
      log.error(e)
    }
  })

  //查询留言
  function loadMore(skip, size) {
    var queryObject = new Bmob.Query(Comment)
    queryObject.equalTo('url', url)
    queryObject.descending('time') //时间降序排列
    queryObject.skip(skip)
    queryObject.limit(size)
    queryObject.find({
      success: function(results) {
        now += results.length
        if (now == count) {
          // loadButton.innerText = '暂无更多评论'
          loadButton.parentNode.parentNode.removeChild(loadButton.parentNode)
        } else {
          loadButton.innerText = '加载更多'
        }
        for (var i = 0; i < results.length; i++) {
          render(results[i])
        }
      },
      error: function(e) {
        loadButton.innerText = '查询评论列表失败'
        log.error(e)
      }
    })
  }

  //把一个评论放入到页面中
  function render(comment) {
    var html = templet
    html = html.replace('{blank}', '')
    if (comment.get('email') == '') {
      html = html.replace('{emailMD5}', '')
    } else {
      html = html.replace('{emailMD5}', blog.md5(comment.get('email')))
    }
    html = html.replace('{name}', comment.get('nickName'))
    if (comment.get('website') == '') {
      html = html.replace('{site}', 'javascript:void(0);')
      html = html.replace('{hasSite}', 'false')
    } else {
      html = html.replace('{site}', comment.get('website'))
      html = html.replace('{hasSite}', 'true')
    }
    html = html.replace('{date}', comment.get('time').substr(0, 10))
    html = html.replace('{content}', blog.encodeHtml(comment.get('content')))

    var o = document.createElement('div')
    o.innerHTML = html
    list.appendChild(o.children[0])
    o = null
  }

  //加载更多
  blog.addEvent(loadButton, 'click', function() {
    if (loadButton.innerText == '加载更多') {
      loadButton.innerText = '评论拉取中'
      loadMore(now, pageSize)
    }
  })

  //提交评论
  blog.addEvent(submitButton, 'click', function() {
    var emailCheck = new RegExp(
      '^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$'
    )
    var urlCheck = new RegExp('^https?://.+..+')
    var dom_form = document.getElementsByTagName('form')[0]
    var dom_name = dom_form.getElementsByTagName('input')[0]
    var dom_email = dom_form.getElementsByTagName('input')[1]
    var dom_site = dom_form.getElementsByTagName('input')[2]
    var dom_content = dom_form.getElementsByTagName('textarea')[0]

    var name = blog.trim(dom_name.value)
    var email = blog.trim(dom_email.value)
    var site = blog.trim(dom_site.value)
    var content = blog.trim(dom_content.value)

    if (name == '' || name.length > 20) {
      alert('昵称为空或长度大于20！')
      return
    }
    if (!blog.tmaize && name.toLowerCase().indexOf('tmaize') != -1) {
      alert('昵称禁止包含TMaize')
      return
    }
    if (email != '' && (email.length > 50 || !emailCheck.test(email))) {
      alert('邮箱长度大于50或格式错误！')
      return
    }
    if (site != '' && (site.length > 120 || !urlCheck.test(site))) {
      alert('站点长度大于120或格式错误！')
      return
    }
    if (content == '' || content.length > 200) {
      alert('内容为空或长度大于200！')
      return
    }

    var updateObject = new Comment()
    updateObject.set('url', url)
    updateObject.set('nickName', name)
    updateObject.set('email', email)
    updateObject.set('website', site)
    updateObject.set('time', new Date())
    updateObject.set('content', content)
    updateObject.save(null, {
      success: function(object) {
        alert('留言成功，本博客不支持留言提醒，如需联系博主请查看About页面获取联系方式')
        window.location.href = window.location.href
      },
      error: function(model, error) {
        console.error(error)
        alert('提交评论失败')
      }
    })
  })
})
