---
layout: mypost
title: 解决Page build failure
categories: [Jekyll]
---

前几天提交 Git 后，收到了 Github 的邮件提示 Page build failure

```
The page build failed for the `master` branch with the following error:

Page build failed. For more information, see https://help.github.com/en/articles/troubleshooting-jekyll-build-errors-for-github-pages-sites#troubleshooting-build-errors.

For information on troubleshooting Jekyll see:

  https://help.github.com/articles/troubleshooting-jekyll-builds

If you have any questions you can contact us by replying to this email.
```

这个错误是很奇怪的，我只是写了篇文章，没改动其他文件，怎么就 build failure 了，而且我在本地 build 也是没问题的。把文章删除，再次推送还是收到了同样的邮件。由于英语不太好就网上搜了封邮件回了过去

```
Hi:
  I don’t know why page build failure,I just modified a MD file, and now the page cannot be submitted again。

  Can you tell me the reason,Thank you for your reply.
```

今天收到了回复，告知是由于 github 升级了 Rouge 插件产生的这个问题，大意就是 Rouge 插件 在生成彩色代码时，对代码的语言无法断定，修改很简单，在代码段上加上语言类型就可以了

```
Conversion error: Jekyll::Converters::Markdown encountered an error while converting '_posts/2016-11-17-mybatis笔记整理.md':
                    Rouge::Guesser::Ambiguous
             Fatal: Rouge::Guesser::Ambiguous
                    Ambiguous guess: can't decide between ["mason", "xml"]
```

## 临时解决

确定问题较好解决了，和 github 使用同样的环境和版本就行了。

由于我是在 windows 上安装的 jekyll，环境无法保持统一就先试试把 rouge 升级一下试试

```sh
# 查看本地版本
gem list rouge
# 卸载
gem uninstall rouge -v 3.3.0
# 安装同版本的
gem install rouge -v 3.11.0
```

本地编译，果然报错，然后把对应的 md 的格式规范下就行了。多编译几次找到对应的不规范的文章修正就行了

![01](01.png)

## 解决方案

[https://help.github.com/articles/setting-up-your-github-pages-site-locally-with-jekyll/](https://help.github.com/articles/setting-up-your-github-pages-site-locally-with-jekyll/)

官方推荐的是在 push 前在本地编译检查下。其实本地是有环境的，只不过版本不一致。

官方推荐的是使用 bundler 来运行，使用 bundler 的好处是可以指定依赖的版本，在仓库中添加 Gemfile 即可。这样一来在 github 上编译时会使用你指定的 gem 插件的版本

```sh
gem install bundler
# 生成Gemfile
bundle init
# 不要jekyll serve了，使用bundle来执行
bundle exec jekyll serve
```

## Centos7 安装 jekyll

安装 Jekyll 要求 ruby 的版本在 2.1 以上。这里比较麻烦的是升级 ruby，因为 yum 能够安装的 ruby 太古老了

```sh
yum update
# 其实是为了安装gem
yum install ruby
ruby -v
```

安装 RVM(Ruby Version Manager),可以使用 RAM 轻松安装，管理 Ruby 版本

```sh
gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB

curl -sSL https://get.rvm.io | bash -s stable

source /etc/profile.d/rvm.sh
# 查看能安装的版本
rvm list known

rvm install 2.6
ruby -v

# 替换为国内源，不要用淘宝的，都不维护了
gem sources --add https://gems.ruby-china.com/
gem sources --remove https://rubygems.org/
gem sources --remove http://mirrors.aliyun.com/rubygems/
gem sources -l
gem update

gem install jekyll
gem install bundler
```

## 参考

[Testing your GitHub Pages site locally with Jekyll](https://help.github.com/en/articles/testing-your-github-pages-site-locally-with-jekyll/)

[Centos7 安装升级 Ruby](https://blog.csdn.net/qq_26440803/article/details/82717244)
