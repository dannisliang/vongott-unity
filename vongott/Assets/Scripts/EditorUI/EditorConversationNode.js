#pragma strict

class EditorConversationNode extends MonoBehaviour {
	
	public class Speak {
		public var addBtn : OGButton;
		public var speakerPopUp : OGPopUp;
		public var lines : Transform;
		public var linePrefab : EditorConversationNodeLine;
	}
	
	public class Condition {
		public var flag : OGButton;
		public var outputTrue : OGButton;
		public var outputFalse : OGButton;
	}
	
	public class Consequence { 
		public var flag : OGButton;
		public var bool : OGPopUp;
		public var output : OGButton;
	}
	
	public class EventNode {
		public var event : OGButton;
		public var output : OGButton;
	}
	
	public class EndConvo {
		public var action : OGPopUp;
		public var nextRoot : OGPopUp;
	}
	
	public class Exchange {
		public var item : OGButton;
		public var credits : OGTextField;
		public var outputFailed : OGButton;
		public var outputSuccess : OGButton;
	}
	
	public var initRootIndex : int = -1;
	public var initNodeIndex : int = -1;
	
	public var rootIndex : int = -1;
	public var nodeIndex : int = -1;
	public var dirty : boolean = false;
	
	public var extraButtonsContainer : Transform;
	public var removeBtn : OGButton;
	public var frame : Transform;
	public var type : Transform;
	public var typeSelector : OGPopUp;
	public var selectedType : String;
	public var allTypes : GameObject[];
	public var input : OGButton;
	public var rootNodeLabel : OGLabel;
	
	public var speak : Speak;
	public var condition : Condition;
	public var consequence : Consequence;
	public var gameEvent : EventNode;
	public var endConvo : EndConvo;
	public var exchange : Exchange;
	
	public var connectedTo : EditorConversationNode[] = new EditorConversationNode[3];
	public var activeOutputs : OGButton[] = new OGButton[3];
	
	public var targetPos : Vector3;
	
	public var rootNodes : List.< int > = new List.< int >();
	public var displayedRootNode : int = -1;
	
	// Init
	public function Start () {
		targetPos = this.transform.position;
	}
	
	public function Init () {
		activeOutputs = new OGButton[3];
		connectedTo = new EditorConversationNode[3];
	}
	
	// Set data
	public function SetData ( reference : ConversationNode ) {
		ClearConnections();
		
		initRootIndex = reference.rootIndex;
		initNodeIndex = reference.nodeIndex;
		
		switch ( reference.type ) {
			case "Speak":
				ChangeSpeaker ( reference.speaker );
				for ( var str : String in reference.lines ) {
					AddLine ( str );
				}				
				break;
				
			case "GameEvent":
				gameEvent.event.text = reference.event;
				break;
				
			case "Condition":
				condition.flag.text = reference.condition;
				break;
				
			case "Consequence":
				consequence.flag.text = reference.consequence;
				if ( reference.consequenceBool ) {
					consequence.bool.selectedOption = "True";
				} else {
					consequence.bool.selectedOption = "False";
				}				
				break;
			
			case "EndConvo":
				endConvo.action.selectedOption = reference.action;
				endConvo.nextRoot.selectedOption = reference.nextRoot.ToString ();
				break;
				
			case "Exchange":
				exchange.item.text = reference.item;
				exchange.credits.text = reference.credits.ToString ();
				break;
		}
		
		SetType ( reference.type );
	}
	
