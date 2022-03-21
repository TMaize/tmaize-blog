---
layout: mypost
title: Flex布局的一个bug
categories: [前端]
---

最近在项目中发现 Flex 布局的一个 [bug](https://bugs.chromium.org/p/chromium/issues/detail?id=507397) ，使用 `flex-direction: column` 时容器的宽度无法被撑开

## bug 复现

```html
<div class="box">
  <div>1</div>
  <div>2</div>
  <div>3</div>
  <div>4</div>
</div>

<style>
  .box {
    position: absolute; /* auto width */
    height: 300px;
    background-color: gray;
    display: flex;
    flex-flow: column wrap;
  }

  .box > div {
    height: 80px;
    width: 80px;
    background-color: pink;
    margin: 10px;
  }
</style>
```

![demo-1](demo-1.png)

## 方案 1

把内容当成文本`display: inline-block;`，然后设置文本的排版来实现相同的效果

```html
<style>
  .box {
    position: absolute;
    height: 300px;
    background-color: gray;
    writing-mode: vertical-lr;
    text-orientation: upright;
    font-size: 0;
  }

  .box > div {
    font-size: 14px;
    display: inline-block;
    height: 80px;
    width: 80px;
    background-color: pink;
    margin: 10px;
  }
</style>
```

![demo-2](demo-2.png)

需要注意的是如果 `writing-mode: vertical-lr` 的父容器的高度是弹性计算出来的，需要父容器设置`overflow: hidden;`，不然内容会无法往右延伸

比如下面这种情况：

```html
<div class="flex">
  <div class="child-1"></div>
  <div class="child-2">
    <div class="box">
      <div>1</div>
      <div>2</div>
      <div>3</div>
      <div>4</div>
    </div>
  </div>
</div>

<style>
  .flex {
    height: 500px;
    display: flex;
    flex-flow: column nowrap;
  }
  .child-1 {
    height: 200px;
    flex-shrink: 0;
  }
  .child-2 {
    flex-grow: 1;
    height: 0;
    overflow: hidden;
  }
</style>
```

## 方案 2

使用 grid 布局，此种方案适用于固定行数的情况

```html
<style>
  .box {
    position: absolute;
    height: 300px;
    background-color: gray;
    display: grid;
    grid-auto-flow: column;
    grid-template-rows: repeat(3, auto);
  }

  .box > div {
    width: 80px;
    background-color: pink;
    margin: 10px;
  }
</style>
```

![demo-3](demo-3.png)

## 参考

[When flexbox items wrap in column mode, container does not grow its width](https://stackoverflow.com/questions/33891709/when-flexbox-items-wrap-in-column-mode-container-does-not-grow-its-width)
