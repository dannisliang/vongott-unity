#pragma strict

public class OEPrefabsDrawer extends OEDrawer {
	public class Folder {
		public var name : String;
		public var subfolders : Folder[];

		public function GetSubfolder ( name : String ) : Folder {
			for ( var i : int = 0; i < subfolders.Length; i++ ) {
				if ( name == subfolders[i].name ) {
					return subfolders[i];
				}
			}

			return null;
		}

		public function GetSubfolderNames () : String [] {
			var tmp : List.< String > = new List.< String > ();

			for ( var i : int = 0; i < subfolders.Length; i++ ) {
				tmp.Add ( subfolders[i].name );
			}

			return tmp.ToArray ();
		}

		public function HasChild ( folder : Folder ) : boolean {
			for ( var i : int = 0; i < subfolders.Length; i++ ) {
				if ( folder == subfolders[i] ) {
					return true;
				}
			}

			return false;
		}
	}
	
	public var rootFolder : Folder;
	
	public var subdirSwitch : OGPopUp;
	public var scrollview : Transform;
	public var foldername : OGLabel;
	public var placeButton : OGButton;
	public var parentButton : OGButton;
	public var objectName : OGLabel;

	private var currentFolder : Folder;
	private var currentParent : Folder;
	private var fullPath : String;
	private var selectedObject : String = "";
	private var typeFilter : System.Type;

	public function Clear () {
		for ( var i : int = 0; i < scrollview.childCount; i++ ) {
			Destroy ( scrollview.GetChild ( i ).gameObject );
		}

		selectedObject = "";
		objectName.text = selectedObject;
		placeButton.gameObject.SetActive ( false );
	}

	public function SelectObject ( n : String ) {
		selectedObject = n;
		objectName.text = selectedObject;
		placeButton.gameObject.SetActive ( true );
	}

	public function SetPicker ( callback : Function, type : System.Type ) {
		typeFilter = type;
		Populate ();

		placeButton.func = function () {
			callback ( Resources.Load ( fullPath + "/" + selectedObject ) );	
		};
	}

	public function Populate () {
		Clear ();

		foldername.text = fullPath;

		var offset : Vector2;
		var width : float = Screen.width - 12;
		var size : float = 100;
		var spacing : float = 10;
		
		LookForParent ( rootFolder );
		
		subdirSwitch.selectedOption = currentFolder.name;
		subdirSwitch.options = currentFolder.GetSubfolderNames ();
		subdirSwitch.gameObject.SetActive ( subdirSwitch.options.Length > 0 );

		if ( subdirSwitch.options.Length == 0 ) {
			var objects : Object [] = OEFileSystem.GetResources ( fullPath, typeof ( OFSerializedObject ) ); 

			for ( var i : int = 0; i < objects.Length; i++ ) {
				var obj : OFSerializedObject = objects[i] as OFSerializedObject;

				if ( obj ) {
					var b : OGButton = new GameObject ( obj.gameObject.name ).AddComponent.< OGButton >();
					var t : OGTexture = new GameObject ( obj.gameObject.name + "_tex" ).AddComponent.< OGTexture >();

					b.transform.parent = scrollview;
					b.transform.localScale = new Vector3 ( size, size, 1 );
					b.transform.localPosition = new Vector3 ( offset.x, offset.y, 1 );

					b.target = this.gameObject;
					b.message = "SelectObject";
					b.argument = obj.gameObject.name;

					t.transform.parent = scrollview;
					t.transform.localScale = new Vector3 ( size, size, 1 );
					t.transform.localPosition = new Vector3 ( offset.x, offset.y, 0 );

					offset.x += size + spacing;

					if ( offset.x >= width - size + spacing ) {
						offset.x = 0;
						offset.y += size + spacing;
					}

					OEWorkspace.GetInstance().previewCamera.CreatePreview ( obj.gameObject, t );

					b.ApplyDefaultStyles ();
				}
			}
		
		} else {
			subdirSwitch.selectedOption = "";

		}
	}

	public function LookForParent ( folder : Folder ) {
		for ( var i : int = 0; i < folder.subfolders.Length; i++ ) {
			if ( folder.subfolders[i] == currentFolder ) {
				currentParent = folder;
				return;

			} else {
				LookForParent ( folder.subfolders[i] );
			
			}
		}

		currentParent = null;
	}

	public function ReplacePathFolder ( n : String ) {
		var strings : String [] = fullPath.Split ( "/"[0] );
		fullPath = "";

		for ( var i : int = 0; i < strings.Length - 1; i++ ) {
			if ( i > 1 ) {
				fullPath += "/";
			}
			
			fullPath += strings[i];
		}
	
		if ( !String.IsNullOrEmpty ( n ) ) {
			fullPath += "/" + n;
		}
	}

	public function GoToParentFolder () {
		if ( currentParent == null || currentFolder == rootFolder ) { return; }
		
		ReplacePathFolder ( "" );

		currentFolder = currentParent;

		Populate ();
	}

	public function ChangeFolder ( folder : String ) {
		fullPath += "/" + folder;
		currentFolder = currentFolder.GetSubfolder ( folder );
		Populate ();
	}

	public function Add () {
		if ( !String.IsNullOrEmpty ( selectedObject ) ) {
			OEWorkspace.GetInstance().AddPrefab ( fullPath + "/" + selectedObject );
	
			OEWorkspace.GetInstance().toolbar.Clear ();
		}
	}

	public function Start () {
		if ( rootFolder.subfolders.Length > 0 ) {
			currentFolder = rootFolder;
			fullPath = currentFolder.name;
			Populate ();
			placeButton.func = null;
		
		} else {
			Debug.LogError ( "OEPrefabsDrawer | Root folder has no children" );
		
		}
	}
}
