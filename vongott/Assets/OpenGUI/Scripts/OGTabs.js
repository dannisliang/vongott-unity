#pragma strict

public class OGTabs extends OGWidget {
	public class Tab {
		public var title : String = "Tab";
		public var content : GameObject;
	}
	
	public var activeTab : int;
	public var tabs : Tab[];
	
	public function AddTab ( tabName : String, tabObject : GameObject, switchTo : boolean ) {
		var list : List.< Tab > = new List.< Tab > ( tabs );
		var newTab : Tab = new Tab ();

		newTab.title = tabName;
		newTab.content = tabObject;

		list.Add ( newTab );

		tabs = list.ToArray();

		Build ();
		
		if ( switchTo || tabs.Length < 1 ) {
			activeTab = tabs.Length;
		}
	}

	public function ClearTabs () {
		tabs = new Tab[0];
		Build ();
	}


	//////////////////
	// Set drawn
	//////////////////
	override function SetDrawn ( drawn : boolean ) {
		isDrawn = drawn;

		for ( var i : int = 0; i < this.transform.childCount; i++ ) {
			var btn : OGButton = this.transform.GetChild(i).GetComponent(OGButton);
			btn.SetDrawn ( isDrawn );
		}
	}


	//////////////////
	// Build
	//////////////////
	override function Build () {
		isSelectable = true;

		var i : int = 0;
		var btn : OGButton;

		if ( !tabs ) {
			tabs = new Tab[0];
		}

		// Edit existing or create new ones
		for ( i = 0; i < tabs.Length; i++ ) {
			if ( i < this.transform.childCount ) {
				btn = this.transform.GetChild(i).GetComponent(OGButton);
			} else {
				btn = new GameObject ( "", OGButton ).GetComponent(OGButton);
				btn.transform.parent = this.transform;
			}

			btn.text = tabs[i].title;
			btn.hidden = true;
			btn.target = this.gameObject;
			btn.message = "SetActiveTab";
			btn.argument = i.ToString();
			btn.styles.basic = this.styles.basic;
			btn.styles.active = this.styles.active;

			btn.gameObject.name = i + ": " + tabs[i].title;
			btn.transform.localScale = new Vector3 ( 1.0 / this.transform.childCount, 1, 1 );
			btn.transform.localPosition = new Vector3 ( (i*1.0) / this.transform.childCount, 0, 0 );
		}

		// Destroy remaining
		if ( this.transform.childCount > tabs.Length ) {
			for ( i = tabs.Length; i < this.transform.childCount; i++ ) {
				DestroyImmediate ( this.transform.GetChild(i).gameObject );
			}
		}

		// Set active tab
		SetActiveTab ( activeTab );
	}

	public function SetActiveTab ( n : String ) {
		SetActiveTab ( int.Parse ( n ) );
	}

	public function SetActiveTab ( tab : int ) {
		activeTab = tab;
		
		for ( var i : int = 0; i < this.transform.childCount; i++ ) {
			var btn : OGButton = this.transform.GetChild(i).GetComponent(OGButton);
					
			if ( activeTab != i ) {
				btn.styles.basic = styles.basic;
				
				if ( tabs[i].content != null && tabs[i].content.activeSelf ) {
					tabs[i].content.SetActive ( false );
				}
				
			} else {
				btn.styles.basic = styles.active;
				
				if ( tabs[i].content != null && !tabs[i].content.activeSelf ) {
					tabs[i].content.SetActive ( true );
				}
			}
		}
	}
	
	override function UpdateWidget () {
		// Null check
		if ( tabs == null ) {
			Build ();
			return;
		}

		// Update data
		if ( activeTab >= tabs.Length && tabs.Length > 0 ) {
			activeTab = tabs.Length - 1;
	 	} 
	}
}
