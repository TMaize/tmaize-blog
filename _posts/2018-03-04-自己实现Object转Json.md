---
layout: mypost
title: 自己实现Object转Json
categories: [Java]
---

之前公司里写项目，前台需要用到ajax请求json数据

但是后台方面禁止添加额外的jar，所以没办法只能自己写一个工具类

还好是生成json而不是解析json，用递归实现起来应该不难

## 类型转换的坑

Integer[] => Object => Object[]的转换过程是没有问题

但是int[] => Object => Object[]会出错，基本上所有的基本类型的数组这转换都会出问题

解决方法是重新构建Object[]，把每一项通过反射拿到再放进去

还要注意[][]...多维数组的生成

```
public static Object[] fmtArrayToObjectArray(Object obj) {
    int length = Array.getLength(obj);
    Object[] o = new Object[length];
    for (int i = 0; i < o.length; i++) {
        if (Array.get(obj, i) == null) {
            o[i] = null;
        } else if (Array.get(obj, i).getClass().isArray()) {
            //多维数组
            o[i] = fmtArrayToObjectArray(Array.get(obj, i));
        } else {
            o[i] = Array.get(obj, i);
        }
    }
    return o;
}
```

## 反射获取属性的坑

要获取定义了get方法的属性，但是要注意到有些是通过继承获得的

```
/**
 * 获取一个类自身和继承获得的所有Field
 * 
 * @param obj
 * @return
 */
private static List<Field> listAllField(Object obj) {
   List<Field> resultList = new ArrayList<Field>();
    Class<?> clazz = obj.getClass();
    while (clazz != null) {
        for (Field field : clazz.getDeclaredFields()) {
            resultList.add(field);
        }
        clazz = clazz.getSuperclass();
    }
    return resultList;
}
```


```
/**
 * 通过反射执行对象的get方法
 * 
 * @param name
 * @param obj
 * @return
 */
private static Object invokeGet(String name, Object obj) {
    String methodName = "get" + name.substring(0, 1).toUpperCase() + name.substring(1);
    Class<?> clazz = obj.getClass();
    Object result = null;
    try {
        result = clazz.getMethod(methodName).invoke(obj);
    } catch (Exception e) {
        result = null;
    }
    return result;
}
```

## 转换的代码

```
public static String jsonGenerater(Object value) {

    // 不处理null
    boolean ignoreNullValue = true;

    // 日期的格式
    String datePattern = "yyyy/MM/dd HH:mm:ss";

    // null
    if (value == null) {
        if (ignoreNullValue) {
            return "";
        }
        return "null";
    }

	// 数值,布尔
    if (value instanceof Byte || value instanceof Integer || value instanceof Float || value instanceof Long || value instanceof Boolean) {
        return String.valueOf(value);
    }

    // 字符串
    if (value instanceof String) {
        String v = (String) value;
        // 注意转义问题
        return "\"" + v.replace("\n", "\\n").replace("\"", "\\\"") + "\"";
    }

    // 日期
    if (value instanceof Date) {
        SimpleDateFormat sdf = new SimpleDateFormat(datePattern);
        String result = null;
        try {
            result = sdf.format(value);
        } catch (Exception e) {
            result = jsonGenerater(e.getMessage());
        }
        return jsonGenerater(result);
    }

    // 数组
    if (value.getClass().isArray()) {
        StringBuilder sb = new StringBuilder("[");
        Object[] arr = fmtArrayToObjectArray(value);
        for (int i = 0; i < arr.length; i++) {
            sb.append(jsonGenerater(arr[i]) + ",");
        }
        if (sb.charAt(sb.length() - 1) == ',') {
            sb.deleteCharAt(sb.length() - 1);
        }
        sb.append("]");
        return sb.toString();
    }

    // 列表
    if (value instanceof List) {
        StringBuilder sb = new StringBuilder("[");
        List<?> list = (List<?>) value;
        for (int i = 0; i < list.size(); i++) {
            sb.append(jsonGenerater(list.get(i)) + ",");
        }
        if (sb.charAt(sb.length() - 1) == ',') {
            sb.deleteCharAt(sb.length() - 1);
        }
        sb.append("]");
        return sb.toString();
    }

    // 字典
    if (value instanceof Map) {
        StringBuilder sb = new StringBuilder("{");
        Map<?, ?> map = (Map<?, ?>) value;
        Iterator<?> entries = map.entrySet().iterator();
        while (entries.hasNext()) {
            Map.Entry<?, ?> entry = (Entry<?, ?>) entries.next();
            if (ignoreNullValue && entry.getValue() == null) {
                continue;
            }
            sb.append("\"" + entry.getKey().toString() + "\":" + jsonGenerater(entry.getValue()) + ",");
        }
        if (sb.charAt(sb.length() - 1) == ',') {
            sb.deleteCharAt(sb.length() - 1);
        }
        sb.append("}");
        return sb.toString();
    }

    // 在此之前添加其他类型的处理规则

    // 到这里基本就是自定义类型了
    StringBuilder sb = new StringBuilder("{");
    List<Field> list = listAllField(value);

    for (int i = 0; i < list.size(); i++) {
        String fName = list.get(i).getName();
        Object rflectValue = invokeGet(fName, value);

        if (ignoreNullValue && rflectValue == null) {
            continue;
        }
        sb.append("\"" + fName + "\":" + jsonGenerater(rflectValue) + ",");
    }
    if (sb.charAt(sb.length() - 1) == ',') {
        sb.deleteCharAt(sb.length() - 1);
    }
    sb.append("}");
    return sb.toString();
}
```

## 测试

```
public static void main(String[] args) throws Exception {
    Map<String, Object> map = new HashMap<String, Object>();
    map.put("date", new Date());
    map.put("string", "123 abc \" 123\n789");
    int[][] arr = { { 1, 2 }, { 3, 4 } };
    map.put("arr", arr);
    map.put("null", null);
    User u = new User();
    u.setAge(18);
    u.setName("张三");
    map.put("user", u);
    try {
        System.out.println(jsonGenerater(map));
    } catch (Exception e) {
        System.out.println("{\"error\":" + jsonGenerater(e.toString()) + "}");
    }
}
```

输出

没毛病

```
{"date":"2018/03/04 16:00:17","arr":[[1,2],[3,4]],"string":"123 abc \" 123\n789","user":{"name":"张三","age":18}}
```