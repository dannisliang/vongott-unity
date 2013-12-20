---
layout: page
title : Tutorials
header : Tutorials
tagline : These are all the tutorials on The Vongott Chronicles 
group: navigation
---
{% include JB/setup %}

**NOTE:** This is outdated. Essential functionality has to be rewritten and more features need to be added before an updated tutorial can be made.
 
## Tutorial 1: Creating a map
In this brief tutorial, we will be looking at how to set up a very simple map. We will be placing and manipulating prefabs (pre-fabricated objects) and surfaces and assign materials to them.

### Overview
Below is the screen that starts off any session in the Vongott editor. At the top, you have your basic file/edit/view operations, an "add" menu and a selection of editors for conversations, quests and so on. You'll also find a help button for a quick overview of the keybindings necessary to use the editor. Off to the left is the **ASSET BROWSER**, from which we can look through all prefabs, items and actors.

<img class="tutorial_image" src="{{ BASE_PATH }}/images/tutorials/1/0.jpg" />

### Building the level
Let's start off by making a surface. Go to *Add > Surface*. This will be our floor.

<img class="tutorial_image" src="{{ BASE_PATH }}/images/tutorials/1/1.jpg" />

When selected, a surface has four corner handles, a remove button and four add buttons. The **INSPECTOR** on the right lets you modify the surface by flipping it, changing the tiling size and changing the material.

<img class="tutorial_image" src="{{ BASE_PATH }}/images/tutorials/1/2.jpg" />

Let's get a better view of things. Press `NUMPAD 7` to get a **TOP VIEW**. You can go to the opposite side of the object by holding down `CONTROL` when you change view like this. Note that this will only work if an object is selected. Use the corner handles to change the shape of the surface to your liking. You'll notice that when you click the corners, you go into **GRAB MODE**. There is a mode for grabbing objects, one for scaling and one for rotating. In all of these modes, you can press `X`, `Y` or `Z` at any time to lock the object you're dragging to an axis.

<img class="tutorial_image" src="{{ BASE_PATH }}/images/tutorials/1/3.jpg" />

Let's turn the camera back again by clicking and dragging with the `RIGHT MOUSE` button. If sometimes you find that you're stuck or disoriented, use `NUMPAD 3` for **RIGHT VIEW**, `NUMPAD 1` for **FRONT VIEW**, and if all goes wrong, press `NUMPAD .` to return the camera to the center of the map. When you rotate the camera with `RIGHT MOUSE`, you automatically pivot around the point under your mouse cursor. At any time, hold down `ALT` to look around freely instead. You can also click and drag with `MIDDLE MOUSE` button to pan the view and `SCROLL WHEEL` to zoom. Now we'll change the material of our floor to something more floor-like. In the **INSPECTOR**, click the button with the title *Source* in the *Material* section and pick the *wood_boathouse* material.

<img class="tutorial_image" src="{{ BASE_PATH }}/images/tutorials/1/4.jpg" />

What you'll get might be disappointing at first, as there is still no light in our map, but we'll get there, I promise.

<img class="tutorial_image" src="{{ BASE_PATH }}/images/tutorials/1/5.jpg" />

Now, click the P on the left to open the **PREFABS** drawer. Select a prefab to place, for instance a corner. Note that there are 2 corners, one for inside and one for outside. As you might notice, I chose the wrong one for the screenshot below (oops), so pick the *wall_basic_corner_270* instead.

<img class="tutorial_image" src="{{ BASE_PATH }}/images/tutorials/1/6.jpg" />

Press `G` to enter grab mode, and then `X` to lock the movement to the X axis. Use the mouse to position the object and then press `LEFT MOUSE` button to place it.

<img class="tutorial_image" src="{{ BASE_PATH }}/images/tutorials/1/7.jpg" />

If your object doesn't face the right way, press `R` to rotate it, lock the axis to `Y` and rotate with the `SCROLL WHEEL`. You can hold down `SHIFT` to make it rotate slower and `CONTROL` to make it rotate faster.

<img class="tutorial_image" src="{{ BASE_PATH }}/images/tutorials/1/8.jpg" />

You can go back to **TOP VIEW** with `NUMPAD 7` and adjust the object if necessary.

