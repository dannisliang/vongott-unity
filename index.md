---
layout: blog-post
title: News
index: 0
postlist: true
---

{% for post in site.posts limit:1 %}
<h2>{{ post.title }}</h2>
{{ post.content }}
{% endfor %}
