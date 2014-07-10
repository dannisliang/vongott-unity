#pragma strict

public class OGTestWidget extends OGWidget {
	public var mainTexture : Texture2D;
	
	private var material : Material;

	private var matrix : Matrix4x4;
	
	private function GetVector ( x : float, y : float ) : Vector3 {
		var height : float = this.transform.localScale.y;
		var width : float = this.transform.localScale.x;
		var depth : float = this.transform.position.z;
	
		var left : float = 0;
		var top : float = -height;

		switch ( pivot.x ) {
			case RelativeX.Center:
				left = -width / 2;
				break;
			
			case RelativeX.Right:
				left = -width;
				break;
		}
		
		switch ( pivot.y ) {
			case RelativeY.Center:
				top = -height / 2;
				break;
			
			case RelativeY.Bottom:
				top = 0;
				break;
		}

		return matrix.MultiplyPoint3x4 ( new Vector3 ( x * width + left, y * height + top, depth ) );
	}

	override function UpdateWidget () {
		mouseRct = drawRct;
	}

	override function DrawGL () {
		if ( drawRct == null || mainTexture == null ) {
			return;
		}
	
		if ( material == null ) {
			material = new Material ( root.skin.atlas.shader );
			return;
		}

		if ( material.mainTexture != mainTexture ) {
			material.mainTexture = mainTexture;
			return;
		}

		matrix.SetTRS ( new Vector3 ( this.transform.position.x, Screen.height - this.transform.position.y, drawDepth ), Quaternion.Euler ( 0, 0, -this.transform.eulerAngles.z ), Vector3.one );

		var displayRct : Rect = drawRct;
		var uvRct : Rect = new Rect ( 0, 0, 1, 1 );

		if ( clipTo ) {
			if ( clipTo.drawRct.xMin > displayRct.xMin ) {
				uvRct.xMin = ( clipTo.drawRct.xMin - displayRct.xMin ) / this.transform.lossyScale.x;
				displayRct.xMin = clipTo.drawRct.xMin;
			}
			
			if ( clipTo.drawRct.xMax < displayRct.xMax ) {
				uvRct.xMax = ( displayRct.xMax - clipTo.drawRct.xMax ) / this.transform.lossyScale.x;
				displayRct.xMax = clipTo.drawRct.xMax;
			}
			
			if ( clipTo.drawRct.yMin > displayRct.yMin ) {
				uvRct.yMin = ( clipTo.drawRct.yMin - displayRct.yMin ) / this.transform.lossyScale.y;
				displayRct.yMin = clipTo.drawRct.yMin;
			}
			
			if ( clipTo.drawRct.yMax < displayRct.yMax ) {
				uvRct.yMax = ( displayRct.yMax - clipTo.drawRct.yMax ) / this.transform.lossyScale.y;
				displayRct.yMax = clipTo.drawRct.yMax;
			}
		}

		GL.Begin(GL.QUADS);
		
		GL.Color ( tint );
		
		material.SetPass ( 0 );

		var v : Vector3 = Vector3.zero;

		// Bottom Left
		GL.TexCoord2 ( uvRct.x, uvRct.y );
		GL.Vertex ( GetVector ( 0, 0 ) );
		
		// Top left
		GL.TexCoord2 ( uvRct.x, uvRct.y + uvRct.height );
		GL.Vertex ( GetVector ( 0, 1 ) );
		
		// Top right
		GL.TexCoord2 ( uvRct.x + uvRct.width, uvRct.y + uvRct.height );
		GL.Vertex ( GetVector ( 1, 1 ) );
		
		// Bottom right
		GL.TexCoord2 ( uvRct.x + uvRct.width, uvRct.y );
		GL.Vertex ( GetVector ( 1, 0 ) );
		
		GL.Color ( Color.white );

		GL.End();
	}
}
