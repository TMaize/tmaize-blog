---
layout: mypost
title:  友情链接
---
<ul>
    {% for link in site.data.links %}
    <li>
        <p><a href="{{ link.url }}" title="{{ link.title }}" target="_blank">{{ link.content }}</a></p>
        <p>{{ link.desc }}</p>
    </li>
    {% endfor %}
</ul>