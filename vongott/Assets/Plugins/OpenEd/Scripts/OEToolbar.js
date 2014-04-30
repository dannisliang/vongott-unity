#pragma strict

public class OEToolbar extends MonoBehaviour {
	public var collapsed : boolean = true;
	public var background : Transform;
	public var drawerTypes : OEDrawer[];
	public var drawerContainer : Transform;

	private var currentDrawer : String;

	public function Clear () {
		for ( var i : int = 0; i < drawerContainer.childCount; i++ ) {
			Destroy ( drawerContainer.GetChild ( i ).gameObject );
		}
		
		collapsed = true;
	}

	public function GetDrawer ( name : String ) : OEDrawer {
		for ( var i : int = 0; i < drawerTypes.Length; i++ ) {
			if ( drawerTypes[i].id == name ) {
				return drawerTypes[i];
			}
		}

		return null;
	}

	public function OpenDrawer ( name : String ) {
		Clear ();
		
		if ( currentDrawer != name ) {
			collapsed = false;

			var drawer : OEDrawer = GetDrawer ( name );

			if ( drawer ) {
				drawer = Instantiate ( drawer ) as OEDrawer;

				drawer.transform.parent = drawerContainer;
				drawer.transform.localPosition = Vector3.zero;
				drawer.transform.localScale = Vector3.one;
				drawer.transform.localEulerAngles = Vector3.zero;
			}
		}
	}	

	public function Update () {
		if ( collapsed ) {
			background.transform.localScale = new Vector3 ( 60, background.transform.localScale.y, 1 );
			drawerContainer.gameObject.SetActive ( false );

		} else {
			background.transform.localScale = new Vector3 ( 300, background.transform.localScale.y, 1 );
			drawerContainer.gameObject.SetActive ( true );
		
		}
	}
}
