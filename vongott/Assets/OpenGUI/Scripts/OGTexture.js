#pragma strict

public class OGTexture extends OGWidget {
	enum XorY {
		X,
		Y
	}
	
	public var mainTexture : Texture2D;
	
	// TODO: Deprecate
	@HideInInspector public var image : Texture2D;
	@HideInInspector public var scale : ScaleMode;
	@HideInInspector public var alphaBlend : boolean = true;
	@HideInInspector public var repeatTexture : Vector2;
	@HideInInspector public var maintainRatio : XorY;
	
	override function UpdateWidget () {
		// TODO: Deprecate
		if ( image ) { mainTexture = image; }
		
		if ( mainTexture ) {
			if ( mainTexture.wrapMode != TextureWrapMode.Repeat ) {
				mainTexture.wrapMode = TextureWrapMode.Repeat;
			}
		}
	}

	override function DrawGL () {
		if ( mainTexture ) {
			Graphics.DrawTexture ( drawRct, mainTexture );
		}
	}
}
