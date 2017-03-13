---
layout: null
---
var data ={
"code" : 0 ,
"baseurl":"{{ site.baseurl }}",
"categoriesurl":"{{ site.categoriesurl }}",
"data" : [
{% for post in site.posts %}
{
"title" : "{{ post.title }}",
"time" : "{{ post.date | date: "%Y/%m/%d" }}",
"categories":"{% for cat in post.categories %}{{ cat }}{% if forloop.rindex != 1 %}@{% endif %}{% endfor %}",
"url" : "{{ post.url }}"
}
{% if forloop.rindex != 1  %}
,
{% endif %}
{% endfor %}
]
};

var baseurl;
var categoriesurl;
var text_input;
var searchlist;
var beforeinput="";

function initsearch() {
    baseurl = data.baseurl;
    categoriesurl = data.categoriesurl;
    text_input = document.getElementById("text-input");
    searchlist = document.getElementById("searchlist");
    text_input.addEventListener("input",inputchange);
}

function inputchange() {
    var currentinput = text_input.value;

    //输入有变化，重新检索
    if (beforeinput!=currentinput.trim()){
        beforeinput = currentinput.trim();
        if (beforeinput!=""){
            searchlist.innerHTML="";
            var dataarray = data.data;
            for (i = 0;i<dataarray.length;i++){
                var keywords = beforeinput.split(" ");
                for (var j = 0;j<keywords.length;j++){
                    if (dataarray[i].time.match(keywords[j])){
                        addnode(dataarray[i]);
                        break;
                    }
                    if (dataarray[i].title.toLocaleUpperCase().match(keywords[j].toLocaleUpperCase())){
                        addnode(dataarray[i]);
                        break;
                    }
                    if (dataarray[i].categories.toLocaleUpperCase().match(keywords[j].toLocaleUpperCase())){
                        addnode(dataarray[i]);
                        break;
                    }
                }
            }
        }else{
            searchlist.innerHTML="";
        }
    }
}

function addnode(json_p) {
    var li = document.createElement('li');
    var node = "<time>"+json_p.time+"&nbsp;</time>";
    node+="<a href=\""+baseurl+json_p.url+"\">"+json_p.title+"</a>";
    var arr = json_p.categories.split("@");
    for (var j = 0;j<arr.length;j++){
        node+="<span>&nbsp;<a href=\""+categoriesurl+"#"+arr[j]+"\">"+arr[j]+"</a></span>";
    }
    li.innerHTML = node;
    searchlist.appendChild(li);
}

if (document.all){
    window.attachEvent("onload",initsearch);
}
else{
    window.addEventListener("load",initsearch,false);
}