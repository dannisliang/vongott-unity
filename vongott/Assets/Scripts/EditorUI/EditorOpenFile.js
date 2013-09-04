#pragma strict

import System.IO;

class EditorOpenFile extends OGPage {	
	////////////////////
	// Prerequisites
	////////////////////
	// Public vars
	var container : GameObject;	
	var mapList : OGScrollView;
	var title : OGLabel;
	var selectedFile : String = "";
	var previewPane : OGImage;
	var fileInfo : OGLabel;
	var previewLoading : GameObject;
	var fileLoading : OGLabel;
									
					
	////////////////////
	// Navigation
	////////////////////
	// List files
	function ListFiles () : String[] {		
		var files : String[] = Directory.GetFiles ( Application.dataPath + "/Maps", "*.vgmap" );
		
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
		
		var dataPath : String = Application.dataPath + "/Maps/" + name + ".vgmap";
		var tempImage : Texture2D = new Texture2D ( 0, 0 );
		
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
	
	// Open
	function LoadSelectedFile () : IEnumerator {
		fileLoading.text = "Loading " + selectedFile + "...";
		container.SetActive ( false );
		
		yield new WaitForSeconds ( 0.5 );
	
		EditorCore.LoadFile ( selectedFile );
		OGRoot.GoToPage ( "MenuBase" );
	}
	
	function OpenFile () {
		StartCoroutine ( LoadSelectedFile () );
	}
	
	// Cancel
	function Cancel () {
		OGRoot.GoToPage ( "MenuBase" );
	}
	
	// Trim filename
	function TrimFileName ( p : String ) : String {
		var path = p.Split("\\"[0]);
		var fileName = path[path.Length-1];
		var extention = fileName.Split("."[0]);
		var name = extention[0];
		
		return name;
	}
	
	// Clear list
	function ClearList () {
		for ( var i = 0; i < mapList.transform.childCount; i++ ) {
			DestroyImmediate ( mapList.transform.GetChild ( i ).gameObject );
		}
	}
	
	// Populate list
	function PopulateList () {
		ClearList ();
		
		previewLoading.SetActive ( false );
		
		var paths : String[] = ListFiles();
	
		for ( var i = 0; i < paths.Length; i++ ) {
			var name = TrimFileName ( paths[i] );
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
		container.SetActive ( true );
		
		PopulateList();
		title.text = "Open a map file";
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