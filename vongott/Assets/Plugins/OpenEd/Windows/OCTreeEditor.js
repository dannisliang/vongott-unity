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
		public var lblTitle : OGLabel;
		public var btnConnect : OGButton;

		function LineNode ( title : String, position : Vector3, useButton : boolean, parent : Transform ) {
			gameObject = new GameObject ( "LineNode" );

			if ( !String.IsNullOrEmpty ( title ) ) {
				lblTitle = new GameObject ( "lbl_Title" ).AddComponent.< OGLabel > ();
				lblTitle.text = title;
				lblTitle.pivot.x = RelativeX.Center;
				lblTitle.pivot.y = RelativeY.Center;
				lblTitle.overrideAlignment = true;
				lblTitle.alignment = TextAnchor.MiddleCenter;
				lblTitle.ApplyDefaultStyles ();

				lblTitle.transform.parent = gameObject.transform;
				lblTitle.transform.localScale = new Vector3 ( 100, 16, 1 );
				lblTitle.transform.localPosition = new Vector3 ( 0, 0, 0 );
			}

			if ( useButton ) {
				btnConnect = new GameObject ( "btn_Connect" ).AddComponent.< OGButton > ();
				btnConnect.text = "+";
				btnConnect.tint = Color.green;
				btnConnect.pivot.x = RelativeX.Center;
				btnConnect.pivot.y = RelativeY.Center;
				btnConnect.ApplyDefaultStyles ();

				btnConnect.transform.parent = gameObject.transform;
				btnConnect.transform.localScale = new Vector3 ( 16, 16, 1 );
				btnConnect.transform.localPosition = new Vector3 ( 0, 20, 0 );
			
			} else {
				nodLine = new GameObject ( "nod_Line" ).AddComponent.< OGLineNode > ();
				nodLine.transform.parent = gameObject.transform;
				nodLine.transform.localScale = new Vector3 ( 1, 1, 1 );
				nodLine.transform.localPosition = new Vector3 ( 0, lblTitle == null ? 0 : 10, 0 );

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

	private var savePath : String;
	
	private static var instance : OCTreeEditor;

	public function New () {
		Destroy ( currentTree.gameObject.GetComponent.< OCTree > () );
		currentTree.gameObject.AddComponent.< OCTree > ();
	}

	public function ClearNodes () {
		for ( var i : int = 0; i < treeContainer.childCount; i++ ) {
			Destroy ( treeContainer.GetChild ( i ).gameObject );
		}
	}

	public function SelectNode ( n : String ) {
		var id : int = int.Parse ( n );

		inspector.SetNode ( id );
	}

	public function CreateNode ( tree : OCTree, node : OCNode, x : float, y : float, prevLineNode : OGLineNode ) {
		if ( !node ) { return; }

		var container : GameObject = new GameObject ( node.id.ToString() );
		container.transform.parent = treeContainer;
		container.transform.localScale = Vector3.one;
		container.transform.localPosition = new Vector3 ( x, y, 0 );

		var width : float = 140;
		var height : float = 20;

		var topLineNode : OGLineNode = new GameObject ( "nod_Top" ).AddComponent.< OGLineNode > ();
		topLineNode.transform.parent = container.transform;
		topLineNode.transform.localPosition = Vector3.zero;
		topLineNode.transform.localScale = Vector3.one;

		if ( prevLineNode ) {
			prevLineNode.connectedTo = [ topLineNode ];
		}

		var btn : OGButton = new GameObject ( "btn_Select" ).AddComponent.< OGButton > ();

		btn.transform.parent = container.transform;
		btn.transform.localPosition = Vector3.zero;
		btn.transform.localScale = new Vector3 ( width, height, 1 );

		var lineNodes : LineNode[] = new LineNode [ node.connectedTo.Length ];
		var i : int = 0;

		switch ( node.type ) {
			case OCNodeType.Speak:
				if ( String.IsNullOrEmpty ( node.speak.lines[0] ) ) {
					btn.text = "...";

				} else if ( node.speak.lines[0].Length > 13 ) {
					btn.text = node.speak.lines[0].Substring ( 0, 10 ) + "...";
				
				} else {
					btn.text = node.speak.lines[0];

				}

				for ( i = 0; i < node.connectedTo.Length; i++ ) {
					lineNodes[i] = new LineNode ( node.connectedTo.Length > 1 ? i.ToString () : "", new Vector3 ( i * height, height, 0 ), node.connectedTo[i] == 0, container.transform );
				}

				break;

			case OCNodeType.GetFlag:
				btn.text = "(condition)";
				lineNodes [0] = new LineNode ( "false", new Vector3 ( 0, height, 0 ), node.connectedTo[0] == 0, container.transform );
				lineNodes [1] = new LineNode ( "true", new Vector3 ( width, height, 0 ), node.connectedTo[1] == 0, container.transform );
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

		btn.target = this.gameObject;
		btn.message = "SelectNode";
		btn.argument = node.id.ToString ();
		
		btn.ApplyDefaultStyles ();

		for ( i = 0; i < node.connectedTo.Length; i++ ) {
			if ( lineNodes[i] ) {
				if ( lineNodes[i].btnConnect ) {
					lineNodes[i].btnConnect.actionWithArgument = function ( n : String ) {
						node.connectedTo [ int.Parse ( n ) ] = tree.rootNodes [ currentRoot ].AddNode ().id;
						UpdateNodes ();
					};
					lineNodes[i].btnConnect.argument = i.ToString ();
				}

				CreateNode ( tree, tree.rootNodes [ currentRoot ].GetNode ( node.connectedTo[i] ), x + i * ( width + 80 ), y + ( height + 80 ), lineNodes[i].nodLine );
			}
		}
	}
		
	public function UpdateNodes () {
		ClearNodes ();
		
		var tree : OCTree = currentTree.GetComponent.< OCTree > ();
		var nextNode : OCNode = tree.rootNodes [ currentRoot ].GetFirstNode ();

		CreateNode ( tree, nextNode, 20, 20, null );
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
