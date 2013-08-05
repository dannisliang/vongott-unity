Design document for The Vongott Chronicles
====
# Motivation
There are several good reasons for creating a game like this.

## Community
By developing the game not inside Unity, but through an SDK, we are enabling anyone who wishes to participate in the project to do so. This is a mentality that seems to be more or less lost on modern games, even in the indie community. Several old Unreal Engine and Id Tech games would release with a community SDK and as a result are still alive and kicking today, The Nameless Mod for Deus Ex being a prime example. As we realise doing a full game with an SDK by ourselves is a bit of a stretch, we will instead develop the first chapter, so about an hour of gameplay, and then encourage the players to participate any way they feel like in creating the next. It's of course a bit of a gamble, as we have to effectively obtain and maintain the attention of a community, especially since mobile gaming has effectively reduced the attention span of most people to that of a squirrel, but as long as we target the right audience, this project should have a chance. And furthermore..

## Open Source
..doing an open source game of this size is beneficial to anyone who participates, as it could act as an entry to the participant's CV, whether that person might be a programmer, modeller or level designer, as it grants anyone the opportunity to have a close look at the work.

## Deus Ex is just goddamn awesome
By far the most obvious reason for creating this project is of course the Deus Ex obsession. Rather than praising the original story, though, we want to focus on a different branch of it in the same universe. We want to poke some fun at the original game while trying to recreate the ambience and feel of it. The word "love letter" is thrown around a lot in gaming, but this is definitely one.


# Production
## Tools
The game will be produced in Unity using as few additional libraries as possible. Some might be needed for heavy computations such as AI, though. The project will be written in UnityScript. There will be a community SDK for constructing levels.

# Features
## Flags
The game will have a flag system that keeps track of player actions in order to make consequences for them later in the game.

## Economy
Weapons, provisions and biological upgrades can be purchased in shops. The currency is called 'credits'. Credits can be found on incapacitated people, in locked containers that require lockpicking and in cash points.

## Upgrades
Players can obtain mechanical and biological upgrades to improve their abilities. Upgrades are physical and mental improvements that can be found like items in the game.

## Conversations
During conversations, the HUD will disappear and black bars come up, the camera zooms in a little. There will be an extensive library of short speaking animations which can be applied to any character. The player can press [enter] to proceed to the next line at any time.

Conversations can happen between NPCs as well.

## Debug menu
There will be no debug menu, as switching between the editor and the game is pretty seamless.

# Gameplay
## Genre
- Shoulder view
- Action RPG

## Controls
- Optimised for keyboard+mouse and gamepad

### Melee attack
- Various combat animations based on Oni and Tekken
- The damage dealt during melee attacks is influenced by mechanical mods
- All melee attacks are meant to be regular punches. No Bruce Lee combos.

### Weapons
- The player can pick up any weapon within the game and use it
- Additional weapons can be bought from shops
- Reload speed is affected by biological mods

### Move and look
- Keyboard+mouse: WASD and aim with mouse
- Gamepad
- Jumping into specially scripted walls will cause a wall run, a wall flip or a wall slide depending on an which point during the jump the player reaches the wall
	- above 30%: fall
	- below 30%: wall flip
	- below 15%: wall run
- Sneak: In sneak mode, the animation will be cartoony
- Grab: Specially scripted ledges can be grabbed, shimmied on and traversed.

# User interface
## Menu system
The menu system is completely circular. Inspired by mechanical aesthetics of The Matrix, it is an attempt to do better what they tried to accomplish in Deus Ex Invisible War. On clicking a menu item in the outer rim, the circle expands and reveals a new page underneath. Halo lights will indicate the active circle.

## Heads Up Display
Displays health and energy in the top right and weapons in the bottom. The weapons interface only pops up if activated via scroll wheel or number keys.

## Enemies
Enemies will walk patrol routes and have a fairly narrow vision cone. 
They will have 3 states: calm, alert and aggressive. Alert leads to aggressive, if they spot the player.
If they spot dead bodies, they will become alert.

# Setting
## Visuals
- Cyberpunk theme

## Story
- In line with the original Deus Ex game
- Cameos from original characters, but with altered names
- Side quests related to the main plot will be available

## Musical inspiration
- Trentemøller
- Zenzile

# Distribution
## Target platforms
- Linux/Windows/Mac
- Consoles if possible

## Stores
- Steam
- HumbleBundle
- From own website
- Ubuntu Software Center
