#pragma strict

class EditorInspectorTrigger extends MonoBehaviour {
	var activation : OGPopUp;
	var fireOnce : OGTickBox;
	var addEvent : OGButton;
	@HideInInspector var bottomLine : float = 0;
	var eventContainer : Transform;
	var eventPrefab : EditorInspectorEvent;
	
	function Init ( obj : GameObject ) {
		ClearEvents ();
		
		var trg : Trigger = obj.GetComponent ( Trigger );
		if ( trg == null ) { return; }
		
		activation.selectedOption = trg.activation.ToString();
		fireOnce.isChecked = trg.fireOnce;
		
		eventContainer.GetComponent ( OGScrollView ).viewHeight = Screen.height - eventContainer.position.y;
		
		for ( var e : GameEvent in trg.events ) {
			AddEvent ( e );
		}
		
		RearrangeEvents ();
	}
	
	function PickPrefab ( btn : OGButton ) {
		EditorCore.SetPickMode ( true );
	
		EditorCore.pickerCallback = function ( hit : RaycastHit ) {
			btn.text = hit.collider.gameObject.name;
			UpdateObject();
		};
	}
	
	function PickActor ( btn : OGButton ) {
		EditorCore.SetPickMode ( true );
	
		EditorCore.pickerCallback = function ( hit : RaycastHit ) {
			if ( hit.collider.gameObject.GetComponent(Actor) ) {
				btn.text = hit.collider.gameObject.GetComponent(Actor).displayName;
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
		var pfb : EditorInspectorEvent = Instantiate ( eventPrefab );
		pfb.transform.parent = eventContainer;
		pfb.eventDelay.text = "0";
	
		pfb.anim.button.target = this.gameObject;
		pfb.quest.button.target = this.gameObject;
		pfb.nextPath.button.target = this.gameObject;
		pfb.setFlag.button.target = this.gameObject;
		pfb.travel.button.target = this.gameObject;
		pfb.eventCondition.target = this.gameObject;
				
		if ( e ) {
			pfb.eventDelay.text = e.delay.ToString();
			
			if ( e.condition != "" ) {
				pfb.eventCondition.text = e.condition;
				pfb.eventConditionBool.isChecked = e.conditionBool;
			} else {
				pfb.eventCondition.text = "(none)";
				pfb.eventConditionBool.isChecked = false;
			}
			
			switch ( e.type ) {
				case GameEvent.eEventType.Animation:
					pfb.eventType.selectedOption = "Animation";
					pfb.anim.button.text = e.animationObject;
					pfb.anim.popUp.selectedOption = e.animationType;
					pfb.anim.x.text = e.animationVector.x.ToString();
					pfb.anim.y.text = e.animationVector.y.ToString();
					pfb.anim.z.text = e.animationVector.z.ToString();
					break;
				
				case GameEvent.eEventType.Quest:
					pfb.eventType.selectedOption = "Quest";
					pfb.quest.button.text = e.questID;
					pfb.quest.popUp.selectedOption = e.questAction;
					break;
					
				case GameEvent.eEventType.NextPath:
					pfb.eventType.selectedOption = "NextPath";
					pfb.nextPath.button.text = e.nextPathName;
					break;
					
				case GameEvent.eEventType.SetFlag:
					pfb.eventType.selectedOption = "SetFlag";
					pfb.setFlag.button.text = e.flagName;
					pfb.setFlag.tickBox.isChecked = e.flagBool;
					break;
					
				case GameEvent.eEventType.Travel:
					pfb.eventType.selectedOption = "Travel";
					pfb.travel.button.text = e.travelMap;
					pfb.travel.textField.text = e.travelSpawnPoint;
					break;
			
			}
		
		}
	}
	
	function ClearEvents () {
		for ( var i = 0; i < eventContainer.childCount; i++ ) {
			if ( eventContainer.GetChild(i).GetComponent ( EditorInspectorEvent ) ) {
				Destroy ( eventContainer.GetChild(i).gameObject );
			}
		}
	}
	
	function RearrangeEvents () {
		bottomLine = 0;
		
		for ( var i = 0; i < eventContainer.childCount; i++ ) {
			var e : EditorInspectorEvent = eventContainer.GetChild(i).GetComponent(EditorInspectorEvent);
			
			if ( e == null ) { continue; }
			
			e.eventIndex.text = i.ToString();
			e.transform.localPosition = new Vector3 ( 0, bottomLine, 0 );
						
			switch ( e.eventType.selectedOption ) {
				case "": case "NextPath": case "Quest": case "SetFlag":
					bottomLine += 140;
					break;
					
				case "Animation": case "Travel":
					bottomLine += 170;
					break;
			}
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
				var e : EditorInspectorEvent = eventContainer.GetChild(i).GetComponent(EditorInspectorEvent);
				
				if ( e == null ) { continue; }
				
				var newEvent : GameEvent = new GameEvent();
				
				if ( e.eventDelay.text == "" ) { e.eventDelay.text = "0"; }
				
				newEvent.delay = float.Parse ( e.eventDelay.text );
				
				if ( e.eventCondition.text == "" ) { e.eventCondition.text = "(none)"; e.eventConditionBool.isChecked = false; }
				
				newEvent.condition = e.eventCondition.text;
				newEvent.conditionBool = e.eventConditionBool.isChecked;
				
				switch ( e.eventType.selectedOption ) {
					case "Animation":
						newEvent.type = GameEvent.eEventType.Animation;
						newEvent.animationObject = e.anim.button.text;
						newEvent.animationType = e.anim.popUp.selectedOption;
						
						if ( e.anim.x.text == "" ) { e.anim.x.text = "0"; }
						if ( e.anim.y.text == "" ) { e.anim.y.text = "0"; }
						if ( e.anim.z.text == "" ) { e.anim.z.text = "0"; }
						
						newEvent.animationVector = new Vector3 ( float.Parse(e.anim.x.text), float.Parse(e.anim.y.text), float.Parse(e.anim.z.text) );
						break;
					
					case "Quest":
						newEvent.type = GameEvent.eEventType.Quest;
						newEvent.questID = e.quest.button.text;
						newEvent.questAction = e.quest.popUp.selectedOption;
						break;
						
					case "NextPath":
						newEvent.type = GameEvent.eEventType.NextPath;
						newEvent.nextPathName = e.nextPath.button.text;
						break;
						
					case "SetFlag":
						newEvent.type = GameEvent.eEventType.SetFlag;
						newEvent.flagName = e.setFlag.button.text;
						newEvent.flagBool = e.setFlag.tickBox.isChecked;
						break;
						
					case "Travel":
						newEvent.type = GameEvent.eEventType.Travel;
						newEvent.travelMap = e.travel.button.text;
						newEvent.travelSpawnPoint = e.travel.textField.text;
						break;
				
				}
				
				trg.events.Add ( newEvent );
			}
		}
	}
}