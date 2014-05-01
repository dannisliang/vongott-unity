﻿#pragma strict

public class OEInspector extends MonoBehaviour {
	public var objectName : OGTextField;
	public var transformInspector : OETransformInspector;
	public var componentContainer : Transform;
	public var componentTypes : OEComponentInspector[];
	public var componentSwitch : OGPopUp;
	
	@HideInInspector public var selection : OFSerializedObject[];

	public function Clear () {
		for ( var i : int = 0; i < componentContainer.childCount; i++ ) {
			Destroy ( componentContainer.GetChild ( i ).gameObject );
		}
	}

	public function IsComponentSupported ( name : String ) : boolean {
		for ( var i : int = 0; i < componentTypes.Length; i++ ) {
			if ( componentTypes[i].typeId == name ) {
				return true;
			}	
		}

		return false;
	}

	public function SelectComponent ( name : String ) {
		for ( var i : int = 0; i < componentTypes.Length; i++ ) {
			if ( componentTypes[i].typeId == name ) {
				Clear ();

				var newComponent : OEComponentInspector = Instantiate ( componentTypes[i] ) as OEComponentInspector;
				newComponent.transform.parent = componentContainer;
				newComponent.transform.localPosition = Vector3.zero;
				newComponent.transform.localScale = Vector3.one;

				newComponent.Init ( selection[0] );
			}	
		}
	}

	public function Update () {
		if ( selection.Length == 1 ) {
			selection[0].gameObject.name = objectName.text;
		}
	}

	public function Refresh ( list : List.< OFSerializedObject > ) {
		Clear ();

		selection = list.ToArray ();

		if ( selection.Length == 1 ) {
			objectName.gameObject.SetActive ( true );
			transformInspector.gameObject.SetActive ( true );
			componentContainer.gameObject.SetActive ( true );
			componentSwitch.gameObject.SetActive ( true );

			transformInspector.Init ( selection[0] );
			objectName.text = selection[0].gameObject.name;

			var tmpStrings : List.< String > = new List.< String > ();

			for ( var i : int = 0; i < selection.Length; i++ ) {
				var obj : OFSerializedObject = selection[i];
				
				for ( var f : int = 0; f < obj.fields.Length; f++ ) {
					if ( obj.fields[f].component && obj.fields[f].name != "Transform" && IsComponentSupported ( obj.fields[f].name ) ) {
						tmpStrings.Add ( obj.fields[f].name );
					}
				}
			}

			componentSwitch.options = tmpStrings.ToArray ();

			if ( componentSwitch.options.Length > 0 ) {
				componentSwitch.selectedOption = componentSwitch.options[0];
				SelectComponent ( componentSwitch.selectedOption );
			}
		
		} else {
			objectName.gameObject.SetActive ( false );
			transformInspector.gameObject.SetActive ( false );
			componentContainer.gameObject.SetActive ( false );
			componentSwitch.gameObject.SetActive ( false );
			componentSwitch.selectedOption = "";

		}
	}
}