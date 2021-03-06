#pragma strict

public class OFDeserializer {
	public static var planner : OFPlanner;
	
	private static var plugins : OFPlugin[];

	public static function GetNumber ( object : JSONObject, fieldName : String ) : float {
		if ( object && object.HasField ( fieldName ) ) {
			return object.GetField ( fieldName ).n;

		} else {
			return 0;

		}
	}
	
	public static function GetString ( object : JSONObject, fieldName : String ) : String {
		if ( object && object.HasField ( fieldName ) ) {
			return object.GetField ( fieldName ).str;

		} else {
			return "";

		}
	}
	
	public static function GetBool ( object : JSONObject, fieldName : String ) : boolean {
		if ( object && object.HasField ( fieldName ) ) {
			return object.GetField ( fieldName ).b;

		} else {
			return false;

		}
	}

	public static function ParseEnum ( e : System.Type, s : String ) : int {
		var strings : String[] = System.Enum.GetNames ( e );
		
		for ( var i : int = 0; i < strings.Length; i++ ) {
			if ( strings[i] == s ) {
				return i;
			}
		}

		return -1;
	}

	public static function CheckComponent ( obj : OFSerializedObject, type : System.Type ) : Component {
		return CheckComponent ( obj, type, false );
	}

	public static function CheckComponent ( obj : OFSerializedObject, type : System.Type, forceAdd : boolean ) : Component {
		var component = obj.gameObject.GetComponent ( type );
		
		if ( !component ) {
			component = obj.gameObject.AddComponent ( type );
			forceAdd = true;
		}

		if ( forceAdd ) {
			obj.SetField ( type.ToString().Replace ( "UnityEngine.", "" ), component );
		}

		return component;
	}
	
	public static function CheckComponent ( obj : OFSerializedObject, typeString : String ) : Component {
		var component = obj.gameObject.GetComponent ( typeString );
		var forceAdd : boolean = false;

		if ( !component ) {
			component = obj.gameObject.AddComponent ( typeString );
			forceAdd = true;
		}

		if ( forceAdd ) {
			obj.SetField ( typeString.Replace ( "UnityEngine.", "" ), component );
		}

		return component;
	}
	
	public static function DeserializeChildren ( input : JSONObject, parent : Transform ) {
		planner = new GameObject ( "OFPlanner" ).AddComponent.< OFPlanner > ();
		
		for ( var i : int = 0; i < input.list.Count; i++ ) {
			var p : JSONObject = input.list[i];
			if ( p.HasField ( "dontInstantiate" ) ) { continue; }
			
			var k : String = input.keys[i];
			var t : Transform;
		       	var go : GameObject = parent.gameObject.Find ( k );
		
			if ( go ) {
				t = go.transform;
			}

			if ( !t ) {
				t = new GameObject ( k ).transform;
				t.parent = parent;
				t.position = Vector3.zero;
			}
			
			for ( var json : JSONObject in p.list ) {
				var so : OFSerializedObject = Deserialize ( json );
				
				if ( so ) {
					so.transform.parent = t;
					planner.AddObject ( so );
				}
			}
			
		}

		planner.ConnectAll ();
	}
	
	// This creates a new GameObject
	public static function Deserialize ( input : JSONObject ) : OFSerializedObject {
		var so : OFSerializedObject;
		
		return Deserialize ( input, so );
	}	
	
