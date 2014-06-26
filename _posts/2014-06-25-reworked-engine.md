---
layout: blog-post
title: "Reworked Engine"
---

{% capture img %}{{ site.url }}/images/posts/{{ page.date | date: "%Y-%m-%d" }}_{% endcapture %}

The whole game engine has received a makeover, built almost from the ground up using an entirely different plug-in based structure. Here are some of the highlights.

### Editor
The ad-hoc editor has now been replaced by a general-purpose, extensible tool I call OpenEd. It has many more features than the old one, and adding more is much easier than it would have previously been.

![OpenEd home screen]({{ img }}new_editor.jpg)

Designing quests is a more detailed procedure at this point, as it is now largely based on objectives, which in hindsight should have occurred to me in the beginning.

![Quest editor]({{ img }}quest_editor.jpg)

Both quests and conversations are now part of a plugin called OpenConvo, a completely re-written system with much fancier editors.

![Node-based conversation editor]({{ img }}conversation_editor.jpg)

It is now also possible to add scripts to objects in the editor. The scripting language of choice is Lua.

![Lua scripting]({{ img }}script_editor.jpg)

Creating custom inspectors for all the different object classes is very easy now, even moreso than the ones built into Unity.

![Custom inspectors]({{ img }}custom_inspector.jpg)

### La Guardia Air Terminal

Since the focus has been on reworking the engine lately, the terminal map has only seen a few, yet vital improvements. They are all concerned with the flow of gameplay.

![More decay]({{ img }}air_terminal_0.jpg)

![Jumping and crouching]({{ img }}air_terminal_1.jpg)

![Destructibles]({{ img }}air_terminal_2.jpg)

### Gameplay

Computers can now use events based on Lua scripting.

![Computer events]({{ img }}computer_events.jpg)

The conversations now support audio as well as integration with the quest system.

![Conversation audio]({{ img }}conversations.jpg)

I added a flashlight too :)

![Flashlight]({{ img }}flashlight.jpg)
