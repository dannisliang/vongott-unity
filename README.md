![logo](https://raw.github.com/mrzapp/vongott/master/vongott/Blender/render.png)

<a href="https://www.dropbox.com/s/z12t78ir3dk2wyb/Build.zip">latest build</a>

### What?
This game is set in the Deus Ex universe, so a cyberpunk not-so-distant future. The point of this game is to explore a different viewpoint of the events in Deus Ex, and to expand the story in another direction entirely. You could basically call this game elaborate fan fiction. The intention is to release it in chapters. 

### Why?
<a href="http://www.youtube.com/watch?v=p1b8k469DbY#at=188">This</a> aptly named catastrophe is why. And other reasons. Anyway, the point is that we don't like anything new.

### How?
1. Create an action RPG framework from scratch
2. Create a capable SDK to take advantage of this framework
3. Create tons of generic assets
4. Write the first chapter and create the required assets
5. Build the game with the SDK
6. Release the SDK and the game for free

### Updates!
I have spent my time doing my own GUI framework for Unity called OpenGUI, and I have managed to build a pretty capable level editor with an inspector, save/load features, adding prefabs, editing conversations, quests and flags, editing surface vectors, and probably a few more things. The editor is at this point capable of building a coherent, if very rudimentary, action RPG :)
<img src="https://raw.github.com/mrzapp/vongott/master/img/demo_windows.png" />

The level shown below was made exclusively with this editor, without using Unity.
<img src="https://raw.github.com/mrzapp/vongott/master/img/demo_level.png" />

The conversation editor and logic is fully functional, apart from playing audio clips.
<img src="https://raw.github.com/mrzapp/vongott/master/img/demo_convo.png" />

## Development goals

### First iteration ( 2013.03.12 - 2013.06.27 )
- Game Core
	- Conversations &#x2713;
	- Quests &#x2713;
	- Flags &#x2713;
	- Basic object interaction &#x2713;
	- Inventory &#x2713;
- Editor
	- Basic level building &#x2713;
	- Conversation editor &#x2713;
	- Quest editor &#x2713;
	- Flag editor &#x2713;
	- Object and actor editing &#x2713;
- GUI
	- New UI plugin for Unity &#x2713;

### Second iteration
- Concept art
	- Player
	- Generic male + female
	- First map
- Game core
	- Optimisations
	- AI implementation
	- Proper character controls
	- Camera movement and raycasting
	- Trigger logic
- Editor
	- Improvements to surface editor
	- Scatter surfaces
	- Clear visual cues
	- More view modes in the asset browser
	- Optimisations
- In-game objects
	- Architecture
		- Wall types
	- Furniture
		- Basic modelling 
		- Texturing
	- Environment
		- Basic modelling
		- Texturing
- Story
	- Chapter 1 outline
	- First scene core conversations
- Level design
	- Scene 1 + initial level build

### Third iteration
- Game core
	- Optimisations
	- Reduce draw calls with combined meshes
	- Human AI behaviours
- Editor
	- Optimisations
- In-game objects
	- Equipment concept art 
- Story
	- Chapter 1 complete script and quests
	- More core conversations
	- Main quests and sidequests
- Content
	- More prefabs
	- More materials
	- Player & NPC initial models

### Fourth iteration
- Game core
	- Optimisations
	- Play testing
- In-game objects
	- Equipment modelling and texturing
- Animation
	- Male
	- Female
- Audio
	- Sound effects
- GUI polishing
	- Main menu 
	- Quest log
	- Inventory
	- HUD

### Fifth iteration
- Game core
	- Optimisations
	- Play testing
- Editor
	- Optimisations
	- Alpha deployment 
- Audio
	- Music
	- Recording of implemented dialogue
- Animation
	- Universal conversation poses and lip movement
- Graphics
	- Skyboxes
	- Proper shaders
	

<p align=right>
  <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/3.0/deed.en_US"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by-nc-sa/3.0/88x31.png" /></a>
  <br />
  <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/3.0/deed.en_US">Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License</a>.
</p>
