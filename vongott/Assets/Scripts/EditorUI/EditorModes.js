#pragma strict

class EditorModes extends OGPage {
	var _title : OGLabel;
	var _message : OGLabel;
	var _background : OGRect;
	
	static var title : OGLabel;
	static var message : OGLabel;
	static var background : OGRect;
	
	static function SetTitle ( ttl : String ) {
		title.text = ttl;
	}
	
	static function SetMessage ( msg : String ) {
		message.text = msg;
	}
	
	static function SetHeight ( h : float ) {
		background.transform.localScale = new Vector3 ( background.transform.localScale.x, h, background.transform.localScale.z );
	}
	
	function Start () {
		title = _title;
		message = _message;
		background = _background;
	}
}