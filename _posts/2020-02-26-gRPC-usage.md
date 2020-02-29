---
layout: mypost
title: gRPC使用说明
categories: [Go, Java]
---

Remote Produre Call(RPC) 即远程过程调用，像调用本地方法一样调用远程方法。其实 HTTP 接口也是 RPC 的一种，如果你再封装一层的话也能实现像调用本地方法一样。作为一个 Javaer，接触的最早的 RPC 框架是 Hessian，据说 JDK 自带的也有一个 RMI 也是 RPC 框架。

## gRPC

为啥叫 gRPC，因为是 Google 主导开发的 RPC 框架，好在哪里呢

1. 使用了 http2.0

2. 通过 protobuf 来定义接口，从而可以有更加严格的接口约束条件

3. 序列化/反序列化效率很高

4. protobuf 是跨语言的

## 安装 Protobuf 编译工具

用于把 proto 文件编译其他语言的代码

下载地址：[https://github.com/protocolbuffers/protobuf/releases](https://github.com/protocolbuffers/protobuf/releases)

根据系统去选择，这里我使用的是 `protoc-3.11.4-win64.zip`，解压后添加到环境变量中即可

检测是否配置成功

```bash
protoc --version
libprotoc 3.11.4
```

**注意：**原生的 protoc 并不包含 Go 版本的插件，需要去安装 protoc-gen-go 插件。会安装到`$GOPATH/bin`，确保这个目录在环境变量中

```bash
go get -u github.com/golang/protobuf/protoc-gen-go
```

## 使用 Go 作为服务端

项目结构

```
│  article.proto
│  go.mod
│  go.sum
│
├─client
│      main.go
│
├─remote
│      article.pb.go
│
└─server
        main.go
```

### 新建 Server 端项目

```bash
go mod init grpc_server
# 国内需要GOPROXY
go get -u google.golang.org/grpc
go get -u github.com/golang/protobuf
```

### 定义 proto 文件

article.proto

```proto
syntax = "proto3";

// 定义包名
package remote;

// 可以定义多个服务，每个服务内可以定义多个接口
service Article {
    // 方法 (请求消息结构体) returns (返回消息结构体) {}
    // 请求/返回参数必须为message，不能为基础类型
    rpc SearchArticle (SearchRequest) returns (SearchResponse) {
    }
}

message SearchRequest {
    string keyword = 1;
}

message SearchResponse {
    int32 code = 1;
    repeated ArticleEntity data = 2;
}

message ArticleEntity {
    int64 id = 1;
    string title = 2;
}
```

### 使用 protoc 生成服务端代码

```bash
protoc ./article.proto --go_out=plugins=grpc:./remote
```

### 编写业务逻辑/注册服务并启动

```go
// 实现 remote.ArticleServer
type ArticleServer struct{}

func (a *ArticleServer) SearchArticle(context.Context, *remote.SearchRequest) (*remote.SearchResponse, error) {
  var data []*remote.ArticleEntity
  for i := 0; i < 10; i++ {
    data = append(data, &remote.ArticleEntity{
      Id:    int64(i),
      Title: "标题" + strconv.Itoa(i),
    })
  }
  resp := remote.SearchResponse{Code: 200, Data: data}
  return &resp, nil
}

func main() {
  listener, err := net.Listen("tcp", ": 9999")
  if err != nil {
    panic(err)
  }
  server := grpc.NewServer()
  remote.RegisterArticleServer(server, &ArticleServer{})
  reflection.Register(server)

  err = server.Serve(listener)
  if err != nil {
    panic(err)
  }
}
```

## 使用 Go 作为客户端

使用和服务端相同的 proto 文件生成代码

```bash
protoc ./article.proto --go_out=plugins=grpc:./remote
```

连接服务端并调用

```go
func main() {
  conn, err := grpc.Dial(": 9999", grpc.WithInsecure())
  if err != nil {
    panic(err)
  }
  // 实际生产中一般都有一个连接池，不会用一次关一次
  defer func() { _ = conn.Close() }()

  c := remote.NewArticleClient(conn)

  resp, err := c.SearchArticle(context.Background(), &remote.SearchRequest{})

  if err != nil {
    log.Panicln(err)
  } else {
    for _, v := range resp.Data {
      log.Println(v.Id, v.Title)
    }
  }
}
```

## 生成 Java 代码

在 proto 文件文件中增加 java 的一些选项，一般放在 package 下面一行

```
option java_multiple_files = true;
option java_package = "net.tmaize.rpc.proto.article";
option java_outer_classname = "ArticleProto";
```

生成 java 代码，除了需要`protoc`外还需要安装`protoc-gen-grpc-java`

```bash
# 生成消息类
protoc ./article.proto --java_out=./src/main/java
# 生成服务类，XXXGrpc.java文件
protoc ./article.proto --plugin=protoc-gen-grpc-java=D:/protoc-gen-grpc-java.exe --grpc-java_out=./src/main/java
```

另外也可以通过 maven 插件来生成，把你的 proto 文件放在`src/main/proto`，执行`mvn clean compile`，就会在`target/generated-sources/protobuf`下生成 Java 代码。如果使用的是 IDEA 的话这个目录会自动为你标记为 Sources，可在项目中直接引用

```xml
<build>
    <extensions>
        <extension>
            <groupId>kr.motd.maven</groupId>
            <artifactId>os-maven-plugin</artifactId>
            <version>1.6.2</version>
        </extension>
    </extensions>
    <plugins>
        <plugin>
            <groupId>org.xolstice.maven.plugins</groupId>
            <artifactId>protobuf-maven-plugin</artifactId>
            <version>0.6.1</version>
            <configuration>
                <protocArtifact>com.google.protobuf:protoc:3.11.0:exe:${os.detected.classifier}</protocArtifact>
                <pluginId>grpc-java</pluginId>
                <pluginArtifact>io.grpc:protoc-gen-grpc-java:1.27.2:exe:${os.detected.classifier}</pluginArtifact>
            </configuration>
            <executions>
                <execution>
                    <goals>
                        <goal>compile</goal>
                        <goal>compile-custom</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

## Java 作为服务端/客户端

相关依赖

```xml
<dependency>
    <groupId>io.grpc</groupId>
    <artifactId>grpc-all</artifactId>
    <version>1.27.1</version>
</dependency>
```

服务端代码

```java
Server server = ServerBuilder.forPort(9999)
        .addService(new ArticleImpl())
        .build();
server.start();
server.awaitTermination();
```

客户端代码

```java
ManagedChannel c = ManagedChannelBuilder
        .forAddress("127.0.0.1",  9999)
        .usePlaintext()
        .build();
ArticleGrpc.ArticleBlockingStub stub = ArticleGrpc.newBlockingStub(c);
SearchResponse resp = stub.searchArticle(SearchRequest.newBuilder().build());
System.out.println(resp.toString());
```

## 总结

由于是 grpc 跨语言的，只要使用同一个 proto 定义出来的服务，无论服务端可客户端是什么语言，都是可以进行互相调用的

## 参考

[Documentation](https://www.grpc.io/docs/)

[grpc/grpc-java](https://github.com/grpc/grpc-java)

[golang/protobuf](https://github.com/golang/protobuf)

[Protobuf 语法指南（proto3）](https://blog.csdn.net/qq_22660775/article/details/89163881)

[gRPC-Go 和 Java 的一次 HelloWorld](https://learnku.com/articles/36922)
