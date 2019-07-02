blog.addLoadEvent(function() {
  Bmob.initialize(blog.bmobApplicationId, blog.bmobRestApiKey)
  var commentUrl = window.location.hostname + window.location.pathname
  var gravatarUrl = 'http://www.gravatar.com/avatar/'
  var loaded = 0
  var pageSize = 10
  var list = document.querySelector('.page-chat-list')
  var loadButton = document.querySelector('.page-chat-load')
  var submitButton = document.querySelector('.page-chat-submit')
  var templet = document.querySelector('.page-chat-list-templet')

  loadComment()

  // 加载留言
  function loadComment() {
    loadButton.innerText = '评论加载中...'
    var query = Bmob.Query('Comment')
    query.equalTo('url', '==', commentUrl)
    query.order('-time')
    query.skip(loaded)
    query.limit(pageSize)
    query
      .find()
      .then(res => {
        loaded += res.length
        if (res.length == 0) {
          loadButton.innerText = '暂无更多评论'
        } else {
          loadButton.innerText = '加载更多'
        }
        res.forEach(item => {
          var commentItem = templet.cloneNode(true)
          commentItem.removeAttribute('hidden')
          blog.removeClass(commentItem, 'page-chat-list-templet')

          var commentHead = commentItem.querySelector('.head')
          var commentName = commentItem.querySelector('.name')
          var commentDate = commentItem.querySelector('.date')
          var commentContent = commentItem.querySelector('.content')

          var headImage = gravatarUrl
          if (item['email']) {
            headImage += blog.md5(item['email'])
          }
          commentHead.setAttribute('src', headImage)

          var website = 'javascript:void(0);'
          if (item['website']) {
            website = item['website']
            commentName.querySelector('span').innerText = item['nickName']
            blog.addClass(commentName, 'name-website')
          }
          commentName.setAttribute('href', website)
          commentName.querySelector('span').innerText = item['nickName']
          commentDate.innerText = item['time'].iso.substr(0, 10)
          commentContent.innerText = item['content']
          list.appendChild(commentItem)
        })
      })
      .catch(err => {
        loadButton.innerText = '评论加载失败'
        console.error(err)
      })
  }

  // 加载更多
  blog.addEvent(loadButton, 'click', function() {
    if (loadButton.innerText == '加载更多') {
      loadComment()
    }
  })

  // 重新加载留言
  function reloadComment() {
    list.innerHTML = ''
    loaded = 0
    loadComment()
  }

  // 提交评论
  blog.addEvent(submitButton, 'click', function() {
    var emailCheck = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/
    var urlCheck = /^https?:\/\/.+\..+/
    var sucessTip =
      '留言成功，本博客不支持留言提醒，如需联系博主请查看About页面获取联系方式'
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
    var loading = blog.loading()

    var query = Bmob.Query('Comment')
    query.set('url', commentUrl)
    query.set('nickName', name)
    query.set('email', email)
    query.set('website', site)
    query.set('time', {
      __type: 'Date',
      iso: new Date().toISOString()
    })
    query.set('content', content)
    query
      .save()
      .then(res => {
        dom_form.reset()
        loading.hide()
        if (sucessTip) {
          alert(sucessTip)
        }
        reloadComment()
      })
      .catch(err => {
        loading.hide()
        console.error(err)
        alert('提交评论失败')
      })
  })
})
