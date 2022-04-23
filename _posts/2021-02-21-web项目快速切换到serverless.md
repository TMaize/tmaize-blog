---
layout: mypost
title: Web项目快速切换到Serverless
categories: [Serverless]
---

使用腾讯云的云函数也有一段时间了，非常喜欢他的部署方式和计费方式，对于一些自己写的程序跑在上面几乎不花钱。同时也总结了一套方案把原有的 web 应用快速转移到 Serverless 上面。

![scf01](scf01.png)

## 原理

HTTP 触发器把用户的请求以 JSON 格式发送到函数内，因此只需要启动一个线程把自己的 web 程序跑起来，根据 JSON 中的信息去请求本地的 http，再把结果包装起来返回就可以了

基本思路没问题，和 nginx 的原理很像，但是用户的请求到程序时经过了两次 HTTP 增加了访问时间

不过还好我找到了两种缩短函数内请求 HTTP 的时间

1. 函数内不启动 Web，通过 Mock 直接调用，这种并不是所有的语言都支持

2. Web 监听在 Unix Domain Socket 本地域上，通过 IPC 去访问

## Golang 程序

没错，go 是最适合跑在 serverless 上面的，无需上传依赖部署飞快，需要的内存小省钱！！！

得益于 Go http 的优秀的接口设计，可以通过不启动 web 服务去调用里面的方法

```go
request := httptest.NewRequest(event.Method, pathname, requestBody)
response := httptest.NewRecorder()
handler.ServeHTTP(response, request)
```

我封装了一套方法[TMaize/scf-apigw-wrap](https://github.com/TMaize/scf-apigw-wrap)直接使用就可以了，只要实现了`http.Handler`接口的框架都能使用,比如 Gin

```go
import (
	gw "github.com/TMaize/scf-apigw-wrap"
	"github.com/tencentyun/scf-go-lib/cloudfunction"
	"github.com/tencentyun/scf-go-lib/events"
)

func handler(req events.APIGatewayRequest) (events.APIGatewayResponse, error) {
	uri := strings.TrimPrefix(req.Path, conf.ApigwPrefix)
	if !strings.HasPrefix(uri, "/") {
		uri = "/" + uri
	}
	return gw.Wrap(req, uri, httpServer), nil
}
```

## Nodejs 程序

Nodejs 程序则是通过监听本地域来实现的，少了传输层 TCP/IP 协议的解析，比 http 访问要快很多

![nodejs-doc](nodejs-doc.png)

![ipc](ipc.png)

```js
function getSocketPath(socketPathSuffix) {
  if (/^win/.test(process.platform)) {
    const path = require('path')
    return path.join('\\\\?\\pipe', process.cwd(), `server-${socketPathSuffix}`)
  } else {
    return `/tmp/server-${socketPathSuffix}.sock`
  }
}
```

对于 koa 应用，通过`app.listen`貌似是不支持传入本地域路径的，好在可以通过`app.callback`获取到 requestListener，通过原生的`http.createServer(requestListener)`就可以得到一致监听在本地域的 server

对于上述过程和具体的细节腾讯有官方的实现

```js
const tencentServerlessHttp = require('tencent-serverless-http')
const koaApp = require('./src/web')

const server = tencentServerlessHttp.createServer(koaApp.callback(), null, ['application/octet-stream', 'image/*'])

exports.main_handler = async (event, context) => {
  const resp = await tencentServerlessHttp.proxy(server, event, context, 'PROMISE').promise
  return resp
}
```

## 参考

[tencent-serverless-http ](https://www.npmjs.com/package/tencent-serverless-http)

[如何将 Web 框架迁移到 Serverless](https://www.cnblogs.com/serverlesscloud/p/13279529.html)

[Node.js v14.15.5 文档](http://nodejs.cn/api/http.html#http_http_createserver_options_requestlistener)
