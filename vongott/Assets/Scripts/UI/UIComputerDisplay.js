#pragma strict

import System.Collections.Generic;

class UIComputerDisplay extends OGPage {	
	var nameLabel : OGLabel;
	var messageContainer : OGScrollView;
	var messageString : OGLabel;
	var messageTextField : OGTextField;
	
	public static var username : String = "";
	public static var messages : String  = "";
	public static var currentComputer : Computer;
	
			
	////////////////////
	// Init
	////////////////////
	public static function Clear () {
		username = "";
		messages = null;
		currentComputer = null;
	}
	
	override function StartPage () {
		nameLabel.text = username + "@" + currentComputer.networkTitle;
		
		ClearMessages ();
		StartCoroutine ( PopulateMessages () );
	}
	
	public function SendMessage () {
		messages += "\n\n" + DateTime.Now.ToString("HH:mm") + " - " + username + ":\n" + messageTextField.text;
		messageTextField.text = "";
		
		StartCoroutine ( PopulateMessages () );
	}
	
	public function Logout () {
		currentComputer.ShowLogin ();
	}
	
	private function PopulateMessages () : IEnumerator {
		messageString.text = messages;
		
		yield WaitForSeconds ( 0.1 );
		
		messageContainer.position.y = messageContainer.scrollLength - messageContainer.viewHeight;
	}
	
	private function ClearMessages () {
		messageString.text = "";
	}
	
	
	////////////////////
	// Update
	////////////////////
	override function UpdatePage () {
		messageContainer.scrollLength = messageString.transform.localScale.y + 50;
		messageTextField.transform.parent.localPosition = new Vector3 ( 0, messageContainer.scrollLength - 40, 0 );
	}
}