	// Switch type
	public function SetType ( type : String ) {
		for ( var t : GameObject in allTypes ) {
			t.SetActive ( t.name == type );
		}
		
		selectedType = type;
		
		if ( typeSelector.selectedOption != type ) {
			typeSelector.selectedOption = type;
		}
		
		switch ( type ) {
			case "Speak":
				if ( speak.lines.childCount < 1 ) {
					AddLine ();
				}
				SortLines ();
				break;
			
			case "GameEvent":
				AdjustFrame ( 340, 50, 1 );
				SetActive ( 0, gameEvent.output );
				SetActive ( 1, null );
				SetActive ( 2, null );
				break;
				
			case "Condition":
				AdjustFrame ( 240, 50, 1 );
				SetActive ( 0, condition.outputFalse );
				SetActive ( 1, condition.outputTrue );
				SetActive ( 2, null );
				break;
			
			case "Consequence":
				AdjustFrame ( 240, 50, 1 );
				SetActive ( 0, consequence.output );
				SetActive ( 1, null );
				SetActive ( 2, null );
				break;
			
			case "EndConvo":
				AdjustFrame ( 200, 80, 1 );
				SetActive ( 0, null );
				SetActive ( 1, null );
				SetActive ( 2, null );
				break;
				
			case "Exchange":
				AdjustFrame ( 300, 80, 1 );
				SetActive ( 0, exchange.outputFailed );
				SetActive ( 1, exchange.outputSuccess );
				SetActive ( 2, null );
				break;
		}	
	}
	
	// I/O
	public function RemoveNode () {
		EditorConversationMap.GetInstance().RemoveNode ( this );	
	}
	
	public function CreateNode ( n : String ) {
		var i : int = int.Parse ( n );
				
		EditorConversationMap.GetInstance().CreateNode ( this, i );
	}
	
	public function ClearConnections () {
		connectedTo = new EditorConversationNode[3];
		activeOutputs = new OGButton[3];
		
		EditorConversationMap.GetInstance().UpdateRootNodes ();
	}
	
	public function SetConnection ( i : int, input : EditorConversationNode ) {
		if ( connectedTo[i] && !input ) {			
			EditorConversationMap.GetInstance().SetOrphaned ( connectedTo[i] );
		}
		
		connectedTo[i] = input;
		
		EditorConversationMap.GetInstance().UpdateRootNodes ();
	}
	
	public function SetActive ( i : int, output : OGButton ) {
		if ( connectedTo[i] && !output ) {
			SetConnection ( i, null );
			EditorConversationMap.GetInstance().SetOrphaned ( connectedTo[i] );
		}
		
		activeOutputs[i] = output;
	}
	
	public function TryConnect ( n : String ) {
		var i : int = int.Parse ( n ) ;
	
		SetConnection ( i, null );
	
		EditorConversationMap.GetInstance().ConnectNodes (
			function ( other : EditorConversationNode ) {
				if ( other == this ) { return; }
				
				SetConnection ( i, other );
			},
			
			activeOutputs[i]
		);
	}
	
	public function TryConnect ( btn : OGButton ) {
		TryConnect ( "0" );
	}
	
	public function TryConnect () {
		TryConnect ( "0" );
	}
	
	public function ConnectInput () {
		if ( EditorConversationMap.GetInstance().connectMode ) {
			EditorConversationMap.GetInstance().connectionCallback ( this );
			EditorConversationMap.GetInstance().connectMode = false;
		}
		
		EditorConversationMap.GetInstance().UpdateRootNodes ();
	}
	
	// Flags
	public function PickFlag ( btn : OGButton ) {
		EditorPicker.mode = "flag";
		EditorPicker.button = btn;
		EditorPicker.sender = "ConversationMap";
				
		OGRoot.GetInstance().GoToPage ( "Picker" );
	}
	
	// Items
	public function PickItem ( btn : OGButton ) {
		EditorPicker.mode = "item";
		EditorPicker.button = btn;
		EditorPicker.sender = "ConversationMap";
				
		OGRoot.GetInstance().GoToPage ( "Picker" );
	}
	
	// Speak	
	public function ChangeSpeaker ( speaker : String ) {
		speak.speakerPopUp.selectedOption = speaker;
	
		if ( speaker == "Player" ) {
			speak.addBtn.gameObject.SetActive ( true );
		} else {
			speak.addBtn.gameObject.SetActive ( false );
			RemoveLine ( "1" );
			RemoveLine ( "2" );
		}
		
		StartCoroutine ( SortLines () );
	}
	
