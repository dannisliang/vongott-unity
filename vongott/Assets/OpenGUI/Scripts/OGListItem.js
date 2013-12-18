#pragma strict

class OGListItem extends OGWidget {
	public var text : String = "";
	public var selected : boolean = false;
	public var object : Object;
	public var target : GameObject;
	public var message : String;
	public var argument : String;

	private var background : OGSprite;
	private var label : OGLabel;

	private function Action () {
		if ( target != null ) {
			if ( !String.IsNullOrEmpty ( message ) ) {
				if ( !String.IsNullOrEmpty ( argument ) ) {
					target.SendMessage ( message, argument );
				
				} else if ( object != null ) {
					target.SendMessage ( message, object );
				
				} else {
					target.SendMessage ( message, this );

				}
			}
		}
	}

	override function OnMouseCancel () {
		OGRoot.GetInstance().ReleaseWidget ();
	}

	override function OnMouseDown () {
		selected = true;

		if ( !Input.GetKeyDown ( KeyCode.LeftShift ) ) {
			for ( var li : OGListItem in this.transform.parent.GetComponentsInChildren.<OGListItem>() ) {
				if ( li != this ) {
					li.selected = false;
				}
			}
		}

		Action ();
		SetDirty();
	}

	override function SetDrawn ( drawn : boolean ) {
		if ( !background || !label ) {
			Build ();
		}
		
		isDrawn = drawn;

		background.isDrawn = isDrawn;
		label.isDrawn = isDrawn;
	}

	override function Build () {
		isSelectable = true;

		// Background		
		if ( background == null ) {
			if ( this.gameObject.GetComponentInChildren ( OGSprite ) ) {
				background = this.gameObject.GetComponentInChildren ( OGSprite );
			} else {			
				var newSprite : OGSprite = new GameObject ( "Sprite", OGSprite ).GetComponent ( OGSprite );
				newSprite.transform.parent = this.transform;
				background = newSprite;	
			}
		}

		background.transform.localScale = Vector3.one;
		background.transform.localEulerAngles = Vector3.zero;
		background.transform.localPosition = Vector3.zero;
	
		background.hidden = true;
		
		// Label
		if ( label == null ) {
			if ( this.gameObject.GetComponentInChildren ( OGLabel ) ) {
				label = this.gameObject.GetComponentInChildren ( OGLabel );
			} else {				
				var newLabel : OGLabel = new GameObject ( "Label", OGLabel ).GetComponent ( OGLabel );
				newLabel.transform.parent = this.transform;
				label = newLabel;
			}
		}

		label.transform.localScale = Vector3.one;
		label.transform.localEulerAngles = Vector3.zero;
		label.transform.localPosition = Vector3.zero;
		
		label.hidden = true;
	}

	override function UpdateWidget () {
		if ( !background || !label ) {
			Build ();
		}

		// Mouse
		mouseRct = background.drawRct;

		// Update data
		label.text = text;
		
		if ( selected ) {
			background.styles.basic = this.styles.active;
			label.styles.basic = this.styles.active;
		} else if ( disabled ) {
			background.styles.basic = this.styles.disabled;
			label.styles.basic = this.styles.disabled;
		} else {
			background.styles.basic = this.styles.basic;
			label.styles.basic = this.styles.basic;
		}

	}
}
