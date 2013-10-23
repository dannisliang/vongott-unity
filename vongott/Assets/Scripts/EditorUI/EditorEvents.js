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
	public var quest : QuestType;
	public var travel : TravelType;
	public var nextPath : NextPathType;
	public var setFlag : SetFlagType;
	public var giveItem	: GiveItemType;


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
				
		OGRoot.GoToPage ( "Picker" );
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
	
	function PickQuest ( btn : OGButton ) {
		EditorPicker.mode = "quest";
		EditorPicker.button = btn;
		EditorPicker.sender = "Events";
				
		OGRoot.GoToPage ( "Picker" );
	}
	
	function PickEvent ( btn : OGButton ) {
		EditorPicker.mode = "event";
		EditorPicker.button = btn;
		EditorPicker.sender = "Events";
		EditorPicker.func = Load;
						
		OGRoot.GoToPage ( "Picker" );
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
				
		OGRoot.GoToPage ( "Picker" );
	}
	
	function PickFlag ( btn : OGButton ) {
		EditorPicker.mode = "flag";
		EditorPicker.button = btn;
		EditorPicker.sender = "Events";
				
		OGRoot.GoToPage ( "Picker" );
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
				eventConditionBool.isChecked = e.conditionBool;
			} else {
				eventCondition.text = "(none)";
				eventConditionBool.isChecked = false;
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
				
				case GameEvent.eEventType.Quest:
					eventType.selectedOption = "Quest";
					quest.button.text = e.questID;
					quest.popUp.selectedOption = e.questAction;
					break;
					
				case GameEvent.eEventType.NextPath:
					eventType.selectedOption = "NextPath";
					nextPath.button.text = e.nextPathName;
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
			currentEvent.conditionBool = eventConditionBool.isChecked;
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
			
			case "Quest":
				currentEvent.type = GameEvent.eEventType.Quest;
				currentEvent.questID = quest.button.text;
				currentEvent.questAction = quest.popUp.selectedOption;
				break;
				
			case "NextPath":
				currentEvent.type = GameEvent.eEventType.NextPath;
				currentEvent.nextPathName = nextPath.button.text;
				break;
				
			case "SetFlag":
				currentEvent.type = GameEvent.eEventType.SetFlag;
				currentEvent.flagName = setFlag.button.text;
				currentEvent.flagBool = setFlag.tickBox.isChecked;
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
		OGRoot.GoToPage ( "MenuBase" );
		
		Clear ();
	}
}