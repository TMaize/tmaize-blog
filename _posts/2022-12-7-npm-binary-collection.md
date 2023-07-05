---
layout: mypost
title: NPM Binary Mirror 汇总
categories: [前端]
---

一些 NPM 包是用 C++ 写的，在安装这些模块时会通过`node-gyp`在本地编译，由于开发环境和网络环境等因素，大部分都会失败。以 `better-sqlite3` 为例，安装阶段会执行 `prebuild-install || node-gyp rebuild --release`

有的包会利用 [prebuild-install](https://www.npmjs.com/package/prebuild-install) 下载预构建的包，有的包会读取相应的参数（.npmrc \| 环境变量），在程序内部自己去下载预编译的包

因此配置合适的 Binary Mirror 可以加快安装的速度

[查询所有有镜像的包](https://registry.npmmirror.com/binary.html)

## sqlite3

新旧版本拼接的规则不一样

```
npm i sqlite3@5.0.2 -S --node_sqlite3_binary_host_mirror=https://npmmirror.com/mirrors

npm i sqlite3@5.1.2 -S --node_sqlite3_binary_host_mirror=https://npmmirror.com/mirrors/sqlite3
```

## better-sqlite3

需要注意的是有的包没有同步到文件，需要找一个有对应的版本下载，这里的版本用的是 [NODE_MODULE_VERSION ABI](https://nodejs.org/zh-cn/download/releases/#ref-1) 版本，可通过 `process.versions.modules`查看

我当前使用的是 v12.19.0，对应的 ABI 为 72，所以找到一个有 `better-sqlite3-${version}-node-v72-linux-x64.tar.gz` 文件的版本即可正常下载

![s1](s1.png)

![s2](s2.png)

```
better_sqlite3_binary_host=https://registry.npmmirror.com/-/binary/better-sqlite3
better_sqlite3_binary_host_mirror=https://registry.npmmirror.com/-/binary/better-sqlite3
```

```
npm i better-sqlite3@7.2.0 -S --better-sqlite3_binary_host=https://registry.npmmirror.com/-/binary/better-sqlite3
```

然而可能会报另外一个错，提示缺少 GLIBCXX_3.4.20，所以要升级下 gcc

```
prebuild-install WARN install /lib64/libstdc++.so.6: version `GLIBCXX_3.4.20' not found (required by /root/demo/node_modules/better-sqlite3/build/Release/better_sqlite3.node)
```

当前使用所支持的所有版本 `strings /usr/lib64/libstdc++.so.6 | grep GLIBC`

升级 gcc 比较麻烦，这里使用低版本的 better-sqlite3 即可正常安装

```
npm i better-sqlite3@7.1.2 -S --better-sqlite3_binary_host=https://registry.npmmirror.com/-/binary/better-sqlite3
```

## sentry

```
npm install @sentry/cli -g --sentrycli_cdnurl=https://npmmirror.com/mirrors/sentry-cli --unsafe-perm --allow-root
```
