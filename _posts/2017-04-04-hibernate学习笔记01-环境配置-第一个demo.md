---
layout: mypost
title: Hibernate学习笔记01 环境配置 第一个Demo
categories: [Java]
---

## 概述

Hibernate是一个开放源代码的对象关系映射框架，它对JDBC进行了非常轻量级的对象封装，它将POJO与数据库表建立映射关系，是一个全自动的orm框架，hibernate可以自动生成SQL语句，自动执行，使得Java程序员可以随心所欲的使用对象编程思维来操纵数据库。 Hibernate可以应用在任何使用JDBC的场合，既可以在Java的客户端程序使用，也可以在Servlet/JSP的Web应用中使用，最具革命意义的是，Hibernate可以在应用EJB的J2EE架构中取代CMP，完成数据持久化的重任。

1. hibernate框架应用在javaee三层结构中的dao层

2. 在dao层进行数据库crud(增加Create、读取Retrieve、更新Update、删除Delete)操作。
hibernate底层代码就是jdbc，hibernate对jdbc进行了封装，不需要再写jdbc代码了，不需要写sql语句实现。

3. hibernate使用ORM(Object,Relational,Mapping)思想对数据库进行crud操作

4. hibernate是**开源**的轻量级框架

5. 版本 3.x,4.x(过渡版本),5.x(主要使用)

### JavaEE的三层结构

1. web层：struts2 框架

2. service层：Spring框架

3. dao层：hibernate框架

### 使用的基本步骤

1. 加载hibernate核心配置文件
2. 创建SessionFactory对象
3. 使用SessionFactory创建session对象
4. 开启事务
5. 写具体操作
6. 提交事务
7. 关闭资源

### SessionFactory对象特点

1. 线程安全的，同一个实例可以供多个线程共享

2. 它是重量级的，创建时需要消耗很多的资源，不能随意的创建和销毁实例。

    由于SessionFactory的这些特点，一般情况下一个项目只需要一个SessionFactory，只有当应用中存在多个数据源的时候，
    才会为每个数据源建立一个SessionFactory实例。

    通常会抽取出一个HibernateUtils来提供SessionFactory对象，SessionFactory一般不需要关闭，但是Session使用完之后要记得关闭

    ```java
    import org.hibernate.Session;
    import org.hibernate.SessionFactory;
    import org.hibernate.cfg.Configuration;

    public class HibernateUtils {
        
        private static final Configuration configuration;
        private static final SessionFactory sessionFactory;
        
        static{
            //configure()默认加载src下的hibernate.cfg.xml
            configuration = new Configuration().configure();
            sessionFactory = configuration.buildSessionFactory();
        }
        
        public static Session openSession(){
            return sessionFactory.openSession();
        }

        public static SessionFactory getSessionFactory(){
		    return sessionFactory;
	    }
    }
    ```

## 环境搭建

