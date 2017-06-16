function articleAnimate(){
    var oldCalssName=[];
    var uls =  document.getElementById("articlelist").getElementsByTagName("ul");
    for(var i=0;i<uls.length;i++){
        oldCalssName[i]=uls[i].className;
        uls[i].className=oldCalssName[i]+"animated fadeInLeft";
    }
    setTimeout(function(){
        for(var i=0;i<uls.length;i++){
            uls[i].className=oldCalssName[i];
        }
    },1000);
}

if (document.all){
    window.attachEvent("onload",articleAnimate);
	
}
else{
    window.addEventListener("load",articleAnimate,false);
}