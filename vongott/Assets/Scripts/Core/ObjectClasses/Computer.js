#pragma strict

class Computer extends InteractiveObject {
	public class Account {
		var username : String = "dude";
		var password : String = "sweet";
		var messages : String = "";
	}
	
	var networkTitle : String = "Default network";
	var validAccounts : List.< Account > = new List.< Account > ();
	
	private var tempPos : Vector3;
	private var tempRot : Vector3;
	
	public function LoginSuccess ( a : Account ) {
		UIComputerDisplay.username  = a.username;
		UIComputerDisplay.messages = a.messages;
		UIComputerDisplay.currentComputer = this;
		
		OGRoot.GoToPage ( "ComputerDisplay" );
	}
	
	public function ShowLogin ( ){
		UILoginDisplay.title = networkTitle;
		UILoginDisplay.accounts = validAccounts;
		UILoginDisplay.successCallback = LoginSuccess;
		UIHUD.ShowNotification ( "" );
		OGRoot.GoToPage ( "LoginDisplay" );
	}
	
	public function Enter () : IEnumerator {
		GameCore.ToggleControls ( false );
		
		yield GameCamera.GetInstance().FocusInterface ( this.transform );
		
		ShowLogin ();
	}
	
	public function Exit () : IEnumerator {
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
		if ( Input.GetMouseButtonDown(0) && GameCore.controlsActive ) {
			tempPos = GameCamera.GetInstance().transform.position;
			tempRot = GameCamera.GetInstance().transform.eulerAngles;
	
			GameCamera.GetInstance().SetBlur ( true );
			StartCoroutine ( Enter () );
		
		} else if ( Input.GetKeyDown(KeyCode.Escape) ) {
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