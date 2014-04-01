#pragma strict

@script ExecuteInEditMode()

public class AutoNameWidgets extends MonoBehaviour {
	public var renameNow : boolean = false;
	public var testRun : boolean = true;
	
	function Start () {

	}

	function Update () {
		if ( renameNow ) {
			var widgets : Object[] = Resources.FindObjectsOfTypeAll(OGWidget);
			
			for ( var i : int = 0; i < widgets.Length; i++ ) {
				var prefix = "";
				var widget : OGWidget = widgets[i] as OGWidget;

				if ( widget.GetType() == OGButton ) {
					prefix = "btn";
				} else if ( widget.GetType() == OGLabel ) {
					prefix = "lbl";
				} else if ( widget.GetType() == OGPopUp ) {
					prefix = "pop";
				} else if ( widget.GetType() == OGListItem ) {
					prefix = "ltm";
				} else if ( widget.GetType() == OGTickBox ) {
					prefix = "tbx";
				} else if ( widget.GetType() == OGDropDown ) {
					prefix = "ddn";
				} else if ( widget.GetType() == OGProgressBar ) {
					prefix = "bar";
				} else if ( widget.GetType() == OGTextField ) {
					prefix = "fld";
				} else if ( widget.GetType() == OGTabs ) {
					prefix = "tab";
				} else if ( widget.GetType() == OGSlider ) {
					prefix = "sld";
				} else if ( widget.GetType() == OGSprite || widget.GetType() == OGTexture || widget.GetType() == OGSlicedSprite ) {
					prefix = "img";
				}

				var oldName : String = widget.gameObject.name;
				var newName : String = "";

				if ( prefix != "" ) { 
					if ( !oldName.Contains ( prefix + "_" ) ) {
						if ( oldName.Length > 3 && oldName.Contains ( prefix ) ) {
							oldName = oldName.Remove ( 0, 3 );
						}

						newName = prefix + "_" + oldName;
						
						if ( testRun ) {
							Debug.Log ( oldName + " >>> " + newName, widget.gameObject );
						} else {
							widget.gameObject.name = newName;
						}
					}
				}	
			}

			renameNow = false;
		}
	}
}
