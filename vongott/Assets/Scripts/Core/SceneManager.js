#pragma strict

class SceneManager {
	var allChapters : List.<Chapter> = new List.<Chapter>();
	
	function AddChapter ( c : Chapter ) {
		allChapters.Insert ( c.index, c );
	}
	
	function GoToChapter ( c : int ) {
		
	}
	
	function GoToScene ( s : int ) {
		
	}
}