	// This applies the deserialized values to an existing GameObject
	public static function Deserialize ( input : JSONObject, output : OFSerializedObject ) : OFSerializedObject {
		if ( !input.HasField ( "name" ) || !input.HasField ( "id" ) ) { return null; }
		
		if ( !output ) {
			if ( input.HasField ( "prefabPath" ) && !String.IsNullOrEmpty ( input.GetField ( "prefabPath" ).str ) ) {	
				var obj : UnityEngine.Object = Resources.Load ( input.GetField ( "prefabPath" ).str );
				
				if ( !obj ) {
					Debug.LogError ( "'" + input.GetField ( "prefabPath" ).str + "' doesn't exist!" );
					return null;
				}
					
				var newGO : GameObject = MonoBehaviour.Instantiate ( obj ) as GameObject;
				output = newGO.GetComponent.< OFSerializedObject > ();
			
			} else {
				output = new GameObject ().AddComponent.< OFSerializedObject > ();
			
			}
		}
		
		if ( !plugins ) {
			plugins = OFReflector.GetPlugins ();
		}
		
		if ( !String.IsNullOrEmpty ( input.GetField ( "name" ).str ) ) {
			output.gameObject.name = input.GetField ( "name" ).str;
		}

		if ( String.IsNullOrEmpty ( output.id ) ) {
			output.id = input.GetField ( "id" ).str;
		}
		
		var assetLinks : JSONObject = input.GetField ( "assetLinks" );

		if ( assetLinks != null ) {
			for ( var i : int = 0; i < assetLinks.list.Count; i++ ) {
				var asFile : boolean = false;
				var path : String;
				var type : OFAssetLink.Type;

				if ( assetLinks.list[i].HasField ( "filePath" ) ) {
					path = assetLinks[i].GetField ( "filePath" ).str;
					type = OFAssetLink.Type.File;

				} else if ( assetLinks.list[i].HasField ( "resourcePath" ) ) {
					path = assetLinks[i].GetField ( "resourcePath" ).str;
					type = OFAssetLink.Type.Resource;
						
				} else if ( assetLinks.list[i].HasField ( "bundlePath" ) ) {
					path = assetLinks[i].GetField ( "bundlePath" ).str;
					type = OFAssetLink.Type.Bundle;
						
				}

				output.SetAssetLink ( assetLinks[i].GetField ( "name" ).str, path, type );
			}
		}

		var components : JSONObject = input.GetField ( "components" );
		
		for ( i = 0; i < components.list.Count; i++ ) {
			var c : Component;
			var typeString : String = components.list[i].GetField ( "_TYPE_" ).str;

			// Unity classes	
			switch ( typeString ) {
				case "Light":
					Deserialize ( components.list[i], CheckComponent ( output, typeof ( Light ) ) as Light );
					break;
				
				case "Transform":
					Deserialize ( components.list[i], CheckComponent ( output, typeof ( Transform ), true ) as Transform );
					break;
				
				case "AudioSource":
					Deserialize ( components.list[i], CheckComponent ( output, typeof ( AudioSource ) ) as AudioSource );
					break;
				
				case "MeshFilter":
					Deserialize ( components.list[i], CheckComponent ( output, typeof ( MeshFilter ) ) as MeshFilter );
					break;
				
				case "MeshRenderer":
					Deserialize ( components.list[i], CheckComponent ( output, typeof ( MeshRenderer ) ) as MeshRenderer );
					break;
				
				case "SphereCollider":
					Deserialize ( components.list[i], CheckComponent ( output, typeof ( SphereCollider ) ) as SphereCollider );
					break;
				
				case "BoxCollider":
					Deserialize ( components.list[i], CheckComponent ( output, typeof ( BoxCollider ) ) as BoxCollider );
					break;
			}

			// Plugins
	       		for ( var p : int = 0; p < plugins.Length; p++ ) {
				if ( !String.IsNullOrEmpty ( typeString ) && plugins[p].CheckType ( typeString ) ) {
					plugins[p].Deserialize ( components.list[i], CheckComponent ( output, typeString ) );
				}
			}

		}

		return output;
	}


	//////////////////
	// Unity classes
	//////////////////
	// Light
	public static function Deserialize ( input : JSONObject, light : Light ) {
		light.type = ParseEnum ( typeof ( LightType ), input.GetField ( "type" ).str );
		light.range = input.GetField ( "range" ).n;
		light.color = DeserializeColor ( input.GetField ( "color" ) );
		light.intensity = input.GetField ( "intensity" ).n;
		light.shadows = ParseEnum ( typeof ( LightShadows ), input.GetField ( "shadows" ).str );
	}
	
	// SphereCollider
	public static function Deserialize ( input : JSONObject, sphereCollider : SphereCollider ) {
		sphereCollider.center = DeserializeVector3 ( input.GetField ( "center" ) );
		sphereCollider.radius = input.GetField ( "radius" ).n;
	}

	// BoxCollider
	public static function Deserialize ( input : JSONObject, boxCollider : BoxCollider ) {
		boxCollider.center = DeserializeVector3 ( input.GetField ( "center" ) );
		boxCollider.size = DeserializeVector3 ( input.GetField ( "size" ) );
	}

