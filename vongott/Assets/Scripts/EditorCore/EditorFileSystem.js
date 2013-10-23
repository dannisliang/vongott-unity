#pragma strict

class EditorFileSystem extends MonoBehaviour {
	////////////////////
	// Prerequisites
	////////////////////
	// Classes
	public class Folder {
		var name : String;
		var subFolders : List.< Folder > = new List.< Folder >();
		var files : Object[];
		var path : String;
		var thumb : Texture2D;
	
		function Folder ( n : String ) {
			name = n;
			path = name;
		} 
	
		function AddFolder ( f : Folder, scan : boolean ) {
			if ( name != "Resources" ) {
				f.path = path + "/" + f.name;
			}
			
			if ( scan ) {
				f.files = Resources.LoadAll ( f.path );
			}
								
			subFolders.Add ( f );
		}
	
		function GetFileNames () : String[] {
			var tempList : List.<String> = new List.<String>();
			var returnArray : String[];
			
			for ( var o : Object in files ) {
				var thisName : String;
				
				if ( o.GetType() == GameObject ) {
					thisName = ( o as GameObject ).name;
				} else if ( o.GetType() == Material ) {
					thisName = ( o as Material ).name;
				}
				
				tempList.Add ( thisName );
			}
			
			returnArray = new String[tempList.Count];
			
			for ( var i = 0; i < tempList.Count; i++ ) {
				returnArray[i] = tempList[i];
			}
			
			return returnArray;
		}
	
		function GetFolderNames () : String[] {
			var returnArray : String[] = new String[subFolders.Count];
			
			for ( var i = 0; i < returnArray.Length; i++ ) {
				returnArray[i] = subFolders[i].name;
			}
			
			return returnArray;
		}
	
		function FindFolder ( n : String ) : Folder {
			for ( var f : Folder in subFolders ) {
				if ( n == f.name ) {
					return f;
				}
			}
			
			return null;
		}
		
		function FindFile ( n : String ) : Object {
			for ( var f : Object in files ) {
				if ( ( f.GetType() == GameObject && (f as GameObject).name == n ) || f.GetType() == Material && (f as Material).name == n ) {
					return f;	
				}
			}
			
			return null;
		}
	}
	
	
	// Static vars
	public static var resourcesFolder : Folder = new Folder( "Resources" );
	public static var instance : EditorFileSystem;
	
	
	////////////////////
	// Init
	////////////////////
	// Start
	function Start () {
		instance = this;
		InitResources ();
	}
	
	// Resources
	public function InitResources () {				
		// Actors
		var actorsFolder : Folder = new Folder ( "Actors" );
		resourcesFolder.AddFolder ( actorsFolder, false );
		
		actorsFolder.AddFolder ( new Folder ( "Animal" ), true );
		actorsFolder.AddFolder ( new Folder ( "NPC" ), true );
	
		// Items
		var itemsFolder : Folder = new Folder ( "Items" );
		resourcesFolder.AddFolder ( itemsFolder, false );
		
		itemsFolder.AddFolder ( new Folder ( "Consumables" ), true );
		itemsFolder.AddFolder ( new Folder ( "Equipment" ), true );
		itemsFolder.AddFolder ( new Folder ( "Upgrades" ), true );
		itemsFolder.AddFolder ( new Folder ( "Misc" ), true );
		
		// Materials
		var materialsFolder : Folder = new Folder ( "Materials" );
		resourcesFolder.AddFolder ( materialsFolder, false );
		
		materialsFolder.AddFolder ( new Folder ("Brick"), true );
		materialsFolder.AddFolder ( new Folder ("Concrete"), true );
		materialsFolder.AddFolder ( new Folder ("Foliage"), true );
		materialsFolder.AddFolder ( new Folder ("Glass"), true );
		materialsFolder.AddFolder ( new Folder ("Tiles"), true );
		materialsFolder.AddFolder ( new Folder ("Wood"), true );
		
		// Foliage
		resourcesFolder.AddFolder ( new Folder ( "Foliage" ), true );
		
		// Prefabs
		var prefabsFolder : Folder = new Folder ( "Prefabs" );
		resourcesFolder.AddFolder ( prefabsFolder, false );
		
		prefabsFolder.AddFolder ( new Folder ( "Airducts" ), true );
		prefabsFolder.AddFolder ( new Folder ( "Buildings" ), true );
		prefabsFolder.AddFolder ( new Folder ( "Decor" ), true );
		prefabsFolder.AddFolder ( new Folder ( "Doors" ), true );
		prefabsFolder.AddFolder ( new Folder ( "Fences" ), true );
		prefabsFolder.AddFolder ( new Folder ( "Furniture" ), true );
		prefabsFolder.AddFolder ( new Folder ( "Interfaces" ), true );
		prefabsFolder.AddFolder ( new Folder ( "Roofs" ), true );
		prefabsFolder.AddFolder ( new Folder ( "Stairs" ), true );
		prefabsFolder.AddFolder ( new Folder ( "Skyboxes" ), true );
		prefabsFolder.AddFolder ( new Folder ( "Vehicles" ), true );
		prefabsFolder.AddFolder ( new Folder ( "Walls" ), true );
		prefabsFolder.AddFolder ( new Folder ( "Windows" ), true );		
	}
	
	////////////////////
	// Return
	////////////////////
	// Instance
	public static function GetInstance () {
		return instance;
	}
	
	// Resources
	public static function GetResources () : Folder {
		return resourcesFolder;
	}
}