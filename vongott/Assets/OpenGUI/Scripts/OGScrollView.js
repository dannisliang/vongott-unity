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
		if ( stretch.width != ScreenSize.None ) {
			size.x = RecalcScale().x * Screen.width;
		}

		if ( stretch.height != ScreenSize.None ) {
			size.y = RecalcScale().y * Screen.height;
		}

		// Reset scale	
		this.transform.localScale = Vector3.one;
		
		// Scrolling
		var drag : Vector2;
		var amount : Vector2;
		drag.x = Input.GetAxis ( "Mouse X" ); 
		drag.y = Input.GetAxis ( "Mouse Y" );
	
		// ^ Scroll wheel	
		if ( CheckMouseOver ( drawRct ) ) {
			var scroll : float = Input.GetAxis ( "Mouse ScrollWheel" );

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
				w.drawDepth -= drawDepth;
				w.clipRct = drawRct;
			}
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
