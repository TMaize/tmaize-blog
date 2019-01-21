---
layout: mypost
title: Hibernate学习笔记02 实体类 主键生成 缓存 事务 session绑定
categories: [Java]
---

## 实体类编写规则

1. 实体类的属性时时私有的

2. 实体类的属性要有public的get/set方法

3. 实体类有属性作为唯一值

4. 实体类的属性建议不使用基本数据类型，使用基本数据类型对应的包装类

    例如学生成绩 `int score = 0;Integer score = 0`只能表示成绩为0，而`Integer score = null`可以表示没有参加考试

## 常用主键生成策略

```xml
<id name="id" column="id">
	<generator class="native"></generator>
</id>
```

1. increment

    用于long，short，int类型，由Hibernate从数据库中取出主键的最大值（每个session只取1次），以该值为基础，每次增量为1，在内存中生成主键，不依赖于底层的数据库，因此可以跨数据库。只有当没有其他进程向同一张表中插入数据时才可以使用，不能在集群环境下使用。适用于代理主键。


2. identity
    
    identity由底层数据库生成标识符。identity是由数据库自己生成的，但这个主键必须设置为自增长，使用identity的前提条件是底层数据库支持自动增长字段类型，如DB2、SQL Server、MySQL、Sybase和HypersonicSQL等，Oracle这类没有自增字段的则不支持。适用于代理主键。

3. sequence
    
    采用数据库提供的sequence机制生成主键，需要数据库支持sequence。如oralce、DB、SAP DB、PostgerSQL、McKoi中的sequence。MySQL这种不支持sequence的数据库则不行（可以使用identity）。适用于代理主键。

4. hilo
    
    hilo（高低位方式high low）是hibernate中最常用的一种生成方式，需要一张额外的表保存hi的值。保存hi值的表至少有一条记录（只与第一条记录有关），否则会出现错误。可以跨数据库。

5. native
    
    native由hibernate根据使用的数据库自行判断采用identity、hilo、sequence其中一种作为主键生成方式，灵活性很强。如果能支持identity则使用identity，如果支持sequence则使用sequence。

6. uuid
    
    UUID：Universally Unique Identifier，是指在一台机器上生成的数字，它保证对在同一时空中的所有机器都是唯一的。按照开放软件基金会(OSF)制定的标准计算，用到了以太网卡地址、纳秒级时间、芯片ID码和许多可能的数字。
    
    标准的UUID格式为：xxxxxxxx-xxxx-xxxx-xxxxxx-xxxxxxxxxx (8-4-4-4-12)其中每个 x 是 0-9 或 a-f 范围内的一个十六进制的数字。

    Hibernate在保存对象时，生成一个UUID字符串作为主键，保证了唯一性，但其并无任何业务逻辑意义，只能作为主键，唯一缺点长度较大，32位（Hibernate将UUID中间的“-”删除了）的字符串，占用存储空间大，但是有两个很重要的优点，Hibernate在维护主键时，不用去数据库查询，从而提高效率，而且它是跨数据库的，以后切换数据库极其方便。

    特点：uuid长度大，占用空间大，跨数据库，不用访问数据库就生成主键值，所以效率高且能保证唯一性，移植非常方便，推荐使用。

7. .....

## 实体对象的三种状态

1. 瞬时态/临时对象：
    
    new命令开辟内存空间的java对象,临时对象在内存孤立存在,它是携带信息的载体,不和数据库的数据有任何关联关系，如果没有变量对该对象进行引用,它将被gc回收。可通过 session的save()或saveOrUpdate()方法将瞬时对象与数据库相关联,并将数据对应的插入数据库中,此时该临时对象转变成持久化对象。

2. 持久态：

    对象里面有id值，且与session有关联，对它的任何操作都会同步到数据库中

    处于该状态的对象在数据库中具有对应的记录,并拥有一个持久化标识.通过session的get()、load() 等方法获得的对象都是持久对象

    持久化对象被修改变更后，不会马上同步到数据库，直到数据库事务提交。在同步之前，持久化 对象是脏的(Dirty)

    如果是用hibernate的delete()方法,对应的持久对象就变成临时对象,因数据库中 的对应数据已被删除,该对象不再与数据库的记录关联.

    当一个session执行close()或 clear()、evict()之后,持久对象变成游离对象,此时该对象虽然具有数据库识别值,但它已不在HIbernate持久层的管理之下.

3. 脱管态/游离状态：

    当与某持久对象关联的session被关闭后,该持久对象转变为游离对象.当游离对象被重新关联到session上 时,又再次转变成持久对象（在Detached其间的改动将被持久化到数据库中）。 **游离对象拥有数据库的识别值,但已不在持久化管理范围之内**

    通过update()、saveOrUpdate()等方法,游离对象可转变成持久对象.

    如果是用hibernate的delete()方法,对应的游离对象就变成临时对象,因数据库中的 对应数据已被删除,该对象不再与数据库的记录关联.

    在没有任何变量引用它时,它将被gc在适当的 时候回收；
    
    比瞬时对象多了一个数据库记录标识值

## 缓存

数据存放到数据库中，数据库本身是文件系统，使用流的方式操作文件效率不高

把数据放到内存里面，直接从内存里面读取数据，提高效率

+ Hibernate的一级缓存

    默认打开的，所用时间是session的打开到关闭之间，存储的数据必须是持久态

+ Hibernate的二级缓存

    + 目前不再使用，被一些缓存工具替代了

    + 默认不打开，需要配置

    + 使用范围是项目的范围，即sessionFactory的范围

## 事务

```java
try{
    开启事务
    提交事务
}catch{
    回滚事务
}finally{
    关闭
}
```
+ 配置事务隔离级别

    mysql的默认事务级别是REPEATABLE_READ

    `<property name="hibernate.connection.isolation">4</property>`

+ 事务特性

+ 不考虑隔离产生的问题

    脏读，不可重复读，虚读

## Session与本地线程绑定

为什么要把Session与本地线程绑定？官方对他的解释如下：

只要你持有SessionFactory，在任何时候、任何地点调用getCurrentSession方法总会返回“当前的”工作单元,也就是自动为每个线程维护一个私有变量空间

openSession方法

+ 总是创建一个新的session对象

+ 你需要去明确的关闭session对象

+ 在单线程环境它比getCurrentSession()更慢

+ 你也不需要去配置任何属性，你就能够使用这个方法

getCurrentSession方法

+ 如果session不存在，它将创建一个新的session，否则在当前hibernate环境中使用同一个session

+ 你不需要去关闭session对象，它将自动被hibernate内部机制关闭

+ 在单线程环境它比opensession更快

+ 你需要去配置中附加hibernate.current_session_context_class这个属性，才能够调用getCurrentSession()方法否则将会抛出异常

```
<property name="current_session_context_class">thread</property>

public class HibernateUtil {
	
    ...
	
    public static Session openCurrentSession() {
        return sessionFactory.getCurrentSession();
    }
    ...
}
```