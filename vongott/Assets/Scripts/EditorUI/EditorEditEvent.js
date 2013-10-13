#pragma strict

class EditorEditEvent extends OGPage {
	private class AnimationType {
		public var button : OGButton;
		public var popUp : OGPopUp;
		public var x : OGTextField;
		public var y : OGTextField;
		public var z : OGTextField;
	}
	
	private class QuestType {
		public var button : OGButton;
		public var popUp : OGPopUp;
	}
	
	private class TravelType {
		public var button : OGButton;
		public var textField : OGTextField;
	}
	
	private class NextPathType {
		public var button : OGButton;
	}
	
	private class SetFlagType {
		public var button : OGButton;
		public var tickBox : OGTickBox;
	}
		
	public var eventCodeInput : OGTextField;
	public var eventType : OGPopUp;
	public var eventTypeContainers : Transform;
	public var eventDelay : OGTextField;
	public var eventCondition : OGButton;
	public var eventConditionBool : OGTickBox;
	
	public var anim : AnimationType;
	public var quest : QuestType;
	public var travel : TravelType;
	public var nextPath : NextPathType;
	public var setFlag : SetFlagType;
	
	public static var callback : Function;
	public static var sender : String = "";
	public static var eventCode : String = "";
	public static var event : GameEvent;
	

