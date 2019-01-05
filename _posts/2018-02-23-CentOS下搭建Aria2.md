---
layout: mypost
title: CentOS下搭建Aria2
categories: [Linux]
---

适用于CentOS 6.3 32位，64位替换下rpm就可以了

在网上找了些教程，但是CentOS的第三方软件源RepoForge已经无法访问的

替换为[http://ftp.tu-chemnitz.de/pub/linux/dag/redhat/el6/en/i386/rpmforge/RPMS/](http://ftp.tu-chemnitz.de/pub/linux/dag/redhat/el6/en/i386/rpmforge/RPMS/)就可以了

```
http://ftp.tu-chemnitz.de/pub/linux/dag/redhat/el6/en/i386/rpmforge/RPMS/aria2-1.16.4-1.el6.rf.i686.rpm

http://ftp.tu-chemnitz.de/pub/linux/dag/redhat/el6/en/i386/rpmforge/RPMS/nettle-2.2-1.el6.rf.i686.rpm

http://ftp.tu-chemnitz.de/pub/linux/dag/redhat/el6/en/i386/rpmforge/RPMS/nettle-devel-2.2-1.el6.rf.i686.rpm
```

```
rpm -ivh aria2-1.16.4-1.el6.rf.i686.rpm
```

在安装过程有可能会出现缺少 libnettle.so.4 的错误提示，先安装nettle 即可

```
rpm -ivh aria2-1.16.4-1.el6.rf.i686.rpm
rpm -ivh nettle-2.2-1.el6.rf.i686.rpm
rpm -ivh nettle-devel-2.2-1.el6.rf.i686.rpm
```

## 测试

以 机器之血.Bleeding.Steelv.2017.1080p.WEB-DL.X264.AAC-国语中字-RARBT的种子为例,2GB的电影在VPS里面差不多两分钟就下载好了

最大化的利用VPS的高速宽带，把电影放在http服务的目录下直接观看还是挺方便的

```
aria2c http://111.73.45.199:8090/b1/%E6%9C%BA%E5%99%A8%E4%B9%8B%E8%A1%80.Bleeding.Steelv.2017.1080p.WEB-DL.X264.AAC-%E5%9B%BD%E8%AF%AD%E4%B8%AD%E5%AD%97-RARBT.torrent
```

## WebUI

使用 AriaNg，纯html/js/css 通过ajax调用aria2的rpc接口来下载文件

```
http://ariang.mayswind.net/zh_Hans/
```

启动 aria2c

```
aria2c --enable-rpc --rpc-listen-all=true  --disable-ipv6=true --rpc-allow-origin-all
```

设置AriaNg

```
http://域名:6800/jsonrpc

http连接，密码不填写，会提示连接成功
```