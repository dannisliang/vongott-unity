---
layout: post
title: "Interfaces, game events and upgrade effects"
description: ""
category: 
tags: [updates]
---
{% include JB/setup %}

{% capture img_path %}{{ BASE_PATH }}/images/posts/{{ page.date | date: "%Y-%m-%d" }}_{% endcapture %}

More essential gameplay additions

<!--more-->

Aside from the usual incremental improvements to the game logic and the editor, there are a few noteworthy additions in the latest build.

### Biological upgrades
As mentioned in the design doc, biological upgrades are a replacement of skill points. They are physically picked up and consumed. In this case, we have a lockpicking skill upgrade, which very basically corresponds to the difficulty level of the lock on the doors.
<a href="{{ img_path }}biological_upgrades.jpg"><img src="{{ img_path }}biological_upgrades.jpg" /></a>
<a href="{{ img_path }}biological_upgrades_menu.jpg"><img src="{{ img_path }}biological_upgrades_menu.jpg" /></a>
<a href="{{ img_path }}lockpick.jpg"><img src="{{ img_path }}lockpick.jpg" /></a>

### Mechanical upgrades
I have started implementing some of the upgrades in the design doc. These are mainly demonstrations of what's possible, but as of now we have slowing down time, health regeneration, projectile shield, speed enhancement and x-ray vision.
<a href="{{ img_path }}lockpick.jpg"><img src="{{ img_path }}shield.jpg" /></a>

### Interfaces
There are now a variety of interfaces to manipulate and observe the game world with, including books, paper notes, terminals and computers. It might be a good idea to add smartphones to that list later.
<a href="{{ img_path }}computer.jpg"><img src="{{ img_path }}computer.jpg" /></a>
<a href="{{ img_path }}computer_loggedin.jpg"><img src="{{ img_path }}computer_loggedin.jpg" /></a>
<a href="{{ img_path }}terminal.jpg"><img src="{{ img_path }}terminal.jpg" /></a>
