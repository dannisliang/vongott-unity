#pragma strict

class LiftPanel extends InteractiveObject {
	public var liftObject : Transform;
	public var allDestinations : List.< Vector3 > = new List.< Vector3 >();
	public var currentDestination : int = 0;
			
	private var locked : boolean = false;
	private var inSession : boolean = false;
	
	function Start () {
		if ( EditorCore.running ) {
			this.GetComponent(BoxCollider).enabled = false;
		}
		
		if ( allDestinations.Count == 1 ) {
			allDestinations[0] = liftObject.transform.position;
		}
	}
	
	public function ShowPanel ( ){
		UILiftPanelDisplay.currentLiftPanel = this;
		UILiftPanelDisplay.callback = TransitCallback;
		OGRoot.GoToPage ( "LiftPanelDisplay" );
	}
	
	public function Enter () : IEnumerator {
		inSession = true;
		UIHUD.ToggleCrosshair ();
		
		GameCore.interactiveObjectLocked = true;
		
		GameCamera.GetInstance().StorePosRot ();
		
		GameCore.ToggleControls ( false );
		UIHUD.ShowNotification ( "" );
		
		yield GameCamera.GetInstance().FocusInterface ( this.transform, 0.3 );
		
		ShowPanel ();
	}
	
	public function Exit ( i : int ) : IEnumerator {
		OGRoot.GoToPage ( "HUD" );
		
		inSession = false;
		
		GameCamera.GetInstance().RestorePosRot ( 1 );
			
		yield WaitForSeconds ( 1 );
	
		UIHUD.ToggleCrosshair ();
	
		GameCore.interactiveObjectLocked = false;
		GameCore.ToggleControls ( true );
	
		if ( i < 9 ) {
			currentDestination = i;
		}
	}
	
	public function TransitCallback ( i : int ) {
		Exit ( i );
	}
	
	override function Interact () {
		if ( Input.GetMouseButtonDown(0) && GameCore.controlsActive && !inSession && !locked ) {
			StartCoroutine ( Enter () );
		
		} else if ( Input.GetKeyDown(KeyCode.Escape) && inSession ) {
			StartCoroutine ( Exit ( 99 ) );
		
		}
	}
	
	override function UpdateObject () {
		if ( EditorCore.running ) { return; }
		
		if ( allDestinations.Count > 0 ) {
			if ( currentDestination > allDestinations.Count - 1 ) {
				currentDestination = allDestinations.Count - 1;
			}
			
			liftObject.position = Vector3.Slerp ( liftObject.position, allDestinations[currentDestination], Time.deltaTime * 0.5 );
			
			if ( Vector3.Distance ( liftObject.position, allDestinations[currentDestination] ) > 0.08 ) {		
				locked = true;
			
			} else {
				locked = false;
			
			}
			 
		} else {
			locked = false;
		
		}
	}
}