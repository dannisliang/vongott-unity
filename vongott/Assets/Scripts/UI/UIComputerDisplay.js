#pragma strict

import System.Collections.Generic;

class UIComputerDisplay extends OGPage {	
	public var nameLabel : OGLabel;
	public var messageContainer : OGScrollView;
	public var messageString : OGLabel;
	public var messageTextField : OGTextField;
	public var todoList : OGLabel;
	public var events : Transform;
	
	public static var currentAccount : Computer.Account;
	public static var currentComputer : Computer;
	
			
	////////////////////
	// Init
	////////////////////
	override function StartPage () {
		GameCamera.GetInstance().GetComponent(Camera).enabled = false;
		
		nameLabel.text = currentAccount.username + "@" + currentComputer.domain;
		
		if ( currentAccount.messages != "" ) {
			messageContainer.transform.parent.gameObject.SetActive ( true );
			
			ClearMessages ();
			PopulateMessages ();
		
		} else {
			messageContainer.transform.parent.gameObject.SetActive ( false );
			
		}
	
		if ( currentAccount.events.Length > 0 ) {
			for ( var i : int = 0; i < currentAccount.events.Length; i++ ) {
				var btn : OGButton = new GameObject ( "btn_Event" ).AddComponent.< OGButton > ();
				btn.transform.parent = events;
				btn.transform.localScale = new Vector3 ( 400, 30, 1 );
				btn.transform.localPosition = new Vector3 ( 0, 40 * i, 0 );

				btn.text = currentAccount.events[i];
				btn.target = currentComputer.gameObject;
				btn.message = "Event";
				btn.argument = btn.text;

				btn.ApplyDefaultStyles ();
			}
		}

		if ( currentAccount.todoList != "" ) {
			todoList.transform.parent.gameObject.SetActive ( true );
		
			todoList.text = currentAccount.todoList;
		
		} else {
			todoList.transform.parent.gameObject.SetActive ( false );
				
		}
	}
	
	
	////////////////////
	// Exit
	////////////////////
	public static function Clear () {
		currentAccount = null;
		currentComputer = null;
	}
	
	public function Logout () {
		currentComputer.ShowLogin ();
	}
	
	override function ExitPage () {
		GameCamera.GetInstance().GetComponent(Camera).enabled = true;
	}
	
	
	////////////////////
	// Computer operations
	////////////////////
	public function SendMessage () {
		currentAccount.messages += "\n\n" + System.DateTime.Now.ToString("HH:mm") + " - " + currentAccount.username + ":\n" + messageTextField.text;
		messageTextField.text = "";
		
		PopulateMessages ();
	}
		
	public function CloseWindow ( name : String ) {
	
	}
	
	private function PopulateMessages () {
		messageString.text = currentAccount.messages;
	}
	
	private function ClearMessages () {
		messageString.text = "";
	}
	
	
	////////////////////
	// Update
	////////////////////
	override function UpdatePage () {
		
	}
}
