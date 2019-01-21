---
layout: mypost
title: Centos 安装NodeJs
categories: [Linux,Node.js]
---

系统版本CentOS 6.3 32bit

## 编译安装

官方下载地址[https://nodejs.org/en/download/](https://nodejs.org/en/download/)

推荐下载LTS版本，不需要下载最新的

选择Source Code的那个链接

下载，开始编译，....

```
https://nodejs.org/dist/v8.9.4/node-v8.9.4.tar.gz
tar xvf node-v8.9.4.tar.gz
cd node-v8.9.4
./configure
```

configure之后显示WARNING: C++ compiler too old, need g++ 4.9.4 or clang++ 3.4.2 (CXX=g++)

表示gcc版本太低，需要升级，貌似CentOS 6.3 gcc升级比较麻烦，不搞了，直接使用二进制版本算了

## 二进制版本安装

同上

找到 Linux Binaries (x86/x64)，这里选择32位

```
wget https://nodejs.org/dist/v8.9.4/node-v8.9.4-linux-x86.tar.xz
xz -d node-v8.9.4-linux-x86.tar.xz 
tar xvf node-v8.9.4-linux-x86.tar 
mv node-v8.9.4-linux-x86 /usr/local/
cd /usr/local/node-v8.9.4-linux-x86/bin/
node -v
```

输出 v8.9.4 表示安装成功

`/usr/local/node-v8.9.4-linux-x86/bin/` 里面有 node npm npx 三个文件

为了可以全局执行这三个文件，可以软链接到 `/usr/local/bin` 或者添加环境变量

```
vi /etc/profile
source /etc/profile
```

最后几行做如下配置

```
#环境变量
export JAVA_HOME=/usr/java/jdk1.8.0_101
export CLASSPATH=.:$JAVA_HOME/lib:$JAVA_HOME/jre/lib

export NODEJS_HOME=/usr/local/node-v8.9.4-linux-x86/bin

export PATH=$JAVA_HOME/bin:$JAVA_HOME/jre/bin:$NODEJS_HOME:$PATH
```


## 测试


切到任意目录

```
echo console.log\(\'hello\'\) > test.js
node test.js
```

输出hello


