# 介绍

一款 jekyll 主题（[GitHub 地址](https://github.com/TMaize/tmaize-blog)），简洁纯净，支持自适应，未引入任何框架，秒开页面

下面有具体的样式截图，或者你可以到[TMaize Blog](http://blog.tmaize.net/)查看运行效果

# 注意

1. 如果使用自己的域名，`/CNAME`文件里的内容请换成你自己的域名，然后 CNAME 解析到`用户名.github.com`

2. 如果使用 GitHub 的的域名，请删除`/CNAME`文件,然后把你的项目修改为`用户名.github.io`

3. 删除`/_include/script.html` 里面的,MTA 腾讯移动分析和百度的自动推送

4. 修改`/pages/about.md`中关于我的内容

5. 修改`/_data/links.json` 友情链接里的内容

6. 适当修改`/_config.yml` 文件，具体作用请参考注释

7. 清空`/_posts`目录下文件和`/post`目录下文件

8. 网站的 logo 放在了`/static/img/`下

9. 最后，如果你把项目 fork 过去了，想要删除我的提交记录可以先软重置到第一个提交，然后再提交一次，最后强制推送一次就行了

# 使用

文章放在`/_posts`目录，命名为`yyyy-MM-dd-xxxx-xxxx.md`，内容格式如下

```
---
layout: mypost
title: 标题
categories: [分类1,分类2]
---

文章内容，MD格式
```

文章资源放在`/posts`目录，如文章标题是`2019-05-01-theme-user.md`，则该篇文章的资源放在`/posts/2019/05/01`下,在文章使用时直接引用即可

```
![这是图片](xxx.png)

[xxx.zip下载](xxx.zip)
```

# 移动端截图

![mobile](static/readme/mobile.jpg)

# PC 端截图

![pc](static/readme/pc.jpg)
