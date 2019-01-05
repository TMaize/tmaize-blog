---
layout: mypost
title: SpringMVC 注解 数据传递 拦截器
categories: [Java]
---

## 多样化的配置

Spring MVC 的配置非常灵活，可以多种配置混用，多个映射器可以并存，多个处理器可以并存，也可以使用注解的方式配置来简化开发

### 不做配置

不配置也可运行，因为有默认的,在`/org/springframework/web/servlet/DispatcherServlet.properties`中给定

不过还是建议做好配置

### 常见的非注解的映射器和处理器

这里列举几种常见的映射器和处理器的配置方式

+ SimpleUrlHandlerMapping

```xml
<bean class="org.springframework.web.servlet.handler.SimpleUrlHandlerMapping">
    <property name="mappings">
        <props>
            <!-- url和id -->
            <prop key="/listItem">itemController</prop>
        </props>
    </property>
</bean>

<!-- 这里的id是为了上面配置Url映射 -->
<bean id="itemController" class="controller.ItemController"></bean>
```

+ HttpRequestHandlerAdapter

我们编写的Controller的方法参数为`(HttpServletRequest arg0, HttpServletResponse arg1)`，这和Servlet的编写方式类似

这种方式比较原始，同时也比较自由，可以通过对resp设置响应的方式

```xml
<!-- 支持的Handler为HttpRequestHandler -->
<!-- 所以我们的Controller要实现HttpRequestHandler接口 -->
<bean class="org.springframework.web.servlet.mvc.HttpRequestHandlerAdapter"></bean>
```

### 注解的映射器和处理器

**注意**注解的映射器和处理器在spring3.1之前之后不同

之前为：

`org.springframework.web.servlet.mvc.annotation.DefaultAnnotationHandlerMapping`

`org.springframework.web.servlet.mvc.annotation.AnnotationMethodHandlerAdapter`

之后为：

`org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping`

`org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter`

```xml
<bean class="org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping"></bean>
<bean class="org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter"></bean>
```

如果嫌麻烦记不住类名，还要找半天，系统提供了更简便的配置方式，实际开发中也是使用下面这种注解驱动的方式

```xml
<!-- 还默认加载了很多参数绑定的方法，比如json的转换解析器 -->
<mvc:annotation-driven></mvc:annotation-driven>
```

## 注解方式开发

注解开发主要集中到Controller的开发

比较方便的是可以在一个Controller里面写多个方法对应多个url

在配置url映射时采用注解的方式在方法或者类上配置，比在配置文件中一个个写方便好多

```java
//表示这是一个Controller，不需要实现接口
@Controller
public class ItemController{

	@RequestMapping("/listItem")
	public ModelAndView listItem(HttpServletRequest req){
        ...
		//创建ModelAndView
		ModelAndView modelAndView = new ModelAndView();
		modelAndView.addObject("list", list);
		modelAndView.setViewName("/WEB-INF/jsp/itemList.jsp");
		return modelAndView;
	}
}
```

关于Handler内的方法可以定义多个，也就是多个Url映射

+ 方法内获取数据

    通过参数绑定的方法来获得数据，参数绑定在后面会讲到

+ 方法返回类型

    注意的是返回类型必须是void，String，ModelAndView三个之一

    类型为ModelAndView时，可以手动创建ModelAndView，在ModelAndView中定义视图和数据

    类型为String时，表示返回逻辑视图名比如`return "/WEB-INF/jsp/itemList.jsp"`，重定向`redirect:queryItems`,转发`forward:queryItem.action`

    类型为Void时，则比较自由，通过形参传递过来的HttpServletRequest和HttpServletResponse可以做任何操作

附加：除了ModelAndView方式外。还可以使用Map、Model和ModelMap来向前台页面传递数据,使用后面3种方式，都是在方法参数中，指定一个该类型的参数,重定向后数据会拼接在url后面

```
public String test(Map<String,Object> map,Model model,ModelMap modelMap)
```


　　使用后面3种方式，都是在方法参数中，指定一个该类型的参数

Handler开发完毕之后别忘了在配置文件中加载Handler，或者采用组件扫描的方式，自动扫描要加载的组件（Handler）

```xml
<!-- <bean class="controller.ItemController"></bean> -->
<context:component-scan base-package="controller" use-default-filters="false">
	<context:include-filter type="annotation" expression="org.springframework.stereotype.Controller"/>
</context:component-scan>
```

## 参数绑定

注解的Controller没有实现任何接口，里面的方法都是我们自己定义的，如何在Controller里面获取数据呢，SpringMVC为我们提供了一个非常简便的方法，那就是参数绑定

从客户端请求key/value数据，经过参数绑定将数据绑定到Controller方法的形参上面，然后再方法内部直接使用

### 默认支持的类型

+ HttpServletRequest

+ HttpServletResponse

+ HttpSession

+ 基本数据类型/包装类

+ JavaBean/JavaBean的关联类

+ list/map/数组

### 简单类型

支持基本类型的数据绑定，例如请求的url为`/xx/list?id=10`

只需要在参数中定义同名变量即可

```java
public void list(int id){
    System.out.println(id)//10
}
```

