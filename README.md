# 介绍

一款jekyll主题，简洁纯净，支持自适应

2.0版本，主题重构，留言板美化，过渡动画更柔顺，css布局兼容性更强，未引入任何框架，秒开页面

下面有具体的样式截图，或者你可以到我的博客查看

[我的Blog预览](http://blog.tmaize.net/) 欢迎添加友链

[github 地址](https://github.com/TMaize/tmaize-blog) 欢迎star

# 使用

1. CNAME文件里的内容请换成你自己的域名(使用github的二级域名可以删除该文件)

2. 请删除_includes/footer.html里面的统计代码，删除（__site-generator版本-使用jekyll请删除，__小程序）目录

3. 修改_data/links.json友情链接里的内容，如果可以，欢迎加上http://blog.tmaize.net

5. 适当修改_config.yml文件，见下方配置文件说明

5. 请参考我的文件放置规则，文章放在_posts目录，文章资源放在posts目录

# 配置文件说明

```
encoding: utf-8

# seo
title: TMaize'Blog
description: TMaize'Blog
keywords: TMaize,Blog,TMaize'Blog
author: TMaize

# 上下文环境，"","/blog"
context: ""
# 用于生成sitemap
"siteMapPrefix": "http://blog.tmaize.net"

## 文章url前缀
permalink: /posts/:year/:month/:day/:title.html

copyright: 2016
record: "皖ICP备16016174号"

coderay:
  coderay_tab_width: 4
```

# 移动端截图

![mobile](readme/mobile.jpg)

# PC端截图

![pc](readme/pc.jpg)