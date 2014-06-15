#pragma strict

import System.Text;
import System.IO;

public class OFBundleManager extends MonoBehaviour {
	public var bundleFolder : String = "Libraries";
	public var loadOnAwake : boolean = true;
	public var loadedBundles : List.< OFBundle > = new List.< OFBundle > ();

	public static var instance : OFBundleManager;

	public function Awake () {
		if ( instance != this ) {
			instance = this;
			
			if ( loadOnAwake ) {
				LoadAllBundles ();
			}
		}
	}

	public static function GetName ( path : String ) : String {
		var strings : String [] = path.Replace ( "\\", "/" ).Split ( "/"[0] );

		return strings [ strings.length - 1 ];
	}

	private function PopulateFolder ( folder : OFBundle.Folder ) : void {
		for ( var texPath : String in Directory.GetFiles ( folder.path, "*.png" ) ) {
			texPath = texPath.Replace ( "\\", "/" );

			StartCoroutine ( function () : IEnumerator {
				var www : WWW = new WWW ( "file:///" + texPath );
				yield www;

				var newTex : Texture2D = www.texture;
				newTex.name = GetName ( texPath );

				folder.AddTexture ( newTex );
			} () );
		}

		for ( var audioPath : String in Directory.GetFiles ( folder.path, "*.ogg" ) ) {
			audioPath = audioPath.Replace ( "\\", "/" );
			
			StartCoroutine ( function () : IEnumerator {
				var www : WWW = new WWW ( "file:///" + audioPath );
				yield www;

				var newAudio : AudioClip = www.audioClip;
				newAudio.name = GetName ( audioPath );

				folder.AddAudio ( newAudio );
			} () );
		}
		
		var directories : String [] = Directory.GetDirectories ( folder.path );

		folder.subfolders = new OFBundle.Folder [ directories.Length ];

		for ( var i : int = 0; i < directories.Length; i++ ) {
			var newFolder : OFBundle.Folder = new OFBundle.Folder ();
			newFolder.name = GetName ( directories[i] );
			newFolder.path = folder.path + "/" + newFolder.name;
			
			PopulateFolder ( newFolder );

			folder.subfolders[i] = newFolder;
		}
	}

	public function GetBundle ( name : String ) {
		for ( var i : int = 0; i < loadedBundles.Count; i++ ) {
			if ( loadedBundles[i].name == name ) {
				return loadedBundles[i];
			}
		}

		return null;
	}

	public function GetBundleStrings () : String [] { 
		var strings : String[] = new String [ loadedBundles.Count ];

		for ( var i : int = 0; i < loadedBundles.Count; i++ ) {
			strings[i] = loadedBundles[i].name;
		}

		return strings;
	}

	public function LoadAllBundles () {
		for ( var bundlePath : String in System.IO.Directory.GetDirectories ( Application.dataPath + "/Libraries" ) ) {
			LoadBundle ( GetName ( bundlePath ) );
		}
	}

	public function LoadBundle ( name : String ) {
		var path : String = Application.dataPath + "/Libraries/" + name;
		var newBundle : OFBundle = new OFBundle ();

		newBundle.name = name;
		newBundle.root = new OFBundle.Folder ();
		newBundle.root.path = path;

		PopulateFolder ( newBundle.root );

		loadedBundles.Add ( newBundle );
	}

	public function UnloadBundle ( name : String ) {
		for ( var i : int = loadedBundles.Count - 1; i >= 0; i-- ) {
			if ( loadedBundles[i].name == name ) {
				loadedBundles.RemoveAt ( i );
			}
		}
	}

	public function UnloadAll () {
		loadedBundles.Clear ();
	}
}
