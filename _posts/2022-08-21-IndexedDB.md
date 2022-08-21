---
layout: mypost
title: IndexedDB 使用
categories: [前端]
---

最近需要在客户端缓存大量数据，考虑到 localStorage 的容量问题，打算使用 indexedDB 实现，这里记录下基本使用

> 备注： IndexedDB API 是强大的，但对于简单的情况可能看起来太复杂。如果你更喜欢一个简单的 API，请尝试 localForage、dexie.js、PouchDB、idb、idb-keyval、JsStore 或者 lovefield 之类的库，这些库使 IndexedDB 对开发者来说更加友好。

## 打开数据库

1. 使用 `indexedDB.open` 打开数据库，数据库不存在时会自动创建
2. 先触发 `onupgradeneeded` 再触发 `onsuccess`
3. 打开的版本和当前的版本不一致时才会触发 `onupgradeneeded`，可以在这里根据版本和表结构做一些 migrate 操作
4. 回调函数最好不要使用箭头函数，typescript 支持不太好

   ```js
   req.onupgradeneeded = function (e) {
     const db = this.result
   }
   req.onupgradeneeded = e => {
     const db = (e.target as IDBOpenDBRequest).result
   }
   ```

示例代码

```js
const DB_NAME = 'demo'
const DB_VERSION = 1

const req = window.indexedDB.open(DB_NAME, DB_VERSION)

let db: IDBDatabase

req.onsuccess = function (e) {
  db = this.result
}

req.onupgradeneeded = function (e) {
  console.log(e.oldVersion, e.newVersion)
  const db = this.result
  //  根据版本或者当前结构创建表
  if (e.oldVersion === 0) {
    db.createObjectStore('data-map', { keyPath: 'key' })
    db.createObjectStore('logs', { autoIncrement: true })
  }
  if (!db.objectStoreNames.contains('user')) {
    db.createObjectStore('user')
  }
}
```

## 创建表

这里叫做 ObjectStore，可以类比为关系数据库中的表的概念。使用 `db.createObjectStore` 可以创建表，注意表名不能重复，否则会抛出错误。需要注意的是只能在 `onupgradeneeded` 回调中创建表，否则会报错

```
Failed to execute 'createObjectStore' on 'IDBDatabase': An object store with the specified name already exists.
Failed to execute 'createObjectStore' on 'IDBDatabase': The database is not running a version change transaction.
```

indexDB ,如其名字所言，是 KV 结构的，下面是几种定义 ObjectStore key 信息的写法

```js
db.createObjectStore('data-map', { keyPath: 'key' }) // 指定key
db.createObjectStore('logs', { autoIncrement: true }) // 自动自增key
db.createObjectStore('user') // 新增数据时主动设置key
```

## 删除表

```js
db.deleteObjectStore('name')
```

## 插入数据

插入数据需要开启一个 transaction ，事务完成后会自动关闭，所以不要复用 这个 transaction

注意：**事务操作是一个异步过程，通过监听 success 和 error 事件，了解是否成功**

```js
// 第一个参数是事务希望跨越的对象存储空间的列表
const transaction = db.transaction(['data-map'], 'readwrite')
transaction.onerror = function (e) {
  console.log('操作失败')
}
transaction.oncomplete = function (e) {
  console.log('操作成功')
}
transaction.objectStore('data-map').put({ key2: 'ming', value: { age: 18 } })
```

一些常见错误

指定了 keyPath ，但是在 keyPath 处的值不存在

```
Uncaught DOMException: Failed to execute 'put' on 'IDBObjectStore': Evaluating the object store's key path did not yield a value.
```

指定了 keyPath ，但是在 keyPath 处的值不是 string 或者 number

```
Failed to execute 'put' on 'IDBObjectStore': Evaluating the object store's key path yielded a value that is not a valid key.
```

指定了 keyPath ，但是在 put 时候仍旧传了第二个参数。需要注意的是 autoIncrement 类型的仍旧可以传第二个参数

