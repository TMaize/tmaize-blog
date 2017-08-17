---
layout: mypost
title: Test
---

{% for link in site.data.links %}
+ [{{ link.name }}]({{ link.url }})
{% endfor %}
