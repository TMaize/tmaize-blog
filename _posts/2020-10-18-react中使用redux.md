---
layout: mypost
title: React中使用Redux
categories: [前端]
---

Redux 是 JavaScript 的状态容器，提供了可预测的状态管理。一般 Redux 都是搭配 React 使用，也可以在 Vue 中使用，据说 Vuex 就是根据 Redux 来的。

在复杂项目中，组件之间通信通过层层传递 props 肯定是不现实的，这时候就需要全局统一的状态管理了，同时也需要知道状态变化的过程方便调试。

为了方便追踪，redux 要求在使用中 state 是只读的，必须通过 action 去更新 state 中的数据，而更新的函数叫 reducer。为了方便追踪，reducer 必须是一个纯函数。

## 基本使用

使用起起来非常简单，通过 subscribe 订阅 store 的更新，通过 dispatch 改变 store 后调用 reducer 函数更新 store，更新完成后触发 subscribe 订阅的回调函数。

```
npm i redux -S
```

```js
const redux = require('redux')

const initialState = {
  name: 'default'
}

// 不需要直接修改state
function reducer(state = initialState, action) {
  switch (action.type) {
    case 'CHANGE_NAME':
      return { ...state, name: action.name }
    default:
      return state
  }
}

const store = redux.createStore(reducer)

console.log(store.getState())

store.subscribe(() => {
  console.log('store 发生了改变')
  console.log(store.getState())
})

store.dispatch({
  type: 'CHANGE_NAME',
  name: '张三'
})
```

对于上述代码，一般标准的封装方式如下。图方便我感觉再封装成 Class 会整洁一些

```
store/index.js          # 导出store
store/reducer.js        # 定义 initialState 和 reducer
store/actionCreators.js # 定义action
store/constants.js      # 定义actionName
```

```js
class Store {
  constructor() {
    this.initialState = {
      name: 'default'
    }
    this.store = redux.createStore(this.reducer)
  }

  subscribe = callback => this.store.subscribe(callback)
  getState = () => this.store.getState()
  dispatch = action => this.store.dispatch(action)
  reducer = (state = this.initialState, action) => {
    switch (action.type) {
      case 'CHANGE_NAME':
        return { ...state, name: action.name }
      default:
        return state
    }
  }

  changeName(name) {
    this.dispatch({
      type: 'CHANGE_NAME',
      name: name
    })
  }
}

const store = new Store()

console.log(store.getState())

store.subscribe(() => {
  console.log('store 发生了改变')
  console.log(store.getState())
})

store.changeName('张三')
```

## 针对业务进行拆分

如果在一个 reducer 函数中定义所有的 action 会显得臃肿，可以根据业务拆分为多个 reducer 函数，然后合并为一个 reducer

多模块下所有模块的 reducer 会都执行， action name 同名时就会有问题，参照 vuex 的 module 自己也可以定义命名空间,比如 `{type: 'order/CHANGE_MONEY'}`

```js
const initialState = {}
const initialOrder = { money: 100 }

function orderReducer(state = initialOrder, action) {
  switch (action.type) {
    case 'CHANGE_MONEY':
      return { ...state, money: action.value }
    default:
      return state
  }
}

function reducer(state = initialState, action) {
  return {
    order: orderReducer(state.order, action)
  }
}

const store = redux.createStore(reducer)

export { store }
```

## 在 React 中使用

在 React 中组件的更新都是通过 setState 触发组件更新。通过上面的使用，可以很容易的写出如下代码：

```
class App2 extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      count: store.getState().count
    }
    this.unsubscribe = null
  }
  componentDidMount() {
    // redux 更新后调用setState
    // 避免重复渲染，要么重写shouldComponentUpdate要么使用PureComponent
    this.unsubscribe = store.subscribe(() => this.setState({ ...this.state, count: store.getState().count }))
  }
  componentWillUnmount() {
    this.unsubscribe()
  }
  render(h) {
    return (
      <div>
        <span>APP2:</span>
        <span>{this.state.count}</span>
      </div>
    )
  }
}
```

通过上述代码不难发现，在每个组件中使用 Redux 的步骤都是一样的，每个组件都这样写会显得有些冗余，可以考虑使用高阶组件对组件进行封装。

这样写是其实有问题的，因为直接使用整个 store 的话，更新别的状态也会导致 Wrap 组件出现不必要的渲染，另外由于 PureComponent 的浅层比较，当数据定义的层次较深时会出现组件不更新的情况。 好的做法是从 store 中取出需要的属性

```js
function Wrap(C) {
  return class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        $store: store.getState()
      }
      this.unsubscribe = null
    }
    componentDidMount() {
      this.unsubscribe = store.subscribe(() => {
        return this.setState({ $store: store.getState() })
      })
    }
    componentWillUnmount() {
      this.unsubscribe()
    }
    render() {
      return <C {...this.props} {...this.state}></C>
    }
  }
}
```

```js
let WrapedApp2 = Wrap(App2)

render(h) {
  let WrapedApp2 = Wrap(App2)
  return (
    <div className="App">
      <WrapedApp2></WrapedApp2>
    </div>
  )
}
```

## react-redux

上述通过封装高阶组件的方式消除了代码冗余，但是会导致重复渲染，所以高阶组件还需要传入那些属性需要关联到 state 中。还有上面实现的 Wrap 还有一个外部依赖 store，每次 Wrap 组件时都需要导入 store，其实可以通过 Context 来实现共享。

