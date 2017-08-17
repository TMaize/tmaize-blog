---
layout: mypost
title: Test
---

<div id="links">
	<ul>
		{% for link in site.data.links %}
			<li>
				<a href="{{ link.url }}" title="{{ link.url }}" target="_blank">{{ link.name }}</a>
				<span>&nbsp;{{ link.description }}</span>
			</li>
		{% endfor %}
	</ul>
</div>