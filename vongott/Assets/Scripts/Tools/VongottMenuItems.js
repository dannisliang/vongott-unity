#pragma strict

public class VongottMenuItems extends MonoBehaviour {
	// Scenes
	@MenuItem ( "Vongott/Scenes/Editor" )
	static public function GoToEditor () {
		EditorApplication.OpenScene ( "Assets/Scenes/editor.unity" );
	}
	
	@MenuItem ( "Vongott/Scenes/Game" )
	static public function GoToGame () {
		EditorApplication.OpenScene ( "Assets/Scenes/game.unity" );
	}
	
	@MenuItem ( "Vongott/Scenes/Main menu" )
	static public function GoToMainMenu () {
		EditorApplication.OpenScene ( "Assets/Scenes/main_menu.unity" );
	}
}
