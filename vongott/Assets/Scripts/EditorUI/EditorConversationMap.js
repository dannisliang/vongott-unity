#pragma strict

class EditorConversationMap extends OGPage {
	public class Creator {
		public var instance : GameObject;
		public var chapter : OGTextField;
		public var scene : OGTextField;
		public var name : OGTextField;
	}
	
	public class IOReference {
		public var rank : int = 0;
		public var transforms : Transform[];
	
		function IOReference ( rank : int, transforms : Transform[] ) {
			this.rank = rank;
			this.transforms = transforms;
		}
	}

	public static var instance : EditorConversationMap;
	
	public var fileModeSwitch : OGPopUp;
	public var selector : OGButton;
	public var creator : Creator;
	
	public var lineColor : Color;
	
	public var title : OGLabel;
	public var message : OGLabel;
	public var saveButton : OGButton;
	public var yesButton : OGButton;
	public var noButton : OGButton;
	
	public var cellDistance : float = 240;
	public var nodePrefab : EditorConversationNode;
	public var rootNodePrefab : EditorConversationRootNode;
	public var connectionCallback : Function;
	public var connectOutput : OGButton;
	public var connectMode : boolean = false;
	public var currentRootNode : EditorConversationRootNode;
	public var scrollView : OGScrollView;
	public var nodeContainer : Transform;
	
	private var nodeIOPoints : List.< IOReference > = new List.< IOReference >();
	private var bottomLines : float[] = new float[1000];
	private var rootBottomLines : float[] = new float[1000];
	private var currentConvo : ConversationTree;
	private var currentRootIndex : int = 0;
	private var root : OGRoot;
	private var matrix : EditorConversationNode[,] = new EditorConversationNode[999,999];


	////////////////////
	// File I/O
	////////////////////
	// Switch mode
	function SelectFileMode ( mode : String ) {
		if ( mode == "Load" ) {
			selector.gameObject.SetActive ( true );
			creator.instance.SetActive ( false );
		} else {
			selector.gameObject.SetActive ( false );
			creator.instance.SetActive ( true );
		}
	}
	
	// Create convo
	function Create () {
		if ( creator.chapter.text == "" || creator.scene.text == "" || creator.name.text == "" ) { return; }
		
		ClearNodes ();
								
		SelectFileMode ( "Load" );
		selector.text = creator.chapter.text + "/" + creator.scene.text + "/" + creator.name.text;
		
		Save ();
	}
	
	// Pick convo
	function PickConvo ( btn : OGButton ) {
		EditorPicker.mode = "conversation";
		EditorPicker.button = selector;
		EditorPicker.sender = "ConversationMap";
		
		EditorPicker.func = LoadConversation;
		
		OGRoot.GetInstance().GoToPage ( "Picker" );
	}
	
	function Populate () : IEnumerator {
		yield WaitForEndOfFrame ();
				
		currentConvo = Loader.LoadConversationTree ( selector.text );
		
		var i : int = 0;
		var stringList : List.<String> = new List.<String>();

		for ( var rootNode : ConversationRootNode in currentConvo.rootNodes ) {
			stringList.Add ( i.ToString() );
			i++;
		}
		
		currentRootNode.switcher.SetOptions ( stringList.ToArray() );

		LoadRootNode ( 0 );
		
		yield WaitForEndOfFrame ();
		
		UpdateRootNode ();
	}

	function LoadConversation () {
		ClearNodes ();
		
		StartCoroutine ( Populate () );
	}
	
	// Save
	function Save () {	
		Saver.SaveConversationTree ( selector.text, currentRootIndex, currentRootNode );
	}
	
	// Exit
	function Exit () {
		ClearNodes ();
	
		creator.chapter.text = "";
		creator.scene.text = "";
		creator.name.text = "";
	
		selector.text = "(none)";
	
		OGRoot.GetInstance().GoToPage ( "MenuBase" );
	}
	
	
	////////////////////
	// Main functions
	////////////////////
	function Start () {
		instance = this;
	}
	
	public static function GetInstance() : EditorConversationMap {
		return instance;
	}
	
