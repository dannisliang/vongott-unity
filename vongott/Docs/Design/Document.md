Design document for Von Gott
===
- [Gameplay](#gameplay)
	- [Genre](#genre)
	- [Controls](#controls)
	- [Mods system](#mods-system)
		- [Mechinal mods](#mechinal-mods)
		- [Digital mods](#digital-mods)
- [Setting](#setting)
	- [Visuals](#visuals)
	- [Story](#story)
	- [Musical inspiration](#musical-inspiration)
- [Distribution](#distribution)
	- [Target platforms](#target-platforms)
	- [Stores](#stores)

# Production
## Tools
The game will be produced in Unity using various additional libraries such as NGUI.
It will be written in ?JavaScript/Python?

## Team
The team consists of me, Jeppe Zapp. Yay!

# Gameplay
## Genre
- Isometric view
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
- Jumping onto walls will cause a wall run, a wall flip or a wall slide depending on an which point during the jump the player reaches the wall

## Mods system
Players can obtain mechanical and digital mods to improve their abilities. Mechanical mods are stat improvements that can be obtained by completing main quests, and digital mods are skills that can be bought or earned via sidequests.

### Mechinal mods
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

### Digital mods
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

# User interface
## Menu system
The menu system is completely circular. Inspired by mechanical aesthetics of The Matrix, it is an attempt to do better what they tried to accomplish in Deus Ex Invisible War. On clicking a menu item in the outer rim, the cirlce expands and reveals a new page underneath. Halo lights will indicate the active circle.

## Heads Up Display
Displays health and energy in the top right and weapons in the bottom. The weapons interface only pops up if activated via scroll wheel or number keys.

## Conversations
Conversations consist of a regular popup with the name of the current speaker at the top. All characters will have speaking animations. The player can press [enter] to proceed to the next line at any time. All important characters have a recorded greeting message, like "hello" or "how you doin'?" to be played randomly at the beginning of every new conversation.

# Setting
## Visuals
- Cyberpunk theme

## Story
- In line with the original Deus Ex game
- Cameos from original characters, but with altered names

## Musical inspiration
- Trentemøller

# Distribution
## Target platforms
- Linux/Windows/Mac
- Consoles if possible

## Stores
- Steam
- HumbleBundle
- From own website
- Ubuntu Software Center
