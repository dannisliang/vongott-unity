![logo](https://raw.github.com/mrzapp/vongott/master/vongott/Blender/render.png)

<a href="https://www.dropbox.com/s/tw0e3hobxii237k/Build.zip">latest build</a>

This game is set in the Deus Ex universe, so a cyberpunk not-so-distant future. Occurences of original characters will be cameos at most. The point of this game is to explore a different viewpoint of the events in Deus Ex, and to expand the story in another direction entirely. You could basically call this game elaborate fan fiction. The intention is to release it in chapters. 

Everything except the framework with which Vongott is developed, Unity 3D, will be open source. In the future, I will try to get this project some traction and invite others to collaborate with me, especially on the story and the look. Before that can happen, though, I will have to create the foundation for this game entirely, writing a new action RPG engine from scratch.

I will document the code as I move along. Have a look in the docs for that and everything else about Vongott.

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
- Game core
	- Optimisations
	- UnitySteer implementation
	- Proper character controls
	- Camera movement and raycasting
- Editor
	- Optimisations
- In-game objects
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
	- Scene 1 concept art + initial level build

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
