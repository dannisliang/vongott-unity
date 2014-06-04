#pragma strict
public class OCTreeEditor extends OGPage {
	private class Point extends System.ValueType {
		public var x : int;
		public var y : int;

		public function Point ( x : int, y : int ) {
			this.x = x;
			this.y = y;
		}
	}

	private class Input {
		public var gameObject : GameObject;
		public var nodLine : OGLineNode;
		public var btnConnect : OGButton;

		function Input ( position : Vector3, node : OCNode, parent : Transform ) {
			gameObject = new GameObject ( "Input" );
			gameObject.transform.parent = parent;
			gameObject.transform.localPosition = position;
			
			nodLine = new GameObject ( "nod_Top" ).AddComponent.< OGLineNode > ();
			nodLine.transform.parent = gameObject.transform;
			nodLine.transform.localPosition = new Vector3 ( 0, 0, 1 );
			nodLine.transform.localScale = Vector3.one;

			btnConnect = new GameObject ( "btn_TopInput" ).AddComponent.< OGButton > ();
			btnConnect.transform.parent = gameObject.transform;
			btnConnect.transform.localPosition = Vector3.zero;
			btnConnect.transform.localScale = new Vector3 ( 16, 16 );
			btnConnect.pivot.x = RelativeX.Center;
			btnConnect.pivot.y = RelativeY.Center;
			btnConnect.action = function () { ConnectTo ( node.id ); };
			btnConnect.ApplyDefaultStyles ();
		}
	}

	private class Output {
		public var gameObject : GameObject;
		public var nodLine : OGLineNode;
		public var btnConnect : OGButton;
		public var btnNewNode : OGButton;

		function Output ( title : String, position : Vector3, useButton : boolean, parent : Transform ) {
			gameObject = new GameObject ( title );

			btnConnect = new GameObject ( "btn_Connect" ).AddComponent.< OGButton > ();
			btnConnect.text = title;
			
			if ( title == "true" ) {
				btnConnect.tint = Color.green;
			} else if ( title == "false" ) {
				btnConnect.tint = Color.red;
			}
			
			btnConnect.pivot.x = RelativeX.Center;
			btnConnect.pivot.y = RelativeY.Center;
			btnConnect.ApplyDefaultStyles ();

			btnConnect.transform.parent = gameObject.transform;
			btnConnect.transform.localScale = new Vector3 ( 16 + title.Length * 6, 16, 1 );
			btnConnect.transform.localPosition = Vector3.zero;

			if ( useButton ) {
				btnNewNode = new GameObject ( "btn_NewNode" ).AddComponent.< OGButton > ();
				btnNewNode.text = "+";
				btnNewNode.tint = Color.green;
				btnNewNode.pivot.x = RelativeX.Center;
				btnNewNode.pivot.y = RelativeY.Center;
				btnNewNode.ApplyDefaultStyles ();

				btnNewNode.transform.parent = gameObject.transform;
				btnNewNode.transform.localScale = new Vector3 ( 16, 16, 1 );
				btnNewNode.transform.localPosition = new Vector3 ( 0, 20, 0 );
			
			} else {
				nodLine = new GameObject ( "nod_Line" ).AddComponent.< OGLineNode > ();
				nodLine.transform.parent = gameObject.transform;
				nodLine.transform.localScale = new Vector3 ( 1, 1, 1 );
				nodLine.transform.localPosition = new Vector3 ( 0, 0, 1 );

			}

			gameObject.transform.parent = parent;
			gameObject.transform.localPosition = position;
			gameObject.transform.localScale = Vector3.one;
		}
	}

	private class RootNodeContainer {
		public var gameObject : GameObject;
		public var output : Output;
		public var popSelect : OGPopUp;

