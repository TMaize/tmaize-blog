---
layout: mypost
title: git 学习
categories: [git]
---

2个小时弄出来一个自认为很好看的git log的显示方式
```
git log --graph --pretty="%C(Yellow)%h %C(Cyan)【%an】 %C(reset)%ad %C(Green)(%cr)%C(reset)  %C(reset)%s" --date=format:"%Y-%m-%d %H:%M:%S" -n 12 --name-status
```

![git log](git-log.png)
