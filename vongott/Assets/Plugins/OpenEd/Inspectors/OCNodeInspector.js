#pragma strict

public class OCNodeInspector extends MonoBehaviour {
	public class Inspector {
		public var gameObject : GameObject;
		public var type : OCNodeType;
		public var tree : OCTree;
		public var node : OCNode;
		public function Init ( tree : OCTree, node : OCNode ) {}
		public function Update () {}
	}
	
	public class Speak extends Inspector {
		public class Line {
			public var fldInput : OGTextField;
			public var btnRemove : OGButton;
			public var lblIndex : OGLabel;
		}

		public var popSpeaker : OGPopUp;
		public var lines : Line [] = new Line [1];
		public var btnAdd : OGButton;

		public function Init ( tree : OCTree, node : OCNode ) {
			this.tree = tree;
			this.node = node;

			popSpeaker.options = tree.GetSpeakerStrings ();
			popSpeaker.selectedOption = popSpeaker.options [ node.speak.speaker ];

			ClearLines ();

			for ( var i : int = 0; i < node.speak.lines.Length; i++ ) {
				SetLine ( i, node.speak.lines [i] );
			}
		}

		public function SetLine ( index : int, line : String ) {
			if ( index < lines.Length ) {
				lines[index].fldInput.text = line;
			
			} else {
				for ( var i : int = lines.Length - 1; i < index; i++ ) {
					AddLine ();
				}

				lines[index].fldInput.text = line;
			}
		}

		public function ClearLines () {
			var tmp : List.< Line > = new List.< Line > ( lines );
			
			for ( var i : int = lines.Length; i > 1; i-- ) {
				Destroy ( tmp[i].fldInput.gameObject );
				Destroy ( tmp[i].btnRemove.gameObject );
				tmp.RemoveAt ( i );
			}

			lines = tmp.ToArray ();
			
			node.SetOutputAmount ( lines.Length );
		}

		public function RemoveLine ( i : int ) {
			if ( i < lines.Length && i != 0 ) {
				var tmp : List.< Line > = new List.< Line > ( lines );
				
				Destroy ( tmp[i].fldInput.gameObject );
				Destroy ( tmp[i].btnRemove.gameObject );
				Destroy ( tmp[i].lblIndex.gameObject );
				tmp.RemoveAt ( i );

				lines = tmp.ToArray ();
			}
			
			node.SetOutputAmount ( lines.Length );
		}

		public function AddLine () {
			var parent : Transform = lines[0].fldInput.transform.parent.parent;

			var go : GameObject = new GameObject ( lines.Length.ToString () );
			go.transform.parent = parent;
			go.transform.localPosition = new Vector3 ( 0, 30 + lines.Length * lines[0].fldInput.transform.localScale.y + 10, 0 );
			go.transform.localScale = Vector3.one;

			var input : OGTextField = Instantiate ( lines[0].fldInput );
			input.transform.parent = go.transform;
			input.transform.localPosition = Vector3.zero;
			input.transform.localScale = lines[0].fldInput.transform.localScale;

			var remove : OGButton = Instantiate ( lines[0].btnRemove );
			remove.transform.parent = go.transform;
			remove.transform.localPosition = lines[0].btnRemove.transform.localPosition;
			remove.transform.localScale = lines[0].btnRemove.transform.localScale;
			remove.argument = lines.Length.ToString ();
	
			var index : OGLabel = Instantiate ( lines[0].lblIndex );
			index.transform.parent = go.transform;
			index.transform.localPosition = lines[0].lblIndex.transform.localPosition;
			index.transform.localScale = lines[0].lblIndex.transform.localScale;
			index.text = "# " + lines.Length.ToString ();

			var line : Line = new Line ();
			line.fldInput = input;
			line.btnRemove = remove;
			line.lblIndex = index;

			var tmp : List.< Line > = new List.< Line > ( lines );

			tmp.Add ( line );

			lines = tmp.ToArray ();

			node.SetOutputAmount ( lines.Length );
		}

		public function Update () {
			if ( node.speak.lines.Length != lines.Length ) {
				node.speak.lines = new String [ lines.Length ];
			}

			btnAdd.transform.localPosition.y = 30 + lines.Length * 110;

			for ( var i : int = 0; i < lines.Length; i++ ) {
				node.speak.lines[i] = lines[i].fldInput.text;
				lines[i].fldInput.transform.parent.localPosition = new Vector3 ( 0, 30 + i * ( lines[i].fldInput.transform.localScale.y + 10 ), 0 );
				
				if ( i > 0 ) {
					lines[i].btnRemove.argument = i.ToString ();
					lines[i].btnRemove.gameObject.SetActive ( true );

				} else {
					lines[i].btnRemove.gameObject.SetActive ( false );

				}

				lines[i].lblIndex.text = "# " + i.ToString ();
			}
		}
	}

	public var tree : OCTree;
	public var currentRoot : int;
	@NonSerialized public var node : OCNode;
	public var popType : OGPopUp;
	
	public var inspectorSpeak : Speak;

	private var currentInspector : Inspector;

	public function SetNode ( id : int ) {
		node = tree.rootNodes [ currentRoot ].GetNode ( id );
		SetType ( node.type.ToString () );
	}

	public function AddLine () {
		inspectorSpeak.AddLine ();
		
		OCTreeEditor.Refresh ();
	}
	
	public function RemoveLine ( n : String ) {
		inspectorSpeak.RemoveLine ( int.Parse ( n ) );
		
		OCTreeEditor.Refresh ();
	}

	public function SetType ( type : String ) {
		if ( !tree || !node ) { return; }
		
		OCTreeEditor.Refresh ();
	
		if ( node.type.ToString() != type ) {
			node.SetType ( type );
		}

		for ( var inspector : Inspector in [ inspectorSpeak ] ) {
			if ( node.type == inspector.type ) {
				inspector.gameObject.SetActive ( true );
				inspector.Init ( tree, node );
				currentInspector = inspector;

			} else {
				inspector.gameObject.SetActive ( false );

			}

		}
	}

	public function Update () {
		if ( !tree || !node ) { return; }

		if ( currentInspector ) {
			currentInspector.Update ();
		}
	}
}
