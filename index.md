---
layout: default
title: News
index: 0
postlist: true
---

{% for post in site.posts limit:1 %}
<h2>{{ post.title }}</h2>
{% if post.author %}
{% if post.author_url %}
<p>Written by <a href="{{ post.author_url }}">{{ post.author }}</a></p>
{% else %}
<p>Written by {{ post.author }}</p>
{% endif %}
{% endif %}

{{ post.content }}
{% endfor %}
