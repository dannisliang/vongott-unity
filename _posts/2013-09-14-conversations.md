---
layout: blog-post
title: "Conversations"
---
{% capture img %}{{site.url}}/images/posts/{{ page.date | date: "%Y-%m-%d" }}_{% endcapture %}

### Conversations and conditional behaviour
I've added more conditional functionality to the conversations editor and added an action after every line. This allows you to make an actor run away, attack or follow a path created in the level editor.
![Conversations]({{ img }}conversations_editor.jpg)

I've added some generic characters to talk to in the La Guardia map. So far they string together a fairly coherent scenario.
![Conversations]({{ img }}conversations_ingame.jpg)
