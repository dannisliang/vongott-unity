﻿#pragma strict

class Computer extends InteractiveObject {
	public class Account {
		var username : String = "dude";
		var password : String = "sweet";
		var messages : String = "";
		var todoList : String = "";
		var openFile : String = "";
		var openFileName : String = "filename.txt";
		var wallpaper : String = "wallpaper_debian";
	}
	
	var domain : String = "domainname";
	var validAccounts : List.< Account > = new List.< Account > ();
	
	private var tempPos : Vector3;
	private var tempRot : Vector3;
	
	private var inSession : boolean = false;
	
	public function AddAccount () {
		validAccounts.Add ( new Account () );
	}
	
	public function RemoveAccount ( str : String ) {
		for ( var acc : Account in validAccounts ) {
			if ( str == acc.username ) {
				validAccounts.Remove ( acc );
				return;
			}	
		}
	}
	
	public function GetAccountFromString ( str : String ) : Account {
		for ( var acc : Account in validAccounts ) {
			if ( str == acc.username ) {
				return acc;
			}	
		}
	
		return null;
	}
	
	public function LoginSuccess ( a : Account ) {
		UIComputerDisplay.currentAccount = a;
		UIComputerDisplay.currentComputer = this;
		
		OGRoot.GoToPage ( "ComputerDisplay" );
	}
	
	public function ShowLogin ( ){
		UILoginDisplay.title = domain;
		UILoginDisplay.accounts = validAccounts;
		UILoginDisplay.successCallback = LoginSuccess;
		UIHUD.ShowNotification ( "" );
		OGRoot.GoToPage ( "LoginDisplay" );
	}
	
	public function Enter () : IEnumerator {
		inSession = true;
		
		GameCore.ToggleControls ( false );
		
		yield GameCamera.GetInstance().FocusInterface ( this.transform );
		
		ShowLogin ();
	}
	
	public function Exit () : IEnumerator {
		inSession = false;
		
		GameCamera.GetInstance().SetBlur ( false );
		iTween.MoveTo ( GameCamera.GetInstance().gameObject, iTween.Hash ( "position", tempPos, "time", 1, "easetype", iTween.EaseType.easeInOutQuad, "space", "world", "ignoretimescale", true ) );
		iTween.RotateTo ( GameCamera.GetInstance().gameObject, iTween.Hash ( "rotation", tempRot, "time", 1, "easetype", iTween.EaseType.easeInOutQuad, "space", "world", "ignoretimescale", true ) );
	
		yield WaitForSeconds ( 1 );
	
		GameCore.ToggleControls ( true );
	}
	
	// Handle use
	override function InvokePrompt () {
		UIHUD.ShowNotification ( "Use [LeftMouse]" );
	}
	
	override function Interact () {
		if ( Input.GetMouseButtonDown(0) && GameCore.controlsActive && !inSession ) {
			tempPos = GameCamera.GetInstance().transform.position;
			tempRot = GameCamera.GetInstance().transform.eulerAngles;
	
			GameCamera.GetInstance().SetBlur ( true );
			StartCoroutine ( Enter () );
		
		} else if ( Input.GetKeyDown(KeyCode.Escape) && inSession ) {
			OGRoot.GoToPage ( "HUD" );
			UILoginDisplay.Clear ();
			UIComputerDisplay.Clear ();
			
			StartCoroutine ( Exit () );
		
		}
		
		
	}
	
	function Start () {
		if ( EditorCore.running ) {
			this.GetComponent ( SphereCollider ).enabled = false;
		}
	}
}