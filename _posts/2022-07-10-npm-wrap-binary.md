---
layout: mypost
title: 把可执行程序打成NPM包
categories: [小技巧]
---

在使用 npm 的过程中会发现，一些包并不是常规的 JS 代码，比如`@sentry/cli`、`esbuild`，`sqlite3`。所以可以把其他软件封装成 npm 包，方便前端人员下载安装

## 原理

NPM 中也存在[生命周期](https://docs.npmjs.com/cli/v8/using-npm/scripts#life-cycle-scripts)的概念，当执行`npm install`时候会执行 script 标签中定义的如下脚本

- preinstall
- install
- postinstall
- prepublish
- preprepare
- prepare
- postprepare

## 抄作业

看了下源码，大致有下面几种实现

### esbuild

[esbuild](https://unpkg.com/browse/esbuild@0.14.48/) 是在 `postinstall` 阶段去安装带有二进制文件的子包

- [esbuild-linux-64](https://unpkg.com/browse/esbuild-linux-64@0.14.48/)
- [esbuild-windows-64](https://unpkg.com/browse/esbuild-windows-64@0.14.48/)

### @sentry/cli

[@sentry/cli](https://unpkg.com/browse/@sentry/cli@2.3.1/) 则是在 `install` 阶段去下载可执行文件，然后拷贝的包的根目录

但是 npm 出于安全考虑，在安装期间是以 nobody 的身份去运行的，而这个用户几乎没有任何权限，所以在拷贝的过程中会报没有权限的错误，因此要加上`--unsafe-perm`参数

```
npm install @sentry/cli -g --sentrycli_cdnurl=https://npmmirror.com/mirrors/sentry-cli
```

## sqlite3

[sqlite3](https://unpkg.com/browse/sqlite3@5.0.8/) 则是在 `install` 阶段执行 `node-gyp` 去编译当前平台下的 C++ 代码，当指定了`node_sqlite3_binary_host_mirror` 则跳过编译直接去下载已编译好的 [C++ addons](https://nodejs.org/dist/latest-v16.x/docs/api/addons.html)。这一点对 Windows 平台还是比较友好的，毕竟 Windows 系统安装 gcc 还是比较麻烦的

```
npm i sqlite3 --node_sqlite3_binary_host_mirror=https://npmmirror.com/mirrors/sqlite3
```

## 实现

安装完成后去下载 GitHub 上的 release 不太可取，应为国内网络环境较差可能会报错

考虑直接在包中内内置 Win、Linux、Mac 平台下的安装包，安装完成后去解压

依赖解压模块包有显得多余，Win 下可以使用 PowerShell 去解压，Linux 和 Mac 都会有 tar ，所以可以直接使用 `child_process` 调用系统命令去解压

但是安装过程中 nobody 又没有执行命令的权限，因此可以把解压的过程放到首次执行的时候

```js
#!/usr/bin/env node

'use strict'

const os = require('os')
const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')

function getBinFile() {
  const platform = os.platform()
  const arch = os.arch()

  const cwd = path.resolve(__dirname, '..', 'release')
  const zipFile = `dev-server-${platform}-${arch}` + (platform === 'win32' ? '.zip' : '.tar.gz')
  const binPath = path.resolve(__dirname, '..', 'release', platform === 'win32' ? 'dev-server.exe' : 'dev-server')

  if (fs.existsSync(binPath)) {
    return binPath
  }

  if (platform == 'win32') {
    childProcess.execSync(`Expand-Archive -Force ${zipFile} .`, { stdio: 'inherit', shell: 'powershell.exe', cwd })
  } else {
    childProcess.execSync(`tar xf ${zipFile}`, { stdio: 'inherit', cwd })
  }
  return binPath
}

const binPath = getBinFile()

const child = childProcess
  .spawn(binPath, process.argv.slice(2), {
    stdio: 'inherit'
  })
  .on('error', err => {
    console.error(err)
    process.exit(1)
  })
  .on('exit', code => process.exit(code))

process.on('SIGTERM', () => child.kill('SIGTERM'))
process.on('SIGINT', () => child.kill('SIGINT'))
```

## 注意

在 Windows 平台下，如果 bin 指向的是一个可执行文件的话，必须要带有文件后缀，虽然不带后缀的在 MinGW 环境下没问题，但是在 CMD 下会报错

```json
{
  "bin": {
    "dev-server": "./bin/dev-server.exe"
  }
}
```
