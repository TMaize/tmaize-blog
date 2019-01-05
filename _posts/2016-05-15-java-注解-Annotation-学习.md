---
layout: mypost
title:  Java注解(Annotation)学习
categories: [Java]
---
## 概念

注解（Annotation），也叫元数据。一种代码级别的说明。它是JDK1.5及以后版本引入的一个特性，与类、接口、枚举是在同一个层次。它可以声明在包、类、字段、方法、局部变量、方法参数等的前面，用来对这些元素进行说明，注释。

## 注解的分类

1. 源码注解

    注解只在源码中存在，编译成.class文件就不存在了。

2. 编译时注解：
    
    注解在源码和.class文件中都存在。（例如：JDK的三个注解）

3. 运行时注解

    在运行阶段还起作用，甚至会影响运行逻辑的注解

### JDK自带注解

```java
@Override //表示当前方法覆盖了父类的方法
@Deprecation //表示方法已经过时,方法上有横线，使用时会有警告。
@SuppviseWarnings //表示关闭一些警告信息(通知java编译器忽略特定的编译警告)
```

## 自定义注解

为了开发方便或者开发框架有时候需要自定义注解

### 语法

1. 使用@interface关键字定义注解，注意关键字的位置
2. 成员以无参数无异常的方式声明，注意区别一般类成员变量的声明
3. 可以使用default为成员指定一个默认值，如上所示
4. 成员类型是受限的，合法的类型包括原始类型以及String、Class、Annotation、Enumeration （JAVA的基本数据类型有8种：byte(字节)、short(短整型)、int(整数型)、long(长整型)、float(单精度浮点数类型)、double(双精度浮点数类型)、char(字符类型)、boolean(布尔类型）
5. 注解类可以没有成员，没有成员的注解称为标识注解，例如JDK注解中的@Override、@Deprecation 
6. 如果注解只有一个成员，并且把成员取名为value()，则在使用时可以忽略成员名和赋值号“=” ,例如JDK注解的@SuppviseWarnings ；如果成员名不为value，则使用时需指明成员名和赋值号"="

```java
public @interface Annotation_1 {  
    //仅仅用作标识  
}

public @interface Annotation_2 {  
    String value() default "null";
    //使用时@Annotation_2("haha")
}

public @interface Annotation_3 {  
    String name();
    int age();
    //使用时@Annotation_3(name="haha",age=18)
}
```

### 元注解

 何为元注解？就是注解的注解，就是给你自己定义的注解添加注解，你自己定义了一个注解，但你想要你的注解有什么样的功能，此时就需要用元注解对你的注解进行说明了。元注解有4个.

 + @Target

    即注解的作用域，用于说明注解的使用范围（即注解可以用在什么地方，比如类的注解，方法注解，成员变量注解等等），取值：

    ```
    ElemenetType.CONSTRUCTOR----------------------------构造器声明 
    ElemenetType.FIELD --------------------------------------域声明(包括 enum 实例)
    ElemenetType.LOCAL_VARIABLE------------------------- 局部变量声明 
    ElemenetType.METHOD ----------------------------------方法声明 
    ElemenetType.PACKAGE --------------------------------- 包声明 
    ElemenetType.PARAMETER ------------------------------参数声明 
    ElemenetType.TYPE--------------------------------------- 类，接口(包括注解类型)或enum声明
    ```

+ @Retention

    描述的注解在什么范围内有效，取值有：
    ```
    RetentionPolicy.SOURCE--------------------------只在源码显示，编译时会丢失
    RetentionPolicy.CLASS-----------------------------编译时会记录到class中，运行时忽略 
    RetentionPolicy.RUNTIME------------------------- 运行时存在，可以通过反射读取
    ```

+ @Inherited

    是一个标记注解，没有成员，表示允许子类继承该注解，也就是说如果一个使用了@Inherited修饰的注解被用于一个class时，则这个注解将被该class的子类继承拥有。使用了@Inherited修饰的注解只能被子类所继承，并不可以从它所实现的接口继承。子类继承父类的注解时，并不能从它所重载的方法继承注解

+ @Documented

    @Documented是一个标记注解，没有成员。用于描述其它类型的annotation应该被作为被标注的程序成员的公共API，因此可以被例如javadoc此类的工具文档化。

### 注解处理器

即通过反射获取类、函数或成员上的运行时注解信息，从而实现动态控制程序运行的逻辑

+ Test.java

```java
@MyAnnotation(name="MyName")
public class UseAnn {
	@MyAnnotation(name="测试",age=21)
	public void excute(){
		System.out.println("excute()执行....");
	}
}
```

```java
try {
    Class<?> c = Class.forName("Test");
    //类上面是否有注解
    if(c.isAnnotationPresent(MyAnnotation.class)){
        MyAnnotation myAnnotation = (MyAnnotation) c.getAnnotation(MyAnnotation.class);
        System.out.println(myAnnotation.name()+" "+myAnnotation.age());
    }else{
        System.out.println("该类没有被注解...");
    }
    //方法上是否有注解
    Method[] ms = c.getDeclaredMethods();
    for(Method method:ms){
        if (method.isAnnotationPresent(MyAnnotation.class)) {
            MyAnnotation myAnnotation = method.getAnnotation(MyAnnotation.class);
            System.out.println(myAnnotation.name()+" "+myAnnotation.age());
            try {
                try {
                    method.invoke(c.newInstance(), null);
                } catch (InstantiationException e) {
                    e.printStackTrace();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
} catch (ClassNotFoundException e) {
    System.out.println("没有加载到类....");
}
```

## Demo 注解反射生成SQL语句

使用java注解来对用户表的每个字段或字段的组合条件进行动态生成SQL查询语句


```java
//Table.java
@Target({ElementType.TYPE})  
@Retention(RetentionPolicy.RUNTIME)  
public @interface Table {
    String value();  
}

//Column.java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)

public @interface Column {
	String value();
}

//User.java
@Table("user")  
public class User { 

    @Column("id") 
    private int id;  

    @Column("user_name")  
    private String userName;  
  
    public int getId() {  
        return id;  
    }  
    public void setId(int id) {  
        this.id = id;  
    }  
    public String getUserName() {  
        return userName;  
    }  
    public void setUserName(String userName) {  
        this.userName = userName;  
    } 
}

//ReturnQuery.java
public static String query(Object object){
	StringBuilder sqlStrBuilder = new StringBuilder();
	Class clazz = object.getClass();
	if (!clazz.isAnnotationPresent(Table.class)) {
		return null;
	}

	Table t = (Table) clazz.getAnnotation(Table.class);
	String tableName = t.value();
    sqlStrBuilder.append("select * from ").append(tableName).append(" where 1=1");
	Field[] fields = clazz.getDeclaredFields();
	for (Field field : fields) {
		if (field.isAnnotationPresent(Column.class)) {
			Column column = field.getAnnotation(Column.class);
			Object value = invokeGet(field.getName(), object);
			sqlStrBuilder.append(" and "+column.value()+"=" +value );
		}
	}
	return sqlStrBuilder.toString();
	
}

public static Object invokeGet(String fieldName,Object object) {
	try {
		PropertyDescriptor pd = new PropertyDescriptor(fieldName,object.getClass());
		return pd.getReadMethod().invoke(object, null);
	} catch (IntrospectionException | IllegalAccessException | IllegalArgumentException | InvocationTargetException e) {
		return null;
	}
}

//Test.java
User u = new User();  
u.setUserName("haha");
u.setId(10);

System.out.println(ReturnQuery.query(u));
```

为了减小篇幅Demo删掉了好多代码，跑起来会有点问题，但是用法体现出来就行了