官方则提供了 react-redux，规定了两个方法，表示哪些 state 的属性暴露出去，哪些 action 方法暴露出去，这些属性会附加到组件的 props 上

```js
function mapStateToProps(state) {
  return { ...state }
}

function mapDispatchToProps(dispatch, ownProps) {
  return { changeName: changeName }
}
```

```js
import { connect, Provider } from 'react-redux'

render(h) {
  let WrapedApp2 = connect(mapStateToProps, mapDispatchToProps)(App2)
  return (
    <Provider store={store}>
      <div className="App">
        <WrapedApp2></WrapedApp2>
      </div>
    </Provider>
  )
```

```js
class App2 extends React.PureComponent {
  change = () => {
    this.props.changeName('Hello ' + this.props.name)
  }
  render(h) {
    return (
      <div onClick={this.change}>
        <span>APP2:</span>
        <span>{this.props.name}</span>
      </div>
    )
  }
}
```

## redux 中间件

redux 有中间件的功能，可以在 dispatch 和 reducer 之间扩展代码。比如实现在每次 dispatch 时候打印出前后的值就可以通过中间件来实现

```js
function logger(store) {
  return next => {
    return action => {
      console.log('before', store.getState())
      console.log('do', action)
      let result = next(action)
      console.log('after', store.getState())
      return result
    }
  }
}
const store = redux.createStore(reducer, redux.applyMiddleware(logger))
```

**redux-thunk**

redux-thunk 是一个中间件，默认情况下的 dispatch(action) 必须传入一个对象，使用 redux-thunk 中间件后可以让 action 为一个函数。redux-thunk 会自动往这个函数上添加 dispatch, getState。一般是用来减少在组件的 componentDidMount 中去调用网络请求再提交到 redux 状态中，通过 redux-thunk 可以直接提交了

```
npm install --save redux-thunk
```

```js
import thunk from 'redux-thunk'

const store = redux.createStore(reducer, redux.applyMiddleware(thunk, logger))

function mockAjax(param) {
  return (dispatch, getState) =>
    // ajax url param
    new Promise((resolve, reject) => {
      resolve('xxx')
    }).then(data => {
      dispatch({
        type: 'CHANGE_NAME',
        name: data
      })
    })
}

function loadData() {
  store.dispatch(mockAjax({ param: 'xxx' }))
}
```

**redux-saga**

和 redux-thunk 一样，都是用来处理异步的，但是它使用了 ES6 的 generator 语法，相比较之下更优雅

**redux-devtools**

它的用法比其他的中间件有些区别，不是一个中间件，而是起到增强的作用。

需要配合 Chrome 插件 Redux DevTools。类似于 Vue DevTools 中的查看 vuex 状态的插件。React 的轮子就是复杂，除了 React Developer Tools，又装了个 Redux DevTools，注意在生产环境下禁用该插件

```js
let middlewares = redux.applyMiddleware(logger)

if (process.env.NODE_ENV === 'development' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
  middlewares = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__(middlewares)
}

const store = redux.createStore(reducer, middlewares)
```

## ImmutableJS

为了保证 state 可以被安全的追踪，在使用 react 的过程中总是强调不要直接修改 state 中的属性，而是返回一个新的对象。

对于对象，一般都是采用 es6 的`...`浅拷贝返回一个新的对象，对于数组先进行`slice(0)`。为了保证数不可变性，便捷高效的操作对象，出现了
[ImmutableJS](https://immutable-js.github.io/immutable-js/)。

常用 API 如下，其他的还有很多，包含了对集合的所有操作

```
// 深层转化为immutable对象
immutable.fromJS
immutable.toJS

// 常用数据结构，可以用于浅层转换js数据到immutable对象
List Map Set ...

// 兼容es6语法
forEach map filter ....

// 深度比较相等
is

// 获取值 getIn(['user', 'age'])
get getIn

// 是否有key
has hasIn

set setIn

delete deleteIn

size push clear includes first last delete
```

```js
let store = {
  user: {
    age: 18
  }
}
// true
console.log(immutable.Map(store).get('user') === store.user)
// false
console.log(immutable.fromJS(store).get('user') === store.user)
```

## 在 Hooks 中使用 redux

在 Redux7.1 开始，提供了 Hook 的方式，我们再也不需要编写 connect 以及对应的映射函数了

useSelector: 将 state 映射到组件中

useDispatch: 引入 dispatch 函数

注意 useSelector 的第二个参数，功能类似与 shouldComponentUpdatel 类似，是用来判断是重新渲染的，返回 true 不重新渲染

默认情况下使用的是`refEquality`比较。像`const { count } = useSelector(state => ({ count: state.count }))`这种写法每次都返回新的对象就需要自己去定义相等比较的函数

```
var refEquality = function refEquality(a, b) {
  return a === b;
};
```

![01.png](01.png)

```
function App3() {
  const age = useSelector(state => state.age)
  // 每次返回新对象refEquality比较为不等，所以修改其他属性也会导致重新渲染
  const { count } = useSelector(state => ({ count: state.count }))
  const dispatch = useDispatch()

  return (
    <div>
      <button onClick={() => dispatch({ type: 'UPDATE_COUNT', value: count + 1 })}>update count</button>
      <div>{age}</div>
      <div>{count}</div>
    </div>
  )
}
```

## 参考

[React 系列十六 - Redux(二)react-redux](https://mp.weixin.qq.com/s/ruJyG-hFEQb0FpRcotagGw)

[React 系列十八 - Redux(四)state 如何管理](https://mp.weixin.qq.com/s/hfeCDCcodBCGS5GpedxCGg)
