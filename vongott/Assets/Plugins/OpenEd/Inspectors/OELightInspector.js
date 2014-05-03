#pragma strict

public class OELightInspector extends OEComponentInspector {
	public var lightType : OEPopup;
	public var range : OEFloatField;
	public var color : OEColorField;
	public var intensity : OESlider;
	public var shadowType : OEPopup;

	override function In () {
		var light : Light = target.GetComponent.< Light >();

		lightType.In ( light.type, System.Enum.GetNames ( typeof ( LightType ) ) );
		range.In ( light.range );
		color.In ( light.color );
		intensity.In ( light.intensity, 0, 8 );
		shadowType.In ( light.shadows, System.Enum.GetNames ( typeof ( LightShadows ) ) );
	}	
	
	override function Out () {
		var light : Light = target.GetComponent.< Light >();

		light.type = lightType.Out ();
		light.range = range.Out ();
	       	light.color = color.Out ();
		light.intensity = intensity.Out ();
		light.shadows = shadowType.Out ();
	}	
}
