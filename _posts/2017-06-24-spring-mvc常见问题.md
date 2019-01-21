---
layout: mypost
title: SpringMVC 常见问题
categories: [Java]
---

## DispatcherServlet的影响

serlvet的匹配规则：

1. 路径精确匹配

2. 最长路径匹配

3. 扩展匹配

4. 如果容器定义了一个default servelt（即匹配路径为"/"的servlet），则会将请求交给default servlet

在web.xml为DispatcherServlet配置url-pattern时

如果配置为`/`时候,表示未默认servelt，只有当请求没有对应的servlet处理时，才交给它处理，当我们请求jsp时，刚好有从`%TOMCAT_HOME%/conf/web.xml`中继承过来的JspServlet会处理对jsp请求的处理，所以会优先访问到jsp页面

配置为`/*`，照servlet的匹配规则，则路径匹配会优先于扩展匹,会把所有的请求交给spring,导致对jsp的请求会被拦截掉

当采用`/*`的规则时，所有的请求都给Spring，访问1.jsp不会到1.jsp文件而是到controller，由于getRequestDispatcher再forward也是一次匹配过程，由于是`/*`，这个匹配过程也是交给spring然后再来到controller，进而报错（使用传统的getRequestDispatcher会陷入死循环耗尽资源，使用spring返回视图名者则会提示错误）

由此可见getRequestDispatcher并不是带上数据到文件，而是再次匹配，然后匹配到文件，中间有一个再次匹配的过程，匹配取决于你的url-pattern

```
//p:prefix="/" p:suffix=".jsp"
@RequestMapping("/1.jsp")
public String test1() {
    return "1";//=>1.jsp
}
```

## 解决@ResponseBody乱码

```
<mvc:annotation-driven>
    <mvc:message-converters register-defaults="true">
        <bean class="org.springframework.http.converter.StringHttpMessageConverter">
            <constructor-arg value="UTF-8" />
            <property name="writeAcceptCharset" value="false" />
        </bean>
    </mvc:message-converters>
</mvc:annotation-driven>
```

## POST请求乱码

post提交表单乱码，在web.xml添加如下配置

```
<!-- 中文乱码过滤器 -->
<filter>
    <filter-name>characterEncoding</filter-name>
    <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
    <init-param>
        <param-name>encoding</param-name>
        <param-value>UTF-8</param-value>
    </init-param>
</filter>

<filter-mapping>
    <filter-name>characterEncoding</filter-name>
    <url-pattern>/*</url-pattern>
</filter-mapping>
```


## 解决静态资源404

由于在web.xml中做了如下配置,表示对所有请求进行拦截

```
<servlet-mapping>
    <servlet-name>DispatcherServlet</servlet-name>
    <url-pattern>/</url-pattern>
</servlet-mapping>
```

可以使用静态资源过滤器来解决

```
<!-- 过滤静态资源文件 -->
<mvc:resources location="/static/" mapping="/static/**" />
```

## 静态资源过滤导致Controller扫包失效

有时候配置了静态资源过滤器后，所有的Controller都404了

```
把
<context:annotation-config></context:annotation-config>
换成
<mvc:annotation-driven></mvc:annotation-driven>
即可
```

## component-scan位置不当404

一开始Spring和SpringMVC的配置都是一个文件，一点问题没有

后来把一个文件拆分成两个文件，分别是applicationContext.xml和spring-mvc.xml，为的是结构清晰，结果导致所有的controller 404

web.xml配置如下

```
<!-- 配置Spring容器 -->
<context-param>
    <param-name>contextConfigLocation</param-name>
    <param-value>classpath:config/applicationContext.xml</param-value>
</context-param>
<listener>
    <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
</listener>

<!-- 配置SpringMVC -->
<servlet>
    <servlet-name>springmvc</servlet-name>
    <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
    <init-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>classpath:config/spring-mvc.xml</param-value>
    </init-param>
</servlet>

<servlet-mapping>
    <servlet-name>springmvc</servlet-name>
    <url-pattern>/</url-pattern>
</servlet-mapping>
```

 原因就是Spring是父容器，Spring MVC是子容器，子容器可以访问父容器的bean，父容器不能访问子容器的bean，而MVC容器默认查找当前容器的Controller，所以界面出现404。

有两种解决方式

1. 还是使用以前的单文件配置，所有的spring配置在一个文件里,web.xml只需要如下配置即可

    ```
    <servlet>
        <servlet-name>DispatcherServlet</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <!-- 里面有spring和springMVC的配置 -->
            <param-value>classpath:spring-mvc.xml</param-value>
        </init-param>
    </servlet>
    ```

2. 分开扫描，springmvc只负责扫描controller

    applicationContext.xml文件

    ```
    <!-- 扫包，不用net.tmaize.crm.* -->
    <context:component-scan base-package="net.tmaize.crm">
        <context:exclude-filter type="annotation" expression="org.springframework.stereotype.Controller" />
    </context:component-scan>
    ```

    spring-mvc.xml文件

    ```
    <!-- 自动扫包 ,Controller -->
    <context:component-scan base-package="net.tmaize.crm.controller" use-default-filters="false">
        <context:include-filter type="annotation" expression="org.springframework.stereotype.Controller" />
    </context:component-scan>
    ```

## 拦截器失效

为了测试拦截器是否生效，在拦截器里面写了一个输出语句

访问/admin/xx老是不打印那条语句

debug之后才知道拦截器是用来拦截Controller的，我的AdminController并没有一个方法匹配/admin/xx，所以是不会拦截的，即使你的拦截路径是`/admin/**`


