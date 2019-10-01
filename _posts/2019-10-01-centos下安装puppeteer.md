---
layout: mypost
title: CentOS下安装Puppeteer
categories: [Linux]
---

> puppeteer 是一个 Chrome 官方出品的 headless Chrome node 库。它提供了一系列的 API, 可以在无 UI 的情况下调用 Chrome 的功能, 适用于爬虫、自动化处理等各种场景

Puppeteer 的安装很简单，主要复杂是 chromium 依赖的安装较为麻烦

## 安装

这里直接使用 npm 安装就行了,建一个简单的 node 项目，package.json 内容如下

```json
{
  "name": "node-d",
  "version": "1.0.0",
  "description": "",
  "scripts": {},
  "author": "",
  "license": "ISC",
  "dependencies": {
    "puppeteer": "^1.20.0"
  }
}
```

安装好后，chromium 也会一起安装，位置在`node_modules/puppeteer/.local-chromium`。可以通过设置环境变量或者 npm config 中的 PUPPETEER_SKIP_CHROMIUM_DOWNLOAD 跳过下载。如果不下载的话，启动时可以通过 `puppeteer.launch([options])`配置项中的 executablePath 指定 Chromium 的位置

## 测试

写段简单的代码看看能不能使用

```js
const puppeteer = require('puppeteer')
const devices = require('puppeteer/DeviceDescriptors')

async function start() {
  // root 用户启动需要添加沙箱参数
  // args: ['--no-sandbox']
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  })

  const page = await browser.newPage()

  await page.emulate(devices['iPhone 6'])

  await page.goto('https://baidu.com')

  await page.screenshot({
    path: new Date().getTime() + '.png',
    fullPage: true
  })

  await browser.close()
}

start()
```

## chromium 依赖安装

执行上面的代码报错，内容如下，大意就是缺少相关额库文件

```
error while loading shared libraries: libcups.so.2: cannot open shared object file: No such file or directory
```

根据库文件去反查在那个程序中。这里直接安装 cups-libs，记得去掉后面的版本号，不然子依赖不会安装

```shell
yum provides libcups.so.2
# 1:cups-libs-1.6.3-40.el7.i686 : CUPS printing system - libraries
# 源    ：os
# 匹配来源：
# 提供    ：libcups.so.2
yum install cups-libs
```

再启动还是缺少其他库文件，直接到 chromium 的执行文件下查询依赖

```
cd node_modules/puppeteer/.local-chromium/linux-686378/chrome-linux
ldd chrome | grep not
# libatk-bridge-2.0.so.0 => not found
# libpangocairo-1.0.so.0 => not found
# libpango-1.0.so.0 => not found
# libcairo.so.2 => not found
# libatspi.so.0 => not found
# libgtk-3.so.0 => not found
# libgdk-3.so.0 => not found
# libgdk_pixbuf-2.0.so.0 => not found
# 查找到缺少的so文件，同上反查询出安装包名
yum install atk pango at-spi2-atk gtk3
```

## 字体安装

经过一番折腾，依赖装完了，我们的测试代码运行成功，输出了一张图片，但是打开图片会发现字体全是方块，很明显是缺少中文字体的原因

![screenshot](screenshot.png)

直接安装 centos 下的字体包就行了，一般就够用了

```shell
yum groupinstall "fonts" -y
```

## 参考

[puppeteer api.md](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md)

[puppeteer 中文文档](https://zhaoqize.github.io/puppeteer-api-zh_CN/#/)

[Puppeteer 的入门教程和实践](https://www.cnblogs.com/rennaiqian/p/8325260.html)

[CentOS6.5-64 位安装 puppeteer，提示 Chrome 无法启动](https://segmentfault.com/a/1190000015802337)
