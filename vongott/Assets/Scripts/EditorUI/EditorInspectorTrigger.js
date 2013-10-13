#pragma strict

class EditorInspectorTrigger extends MonoBehaviour {
	var activation : OGPopUp;
	var fireOnce : OGTickBox;
	var addEvent : OGButton;
	@HideInInspector var bottomLine : float = 0;
	var eventContainer : Transform;
	
	function PopulateEvents ( trg : Trigger ) {
		activation.selectedOption = trg.activation.ToString();
		fireOnce.isChecked = trg.fireOnce;
		
		eventContainer.GetComponent ( OGScrollView ).viewHeight = Screen.height - eventContainer.position.y;
				
		for ( var e : GameEvent in trg.events ) {
			AddEvent ( e );
		}
		
		RearrangeEvents ();
	}
	
	function Init ( obj : GameObject ) {
		var trg : Trigger = obj.GetComponent ( Trigger );
		if ( trg == null ) { return; }
		
		ClearEvents ( function () { PopulateEvents ( trg ); } );
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
		
		OGRoot.GoToPage ( "Picker" );
	}
	
	function PickMap ( btn : OGButton ) {
		EditorPicker.mode = "map";
		EditorPicker.button = btn;
		EditorPicker.sender = "MenuBase";
		
		EditorPicker.func = UpdateObject;
		
		OGRoot.GoToPage ( "Picker" );
	}
	
	function PickFlag ( btn : OGButton ) {
		EditorPicker.mode = "flag";
		EditorPicker.button = btn;
		EditorPicker.sender = "MenuBase";
		
		EditorPicker.func = UpdateObject;
		
		OGRoot.GoToPage ( "Picker" );
	}
	
	function AddEvent () {
		AddEvent ( null );
		
		UpdateObject();
	}
	
	function AddEvent ( e : GameEvent ) {
		var btnObj : GameObject = new GameObject ( "Button" );
		btnObj.transform.parent = eventContainer;
		btnObj.transform.localScale = new Vector3 ( 290, 20, 1 );
		btnObj.transform.localEulerAngles = Vector3.zero;
		
		var btn : OGButton = btnObj.AddComponent ( OGButton );
		btn.text = "Edit";
		btn.func = function () {
			if ( btn.hiddenString != "" && btn.hiddenString != "(none)" ) { EditorEditEvent.eventCode = btn.hiddenString; }
			else if ( e ) { EditorEditEvent.event = e; }
			EditorEditEvent.callback = function ( code : String ) { btn.hiddenString = code; btn.text = code.Substring(0,30); UpdateObject(); };
			EditorEditEvent.sender = "MenuBase";
			OGRoot.GoToPage ( "EditEvent" );
		};
		
		if ( e ) {
			btn.hiddenString = Serializer.SerializeGameEvent ( e ).ToString();
			btn.text = btn.hiddenString.Substring ( 0, 30 );
		
		} else {
			btn.text = "(none)";
			btn.hiddenString = "";
			
		}
	}
	
	function ClearEvents () {
		ClearEvents ( null );
	}
	
	function ClearEvents ( func : Function ) {
		bottomLine = 0;
		
		for ( var i = 0; i < eventContainer.childCount; i++ ) {
			if ( eventContainer.GetChild(i).GetComponent(OGButton) && eventContainer.GetChild(i).GetComponent(OGButton).text !="+" ) {
				Destroy ( eventContainer.GetChild(i).gameObject );
			}
		}
		
		if ( func ) {
			func ();
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
			trg.fireOnce = fireOnce.isChecked;
			
			trg.events.Clear();
			
			for ( var i : int = 0; i < eventContainer.childCount; i++ ) {
				var e : OGButton = eventContainer.GetChild(i).GetComponent(OGButton);
				
				if ( e != null && e.hiddenString != "" ) {				
					trg.events.Add ( Deserializer.DeserializeGameEvent ( new JSONObject ( e.hiddenString, false ) ) );
				}
			}
		}
	}
}