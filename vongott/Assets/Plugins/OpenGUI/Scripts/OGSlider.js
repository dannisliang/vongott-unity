#pragma strict

@script ExecuteInEditMode

class OGSlider extends OGWidget {
	var sliderValue : float = 1.0;
	var min : float = 0.0;
	var max : float = 1.0;
		
	override function Draw ( x : float, y : float ) {	
		GUI.depth = depth;
		
		sliderValue = GUI.HorizontalSlider ( Rect ( x, y, transform.localScale.x, transform.localScale.y ), sliderValue, min, max );
	}
}