# 地址

 [我的Blog预览](http://blog.tmaize.net/) 欢迎添加友链

 [github 地址](https://github.com/TMaize/tmaize-blog) 欢迎star

# 说明

一款jekyll主题，简洁纯净，支持自适应

由于一直在这个项目里面修改主题代码，和以前的项目simple-jekyll-theme差异太大，现在把simple-jekyll-theme删除了，只留这一个项目,只有一个master分支

 
# 截图

![s1](readme/01.jpg)

![s2](readme/02.jpg)

# 使用

## 配置说明

```
encoding: utf-8

# seo
title: TMaize'Blog
description: TMaize'Blog
keywords: TMaize,Blog,TMaize'Blog
author: TMaize

# 上下文环境，"","/blog"
context: ""
"siteMapPrefix": "http://blog.tmaize.net"

## 文章url前缀
permalink: /posts/:year/:month/:day/:title.html

copyright: 2016
record: "皖ICP备16016174号"

coderay:
  coderay_tab_width: 4
```

## 写文章

符合 jekyll 的使用规范，请参考我的文件放置规则

文章放在_posts目录

文章资源放在posts目录

## 要修改的文件

+ _includes/footer.html

    请删除本页所有的script标签内的东西

    或者把百度和360的seo推送,mta统计代码替换成你自己的

+ CNAME

    如果支持cname请换成你自己的域名