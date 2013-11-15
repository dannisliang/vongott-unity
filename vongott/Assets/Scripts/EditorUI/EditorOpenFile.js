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
	public var container : GameObject;	
	public var mapList : OGScrollView;
	public var title : OGLabel;
	public var selectedFile : String = "";
	public var previewPane : OGImage;
	public var fileInfo : OGLabel;
	public var previewLoading : GameObject;
	public var fileLoading : GameObject;
	public var fileLoadingLabel : OGLabel;
									
					
	////////////////////
	// Navigation
	////////////////////
	// List files
	function ListFiles () : String[] {	
		var files : String[] = Directory.GetFiles ( Application.dataPath + "/" + baseDir, "*." + fileType );

		return files;
	}
	
	// Deselect all
	function DeselectAll () {
		for ( var i = 0; i < mapList.transform.childCount; i++ ) {
			var btn : OGButton = mapList.transform.GetChild ( i ).gameObject.GetComponent ( OGButton );
			btn.style = "listitem";		
		}
	}
	
	// Select map
	function SelectFile ( btn : OGButton ) {
		DeselectAll ();
		
		var name : String = btn.text;
		selectedFile = name;
		btn.style = "listitemselected";
		
		var dataPath : String = Application.dataPath + "/" + baseDir + "/" + name + "." + fileType;
		var tempImage : Texture2D = new Texture2D ( 0, 0 );
		
		if ( fileType == "vgmap" ) {
			previewLoading.SetActive ( true );
			
			Loom.RunAsync ( function () {
				var bytes : byte[] = Loader.LoadScreenshot ( dataPath );			
				
				Loom.QueueOnMainThread ( function () {
					tempImage.LoadImage ( bytes );
					previewPane.image = tempImage;
					
					previewLoading.SetActive ( false );
				} );
			} );
			
			fileInfo.text = "<map name>\n<actor count>\n<item count>\n<trigger count>\n<filesize>";
		}
	}
	
	// Open
	function LoadSelectedFile () : IEnumerator {
		fileLoading.SetActive ( true );
		
		if ( fileType == "vgmap" ) {
			fileLoadingLabel.text = "Loading " + selectedFile + "...";
		} else if ( fileType == "obj" ) {
			fileLoadingLabel.text = "Importing " + selectedFile + "...";
		}
		
		container.SetActive ( false );
		
		yield new WaitForSeconds ( 0.5 );
	
		if ( fileType == "vgmap" ) {
			EditorCore.LoadFile ( selectedFile );
		} else if ( fileType == "obj" ) {
			EditorCore.LoadOBJ ( selectedFile, asNavMesh );
		}
		
		OGRoot.GoToPage ( "MenuBase" );
	}
	
	function OpenFile () {
		StartCoroutine ( LoadSelectedFile () );
	}
	
	// Cancel
	function Cancel () {
		OGRoot.GoToPage ( "MenuBase" );
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
			var btn = obj.AddComponent ( OGButton );
		
			btn.text = name;
			btn.target = this.gameObject;
			btn.message = "SelectFile";
			btn.style = "listitem";
			
			obj.transform.parent = mapList.transform;
			obj.transform.localScale = new Vector3 ( 456, 30, 1 );
			obj.transform.localPosition = new Vector3 ( 0, i * 32, -2 );
		}
	}
	
	
	////////////////////
	// Init
	////////////////////
	override function StartPage () {
		fileLoading.SetActive ( false );
		container.SetActive ( true );
		
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
			OGRoot.GoToPage ( "MenuBase" );
		}
	}
}