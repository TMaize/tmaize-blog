---
layout: mypost
title: Struts2学习-02 配置 注解 Action
categories: [Java]
---

## web.xml配置

```xml
<filter>
      <filter-name>struts2</filter-name>
      <filter-class>org.apache.struts2.dispatcher.filter.StrutsPrepareAndExecuteFilter</filter-class>
  </filter>

  <filter-mapping>
      <filter-name>struts2</filter-name>
      <url-pattern>/*</url-pattern>
  </filter-mapping>
```

注意在2.3版本之前class为`org.apache.struts2.dispatcher.filter.StrutsPrepareAndExecuteFilter`

## struts配置

```xml
<struts>
    <constant name="struts.i18n.encoding" value="UTF-8"></constant>
    <package name="testdemo" extends="struts-default" namespace="/">
        <action name="test" class="com.day01.Test">
        	<result name="ok">/test.jsp</result>
        </action>
    </package>
</struts>
```

### package标签

类似java的包，用于区分不同的action。必须先写package标签才能配置action

1. name属性和功能无关，起个名字而已。但是多个package的name值不同

2. extends属性，表示一种继承。值是固定的，即struts-default。表示里面的配置具有action的功能

3. namespace属性。url访问路径的前缀，和action的name构成访问路径。可以不写，默认值是/

### action标签

主要是配置action的访问路径

1. name属性，访问路径。可以配置多个action，但name值不同

2. class属性，action类的路径

3. method属性，配置默认执行的方法。一般action默认执行execute方法

## result标签

根据action的返回值跳到不同的页面/action。如果是页面，需要加上/，表示WebContent的根目录

1. name属性，用于对比action的返回值

2. type属性，跳转的方式，重定向/转发...，默认是转发操作

|已配置结果类型名|类名|描述|
| ------------- |:-------------:| -----:|
|dispatcher|org.apache.struts2.dispatcher.ServletDispatcherResult|默认结果类型，用来呈现JSP页面|
|chain|com.opensymphony.xwork2.ActionChainResult|将action和另外一个action链接起来|
|freemarker|org.apache.struts2.views.freemarker.FreemarkerResult|呈现Freemarker模板|
|httpheader|org.apache.struts2.dispatcher.HttpHeaderResult|返回一个已配置好的HTTP头信息响应|
|redirect|org.apache.struts2.dispatcher.ServletRedirectResult|将用户重定向到一个已配置好的URL|
|redirectAction|org.apache.struts2.dispatcher.ServletActionRedirectResult|将用户重定向到一个已定义好的action|
|stream|org.apache.struts2.dispatcher.StreamResult|将原始数据作为流传递回浏览器端，该结果类型对下载的内容和图片非常有用|
|velocity|org.apache.struts2.dispatcher.VelocityResult|呈现Velocity模板|
|xslt|org.apache.struts2.views.xslt.XSLTResult|呈现XML到浏览器，该XML可以通过XSL模板进行转换|
|plaintext |org.apache.struts2.dispatcher.PlainTextResult|返回普通文本|

### 常量配置

`<constant name="" value=""></constant>`

name的值来自/org/apache/struts2/default.properties

还有两种配置方式两种方式(1)在src下面建立struts.properties文件(2)在webxml进行配置。
不过这两种不常用

## 分模块开发的配置

为了防止多人对同一个配置文件的修改，可以在核心配置里面引入用户配置，然后每个人修改自己的配置即可。

```xml
<!-- 路径的根是src -->
<struts>
	<include file=""></include>	
</struts>
```

## Action

servlet和action的区别，servlet默认在第一次访问时创建，action每次访问都是一个新的对象

### Action的编写方式

1. 创建普通类，不继承任何类，不实现任何接口

2. 创建类，实现Action接口

3. 创建类，继承ActionSupport（一般使用这种）

第二种和第三种可以使用Action接口里面定义的接口
另外ActionSupport里面有好多定义好的方法，重写就可以用了

### 通过url访问Action的方法

1. 使用action标签的method属性

    `<action name="test" class="com.day01.Test" method="execute">`

    缺点：访问同一个action的不同方法需要配置好多的action，推荐第二种通配的方式

2. 使用通配符方式实现

    在<action>的name属性中使用*来代表任意字符,当通过url访问user_add时，会执行Action里的add方法

    ```xml
    <action name="user_*"  class="com.day01.Test" method="{1}">
        <result name="add">/add.jsp</result>
        <result name="delete">/add.jsp</result>                                    
    </action>                 
    ```
    注意在struts2.5以后为了提高安全性按照上述方式配置会有404错误，要在<action>里面加上一句
    
    `<allowed-methods>add,delete</allowed-methods>` 方法名之间用逗号隔开

    或者`<allowed-methods>regex:.*</allowed-methods>`

    或者在<package>里面全局配置`<global-allowed-methods>regex:.*</global-allowed-methods>`

    或者在Action里面采用注解 `@AllowedMethods`

3. 动态访问实现（不用）

    默认是不开启的`struts.enable.DynamicMethodInvocation = false`需要在常量中配置为true

    <action>中不用配置method，通过url:actionName!methodName.action的方式访问

## 注解配置Action

依赖于struts2-convention这个jar包

```
import javax.annotation.Resource;
import org.apache.struts2.convention.annotation.Action;
import org.apache.struts2.convention.annotation.Result;
import org.apache.struts2.convention.annotation.Results;
import com.opensymphony.xwork2.ActionSupport;
import dao.UserDao;

@Results({
	@Result(name="ok",location="/test.jsp"),  
	@Result(name="failure",location="/failure.jsp")})
@Action(value="test")
public class UserAction extends ActionSupport{
	
	private static final long serialVersionUID = 1L;
	
    //Spring注入
	@Resource(name="UserDaoImpl")
	UserDao userDao;
	
	@Override
	public String execute() throws Exception {
		userDao.sayHello();
		return "ok";
	}
}
```