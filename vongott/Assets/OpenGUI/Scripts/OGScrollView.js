#pragma strict

public class OGScrollView extends OGWidget {
	public var size : Vector2;
	public var position : Vector2;
	public var padding : Vector2 = new Vector2 ( 10, 10 );
	public var elasticity : float = 2;

	// TODO: Deprecate
	@HideInInspector public var scrollLength : float = 0;
	@HideInInspector public var scrollWidth : float = 0;
	@HideInInspector public var viewHeight : float = 0;
	@HideInInspector public var inset : float = 0;

	private var dragging : boolean = false;
	
	override function UpdateWidget () {
		selectable = false;
		
		if ( stretch.width != ScreenSize.None ) {
			size.x = RecalcScale().x;
		}

		if ( stretch.height != ScreenSize.None ) {
			size.y = RecalcScale().y;
		}

		mouseRct = drawRct;

		// Reset scale	
		this.transform.localScale = Vector3.one;
		
		// Scrolling
		var drag : Vector2;
		var amount : Vector2;
		drag.x = Input.GetAxis ( "Mouse X" ); 
		drag.y = Input.GetAxis ( "Mouse Y" );
	
		// ^ Scroll wheel	
		if ( CheckMouseOver () ) {
			var scroll : float = Input.GetAxis ( "Mouse ScrollWheel" );

			if ( scroll != 0 ) {
				OGRoot.GetInstance().SetDirty();	
			}

			if ( scroll > 0 ) {
				amount.y = 20;
			
			} else if ( scroll < 0 ) {
				amount.y = -20;
			}	
		
			if ( Input.GetMouseButtonDown ( 2 ) ) {
				dragging = true;
			}
		}
		
		// ^ Drag
		if ( dragging ) { 	
			OGRoot.GetInstance().SetDirty();	
		
			if ( Input.GetMouseButton ( 2 ) ) {
				amount.x = Mathf.Floor ( drag.x * 20 );
				amount.y = -Mathf.Floor ( drag.y * 20 );
			}
			
			if ( Input.GetMouseButtonUp ( 2 ) ) {
				dragging = false;
			}
		
		// ^ Snap back
		} else {
			if ( position.y > 0 ) {
				position.y = Mathf.Lerp ( position.y, 0, Time.deltaTime * padding.y );
			}
			
			if ( position.x > 0 ) {
				position.x = Mathf.Lerp ( position.x, 0, Time.deltaTime * padding.x );
			}
		}	

		// ^ Elasticity
		if ( position.x + amount.x < padding.x * elasticity ) {
			position.x += amount.x / Mathf.Clamp ( position.x, 1, padding.x * elasticity );
		}

		if ( position.y + amount.y < padding.x * elasticity ) {
			position.y += amount.y / Mathf.Clamp ( position.y, 1, padding.y * elasticity );;
		}	
		
		
		// Update all widgets
		for ( var w : OGWidget in this.gameObject.GetComponentsInChildren.<OGWidget>() ) {
			if ( w != this ) {
				w.scrollOffset = new Vector3 ( padding.x + position.x, padding.y + position.y, 0 );
				w.clipRct = drawRct;

				// Make sure the widgets are always at least 1 unit over the background
				if ( w.transform.localPosition.z > -1 ) {
					var newPos : Vector3 = w.transform.localPosition;
					newPos.z = -1;
					w.transform.localPosition = newPos;
				}
			}
		}

		// Make sure the background is always above 0 units away
		if ( this.transform.position.z < 1 ) {
			this.transform.position = new Vector3 ( this.transform.position.x, this.transform.position.y, 1 );
		}	

	}
	
	override function DrawGL () {
		GL.TexCoord2 ( drawCrd.x, drawCrd.y );
		GL.Vertex3 ( drawRct.x, drawRct.y, -this.transform.position.z );
		
		GL.TexCoord2 ( drawCrd.x, drawCrd.y + drawCrd.height );
		GL.Vertex3 ( drawRct.x, drawRct.y + drawRct.height, -this.transform.position.z );
		
		GL.TexCoord2 ( drawCrd.x + drawCrd.width, drawCrd.y + drawCrd.height );
		GL.Vertex3 ( drawRct.x + drawRct.width, drawRct.y + drawRct.height, -this.transform.position.z );
		
		GL.TexCoord2 ( drawCrd.x + drawCrd.width, drawCrd.y );
		GL.Vertex3 ( drawRct.x + drawRct.width, drawRct.y, -this.transform.position.z );
	}
}
