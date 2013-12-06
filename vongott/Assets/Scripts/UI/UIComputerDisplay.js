#pragma strict

import System.Collections.Generic;

class UIComputerDisplay extends OGPage {	
	var nameLabel : OGLabel;
	var messageContainer : OGScrollView;
	var messageString : OGLabel;
	var messageTextField : OGTextField;
	var todoList : OGLabel;
	var openFile : OGLabel;
	var openFileName : OGLabel;
	
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
		
		if ( currentAccount.openFile != "" ) {
			openFileName.transform.parent.gameObject.SetActive ( true );
		
			openFileName.text = currentAccount.openFileName;
			openFile.text = currentAccount.openFile;
		
		} else {
			todoList.transform.parent.gameObject.SetActive ( false );
				
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
		currentAccount.messages += "\n\n" + DateTime.Now.ToString("HH:mm") + " - " + currentAccount.username + ":\n" + messageTextField.text;
		messageTextField.text = "";
		
		PopulateMessages ();
	}
		
	public function CloseWindow ( name : String ) {
	
	}
	
	private function PopulateMessages () {
		messageString.text = currentAccount.messages;
	
		messageContainer.scrollLength = messageString.transform.localScale.y + 50;
		messageTextField.transform.parent.localPosition = new Vector3 ( 0, messageContainer.scrollLength - 40, 0 );
		
		messageContainer.position.y = messageContainer.scrollLength - messageContainer.viewHeight;
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