	public function RemoveLine ( n : String ) {
		var i : int = int.Parse ( n );
	
		if ( speak.lines.childCount-1 >= i ) {
			Destroy ( speak.lines.GetChild(i).gameObject );	
			StartCoroutine ( SortLines () );
		}
	}
	
	public function AddLine ( str : String ) {
		var i : int = speak.lines.childCount;
	
		var line : EditorConversationNodeLine = Instantiate ( speak.linePrefab ) as EditorConversationNodeLine;
		line.gameObject.name = i.ToString(); 
		
		line.SetText ( str );
		line.SetTarget ( this.gameObject, i );
		
		line.transform.parent = speak.lines;
		line.transform.localScale = Vector3.one;
	
		StartCoroutine ( SortLines () );
	}
	
	public function AddLine ( btn : OGButton ) {
		AddLine ( "" );
	}
	
	public function AddLine () {
		AddLine ( "" );
	}
	
	public function SortLines () : IEnumerator {
		yield WaitForEndOfFrame();
	
		for ( var i : int = 0; i < speak.lines.childCount; i++ ) {
			speak.lines.GetChild(i).localPosition = new Vector3 ( 0, i * 30, 0 );
			speak.lines.GetChild(i).GetComponent(EditorConversationNodeLine).SetRemoveable(i>0);
			speak.addBtn.transform.localPosition = new Vector3 ( 80, 30 + i * 30, 0 );
			
			if ( speak.lines.childCount < 3 && speak.speakerPopUp.selectedOption == "Player" ) {
				speak.addBtn.gameObject.SetActive ( true );
				AdjustFrame ( 420, 30 + (i*30) + 50, 1 );
			} else {
				speak.addBtn.gameObject.SetActive ( false );
				AdjustFrame ( 420, (i*30) + 50, 1 );
			}
		
			SetActive ( i, speak.lines.GetChild(i).GetComponent(EditorConversationNodeLine).outputBtn );
		}
	}

	// Frame
	private function AdjustFrame ( x : float, y : float, z : float ) {
		frame.localScale = new Vector3 ( x, y, z );
		type.localPosition = new Vector3 ( (x/2) - 85, 0, 0 );
		extraButtonsContainer.localPosition = new Vector3 ( frame.localScale.x + 10, 0, 0 );
		removeBtn.transform.localPosition = new Vector3 ( frame.localScale.x, 10, -4 );
		
		EditorConversationMap.GetInstance().UpdateRootNodes ();
	}
	
	// Set root node
	public function SetRootNode ( i : int ) {
		displayedRootNode = i;
	}
	
	public function GetRootNode () : int {
		return displayedRootNode;
	}
										
	// Update
	function Update () {
		this.transform.position = Vector3.Lerp ( this.transform.position, targetPos, Time.deltaTime * 10 );
	
		// Check for init
		if ( activeOutputs.Length < 1 || connectedTo.Length < 0 ) {
			Init ();
		}
	
		// Display the correct number of root nodes
		if ( selectedType == "EndConvo" ) {
			endConvo.nextRoot.SetOptions ( EditorConversationMap.GetInstance().GetRootStrings() );
		}
	
		// Display the right id data
		rootNodeLabel.text = rootIndex.ToString();
	
		// Check for invalid values
		var integer : int = 0;
		if ( !int.TryParse ( exchange.credits.text, integer ) ) {
			exchange.credits.text = "0";
		}
	
		// Check for extra buttons
		for ( var i : int = 0; i < extraButtonsContainer.childCount; i++ ) {
			if ( activeOutputs[i] && !connectedTo[i] ) {
				extraButtonsContainer.GetChild(i).gameObject.SetActive ( true );
				extraButtonsContainer.GetChild(i).position = new Vector3 ( activeOutputs[i].transform.position.x + 30, activeOutputs[i].transform.position.y, 0 );
			} else {
				extraButtonsContainer.GetChild(i).gameObject.SetActive ( false );
			}
		}
	}
}