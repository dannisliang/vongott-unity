#pragma strict

class EditorConversationMap extends OGPage {
	public class Creator {
		public var instance : GameObject;
		public var chapter : OGTextField;
		public var scene : OGTextField;
		public var name : OGTextField;
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
	
	public var cellDistance : float = 100;
	public var nodePrefab : EditorConversationNode;
	public var rootNodePrefab : EditorConversationRootNode;
	public var connectionCallback : Function;
	public var connectOutput : OGButton;
	public var connectMode : boolean = false;
	public var rootNodes : Transform;
	public var rootNodeBackground : Transform;
	public var addRootNode : OGButton;
	public var scrollView : OGScrollView;
	public var nodeContainer : Transform;
	
	private var nodeIOPoints : List.< KeyValuePair.< int, Vector3[] > > = new List.< KeyValuePair.< int, Vector3[] > > ();
	private var bottomLines : float[] = new float[999];
	
	
	////////////////////
	// File I/O
	////////////////////
	// Switch mode
	function SelectFileMode () {
		if ( fileModeSwitch.selectedOption == "Load" ) {
			selector.gameObject.SetActive ( true );
			creator.instance.SetActive ( false );
		} else {
			selector.gameObject.SetActive ( false );
			creator.instance.SetActive ( true );
		}
	}
	
	// Trim filename
	function TrimFileNames ( paths : String[] ) : String[] {
		var newArray : String[] = new String[paths.Length];
		
		for ( var i = 0; i < paths.Length; i++ ) {
			var path = paths[i].Split("\\"[0]);
			var fileName = path[path.Length-1];
			var extention = fileName.Split("."[0]);
			var name = extention[0];
			newArray[i] = name;
		}
		
		return newArray;
	}
	
	// Create convo
	function Create () {
		if ( creator.chapter.text == "" || creator.chapter.text == "chapter" ) { return; }
		if ( creator.scene.text == "" || creator.scene.text == "scene" ) { return; }
		if ( creator.name.text == "" || creator.name.text == "name" ) { return; }
		
		
	}
	
	// Pick convo
	function PickConvo ( btn : OGButton ) {
		EditorPicker.mode = "conversation";
		EditorPicker.button = selector;
		EditorPicker.sender = "ConversationMap";
		
		EditorPicker.func = LoadConversation;
		
		OGRoot.GoToPage ( "Picker" );
	}
	
	function LoadConversation () {
		// TODO
	}
	
	// Save
	function Save () {	
		// TODO: Saver.SaveConversationTree ( currentConvo.chapter, currentConvo.scene, currentConvo.name, rootNodes );
	}
	
	// Exit
	function Exit () {
		OGRoot.GoToPage ( "MenuBase" );
	}
	
	
	////////////////////
	// Main functions
	////////////////////
	function Start () {
		instance = this;
	
		if ( rootNodes.childCount < 1 ) {
			CreateRootNode ();
		}
	}
	
	public static function GetInstance() : EditorConversationMap {
		return instance;
	}
	
	public function ClearNodes () {
		for ( var i : int = 0; i < rootNodes.childCount; i++ ) {
			RemoveRootNode ( rootNodes.GetChild ( i ).GetComponent ( EditorConversationRootNode ), true );
		}
	}
	
	public function ConnectNodes ( callback : Function, activeOutput : OGButton ) {
		connectionCallback = callback;
		connectOutput = activeOutput;
		connectMode = true;
	}
	
	public function GetRootStrings() : String[] {
		var strings : String[] = new String[ rootNodes.childCount ];
		
		for ( var i : int = 0; i < strings.Length; i++ ) {
			strings[i] = i.ToString();
		}
		
		return strings;
	}
	
	
	////////////////////
	// Draw lines
	////////////////////
	public function GetOutputPosition ( o : OGButton ) : Vector3 {
		if ( o ) {
			return o.transform.position + new Vector3 ( o.transform.localScale.x/2, o.transform.localScale.y/2, 0 ) + new Vector3 ( scrollView.inset, scrollView.inset, 0 ) - new Vector3 ( scrollView.position.x, scrollView.position.y, 0 ) - scrollView.transform.localPosition;
		} else {
			return Vector3.zero;
		}
	}
	
	function OnGUI () {
		Handles.BeginGUI ();
		GUILayout.BeginArea ( Rect ( scrollView.transform.localPosition.x, scrollView.transform.localPosition.y, scrollView.scrollWidth, scrollView.scrollLength ) );
		
		Handles.color = lineColor;
		
		var p0 : Vector3;
		var p1 : Vector3;
		var p2 : Vector3;
		var p3 : Vector3;
		
		if ( connectMode ) {
			p0 = GetOutputPosition(connectOutput);
			p3 = new Vector3 ( Input.mousePosition.x, Screen.height-Input.mousePosition.y, -20 )-scrollView.transform.localPosition;
			p1 = p0 + Vector3.right * 20;
			p2 = p1;
			p2.y = p3.y;
			Handles.DrawLine ( p0, p1 );
			Handles.DrawLine ( p1, p2 );
			Handles.DrawLine ( p2, p3 );
		}
		
		for ( var kvp : KeyValuePair.< int, Vector3[] > in nodeIOPoints ) {
			p0 = kvp.Value[0];
			p3 = kvp.Value[1];
			p1 = p0 + Vector3.right * ( 20 + ( kvp.Key * 5 ) );
			p2 = p1;
			p2.y = p3.y;
			Handles.DrawLine ( p0, p1 );
			Handles.DrawLine ( p1, p2 );
			Handles.DrawLine ( p2, p3 );
		}
		
		GUILayout.EndArea();
		Handles.EndGUI ();
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
	}
	
	
	////////////////////
	// Nodes
	////////////////////
	// Root
	private function SortRootNodes () : IEnumerator {
		yield WaitForEndOfFrame ();
					
		for ( var i : int = 0; i < rootNodes.childCount; i++ ) {
			var rootNode : EditorConversationRootNode = rootNodes.GetChild ( i ).GetComponent ( EditorConversationRootNode );
			
			rootNode.transform.localPosition = new Vector3 ( 0, i * 30, 0 );
			rootNode.gameObject.name = i.ToString();
			rootNode.indexLabel.text = i.ToString();
			rootNode.removeButton.gameObject.SetActive ( rootNodes.childCount > 1 );
			
			addRootNode.transform.position = rootNode.transform.position + new Vector3 ( 0, 30, 0 );
			rootNodeBackground.localScale = new Vector3 ( 140, 75 + i * 30, 1 );
		}
	}
				