	// Transform
	public static function Deserialize ( input : JSONObject, transform : Transform ) {
		transform.eulerAngles = DeserializeVector3 ( input.GetField ( "eulerAngles" ) );
		transform.position = DeserializeVector3 ( input.GetField ( "position" ) );
		transform.localScale = DeserializeVector3 ( input.GetField ( "localScale" ) );
	}
	
	// MeshFilter
	public static function Deserialize ( input : JSONObject, meshFilter : MeshFilter ) {
		var assetLink : OFAssetLink = meshFilter.GetComponent.< OFSerializedObject >().GetAssetLink( "mesh" );

		if ( assetLink != null ) {
			meshFilter.mesh = assetLink.GetMesh ();
		}
	}
	
	// MeshRenderer
	public static function Deserialize ( input : JSONObject, meshRenderer : MeshRenderer ) {
		var materials : List.< JSONObject > = input.GetField ( "materials" ).list;

		for ( var i : int = 0; i < materials.Count; i++ ) {
			var assetLinks : OFAssetLink[] = meshRenderer.GetComponent.< OFSerializedObject >().assetLinks;
			
			var shader : Shader = Shader.Find ( materials[i].GetField ( "shader" ).str );
			meshRenderer.materials[i] = new Material ( shader );
			meshRenderer.materials[i].shader = shader;
			meshRenderer.materials[i].name = materials[i].GetField ( "name" ).str;

			for ( var a : int = 0; a < assetLinks.Length; a++ ) {
				if ( assetLinks[a] && assetLinks[a].name.Contains ( "materials_" + i ) ) {
					var fieldName : String = assetLinks[a].name.Replace ( "materials_" + i, "" );
					meshRenderer.materials[i].SetTexture ( fieldName, assetLinks[a].GetTexture () );
				}
			}
		}
	}
	
	// AudioSource
	public static function Deserialize ( input : JSONObject, audio : AudioSource ) {
		var assetLink : OFAssetLink = audio.GetComponent.< OFSerializedObject >().GetAssetLink( "clip" );

		if ( assetLink != null ) {
			audio.clip = assetLink.GetAudioClip ();
		}

		audio.dopplerLevel = input.GetField ( "dopplerLevel" ).n;
		audio.ignoreListenerPause = input.GetField ( "ignoreListenerPause" ).b;
		audio.ignoreListenerVolume = input.GetField ( "ignoreListenerVolume" ).b;
		audio.loop = input.GetField ( "loop" ).b;
		audio.maxDistance = input.GetField ( "maxDistance" ).n;
		audio.minDistance = input.GetField ( "minDistance" ).n;
		audio.panLevel = input.GetField ( "panLevel" ).n;
		audio.pitch = input.GetField ( "pitch" ).n;
		audio.playOnAwake = input.GetField ( "playOnAwake" ).b;
		audio.priority = input.GetField ( "priority" ).n;
		audio.rolloffMode = Mathf.RoundToInt ( input.GetField ( "rolloffMode" ).n );
		audio.spread = input.GetField ( "spread" ).n;
		audio.volume = input.GetField ( "volume" ).n;

		if ( audio.playOnAwake ) {
			audio.Play ();
		}
	}


	/////////////////
	// Structs
	/////////////////
	// Color
	public static function DeserializeColor ( input : JSONObject ) : Color {
		var output : Color = new Color ();

		output.r = input.GetField ( "r" ).n;
		output.g = input.GetField ( "g" ).n;
		output.b = input.GetField ( "b" ).n;
		output.a = input.GetField ( "a" ).n;

		return output;
	}
	
	// Vector3
	public static function DeserializeVector3 ( input : JSONObject ) : Vector3 {
		var output : Vector3 = new Vector3();

		output.x = input.GetField ( "x" ).n;
		output.y = input.GetField ( "y" ).n;
		output.z = input.GetField ( "z" ).n;

		return output;
	}
	
	// Vector2
	public static function DeserializeVector2 ( input : JSONObject ) : Vector2 {
		var output : Vector2 = new Vector2();

		output.x = input.GetField ( "x" ).n;
		output.y = input.GetField ( "y" ).n;

		return output;
	}
}