同时也可以自定义变量名绑定,使用@RequestParam即可，value值对应的是请求数据里面的名字，required表示这个数据是否是必须的，如果请求的时候没有这个数据会有400错误，@RequestParam也支持设置默认值，请求没有的时候会使用默认值

```java
public void list(@RequestParam(value="id",required=true) int itemId){
    System.out.println(itemId)//10
}
```

### JavaBean及关联对象

和基本类型的绑定相似，根据JAVABean的set方法和请求参数属性名中找到一样的，然后赋值

比如请求url`listItem.action?name=hello&id=10`

```java
public void listItem(Item item){
    item.toString()//Item [id=10, name=hello]
}
```

如果JavaBean有关联对象，比如Item里面有Prouduct类

```
?id=10&product.id=1&product.name=haha

public class Item {
	private int id;
	private Product product;
	//get/set...
}

public class Product {
	private int id;
	private String name;
	//get/set...
}
```

### 自定义参数绑定

参数绑定都是SpringMVC自动为我们完成的，不过有时候并不一定是我们想要的数据类型，这是就要用到自定义参数绑定。比如将字符串格式的日期转换为日期类型

首先自定义需要的Converter

```java
//原始类型-要转换的类型
public class MyDateConversion implements Converter<String, Date>{

	@Override
	public Date convert(String arg0) {
		SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd");
		try {
			return simpleDateFormat.parse(arg0);
		} catch (ParseException e) {
			System.out.println("转换失败");
		}
		return null;
	}
}
```

使用的时候只需要定义同名的参数即可，比如`listItem.action?date=1996-04-11`，在参数里面这样定义`(Date date)`

`date.toString()`输出为`Thu Apr 11 00:00:00 CST 1996`

定义好Converter后并不能使用，还需要向适配器里面注入自定义的参数绑定组件

```xml
<bean class="org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter">
	<property name="webBindingInitializer" ref="customerBindr"></property>
</bean>

<bean name="customerBindr" class="org.springframework.web.bind.support.ConfigurableWebBindingInitializer">
	<property name="conversionService" ref="conversionService"></property>
</bean>

<bean id="conversionService" class="org.springframework.format.support.FormattingConversionServiceFactoryBean">
	<property name="converters">
		<list>
			<bean class="utils.MyDateConversion"></bean>
		</list>
	</property>
</bean>
```

或者采用更简单的注解驱动配置方式

```xml
<mvc:annotation-driven conversion-service="conversionService"></mvc:annotation-driven>

<bean id="conversionService" class="org.springframework.format.support.FormattingConversionServiceFactoryBean">
	<property name="converters">
		<list>
			<!-- 这里配置多个自定义转换器 -->
			<bean class="utils.MyDateConversion"></bean>
		</list>
	</property>
</bean>
```

### 数组绑定

checkBox之类的接收时会自动转换为数组类型，定义一个同名的数组参数就可以了

```
<input type="checkbox" value="1" name="check">
<input type="checkbox" value="2" name="check">
<input type="checkbox" value="3" name="check">

public void listItem(int[] check)
```

### list/map绑定

需求：批量录入成绩

需要借助包装类，比较难以理解

```
<form action="listTest.action">
	<input type="text" value="0" name="items[0].id">
	<input type="text" value="x" name="items[0].name">
	<input type="text" value="1" name="items[1].id">
	<input type="text" value="y" name="items[1].name">
	<input type="submit" value="提交">
</form>
---
@RequestMapping("/listTest.action")
public void listItem(ItemVO items) {
	for(Item item:items.getItems()){
		System.out.println(item.toString());
	}
}
---
public class ItemVO {
	
	private List<Item> items;

	public List<Item> getItems() {
		return items;
	}

	public void setItems(List<Item> items) {
		this.items = items;
	}
}
```

## 拦截器

在SpringMVC中实现拦截器只需要实现HandlerInterceptor接口，并在配置文件中配置拦截url即可

```
public class MyHandlerInterceptor implements HandlerInterceptor{
	//进入Handler方法之前执行
	//应用场景：身份认证，身份授权
	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {
		//false拦截，true放行
		return false;
	}
	//进入Handler方法之后，返回ModelAndView之前
	//应用场景：将公用的模型数据在这里传到视图，也可以在这里统一指定视图
	@Override
	public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
			ModelAndView modelAndView) throws Exception {
		// TODO Auto-generated method stub
		
	}
	//执行Handler方法完毕之后执行这个方法
	//应用场景：统一异常处理，统一日志处理
	@Override
	public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex)
			throws Exception {
		// TODO Auto-generated method stub
	}
}
```

定义好拦截器后要在配置文件中配置它们，并定义拦截的URL规则

注意访问的URI符合拦截规则但是没有对应的Controller是不会拦截的，而是返回404

```
<mvc:interceptors>
	<!-- 可定义多个拦截器，符合规则的会按照定义的顺序执行 -->
	<mvc:interceptor>
		<!-- /**表示拦截url及其所有子路径 -->
		<mvc:mapping path="/**"/>
		<bean class="controller.GlobalInterceptor"></bean>
	</mvc:interceptor>
	<mvc:interceptor>
		<mvc:mapping path="/admin/**"/>
		<bean class="controller.LoginInterceptor"></bean>
	</mvc:interceptor>
</mvc:interceptors>
```






