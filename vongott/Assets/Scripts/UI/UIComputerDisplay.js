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
	public static function Clear () {
		currentAccount = null;
		currentComputer = null;
	}
	
	override function StartPage () {
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
	
	public function SendMessage () {
		currentAccount.messages += "\n\n" + DateTime.Now.ToString("HH:mm") + " - " + currentAccount.username + ":\n" + messageTextField.text;
		messageTextField.text = "";
		
		PopulateMessages ();
	}
	
	public function Logout () {
		currentComputer.ShowLogin ();
	}
	
	private function PopulateMessages () {
		messageString.text = currentAccount.messages;
		messageString.CalcHeight();
		
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