/*import System;

class OGAtlasEditor extends EditorWindow {
	var size = "1024";
	var padding = "2";
	var textures = new Texture2D[0];
	var current : OGAtlas;
	var new_atlas = "";
	var new_texture : Texture2D;
	var scroll_position : Vector2;
	var preview : Texture2D;
	
	// Add Atlas Editor to menu 												
	@MenuItem("OpenGUI/Atlas Editor")
	static function Init () {
		var window = GetWindow(OGAtlasEditor);
		window.position = Rect(20, 40, 600, 600);
        window.Show();
	}
	
	// Make textures readable
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
	function SaveAtlas () {		
		for ( var t in textures ) {
			MakeTextureReadable ( t, true );
		}
		
		var texture = new Texture2D ( int.Parse(size), int.Parse(size), TextureFormat.RGB24, false );
		var rects = texture.PackTextures(textures, int.Parse(padding), int.Parse(size));

		current.Save( texture, rects, textures );
	
		for ( var t in textures ) {
			MakeTextureReadable ( t, false );
		}
	}
	
	// Create new atlas object
	function CreateAtlas (name:String) {
		var obj : GameObject = new GameObject ( name );
		obj.AddComponent(OGAtlas);	
		current = obj.GetComponent(OGAtlas);
		
		GUIUtility.keyboardControl = 0;
		
		Repaint();
	}
	
	// Check texture array for duplicates
	function RemoveDuplicates ( tex : Texture2D[] ) {		
		var temp = new Array();
		var result : Texture2D[];
		
		for ( t in tex ) {
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
	
	// Update the list
	function UpdateList () {
		textures = RemoveDuplicates( textures );
	}
	
	// Add new texture
	function NewTexture	() {
		var new_array = new Texture2D[textures.Length+1];
	
		for ( var i = 0; i < textures.Length; i++ ) {
			new_array[i] = textures[i];
		}
		
		new_array[new_array.Length-1] = new_texture;
		
		textures = new_array;
		new_texture = null;
	
		UpdateList();
	}
	
	// Draw loop
	function OnGUI () {
		EditorGUILayout.BeginHorizontal();
		EditorGUILayout.BeginVertical();
		
		// Title
		GUILayout.Label ("Current atlas", EditorStyles.boldLabel);
		current = EditorGUILayout.ObjectField(current, OGAtlas);
		
		// Check for new texture
		if ( new_texture ) {
			NewTexture();
		}
		
		if ( current ) {			
			// Check for textures in atlas
			if ( textures.Length <= 0 ) {
				textures = current.GetTextures();
			}
			
			// Properties
			EditorGUILayout.TextField ("Max size", size);
			EditorGUILayout.TextField ("Padding", padding);
		
			if(GUI.Button(Rect(10,100, 100, 20),"Save")) {
	        	SaveAtlas();
	        }
	        
	        // Atlas preview
			if ( !preview && current.GetPreview() ) {
				preview = current.GetPreview();
			} else {
				GUILayout.Label ("Preview", EditorStyles.boldLabel);
				GUI.DrawTexture(Rect(10, 100, 400, 400), preview);
				
			}
	        
	        // New column
	        EditorGUILayout.EndVertical();
	       	EditorGUILayout.BeginVertical();
        	
        	GUILayout.Label ("Textures", EditorStyles.boldLabel);
			
			// Scroll view
			scroll_position = EditorGUILayout.BeginScrollView( scroll_position, GUILayout.Width(240), GUILayout.Height(380) );

			new_texture = EditorGUILayout.ObjectField("(Add new texture)",new_texture, Texture2D, GUILayout.Width(64), GUILayout.Height(64));
			for ( var t in textures ) {
				t = EditorGUILayout.ObjectField(t.name, t, Texture2D, GUILayout.Width(64), GUILayout.Height(64));   
			}   
		
			EditorGUILayout.EndScrollView();
		} else {
			// New atlas
			new_atlas = EditorGUILayout.TextField ("..or create new", new_atlas);
			
	    	if(GUI.Button(Rect(10,70, 100, 20),"Create")) {
	        	CreateAtlas(new_atlas);
	        	new_atlas = null;
	        }
		}  
		
		EditorGUILayout.EndVertical();
	        
        EditorGUILayout.EndHorizontal();
		            
	}

	// Repaint on update
	function OnInspectorUpdate () {
		Repaint();
	}
}*/