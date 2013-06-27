![logo](https://raw.github.com/mrzapp/vongott/master/vongott/Assets/Textures/UI/logo.png)

#The Vongott Chronicles

--

This game is set in the Deus Ex universe, so a cyberpunk not-so-distant future. Occurences of original characters will be cameos at most. The point of this game is to explore a different viewpoint of the events in Deus Ex, and to expand the story in another direction entirely. You could basically call this game elaborate fan fiction. The intention is to release it in chapters. 

Everything except the framework with which Vongott is developed, Unity 3D, will be open source. In the future, I will try to get this project some traction and invite others to collaborate with me, especially on the story and the look. Before that can happen, though, I will have to create the foundation for this game entirely, writing a new action RPG engine from scratch.

I will document the code as I move along. Have a look in the docs for that and everything else about Vongott.

### Progress!

I have spent my time doing my own GUI framework for Unity called OpenGUI, and I have managed to build a pretty capable level editor with an inspector, save/load features, adding prefabs, editing conversations, quests and flags, editing surface vectors, and probably a few more things. The editor is at this point capable of building a coherent, if very rudimentary, action RPG :)
<img src="https://raw.github.com/mrzapp/vongott/master/img/demo_windows.png" />

The level shown below was made exclusively with this editor, without using Unity.
<img src="https://raw.github.com/mrzapp/vongott/master/img/demo_level.png" />

The conversation editor and game logic is fully functional, apart from playing audio clips.
<img src="https://raw.github.com/mrzapp/vongott/master/img/demo_convo.png" />

### What needs to be done
- Story
	- Outline
	- Script
	- Main quests and sidequests
- Audio
	- Music
	- Sound effects
	- Dialogue?
- Animation
	- Male
	- Female
	- Universal conversation poses and lip movement
- Core
	- Controls
	- Infrastructure
		- Flag system (almost done)
		- Quest system (almost done)
		- AI (path finding, friend/foe system, awareness levels)
		- Inventory
	- New UI plugin for Unity
- Modeling
	- Player
	- Standard male
	- Standard female
	- Marcel
- Level design
- UI
	- Main menu 
	- Quest log
	- Inventory
	- HUD
	- Conversation interface (almost done)
- Graphics
	- UI
	- Environment textures
	- Humans
	- Animals
	- Skyboxes
	- Shaders

<p align=right>
  <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/3.0/deed.en_US"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by-nc-sa/3.0/88x31.png" /></a>
  <br />
  <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/3.0/deed.en_US">Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License</a>.
</p>
