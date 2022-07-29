---
layout: mypost
title: 主题预览
categories: [Jekyll]
extMath: true
---

# 标题

# 这里是 h1

## 这里是 h2

### 这里是 h3

#### 这里是 h4

##### 这里是 h5

###### 这里是 h6

```
# 这里是 h1
## 这里是 h2
### 这里是 h3
#### 这里是 h4
##### 这里是 h5
###### 这里是 h6
```

## 段落

段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落一段落

段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落二段落

🙊 😔 😣 😫 😙 😾 🗨️ 😶‍🌫️ 😄 🙂 😻 😈 😨 ☹️ 💣 💘 😠 🥺 💦 💀 😰 🤎 😽 😷

## 超链接

[TMaize Blog](http://blog.tmaize.net)

```
[TMaize Blog](http://blog.tmaize.net)
```

## 引用

> 这里是引用

```
> 这里是引用
```

## 常见字体样式

_斜体_

**粗体**

~~删除线~~

```
_斜体_
**粗体**
~~删除线~~
```

## 列表

- 无序列表 1-1

  缩进 2 空格

  - 缩进 2 空格
  - 缩进 2 空格

  1. 缩进 2 空格
  2. 缩进 2 空格

- 无序列表 1-2
- 无序列表 1-3

1. 有序列表 1-1

   缩进 3 空格

   1. 缩进 3 空格
   2. 缩进 3 空格

   - 无序列表
   - 无序列表

2. 有序列表 1-2
3. 有序列表 1-3

```
- 无序列表 1-1

  缩进 2 空格

  - 缩进 2 空格
  - 缩进 2 空格

- 无序列表 1-2
- 无序列表 1-3

1. 有序列表 1-1

   缩进 3 空格

   1. 缩进 3 空格
   2. 缩进 3 空格

2. 有序列表 1-2
3. 有序列表 1-3
```

## 分割线

---

```
---
```

## 图片

破事水![line](emoji_01.png)
滑稽![line](emoji_02.png)

```md
![line](http://xx.com/xx.jpg)
```

块级别图片

```md
![测试图片](001.jpg)
```

![测试图片](001.jpg)

## 代码行

这是一段文字`rm -rf /*`这是一段文字

```
这是一段文字`rm -rf /*`这是一段文字
```

## 代码块

```javascript
blog.encodeHtml = function (html) {
  var o = document.createElement('div')
  o.innerText = html
  var temp = o.innerHTML
  o = null
  return temp
}
```

````
```javascript
blog.encodeHtml = function(html) {
var o = document.createElement('div')
o.innerText = html
var temp = o.innerHTML
o = null
return temp
}
```
````

## 表格测试

| Tables        |      Are      |   Cool |
| ------------- | :-----------: | -----: |
| col 3 is      | right-aligned | \$1600 |
| col 2 is      |   centered    |   \$12 |
| zebra stripes |   are neat    |    \$1 |

```md
| Tables        |      Are      |   Cool |
| ------------- | :-----------: | -----: |
| col 3 is      | right-aligned | \$1600 |
| col 2 is      |   centered    |   \$12 |
| zebra stripes |   are neat    |    \$1 |
```

## 数学公式

需要在配置中设置`extMath: true`开启

```
# 行内
\( \int_0^\infty \frac{x^3}{e^x-1}\,dx = \frac{\pi^4}{15} \)
$ \int_0^\infty \frac{x^3}{e^x-1}\,dx = \frac{\pi^4}{15} $

# 段落
\[ \int_0^\infty \frac{x^3}{e^x-1}\,dx = \frac{\pi^4}{15} \]
$$ \int_0^\infty \frac{x^3}{e^x-1}\,dx = \frac{\pi^4}{15} $$
```

Lorem ipsum dolor sit `\( \int_0^\infty \frac{x^3}{e^x-1}\,dx = \frac{\pi^4}{15} \)` amet consectetur adipisicing elit.

Lorem ipsum dolor sit `$ \int_0^\infty \frac{x^3}{e^x-1}\,dx = \frac{\pi^4}{15} $` amet consectetur adipisicing elit.

Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad aut assumenda distinctio eveniet quos, saepe non quasi minus facere iste odit! Accusamus eos optio, a recusandae neque aliquam provident illum?

`\[ \int_0^\infty \frac{x^3}{e^x-1}\,dx = \frac{\pi^4}{15} \]`

Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad aut assumenda distinctio eveniet quos, saepe non quasi minus facere iste odit! Accusamus eos optio, a recusandae neque aliquam provident illum?

`$$ \int_0^\infty \frac{x^3}{e^x-1}\,dx = \frac{\pi^4}{15} $$`

Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad aut assumenda distinctio eveniet quos, saepe non quasi minus facere iste odit! Accusamus eos optio, a recusandae neque aliquam provident illum?

## 插入 html

<div id="htmldemo"></div>
<style>
#htmldemo{
    height: 30px;
    width: 30px;
    background-color: #00aa9a;
    animation-name: moveX;
    animation-duration: 1s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    animation-fill-mode : both;
}
@keyframes moveX {
    0%{
        transform: translateX(0px);
    }
    100%{
        transform: translateX(100px);
    }
}
</style>

```html
<div id="htmldemo"></div>
<style>
  #htmldemo {
    height: 30px;
    width: 30px;
    background-color: #00aa9a;
    animation-name: moveX;
    animation-duration: 1s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    animation-fill-mode: both;
  }
  @keyframes moveX {
    0% {
      transform: translateX(0px);
    }
    100% {
      transform: translateX(100px);
    }
  }
</style>
```

## 插入 iframe

<iframe src="//music.163.com/outchain/player?type=2&id=28445796&auto=0&height=66" frameborder="0" width="100%" height="86px" ></iframe>
<iframe src="//music.163.com/outchain/player?type=0&id=382716015&auto=0&height=430" frameborder="0" width="100%" height="430px"></iframe>

```html
<!-- 属性什么的不要错了，最好用双引号括住 -->
<!-- 网易云的iframe需要做些调整，调整如下 -->
<iframe src="//music.163.com/outchain/player?type=2&id=28445796&auto=0&height=66" frameborder="0" width="100%" height="86px"></iframe>
<iframe src="//music.163.com/outchain/player?type=0&id=382716015&auto=0&height=430" frameborder="0" width="100%" height="430px"></iframe>
```
