---
layout: mypost
title: SpringBoot笔记
categories: [Java]
---

Spring 推荐使用 Maven 和 Gradle 构建项目，这里是以 Maven 为例。推荐使用[官方的工具](https://start.spring.io/)生成项目模板。另外注意的是项目结构不再是 webapp 了，但是它仍然是可以打包为 war 文件的

## 引导类

SpringBoot 的启动方法，默认情况下，引导类的同级和子级的 java 文件上的注解会被自动扫描

```java
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

如果打包为 war 包，引导类需要继承 SpringBootServletInitializer 重写 configure 方法

```java
@SpringBootApplication
public class DemoApplication extends SpringBootServletInitializer {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

## 父项目

注意在打为 war 包时，请在版本至少 8.0 以上的 tomcat 中运行，因为 SpringBoot 需要通过 SPI 机制来注册 servlet 或者 filtes 等，因此至少要支持 Servlet3.0 以上的 tomcat 才可以。

因此在打为 war 包的时候需要继承 SpringBootServletInitializer 来进行初始化

打包的产物有

```
xxx.jar // fatjar
xxx.jar.original // 不包含任何jar
xxx.war // 包含所有的jar，exclude会放到WEB-INF/lib-provided，这样的做好处是既能够通过java -jar xxx.war运行，又能部署到tomcat
xxx.war.original // 不含exclude的jar，只能部署到tomcat中
```

注意：以 war 包形式部署到 tomcat 后，application.yml 里面 server 的配置都不会生效的，context-path 为 war 包的文件名

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <packaging>${packaging.type}</packaging>


    <groupId>com.demo</groupId>
    <artifactId>sb</artifactId>
    <version>1</version>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.3.0.RELEASE</version>
        <relativePath/>
    </parent>

    <properties>
        <packaging.type>jar</packaging.type>
    </properties>

    <profiles>
        <profile>
            <id>war</id>
            <properties>
                <packaging.type>war</packaging.type>
            </properties>
            <dependencies>
                <dependency>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>spring-boot-starter-tomcat</artifactId>
                    <scope>provided</scope>
                </dependency>
            </dependencies>
        </profile>
    </profiles>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

```java
package com.demo.sb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

// 打war包支持，需要继承SpringBootServletInitializer类，重新configure方法
@SpringBootApplication
public class DemoApplication extends SpringBootServletInitializer {


    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }


    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        return builder.sources(DemoApplication.class);
    }

}
```

## 不继承父项目

有时候项目会有统一的父项目，无法去继承 SpringBoot 的父项目时。[官方](https://docs.spring.io/spring-boot/docs/2.1.3.RELEASE/reference/htmlsingle/#using-boot-maven-without-a-parent)推荐在内部导入版本控制，然后再打包时完善下打包插件即可

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <packaging>jar</packaging>

    <groupId>com.demo</groupId>
    <artifactId>sb</artifactId>
    <version>1</version>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>2.3.0.RELEASE</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>


    <properties>
        <java.version>1.8</java.version>
        <maven.compiler.source>${java.version}</maven.compiler.source>
        <maven.compiler.target>${java.version}</maven.compiler.target>
        <maven.compiler.encoding>UTF-8</maven.compiler.encoding>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <mainClass>com.demo.sb.DemoApplication</mainClass>
                </configuration>
                <executions>
                    <execution>
                        <id>repackage</id>
                        <goals>
                            <goal>repackage</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

## 配置文件

全量的配置文件见 spring-boot-autoconfigure-2.3.0.RELEASE.jar 下面的`META-INF/spring-configuration-metadata.json`

从父项目来看会顺序加载如下的配置文件，越往后优先级越高来覆盖前面的值，推荐使用 yaml 格式

```xml
<includes>
  <include>**/application*.yml</include>
  <include>**/application*.yaml</include>
  <include>**/application*.properties</include>
</includes>
```

另外还支持启动时传入配置，这个优先级是最高的

```
java -Dserver.port=80 -jar sb-1.jar
java -jar xx.jar --server.port=80
```

读取配置文件

获取单个值

```java
@Value("${server.port}")
private Integer port;
```

获取多个值,定义 Bean,通过 prefix 获取 prefix 后面的值

```java
@Component
@ConfigurationProperties(prefix = "server")
public class AppConfig extends HashMap<String, Object> {
}
```

## 使用 JdbcTemplate

添加配置文件

```yaml
spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/test?useUnicode=true&serverTimezone=GMT%2B8&characterEncoding=UTF8
    driver-class-name: com.mysql.cj.jdbc.Driver
    password: 123456789
    username: root
```

添加依赖

```xml
<dependency>
  <groupId>mysql</groupId>
  <artifactId>mysql-connector-java</artifactId>
</dependency>
```

然后就可以直接在 Service 或者 Controller 中注入 JdbcTemplate，默认使用的连接池是 HikariPool

```java
@Autowired
private JdbcTemplate jdbcTemplate;
```

## 使用 JPA

JPA 的是 Java Persistence API 的简写，是 Sun 官方提出的一种 ORM 规范，Hibernate、TopLink 等 ORM 框架 都是 JPA 的实现，其中 Hibernate 已获得 Sun 的兼容认证。Spring-data-jpa 就是 Spring 框架对 JPA 的整合，依赖于 Hibernate。默认使用的连接池是 HikariCP，无需再次引入

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

配置文件

```yaml
spring:
  jpa:
    database: mysql
    show-sql: true
    database-platform: org.hibernate.dialect.MySQL57Dialect # 使用 InnoDB
    hibernate:
      ddl-auto: update
```

创建实体

```java
// 由于使用的是Java的ORM规范，这里注解导入的包都是javax.persistence下面的
@Entity
@Table(name = "t_music", indexes = {@Index(name = "idx_title", columnList = "title", unique = true)})
public class Music {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 20, nullable = false)
    private String title;
}
```

创建 Repository

```java
// 由于是继承，默认也包含了一些常用的查询
@Repository
public interface MusicRepository extends JpaRepository<Music, Long> {
    // 符合JPA命名规则的方法定义
    // 无需自己实现方法,JPA会很据方法名自动推断
    Music findFirstByTitle(String title);

    @Query(value = "select * from t_music", nativeQuery = true)
    List<Music> customQuery();
}
```

然后就可以直接在 Service 或者 Controller 中注入 MusicRepository

```java
@Autowired
private MusicRepository musicRepository;
```

## 使用 MyBatis

配置好数据源，mysql 依赖，添加 MyBatis 依赖

```xml
<dependency>
  <groupId>org.mybatis.spring.boot</groupId>
  <artifactId>mybatis-spring-boot-starter</artifactId>
  <version>2.0.1</version>
</dependency>
```

追加 MyBatis 配置

```yaml
mybatis:
  mapper-locations: classpath:mapper/*Mapper.xml
```

创建数据实体

```java
package com.demo.sb.model;

public class User {
    private Long id;
    private String name;
    private Date createTime;
    // xxx
}
```

创建 Mapper 接口

```java
package com.demo.sb.mapper;

@Mapper
public interface UserMapper {
    User findById(Long id);
}

```

创建 Mapper 配置文件，`resources/mapper/UserMapper.xml`

```xml
<?xml version="1.0" encoding="utf-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
<mapper namespace="com.demo.sb.mapper.UserMapper">
    <select id="findById" parameterType="long" resultType="com.demo.sb.model.User">
        select * from t_user where id = #{id}
    </select>
</mapper>
```

在代码中注入 Mapper 实例

```java
// IDEA 波浪线警告，使用@Resource替代@Autowired
private UserMapper userMapper;
```

## 使用 Redis

添加配置

```yaml
spring:
  redis:
    host: 127.0.0.1
    port: 6379
    database: 0
    password: ''
    timeout: 10000 # 连接超时时间
    lettuce:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 1
        max-wait: 10000 # 连接池最大阻塞等待时间
        time-between-eviction-runs: 1200000 # 每2分钟运行一次空闲连接回收器，数值应小于redis配置文件中的timeout
```

redis 配置 ，通过`CONFIG GET *`查看

```conf
bind 127.0.0.1
port 6379
maxclients 1000
databases 16
maxmemory 524288000
timeout 300
save 15 1
```

添加起步依赖，默认使用的链接池是 lettuce

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

注入 RedisTemplate

```java
@Autowired
private RedisTemplate<String, String> redisTemplate;
```

## 使用 Jackson

注意这个配置是为 web 返回 json 做转换用的，如果在别的地方也想用到同样的处理可以通过`@Autowired`注入`ObjectMapper`

```yaml
spring:
  jackson:
    date-format: yyyy/MM/dd HH:mm:ss
    time-zone: GMT+8
```

有时候需要自定义某些转换规则，可以使用 Jackson2ObjectMapperBuilder 自己去定义一个

```java
SimpleDateFormat format = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
format.setTimeZone(TimeZone.getTimeZone("Asia/Shanghai"));
ObjectMapper mapper = new Jackson2ObjectMapperBuilder()
        .timeZone(format.getTimeZone())
        .dateFormat(format)
        .build();
```

关于解析时，由于泛型擦除没有`Map<String,Date>.class`类型，可以使用 TypeFactory 解决

```java
String json = "{\"date\":\"2020/05/24 23:57:46\"}";
MapType type = objectMapper.getTypeFactory().constructMapType(Map.class, String.class, Date.class);
Map<String, Date> map = objectMapper.readValue(json, type);
System.out.println(map.get("date").getTime());
```

## 视图渲染

静态视图：配置类为`org.springframework.boot.autoconfigure.web.ResourceProperties.java`,可以看到会优先从`spring.resources`前缀去取值，然后再依次去`classpath:/META-INF/resources/`、`classpath:/resources/`、`classpath:/static/`、`classpath:/public/`取值

一般都是放在`classpath:/public/`目录下，直接`context-path/path`即可访问，注意如果静态路径和 controller 路径相同，优先使用 controller

错误视图：当使用浏览器浏览访问遇到服务器端错误的时候，Spring Boot 默认会配置一个 whitelabel 错误页面，若使用 web 容器自带的可以通过`server.error.whitelabel.enabled=false`来关闭

错误页对应的路由是`/error`，如果自己的路由非要使用`/error`路径可以通过`server.error.path`修改。可以通过代码来声明错误页面的转发位置

```java
@Component
public class ErrorConfig implements ErrorPageRegistrar {

    @Override
    public void registerErrorPages(ErrorPageRegistry registry) {
        ErrorPage errorPage = new ErrorPage(HttpStatus.NOT_FOUND, "/customError404");
        registry.addErrorPages(errorPage);
    }
}
```

简单点的可以在 templates 下写一个 error.html，可以使用`${error},${status},${message}`变量，如果项根据错误的状态码来判断展示，可以建立`/error/500.html`等

模板视图：SpringBoot 推荐使用 Thymeleaf 模板引擎

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

```yml
spring:
  thymeleaf:
    mode: HTML5
    # 开发配置为false,避免修改模板重启服务器
    cache: false
    # 配置模板路径，默认是templates，可以不用配置
    prefix: classpath:/templates/
```

```java
@GetMapping("/view1")
public String view1(Model model, HttpServletRequest request) {
    model.addAttribute("param1", "参数1");
    request.setAttribute("param2", "参数2");
    return "view1.html";
}
```

templates/view1.html

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!--/* 等价于contextPath */-->
    <script th:src="@{/assets/js/jQuery.js}"></script>
    <title>Document</title>
  </head>
  <body>
    <p th:text="${param1}"></p>
    <p th:text="${param2}"></p>
    <p th:text="${user?.age}"></p>
    <p th:text="${#request.contextPath}"></p>
  </body>
</html>
```

## 拦截器

创建拦截器

```java
@Component
public class LoginInterceptor implements HandlerInterceptor {
    // 进入controller层之前拦截请求
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        System.out.println("getRequestURI:" + request.getRequestURI());
        return true;
    }
    // 处理请求完成后视图渲染之前的处理操作
    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {

    }
    // 视图渲染之后的操作
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {

    }
}
```

注册拦截器

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Autowired
    private LoginInterceptor loginInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loginInterceptor).addPathPatterns("/**");

    }
}
```

## Controller 切面

可以通过 `@ControllerAdvice` 来实现 Controller 的增强

```java
@ControllerAdvice
@RestControllerAdvice
public class ControllerHandler {
    // 注入全局参数
    // model.getAttribute("global")
    @ModelAttribute(name = "global")
    public Map<String, String> addGlobal() {
        Map<String, String> data = new HashMap<>();
        data.put("role", "admin");
        return data;
    }

    // 专门用来捕获和处理Controller层的异常
    // 一般用来记录日志
    // 统一错误响应格式
    @ExceptionHandler(Exception.class)
    @ResponseBody
    public Object exceptionHandler(Exception e, HttpServletRequest request) {
        // log
        Map<String, Object> result = new HashMap<>();
        result.put("code", 500);
        result.put("msg", e.getMessage());
        return result;
    }
}
```

## Junit 测试

使用起步依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

```java
@SpringBootTest
public class MapperTests {
    @Resource
    private UserMapper userMapper;

    @Test
    void findById() {
        System.out.println(userMapper.findById(2L));
    }
}
```

## Log 日志

Spring Boot 默认使用 slf4j+logback 日志系统，无需再次引入依赖的配置。默认输出到控制台，默认的日志级别为 INFO，可以在 yml 配置中进行简略配置

```yml
logging:
  level:
    root: info
    com.demo.springmvc.controller.TestController: debug
```

```java
// 导入的是slf4j的包
private static final Logger logger = LoggerFactory.getLogger(TestController.class);
```

上面只适用于简单情况，如果需要配置按天分隔，按级别分隔则需要单独写配置文件。由于是使用的 logback 实现，需要添加`logback.xml`文件，另外命名也有讲究，官方推荐命名为`logback-spring.xml`，带 spring 后缀的可以使用`<springProfile>`这个标签

```yml
# 不配置也可以
logging:
  config: classpath:logback-spring.xml
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>

    <contextName>logback</contextName>
    <!-- 定义变量后，可以使用${}来使用变量。 -->
    <property name="log.path" value="D:/logs"/>
    <property name="CONSOLE_LOG_PATTERN" value="${CONSOLE_LOG_PATTERN:-%clr(%d{yyyy-MM-dd HH:mm:ss.SSS}){faint} %clr(${LOG_LEVEL_PATTERN:-%5p}) %clr(${PID:- }){magenta} %clr(---){faint} %clr([%15.15t]){faint} %clr(%-40.40logger{39}){cyan} %clr(:){faint} %m%n${LOG_EXCEPTION_CONVERSION_WORD:-%wEx}}"/>

    <!-- 彩色日志 -->
    <!-- 彩色日志依赖的渲染类 -->
    <conversionRule conversionWord="clr" converterClass="org.springframework.boot.logging.logback.ColorConverter"/>
    <conversionRule conversionWord="wex" converterClass="org.springframework.boot.logging.logback.WhitespaceThrowableProxyConverter"/>
    <conversionRule conversionWord="wEx" converterClass="org.springframework.boot.logging.logback.ExtendedWhitespaceThrowableProxyConverter"/>

    <!--输出到控制台-->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
            <level>trace</level>
        </filter>
        <encoder>
            <Pattern>${CONSOLE_LOG_PATTERN}</Pattern>
            <charset>UTF-8</charset>
        </encoder>
    </appender>

    <!-- 输出到文件，level为 ERROR 日志 -->
    <appender name="ERROR_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${log.path}/error.log</file>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
            <charset>UTF-8</charset>
        </encoder>
        <!-- 日志记录器的滚动策略，按日期，按大小记录 -->
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${log.path}/error-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
            <!--日志文件保留天数-->
            <maxHistory>365</maxHistory>
        </rollingPolicy>
        <!-- 此日志文件只记录ERROR级别的 -->
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>ERROR</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>
    </appender>

    <!-- 设置某一个包或者具体的某一个类的日志打印级别 -->
    <!-- addtivity,是否向上级logger传递打印信息-->
    <!-- 注意，CONSOLE的level设置为tarce，root的level设置为info，这样自定义类的TRACE才会出来，同时影响root的level -->
    <logger name="com.demo.springmvc.controller.TestController" level="TRACE"></logger>

    <springProfile name="dev">
        <!-- 根据spring的环境进行加入某些节点 -->
    </springProfile>

    <!-- 用来指定最基础的日志输出级别，只有一个level属性，对于没有配置logger的类，将会使用此level-->
    <root level="info">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="ERROR_FILE"/>
    </root>
</configuration>
```

## 开发时热加载

官方提供 spring-boot-devtools 插件，引入即可做到自动重启，在 IDEA 中需要做额外的配置，实际使用并不好使，自动重载慢。

推荐项目使用 debug 模式运行然后在运行配置是做下调整，使用 IDEA 自带的热加载效果反而好一点

![01](01.png)

## 参考

[官方文档](https://docs.spring.io/spring-boot/docs/2.3.0.RELEASE/reference/htmlsingle/#legal)

[SpringBoot 整合 Sping Data JPA](https://blog.csdn.net/Axela30W/article/details/80741880)

[Thymeleaf 教程](https://fanlychie.github.io/post/thymeleaf.html)

[spring boot 2.x 拦截器](https://blog.csdn.net/qq_34173549/article/details/81635034)

[springboot2.0 整合 logback 日志(详细)](https://www.cnblogs.com/zhangjianbing/p/8992897.html)