		function RootNodeContainer ( tree : OCTree, currentRoot : int ) {
			gameObject = new GameObject ( "RootSelector" );
			gameObject.transform.parent = instance.treeContainer;
			gameObject.transform.localPosition = new Vector3 ( instance.treeContainer.GetComponent.< OGScrollView >().size.x / 2, 20, 0 );

			popSelect = new GameObject ( "pop_Select" ).AddComponent.< OGPopUp > ();
			popSelect.title = "<root>";
			popSelect.options = new String [ tree.rootNodes.Length ];
			popSelect.pivot.x = RelativeX.Center;
			popSelect.pivot.y = RelativeY.Center;
			popSelect.target = instance.gameObject;
			popSelect.message = "SelectRoot";
			popSelect.passSelectedOption = true;

			for ( var i : int = 0; i < tree.rootNodes.Length; i++ ) {
				popSelect.options[i] = i.ToString ();
			}

			popSelect.selectedOption = currentRoot.ToString ();
			popSelect.ApplyDefaultStyles ();

			popSelect.transform.parent = gameObject.transform;
			popSelect.transform.localPosition = Vector3.zero;
			popSelect.transform.localScale = new Vector3 ( 100, 20, 1 );

			output = new Output ( "", new Vector3 ( 0, 20, 1 ), false, gameObject.transform );
		}
	}

	private class NodeContainer {
		public var gameObject : GameObject;
		public var input : Input;
		public var outputs : Output [];
		public var btnSelect : OGButton;
		public var btnRemove : OGButton;
		public var connections : NodeContainer [] = new NodeContainer [0];

		public function SetConnection ( i : int, container : NodeContainer ) {
			var here : Vector3 = outputs[i].nodLine.transform.position;
			var there : Vector3 = instance.containers[container.id].input.nodLine.transform.position;
			var offset : Vector2;

			if ( position.y < container.position.y ) {
				if ( position.x == container.position.x ) {
					outputs[i].nodLine.AddConnection ( container.input.nodLine );

				} else {
					offset.x = container.input.nodLine.transform.position.x - outputs[i].nodLine.transform.position.x;
					offset.y = outputs[i].nodLine.transform.position.y - container.input.nodLine.transform.position.y + 20;
					outputs[i].nodLine.AddConnection ( container.input.nodLine, [ new Vector3 ( 0, offset.y, 0 ), new Vector3 ( offset.x, offset.y, 0 ) ] );
				}
				
			} else {
				if ( position.x > container.position.x ) {
					offset.x = container.position.x - outputs[i].nodLine.transform.position.x;
					offset.y = outputs[i].nodLine.transform.position.y - container.input.nodLine.transform.position.y + 20;
					outputs[i].nodLine.AddConnection ( container.input.nodLine, [ new Vector3 ( 0, -20, 0 ), new Vector3 ( -50, -20, 0 ), new Vector3 ( -50, offset.y, 0 ), new Vector3 ( offset.x, offset.y, 0 ) ] );
				}
			}
		}

		public function get id () : int {
			return int.Parse ( gameObject.name );
		}

		public function set position ( value : Vector3 ) {
			var diff : Vector3 = value - position;
			var id : int = int.Parse ( gameObject.name );
			var containers : NodeContainer [] = GetSubcontainers ( id );

			gameObject.transform.position += diff;

			for ( var i : int = 0; i < containers.Length; i++ ) {
				if ( containers[i].position.y > position.y ) {
					containers[i].position = containers[i].position + diff; 
				}
			}
		}

		public function get position () : Vector3 {
			return gameObject.transform.position;
		}

