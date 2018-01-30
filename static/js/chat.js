if (window.attachEvent) {
    window.attachEvent("onload", initComment);
} else if (window.addEventListener) {
    window.addEventListener("load", initComment, false);
}

function initComment() {
    Bmob.initialize("34f0386ac5bd50fd77fe82190af00faf", "6f1419c800083315432f2df7dcb503d4");
    var url = window.location.host + window.location.pathname + window.location.search;
    var Comment = Bmob.Object.extend("Comment");

    var count = 0;
    var now = 0;
    var pageSize = 10;

    var reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$");
    var more = document.getElementsByClassName('comment-list-loadmore')[0];
    var list = document.getElementsByClassName('comment-list')[0].getElementsByTagName('ul')[0];
    var inputs = document.getElementsByClassName('comment-input');

    //加载评论条目
    var c_count = new Bmob.Query(Comment);
    c_count.equalTo("url", url);
    c_count.count({
        success: function (c) {
            count = c;
            if (c > 0) {
                count = c;
                loadMore(0, pageSize);
            }

        },
        error: function (error) {
            alert('查询总条数失败')
        }
    });

    //根据时间降序列出前15条
    function loadMore(skip, size) {
        var c_find = new Bmob.Query(Comment);
        c_find.equalTo("url", url);
        c_find.descending("time"); //时间降序排列
        c_find.skip(skip);
        c_find.limit(size);
        c_find.find({
            success: function (results) {
                now += results.length;
                if (now == count) {
                    more.style.display = 'none';
                } else {
                    more.style.display = 'block';
                }
                for (var i = 0; i < results.length; i++) {
                    render(i, results);
                }
            },
            error: function (error) {
                alert("拉取评论信息失败");
            }
        });
    }

    function render(i, results) {
        setTimeout(function () {
            var li = document.createElement('li');
            var website = results[i].get('website');
            if (website !== '') {
                website = " href='" + website + "'";
            }
            li.innerHTML = "<div class='comment-list-title'><a " + website + " target='_blank'>" +
                results[i].get('nickName') + "</a><span>" + results[i].get('time') +
                "</span></div><div class='comment-list-content'></div>";
            li.getElementsByClassName('comment-list-content')[0].innerText = results[i].get(
                'content');
            list.appendChild(li);
        }, 300 * i);
    }


    //加载后面15条数据
    inputs[5].onclick = function () {
        loadMore(now, pageSize);
    }

    //提交评论
    inputs[4].onclick = function () {
        var content = inputs[0].value.trim();
        var nickName = inputs[1].value.trim();
        var email = inputs[2].value.trim();
        var website = inputs[3].value.trim();
        if (content == '') {
            alert('评论内容不允许为空!')
            return;
        }
        if (content.length > 300) {
            alert('评论内容超过了300字')
            return;
        }
        if (nickName == '') {
            alert('姓名不允许为空!')
            return;
        }

        if (nickName.toLowerCase().indexOf("tmaize") != -1) {
            alert('姓名不准包含TMaize');
            return;
        }

        if (email != '' && !reg.test(email)) {
            alert('邮箱不合法!')
            return;
        }

        if (website != '' && website.substring(0, 4) != 'http') {
            alert('你的站点不合法!')
            return;
        }
        var c_insert = new Comment();
        c_insert.set("url", url);
        c_insert.set("nickName", nickName);
        c_insert.set("email", email);
        c_insert.set("website", website);
        c_insert.set("time", new Date());
        c_insert.set("content", content);
        c_insert.save(null, {
            success: function (object) {
                window.location.href = window.location.href;
            },
            error: function (model, error) {
                alert("数据存储失败");
            }
        });
    }
}