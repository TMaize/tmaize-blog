---
layout: mypost
title: Visual Studio Code 自定义用户代码片段
categories: [小技巧]
---
Visual Studio Code不但跨平台，还有良好的扩展性。用户可以自定义代码块方便开发

1. 快捷键F1 输入`Snippets`,选择打开用户代码段

2. 选择一种语言，以html为例,显示如下

    ```json
    {
    /*
        // Example:
        "Print to console": {
            "prefix": "log",
            "body": [
                "console.log('$1');",
                "$2"
            ],
            "description": "Log output to console"
        }
    */
    }
    ```

3. 语法介绍

    prefix:这个参数是使用代码段的快捷入口,比如这里的log在使用时输入log会有智能感知.

    body:这个是代码段的主体.需要设置的代码放在这里,字符串间换行的话使用\r\n换行符隔开.注意如果值里包含特殊字符需要进行转义.多行语句的以,隔开

    $1:这个为光标的所在位置.

    $2:使用这个参数后会光标的下一位置将会另起一行,按tab键可进行快速切换,还可以有$3,$4,$5.....

    ${id} 和 ${id:label} 和 ${1:label} 等代表同一个变量！

    description:代码段描述,在使用智能感知时的描述

4. 编辑保存

    ```json
    {
        "Blank Html": {
            "prefix": "init",
            "body": [
                "<!DOCTYPE html>",
                "<html>",
                "\t<head>",
                "\t\t<title>Hello World</title>",
                "\t\t<meta http-equiv=\"content-type\" content=\"text/html; charset=utf-8\">",
                "\t\t<link rel=\"stylesheet\" href=\"*.css\">",
                "\t\t<script type=\"text/javascript\" src=\"*.js\"> </script>",
                "\t</head>",
                "\t<body>",
                "\t\t<!-- Code Here $1 -->",
                "\t</body>",
                "</html>"
            ],
            "description": "插入一段空白的html模版"
        },
        "Canvas": {
            "prefix": "canvas",
            "body": [
                "<canvas id=\"$1\" width=\"300px\" height=\"150px\"></canvas>"
            ],
            "description": "插入一行canvas"
        }
    }
    ```

5. 效果演示

![演示图](01.gif)

