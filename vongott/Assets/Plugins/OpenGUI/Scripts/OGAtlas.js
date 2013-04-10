/*@script ExecuteInEditMode()

// Inspector menu
var size = 1024;
var padding = 1;
var textures : Texture2D[];
var updateAtlas = false;

// Private vars
private var main_texture : Texture2D;
private var rects : Rect[];
	
// Make texture readable
function MakeTextureReadable ( tex : Texture2D, state : boolean ) {
	var path = AssetDatabase.GetAssetPath( tex );
	var ti : TextureImporter = AssetImporter.GetAtPath(path);
	if (ti == null) { return false; }

	var settings : TextureImporterSettings = new TextureImporterSettings();
	ti.ReadTextureSettings(settings);

	settings.mipmapEnabled = false;
	settings.readable = state;
	settings.textureFormat = TextureImporterFormat.RGBA32;
	settings.filterMode = FilterMode.Point;
	settings.wrapMode = TextureWrapMode.Clamp;
	settings.npotScale = TextureImporterNPOTScale.None;
		
	ti.SetTextureSettings(settings);
	AssetDatabase.ImportAsset(path, ImportAssetOptions.ForceUpdate);
}

// Save atlas to object
function UpdateAtlasTexture () {		
	for ( var t in textures ) {
		MakeTextureReadable ( t, true );
	}
	
	main_texture = new Texture2D ( size, size, TextureFormat.RGB24, false );
	rects = main_texture.PackTextures(textures, padding, size);

	for ( var t in textures ) {
		MakeTextureReadable ( t, false );
	}
}

// Check texture array for duplicates
function RemoveDuplicates () {		
	var temp = new Array();
	var result : Texture2D[];
	
	for ( t in textures ) {
		temp.Push ( t );
	}
	
	for ( var i = 0; i < temp.length; i++) {
        for ( var j = i+1; j < temp.length; j++) {
            if ( String.Compare( temp[i].name, temp[j].name) > 0 ) {
	            temp.RemoveAt(i);
			}
    	}
    }
    
    result = new Texture2D[temp.length];
    
    for ( var x = 0; x < temp.length; x++ ) {
    	result[x] = temp[x];
    }
    
    return result;
}

// Get textures
function GetTextures () {
	return textures;
}

// Update
function Update () {
	if ( updateAtlas ) {
		RemoveDuplicates();
		UpdateAtlasTexture ();
	
		updateAtlas = false;
	}
}

// Start
function Start () {

}*/