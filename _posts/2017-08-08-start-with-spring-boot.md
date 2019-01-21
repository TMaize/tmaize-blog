---
layout: mypost
title: Start With Spring Boot
categories: [Java]
---

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
```

Spring Boot是由Pivotal团队提供的全新框架，其设计目的是用来简化新Spring应用的初始搭建以及开发过程。

个人理解Spring Boot相较于框架的概念来言，它更像一套规范。

她提供了一套规范，按照这个规范开发能够让我们少些好多代码。项目仍然是Spring项目，只是它们正好用到了Spring Boot的起步依赖和自动配置而已。并不用学习新的技术，那些你早已熟悉的从头创建Spring项目的技术或工具，都能用于Spring Boot项目。

## 起步配置

Spring推荐使用Maven和Gradle构建项目，这里是以Maven为例

Spring Boot的依赖配置很简单，因为Spring为你提供了起步依赖,需要不同的功能加入不同的起步依赖即可。

Spring Boot起步依赖基本都以spring-boot-starter打头，随后是直接代表其功能的名字，比如web、 test等。比如想要使用freemarker来渲染视图只需要加入spring-boot-starter-freemarker依赖即可

下面是Spring Boot最基本的一个依赖，提供了web开发最简单的脚手架。里面包含了spring-boot-starter、spring-boot-starter-tomcat、spring-boot-web、spring-webmvc等依赖，但是这些细节并不需要关注

```xml
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-web</artifactId>
	<version>1.5.6.RELEASE</version>
</dependency>
```

如果想要更简单可以加上父工程,它统一指定了版本，在依赖中及不需要指定了，会统一使用父工程的版本，使得jar包不会出现冲突

同时父工程也提供了合适的默认设置，**在后面的打包步骤提供了很大的便捷**

1. 默认编译级别为Java 1.6
2. 源码编码为UTF-8
3. 一个依赖管理节点，允许你省略普通依赖的 <version>标签，继承自spring-boot-dependenciesPOM
4. 合适的资源过滤
5. 合适的插件配置（exec插件，surefire，Git commitID，shade）
6. 针对 application.properties和application.yml 的资源过滤

```
<parent>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-parent</artifactId>
	<version>1.5.6.RELEASE</version>
</parent>
```

## 简单的Controller编写

Spring Boot大量使用使用注解，因为使用注解能够极大的简化开发

下面是一个简单的Controller，可以看出和SpringMVC并没有区别，顺便使用了参数绑定

```java
//等价于@Controller，@ResponseBody
@RestController
public class HelloController {

	@RequestMapping("/")
	public String home(HttpServletRequest req) {
		String str = req.getRequestURL().toString();
		str+="\n\nHello World";
		return str;
	}
}
```

下面是一个返回视图的Controller，这里使用的渲染引擎是freemarker，只要把模版文件放到指定的目录即可，找到page.ftl文件然后反馈到页面

```
@Controller
public class PageController {
	
	@RequestMapping("/page")
	public String hello(Model model) {
		model.addAttribute("name", "hello");
		return "page";
	}
}

<html>
<head>
    <title>hello</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
</head>
<body>
${name}
</body>
</html> 
```

下面是一个符合RESTful规范的Controller

```
@RestController
@RequestMapping("/api/user")
public class UserApi {
	
	@Autowired
	private UserDao userDao;
	
	//GET列出所有
	@GetMapping({"","/"})
	public List<User> listAll() {
		return userDao.findAll();
	}
	
	//GET查询一个
	@GetMapping("/id/{id}")
	public User findById(@PathVariable("id") Integer id) {
		return userDao.findOne(id);
	}

	//PUT添加一个User
	@PutMapping("/{name}/{score}")
	public User add(@PathVariable("name") String name,@PathVariable("score") Integer score) {
		User user = new User();
		user.setName(name);
		user.setScore(score);
		return userDao.save(user);
	}
	
	//POST更新一个User
	@PostMapping("/{id}/{name}/{score}")
	public User update(@PathVariable("id") Integer id,@PathVariable("name") String name,@PathVariable("score") Integer score) {
		User user = new User();
		user.setId(id);
		user.setName(name);
		user.setScore(score);
		return userDao.save(user);
	}
	//DELETE更新一个User
	@DeleteMapping("/id/{id}")
	public void delete(@PathVariable("id") Integer id){
		userDao.delete(id);
	}

}
```

综上，你会发现这不就是SpringMVC(Spring Boot 依赖里面包含了springmvc)吗？这是一个挺好的事情，因为并没有改变我们的代码编写习惯。

这这说明Controller并不是springboot的核心

## 视图渲染

Spring钦定了Thymeleaf

除了Thymeleaf，Spring Boot还支持Freemarker、 Velocity和基于Groovy的模板。无论选择哪种模板，你要做的就是添加合适的起步依赖，在Classpath根部的templates/目录里编写模板。自动配置会处理剩下的事情

比如

```xml
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-freemarker</artifactId>
	<version>1.5.6.RELEASE</version>
</dependency>
```

待续.....
