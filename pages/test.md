---
layout: mypost
title: java设计模式之单例模式
categories: [java,设计模式]
---

对于系统中的某些类来说，只有一个实例很重要，例如，一个系统中可以存在多个打印任务，但是只能有一个正在工作的任务。而且只有一个实例能够减少内存占用，还可以防止实例存在多个会引起的程序逻辑错误。

单例模式是设计模式中最简单的形式之一。这一模式的目的是使得类的一个对象成为系统中的唯一实例。在计算机系统中，线程池、缓存、日志对象、对话框、打印机、显卡的驱动程序对象常被设计成单例。并且这些应用都或多或少具有资源管理器的功能。

# 实现

单例模式实现的方法较多，但是基本的就两种，懒汉模式和饿汉模式


## 懒汉模式

懒汉式顾名思义，会延迟加载，在第一次使用该单例的时候才会实例化对象出来，第一次调用时要做初始化，如果要做的工作比较多，性能上会有些延迟，之后就和饿汉式一样了。

```java
public class Singleton {
	
	private static Singleton singleton = null;
	
	//屏蔽构造方法
	private Singleton(){}
	
	//获得单例，存在线程安全问题
	public static Singleton getInstance(){
		if(singleton==null){
			singleton = new Singleton();
		}
		return singleton;
	}

	//....
}
```

对于上面的实现会存在线程安全问题，不过可以使用`synchronized`关键字来修饰`getInstance()`,但是又会带来性能上的影响.可以通过静态内部类来解决这个问题

```java
public class Singleton {

	private static class LazyHolder {
		private static final Singleton INSTANCE = new Singleton();
	}

	private Singleton() {}

	public static final Singleton getInstance() {
		return LazyHolder.INSTANCE;
	}
}
```

## 饿汉模式

饿汉就是类一旦加载，就把单例初始化完成，保证getInstance的时候，单例是已经存在的了，所以饿汉式天生就是线程安全的，可以直接用于多线程而不会出现问题。但是不管之后会不会使用这个单例，都会占据一定的内存，相应的，在第一次调用时速度也会更快，因为其资源已经初始化完成。

```java
public class Singleton {
	
	private final static Singleton singleton = new Singleton();
	
	//屏蔽构造方法
	private Singleton(){}
	
	//获得单例
	public static Singleton getInstance(){
		return singleton;
	}

	//....
}
```