	public function ClearNodes () {
		if ( currentRootNode.connectedTo ) {
			RemoveNodeRecursively ( currentRootNode.connectedTo );
		}
	}

	public function ConnectNodes ( callback : Function, activeOutput : OGButton ) {
		connectionCallback = callback;
		connectOutput = activeOutput;
		connectMode = true;
		
		UpdateRootNode ();
	}
	
	public function GetRootStrings() : String[] {
		return currentRootNode.switcher.options;
	}
	
	
	////////////////////
	// Draw lines
	////////////////////
	public function GetOutputPosition ( t : Transform ) : Vector3 {
		if ( t ) {
			return t.position + scrollView.position + new Vector3 ( scrollView.padding.x + t.lossyScale.x/2, scrollView.padding.y + t.lossyScale.y/2, 0 );
		} else {
			return Vector3.zero;
		}
	}
	
	function DrawLines () {
		if ( !nodeIOPoints ) { return; }

		//Handles.color = lineColor;
		var p0 : Vector3;
		var p1 : Vector3;
		var p2 : Vector3;
		var p3 : Vector3;
		
		root.lineClip = scrollView.drawRct;

		if ( !connectMode ) {
			root.lines = new OGLine [ nodeIOPoints.Count * 3 ];
	
			for ( var i : int = 0; i < nodeIOPoints.Count; i++ ) {
				var io : IOReference = nodeIOPoints[i];
				
				p0 = GetOutputPosition(io.transforms[0]);
				p3 = GetOutputPosition(io.transforms[1]);
				p1 = p0;
				p1.y = p3.y - ( 20 + io.rank * 5 );
				p2 = p1;
				p2.x = p3.x;

				root.lines [ i * 3 ] = new OGLine ( p0, p1 );
				root.lines [ 1 + i * 3 ] = new OGLine ( p1, p2 );
				root.lines [ 2 + i * 3 ] = new OGLine ( p2, p3 );
			}
		
		} else {
			root.lines = new OGLine [ 3 ];
			
			p0 = GetOutputPosition(connectOutput.transform);
			p3 = new Vector3 ( Input.mousePosition.x, Screen.height-Input.mousePosition.y, 0 );
			p1 = p0;
			p1.y = p3.y - 20;
			p2 = p1;
			p2.x = p3.x;
			
			root.lines [ 0 ] = new OGLine ( p0, p1 );
			root.lines [ 1 ] = new OGLine ( p1, p2 );
			root.lines [ 2 ] = new OGLine ( p2, p3 );
		}
	}
	
	
	////////////////////
	// Prompt
	////////////////////
	public function InvokePrompt ( yes : Function, no : Function, ttl : String, msg : String ) {
		title.text = ttl;
		message.text = msg;
		
		yesButton.gameObject.SetActive ( true );
		noButton.gameObject.SetActive ( true );
		saveButton.gameObject.SetActive ( false );
		scrollView.gameObject.SetActive ( false );
		
		yesButton.func = yes;
		noButton.func = no;
	} 
	
	public function CancelPrompt () {
		title.text = "Conversation Map";
		message.text = "";
		
		yesButton.gameObject.SetActive ( false );
		noButton.gameObject.SetActive ( false );
		saveButton.gameObject.SetActive ( true );
		scrollView.gameObject.SetActive ( true );
		
		UpdateRootNode ();
	}
	
	
	////////////////////
	// Nodes
	////////////////////
	// Root
	public function LoadRootNode ( str : String ) {
		LoadRootNode ( int.Parse ( str ) );
	}

	public function LoadRootNode ( i : int ) {
		if ( currentRootNode.connectedTo ) {
			ClearNodes ();
		}
	
		if ( currentConvo ) {	
			var reference : ConversationRootNode = currentConvo.rootNodes[i];
			currentRootNode.auto.isTicked = reference.auto;
			currentRootNode.passive.isTicked = reference.passive;
			if ( reference.connectedTo ) {
				currentRootNode.connectedTo = CreateNode ( reference.connectedTo );
			}

			UpdateRootNode ();
		}	
	}
	
