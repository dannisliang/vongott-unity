﻿#pragma strict

public class OGSlicedSprite extends OGWidget {
	private var drawBrd : OGSlicedSpriteOffset;
	private var pixelBrd : OGSlicedSpriteOffset;
	private var clipTop : float;
	private var clipRight : float;
	private var clipBottom : float;
	private var clipLeft : float;


	//////////////////
	// Calculations
	//////////////////
	// Border (based on texture size)
	private function RecalcBorder ( border : OGSlicedSpriteOffset ) : OGSlicedSpriteOffset {
		return new OGSlicedSpriteOffset ( border.left / root.texWidth, border.right / root.texWidth, border.top / root.texHeight, border.bottom / root.texHeight );
	}
	
	//////////////////
	// 9-slice drawing
	//////////////////
	// Top left corner
	private function DrawTopLeftCorner () {
		// Bottom left
		GL.TexCoord2 ( drawCrd.x, drawCrd.y + drawCrd.height - drawBrd.top );
		GL.Vertex3 ( drawRct.x, drawRct.y + drawRct.height - pixelBrd.top, drawDepth );
		
		// Top left
		GL.TexCoord2 ( drawCrd.x, drawCrd.y + drawCrd.height );
		GL.Vertex3 ( drawRct.x, drawRct.y + drawRct.height, drawDepth );
				
		// Top right
		GL.TexCoord2 ( drawCrd.x + drawBrd.left, drawCrd.y + drawCrd.height );
		GL.Vertex3 ( drawRct.x + pixelBrd.left, drawRct.y + drawRct.height, drawDepth );
		
		// Bottom right
		GL.TexCoord2 ( drawCrd.x + drawBrd.left, drawCrd.y + drawCrd.height - drawBrd.top );
		GL.Vertex3 ( drawRct.x + pixelBrd.left, drawRct.y + drawRct.height - pixelBrd.top, drawDepth );
		
	}
	
	// Top panel
	private function DrawTopPanel () {		
		// Bottom left
		GL.TexCoord2 ( drawCrd.x + drawBrd.left, drawCrd.y + drawCrd.height - drawBrd.top );
		GL.Vertex3 ( drawRct.x + pixelBrd.left, drawRct.y + drawRct.height - pixelBrd.top, drawDepth );
		
		// Top left
		GL.TexCoord2 ( drawCrd.x + drawBrd.left, drawCrd.y + drawCrd.height );
		GL.Vertex3 ( drawRct.x + pixelBrd.left, drawRct.y + drawRct.height, drawDepth );
				
		// Top right
		GL.TexCoord2 ( drawCrd.x + drawCrd.width - drawBrd.right, drawCrd.y + drawCrd.height );
		GL.Vertex3 ( drawRct.x + drawRct.width - pixelBrd.right, drawRct.y + drawRct.height, drawDepth );
		
		// Bottom right
		GL.TexCoord2 ( drawCrd.x + drawCrd.width - drawBrd.right, drawCrd.y + drawCrd.height - drawBrd.top );
		GL.Vertex3 ( drawRct.x + drawRct.width - pixelBrd.right, drawRct.y + drawRct.height - pixelBrd.top, drawDepth );
		
	}
	
	// Top right corner
	private function DrawTopRightCorner () {		
		// Bottom left
		GL.TexCoord2 ( drawCrd.x + drawCrd.width - drawBrd.right, drawCrd.y + drawCrd.height - drawBrd.top );
		GL.Vertex3 ( drawRct.x + drawRct.width - pixelBrd.right, drawRct.y + drawRct.height - pixelBrd.top, drawDepth );
		
		// Top left
		GL.TexCoord2 ( drawCrd.x + drawCrd.width - drawBrd.right, drawCrd.y + drawCrd.height );
		GL.Vertex3 ( drawRct.x + drawRct.width - pixelBrd.right, drawRct.y + drawRct.height, drawDepth );
				
		// Top right
		GL.TexCoord2 ( drawCrd.x + drawCrd.width, drawCrd.y + drawCrd.height );
		GL.Vertex3 ( drawRct.x + drawRct.width, drawRct.y + drawRct.height, drawDepth );
		
		// Bottom right
		GL.TexCoord2 ( drawCrd.x + drawCrd.width, drawCrd.y + drawCrd.height - drawBrd.top );
		GL.Vertex3 ( drawRct.x + drawRct.width, drawRct.y + drawRct.height - pixelBrd.top, drawDepth );
		
	}
	
