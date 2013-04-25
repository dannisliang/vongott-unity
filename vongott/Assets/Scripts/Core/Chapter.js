#pragma strict

class Chapter {
	var scenes : List.<Scene> = new List.<Scene>();
	var index : int;
	var title : String;
	var writtenBy : String;
	
	function Chapter ( i : int, t : String, w : String ) {
		index = i;
		title = t;
		writtenBy = w;
	}
	
	function AddScene ( s : Scene ) {
		scenes.Insert ( s.index, s );
	}
}