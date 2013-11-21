Shader "DepthMask" {
    SubShader {
	        // Render the mask BEFORE regular geometry, AND ALSO before masked geometry and
	        // transparent things.
	  
	        Tags {"Queue" = "Geometry-10" }
	  
	        // Don't draw in the RGBA channels; just the depth buffer
	                // ADAM: causes it to mask-out that part of the screen, and
	                //       no further rendering will happen there
	  
	        ColorMask 0
	        ZWrite On
	  
	        // Do nothing specific in the pass:
	  
	        Pass {}
	    }
}