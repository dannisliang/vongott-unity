#pragma strict

public class OEToolbar extends MonoBehaviour {
	public var collapsed : boolean = true;
	public var stretched : boolean = true;
	public var background : Transform;
	public var drawerContainer : Transform;

	private var currentDrawer : String;

	public function Clear () {
		currentDrawer = "";

		collapsed = true;
		stretched = false;
	}

	public function GetDrawer ( name : String ) : OEDrawer {
		var result : OEDrawer;
		
		for ( var drawer : OEDrawer in drawerContainer.GetComponentsInChildren.< OEDrawer > ( true ) ) {
			if ( drawer.id == name ) {
				result = drawer;
				drawer.gameObject.SetActive ( true );
			
			} else {
				drawer.gameObject.SetActive ( false );

			}
		}

		return result;
	}

	public function OpenDrawer ( name : String ) : OEDrawer {
		if ( currentDrawer != name ) {
			Clear ();
			
			collapsed = false;

			var drawer : OEDrawer = GetDrawer ( name );

			if ( drawer ) {
				stretched = drawer.stretch;
			}

			currentDrawer = name;

			drawer.Refresh ();

			return drawer;
		
		} else {
			Clear ();
			return null;

		}
	}	

	public function Refresh () {
		if ( !String.IsNullOrEmpty ( currentDrawer ) ) {
			var n : String = currentDrawer;

			currentDrawer = "";

			OpenDrawer ( n );
		}
	}

	public function Update () {
		if ( collapsed ) {
			background.GetComponent.< OGSlicedSprite > ().stretch.width = ScreenSize.None;
			background.localScale = new Vector3 ( 52, background.transform.localScale.y, 1 );
			drawerContainer.gameObject.SetActive ( false );

		} else {
			if ( stretched ) {
				background.GetComponent.< OGSlicedSprite > ().stretch.width = ScreenSize.ScreenWidth;
				background.GetComponent.< OGSlicedSprite > ().stretch.widthOffset = -10;
			
			} else {
				background.GetComponent.< OGSlicedSprite > ().stretch.width = ScreenSize.None;

			}
			
			background.localScale = new Vector3 ( 300, background.transform.localScale.y, 1 );
			drawerContainer.gameObject.SetActive ( true );
		
		}
	}
}
