---
layout: mypost
title: Debian 12 安装记录
categories: [Linux]
---

记录下 Debian 12 安装过程

```
https://cdimage.debian.org/debian-cd/current/amd64/iso-dvd/debian-12.6.0-amd64-DVD-1.iso
```

## 配置软件源

安装完成后默认镜像源是 CD ROM 需要调整下

```
nano /etc/apt/sources.list
```

```
# https://mirrors.tuna.tsinghua.edu.cn/help/debian/

deb https://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm main contrib non-free non-free-firmware
# deb-src https://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm main contrib non-free non-free-firmware

deb https://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm-updates main contrib non-free non-free-firmware
# deb-src https://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm-updates main contrib non-free non-free-firmware

deb https://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm-backports main contrib non-free non-free-firmware
# deb-src https://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm-backports main contrib non-free non-free-firmware

deb https://mirrors.tuna.tsinghua.edu.cn/debian-security bookworm-security main contrib non-free non-free-firmware
# deb-src https://mirrors.tuna.tsinghua.edu.cn/debian-security bookworm-security main contrib non-free non-free-firmware
```

镜像配置好后更新下系统，如果更新时提示 SSL 错误，可以先将 `sources.list` 中的 https 改为 http，升级完成后再改回去

```
apt update && apt upgrade
```

## 配置 Vim

默认自带是 vim 并不是完整版的，使用上有好多问题，需要重新安装

```
apt remove vim-common
apt install vim
```

调整 vim 配置 `~/.vimrc`

```
syntax off

set number
set showmode
set showcmd
set t_Co=256
set cursorline
set nowrap
set noswapfile


set encoding=utf-8
set langmenu=zh_CN.UTF-8
language message zh_CN.UTF-8
set fileencoding=utf-8
set fileencodings=ucs-bom,utf-8,cp936,gb18030,big5,euc-jp,euc-kr,latin1
```

## 安装 Git

```
apt install git
git config --global user.name ming
git config --global user.email admin@ming.net
git config --global core.filemode false
git config --global core.quotepath false
git config --global --list
```

## 安装 ZSH

```
apt install zsh
wget https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh
sh install.sh
```

调整 `.zshrc`

```
# 关闭更新
zstyle ':omz:update' mode disabled
```

## 安装 Ruby

```
apt install ruby ruby-dev
```

## 安装 Docker

docker 官网无法访问了，这里使用清华的镜像源

```
for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do apt-get remove $pkg; done

apt-get update
apt-get install ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/debian \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

最新版本的 docker-compose 是通过 `docker compose` 使用，如果想使用 `docker-compose` 可以将其暴露出来

```
export PATH=$PATH:/usr/libexec/docker/cli-plugins
```

## Docker 镜像加速

[国内DockerHub镜像加速器还有哪些可用？(2024年7月18日)](https://www.wangdu.site/course/2109.html)

[public-image-mirror](https://github.com/DaoCloud/public-image-mirror/issues/2328)

一些可用的镜像地址：

- https://docker.cloudlayer.icu
- https://docker.1panel.dev
- https://dockerpull.org
- https://dockerhub.icu

使用方式 1：

```sh
# docker pull nginx:latest
docker pull dockerpull.org/library/nginx:latest
docker tag dockerpull.org/library/nginx:latest nginx::latest
docker rmi dockerpull.org/library/nginx:latest
```

使用方式 2：

```
tee /etc/docker/daemon.json <<EOF
{
    "registry-mirrors": [
      "https://docker.cloudlayer.icu",
      "https://docker.1panel.dev",
      "https://dockerpull.org",
      "https://dockerhub.icu"
    ]
}
EOF

systemctl daemon-reload
systemctl restart docker
```

## Virtualbox 增强功能

```
mkdir cdrom
mount /dev/cdrom cdrom
apt install build-essential dkms
sh ./VBoxLinuxAdditions.run --nox11
```