	// Right panel
	private function DrawRightPanel () {		
		// Bottom left
		GL.TexCoord2 ( drawCrd.x + drawCrd.width - drawBrd.right, drawCrd.y + drawBrd.bottom );
		GL.Vertex3 ( drawRct.x + drawRct.width - pixelBrd.right, drawRct.y + pixelBrd.bottom, drawDepth );
		
		// Top left
		GL.TexCoord2 ( drawCrd.x + drawCrd.width - drawBrd.right, drawCrd.y + drawCrd.height - drawBrd.top );
		GL.Vertex3 ( drawRct.x + drawRct.width - pixelBrd.right, drawRct.y + drawRct.height - pixelBrd.top, drawDepth );
				
		// Top right
		GL.TexCoord2 ( drawCrd.x + drawCrd.width, drawCrd.y + drawCrd.height - drawBrd.top );
		GL.Vertex3 ( drawRct.x + drawRct.width, drawRct.y + drawRct.height - pixelBrd.top, drawDepth );
		
		// Bottom right
		GL.TexCoord2 ( drawCrd.x + drawCrd.width, drawCrd.y + drawBrd.bottom + drawBrd.bottom );
		GL.Vertex3 ( drawRct.x + drawRct.width, drawRct.y + pixelBrd.bottom, drawDepth );
		
	}
	
	// Bottom right corner
	private function DrawBottomRightCorner () {		
		// Bottom left
		GL.TexCoord2 ( drawCrd.x + drawCrd.width - drawBrd.right, drawCrd.y );
		GL.Vertex3 ( drawRct.x + drawRct.width - pixelBrd.right, drawRct.y, drawDepth );
		
		// Top left
		GL.TexCoord2 ( drawCrd.x + drawCrd.width - drawBrd.right, drawCrd.y + drawBrd.bottom );
		GL.Vertex3 ( drawRct.x + drawRct.width - pixelBrd.right, drawRct.y + pixelBrd.bottom, drawDepth );
				
		// Top right
		GL.TexCoord2 ( drawCrd.x + drawCrd.width, drawCrd.y + drawBrd.bottom );
		GL.Vertex3 ( drawRct.x + drawRct.width, drawRct.y + pixelBrd.bottom, drawDepth );
		
		// Bottom right
		GL.TexCoord2 ( drawCrd.x + drawCrd.width, drawCrd.y );
		GL.Vertex3 ( drawRct.x + drawRct.width, drawRct.y, drawDepth );
		
	}
	
	// Bottom panel
	private function DrawBottomPanel () {		
		// Bottom left
		GL.TexCoord2 ( drawCrd.x + drawBrd.left, drawCrd.y );
		GL.Vertex3 ( drawRct.x + pixelBrd.left, drawRct.y, drawDepth );
		
		// Top left
		GL.TexCoord2 ( drawCrd.x + drawBrd.left, drawCrd.y + drawBrd.bottom );
		GL.Vertex3 ( drawRct.x + pixelBrd.left, drawRct.y + pixelBrd.bottom, drawDepth );
				
		// Top right
		GL.TexCoord2 ( drawCrd.x + drawCrd.width - drawBrd.right, drawCrd.y + drawBrd.bottom );
		GL.Vertex3 ( drawRct.x + drawRct.width - pixelBrd.right, drawRct.y + pixelBrd.bottom, drawDepth );
		
		// Bottom right
		GL.TexCoord2 ( drawCrd.x + drawCrd.width - drawBrd.right, drawCrd.y );
		GL.Vertex3 ( drawRct.x + drawRct.width - pixelBrd.right, drawRct.y, drawDepth );
		
	}
	
