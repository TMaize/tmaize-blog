---
layout: mypost
title: Vue指令实现OutClick
categories: [前端]
---

在一般业务中监听的最多的就是 Click 事件，但是在一些业务比如 Alert 和 Pop 效果时，需要监听在元素外部的点击来关闭弹窗。

## 原始实现

下面是两种常见的模态框的实现方式

方案一：默认 click 都是放在冒泡阶段，只要在内容区域上添加 click 的阻止冒泡即可

```html
<div class="cover" @click="close">
  <!-- 阻止冒泡 -->
  <div class="content" @click.stop>modal content</div>
</div>
```

方案二：通过代码判断点击触发的 DOM 是否在内容区域内

```html
<div class="cover" @click="handleClick">
  <div class="content" ref="content">modal content</div>
</div>
```

```js
handleClick (e) {
  let clickOut = true
  let temp = e.target
  do {
    if (temp === this.$refs.content) {
      clickOut = false
      break
    }
    temp = temp.parentElement
  } while (temp !== document.documentElement)
  console.log(clickOut)
}
```

## 指令实现

上面的代码可以解决全屏的模态框点击外部区域关闭。但是还有一种 Pop 的弹出，这种弹出的外部区域不在本组件内，想要实现这种弹出的点击外部区域关闭用上面的方式二也是可以的，只需把 mounted 阶段把 handleClick 事件添加到 body，在 beforeDestroy 上解绑 body 上的点击时间就就可以了。

如果多个组件需要实现这点击外部区域关闭的效果，可以通过 Vue 的指令来进行封装

实现弹窗

```html
<div class="cover">
  <div class="content" v-out-click="close">modal content</div>
</div>
```

实现弹出

```html
<button @click="popIsShow = true">显示气泡</button>
<div class="pop" v-if="popIsShow" v-out-click="closePop">I'm pop text</div>
```

指令代码的具体内容如下。有一点比较难受的是指令里面没有地方能存放变量，只好把把这些变量放到了 DOM 上了。还有就是在使用的时候要加上`v-`的前缀，指令的名字不用带上`v-`

```js
import outClick from './directive/out-click.js'
Vue.directive(outClick.name, outClick)
```

```js
const KEY_OUT = '_out_click'
const KEY_OUT_EVENT = '_out_click_event'
const KEY_IN = '_in_click'
const KEY_FLAG = '_in_out_flag'

function removeEvent(el, binding, vnode) {
  el.removeEventListener('click', el[KEY_IN], false)
  window.removeEventListener('click', el[KEY_OUT], false)
  delete el[KEY_IN]
  delete el[KEY_OUT]
  delete el[KEY_OUT_EVENT]
  delete el[KEY_FLAG]
}

function initEvent(el, binding, vnode) {
  // setTimeout 0: 忽略点击外部的按钮初始化该组件时，触发的origin click
  setTimeout(() => {
    el[KEY_OUT] = () => outClick(el)
    el[KEY_IN] = () => inClick(el)
    el[KEY_OUT_EVENT] = binding.value
    el.addEventListener('click', el[KEY_IN], false)
    window.addEventListener('click', el[KEY_OUT], false)
  }, 0)
}

function inClick(el) {
  // 通过事件捕获的顺序作为标志位
  // 最好不要使用阻止冒泡来实现，那样会影响其他的click无法触发
  el[KEY_FLAG] = '1'
}

function outClick(el) {
  if (!el[KEY_FLAG] && el[KEY_OUT_EVENT]) {
    el[KEY_OUT_EVENT]()
  }
  delete el[KEY_FLAG]
}

export default {
  name: 'out-click',
  update: (el, binding, vnode) => {
    if (binding.value === binding.oldValue) {
      return
    }
    removeEvent(el, binding, vnode)
    initEvent(el, binding, vnode)
  },
  bind: initEvent,
  unbind: removeEvent
}
```
