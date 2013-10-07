#pragma strict

import System.Collections.Generic;

class UIComputerDisplay extends OGPage {
	var nameLabel : OGLabel;
	var messageContainer : OGScrollView;
	var messageTextField : OGTextField;
	
	public static var username : String = "";
	public static var messages : List.< Computer.PersonalMessage > = null;
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
		nameLabel.text = username;
		
		ClearMessages ();
		PopulateMessages ();
	}
	
	public function SendMessage () {
		var msg : Computer.PersonalMessage = new Computer.PersonalMessage ();
		msg.senderName = username;
		msg.message = messageTextField.text;
		messageTextField.text = "";
		
		messages.Add ( msg );
		
		ClearMessages ();
		PopulateMessages ();
	}
	
	public function Logout () {
		currentComputer.ShowLogin ();
	}
	
	private function PopulateMessages () {
		if ( messages != null ) {
			var bottomLine : float = 0;
			var msgWidth : float = 300;
			var charSize : float = 10;
			
			for ( var msg : Computer.PersonalMessage in messages ) {
				var obj : GameObject = new GameObject ( "message" );
				var msgObj : OGLabel = obj.AddComponent ( OGLabel );
				
				msgObj.text = msg.senderName + ":\n" + msg.message;
				
				var msgHeight : float = ( 2 * charSize ) + 8;
				var lineWidth : float = 0;
				
				for ( var i = 0; i < msg.message.Length; i++ ) {
					lineWidth += charSize;
				
					if ( lineWidth >= msgWidth ) {
						msgHeight += charSize + 4;
						lineWidth = 0;
					}
				}
								
				obj.transform.parent = messageContainer.transform;
				
				obj.transform.localEulerAngles = Vector3.zero;
				obj.transform.localScale = new Vector3 ( msgWidth, msgHeight, 1 );
				obj.transform.localPosition = new Vector3 ( 0, bottomLine, 0 );
			
				bottomLine += msgHeight + 20;
			}
			
			messageContainer.scrollLength = bottomLine + 40;
			messageTextField.transform.parent.localPosition = new Vector3 ( 0, bottomLine, 0 );
			
			messageContainer.position.y = messageContainer.scrollLength - messageContainer.viewHeight;
		}
	}
	
	private function ClearMessages () {
		for ( var i = 0; i < messageContainer.transform.childCount; i++ ) {
			if ( messageContainer.transform.GetChild(i).GetComponent( OGLabel ) ) {
				DestroyImmediate ( messageContainer.transform.GetChild(i).gameObject );
			}
		}
	}
	
	
	////////////////////
	// Update
	////////////////////
	override function UpdatePage () {
		
	}
}