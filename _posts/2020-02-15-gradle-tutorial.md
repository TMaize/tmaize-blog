---
layout: mypost
title: Gradle快速入门
categories: [Java]
---

Gradle 是使用 Java 和 Groovy（基于 JVM 兼容 Java） 开发的一个项目自动化构建工具

## 安装

1. 下载 binary-only 版本即可， [https://gradle.org/releases/](https://gradle.org/releases/)

2. 把 bin 目录配置到环境变量

3. `gradle -v` 测试配置是否成功

## 国内下载慢

添加`~/.gradle/init.gradle`全局配置文件，设置国内镜像

```groovy
allprojects{
    repositories {
        def ALIYUN_REPOSITORY = 'https://maven.aliyun.com/repository/public/'
        def ALIYUN_JCENTER= 'https://maven.aliyun.com/repository/jcenter/'
        def ALIYUN_GOOGLE = 'https://maven.aliyun.com/repository/google/'
        def ALIYUN_GRADLE_PLUGIN = 'https://maven.aliyun.com/repository/gradle-plugin/'
        all { ArtifactRepository repo ->
            if(repo instanceof MavenArtifactRepository){
                def url = repo.url.toString()
                if (url.startsWith('https://repo1.maven.org/maven2/')) {
                    project.logger.lifecycle "Repository ${repo.url} replaced by $ALIYUN_REPOSITORY."
                    remove repo
                }
                if (url.startsWith('https://jcenter.bintray.com/')) {
                    project.logger.lifecycle "Repository ${repo.url} replaced by $ALIYUN_JCENTER."
                    remove repo
                }
                if (url.startsWith('https://dl.google.com/dl/android/maven2/')) {
                    project.logger.lifecycle "Repository ${repo.url} replaced by $ALIYUN_GOOGLE."
                    remove repo
                }
                if (url.startsWith('https://plugins.gradle.org/m2/')) {
                    project.logger.lifecycle "Repository ${repo.url} replaced by $ALIYUN_GRADLE_PLUGIN."
                    remove repo
                }
            }
        }
        maven { url ALIYUN_REPOSITORY }
        maven { url ALIYUN_JCENTER }
        maven { url ALIYUN_GOOGLE }
        maven { url ALIYUN_GRADLE_PLUGIN}
    }
}
```

## wrapper

```
# 在当前目录下生成 gradlew 命令
gradle wrapper
```

wrapper 的作用是解决在未安装 gradle 环境或者 本地 gradle 版本和 wrapper 中指定的版本不一致

通过 gradlew 命令来运行项目，第一步会自动下载 gradle 到`~/.gradle/wrapper/dists`目录，然后再去执行 build.gradle

在实际项目中用到的更多的是 gradlew 而不是 gradle

## daemon

由于 JVM 启动过程比较耗时，为了避免重复的启动 JVM，为了解决这个问题 gradle3.x 之后引入的 daemon 模式

daemon JVM 是常驻后台的，长时间未连接会自动关闭，每次 gradle 启动如果存在可兼容的 daemon JVM，gradle 会启动一个轻量的 JVM 与 daemon JVM 进行交互，所有的命令都是转交给 daemon JVM 执行

默认 2 小时未连接 daemon JVM 会自动销毁。当然自己也可以手动去关闭

```
gradle --stop
gradlew --stop
```

## 脚本语法

build.gradle 使用的是 Groovy 语法，Groovy 是基于 JVM 开发的一门脚本语言，兼容 Java，同时提供了大量语法糖

Groovy 的语法很奇怪，可以参考这个文档[Domain-Specific Languages](http://www.groovy-lang.org/dsls.html)

特性总结：

1. 使用 def 定义变量会自动推导类型，当然也可以使用 int,float,double...

2. 字符串分三种：`'普通字符串'`,可插值的字符串`"Hello ${name}"`,格式输出`''' 456\n789 '''`

3. 不引起歧义的括号都是可以省略的，如 `println "Hello"`

4. 闭包(groovy.lang.Closure)，可以理解为代码块/函数，可作为参数传递

5. 使用花括号声明一个闭包`def c = {p-> return p+1}`，调用`c(1)`

6. 闭包省略 return 时，个语句的结果是返回值

7. 不指定闭包参数时，it 变量就是传递的第一个参数 `def c = {it + 1}`

8. 函数最后一个参数为闭包，该闭包可以写在函数调用括号的外面

## 生命周期

Initialization

Gradle 会确定哪些项目参与构建，并且为这些项目创建一个 Project 实例

Configuration

将执行构建的所有项目的构建脚本。也就是说，会执行每个项目的 build.gradle 文件，同时根据执行的结果生成一些 task

Execution

指定 gradle 命令传入的任务名称

## 基本使用

未导入其他包的情况下，常用方法一般都是都是定义在`org.gradle.api.Project`中

**afterEvaluate**

在 Configure 后执行

**task**

定义一个任务，在 Execution 阶段执行

```
gradle task1 [task2...]
```

注意：可以动态成成任务，比如在循环中生成 task1-task10

```groovy
// task('task1',{})
task('task1') {
    // Configuration阶段解析
    def c = { it + 1 }

    // 插入到任务队列头部
    // Configuration阶段解析
    // Execution阶段执行
    doFirst {
        println c(1)
    }

    // 插入到任务队列头部
    doLast {
        println c(2)
    }
}
```

**plugin**

```groovy
// 自定义插件
class MyPlugin implements Plugin<Project> {
    @Override
    void apply(Project target) {
        target.task("create_by_plugin") {
            println "create_by_plugin"
        }
    }
}

// apply(["plugin": MyPlugin])
apply plugin: MyPlugin
```

**脚本中引入外部依赖**

可以在 Configuration 中引入外部依赖，更好的书写脚本

```groovy
buildscript {
    repositories {
        mavenCentral()
    }

    dependencies {
        classpath group: 'com.google.code.gson', name: 'gson', version: '2.8.6'

    }
}
task('json') {
    def o = [a: 1, b: 2]
    doLast {
        def g = new com.google.gson.Gson()
        println g.toJson(o)
    }

}
```

**在项目中引入外部依赖**

注意脚本执行依赖和项目执行完全是两个环境，因此两个依赖两个之间没有关系

```groovy
// src\main\java
// src\main\resources
// src\test\java
// src\test\java\resources
apply plugin: 'java'

repositories {
    mavenCentral()
}

dependencies {
    compile group: 'com.google.code.gson', name: 'gson', version: '2.8.6'

}
```

## 参考

[来自 Gradle 开发团队的 Gradle 入门教程](https://www.bilibili.com/video/av70568380)
