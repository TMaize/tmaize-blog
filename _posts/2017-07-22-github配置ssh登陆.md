---
layout: mypost
title: GitHub配置SSH登陆
categories: [小技巧]
---

http 和 ssh 的区别都可以克隆项目到本地。使用 http 客户端无需额外的配置；而使用 ssh 需要先配置和公钥私钥，好处是使用 git 操作的时候可以不用不填写用户名，如果密钥不设置密码连密码也省去了填写

## 基本步骤

### 生成公钥私钥

1. windows 平台

   1. git 安装目录`usr/bin/ssh-keygen.exe`
   2. 或者使用 XShell 自带的图形工具：工具-新建密钥生成向导

2. linux 下直接使用 ssh-keygen 命令

命令`#ssh-keygen -t [rsa|dsa] [-C "email"]`

```sh
# 提示输入文件名,默认为id_rsa
# 提示输入密码,默认无密码
# 重复输入密码
ssh-keygen -t rsa -C "youremail@demo.com"
```

之后就会在`C:\Users\tmaize\.ssh`目录就可以看到多了两个文件，如果上述步骤没有输入文件名，则一个是 id_rsa 一个是 id_rsa.pub

### 将公钥内容复制并上传于 github

1. 在个人信息设置 SSH and GPG keys 为所有项目设置一个统一的

2. 在单个项目的设置里面设置 Deploy keys，记得勾选 Allow write access

### 测试连接

```
ssh -T git@github.com
Enter passphrase for key '/c/Users/tmaize/.ssh/id_rsa':
Hi TMaize! You've successfully authenticated, but GitHub does not provide shell access.
```

### 项目测试

将你的项目通过 ssh clone 到本地，如果为密钥设置了密码，会提示输入密钥密码，在 push 的时候会再次提示输入密钥的密码。如果在建立公钥私钥的时候没有设置密码，那么在 clone push 的在整个过程中都无需密码。

## 为不同域名配置不同密钥

一般情况下都是默认使用 id_rsa，当然也可以针对不用的域名使用不同的密钥

再次生成一对 id_rsa_nopwd 和 id_rsa_nopwd.pub,加入我要把这个密钥应用与 gitee，guthub 不变依旧使用默认的 id_rsa

在`C:\Users\用户名\.ssh`下面新建文件 config，换行格式使用 LF

假设克隆地址为`git@gitee.com/user/project.git`,HostName 取`gitee.com`User 取`git`,Host 是别名用于区分同一个域名不同项目的，一般设置的都是全局的密钥，Host 直接取 HostName 就行了

如果要区分同一域名下的不同项目，需要设置不同的 Host 就行了假设 Host 设置为了 test，则克隆地址要变为`git@test/user/project.git`

```
Host gitee.com
     HostName gitee.com
     IdentityFile C:/Users/tmaize/.ssh/id_rsa_nopwd
     PreferredAuthentications publickey
     User git
```

最后记得删除下同目录下 known_hosts 文件。至此就实现了不同域名使用不同密钥

## 一些问题

### 使用 TortoiseGit 失败

在使用 TortoiseGit 图形界面 clone 时老是失败，只需要修改 TortoiseGit 的设置即可

在设置-网络里配置 SSH 客户端为`E:\Git\usr\bin\ssh.exe`即可

### 将本地项目的协议由 http 修改为 ssh

方法有三种：

1. 修改命令

   `git remote origin set-url [url]`

2. 先删后加

   ```
   git remote rm origin
   git remote add origin [url]
   ```

3. 直接修改`项目目录/.git/config`文件

4. 使用 TortoiseGit 设置-Git-远端
