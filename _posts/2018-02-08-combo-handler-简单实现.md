---
layout: mypost
title: Combo Handler 简单实现
categories: [Java]
---

Web性能优化最佳实践中最重要的一条是减少HTTP请求

查看淘宝的官网会发现如下的请求

```
<script src="//g.alicdn.com/??kissy/k/6.2.4/event-custom-min.js,
kissy/k/6.2.4/event-base-min.js,kissy/k/6.2.4/io-min.js,kissy/k/6.2.4/io-extra-min.js,
kissy/k/6.2.4/io-base-min.js,kissy/k/6.2.4/promise-min.js,kissy/k/6.2.4/dom-base-min.js,
kissy/k/6.2.4/query-selector-base-min.js,kissy/k/6.2.4/dom-extra-min.js,kissy/k/6.2.4/io-form-min.js,
kissy/k/6.2.4/node-min.js,kissy/k/6.2.4/node-base-min.js,kissy/k/6.2.4/node-event-min.js,
kissy/k/6.2.4/event-dom-base-min.js,kissy/k/6.2.4/event-dom-extra-min.js,
kissy/k/6.2.4/event-gesture-min.js,kissy/k/6.2.4/event-touch-min.js,kissy/k/6.2.4/node-anim-min.js,
kissy/k/6.2.4/anim-transition-min.js,kissy/k/6.2.4/anim-base-min.js,kissy/k/6.2.4/cookie-min.js,
kissy/k/6.2.4/event-min.js,kissy/k/6.2.4/base-min.js,kissy/k/6.2.4/attribute-min.js,kissy/k/6.2.4/json-base-min.js,
kg/attr-anim/6.0.6/index-min.js,kg/xctrl/7.2.1/xctrl-kissy-min.js,sd/sufei/0.2.4/app/common/sufei-kissy.js,
kg/offline/7.0.1/index-min.js,kg/session/0.0.1/index-min.js,kg/slide/6.0.8/index-min.js,kg/straw/1.0.2/index-min.js,
kg/datalazyload/6.0.10/index-min.js,kg/route-map-http/0.0.3/index.js"></script>
```

这就是Combo Handler技术,由于css，Js这类文件合并成一个只要顺序正确，那么对html的运行是没有任何问题的

同时还可以在合并完成之后进行js/css压缩，传输的途中再进行gzip压缩，可以将性能发挥到极致

## 思路

1. 要对压缩后的文件进行缓存，一样的请求值压缩一次

2. 考虑到个小文件有时候会修改，可以通过添加标记的方式来来进行缓存替换

3. 通过Expires,Last-Modified,ETag来实现2

## 代码

只是一个简单的demo

只实现了问价合并，线程安全，速度优化

```
public class ComboTest {
	public static void main(String[] args) throws IOException, NoSuchAlgorithmException {
		Runnable myRunnable = new Runnable() {
			@Override
			public void run() {
				try {
					test();
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		};
		// 模拟请求
		for (int i = 0; i < 5; i++) {
			Thread thread = new Thread(myRunnable);
			thread.start();
		}
	}

	// 请求进入
	public static void test() throws Exception {
		String[] files = { "1.js", "2.js" };
		String outName = "";
		for (String temp : files) {
			outName += temp;
		}
		
		// 同样的请求进行唯一标识
		outName = string2MD5(outName);

		// 后缀添加版本号便于及时更新(v1应该在服务器启动时从配置中读取)
		outName = outName + "." + "v1";

		// 文件不存在进入合并方法制造合并文件，注意大量并发情况下会有多个线程进入
		File file = new File("F:", outName);
		if (!file.exists()) {
			createComboFile("F:", files, "F:", outName);
		}
		System.out.println(Thread.currentThread().getName() + "读取到：" + file.getName() + " size:" + file.length());
	}
	
	
	//合并文件，synchronized，让第一个进来的顺利完成
	public static synchronized void createComboFile(String inBasePath, String[] files, String outBasePath, String outName) throws IOException, InterruptedException {
		File f1 = new File(outBasePath, outName);
		File f2 = new File(outBasePath, outName + ".temp");
		if (f1.exists() || f2.exists()) {
			System.out.println(Thread.currentThread().getName() + "跳过创建");
			return;
		} else {
			f2.createNewFile();
			System.out.println(Thread.currentThread().getName() + "创建文件");
		}
		
		//文件合并
		FileOutputStream out = new FileOutputStream(f2);
		int len = 0;
		byte[] buf = new byte[2048];
		for (int i = 0; i < files.length; i++) {
			File p = new File(inBasePath, files[i]);
			FileInputStream fin = new FileInputStream(p);
			while ((len = fin.read(buf)) != -1) {
				out.write(buf, 0, len);
			}
			// 另起一行
			out.write("\n".getBytes());
			fin.close();
		}
		out.flush();
		out.close();
        //重命名
		f2.renameTo(f1);
	}
}
```

## 轮子

在Google Code上有一个PHP的开源项目叫Minify，它可以合并、精简、Gzip压缩和缓存JavaScript和CSS文件，实现了全套服务

目前阿里的CDN也支持这个功能

Java的方案暂时没找到