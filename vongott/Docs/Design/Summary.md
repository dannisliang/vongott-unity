Design document for The Vongott Chronicles
====

# Production
## Tools
The game will be produced in Unity using as few additional libraries as possible. Some will be needed for heavy computations such as AI, though. It will be written in UnityScript. There will be a community SDK for constructing levels.

# Features
## Flags
The game will have a flag system that keeps track of player actions in order to make consequences for them later in the game.

## Economy
Weapons, provisions and digital upgrades can be purchased in shops. The currency is called 'credits'. Credits can be found on incapacitated people, in locked containers that require lockpicking and in cash points.

## Upgrades
Players can obtain mechanical and digital upgrades to improve their abilities. Upgrades are physical and mental improvements that can be found like items in the game.

## Conversations
During conversations, the HUD will disappear and black bars come up, the camera zooms in a little. There will be an extensive library of short speaking animations which can be applied to any character. The player can press [enter] to proceed to the next line at any time.

Conversations can happen between NPCs as well.

## Debug menu
There will be no debug menu, as switching between the editor and the game is petty seamless.

# Gameplay
## Genre
- Shoulder view
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
The menu system is completely circular. Inspired by mechanical aesthetics of The Matrix, it is an attempt to do better what they tried to accomplish in Deus Ex Invisible War. On clicking a menu item in the outer rim, the cirlce expands and reveals a new page underneath. Halo lights will indicate the active circle.

## Heads Up Display
Displays health and energy in the top right and weapons in the bottom. The weapons interface only pops up if activated via scroll wheel or number keys.

## Enemies
Enemies will walk patrol routes and have a fairly narrow vision cone. 
They will have 3 states: calm, cautious and aggressive. Cautious leads to aggressive, if they spot the player.
If they spot dead bodies, they will become cautious.

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