		function NodeContainer ( node : OCNode, x : float, y : float, parent : Transform ) {
			var width : float = 80;
			var height : float = 20;
			
			gameObject = new GameObject ( node.id.ToString () );
			gameObject.transform.parent = parent;
			gameObject.transform.localScale = Vector3.one;
			gameObject.transform.localPosition = new Vector3 ( x, y, 2 );
		
			input = new Input ( new Vector3 ( 0, -height, -1 ), node, gameObject.transform );

			outputs = new Output [ node.connectedTo.Length ];
			
			btnSelect = new GameObject ( "btn_Connect" ).AddComponent.< OGButton > ();
			btnSelect.transform.parent = gameObject.transform;
			btnSelect.transform.localScale = new Vector3 ( width, height * 2, 1 );
			btnSelect.transform.localPosition = new Vector3 ( 0, 0, 2 );
			btnSelect.pivot.x = RelativeX.Center;
			btnSelect.pivot.y = RelativeY.Center;
			btnSelect.action = function () { SelectNode ( node.id ); };
			btnSelect.ApplyDefaultStyles ();
			
			btnRemove = new GameObject ( "btn_Remove" ).AddComponent.< OGButton > ();
			btnRemove.transform.parent = gameObject.transform;
			btnRemove.transform.localScale = new Vector3 ( 16, 16, 1 );
			btnRemove.transform.localPosition = new Vector3 ( width/2, -height, 2 );
			btnRemove.text = "x";
			btnRemove.tint = Color.red;
			btnRemove.pivot.x = RelativeX.Center;
			btnRemove.pivot.y = RelativeY.Center;
			btnRemove.action = function () { RemoveNode ( node.id ); };
			btnRemove.ApplyDefaultStyles ();

			switch ( node.type ) {
				case OCNodeType.Speak:
					btnSelect.tint = instance.speakerColors[node.speak.speaker];

					if ( String.IsNullOrEmpty ( node.speak.lines[0] ) ) {
						btnSelect.text = "...";

					} else if ( node.speak.lines[0].Length > 13 ) {
						btnSelect.text = node.speak.lines[0].Substring ( 0, 10 ) + "...";
					
					} else {
						btnSelect.text = node.speak.lines[0];

					}
					
					for ( var i : int = 0; i < node.connectedTo.Length; i++ ) {
						var xPos : float = 0;
						if ( node.connectedTo.Length > 1 ) {
							xPos = i * ( width / ( node.connectedTo.Length - 1 ) ) - ( width / 2 );
						}
						outputs[i] = new Output ( node.connectedTo.Length > 1 ? i.ToString () : "", new Vector3 ( xPos, height, -1 ), node.connectedTo[i] == 0, gameObject.transform );
					}

					break;

				case OCNodeType.GetFlag:
					btnSelect.text = "(get flag)";
					outputs [0] = new Output ( "false", new Vector3 ( -width / 2, height, 0 ), node.connectedTo[0] == 0, gameObject.transform );
					outputs [1] = new Output ( "true", new Vector3 ( width / 2, height, 0 ), node.connectedTo[1] == 0, gameObject.transform );
					break;
				
				case OCNodeType.SetFlag:
					btnSelect.text = "(set flag)";
					outputs [0] = new Output ( "", new Vector3 ( 0, height, 0 ), node.connectedTo[0] == 0, gameObject.transform );
					break;
				
				case OCNodeType.Event:
					btnSelect.text = "(event)";
					outputs [0] = new Output ( "", new Vector3 ( 0, height, 0 ), node.connectedTo[0] == 0, gameObject.transform );
					break;
				
				case OCNodeType.End:
					btnSelect.text = "(end -> " + node.end.rootNode + ")";
					break;
				
				case OCNodeType.Jump:
					btnSelect.text = "(jump -> " + node.jump.rootNode + ")";
					break;

				default:
					btnSelect.text = "[INVALID]";
					break;
			}

		}

	}	

	public var currentTree : OFSerializedObject;
	public var currentRoot : int;
	public var treeContainer : Transform;
	public var fldSpeakerNames : OGTextField;
	public var fldRootTags :  OGTextField;
	public var inspectorContainer : Transform;
	public var distance : Vector2 = new Vector2 ( 200, 200 );
	public var speakerColors : Color [];

	private var savePath : String;
	private var containers : Dictionary.< int, NodeContainer > = new Dictionary.< int, NodeContainer > ();
	private var mouseNode : OGLineNode;
	private var connectToId : int = 0;
	private var connectToOutput : int = 0;
	private var nodeInspector : OCNodeInspector;

	private static var instance : OCTreeEditor;

	private function get tree () : OCTree {
		return currentTree.GetComponent.< OCTree > ();
	}

	public function New () {
		Destroy ( currentTree.gameObject.GetComponent.< OCTree > () );
		currentTree.gameObject.AddComponent.< OCTree > ();
		tree.AddRootNode ();
		currentRoot = 0;
		nodeInspector.Refresh ( tree, null, inspectorContainer );
		UpdateNodes ();
	}

	public function ClearNodes () {
		containers.Clear ();

		for ( var i : int = 0; i < treeContainer.childCount; i++ ) {
			Destroy ( treeContainer.GetChild ( i ).gameObject );
		}
	}

	private function GetSpanRecursively ( x : float, node : OCNode ) : float {
		var result : float = x;

		if ( node ) {
			for ( var i : int = 0; i < node.connectedTo.Length; i++ ) {
				var nextNode : OCNode = tree.rootNodes [ currentRoot ].GetNode ( node.connectedTo[i] );
				var segment : float = 0;
			       	if ( node.connectedTo.Length > 1 ) { 
					segment = distance.x / ( node.connectedTo.Length - 1 );
				}
				result = GetSpanRecursively ( result + segment, nextNode );
			}
		}

		return result;
	}