	public function CreateRootNode ( btn : OGButton ) {
		CreateRootNode ();
	}
	
	public function CreateRootNode () {
	}
	
	public function RemoveRootNode ( index : int ) {
		InvokePrompt (
			function () {
				// Remove it!!
				CancelPrompt ();
			},
			CancelPrompt,
			"Are you sure?",
			"This will remove all child nodes. Proceed?"
		);
	}
	
	// Child nodes
	public function SetOrphaned ( node : EditorConversationNode ) {
		node.targetPos += new Vector3 ( -10, 10, 2 );
		node.SetRootNode ( -1 );
		node.rootIndex = -1;
		node.nodeIndex = -1;
		node.offset = 0;

		UpdateRootNode ();
	}
	
	// ^ Check exising node
	private function CheckExisting ( newNode : ConversationNode ) : EditorConversationNode {
		for ( var n : Component in nodeContainer.GetComponentsInChildren ( EditorConversationNode ) ) {
			var existingNode = n as EditorConversationNode;
			
			if ( existingNode.initRootIndex == newNode.rootIndex && existingNode.initNodeIndex == newNode.nodeIndex  ) {
				return existingNode;
			}
		}
	
		return null;
	}
	
	// ^ From data reference
	public function CreateNode ( nodeSender : EditorConversationNode, reference : ConversationNode, outputIndex : int ) {
		var existing : EditorConversationNode = CheckExisting ( reference );
		
		if ( existing ) {
			nodeSender.SetConnection ( outputIndex, existing );
			return;
		}
		
		var newNode : EditorConversationNode = Instantiate ( nodePrefab );
		
		newNode.SetData ( reference );
	
		newNode.transform.parent = nodeContainer;
		newNode.transform.localScale = Vector3.one;
		newNode.transform.position = new Vector3 ( nodeSender.targetPos.x, nodeSender.targetPos.y, 0 );
		
		nodeSender.SetConnection ( outputIndex, newNode );
	
		for ( var i : int = 0; i < reference.connectedTo.Count; i++ ) {
			CreateNode ( newNode, reference.connectedTo[i], i );
		}
		
		UpdateRootNode ();
	}
	
	public function CreateNode ( reference : ConversationNode ) : EditorConversationNode {
		var newNode : EditorConversationNode = Instantiate ( nodePrefab );
		
		newNode.SetData ( reference );
		
		newNode.transform.parent = nodeContainer;
		newNode.transform.localScale = Vector3.one;
		newNode.transform.position = new Vector3 ( currentRootNode.output.transform.position.x + 30, currentRootNode.output.transform.position.y, 0 );
		
		for ( var i : int = 0; i < reference.connectedTo.Count; i++ ) {
			CreateNode ( newNode, reference.connectedTo[i], i );
		}
		
		UpdateRootNode ();

		return newNode;
	}
	
	// ^ From scratch
	public function CreateFirstNode () {
		var newNode : EditorConversationNode = Instantiate ( nodePrefab );
		
		newNode.SetType ( "Speak" );
		
		newNode.transform.parent = nodeContainer;
		newNode.transform.localScale = Vector3.one;
		newNode.transform.position = new Vector3 ( currentRootNode.output.transform.position.x, currentRootNode.output.transform.position.y + 100, 0 );
		
		currentRootNode.connectedTo = newNode;

		UpdateRootNode ();
		
		return newNode;
	}
	
	public function CreateNode ( fromNode : EditorConversationNode, outputIndex : int ) : EditorConversationNode {
		var newNode : EditorConversationNode = Instantiate ( nodePrefab );
		
		newNode.SetType ( "Speak" );
		
		newNode.transform.parent = nodeContainer;
		newNode.transform.localScale = Vector3.one;
		newNode.transform.position = new Vector3 ( fromNode.activeOutputs[outputIndex].transform.position.x, fromNode.activeOutputs[outputIndex].transform.position.y + 30, 0 );
		
		fromNode.SetConnection ( outputIndex, newNode );
		
		UpdateRootNode ();
		
		return newNode;
	}
	
