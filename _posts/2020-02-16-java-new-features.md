---
layout: mypost
title: Java 新特性总结
categories: [Java]
---

Java 应该是我学的第一门后端语言，可能是学的比较早，尽管那时候已经是 1.8 了，但是在当时的 Java 教程里都没有讲过 Java 的一些新特性。
虽然后来浏览的一些技术文章或多或少的看到过一些 Lambda ，Stream 之类的介绍，但是从来没有认真的看过。今天趁着在家没事就把这些知识补了一下。

## Lambda 表达式

所谓 Lambda 表达式个人认为是用来简化匿名内部类的方式来实现接口，写法和 JavaScript 的箭头函数很像

比下面使用 Lambda 表达式实现的 Runnable 接口，是不是感觉简洁了好多

```java
Thread t = new Thread(() -> {
    System.out.println("Hello");
});
```

Lambda 表达式的格式比较简单，一般有如下几种形式

```
() -> {}
(a) -> {}
(int a) -> {}
a - {}
# 如果 Lambda 表达式的主体只有一条语句，花括号{}可省略
# 如果 Lambda 表达式的主体只有一条语句，return 可省略
(a,b) -> {a+b}
```

## 函数式接口

并不是所有的接口就可以被 Lambda 表达式来实现，规定如下：

- 接口有且仅有一个抽象方法
- 允许定义静态方法
- 允许定义默认方法
- 允许 Override java.lang.Object 中的 public 方法

为了在编译时期检查一个接口是否符合上述条件，最好在类上面添加`@FunctionInterface`注解

为了避免开发者重复的去写一些函数式接口，Java 中已经抽象出一些常用的函数接口

如下

- Function 传入一个数据，经过 apply 后返回一个新的数据

- UnaryOperator 传入一个数据，经过 apply 后返回一个同类型的数据

- Consumer 通过 accept 消费一个数据，无返回值

- Supplier 无参数，通过 get 返回一个数据

- Predicate 传入数据，通过 test 返回 bool

使用方式如下

```java
Function<String, String> f = s -> "_" + s.toUpperCase();
// _HELLO
System.out.println(f.apply("hello"));
```

同时为了简化输入，上述函数接口又有一些带类型的变种

```
IntFunction
ToIntFunction
BiFunction
ToIntBiFunction
IntUnaryOperator
IntConsumer
// ...
```

## 方法引用

进一步简化 Lambda 表达式

| 类型         | 语法               | 对应的 Lambda 表达式                 |
| ------------ | ------------------ | ------------------------------------ |
| 静态方法引用 | 类名::staticMethod | (args) -> 类名.staticMethod(args)    |
| 实例方法引用 | inst::instMethod   | (args) -> inst.instMethod(args)      |
| 对象方法引用 | 类名::instMethod   | (inst,args) -> 类名.instMethod(args) |
| 构建方法引用 | 类名::new          | (args) -> new 类名(args)             |

如

```
String str = "123";
Supplier<Integer> getLen1 = str::length;
Supplier<Integer> getLen2 = () -> str.length();
System.out.println(getLen1.get());
System.out.println(getLen2.get());
```

## 新日期时间 API

说起日期，平常使用的如下

- 日期 `java.util.Date`

- 日期格式化 `java.text.SimpleDateFormat`

- 日历 `java.util.Calendar`

由于旧的时间类非线程安全，设计不佳，时区处理困难，因此 Java 8 重新设计了所有日期时间、日历及时区相关的 API。全部放在了`java.time`包下面

常用的有 `LocalDate` 、`LocalTime` 和 `LocalDateTime`，`ZonedDateTime`，`DateTimeFormatter`

```java
// 月份从一开始
LocalDateTime dateTime = LocalDateTime.of(2020, 2, 18, 0, 0, 0);
System.out.println(dateTime);

// 使用with返回新的实例
dateTime = dateTime.withHour(8);
System.out.println(dateTime);

LocalDate currentDate = LocalDate.now();
System.out.println(currentDate.compareTo(dateTime.toLocalDate()));

System.out.println(dateTime.format(DateTimeFormatter.ISO_DATE_TIME));
System.out.println(dateTime.format(DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss")));

DateTimeFormatter fmt = new DateTimeFormatterBuilder().appendValue(ChronoField.YEAR, 4).appendLiteral("/").toFormatter();
System.out.println(dateTime.format(fmt));
```

## Base64 支持

不用再引入 sun 包里面的的了

```java
String result = Base64.getEncoder().encodeToString("你好".getBytes(StandardCharsets.UTF_8));
System.out.println(result);
System.out.println(new String(Base64.getDecoder().decode(result), StandardCharsets.UTF_8));

```

## Stream

通过将集合转换为这么一种叫做 “流” 的元素序列，通过声明性方式，能够对集合中的每个元素进行一系列并行或串行的流水线操作

常用的方法有：count，collect，forEach，filter，distinct，sorted，map，limit，skip，flatMap，anyMatch，allMatch，noneMatch，findAny，reduce

Stream 操作结合 Lambda 表达式写出来的代码非常简洁

```java
List<Integer> numbers = Arrays.asList(1, 4, 4, 3, 2, 1);
List<Integer> result = numbers.stream()
        .distinct()
        .sorted((o1, o2) -> o2 - o1)
        .map(i -> i * i)
        .collect(Collectors.toList());
System.out.println(result);
```

## 参考

[Java8 新特性之二：方法引用](https://www.cnblogs.com/wuhenzhidu/p/10727065.html)

[Java 8 新特性](https://www.twle.cn/l/yufei/java/java-basic-java8-new-features.html)

[Java 9 新特性 - 介绍](https://www.twle.cn/c/yufei/java9/java9-basic-index.html)