<img class="tutorial_image" src="{{ BASE_PATH }}/images/tutorials/1/9.jpg" />

Now we just duplicate the corner object by pressing `D` and moving and rotating the duplicates.

<img class="tutorial_image" src="{{ BASE_PATH }}/images/tutorials/1/10.jpg" />

Let's add a center wall piece now. You could place a new one from the **ASSET BROWSER**, but that would mean rotating and placing it again. This time, let's make a duplicate of the lower-left corner, place it to the right of the original, select the *wall_basic_center* object and click *Replace* instead.

<img class="tutorial_image" src="{{ BASE_PATH }}/images/tutorials/1/11.jpg" />

Press `S` to enter **SCALE MDOE** and scale the wall to fit with the scroll wheel. Remember that you can adjust the scaling increments with `SHIFT` and `CONTROL` here as well.

<img class="tutorial_image" src="{{ BASE_PATH }}/images/tutorials/1/12.jpg" />

Now make 3 duplicates and rotate them appropriately.

<img class="tutorial_image" src="{{ BASE_PATH }}/images/tutorials/1/13.jpg" />

Rotating the camera back down, you'll see that the walls are not too festive to look at. Let's change that.

<img class="tutorial_image" src="{{ BASE_PATH }}/images/tutorials/1/14.jpg" />

Again, click the *Source* button under *Material* in the **INSPECTOR** and this time select the *brick_grey_smooth*. I know these names aren't exactly accurate at this point, but we're in early alpha, OK?

<img class="tutorial_image" src="{{ BASE_PATH }}/images/tutorials/1/15.jpg" />

And voila! That is one handsome wall. Maybe not, but we'll get there.

<img class="tutorial_image" src="{{ BASE_PATH }}/images/tutorials/1/16.jpg" />

Select the corner next to it. To assign the material this time, instead of clicking the *Source* button, click the one labeled *Picker*

<img class="tutorial_image" src="{{ BASE_PATH }}/images/tutorials/1/17.jpg" />

Click the wall that we already assigned a material to and BAM! We just copied that wall's material onto our selected object. Let's do that for the other walls too.

<img class="tutorial_image" src="{{ BASE_PATH }}/images/tutorials/1/18.jpg" />

Now let's make a door opening in this room. Select a wall and press `S` to enter **SCALE MODE** and scale it down a bit.

<img class="tutorial_image" src="{{ BASE_PATH }}/images/tutorials/1/19.jpg" />

Duplicate-replace or place the *wall_basic_door_single* into the map.

<img class="tutorial_image" src="{{ BASE_PATH }}/images/tutorials/1/20.jpg" />

Now, from the **ASSET BROWSER** select the *Decor* category from the pop-up menu and place the *decor_light_bulkhead* prefab into the map.

<img class="tutorial_image" src="{{ BASE_PATH }}/images/tutorials/1/21.jpg" />

Adjust the light to fit onto the wall, and make a duplicate of it. As you might notice, something's off about the lighting. That's because we're currently in **ORTHOGRAPHIC VIEW**, which means that our camera doesn't show perspective. Press `NUMPAD 5` to go into **PERSPECTIVE VIEW**.

<img class="tutorial_image" src="{{ BASE_PATH }}/images/tutorials/1/22.jpg" />

There we go.

<img class="tutorial_image" src="{{ BASE_PATH }}/images/tutorials/1/23.jpg" />

Now go to *Add > SpawnPoint* to place the player's start location in the map.

<img class="tutorial_image" src="{{ BASE_PATH }}/images/tutorials/1/24.jpg" />

Let's adjust the floor material a bit before we wrap up. Select the floor and adjust the *Tiling* to your liking.

<img class="tutorial_image" src="{{ BASE_PATH }}/images/tutorials/1/25.jpg" />

And that's it for this introduction to the Vongott editor! Go to *File > Save*, give your map a filename and save it. In the game, we will be using the format *chapter-scene_name_of_map*. Once saved, go to *File > Exit*, click *Load* and select your map to see the fruits of your labour.

I should probably add a *Play* button in the editor, but there were a few issues with that the last time I tried it. I'll get it done, though.

The next tutorial will be about placing actors and using flags to create conversations.
