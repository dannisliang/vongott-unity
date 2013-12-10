#pragma strict

public class OGTexture extends OGWidget {
	enum XorY {
		X,
		Y
	}
	
	public var mainTexture : Texture2D;
	public var scale : ScaleMode;
	public var alphaBlend : boolean = true;
	public var repeatTexture : Vector2;
	public var maintainRatio : XorY;
	
	// TODO: Deprecate
	@HideInInspector public var image : Texture2D;
	
	override function UpdateWidget () {
		// TODO: Deprecate
		mainTexture = image;
		
		if ( mainTexture ) {
			if ( mainTexture.wrapMode != TextureWrapMode.Repeat ) {
				mainTexture.wrapMode = TextureWrapMode.Repeat;
			}
		}
	}
	
	/*
	override function DrawGUI () {
		if ( mainTexture ) {						
			var x : float = this.transform.position.x + offset.x + scrollOffset.x;
			var y : float = this.transform.position.y + offset.y + scrollOffset.y;
			
			if ( repeatTexture.x > 0 || repeatTexture.y > 0 ) {
				if ( maintainRatio == XorY.X ) {
					var ratioX : float = transform.localScale.y / transform.localScale.x;
					
					repeatTexture.y = repeatTexture.x * ratioX;
				} else if ( maintainRatio == XorY.Y ) {
					var ratioY : float = transform.localScale.x / transform.localScale.y;
					
					repeatTexture.x = repeatTexture.y * ratioY;
				}
				
				GUI.DrawTextureWithTexCoords ( Rect ( x, y, transform.lossyScale.x, transform.lossyScale.y ), mainTexture, Rect ( 0, 0, repeatTexture.x, repeatTexture.y ), alphaBlend );
			} else {
				GUI.DrawTexture ( Rect ( x, y, transform.lossyScale.x, transform.lossyScale.y ), mainTexture, scale, alphaBlend, 0.0 );
			}
		}
	}*/
}
