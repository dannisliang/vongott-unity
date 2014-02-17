---
layout: submenu
title: Welcome
---

## Latest builds
[Linux (x86)](https://github.com/mrzapp/vongott/raw/master/build/vongott_linux_x86.zip)  
[Windows (x86)] (https://github.com/mrzapp/vongott/raw/master/build/vongott_win_x86.zip)

## What?
This game is set in the Deus Ex universe, so a cyberpunk not-so-distant future. The point of this game is to explore a different viewpoint of the events in Deus Ex, and to expand the story in another direction entirely. You could basically call this game elaborate fan fiction. The intention is to release it in chapters. 

## Why?
[This](http://www.youtube.com/watch?v=p1b8k469DbY#at=188) aptly named catastrophe is why. And other reasons. Anyway, the point is that we don't like anything new.

## How?
1. Create an action RPG framework from scratch
2. Create a capable SDK to take advantage of this framework
3. Create tons of generic assets
4. Write the first chapter and create the required assets
5. Build the game with the SDK
6. Release the SDK and the game for free

## What's new?
<ul class="posts">
  {% for post in site.posts %}
    <li><span>{{ post.date | date_to_string }}</span> &raquo; <a href=".{{ post.url }}">{{ post.title }}</a></li>
  {% endfor %}
</ul>