	public function CreateNode ( tree : OCTree, node : OCNode, x : float, y : float ) : NodeContainer {
		if ( !node ) { return; }

		var container : NodeContainer = new NodeContainer ( node, x, y, treeContainer );

		for ( var i : int = 0; i < node.connectedTo.Length; i++ ) {
			if ( container.outputs[i] ) {
				if ( container.outputs[i].btnNewNode ) {
					container.outputs[i].btnNewNode.actionWithArgument = function ( n : String ) {
						node.connectedTo [ int.Parse ( n ) ] = tree.rootNodes [ currentRoot ].AddNode ().id;
						UpdateNodes ();
					};
					container.outputs[i].btnNewNode.argument = i.ToString ();
				}

				var nextNode : OCNode = tree.rootNodes [ currentRoot ].GetNode ( node.connectedTo[i] );
			
				container.outputs[i].btnConnect.actionWithArgument = function ( n : String ) {
					TryConnect ( node.id, int.Parse ( n ), container.outputs[int.Parse ( n )].nodLine );
				};
				container.outputs[i].btnConnect.argument = i.ToString ();

				if ( nextNode && containers.ContainsKey ( nextNode.id ) ) {
					container.SetConnection ( i, containers[nextNode.id] );

				} else if ( nextNode ) {
					var xPos : float = x;
					if ( node.connectedTo.Length > 1 ) {
					       	var span : float = GetSpanRecursively ( distance.x, nextNode );
						var segment : float = span / ( node.connectedTo.Length - 1 );
						xPos = x - span / 2 + i * segment;
					}
					
					container.SetConnection ( i, CreateNode ( tree, nextNode, xPos, y + 100 ) );
				}
			}
		}
		
		containers.Add ( node.id, container );

		return container;
	}
		
	public function UpdateNodes () {
		ClearNodes ();
		
		var nextNode : OCNode = tree.rootNodes [ currentRoot ].GetFirstNode ();

		if ( !nextNode ) {
			tree.rootNodes [ currentRoot ].AddFirstNode ();
			nextNode = tree.rootNodes [ currentRoot ].GetFirstNode ();
		}

		fldRootTags.text = "";
		fldSpeakerNames.text = "";

		var tags : String [] = tree.rootNodes [ currentRoot ].tags;
			
		for ( var i : int = 0; i < tags.Length; i++ ) {
			fldRootTags.text += tags[i];

			if ( i < tags.Length - 1 ) {
				fldRootTags.text += ",";
			}
		}
		
		var speakerNames : String [] = tree.GetSpeakerStrings ();
		
		for ( i = 0; i < speakerNames.Length; i++ ) {
			fldSpeakerNames.text += speakerNames[i];

			if ( i < speakerNames.Length - 1 ) {
				fldSpeakerNames.text += ",";
			}
		}

		var rootNodeContainer : RootNodeContainer = new RootNodeContainer ( tree, currentRoot );
		var firstNodeContainer : NodeContainer = CreateNode ( tree, nextNode, treeContainer.GetComponent.< OGScrollView > ().size.x / 2, 100 );

		rootNodeContainer.output.nodLine.AddConnection ( firstNodeContainer.input.nodLine );
	}

	public function Open () {
		var fileBrowser : OEFileBrowser = OEWorkspace.GetInstance().fileBrowser;
		fileBrowser.browseMode = OEFileBrowser.BrowseMode.Open;
		fileBrowser.filter = ".tree";
		fileBrowser.callback = function ( file : FileInfo ) {
			savePath = file.FullName;
			currentRoot = 0;

			OFDeserializer.Deserialize ( OFReader.LoadFile ( file.FullName ), currentTree );
			UpdateNodes ();
			nodeInspector.Refresh ( tree, null, inspectorContainer );
		};
		fileBrowser.sender = "TreeEditor";
		OGRoot.GetInstance().GoToPage ( "FileBrowser" );
	}

	public function Save () {
		if ( !String.IsNullOrEmpty ( savePath ) ) {
			OFWriter.SaveFile ( OFSerializer.Serialize ( currentTree ), savePath );

		} else {
			SaveAs ();

		}
	}

