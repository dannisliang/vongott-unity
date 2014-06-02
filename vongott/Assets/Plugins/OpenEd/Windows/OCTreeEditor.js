#pragma strict
public class OCTreeEditor extends OGPage {
	public class Point extends System.ValueType {
		public var x : int;
		public var y : int;

		public function Point ( x : int, y : int ) {
			this.x = x;
			this.y = y;
		}
	}
	
	private class LineNode {
		public var gameObject : GameObject;
		public var nodLine : OGLineNode;
		public var btnConnect : OGButton;
		public var btnNewNode : OGButton;

		function LineNode ( title : String, position : Vector3, useButton : boolean, parent : Transform ) {
			gameObject = new GameObject ( "LineNode" );

			if ( !String.IsNullOrEmpty ( title ) ) {
				btnConnect = new GameObject ( "lbl_Title" ).AddComponent.< OGButton > ();
				btnConnect.text = title;
				btnConnect.pivot.x = RelativeX.Center;
				btnConnect.pivot.y = RelativeY.Center;
				btnConnect.ApplyDefaultStyles ();

				btnConnect.transform.parent = gameObject.transform;
				btnConnect.transform.localScale = new Vector3 ( 16 + title.Length * 6, 16, 1 );
				btnConnect.transform.localPosition = new Vector3 ( 0, 0, 0 );
			}

			if ( useButton ) {
				btnNewNode = new GameObject ( "btn_Connect" ).AddComponent.< OGButton > ();
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
				nodLine.transform.localPosition = new Vector3 ( 0, btnConnect == null ? 0 : 10, 0 );

			}

			gameObject.transform.parent = parent;
			gameObject.transform.localPosition = position;
			gameObject.transform.localScale = Vector3.one;
		}
	}

	public var currentTree : OFSerializedObject;
	public var currentRoot : int;
	public var treeContainer : Transform;
	public var inspector : OCNodeInspector;
	public var distance : Vector2 = new Vector2 ( 200, 200 );

	private var savePath : String;
	private var containers : Dictionary.< int, GameObject > = new Dictionary.< int, GameObject > ();

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

	public function ConnectTo ( id : int ) {

	}

	public function SelectNode ( id : int ) {
		inspector.SetNode ( id );
	}

