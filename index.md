---
layout: page
title: Welcome!
tagline: Welcome!
---
{% include JB/setup %}

<img src="{{ BASE_PATH }}/assets/themes/vongott/images/logo/300x400.png" id="frontpage-logo" />

Get the latest build [here](https://docs.google.com/file/d/0B9DnayqgbYmgSG1FUFVLYkZiMGM/edit?usp=sharing)

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
    <li><span>{{ post.date | date_to_string }}</span> &raquo; <a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a></li>
  {% endfor %}
</ul>

