blog.tmaize = false;
blog.addLoadEvent(function () {
    Bmob.initialize("34f0386ac5bd50fd77fe82190af00faf", "6f1419c800083315432f2df7dcb503d4");
    var url = window.location.host + window.location.pathname + window.location.search;
    var Comment = Bmob.Object.extend("Comment");
    var count = 0;
    var now = 0;
    var pageSize = 7;

    var loadButton = document.getElementsByClassName('comment-more')[0].getElementsByTagName('span')[0];

    //加载评论条目
    var queryObject = new Bmob.Query(Comment);
    queryObject.equalTo("url", url);
    //异步的
    queryObject.count({
        success: function (c) {
            count = c;
            if (c > 0) {
                loadMore(0, pageSize);
            }else{
                loadButton.innerText = '未发现评论';
            }
        },
        error: function (e) {
            loadButton.innerText = '查询总条数失败';
            log.error(e)
        }
    });

    //查询留言
    function loadMore(skip, size) {
        var queryObject = new Bmob.Query(Comment);
        queryObject.equalTo("url", url);
        queryObject.descending("time"); //时间降序排列
        queryObject.skip(skip);
        queryObject.limit(size);
        queryObject.find({
            success: function (results) {
                now += results.length;
                if (now == count) {
                    loadButton.innerText = '暂无更多评论';
                }else{
                    loadButton.innerText = '加载更多';
                }
                for (var i = 0; i < results.length; i++) {
                    render(results[i], i);
                }
            },
            error: function (e) {
                loadButton.innerText = '查询评论列表失败';
                log.error(e)
            }
        });
    }

    //把一个评论放入到页面中
    function render(comment, i) {
        var node = document.getElementsByClassName('comment-list-templete')[0].children[0].cloneNode(true);
        var ul = document.getElementsByClassName('comment-list')[0];
        var head = node.getElementsByClassName('head')[0];
        var headUrl = head.getAttribute('baseUrl');
        if (comment.get('email') == '') {
            head.setAttribute('src', headUrl);
        } else {
            head.setAttribute('src', headUrl + blog.md5(comment.get('email')));
        }
        var name = node.getElementsByClassName('name')[0];
        name.innerHTML = comment.get('nickName');
        if (comment.get('website') == '') {
            blog.addClass(name, 'comment-no-url');
        } else {
            name.setAttribute('href', comment.get('website'));
        }
        node.getElementsByClassName('time')[0].innerText = comment.get('time').substr(0, 10);
        node.getElementsByClassName('content')[0].innerText = comment.get('content');
        ul.appendChild(node);
    }

    //加载更多
    blog.addEvent(loadButton, "click", function () {
        if(loadButton.innerText == '加载更多'){
            loadButton.innerText = '评论拉取中';
            loadMore(now, pageSize);
        }
    });

    //提交评论
    blog.addEvent(document.getElementsByClassName('comment-form')[0].getElementsByTagName('span')[0], "click", function () {
        var emailCheck = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$");
        var urlCheck = new RegExp("^https?:\/\/.+\..+");

        var dom_form = document.getElementsByClassName('comment-form')[0];
        var dom_name = dom_form.getElementsByTagName('input')[0];
        var dom_email = dom_form.getElementsByTagName('input')[1];
        var dom_site = dom_form.getElementsByTagName('input')[2];
        var dom_content = dom_form.getElementsByTagName('textarea')[0];

        var name = blog.trim(dom_name.value);
        var email = blog.trim(dom_email.value);
        var site = blog.trim(dom_site.value);
        var content = blog.trim(dom_content.value);

        if (name == '' || name.length > 20) {
            alert('昵称为空或长度大于20！')
            return;
        }
        if (!blog.tmaize && name.toLowerCase().indexOf('tmaize') != -1) {
            alert('昵称禁止包含TMaize')
            return;
        }
        if (email != '' && (email.length > 50 || !emailCheck.test(email))) {
            alert('邮箱长度大于50或格式错误！')
            return;
        }
        if (site != '' && (site.length > 80 || !urlCheck.test(site))) {
            alert('站点长度大于80或格式错误！')
            return;
        }
        if (content == '' || content.length > 200) {
            alert('内容为空或长度大于200！')
            return;
        }

        var updateObject = new Comment();
        updateObject.set("url", url);
        updateObject.set("nickName", name);
        updateObject.set("email", email);
        updateObject.set("website", site);
        updateObject.set("time", new Date());
        updateObject.set("content", content);
        updateObject.save(null, {
            success: function (object) {
                window.location.href = window.location.href;
            },
            error: function (model, error) {
                alert("提交评论失败");
            }
        });
    })
});