#pragma strict

class Computer extends InteractiveObject {
	public class Account {
		public var username : String = "dude";
		public var password : String = "sweet";
		public var messages : String = "";
		public var todoList : String = "";
		public var wallpaper : String = "wallpaper_debian";
		public var events : String[] = new String[0];
	}
	
	public var domain : String = "domainname";
	public var validAccounts : List.< Account > = new List.< Account > ();

	private var tempPos : Vector3;
	private var tempRot : Vector3;
	
	private var inSession : boolean = false;
	
	public function ExecuteEvent ( msg : String ) {
		this.gameObject.SendMessage ( "Event", msg, SendMessageOptions.DontRequireReceiver );
	}

	public function AddAccount () : Account {
		var acc : Account = new Account ();
		validAccounts.Add ( acc );

		return acc;
	}
	
	public function RemoveAccount ( i : int ) {
		if ( validAccounts.Count > 1 ) {
			validAccounts.RemoveAt ( i );
		}
	}
	
	public function RemoveAccount ( str : String ) {
		for ( var i : int = 0; i < validAccounts.Count; i++ ) {
			if ( str == validAccounts[i].username ) {
				RemoveAccount ( i );
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
		
		OGRoot.GetInstance().GoToPage ( "ComputerDisplay" );
	}
	
	public function ShowLogin ( ){
		UILoginDisplay.title = domain;
		UILoginDisplay.accounts = validAccounts;
		UILoginDisplay.successCallback = LoginSuccess;
		OGRoot.GetInstance().GoToPage ( "LoginDisplay" );
	}
	
	public function Enter () : IEnumerator {
		inSession = true;
		UIHUD.GetInstance().ToggleCrosshair ();
		
		GameCore.GetInstance().controlsActive = false;
		UIHUD.GetInstance().ShowNotification ( "" );
		
		yield GameCamera.GetInstance().FocusInterface ( this.transform, 0.4 );
		
		ShowLogin ();
	}
	
	public function Exit () : IEnumerator {
		inSession = false;
		
		iTween.MoveTo ( GameCamera.GetInstance().gameObject, iTween.Hash ( "position", tempPos, "time", 1, "easetype", iTween.EaseType.easeInOutQuad, "space", "world", "ignoretimescale", true ) );
		iTween.RotateTo ( GameCamera.GetInstance().gameObject, iTween.Hash ( "rotation", tempRot, "time", 1, "easetype", iTween.EaseType.easeInOutQuad, "space", "world", "ignoretimescale", true ) );
	
		yield WaitForSeconds ( 1 );
	
		UIHUD.GetInstance().ToggleCrosshair ();
	
		GameCore.GetInstance().controlsActive = true;
	}
	
	override function Interact () {
		if ( !inSession ) {
			tempPos = GameCamera.GetInstance().transform.position;
			tempRot = GameCamera.GetInstance().transform.eulerAngles;
	
			StartCoroutine ( Enter () );
			
			GameCore.interactiveObjectLocked = true;
		
			InputManager.escFunction = function () {
				OGRoot.GetInstance().GoToPage ( "HUD" );
				UILoginDisplay.Clear ();
				UIComputerDisplay.Clear ();
				
				StartCoroutine ( Exit () );
				
				GameCore.interactiveObjectLocked = false;
			};
		}
		
		
	}
	
	override function InvokePrompt () {
		UIHUD.GetInstance().ShowNotification ( "Use" );
	}
	
	function Start () {
	}
}