	public function CreateRootNode () {
		var newRootNode : EditorConversationRootNode = Instantiate ( rootNodePrefab );
		var index : int = rootNodes.childCount;
		
		newRootNode.transform.parent = rootNodes;
		newRootNode.transform.localScale = Vector3.one;
		
		StartCoroutine ( SortRootNodes () );
	}
	
	public function RemoveRootNode ( node : EditorConversationRootNode ) {
		RemoveRootNode ( node, false );
	}
	
	public function RemoveRootNode ( node : EditorConversationRootNode, force : boolean ) {
		if ( !node.connectedTo || force ) {
			Destroy ( node.gameObject );
			StartCoroutine ( SortRootNodes () );
		
		} else {
			InvokePrompt (
				function () {
					Destroy ( node.gameObject );
					StartCoroutine ( SortRootNodes () );
					CancelPrompt ();
				},
				CancelPrompt,
				"Are you sure?",
				"This will remove all child nodes. Proceed?"
			);
		}
	}
	
	// Child nodes
	public function SetOrphaned ( node : EditorConversationNode ) {
		node.targetPos += new Vector3 ( -10, 10, 0 );
	}
	
	public function CreateNode ( fromRootNode : EditorConversationRootNode ) {
		var newNode : EditorConversationNode = Instantiate ( nodePrefab );
		
		newNode.transform.parent = fromRootNode.nodeContainer;
		newNode.transform.localScale = Vector3.one;
		newNode.transform.position = new Vector3 ( fromRootNode.output.transform.position.x + 30, fromRootNode.output.transform.position.y, 0 );
		
		fromRootNode.SetConnection ( newNode );
	}
	
	public function CreateNode ( fromNode : EditorConversationNode, outputIndex : int ) {
		var newNode : EditorConversationNode = Instantiate ( nodePrefab );
		
		newNode.transform.parent = nodeContainer;
		newNode.transform.localScale = Vector3.one;
		newNode.transform.position = new Vector3 ( fromNode.activeOutputs[outputIndex].transform.position.x + 30, fromNode.activeOutputs[outputIndex].transform.position.y, 0 );
		
		fromNode.SetConnection ( outputIndex, newNode );
	}
	
	public function RemoveNode ( removeNode : EditorConversationNode ) {
		for ( var i : int = 0; i < removeNode.connectedTo.Length; i++ ) {
			removeNode.SetConnection ( i, null );
		}
		
		Destroy ( removeNode.gameObject );
	}	
		
	private function UpdateNodePosition ( node : EditorConversationNode, offset : int ) {			
		var pos : Vector3;
		pos.x = 200 + offset * cellDistance;
		pos.y = scrollView.transform.position.y + 15 + bottomLines[offset];
		bottomLines[offset] += node.frame.transform.localScale.y + 20;
		
		node.targetPos = pos;
			
		for ( var i : int = 0; i < node.connectedTo.Length; i++ ) {
			if ( node.activeOutputs[i] && node.connectedTo[i] ) {
				var points : Vector3[] = new Vector3[2];
				points[0] = GetOutputPosition ( node.activeOutputs[i] );
				points[1] = GetOutputPosition ( node.connectedTo[i].input );
				
				nodeIOPoints.Add ( new KeyValuePair.< int, Vector3[] > ( i, points ) );
				
				var addedOffset : int = 2;
				
				if ( node.connectedTo[i].selectedType == "Condition" || node.connectedTo[i].selectedType == "Consequence" || node.selectedType == "Condition"  || node.selectedType == "Consequence" ) {
					addedOffset = 1;
				}
				
				UpdateNodePosition ( node.connectedTo[i], offset + addedOffset );
			}
		}
	}
	
	private function UpdateRootNodePosition ( rootNode : EditorConversationRootNode, index : int ) {
		if ( rootNode.connectedTo ) {				
			var rootPoints : Vector3[] = new Vector3[2];
			rootPoints[0] = GetOutputPosition ( rootNode.output );
			rootPoints[1] = GetOutputPosition ( rootNode.connectedTo.input );
		
			nodeIOPoints.Add ( new KeyValuePair.< int, Vector3[] > ( index, rootPoints ) );
		
			UpdateNodePosition ( rootNode.connectedTo, 0 );
		}
	}
	
	
	////////////////////
	// Update
	////////////////////
	function Update () {
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			connectMode = false;
		}
		
		// Update node positions
		nodeIOPoints.Clear ();
		bottomLines = new float[999];
				
		for ( var i : int = 0; i < rootNodes.childCount; i++ ) {
			UpdateRootNodePosition ( rootNodes.GetChild(i).GetComponent(EditorConversationRootNode), i );
		}
	}
}