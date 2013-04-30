#pragma strict

@script ExecuteInEditMode

class OGImage extends OGWidget {
	var image : Texture;
	var scale : ScaleMode;
	var alphaBlend : boolean = true;
	var aspectRatio : float = 0.0;
	
	override function Draw ( x : float, y : float ) {
		GUI.depth = depth;
		
		if ( image ) {
			GUI.DrawTexture ( Rect ( x, y, transform.localScale.x, transform.localScale.y ), image, scale, alphaBlend, aspectRatio );
		}
	}
}