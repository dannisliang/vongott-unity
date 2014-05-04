#pragma strict

public class OELightInspector extends OEComponentInspector {
	public var lightType : OEPopup;
	public var range : OEFloatField;
	public var color : OEColorField;
	public var intensity : OESlider;
	public var shadowType : OEPopup;

	override function Update () {
		var light : Light = target.GetComponent.< Light >();

		light.type = lightType.Set ( light.type, System.Enum.GetNames ( typeof ( LightType ) ) );
		light.range = range.Set ( light.range );
		light.color = color.Set ( light.color );
		light.intensity = intensity.Set ( light.intensity, 0, 8 );
		light.shadows = shadowType.Set ( light.shadows, System.Enum.GetNames ( typeof ( LightShadows ) ) );
	}	
}
