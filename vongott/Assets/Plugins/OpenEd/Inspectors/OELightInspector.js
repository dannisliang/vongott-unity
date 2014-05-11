﻿#pragma strict

public class OELightInspector extends OEComponentInspector {
	override function Inspector () {
		var light : Light = target.GetComponent.< Light >();

		light.type = Popup ( "Type", light.type, System.Enum.GetNames ( typeof ( LightType ) ) );
		light.range = FloatField ( "Range", light.range );
		light.color = ColorField ( "Color", light.color );
		light.intensity = Slider ( "Intesity", light.intensity, 0, 8 );
		light.shadows = Popup ( "Shadows", light.shadows, System.Enum.GetNames ( typeof ( LightShadows ) ) );
	}	
}
