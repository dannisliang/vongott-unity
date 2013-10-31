#pragma strict

class EditorConversationNode extends MonoBehaviour {
	
	public class Speak {
		public var container : GameObject;
		public var addBtn : OGButton;
		public var speakerPopUp : OGPopUp;
		public var lines : Transform;
		public var linePrefab : EditorConversationNodeLine;
	}
	
	public var frame : Transform;
	public var type : Transform;
	public var allTypes : GameObject[];
	public var input : OGButton;
	public var speak : Speak;
	
	public var connectedTo : List.<EditorConversationNode> = new List.<EditorConversationNode>();
	
	// Init
	public function Start () {
		SetType ( type.GetComponentInChildren(OGPopUp).selectedOption );
	}
	
	// Switch type
	public function SetType ( type : String ) {
		for ( var t : GameObject in allTypes ) {
			t.SetActive ( t.name == type );
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
				break;
				
			case "Condition":
				AdjustFrame ( 340, 50, 1 );
				break;
		}
	}
	
	// I/O
	public function TryConnect ( n : String ) {
		var i : int = int.Parse ( n ) ;
	
		EditorConversationMap.GetInstance().ConnectNodes (
			function ( other : EditorConversationNode ) {
				if ( other == this ) { return; }
				
				if ( connectedTo.Count <= i ) {
					connectedTo.Add ( other );
				} else {
					connectedTo[i] = other;
				}
			}
		);
	}
	
	public function TryConnect () {
		TryConnect ( "0" );
	}
	
	public function ConnectInput () {
		if ( EditorConversationMap.GetInstance().connectMode ) {
			EditorConversationMap.GetInstance().connectionCallback ( this );
			EditorConversationMap.GetInstance().connectMode = false;
		}
	}
	
	// Speak	
	public function RemoveLine ( n : String ) {
		var i : int = int.Parse ( n );
	
		Destroy ( speak.lines.GetChild(i).gameObject );
		
		StartCoroutine ( SortLines () );
	}
	
	public function AddLine () {
		var i : int = speak.lines.childCount;
	
		var line : EditorConversationNodeLine = Instantiate ( speak.linePrefab ) as EditorConversationNodeLine;
		line.gameObject.name = i.ToString(); 
		
		line.SetTarget ( this.gameObject, i );
		
		line.transform.parent = speak.lines;
		line.transform.localScale = Vector3.one;
	
		StartCoroutine ( SortLines () );
	}
	
	public function SortLines () : IEnumerator {
		yield WaitForEndOfFrame();
	
		for ( var i : int = 0; i < speak.lines.childCount; i++ ) {
			speak.lines.GetChild(i).localPosition = new Vector3 ( 0, i * 30, 0 );
			speak.lines.GetChild(i).GetComponent(EditorConversationNodeLine).SetRemoveable(i>0);
			speak.addBtn.transform.localPosition = new Vector3 ( 80, 30 + i * 30, 0 );
			AdjustFrame ( 420, 30 + (i*30) + 50, 1 );
		}
	}

	// Frame
	private function AdjustFrame ( x : float, y : float, z : float ) {
		frame.localScale = new Vector3 ( x, y, z );
		type.localPosition = new Vector3 ( (x/2) - 85, 0, 0 );
	}
	
	// Draw lines
	function OnGUI () {
		
	}
}