	public function SelectNode ( n : String ) {
		var id : int = int.Parse ( n );

		inspector.SetNode ( id );
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

	public function CreateNode ( tree : OCTree, node : OCNode, x : float, y : float, prevLineNode : OGLineNode ) {
		if ( !node ) { return; }

		var container : GameObject = new GameObject ( node.id.ToString() );
		container.transform.parent = treeContainer;
		container.transform.localScale = Vector3.one;
		container.transform.localPosition = new Vector3 ( x, y, 0 );

		containers.Add ( node.id, container );

		var width : float = node.type == OCNodeType.Speak ? 140 : 100;
		var height : float = 20;

		var topLineNode : OGLineNode = new GameObject ( "nod_Top" ).AddComponent.< OGLineNode > ();
		topLineNode.transform.parent = container.transform;
		topLineNode.transform.localPosition = Vector3.zero;
		topLineNode.transform.localScale = Vector3.one;

		var topInput : OGButton = new GameObject ( "btn_TopInput" ).AddComponent.< OGButton > ();
		topInput.transform.parent = container.transform;
		topInput.transform.localPosition = Vector3.zero;
		topInput.transform.localScale = new Vector3 ( 16, 16 );
		topInput.pivot.x = RelativeX.Center;
		topInput.pivot.y = RelativeY.Center;
		topInput.action = function () { ConnectTo ( node.id ); };
		topInput.ApplyDefaultStyles ();
	

		if ( prevLineNode ) {
			prevLineNode.connectedTo = [ topLineNode ];
		}

		var btn : OGButton = new GameObject ( "btn_Select" ).AddComponent.< OGButton > ();
		btn.transform.parent = container.transform;
		btn.transform.localPosition = Vector3.zero;
		btn.transform.localScale = new Vector3 ( width, height, 1 );
		btn.pivot.x = RelativeX.Center;
		btn.action = function () { SelectNode ( node.id ); };
		btn.ApplyDefaultStyles ();

		var lineNodes : LineNode[] = new LineNode [ node.connectedTo.Length ];
		var i : int = 0;

		switch ( node.type ) {
			case OCNodeType.Speak:
				btn.tint = new Color ( 0.6, 0.8, 1.0, 1.0 );

				if ( String.IsNullOrEmpty ( node.speak.lines[0] ) ) {
					btn.text = "...";

				} else if ( node.speak.lines[0].Length > 20 ) {
					btn.text = node.speak.lines[0].Substring ( 0, 17 ) + "...";
				
				} else {
					btn.text = node.speak.lines[0];

				}

				for ( i = 0; i < node.connectedTo.Length; i++ ) {
					var xPos : float = 0;
					
					if ( node.connectedTo.Length > 1 ) {
						xPos = i * ( width / ( node.connectedTo.Length - 1 ) ) - ( width / 2 );
					}

					lineNodes[i] = new LineNode ( i.ToString (), new Vector3 ( xPos, height, 0 ), node.connectedTo[i] == 0, container.transform );
				}

				break;

			case OCNodeType.GetFlag:
				btn.text = "(condition)";
				lineNodes [0] = new LineNode ( "false", new Vector3 ( -width / 2, height, 0 ), node.connectedTo[0] == 0, container.transform );
				lineNodes [1] = new LineNode ( "true", new Vector3 ( width / 2, height, 0 ), node.connectedTo[1] == 0, container.transform );
				break;
			
			case OCNodeType.SetFlag:
				btn.text = "(consequence)";
				lineNodes [0] = new LineNode ( "", new Vector3 ( 0, height, 0 ), node.connectedTo[0] == 0, container.transform );
				break;
			
			case OCNodeType.Event:
				btn.text = "(event)";
				lineNodes [0] = new LineNode ( "", new Vector3 ( 0, height, 0 ), node.connectedTo[0] == 0, container.transform );
				break;
			
			case OCNodeType.End:
				btn.text = "(end -> " + node.end.rootNode + ")";
				break;
			
			case OCNodeType.Jump:
				btn.text = "(jump to " + node.jump.rootNode + ")";
				break;

			default:
				btn.text = "[INVALID]";
				break;
		}

		for ( i = 0; i < node.connectedTo.Length; i++ ) {
			if ( lineNodes[i] ) {
				if ( lineNodes[i].btnNewNode ) {
					lineNodes[i].btnNewNode.actionWithArgument = function ( n : String ) {
						node.connectedTo [ int.Parse ( n ) ] = tree.rootNodes [ currentRoot ].AddNode ().id;
						UpdateNodes ();
					};
					lineNodes[i].btnNewNode.argument = i.ToString ();
				}

				var nextNode : OCNode = tree.rootNodes [ currentRoot ].GetNode ( node.connectedTo[i] );
			
				if ( nextNode ) {
					xPos = x;
					if ( node.connectedTo.Length > 1 ) {
					       	var span : float = GetSpanRecursively ( distance.x, nextNode );
						var segment : float = span / ( node.connectedTo.Length - 1 );
						xPos = x - span / 2 + i * segment;
					}
					
					CreateNode ( tree, nextNode, xPos, y + 100, lineNodes[i].nodLine );
				}
			}
		}
	}
		
	public function UpdateNodes () {
		ClearNodes ();
		
		var tree : OCTree = currentTree.GetComponent.< OCTree > ();
		var nextNode : OCNode = tree.rootNodes [ currentRoot ].GetFirstNode ();

		CreateNode ( tree, nextNode, treeContainer.GetComponent.< OGScrollView > ().size.x / 2, 20, null );
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

	public static function Refresh () {
		instance.UpdateNodes ();
	}

	override function ExitPage () {
		savePath = "";
	}

	override function StartPage () {
		instance = this;
	}
}
