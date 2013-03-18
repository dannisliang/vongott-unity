Design document for Von Gott
====

# Production
## Tools
The game will be produced in Unity using various additional libraries such as NGUI.
It will be written in JavaScript

## Team
The team consists of me, Jeppe Zapp. Yay!

# Features
## Flags
The game will have a flag system that keeps track of player actions in order to make consequences for them later in the game. The flags will be nested as (chapter)/(map name)/(identifier)

## Economy
Weapons, provisions and digital mods can be purchased in shops. The currency is called 'moneys'. Moneys can be found on incapacitated people, in locked containers that require lockpicking and in cash points.

## Mods
Players can obtain mechanical and digital mods to improve their abilities. Mechanical mods are stat improvements that can be obtained by completing main quests, and digital mods are skills that can be bought or earned via sidequests.

### Mechinal
- Legs:  
	- Kicking damage  
	- Running speed
	- Jumping height
- Arms:  
	- Punching damage  
	- Swimming speed
- Back:   
	- Fall damage reduction
	- Inventory capacity

### Digital
- Eyes:  
	- Auto aim
- Hands:  
	- Lock picking
	- Reload speed
	- Punch combo tier 1
	- Punch combo tier 2
	- Punch combo tier 3
- Feet:
	- Run up walls
	- Kick combo tier 1
	- Kick combo tier 2
	- Kick combo tier 3
- Skull: 
	- Hacking
- Chest:
	- Cloak

## Conversations
During conversations, the HUD will disappear and black bars come up, the camera zooms in a little. There will be an extensive library of short speaking animations which can be applied to any character. The player can press [enter] to proceed to the next line at any time.

Conversations can happen between NPCs as well.

## Debug menu
- Flag editor

# Gameplay
## Genre
- Isometric view
- Camera in perspactive mode but with the perspective setting almost orthographical.
- Action RPG

## Controls
Optimised for keyboard+mouse and gamepad

### Melee attack
- Various combat animations based on Oni and Tekken
- The damage dealt during melee attacks is influenced by mechanical mods
- The range of combos are influenced by digital mods

### Weapons
- The player can pick up any weapon within the game and use it
- Additional weapons can be bought from shops
- Reload speed is affected by digital mods

### Move and look
- Keyboard+mouse: WASD and aim with mouse like the old GTA games and The Guardian of Light
- Gamepad: Similar to Guardian of Light
- Jumping into specially scripted walls will cause a wall run, a wall flip or a wall slide depending on an which point during the jump the player reaches the wall
	- above 30%: fall
	- below 30%: wall flip
	- below 15%: wall run
- Sneak: In sneak mode, the animation will be cartoony
- Grab: Specially scripted ledges can be grabbed, shimmied on and traversed.

# User interface
## Menu system
The menu system is completely circular. Inspired by mechanical aesthetics of The Matrix, it is an attempt to do better what they tried to accomplish in Deus Ex Invisible War. On clicking a menu item in the outer rim, the cirlce expands and reveals a new page underneath. Halo lights will indicate the active circle.

## Heads Up Display
Displays health and energy in the top right and weapons in the bottom. The weapons interface only pops up if activated via scroll wheel or number keys.

## Enemies
Enemies will walk patrol routes and have a fairly wide vision cone. 

They will have 3 states: casual, cautious and aggressive. Cautious leads to aggressive, if they spot the player. No NPCs outside of the game screen should be able to see the player, unless they're already chasing him.

If they spot dead bodies, they will become cautious.

# Setting
## Visuals
- Cyberpunk theme

## Story
- In line with the original Deus Ex game
- Cameos from original characters, but with altered names

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
