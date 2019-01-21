---
layout: mypost
title: NanoHttpd实现静态服务器
categories: [Java]
---

最近在写Site Generator的时候需要内嵌一个静态服务器，自己再写个Socket Server又太麻烦了

找到了两个方案

1. Jetty，一个jar实现了Servlet容器的所有功能

2. [NanoHTTPD](https://github.com/NanoHttpd/nanohttpd)，一个java文件实现了一个简单的http服务的请求和响应，需要自己处理逻辑

Jetty大小适中，而且也够成熟,相比之下NanoHTTPD是非常轻量的，考虑到速度和体积还是使用了NanoHTTPD

注意github上的NanoHTTPD文件比较多，其实只需要一个NanoHTTPD.java（放到项目里面时不要修改包结构，可能会无法运行）即可

## 代码

自定义mimetypes，其实使用默认的就可以了，这里不做改变

```
META-INF/default-mimetypes.properties
se META-INF/mimetypes.properties for user defined mimetypes
```

启动服务器

```java
MyHttpServer myHttpServer = new MyHttpServer(port, webRoot);
myHttpServer.start(4000, false);
//System.out.println("按下回车键/关闭窗口停止服务");
//System.in.read();

//if (myHttpServer != null) {
//    myHttpServer.stop();
//}
```

主要逻辑，继承NanoHTTPD，重写serve方法就可以了

```java
public class MyHttpServer extends NanoHTTPD {

    private File webRoot;

    public MyHttpServer(int port, File webRoot) throws Exception {
        super(port);
        if (webRoot == null) {
            throw new Exception("网站路径：null");
        }
        if (webRoot.exists() && webRoot.isDirectory()) {
            this.webRoot = webRoot;
        } else {
            throw new Exception("网站路径不存在：" + webRoot.getAbsolutePath());
        }
    }

    @Override
    public Response serve(String uri, Method method, java.util.Map<String, String> headers, java.util.Map<String, String> parms, java.util.Map<String, String> files) {

        File file = new File(webRoot, uri);
        if (file.exists()) {
            if (file.isFile()) {
                return render200(uri, file);
            } else {
                if (uri.endsWith("/")) {
                    File indexFile = new File(file, "index.html");
                    if (indexFile.exists()) {
                        return render200(uri + "index.html", indexFile);
                    } else {
                        return render404();
                    }
                } else {
                    return render301(uri + "/");
                }
            }
        } else {
            return render404();
        }
    }

    private Response render404() {
        File file = new File(webRoot, "404.html");
        if (file.exists()) {
            try {
                return NanoHTTPD.newFixedLengthResponse(NanoHTTPD.Response.Status.NOT_FOUND, NanoHTTPD.MIME_HTML, new FileInputStream(file), file.length());
            } catch (FileNotFoundException e) {
                return render500(e.getMessage());
            }
        } else {
            return NanoHTTPD.newFixedLengthResponse(NanoHTTPD.Response.Status.NOT_FOUND, NanoHTTPD.MIME_HTML, null);
        }
    }

    private Response render500(String text) {
        return NanoHTTPD.newFixedLengthResponse(NanoHTTPD.Response.Status.INTERNAL_ERROR, NanoHTTPD.MIME_PLAINTEXT, text);
    }

    private Response render200(String uri, File file) {
        try {
            return NanoHTTPD.newFixedLengthResponse(NanoHTTPD.Response.Status.OK, NanoHTTPD.getMimeTypeForFile(uri), new FileInputStream(file), file.length());
        } catch (FileNotFoundException e) {
            return render500(e.getMessage());
        }
    }

    private Response render301(String next) {
        Response res = newFixedLengthResponse(Response.Status.REDIRECT, NanoHTTPD.MIME_HTML, null);
        res.addHeader("Location", next);
        return res;
    }

}
```