#pragma strict

class EditorLoading extends OGPage {
	public var messageLabel : OGLabel;
	
	public static var message : String;
	
	override function StartPage () {
		messageLabel.text = message;
	}
	
	override function ExitPage () {
		messageLabel.text = "LOADING TEXT HERE";
	}
}