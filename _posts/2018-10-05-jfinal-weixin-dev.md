---
layout: mypost
title: jfinal-weixin 极速开发
categories: [Java]
---

使用最原始的方式做公众号开发是效率很低的。http 请求，报文解析转换，access_token 的维护等都要自已写一遍

好在有 jfinal-weixin 的存在，大大的简化了开发，jfinal-weixin 是 jfinal 的一个插件，不过貌似也可以集成的其他的框架里

jfinal 就不说了，很好用的一个框架，下面主要是 jfinal-weixin 的使用

项目最小依赖

- fastjson-1.2.31.jar

- jfinal-3.4-bin-with-src

- jfinal-weixin-2.1.jar

## AppConfig

web.xml 的配置,指定 AppConfig 的位置

```
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://xmlns.jcp.org/xml/ns/javaee" xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_3_1.xsd" id="WebApp_ID" version="3.1">
    <display-name>wx</display-name>
    <welcome-file-list>
        <welcome-file>index.html</welcome-file>
        <welcome-file>index.jsp</welcome-file>
    </welcome-file-list>
    <filter>
        <filter-name>jfinal</filter-name>
        <filter-class>com.jfinal.core.JFinalFilter</filter-class>
        <init-param>
            <param-name>configClass</param-name>
            <param-value>net.tmaize.wx.AppConfig</param-value>
        </init-param>
    </filter>
    <filter-mapping>
        <filter-name>jfinal</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
</web-app>
```

config.txt

```
token = **********
appId = **********
appSecret = **********

# 开发
onlineWebRoot = /usr/local/tomcat-7.0.90/webapps/wx
onlineTokenUrl = http://wx.tmaize.net/api/wx/api/getToken
```

AppConfig.java

```
public class AppConfig extends JFinalConfig {

    @Override
    public void configConstant(Constants me) {
        PropKit.use("config.txt");
        me.setViewType(ViewType.JFINAL_TEMPLATE);
        boolean isOnline = isOnlineEnv();
        // 打印请求信息
        me.setDevMode(isOnline);
        // 打印微信API请求交互的 xml与json数据
        ApiConfigKit.setDevMode(isOnline);
    }

    @Override
    public void configRoute(Routes me) {
        me.add("/", IndexController.class);
        // 微信收发消息及服务器验证地址
        me.add("/api/wx/msg", WeixinMsgController.class);
        me.add("/api/wx/api", WeixinApiController.class);
    }

    @Override
    public void afterJFinalStart() {
        super.afterJFinalStart();

        ApiConfig ac = new ApiConfig();
        // 配置微信 API 相关参数
        ac.setToken(PropKit.get("token"));
        ac.setAppId(PropKit.get("appId"));
        ac.setAppSecret(PropKit.get("appSecret"));
        // 明文模式，密文要setEncodingAesKey
        ac.setEncryptMessage(PropKit.getBoolean("encryptMessage", false));
        // 多个公众号时，重复调用ApiConfigKit.putApiConfig(ac)依次添加即可，第一个添加的是默认
        ApiConfigKit.putApiConfig(ac);

        // 开发时使用线上AccessToken
        if (!isOnlineEnv()) {
            LocalTestTokenCache localTestTokenCache = new LocalTestTokenCache(PropKit.get("onlineTokenUrl"));
            ApiConfigKit.setAccessTokenCache(localTestTokenCache);
        }
    }

    /**
     * 环境判断
     * @return
     */
    public boolean isOnlineEnv() {
        return PropKit.get("onlineWebRoot").equals(PathKit.getWebRootPath());
    }
}
```

## 获取 access_token

获取 access_token 就是调用一个接口那简单，上面配置了一个 URL 供开发环境获取线上的 access_token，看下里面是怎么获取的就知道了

WeixinApiController.java

```
package net.tmaize.wx.controller;

import com.jfinal.weixin.sdk.api.AccessToken;
import com.jfinal.weixin.sdk.api.AccessTokenApi;
import com.jfinal.weixin.sdk.jfinal.ApiController;

public class WeixinApiController extends ApiController {

    /**
     * 为开发环境提供AccessToken
     */
    public void getToken() {
        // 一行代码搞定
        AccessToken accessToken = AccessTokenApi.getAccessToken();
        renderJson(accessToken.getJson());
    }
}
```

## 服务器验证及收发消息

只需要继承 MsgControllerAdapter 就行了，该地址就具备了服务器验证的能力和收发信息的能力

当然了发信息的逻辑要自己实现

```
/**
 * 处理接收到的文本消息
 * @param inTextMsg 处理接收到的文本消息
 */
@Override
protected void processInTextMsg(InTextMsg inTextMsg) {
    OutTextMsg outMsg = new OutTextMsg(inTextMsg);
    switch (inTextMsg.getContent()) {
    case "个人信息":
        // 未认证订阅号，没有这个权限
        ApiResult userInfo = UserApi.getUserInfo(inTextMsg.getFromUserName());
        outMsg.setContent(userInfo.getJson());
        break;
    case "token":
        outMsg.setContent(AccessTokenApi.getAccessTokenStr());
        break;
    default:
        outMsg.setContent(inTextMsg.getContent());
        break;
    }
    render(outMsg);
}
```

## 调试

有时候需要本地调用微信接口来调试，但是又不想启动整个 web 项目，也是有办法的

```
/**
 * 测试微信API
 * @author tmaize
 *
 */
public class WXTest {
    public static void init() {
        PropKit.use("config.txt");
        ApiConfig ac = new ApiConfig();
        ac.setToken(PropKit.get("token"));
        ac.setAppId(PropKit.get("appId"));
        ac.setAppSecret(PropKit.get("appSecret"));
        ac.setEncryptMessage(PropKit.getBoolean("encryptMessage", false));
        ApiConfigKit.putApiConfig(ac);
        if (!PropKit.get("onlineWebRoot").equals(PathKit.getWebRootPath())) {
            LocalTestTokenCache localTestTokenCache = new LocalTestTokenCache(PropKit.get("onlineTokenUrl"));
            ApiConfigKit.setAccessTokenCache(localTestTokenCache);
        }
    }

    public static void main(String[] args) throws Exception {
        init();
        System.out.println(AccessTokenApi.getAccessToken().getJson());
    }
}

```

## 参考

[jfinal 官方文档](http://www.jfinal.com/doc)

[jfinal-weixin wiki](https://gitee.com/jfinal/jfinal-weixin/wikis/Home)
