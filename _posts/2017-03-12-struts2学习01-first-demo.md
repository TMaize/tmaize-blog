---
layout: mypost
title: Struts2学习-01 First Demo
categories: [Java]
---

## 基本步骤

+ 去[Struts官网](http://struts.apache.org/)下载最新的开发包

+ Eclipse新建web项目

+ 导入jar包

```java
 /** 
    Struts2.5用到的基础开发包 
    注意不要导入暂时不需要的的jar包，否则会出现404错误
    commons-fileupload-1.3.1.jar 
    commons-io-2.2.jar 
    commons-lang-2.4.jar 
    commons-lang3-3.1.jar 
    commons-logging-1.1.3.jar 
    freemarker-2.3.19.jar 
    javassist-3.11.0.GA.jar 
    log4j-1.2.14.jar 
    ognl-3.0.6.jar 
    struts2-core-2.3.16.3.jar 
    xwork-core-2.3.16.3.jar (最新版本已经合并到struts2-core)
*/  
```


+ 配置过滤器

```xml
//web.xml文件
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://java.sun.com/xml/ns/javaee" xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd" id="WebApp_ID" version="3.0">
  <display-name>day01</display-name>
  
  <filter>
        <filter-name>struts2</filter-name>
        <filter-class>org.apache.struts2.dispatcher.filter.StrutsPrepareAndExecuteFilter</filter-class>
    </filter>

    <filter-mapping>
        <filter-name>struts2</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
    
  <welcome-file-list>
    <welcome-file>index.html</welcome-file>
    <welcome-file>index.jsp</welcome-file>
  </welcome-file-list>
</web-app>
```

+ 建立Test.java文件

```java
package com.day01;

public class Test {
	
	//会自动执行这个
	public String execute(){
		return "ok";
	}
}
```

+ 创建Struts配置文件(在src根目录)

```xml
<?xml version="1.0" encoding="UTF-8" ?>

<!DOCTYPE struts PUBLIC
        "-//Apache Software Foundation//DTD Struts Configuration 2.5//EN"
        "http://struts.apache.org/dtds/struts-2.5.dtd">
<struts>
    <package name="testdemo" extends="struts-default" namespace="/">
        <action name="test" class="com.day01.Test">
        	<result name="ok">/test.jsp</result>
        </action>
    </package>
</struts>
```

+ 创建视图test.jsp(在WebContent根目录)

```jsp
<%@ page language="java" %>
<%@ page contentType="text/html; charset=UTF-8" %>
<%@ page pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<title>Test</title>
	</head>
	<body>
	Demo测试成功
	</body>
</html>
```

+ 运行项目

如果访问地址`http://localhost:8080/项目名/test`或`http://localhost:8080/项目名/test.action`出现'Demo测试成功'则环境搭建成功

## 运行过程

+ 浏览器发送请求

+ 过滤器的匹配模式为/*所以会经过过滤器

+ 过滤器获得请求路径，得到test这个值

+ 到src下找到struts.xml

+ 解析到`<action name="test" class="com.day01.Test">`

+ 得到Action即clss路径

+ 利用反射执行Test的execute方法得到返回值

```java
Class<?> clazz = Class.forName("com.day01.Test");
Method method = clazz.getMethod("execute");
Object object = method.invoke(clazz.newInstance(), null);
```

+ 根据返回值与多个result匹配`<result name="ok">/test.jsp</result>`得到视图

+ 向用户展示jsp页面