	public function SaveAs () {
		var fileBrowser : OEFileBrowser = OEWorkspace.GetInstance().fileBrowser;
		fileBrowser.browseMode = OEFileBrowser.BrowseMode.Save;
		fileBrowser.callback = function ( path : String ) { savePath = path; Save(); };
		fileBrowser.sender = "TreeEditor";
		OGRoot.GetInstance().GoToPage ( "FileBrowser" );
	}

	public function SelectRoot ( n : String) {
		currentRoot = int.Parse ( n );

		Refresh ();
	}

	public function UpdateSpeakers () {
		tree.SetSpeakerStrings ( fldSpeakerNames.text.Split ( ","[0] ) );
	}

	public function UpdateTags () {
		tree.rootNodes [ currentRoot ].tags = fldRootTags.text.Split ( ","[0] );
	}

	public function CancelConnect () {
		if ( mouseNode ) {
			Destroy ( mouseNode.gameObject ); 
		}

		var node : OCNode = tree.rootNodes[instance.currentRoot].GetNode ( connectToId );
		
		if ( node ) {
			if ( connectToOutput < node.connectedTo.Length ) {
				node.connectedTo[connectToOutput] = 0;
			}
		}

		connectToId = 0;
		connectToOutput = 0;

		Refresh ();
	}

	public static function ConnectTo ( id : int ) {
		var node : OCNode = instance.tree.rootNodes[instance.currentRoot].GetNode ( instance.connectToId );

		node.SetConnection ( instance.connectToOutput, id );
		
		instance.CancelConnect ();
	}

	public static function GetSubcontainers ( id : int ) : NodeContainer [] {
		var tmp : List.< NodeContainer > = new List.< NodeContainer > ();
		var node : OCNode = instance.tree.rootNodes [ instance.currentRoot ].GetNode ( id );

		if ( node ) {
			for ( var i : int = 0; i < node.connectedTo.Length; i++ ) {
				tmp.Add ( instance.containers[node.connectedTo[i]] );

				var containers : NodeContainer [] = GetSubcontainers ( node.connectedTo[i] );
				
				for ( var c : int = 0; c < containers.Length; c++ ) {
					tmp.Add ( containers[c] );
				}
			}
		}
		
		return tmp.ToArray ();
	}

	public static function TryConnect ( id : int, output : int, connectTo : OGLineNode ) {
		instance.mouseNode = new GameObject ( "nod_Mouse" ).AddComponent.< OGLineNode > ();
		instance.mouseNode.transform.parent = instance.gameObject.transform;
		instance.connectToId = id;
		instance.connectToOutput = output;
		instance.mouseNode.AddConnection ( connectTo );
	}

	public static function Refresh () {
		instance.UpdateNodes ();
	}
	
	public static function SelectNode ( id : int ) {
		instance.nodeInspector.Refresh ( instance.tree, instance.tree.rootNodes [ instance.currentRoot ].GetNode ( id ), instance.inspectorContainer );
	}
	
	public static function RemoveNode ( id : int ) {
		instance.nodeInspector.Refresh ( instance.tree, null, instance.inspectorContainer );
		instance.tree.rootNodes[instance.currentRoot].RemoveNode ( id );

		Destroy ( instance.containers[id].gameObject );

		Refresh ();
	}

	public static function SelectNode ( n : String ) {
		var id : int = int.Parse ( n );
		SelectNode ( id );
	}

	override function UpdatePage () {
		if ( nodeInspector ) {
			nodeInspector.Update ();
		}
		
		if ( mouseNode ) {
			if ( UnityEngine.Input.GetMouseButtonDown ( 1 ) ) {
				CancelConnect ();
			
			} else {
				var mousePos : Vector3 = UnityEngine.Input.mousePosition;
				mousePos.y = Screen.height - mousePos.y;
				mouseNode.transform.position = mousePos;

			}
		}
	}

	override function ExitPage () {
		savePath = "";
	}

	override function StartPage () {
		instance = this;

		if ( !nodeInspector ) {
			var inspectors : OEComponentInspector [] = OEReflector.GetInspectors ();

			for ( var i : int = 0; i < inspectors.Length; i++ ) {
				if ( inspectors[i].type == typeof ( OCNode ) ) {
					nodeInspector = inspectors[i] as OCNodeInspector;
					nodeInspector.overrideTarget = true;
				}
			}
		}

		Refresh ();
	}
}
