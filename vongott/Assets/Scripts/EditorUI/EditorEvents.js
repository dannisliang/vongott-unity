#pragma strict

class EditorEvents extends OGPage {
	private class AnimationType {
		public var button : OGButton;
		public var popUp : OGPopUp;
		public var x : OGTextField;
		public var y : OGTextField;
		public var z : OGTextField;
	}
	
	private class GiveItemType {
		public var button : OGButton;
		public var textField : OGTextField;
	}
	
	private class ConsequenceType {
		public var questButton : OGButton;
		public var questPopUp : OGPopUp;
		public var flagButton : OGButton;
		public var flagPopUp : OGPopUp;
	}
	
	private class TravelType {
		public var button : OGButton;
		public var textField : OGTextField;
	}
	
	private class NextPathType {
		public var button : OGButton;
	}
	
	private class ToggleDoorType {
		public var button : OGButton;
		public var popup : OGPopUp;
	}
	
	private  var currentEvent : GameEvent;

	public var fileModeSwitch : OGPopUp;
	public var fileModeSelect : GameObject;
	public var fileModeCreate : GameObject;
	
	public var selector : OGButton;
	public var creator : OGTextField;
			
	public var eventType : OGPopUp;
	public var eventTypeContainers : Transform;
	public var eventDelay : OGTextField;
	public var eventCondition : OGButton;
	public var eventConditionBool : OGTickBox;
	
	public var anim : AnimationType;
	public var consequence : ConsequenceType;
	public var travel : TravelType;
	public var nextPath : NextPathType;
	public var toggleDoor : ToggleDoorType;
	public var giveItem : GiveItemType;


	///////////////////
	// Pick functions
	///////////////////
	function PickPrefab ( btn : OGButton ) {
		EditorCore.pickerType = Prefab;
		EditorCore.pickerSender = "Events";
		EditorCore.pickerCallback = function ( hit : RaycastHit ) {
			if ( hit.collider.gameObject.GetComponent(Prefab) ) {
				btn.text = hit.collider.gameObject.GetComponent(GUID).GUID;
			}
		};
		
		EditorCore.SetPickMode ( true );
	}
	
	function PickItem ( btn : OGButton ) {
		EditorPicker.mode = "items";
		EditorPicker.button = btn;
		EditorPicker.sender = "Events";
				
		OGRoot.GetInstance().GoToPage ( "Picker" );
	}
	
	function PickActor ( btn : OGButton ) {
		EditorCore.pickerType = Actor;
		EditorCore.pickerSender = "Events";
		EditorCore.pickerCallback = function ( hit : RaycastHit ) {
			if ( hit.collider.gameObject.GetComponent(Actor) ) {
				btn.text = hit.collider.gameObject.GetComponent(GUID).GUID;
			}
		};
		
		EditorCore.SetPickMode ( true );
	}
	
	function PickDoor ( btn : OGButton ) {
		EditorCore.pickerType = Door;
		EditorCore.pickerSender = "Events";
		EditorCore.pickerCallback = function ( hit : RaycastHit ) {
			if ( hit.collider.gameObject.GetComponent(Door) ) {
				btn.text = hit.collider.gameObject.GetComponent(GUID).GUID;
			}
		};
		
		EditorCore.SetPickMode ( true );
	}
	
	function PickQuest ( btn : OGButton ) {
		EditorPicker.mode = "quest";
		EditorPicker.button = btn;
		EditorPicker.sender = "Events";
				
		OGRoot.GetInstance().GoToPage ( "Picker" );
	}
	
	function PickEvent ( btn : OGButton ) {
		EditorPicker.mode = "event";
		EditorPicker.button = btn;
		EditorPicker.sender = "Events";
		EditorPicker.func = Load;
						
		OGRoot.GetInstance().GoToPage ( "Picker" );
	}
	
	function CreateEvent () {	
		selector.text = creator.text;
	
		fileModeSwitch.selectedOption = "Load";
		SelectMode();
		currentEvent = new GameEvent ();
		currentEvent.id = creator.text;
	}
	
	function PickMap ( btn : OGButton ) {
		EditorPicker.mode = "map";
		EditorPicker.button = btn;
		EditorPicker.sender = "Events";
				
		OGRoot.GetInstance().GoToPage ( "Picker" );
	}
	
	function PickFlag ( btn : OGButton ) {
		EditorPicker.mode = "flag";
		EditorPicker.button = btn;
		EditorPicker.sender = "Events";
				
		OGRoot.GetInstance().GoToPage ( "Picker" );
	}

