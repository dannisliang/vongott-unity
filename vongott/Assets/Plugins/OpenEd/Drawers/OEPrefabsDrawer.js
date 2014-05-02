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

	private var currentFolder : Folder;
	private var fullPath : String;

	public function Clear () {
		for ( var i : int = 0; i < scrollview.childCount; i++ ) {
			Destroy ( scrollview.GetChild ( i ).gameObject );
		}
	}

	public function Populate () {
		Clear ();
	
		subdirSwitch.selectedOption = "";
		subdirSwitch.options = currentFolder.GetSubfolderNames();
		subdirSwitch.gameObject.SetActive ( subdirSwitch.options.Length > 0 );
		foldername.text = fullPath;

		var objects : Object [] = OEFileSystem.GetResources ( fullPath, typeof ( OFSerializedObject ) ); 

		var offset : Vector2;
		var width : float = Screen.width - 12;
		var size : float = 100;
		var spacing : float = 10;

		for ( var i : int = 0; i < objects.Length; i++ ) {
			var obj : OFSerializedObject = objects[i] as OFSerializedObject;

			if ( obj ) {
				var b : OGButton = new GameObject ( obj.gameObject.name ).AddComponent.< OGButton >();

				b.transform.parent = scrollview;
				b.transform.localScale = new Vector3 ( size, size, 1 );
				b.transform.localPosition = new Vector3 ( offset.x, offset.y, 0 );

				offset.x += size + spacing;

				if ( offset.x >= width - size + spacing ) {
					offset.x = 0;
					offset.y += size + spacing;
				}

				b.text = obj.gameObject.name;
				b.ApplyDefaultStyles ();
			}
		}
	}

	public function LookForParent ( folder : Folder ) {
		for ( var i : int = 0; i < folder.subfolders.Length; i++ ) {
			if ( folder.subfolders[i] == currentFolder ) {
				currentFolder = folder;
				Populate ();
				return;

			} else {
				LookForParent ( folder.subfolders[i] );
			
			}
		}
	}

	public function GoToParentFolder () {
		var strings : String [] = fullPath.Split ( "/"[0] );
		
		fullPath = "";

		for ( var i : int = 0; i < strings.Length - 1; i++ ) {
			if ( i > 1 ) {
				fullPath += "/";
			}
			
			fullPath += strings[i];
		}
		
		
		LookForParent ( rootFolder );
	}

	public function GoToSubfolder ( folder : String ) {
		fullPath += "/" + folder;
		currentFolder = currentFolder.GetSubfolder ( folder );
		Populate ();
	}

	public function Start () {
		fullPath = rootFolder.name;
		currentFolder = rootFolder;
		Populate ();
	}
}