	///////////////////
	// Pick functions
	///////////////////
	function PickPrefab ( btn : OGButton ) {
		EditorCore.SetPickMode ( true );
	
		EditorCore.pickerCallback = function ( hit : RaycastHit ) {
			if ( hit.collider.gameObject.GetComponent(Prefab) ) {
				btn.text = hit.collider.gameObject.GetComponent(Prefab).id;
				btn.hiddenString = hit.collider.gameObject.GetComponent(GUID).GUID;
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
		};
	}
	
	function PickQuest ( btn : OGButton ) {
		EditorPicker.mode = "quest";
		EditorPicker.button = btn;
		EditorPicker.sender = "EditEvent";
				
		OGRoot.GoToPage ( "Picker" );
	}
	
	function PickMap ( btn : OGButton ) {
		EditorPicker.mode = "map";
		EditorPicker.button = btn;
		EditorPicker.sender = "EditEvent";
				
		OGRoot.GoToPage ( "Picker" );
	}
	
	function PickFlag ( btn : OGButton ) {
		EditorPicker.mode = "flag";
		EditorPicker.button = btn;
		EditorPicker.sender = "EditEvent";
				
		OGRoot.GoToPage ( "Picker" );
	}


	///////////////////
	// Main functions
	///////////////////	
	private function SetVisible ( n : String ) {
		for ( var i = 0; i < eventTypeContainers.childCount; i++ ) {
			eventTypeContainers.GetChild(i).gameObject.SetActive ( eventTypeContainers.GetChild(i).gameObject.name == n );
		}
	}
	
	// Update
	public function UpdateType ( type : String ) {
		SetVisible ( type );
	}
	
	// Init
	private function Clear () {
		event = null;
		eventCode = "";
		sender = "";
		
		eventDelay.text = "0";
		
		eventCondition.text = "(none)";
		eventConditionBool.isChecked = false;
	
		eventType.selectedOption = "";
		
		anim.button.text = "(none)";
		anim.button.hiddenString = "";
		anim.popUp.selectedOption = "";
		anim.x.text = "";
		anim.y.text = "";
		anim.z.text = "";
		
		quest.button.text = "(none)";
		quest.popUp.selectedOption = "";
		
		nextPath.button.text = "(none)";
		nextPath.button.hiddenString = "";
		
		setFlag.button.text = "(none)";
		setFlag.tickBox.isChecked = false;
		
		travel.button.text = "(none)";
		travel.textField.text = "";
		
		eventCodeInput.text = "";
		
		SetVisible ( "" );
	}
	
	override function StartPage () {
		if ( event != null ) {
			Populate ( event );
			event = null;
		
		} else if ( eventCode != "" ) {
			Populate ( Deserializer.DeserializeGameEvent ( new JSONObject ( eventCode, false ) ) );
			eventCode = "";
		
		}
	}

	private function Populate ( e : GameEvent ) {
		if ( e ) {
			eventDelay.text = e.delay.ToString();
			
			if ( e.condition != "" ) {
				eventCondition.text = e.condition;
				eventConditionBool.isChecked = e.conditionBool;
			} else {
				eventCondition.text = "(none)";
				eventConditionBool.isChecked = false;
			}
			
			switch ( e.type ) {
				case GameEvent.eEventType.Animation:
					eventType.selectedOption = "Animation";
					if ( e.animationObject != "" ) { anim.button.text = EditorCore.GetPrefab ( e.animationObject ).id; }
					anim.button.hiddenString = e.animationObject;
					anim.popUp.selectedOption = e.animationType;
					anim.x.text = e.animationVector.x.ToString();
					anim.y.text = e.animationVector.y.ToString();
					anim.z.text = e.animationVector.z.ToString();
					break;
				
				case GameEvent.eEventType.Quest:
					eventType.selectedOption = "Quest";
					quest.button.text = e.questID;
					quest.popUp.selectedOption = e.questAction;
					break;
					
				case GameEvent.eEventType.NextPath:
					eventType.selectedOption = "NextPath";
					nextPath.button.text = EditorCore.GetActor ( e.nextPathName ).displayName;
					nextPath.button.hiddenString = e.nextPathName;
					break;
					
				case GameEvent.eEventType.SetFlag:
					eventType.selectedOption = "SetFlag";
					setFlag.button.text = e.flagName;
					setFlag.tickBox.isChecked = e.flagBool;
					break;
					
				case GameEvent.eEventType.Travel:
					eventType.selectedOption = "Travel";
					travel.button.text = e.travelMap;
					travel.textField.text = e.travelSpawnPoint;
					break;
			
			}
		
			Serialize ();
		
			SetVisible ( eventType.selectedOption );
		
		}
	}

	// Serialize
	public function Serialize () {		
		var event : GameEvent = new GameEvent ();
		
		if ( eventDelay.text == "" ) { eventDelay.text = "0"; }
		event.delay = float.Parse(eventDelay.text);
		
		if ( eventCondition.text != "" && eventCondition.text != "(none)" ) {
			event.condition = eventCondition.text;
			event.conditionBool = eventConditionBool.isChecked;
		
		} else {
			eventConditionBool.isChecked = false;
		
		}
				
		switch ( eventType.selectedOption ) {
			case "Animation":
				event.type = GameEvent.eEventType.Animation;
				event.animationObject = anim.button.hiddenString;
				event.animationType = anim.popUp.selectedOption;
				event.animationVector = new Vector3 ( float.Parse ( anim.x.text ), float.Parse ( anim.y.text ), float.Parse ( anim.z.text ) );
				break;
			
			case "Quest":
				event.type = GameEvent.eEventType.Quest;
				event.questID = quest.button.text;
				event.questAction = quest.popUp.selectedOption;
				break;
				
			case "NextPath":
				event.type = GameEvent.eEventType.NextPath;
				event.nextPathName = nextPath.button.hiddenString;
				break;
				
			case "SetFlag":
				event.type = GameEvent.eEventType.SetFlag;
				event.flagName = setFlag.button.text;
				event.flagBool = setFlag.tickBox.isChecked;
				break;
				
			case "Travel":
				event.type = GameEvent.eEventType.Travel;
				event.travelMap = travel.button.text;
				event.travelSpawnPoint = travel.textField.text;
				break;
		
		}
		
		eventCodeInput.text = Serializer.SerializeGameEvent(event).ToString();
	}

	// Exit
	function OK () {
		if ( callback != null ) {
			Serialize ();
			callback ( eventCodeInput.text );
			callback = null;
		}
		
		if ( sender == "" ) { sender == "MenuBase"; }
		OGRoot.GoToPage ( sender );
		
		Clear ();
	}
	
	function Cancel () {
		if ( sender == "" ) { sender == "MenuBase"; }
		OGRoot.GoToPage ( sender );
		
		Clear ();
	}
}