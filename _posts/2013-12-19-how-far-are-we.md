---
layout: blog-post
title: "How far are we?"
---
{% capture img %}{{site.url}}/images/posts/{{ page.date | date: "%Y-%m-%d" }}_{% endcapture %}

### Editor
The editor is shaping up to be an all-round capable tool for stringing together level geometry, prefabs, events, actors and items. An important thing to mention is that I have completely dropped trying to weave mesh and do boolean operations within the editor itself, as it is simply too big a mouthful for now. There are a few proprietary plugins available for Unity to accomplish this, I invested in the popular [GameDraw](http://u3d.as/content/mixed-dimensions/game-draw/2Ey), and while it does perform admirably, it's just not at all good enough. I've written an .obj importer instead, so static level geometry can be created in third party 3d software, which typically is much more capable of such things.
![Overview]({{ img }}overview.jpg)

The conversation editor got a major overhaul and is now a node editor instead. This makes for some very flexible conversation possibilities.
![Conversation tree]({{ img }}convotree.jpg)

Other sub-editors are available as well for events, quests and flags
![Quests]({{ img }}quests.jpg)

NavMesh baking is now possible courtesy of the [OpenPath](https://github.com/mrzapp/openpath) plugin I have been developing
![Pathfinding]({{ img }}pathfinding.jpg)

Every type of actor and item has its own inspector properties, and more are added as needed
![Properties]({{ img }}properties.jpg)

### Game
The most basic interfaces are nearing completion, including the inventory, upgrade management and quest logging. Game events are still under heavy development, but are currently capable of triggering AI behaviour, transactions, quest completions and setting flags.
![Inventory]({{ img }}inventory.jpg)

Interactive objects, apart from items and upgrades, so far include computers, sticky notes, books, keypads and terminals for controlling surveillance cameras.
![Iterfaces]({{ img }}interfaces.jpg)

Conversations are going rather swimmingly thanks to the new node editor.
![Conversations]({{ img }}convos.jpg)

The game still doesn't look like much, but with a few [borrowed assets](http://www.moddb.com/mods/new-vision) it's easy to imagine what the engine is currently capable of.
![View]({{ img }}view.jpg)

### UI
As you might notice from the inventory screencap above, I have moved away from the [circular UI paradigm](http://jeppezapp.com/vongott/2013/08/19/ui-paradigm-and-upgrades.html) that I was so confident in. I have to admit, even though it could end up looking cool, the interaction feels like a children's game. It's just not meant to be :)

### Overall progress
I have recently been focusing on rewriting my GUI framework [OpenGUI](https://jeppezapp.com/opengui), but I am starting to move back towards core game development. Engine-wise, everything is moving along somewhat desirably, but as far as story and art assets go, we have almost nothing yet. It will catch up later though, it's mainly an issue of timing. I am still fairly confident that this project will be finished, even though it is a mountain of challenges.
