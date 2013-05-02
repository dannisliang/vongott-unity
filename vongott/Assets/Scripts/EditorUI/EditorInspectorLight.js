#pragma strict

private class ColorSliders {
	var r : OGSlider;
	var g : OGSlider;
	var b : OGSlider;
}

private class ValueSlider {
	var slider : OGSlider;
	var sliderValue : OGLabel; 
}

class EditorInspectorLight extends MonoBehaviour {
	var colorSliders : ColorSliders;
	var range : ValueSlider;
	var intensity : ValueSlider;

	function Init ( obj : GameObject ) {
		var lgt = obj.GetComponent( LightSource );
		
		colorSliders.r.sliderValue = lgt.color.r;
		colorSliders.g.sliderValue = lgt.color.g;
		colorSliders.b.sliderValue = lgt.color.b;
		
		range.slider.sliderValue = lgt.range;
		intensity.slider.sliderValue = lgt.intensity;
	}

	function Update () {
		range.sliderValue.text = range.slider.sliderValue.ToString("f1");
		intensity.sliderValue.text = intensity.slider.sliderValue.ToString("f1");
	
		for ( var o : GameObject in EditorCore.GetSelectedObjects() ) {
			if ( o.GetComponent ( LightSource ) ) {
				var l : LightSource = o.GetComponent ( LightSource );
				l.SetColor ( new Color ( colorSliders.r.sliderValue, colorSliders.g.sliderValue, colorSliders.b.sliderValue, 1.0 ) );
				l.SetRange ( range.slider.sliderValue );
				l.SetIntensity ( intensity.slider.sliderValue );
			}
		}
	}
}