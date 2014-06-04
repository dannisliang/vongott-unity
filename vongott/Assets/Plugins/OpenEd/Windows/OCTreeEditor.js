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

	private class NodeContainer {
		public var gameObject : GameObject;
		public var input : Input;
		public var outputs : Output [];
		public var btnSelect : OGButton;
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
	public var inspector : OCNodeInspector;
	public var distance : Vector2 = new Vector2 ( 200, 200 );
	public var speakerColors : Color [];

	private var savePath : String;
	private var containers : Dictionary.< int, NodeContainer > = new Dictionary.< int, NodeContainer > ();

	private static var instance : OCTreeEditor;

	public function New () {
		Destroy ( currentTree.gameObject.GetComponent.< OCTree > () );
		currentTree.gameObject.AddComponent.< OCTree > ();
	}

	public function ClearNodes () {
		containers.Clear ();

		for ( var i : int = 0; i < treeContainer.childCount; i++ ) {
			Destroy ( treeContainer.GetChild ( i ).gameObject );
		}
	}

	private function GetSpanRecursively ( x : float, node : OCNode ) : float {
		var result : float = x;
		var tree : OCTree = currentTree.GetComponent.< OCTree > ();

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
		
		var tree : OCTree = currentTree.GetComponent.< OCTree > ();
		var nextNode : OCNode = tree.rootNodes [ currentRoot ].GetFirstNode ();

		CreateNode ( tree, nextNode, treeContainer.GetComponent.< OGScrollView > ().size.x / 2, 20 );
	}

	public function Open () {
		var fileBrowser : OEFileBrowser = OEWorkspace.GetInstance().fileBrowser;
		fileBrowser.browseMode = OEFileBrowser.BrowseMode.Open;
		fileBrowser.filter = ".tree";
		fileBrowser.callback = function ( file : FileInfo ) {
			savePath = file.FullName;
			
			OFDeserializer.Deserialize ( OFReader.LoadFile ( file.FullName ), currentTree );
			inspector.tree = currentTree.GetComponent.< OCTree > ();
			UpdateNodes ();
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

	public static function ConnectTo ( id : int ) {

	}

	public static function GetSubcontainers ( id : int ) : NodeContainer [] {
		var tmp : List.< NodeContainer > = new List.< NodeContainer > ();
		var tree : OCTree = instance.currentTree.GetComponent.< OCTree > ();
		var node : OCNode = tree.rootNodes [ instance.currentRoot ].GetNode ( id );

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

	public static function Refresh () {
		instance.UpdateNodes ();
	}
	
	public static function SelectNode ( id : int ) {
		instance.inspector.SetNode ( id );
	}

	public static function SelectNode ( n : String ) {
		var id : int = int.Parse ( n );

		instance.inspector.SetNode ( id );
	}


	override function ExitPage () {
		savePath = "";
	}

	override function StartPage () {
		instance = this;
	}
}
