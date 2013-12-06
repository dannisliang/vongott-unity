#pragma strict

import System.Collections.Generic;

class UILoginDisplay extends OGPage {
	var titleTextLabel : OGLabel;
	var messageLabel : OGLabel;
	var usernameInput : OGTextField;
	var passwordInput : OGTextField;
	
	public static var title : String = "";
	public static var accounts : List.< Computer.Account > = null;
	public static var successCallback : Function = null;
		
				
	////////////////////
	// Init
	////////////////////
	override function StartPage () {
		titleTextLabel.text = "";
		messageLabel.text = "";
		usernameInput.text = "";
		passwordInput.text = "";
		
		titleTextLabel.text = title;
		
		if ( accounts == null ) {
			messageLabel.text = "NO USER ACCOUNTS SET UP!";
		}
	}
	
	public static function Clear () {
		title = "";
		accounts = null;
		successCallback = null;
	}
	
	public function CheckCredentials () {
		for ( var acc : Computer.Account in accounts ) {
			if ( usernameInput.text == acc.username && passwordInput.text == acc.password ) {
				if ( successCallback == null ) {
					messageLabel.text = "NO CALLBACK FUNCTION!";
					return;
				} else {
					successCallback ( acc );
					return;
				}
			}
		}
	
		messageLabel.text = "Wrong username/password";
	}
	
	
	////////////////////
	// Update
	////////////////////
	override function UpdatePage () {
		if ( Input.GetKeyDown(KeyCode.Escape) ) {
			Clear ();
			OGRoot.GetInstance().GoToPage ( "HUD" );
		
		} else if ( Input.GetKeyDown(KeyCode.Return) && accounts != null ) {
			CheckCredentials ();
		
		}
	}
}