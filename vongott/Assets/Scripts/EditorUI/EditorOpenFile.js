#pragma strict

import System.IO;

class EditorOpenFile extends OGPage {	
	////////////////////
	// Prerequisites
	////////////////////
	// Static vars
	public static var baseDir : String = "Maps";
	public static var fileType : String = "vgmap";
	public static var asNavMesh : boolean;
		
	// Public vars
	public var mapList : OGScrollView;
	public var title : OGLabel;
	public var selectedFile : String = "";
	public var previewPane : OGTexture;
	public var fileInfo : OGLabel;
	public var previewLoading : GameObject;
									
					
	////////////////////
	// Navigation
	////////////////////
	// List files
	function ListFiles () : String[] {	
		var files : String[] = Directory.GetFiles ( Application.dataPath + "/" + baseDir, "*." + fileType );

		return files;
	}
	
	// Select map
	function SelectFile ( btn : OGListItem ) {
		selectedFile = btn.text;
		
		var dataPath : String = Application.dataPath + "/" + baseDir + "/" + btn.text + "." + fileType;
		var tempImage : Texture2D = new Texture2D ( 0, 0 );
		
		if ( fileType == "vgmap" ) {
			previewLoading.SetActive ( true );
			
			Loom.RunAsync ( function () {
				var bytes : byte[] = Loader.LoadScreenshot ( dataPath );			
				
				Loom.QueueOnMainThread ( function () {
					tempImage.LoadImage ( bytes );
					previewPane.mainTexture = tempImage;
					
					previewLoading.SetActive ( false );
				} );
			} );
			
			fileInfo.text = btn.text;
		}
		
		for ( var i : int = 0; i < mapList.transform.childCount; i++ ) {
			var b : OGListItem = mapList.transform.GetChild(i).GetComponent(OGListItem);
			if ( b ) {
				b.isTicked = b == btn;
			}
		}
	}
	
	// Open
	function LoadSelectedFile () : IEnumerator {
		var loadingText : String = "";

		if ( fileType == "vgmap" ) {
			loadingText = "Loading " + selectedFile + "...";
		} else if ( fileType == "obj" ) {
			loadingText = "Importing " + selectedFile + "...";
		}
		
		EditorLoading.message = loadingText;
		OGRoot.GetInstance().GoToPage ( "Loading" );
	
		yield WaitForEndOfFrame();
		yield WaitForSeconds ( 0.5 );

		if ( fileType == "vgmap" ) {
			EditorCore.LoadFile ( selectedFile );
		} else if ( fileType == "obj" ) {
			EditorCore.LoadOBJ ( selectedFile, asNavMesh );
		}
		
		yield WaitForEndOfFrame();
		
		OGRoot.GetInstance().GoToPage ( "MenuBase" );
	}
	
	function OpenFile () {
		EditorCore.GetInstance().StartCoroutine ( LoadSelectedFile () );
	}
	
	// Cancel
	function Cancel () {
		OGRoot.GetInstance().GoToPage ( "MenuBase" );
	}
	
	// Clear list
	function ClearList () {
		for ( var i = 0; i < mapList.transform.childCount; i++ ) {
			Destroy ( mapList.transform.GetChild ( i ).gameObject );
		}
	}
	
	// Populate list
	function PopulateList () : IEnumerator {
		ClearList ();
		
		yield WaitForEndOfFrame ();
		
		previewLoading.SetActive ( false );
		
		var paths : String[] = ListFiles();
	
		for ( var i = 0; i < paths.Length; i++ ) {
			var name = EditorCore.TrimFileName ( paths[i] );
			var obj : GameObject = new GameObject ( name );
			var btn = obj.AddComponent ( OGListItem );
		
			btn.text = name;
			btn.target = this.gameObject;
			btn.message = "SelectFile";

			obj.transform.parent = mapList.transform;
			obj.transform.localScale = new Vector3 ( 480, 30, 1 );
			obj.transform.localPosition = new Vector3 ( 0, i * 32, 0 );
	
			btn.GetDefaultStyles ();	
			
		}
	}
	
	
	////////////////////
	// Init
	////////////////////
	override function StartPage () {
		StartCoroutine ( PopulateList() );
		title.text = "Open a map file";
	}
	
	override function ExitPage () {
		ClearList ();
	}
	
	
	////////////////////
	// Update
	////////////////////
	override function UpdatePage () {
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			OGRoot.GetInstance().GoToPage ( "MenuBase" );
		}
	}
}