	public function RemoveNodeRecursively ( removeNode : EditorConversationNode ) {
		for ( var i : int = 0; i < removeNode.connectedTo.Length; i++ ) {
			if ( removeNode.connectedTo[i] ) {
				RemoveNodeRecursively ( removeNode.connectedTo[i] );
			}
		}
		
		RemoveNode ( removeNode );
		
		UpdateRootNode ();
	}
	
	public function RemoveNode ( removeNode : EditorConversationNode ) {
		for ( var i : int = 0; i < removeNode.connectedTo.Length; i++ ) {
			removeNode.SetConnection ( i, null );
		}
		
		Destroy ( removeNode.gameObject );
		
		UpdateRootNode ();
	}	
	
	private function SetDirty () {
		for ( var n : Component in nodeContainer.GetComponentsInChildren ( EditorConversationNode ) ) {
			( n as EditorConversationNode ).dirty = true;
		}
	}
	
	private function GetRightMostIndex ( y : int ) : int {
		for ( var x : int = 0; x < 1000; x++ ) {
			if ( matrix[x,y] == null ) {
				return x;
			}
		}

		return 999;
	}
	
	private function GetRightMostOffset ( y : int ) : float {
		var offset : float = 0;
		
		for ( var x : int = 0; x < 1000; x++ ) {
			if ( matrix[x,y] != null ) {
				offset += matrix[x,y].frame.localScale.x + 20;
			} else {
				break;
			}
		}

		return offset;
	}

	private function UpdateNodePosition ( yIndex : int, node : EditorConversationNode ) {			
		if ( !node.dirty ) { return; }
		
		node.dirty = false;
		
		var pos : Vector3;
		pos.x = 10 + GetRightMostOffset ( yIndex );
		pos.y = 200 + yIndex * cellDistance;
		pos.z = scrollView.transform.position.z + 5;
		
		var xIndex : int = GetRightMostIndex(yIndex);
		matrix[xIndex,yIndex] = node;
		
		node.targetPos = pos;

		for ( var i : int = 0; i < node.connectedTo.Length; i++ ) {
			if ( node.activeOutputs[i] && node.connectedTo[i] ) {
				var points : Transform[] = new Transform[2];
				points[0] = node.activeOutputs[i].transform;
				points[1] = node.connectedTo[i].input.transform;
				
				nodeIOPoints.Add ( new IOReference ( xIndex + i, points ) );
				
				UpdateNodePosition ( yIndex + 1, node.connectedTo[i] );
			}
		}
	}
	
	private function UpdateRootNodePosition ( ) {
		if ( currentRootNode.connectedTo ) {				
			var rootPoints : Transform[] = new Transform[2];
			rootPoints[0] = currentRootNode.output.transform;
			rootPoints[1] = currentRootNode.connectedTo.input.transform;
			
			nodeIOPoints.Add ( new IOReference ( currentRootIndex, rootPoints ) );

			UpdateNodePosition ( 0, currentRootNode.connectedTo );
		}
	}
	
	public function UpdateRootNode () {
		nodeIOPoints = null;
		matrix = new EditorConversationNode[1000,1000];

		SetDirty ();
		
		if ( nodeIOPoints ) {
			nodeIOPoints.Clear ();
		} else {
			nodeIOPoints = new List.< IOReference >();
		}

		UpdateRootNodePosition ();
	}
	
	
	////////////////////
	// Update
	////////////////////
	function Update () {
		if ( root ) {
			DrawLines ();
		} else {
			root = OGRoot.GetInstance();
		}
		
		if ( Input.GetKeyDown ( KeyCode.Escape ) || Input.GetMouseButtonDown ( 1 ) ) {
			connectMode = false;
		}
		
		// Keep the root nodes visible
		//rootNodes.transform.parent.localPosition = Vector3.Lerp ( rootNodes.transform.parent.localPosition, new Vector3 ( 0, 40 - scrollView.position.y, 0 ), Time.deltaTime * 10 );
	}
}
