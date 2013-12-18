#pragma strict

class EditorInspectorTrigger extends MonoBehaviour {
	var activation : OGPopUp;
	var fireOnce : OGTickBox;
	var addEvent : OGButton;
	@HideInInspector var bottomLine : float = 0;
	var eventContainer : Transform;
	
	function PopulateEvents ( trg : Trigger ) {
		activation.selectedOption = trg.activation.ToString();
		fireOnce.isTicked = trg.fireOnce;
		
		eventContainer.GetComponent ( OGScrollView ).viewHeight = Screen.height - eventContainer.position.y;
				
		for ( var e : GameEvent in trg.events ) {
			AddEvent ( e );
		}
		
		RearrangeEvents ();
	}
	
	function Init ( obj : GameObject ) {
		var trg : Trigger = obj.GetComponent ( Trigger );
		if ( trg == null ) { return; }
		
		ClearEvents ();
		PopulateEvents ( trg );
	}
	
	function PickPrefab ( btn : OGButton ) {
		EditorCore.SetPickMode ( true );
	
		EditorCore.pickerCallback = function ( hit : RaycastHit ) {
			if ( hit.collider.gameObject.GetComponent(Prefab) ) {
				btn.text = hit.collider.gameObject.GetComponent(Prefab).id;
				btn.hiddenString = hit.collider.gameObject.GetComponent(GUID).GUID;
				UpdateObject();
			}
		};
	}
	
	function PickActor ( btn : OGButton ) {
		EditorCore.SetPickMode ( true );
	
		EditorCore.pickerCallback = function ( hit : RaycastHit ) {
			if ( hit.collider.gameObject.GetComponent(Actor) ) {
				btn.text = hit.collider.gameObject.GetComponent(Actor).displayName;
				btn.hiddenString = hit.collider.gameObject.GetComponent(GUID).GUID;
			}
			
			UpdateObject();
		};
	}
	
	function PickQuest ( btn : OGButton ) {
		EditorPicker.mode = "quest";
		EditorPicker.button = btn;
		EditorPicker.sender = "MenuBase";
		
		EditorPicker.func = UpdateObject;
		
		OGRoot.GetInstance().GoToPage ( "Picker" );
	}
	
	function PickMap ( btn : OGButton ) {
		EditorPicker.mode = "map";
		EditorPicker.button = btn;
		EditorPicker.sender = "MenuBase";
		
		EditorPicker.func = UpdateObject;
		
		OGRoot.GetInstance().GoToPage ( "Picker" );
	}
	
	function PickFlag ( btn : OGButton ) {
		EditorPicker.mode = "flag";
		EditorPicker.button = btn;
		EditorPicker.sender = "MenuBase";
		
		EditorPicker.func = UpdateObject;
		
		OGRoot.GetInstance().GoToPage ( "Picker" );
	}
	
	function AddEvent () {
		AddEvent ( null );
		
		UpdateObject();
	}
	
	function AddEvent ( e : GameEvent ) {
		var obj : GameObject = new GameObject ( "Event" );
		obj.transform.parent = eventContainer;
		obj.transform.localScale = Vector3.one;
		obj.transform.localEulerAngles = Vector3.zero;
		
		var btnObj : GameObject = new GameObject ( "Button" );
		btnObj.transform.parent = obj.transform;
		btnObj.transform.localScale = new Vector3 ( 260, 20, 1 );
		btnObj.transform.localEulerAngles = Vector3.zero;
		btnObj.transform.localPosition = Vector3.zero;
		
		var btn : OGButton = btnObj.AddComponent ( OGButton );
		btn.text = "Edit";
		btn.func = function () {
			EditorPicker.mode = "event";				
			EditorPicker.sender = "MenuBase";
			EditorPicker.button = btn;
			EditorPicker.func = UpdateObject;
			
			OGRoot.GetInstance().GoToPage ( "Picker" );
		};
		btn.GetDefaultStyles();
		
		var dltObj : GameObject = new GameObject ( "Delete" );
		dltObj.transform.parent = obj.transform;
		dltObj.transform.localScale = new Vector3 ( 20, 20, 1 );
		dltObj.transform.localEulerAngles = Vector3.zero;
		dltObj.transform.localPosition = new Vector3 ( 270, 0, 0 );

		var dlt : OGButton = dltObj.AddComponent ( OGButton );
		dlt.text = "x";
		dlt.func = function () {
			RemoveEvent ( obj );
		};
		dlt.GetDefaultStyles();

		if ( e ) {
			btn.text = e.id;
		
		} else {
			btn.text = "(none)";
			
		}
	}
	
	function ClearEvents () {
		bottomLine = 0;
		
		for ( var i = 0; i < eventContainer.childCount; i++ ) {
			if ( !eventContainer.GetChild(i).GetComponent(OGButton) ) {
				Destroy ( eventContainer.GetChild(i).gameObject );
			}
		}
	}
	
	function RearrangeEvents () {
		bottomLine = 0;
		
		for ( var i = 0; i < eventContainer.childCount; i++ ) {			
			if ( eventContainer.GetChild(i).GetComponent(OGButton) && eventContainer.GetChild(i).GetComponent(OGButton).text == "+" ) { continue; }
			
			var e : Transform = eventContainer.GetChild(i);
			e.localPosition = new Vector3 ( 0, bottomLine, 0 );
						
			bottomLine += 30;
		}
			
		addEvent.transform.localPosition = new Vector3 ( 0, bottomLine, 0 );
		eventContainer.GetComponent ( OGScrollView ).scrollLength = bottomLine + 40;
	}
	
	function RemoveEvent ( obj : GameObject ) {
		DestroyImmediate ( obj );
		UpdateObject ();
	}
	
	function UpdateObject () {
		RearrangeEvents ();
		
		var obj : GameObject = EditorCore.GetSelectedObject();
		
		if ( !obj ) { return; }
		
		if ( obj.GetComponent ( Trigger ) ) {
			var trg : Trigger = obj.GetComponent ( Trigger );
			
			trg.SetActivationType ( activation.selectedOption );
			trg.fireOnce = fireOnce.isTicked;
			
			trg.events.Clear();
			
			for ( var i : int = 0; i < eventContainer.childCount; i++ ) {
				if ( eventContainer.GetChild(i).GetComponent(OGButton) ) { continue; }
				
				for ( var c : Component in eventContainer.GetChild(i).GetComponentsInChildren ( OGButton ) ) {
					var btn : OGButton = c as OGButton;
					
					if ( btn && btn.text != "x" ) {				
						trg.events.Add ( Loader.LoadEvent ( btn.text ) );
					}
				}
			}
		}
	}
}
