#pragma strict

class OGButton extends OGWidget {
	public var hiddenString : String;
	public var text : String = "";
	public var target : GameObject;
	public var message : String;
	public var argument : String;
	public var func : Function;
	public var image : Texture2D;
	public var imageOffset : Vector2 = Vector2.zero;
	public var imageScale : Vector2 = Vector2.one;

	private var background : OGSlicedSprite;
	private var label : OGLabel;
	private var isDown : boolean = false;

	override function OnMouseUp () {
		if ( func ) {
			func ();
				
		} else if ( target != null && !String.IsNullOrEmpty ( message ) ) {
			if ( !String.IsNullOrEmpty ( argument ) ) {
				target.SendMessage ( message, argument );
			} else {	
				target.SendMessage ( message, this );
			}

		} else {
			Debug.LogWarning ( "OGButton '" + this.gameObject.name + "' | Target/message missing!" );
		
		}

		OnMouseCancel ();
	}
	
	override function OnMouseCancel () {
		isDown = false;
		OGRoot.GetInstance().ReleaseWidget ();
	}
	
	override function OnMouseDown () {
		isDown = true;
		SetDirty();
	}
	
	override function UpdateWidget () {
		selectable = true;
		
		// Background		
		if ( background == null ) {
			if ( this.gameObject.GetComponentInChildren ( OGSlicedSprite ) ) {
				background = this.gameObject.GetComponentInChildren ( OGSlicedSprite );
				
			} else {			
				var newSprite : OGSlicedSprite = new GameObject ( "SlicedSprite", OGSlicedSprite ).GetComponent ( OGSlicedSprite );
				newSprite.transform.parent = this.transform;
				newSprite.styles.basic = this.styles.basic;
			}
		
			UpdateWidget ();

		} else {
			background.transform.localScale = Vector3.one;
			background.transform.localEulerAngles = Vector3.zero;
			background.transform.localPosition = Vector3.zero;
		
			background.isDrawn = isDrawn;
			background.hidden = true;
			mouseRct = background.drawRct;
		}
		
		// Label
		if ( label == null ) {
			if ( this.gameObject.GetComponentInChildren ( OGLabel ) ) {
				label = this.gameObject.GetComponentInChildren ( OGLabel );
				
			} else {				
				var newLabel : OGLabel = new GameObject ( "Label", OGLabel ).GetComponent ( OGLabel );
				newLabel.transform.parent = this.transform;
				newLabel.text = text;
				newLabel.styles.basic = this.styles.basic;
			}
		
			UpdateWidget ();
			return;

		} else {
			label.text = text;
			label.transform.localScale = Vector3.one;
			label.transform.localEulerAngles = Vector3.zero;
			label.transform.localPosition = Vector3.zero;
			
			label.isDrawn = isDrawn;
			label.hidden = true;
		}
		
		// Styles
		if ( isDown ) {
			label.styles.basic = this.styles.active;
			background.styles.basic = this.styles.active;
		} else {	
			label.styles.basic = this.styles.basic;
			background.styles.basic = this.styles.basic;
		}
	}
}