	// Bottom left corner
	private function DrawBottomLeftCorner () {		
		// Bottom left
		GL.TexCoord2 ( drawCrd.x, drawCrd.y );
		GL.Vertex3 ( drawRct.x, drawRct.y, drawDepth );
		
		// Top left
		GL.TexCoord2 ( drawCrd.x, drawCrd.y + drawBrd.bottom );
		GL.Vertex3 ( drawRct.x, drawRct.y + pixelBrd.bottom, drawDepth );
				
		// Top right
		GL.TexCoord2 ( drawCrd.x + drawBrd.left, drawCrd.y + drawBrd.bottom );
		GL.Vertex3 ( drawRct.x + pixelBrd.left, drawRct.y + pixelBrd.bottom, drawDepth );
		
		// Bottom right
		GL.TexCoord2 ( drawCrd.x + drawBrd.left, drawCrd.y );
		GL.Vertex3 ( drawRct.x + pixelBrd.left, drawRct.y, drawDepth );
		
	}
	
	// Left panel
	private function DrawLeftPanel () {		
		// Bottom left
		GL.TexCoord2 ( drawCrd.x, drawCrd.y + drawBrd.bottom );
		GL.Vertex3 ( drawRct.x, drawRct.y + pixelBrd.bottom, drawDepth );
		
		// Top left
		GL.TexCoord2 ( drawCrd.x, drawCrd.y + drawCrd.height - drawBrd.top );
		GL.Vertex3 ( drawRct.x, drawRct.y + drawRct.height - pixelBrd.top, drawDepth );
				
		// Top right
		GL.TexCoord2 ( drawCrd.x + drawBrd.left, drawCrd.y + drawCrd.height - drawBrd.top );
		GL.Vertex3 ( drawRct.x + pixelBrd.left, drawRct.y + drawRct.height - pixelBrd.top, drawDepth );
		
		// Bottom right
		GL.TexCoord2 ( drawCrd.x + drawBrd.left, drawCrd.y + drawBrd.bottom );
		GL.Vertex3 ( drawRct.x + pixelBrd.left, drawRct.y + pixelBrd.bottom, drawDepth );
		
	}
	
	// Center
	private function DrawCenter () {
		// Bottom left
		GL.TexCoord2 ( drawCrd.x + drawBrd.left, drawCrd.y + drawBrd.bottom );
		GL.Vertex3 ( drawRct.x + pixelBrd.left, drawRct.y + pixelBrd.bottom, drawDepth );
		
		// Top left
		GL.TexCoord2 ( drawCrd.x + drawBrd.left, drawCrd.y + drawCrd.height - drawBrd.top );
		GL.Vertex3 ( drawRct.x + pixelBrd.left, drawRct.y + drawRct.height - pixelBrd.top, drawDepth );
		
		// Top right
		GL.TexCoord2 ( drawCrd.x + drawCrd.width - drawBrd.right, drawCrd.y + drawCrd.height - drawBrd.top );
		GL.Vertex3 ( drawRct.x + drawRct.width - pixelBrd.right, drawRct.y + drawRct.height - pixelBrd.top, drawDepth );
		
		// Bottom right
		GL.TexCoord2 ( drawCrd.x + drawCrd.width - drawBrd.right, drawCrd.y + drawBrd.bottom );
		GL.Vertex3 ( drawRct.x + drawRct.width - pixelBrd.right, drawRct.y + pixelBrd.bottom, drawDepth );
	}
	
	
	//////////////////
	// Update
	//////////////////	
	override function UpdateWidget () {
		if ( styles.basic != null ) {
			drawBrd = RecalcBorder ( styles.basic.border );
			pixelBrd = styles.basic.border;
		}
	
		mouseRct = drawRct;
	}
	
	
	//////////////////
	// Draw
	//////////////////
	override function DrawGL () {
		if ( drawCrd == null || drawRct == null || drawBrd == null || pixelBrd == null ) { return; }

		DrawTopLeftCorner ();
		DrawTopPanel ();
		DrawTopRightCorner ();
		DrawRightPanel ();
		DrawCenter ();
		DrawBottomRightCorner ();
		DrawBottomPanel ();
		DrawBottomLeftCorner ();
		DrawLeftPanel ();
	}
}