```
Uncaught DOMException: Failed to execute 'put' on 'IDBObjectStore': The object store uses in-line keys and the key parameter was provided.
```

## 修改数据

objectStore 是 KV 结构的，直接 put 覆盖即可

## 删除数据

注意：如果 key 不存在，也会删除成功

```js
const request = db.transaction('data-map', 'readwrite').objectStore('data-map').delete('ming')
request.onerror = function (e) {
  console.log('删除失败')
}
request.onsuccess = function (e) {
  console.log('删除成功')
}
```

## 读取数据

注意：如果 key 不存在，也会读取成功，最后的结果是 undefined

```js
db.transaction('data-map', 'readwrite').objectStore('data-map').get(key).onsuccess = function (e) {
  console.log(this.result)
}
db.transaction('data-map', 'readwrite').objectStore('data-map').getAll().onsuccess = function (e) {
  console.log(this.result)
}
db.transaction('data-map', 'readwrite').objectStore('data-map').getAllKeys().onsuccess = function (e) {
  console.log(this.result)
}
```

另一种遍历方式是使用游标。游标的 value 属性会懒加载的，因此使用游标来遍历 key 性能上会有所提升。

```js
db.transaction('data-map', 'readwrite').objectStore('data-map').openCursor().onsuccess = function (e) {
  const cursor = this.result
  if (cursor) {
    console.log(cursor.key, cursor.value)
    cursor.continue()
  }
}
```

在使用 get 或者游标查询时，可以为 key 附加范围

```js
const keyRangeValue = IDBKeyRange.bound('AA', 'CC', false, true)
keyRangeValue.includes('A') // false
keyRangeValue.includes('AA') // true
keyRangeValue.includes('CC') // false
keyRangeValue.includes('CA') // true
```

## 使用索引优化查询速度

在创建表的时候，可以为指定字段设置索引，优化查询速度

```js
const store = db.createObjectStore('data-map', { keyPath: 'key' })
store.createIndex('idx_name', 'name', { unique: false })
store.createIndex('idx_uid', 'uid', { unique: true })
```

```js
const transaction = db.transaction('data-map', 'readwrite')
transaction.onerror = function (e) {
  console.log('事务操作 onerror')
}

const objectStore = transaction.objectStore('data-map')
objectStore.put({ key: 1, name: 'zs', uid: 1 })
objectStore.put({ key: 2, name: 'zs', uid: 2 })
objectStore.put({ key: 3, name: 'lis', uid: 3 }) // 如果uid重复，事务会出错
```

使用方式和使用 objectStore 查询方法一致，不过有些区别，由于索引可以设置`{ unique: false }`，因此索引的 `getAll` 是有入参的

```js
objectStore.index('idx_name').getAll('zs').onsuccess = function (e) {
  console.log(this.result)
}
```

同样的，索引也是支持游标的

```js
objectStore.index('idx_name').openCursor().onsuccess = function (e) {
  if (this.result) {
    console.log(this.result.key, this.result.value)
    this.result.continue()
  }
}
```

## 多标签页版本冲突

会存在一个页面在多个标签页打开的情况，当新打开的标签页加载了最新代码要升级数据库版本时候，会出现冲突的情况。必须要关闭所有就版本数据库

```js
// 旧标签页代码
db.onversionchange = function (e) {
  db.close() // 可以异步关闭，如果是异步，新标签页中的 onblocked 会执行
  // 重新打开或者刷新页面
}
```

```js
const req = window.indexedDB.open(DB_NAME, DB_VERSION + 1)
// 如果就数据库没有在 onversionchange 中执行 close，该回调方法会触发
req.onblocked = function (e) {
  console.log('onblocked')
}
```

## 参考

[使用 IndexedDB](https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API/Using_IndexedDB)

[IndexedDB API](https://wangdoc.com/javascript/bom/indexeddb.html)
