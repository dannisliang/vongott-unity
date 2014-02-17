---
layout: submenu
title: "Conversations"
tags: [updates]
---
{% capture img_path %}{{ site.url }}/images/posts/{{ page.date | date: "%Y-%m-%d" }}_{% endcapture %}

Conversations logic has seen some major improvements

<!--more-->

### Conversations and conditional behaviour
I've added more conditional functionality to the conversations editor and added an action after every line. This allows you to make an actor run away, attack or follow a path created in the level editor.
<a href="{{ img_path }}conversations_editor.jpg"><img src="{{ img_path }}conversations_editor.jpg" /></a>

I've added some generic characters to talk to in the La Guardia map. So far they string together a fairly coherent scenario.
<a href="{{ img_path }}conversations_ingame.jpg"><img src="{{ img_path }}conversations_ingame.jpg" /></a>
