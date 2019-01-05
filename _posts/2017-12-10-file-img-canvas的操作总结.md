---
layout: mypost
title: File Img Canvas的操作总结
categories: [前端]
---

记录下H5的FileAPI和Canvas一些操作

## 图片压缩

前端本地客户端压缩图片，兼容IOS，Android，PC、自动按需加载文件

需要lrz.all.bundle.js

github:[localResizeIMG](https://github.com/think2011/localResizeIMG)

演示地址:[localResizeIMG](http://think2011.net/localResizeIMG/test/)

使用这个插件的最大好处是解决了文件上传图片时候如果是IOS直接拍照上传会有90度旋转的毛病

使用

```
var file = this.files[0];
//设置压缩参数
lrz(file, {
    'width ': 300,
    'height': 300,
    'quality': 0.6

}).then(function (rst) {
    console.info(rst);
    //图片上传到服务器
    var data = new FormData();
    data.append('file', rst.file);
    $.ajax({
        url: 'upload',
        method: 'post',
        dataType: 'json',
        data: rst.formData,
        contentType: false,
        processData: false,
        cache: false,
        success: function (data) {
            if (data.errno == 0) {
                $('#fileView').attr('src', data.data[0]);
            } else {
                alert('上传失败');
            }
        },
        error: function () {
            alert('请求超时/异常...');
        }
    });
}).catch(function (err) {
    alert('请上传图片文件/图片处理失败')
}).always(function () {
    // 不管是成功失败，都会执行
});
```

## JS下载Blob

```
var a = document.createElement('a');
var url = window.URL.createObjectURL(blob);
var filename = 'demo.png';
a.href = url;
a.download = filename;
a.click();
```

## 本地文本读取

```
var file = this.files[0];
var reader = new FileReader();
reader.readAsText(file);
reader.onload = function (e) {
    //获得结果
    console.log(this.result);
}
```

## MD5 计算

使用JS计算文件的MD5需要spark-md5.min.js

```
calcMD5(this.files[0], function (md5) {
    console.log(md5);
});
```

封装的方法如下

```
function calcMD5(file, callback) {
    var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
    var chunkSize = 2097152;
    var chunks = Math.ceil(file.size / chunkSize);
    var currentChunk = 0;
    var spark = new SparkMD5.ArrayBuffer();
    var fileReader = new FileReader();

    fileReader.onload = function (e) {
        spark.append(e.target.result);
        currentChunk++;
        if (currentChunk < chunks) {
            loadNext();
        } else {
            callback(spark.end());
        }
    };

    fileReader.onerror = function () {
        alert('本地计算MD失败....');
    };

    function loadNext() {
        var start = currentChunk * chunkSize,
            end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;

        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
    }
    loadNext();
};
function calcMD5(file, callback) {
    var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
    var chunkSize = 2097152;
    var chunks = Math.ceil(file.size / chunkSize);
    var currentChunk = 0;
    var spark = new SparkMD5.ArrayBuffer();
    var fileReader = new FileReader();

    fileReader.onload = function (e) {
        spark.append(e.target.result);
        currentChunk++;
        if (currentChunk < chunks) {
            loadNext();
        } else {
            callback(spark.end());
        }
    };

    fileReader.onerror = function () {
        alert('本地计算MD失败....');
    };

    function loadNext() {
        var start = currentChunk * chunkSize,
            end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;

        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
    }
    loadNext();
};
```

## 文件base64编码

```
var file = this.files[0];
var reader = new FileReader();
reader.onload = function () {
    var url = reader.result;
};
//将文件读取为DataURL
reader.readAsDataURL(file);
```

## canvas,img,blob,file转换

base64可以直接放到img的src上就可以显示了，input选择的文件变成base64见 ‘文件base64编码’

img转换成canvas

```
var cvs = document.createElement('canvas');
ctx = cvs.getContext('2d');
var img = new Image();
//img.crossOrigin = '*'; //解决跨域问题，需在服务器端运行，也可为 anonymous
img.src = "1.jpg";
img.onload = function () {
    cvs.width = img.width;
    cvs.height = img.height;
    ctx.drawImage(img, 0, 0); //img转换为canvas 
    console.log(ctx);
    var base64 = cvs.toDataURL('images/png'); //注意是canvas元素才有 toDataURL 方法，同时要跑在服务器中，本地会报错

    //base64可以直接显示的
    document.getElementById('imgTest').src = base64;
}
```

```
/canvas.toBlob(callback,type,compressLevel);
//直接下载demo
canvas.toBlob(function (blob) {
    var a = document.createElement('a');
    var url = window.URL.createObjectURL(blob);
    var filename = 'demo.png';
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}, 'image/jpeg');
```

第一个参数可以是Blob对象的数组， File对象继承Blob， 所以可以传File对象； 第二个参数为新文件名； 第三个参数是一个可选的， 设置type等属性
```
var file = new File([file], new Date().getTime()+".mp4",{type:"video/mp4"});
```

## 图片剪裁

需要cropper.min.js

github:[cropper](https://github.com/fengyuanchen/cropper/)

演示地址:[cropper](http://fengyuanchen.github.io/cropper/)

```
var originImage = $('.div-imageUpload-3>img');
originImage.cropper({
    aspectRatio: 1 / 1,
    //preview: $("#preview"),//在div预览,div要设置宽高和overflow: hidden;
    strict: true, //剪裁框只能在图片中移动
    //resizable: false, //不允许改变框的大小
    //zoomable: false, //不允许通过滚轮手势等缩放图片
    movable: true, //允许移动剪裁框
    autoCrop: true, //在初始化时允许自动剪裁图片
    //modal: true,
    //responsive: true,
    //center:true,
    dragCrop: false, //不允许手动框选新的
    // checkCrossOrigin: true,
    // strict: true,
    background: true,
    crop: function (e) {
        // console.log(e.x);
        // console.log(e.y);
        // console.log(e.width);
        // console.log(e.height);
        // console.log(e.rotate);
    },
    built: function () {
        //console.log('over...');
        // var imageInfo = originImage.cropper('getImageData');
        // var bili = imageInfo.height / imageInfo.naturalHeight;
        //设置默认开始的位置和宽高
        // originImage.cropper('setCropBoxData', {
        //     left: 0,
        //     top: 0,
        //     width: 120 * bili,
        //     height: 120 * bili
        // });
    }
});

//获得剪裁结果
var canvas = originImage.cropper('getCroppedCanvas', {
    width: 120,
    height: 120,
    fillColor: '#FFFFFF'
});
```

## 使用Canvas缩放以及压缩图片

```
image object
原图x坐标
原图y坐标
原图宽度
原图高度
画布x坐标
画布y坐标
绘制图片的宽度
绘制图片的高度
ctx.drawImage(image,sx,sy,sw,sh,dx,dy,dw,dh)
```

## Canvas 操作像素点

一个颜色反转的例子

```
var fileInput = document.getElementById('fileInput');
var cvs = document.getElementById('canvas');
ctx = cvs.getContext('2d');
var buttonInput = document.getElementById('buttonInput');
var w;
var h;

fileInput.onchange = function () {
    var file = this.files[0];
    var reader = new FileReader();
    reader.onload = function () {
        var img = new Image();
        img.src = reader.result;
        img.onload = function () {
            cvs.width = w = img.width;
            cvs.height = h = img.height;
            ctx.drawImage(img, 0, 0);
        }
    };
    reader.readAsDataURL(file);
}

buttonInput.onclick = function () {
    var data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (n = 0; n < data.width * data.height; n++) {
        var index = n * 4;
        data.data[index] = 255 - data.data[index];
        data.data[index + 1] = 255 - data.data[index + 1];
        data.data[index + 2] = 255 - data.data[index + 2];
    }
    ctx.putImageData(data, 0, 0);
}
```