	function SelectMode () {
		if ( fileModeSwitch.selectedOption == "Load" ) {
			fileModeSelect.SetActive ( true );
			fileModeCreate.SetActive ( false );
		} else {
			fileModeSelect.SetActive ( false );
			fileModeCreate.SetActive ( true );
		}
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
	
	override function UpdatePage () {
		if ( anim.x.text == "" ) { anim.x.text = "0"; }
		if ( anim.y.text == "" ) { anim.y.text = "0"; }
		if ( anim.z.text == "" ) { anim.z.text = "0"; }
	}
	
	// Init
	public function Clear () {		
		eventDelay.text = "0";
		
		eventCondition.text = "(none)";
		eventConditionBool.isTicked = false;
	
		eventType.selectedOption = "";
		
		anim.button.text = "(none)";
		anim.button.hiddenString = "";
		anim.popUp.selectedOption = "";
		anim.x.text = "";
		anim.y.text = "";
		anim.z.text = "";
		
		consequence.questButton.text = "(none)";
		consequence.questPopUp.selectedOption = "Start";
		consequence.flagButton.text = "(none)";
		consequence.flagPopUp.selectedOption = "True";
				
		nextPath.button.text = "(none)";
		nextPath.button.hiddenString = "";
		
		travel.button.text = "(none)";
		travel.textField.text = "";
		
		giveItem.button.text = "(none)";
		giveItem.textField.text = "0";
		
		SetVisible ( "" );
	}
	
	override function StartPage () {
		
	}

	private function Populate ( e : GameEvent ) {
		if ( e ) {
			eventDelay.text = e.delay.ToString();
			
			if ( e.condition != "" ) {
				eventCondition.text = e.condition;
				eventConditionBool.isTicked = e.conditionBool;
			} else {
				eventCondition.text = "(none)";
				eventConditionBool.isTicked = false;
			}
			
			switch ( e.type ) {
				case GameEvent.eEventType.Animation:
					eventType.selectedOption = "Animation";
					if ( e.animationObject != "" ) { anim.button.text = e.animationObject; }
					anim.popUp.selectedOption = e.animationType;
					anim.x.text = e.animationVector.x.ToString();
					anim.y.text = e.animationVector.y.ToString();
					anim.z.text = e.animationVector.z.ToString();
					break;
				
				case GameEvent.eEventType.Consequence:
					eventType.selectedOption = "Consequence";
					consequence.questButton.text = e.questID;
					consequence.questPopUp.selectedOption = e.questAction;
					consequence.flagButton.text = e.flagName;
					consequence.flagPopUp.selectedOption = e.flagBool.ToString();
					break;
					
				case GameEvent.eEventType.NextPath:
					eventType.selectedOption = "NextPath";
					nextPath.button.text = e.nextPathName;
					break;
					
				case GameEvent.eEventType.ToggleDoor:
					eventType.selectedOption = "ToggleDoor";
					toggleDoor.button.text = e.toggleDoorName;
					toggleDoor.popup.selectedOption = e.toggleDoorBool ? "Open" : "Close";
					break;
					
				case GameEvent.eEventType.Travel:
					eventType.selectedOption = "Travel";
					travel.button.text = e.travelMap;
					travel.textField.text = e.travelSpawnPoint;
					break;
					
				case GameEvent.eEventType.GiveItem:
					eventType.selectedOption = "GiveItem";
					giveItem.button.text = e.giveItem;
					giveItem.textField.text = e.giveCost.ToString();
					break;
			
			}
		
			SetVisible ( eventType.selectedOption );
		
		}
	}

	function Load () {
		currentEvent = Loader.LoadEvent ( selector.text );
		Populate ( currentEvent );
	}
	
	function Save () {
		currentEvent.id = selector.text;
		
		currentEvent.delay = float.Parse(eventDelay.text);
			
		if ( eventCondition.text != "" ) {
			currentEvent.condition = eventCondition.text;
			currentEvent.conditionBool = eventConditionBool.isTicked;
		} else {
			currentEvent.condition = "";
			currentEvent.conditionBool = false;
		}
		
		switch ( eventType.selectedOption ) {
			case "Animation":
				currentEvent.type = GameEvent.eEventType.Animation;
				currentEvent.animationObject = anim.button.text;
				currentEvent.animationType = anim.popUp.selectedOption;
				currentEvent.animationVector = new Vector3 ( float.Parse(anim.x.text), float.Parse(anim.y.text), float.Parse(anim.z.text) );
				break;
			
			case "Consequence":
				currentEvent.type = GameEvent.eEventType.Consequence;
				currentEvent.questID = consequence.questButton.text;
				currentEvent.questAction = consequence.questPopUp.selectedOption;
				currentEvent.flagName = consequence.flagButton.text;
				currentEvent.flagBool = consequence.flagPopUp.selectedOption == "True";
				break;
				
			case "NextPath":
				currentEvent.type = GameEvent.eEventType.NextPath;
				currentEvent.nextPathName = nextPath.button.text;
				break;
				
			case "ToggleDoor":
				currentEvent.type = GameEvent.eEventType.ToggleDoor;
				currentEvent.toggleDoorName = toggleDoor.button.text;
				currentEvent.toggleDoorBool = toggleDoor.popup.selectedOption == "Open";
				break;
				
			case "Travel":
				currentEvent.type = GameEvent.eEventType.Travel;
				currentEvent.travelMap = travel.button.text;
				currentEvent.travelSpawnPoint = travel.textField.text;
				break;
				
			case "GiveItem":
				currentEvent.type = GameEvent.eEventType.GiveItem;
				currentEvent.giveItem = giveItem.button.text;
				currentEvent.giveCost = int.Parse ( giveItem.textField.text );
				break;
		
		}
		
		Saver.SaveEvent ( currentEvent );
	}
	
	// Exit
	function Cancel () {
		OGRoot.GetInstance().GoToPage ( "MenuBase" );
		
		Clear ();
	}
}