到[官网](http://hibernate.org/orm/)下载开发包，当前最新版本是 5.2.9.Final

### 导入jar包

1. 开发包/lib/required里面所有的jar

2. mysql-connector-java-xxxx-bin.jar

3. 还有一一部分需要时再导入

### 建立数据实体类 配置映射文件

实体类其实就是一个javaBean，以User为例

```java
package pojo;

public class User {

    /*必须要有主键*/
	int id;
	String name;
	String address;

	//getter/setter方法
}
```

下面为数据实体类与数据表建立映射文件

配置实体类和数据表之间映射的配置文件，一般放在实体类的包里面，名为：实体名.hbm.xml

建立xml时可以到hibernate的核心包里面找到约束文件，拷贝其dtd约束的头，`/org/hibernate/hibernate-mapping-3.0.dtd`

也可以到开发包\project\etc下面找到配置文件的模版

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE hibernate-mapping PUBLIC 
    "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
    "http://www.hibernate.org/dtd/hibernate-mapping-3.0.dtd">

<hibernate-mapping>
	<!-- 配置类和表对应 -->
	<class name="pojo.User" table="t_user">
	
		<!-- 配置主键-->
		<id name="id" column="id">
			<!-- 设置数据库表主键增长策略 -->
			<generator class="native"></generator>
		</id>
		
		<!-- 配置其他属性和表字段对应 -->
		<property name="name" column="name"></property>
		<property name="address" column="address"></property>
		
	</class>
</hibernate-mapping>
```

### 创建核心配置文件

核心配置的名字和位置一般是固定的，也可以在生成Configuration对象时加载指定路径
一般默认是在src下，hibernate.cfg.xml，推荐使用默认的方式


可以到hibernate的核心包里面找到约束文件，拷贝其dtd约束的头，`/org/hibernate/hibernate-configuration-3.0.dtd`

也可以到 开发包\project\etc下面找到配置文件的模版

在填写property时name和value必须是hibernate里面定义的，可以到开发包\project\etc\hibernate.properties找到对应关系

```xml
<?xml version="1.0" encoding="UTF-8"?>

<!DOCTYPE hibernate-configuration PUBLIC
	"-//Hibernate/Hibernate Configuration DTD 3.0//EN"
	"http://www.hibernate.org/dtd/hibernate-configuration-3.0.dtd">

<hibernate-configuration>
	<session-factory>
	
		<!-- 1.配置数据库信息 -->
		<property name="hibernate.connection.driver_class">com.mysql.jdbc.Driver</property>
		<property name="hibernate.connection.url">jdbc:mysql:///test</property>
		<property name="hibernate.connection.username">root</property>
		<property name="hibernate.connection.password">123456</property>
		
		<!-- 2.配置hibernate信息 -->
		
		<!-- 显示生成的sql语句 ，并格式化-->
		<property name="hibernate.show_sql">true</property>
		<property name="hibernate.format_sql">true</property>
		
		<!-- 配置自动创建表 -->
		<property name="hibernate.hbm2ddl.auto">update</property>
		
		<!-- 配置所使用的数据库的方言 -->
		<property name="hibernate.dialect">org.hibernate.dialect.MySQL5InnoDBDialect</property>
		
		<!-- 3.配置映射文件-->
		<mapping resource="pojo/User.hbm.xml"/>
		
	</session-factory>

</hibernate-configuration>
```

注意：

**、可以通过配置让Hibernate自动生与实体类对应的表，推荐这样做，而且当对实体类改动后会更新表而不用手动再设置**

自动建表一直出错，郁闷死了，后来才知道...

**Mysql 版本 5.0以前的Hibernate 方言是`org.hibernate.dialect.MySQLDialect`,5.0以后的Hibernate 方言是：`org.hibernate.dialect.MySQL5InnoDBDialect`**

### 创建测试类

```java
package test;
import org.hibernate.Session;
import org.hibernate.Transaction;
import pojo.User;
import utils.HibernateUtils;

public class Test {

	@org.junit.Test
	public void insertTest(){

		Session session = HibernateUtils.openSession();
		Transaction transaction = session.beginTransaction();
		
		User u = new User();
		u.setName("哈哈");
		u.setAddress("北京市");
		
		session.save(u);
		
		transaction.commit();
		session.close();
		
		//一般不关闭sessionFactory
		//HibernateUtils.getSessionFactory().close();
	}
}
```

### 检查结果

控制台输出
```
Hibernate: 
    
    create table t_user (
       id integer not null auto_increment,
        name varchar(255),
        address varchar(255),
        primary key (id)
    ) engine=InnoDB
Hibernate: 
    insert 
    into
        t_user
        (name, address) 
    values
        (?, ?)
```

查看数据库会发现多了一个表，里面有一条刚刚插入的数据

## 总结

配置文件的细节比较多，注意不要写错了

测试前数据库要打开，配置中的连接信息要正确

注意mysql5.0之前之后要配置的方言

配置映射文件是多个实体类属性对应一个column会出问题
