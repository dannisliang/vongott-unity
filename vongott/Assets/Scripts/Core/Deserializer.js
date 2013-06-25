#pragma strict

import System.Text;
import System.Text.RegularExpressions;

////////////////////
// Deserialize GameObjects with their children and components
////////////////////
// Define root
static var root : Transform;

// GameObject
static function DeserializeGameObjectFromJSON ( obj : JSONObject ) : GameObject {
	// check if prefab
	if ( obj.HasField("Prefab") ) {
		var pfb : JSONObject = obj.GetField("Prefab");		
		var path : String = "Prefabs/" + pfb.GetField("path").str + "/" + pfb.GetField("id").str;
		
		var newPfb : GameObject = Instantiate ( Resources.Load ( path ) as GameObject );
		
		newPfb.GetComponent(Prefab).id = pfb.GetField("id").str;
		newPfb.GetComponent(Prefab).path = pfb.GetField("path").str;
		newPfb.transform.localScale = DeserializeVector3 ( pfb.GetField("localScale") );
		newPfb.transform.localPosition = DeserializeVector3 ( pfb.GetField("localPosition") );
		newPfb.transform.localEulerAngles = DeserializeVector3 ( pfb.GetField("localEulerAngles") );
		
		newPfb.name = pfb.GetField("id").str;
		
		return newPfb;

	// check if lightsource
	} else if ( obj.HasField("LightSource") ) {
		var lgt : JSONObject = obj.GetField("LightSource");
		var newObj : GameObject;
		
		newObj = Instantiate ( Resources.Load ( "Prefabs/Editor/light_source" ) as GameObject );
		newObj.GetComponent(LightSource).SetRange ( lgt.GetField ("range").n );
		newObj.GetComponent(LightSource).SetColor ( DeserializeColor( lgt.GetField ("color") ) );
		newObj.GetComponent(LightSource).SetIntensity ( lgt.GetField ("intensity").n );
		newObj.transform.localPosition = DeserializeVector3 ( lgt.GetField("localPosition") );
	
		newObj.name = newObj.name.Replace( "(Clone)", "" );
	
		return newObj;
	
	// check if actor
	} else if ( obj.HasField("Actor") ) {
		var act : JSONObject = obj.GetField("Actor");
		var cnv : JSONObject = obj.GetField("Conversation");
		var newAct : GameObject;
				
		newAct = Instantiate ( Resources.Load ( "Actors/" + act.GetField("model").str ) as GameObject );
		newAct.GetComponent(Actor).affiliation = act.GetField ( "affiliation" ).str;
		newAct.GetComponent(Actor).mood = act.GetField ( "mood" ).str;
		
		newAct.GetComponent(Actor).speed = act.GetField ( "speed" ).n;
		newAct.GetComponent(Actor).path = DeserializePath ( act.GetField ( "path" ), newAct );
		newAct.GetComponent(Actor).inventory = DeserializeInventory ( act.GetField ( "inventory" ) );
		newAct.GetComponent(Actor).conversations = DeserializeConversationsToGame ( act.GetField ( "conversations" ) );
		
		newAct.transform.localScale = DeserializeVector3 ( act.GetField("localScale") );
		newAct.transform.localPosition = DeserializeVector3 ( act.GetField("localPosition") );
		newAct.transform.localEulerAngles = DeserializeVector3 ( act.GetField("localEulerAngles") );
	
		newAct.name = act.GetField("model").str;
	
		return newAct;
	
	// check if item
	} else if ( obj.HasField("Item") ) {
		var itm : JSONObject = obj.GetField("Item");
		var newItm : GameObject;
		
		newItm = Instantiate ( Resources.Load ( "Items/" + itm.GetField("model").str ) as GameObject );
								
		newItm.transform.localScale = DeserializeVector3 ( itm.GetField("localScale") );
		newItm.transform.localPosition = DeserializeVector3 ( itm.GetField("localPosition") );
		newItm.transform.localEulerAngles = DeserializeVector3 ( itm.GetField("localEulerAngles") );
	
		newItm.name = itm.GetField("model").str;
	
		return newItm;
	
	// check if surface
	} else if ( obj.HasField("Surface") ) {
		var srf : JSONObject = obj.GetField("Surface");
		var newSrfObj : GameObject = new GameObject("Surface", MeshRenderer, MeshFilter, MeshCollider);
		var newSrf : Surface = newSrfObj.AddComponent(Surface);
		
		for ( var p : JSONObject in srf.GetField("planes").list ) {
			newSrf.planes.Add ( DeserializeSurfacePlane ( p ) );
		}
		
		newSrf.materialPath = srf.GetField("materialPath").str;
		newSrf.materialSize = srf.GetField ( "materialSize" ).n;
		newSrf.flipped = srf.GetField ( "flipped" ).b;
		newSrfObj.transform.localScale = DeserializeVector3 ( srf.GetField ( "localScale" ) );
		newSrfObj.transform.localPosition = DeserializeVector3 ( srf.GetField ( "localPosition" ) );
		newSrfObj.transform.localEulerAngles = DeserializeVector3 ( srf.GetField ( "localEulerAngles" ) );
	
		newSrf.Init ();
		newSrf.Apply ();
	
		return newSrfObj;
	
	// check if spawnpoint
	} else if ( obj.HasField("SpawnPoint") ) {
		var spt : JSONObject = obj.GetField("SpawnPoint");
		var newSpt : GameObject;
		
		newSpt = Instantiate ( Resources.Load ( "Prefabs/Editor/spawnpoint" ) as GameObject );
		newSpt.transform.localEulerAngles = DeserializeVector3 ( spt.GetField("localEulerAngles") );
		newSpt.transform.localPosition = DeserializeVector3 ( spt.GetField("localPosition") );
	
		newSpt.name = newSpt.name.Replace( "(Clone)", "" );
	
		return newSpt;
	}
	
	var o : GameObject = new GameObject ( obj.GetField ( "name" ).str );
	
	// set root
	if ( !root ) {
		root = o.transform;
	}
																												
	// components
	DeserializeGameObjectComponents ( obj.GetField ( "components" ), o );
	
	// children
	DeserializeGameObjectChildren ( obj.GetField ( "children" ), o.transform );
	
	return o;
}

static function DeserializeGameObject ( s : String ) : GameObject {
	var obj : JSONObject = new JSONObject ( s );
	var o : GameObject = DeserializeGameObjectFromJSON ( obj );
	
	// camera
	if ( obj.HasField ( "Camera" ) && Camera.main.GetComponent ( EditorCamera ) ) {
		var cam : JSONObject = obj.GetField("Camera");
		
		Camera.main.transform.localPosition = DeserializeVector3 ( cam.GetField ( "localPosition" ) );
		Camera.main.transform.localEulerAngles = DeserializeVector3 ( cam.GetField ( "localEulerAngles" ) );
		Camera.main.GetComponent ( EditorCamera ).rotationY = -Camera.main.transform.localEulerAngles.x;
	}
	
	return o;
}

// all children
static function DeserializeGameObjectChildren ( obj : JSONObject, parent : Transform ) {
	if ( !obj ) {
		return;
	}
	
	for ( var c in obj.list ) {
		var o : GameObject = DeserializeGameObjectFromJSON ( c );
		
		o.transform.parent = parent;
	}
}

// all components
static function DeserializeGameObjectComponents ( arr : JSONObject, o : GameObject ) {
	if ( !arr ) {
		return;
	}
	
	for ( var j : JSONObject in arr.list ) {
		if ( j.HasField ( "Light" ) ) {
			DeserializeLight ( j.GetField ( "Light" ), o );
		} else if ( j.HasField("Transform") ) {
			DeserializeTransform ( j.GetField ( "Transform" ), o );
		}
	}
}

// path
static function DeserializePath ( pth : JSONObject, act : GameObject ) : List.< GameObject > {
	var nodes : List.< GameObject > =  new List.< GameObject >();

	for ( var n : JSONObject in pth.list ) {
		nodes.Add ( DeserializePathNode ( n, act ) );
	}

	return nodes;
}

// inventory
static function DeserializeInventory ( ety : JSONObject ) : Entry[] {
	var inv : Entry[] = new Entry[4];
	
	for ( var i = 0; i < ety.list.Count; i++ ) {
		var slot : JSONObject = ety.list[i];
		var model = slot.GetField("model").str;
		
		if ( model != "" ) {
			var obj : GameObject = Instantiate ( Resources.Load ( "Items/" + slot.GetField("model").str ) as GameObject );
			inv[i] = InventoryManager.ConvertItemToEntry ( obj.GetComponent(Item) );
			DestroyImmediate ( obj );
		}
	}
	
	return inv;
}


////////////////////
// Deserialize components individually
////////////////////
// PathNode
static function DeserializePathNode ( p : JSONObject, o : GameObject ) : GameObject {
	var obj : GameObject = Instantiate ( Resources.Load ( "Prefabs/Editor/path_node" ) as GameObject );
	
	// position
	obj.transform.localPosition = DeserializeVector3( p.GetField ( "localPosition" ) );
	
	// rotation
	obj.transform.localEulerAngles = DeserializeVector3( p.GetField ( "localEulerAngles" ) );
	
	// duration
	obj.GetComponent(PathNode).duration = p.GetField ( "duration" ).n;
	
	// owner
	obj.GetComponent(PathNode).owner = o;
	
	// set invisible
	obj.GetComponent(MeshRenderer).enabled = false;
	
	// parent
	obj.transform.parent = root;
	
	return obj;
}

// SurfacePlane
static function DeserializeSurfacePlane ( p : JSONObject ) : SurfacePlane {
	var vertices : Vector3[] = new Vector3[4];
	
	for ( var i = 0; i < p.GetField ("vertices").list.Count; i++ ) {
		vertices[i] = DeserializeVector3 ( p.GetField ("vertices").list[i] );
	}
	
	var plane : SurfacePlane = new SurfacePlane ( vertices );
	plane.index = DeserializeVector2 ( p.GetField("index") );
	plane.position = DeserializeVector3 ( p.GetField("position") );
	
	return plane;
}

// Transform
static function DeserializeTransform ( c : JSONObject, o : GameObject ) {
	var component : Transform = o.GetComponent ( Transform );
	
	component.localPosition = DeserializeVector3( c.GetField ( "localPosition" ) );
	component.localEulerAngles = DeserializeVector3( c.GetField ( "localRotation" ) );
	component.localScale = DeserializeVector3( c.GetField ( "localScale" ) );
	
	return component;
}

// Light
static function DeserializeLight ( l : JSONObject, o : GameObject ) {
	var component : Light = o.AddComponent ( Light );
		
	// range
	component.range = float.Parse ( l.GetField ( "range" ) as String );
	
	// intensity
	component.intensity = float.Parse ( l.GetField ( "intensity" ) as String );
	
	// color
	component.color = DeserializeColor ( l.GetField ( "color" ) );
	
	return component;
}

// Color
static function DeserializeColor ( c : JSONObject ) : Color {
	var r : JSONObject = c.list[0] as JSONObject;
	var g : JSONObject = c.list[1] as JSONObject;
	var b : JSONObject = c.list[2] as JSONObject;
	var a : JSONObject = c.list[3] as JSONObject;
	
	var color : Color = new Color ( r.n, g.n, b.n, a.n );
	
	return color;
}

// Vector3
static function DeserializeVector3 ( v : JSONObject ) : Vector3 {
	var x : JSONObject = v.list[0] as JSONObject;
	var y : JSONObject = v.list[1] as JSONObject;
	var z : JSONObject = v.list[2] as JSONObject;

	var vector : Vector3 = new Vector3 ( x.n, y.n, z.n );
		
	return vector;
}

// Vector2
static function DeserializeVector2 ( v : JSONObject ) : Vector2 {
	var x : JSONObject = v.list[0] as JSONObject;
	var y : JSONObject = v.list[1] as JSONObject;
	
	var vector : Vector3 = new Vector3 ( x.n, y.n );
		
	return vector;
}


////////////////////
// Conversations
////////////////////
// To game
static function DeserializeConversationsToGame ( convos : JSONObject ) {
	var conversations : List.< Conversation > = new List.< Conversation >();
		
	if ( convos ) {		
		for ( var c : JSONObject in convos.list ) {
			var convo : Conversation = new Conversation ();
			
			if ( c.HasField ( "condition" ) ) { convo.condition = c.GetField ( "condition" ).str; }
			if ( c.HasField ( "startQuest" ) ) { convo.startQuest = c.GetField ( "startQuest" ).str; }
			if ( c.HasField ( "endQuest" ) ) { convo.endQuest = c.GetField ( "endQuest" ).str; }
			
			convo.chapter = c.GetField ( "chapter" ).str;
			convo.scene = c.GetField ( "scene" ).str;
			convo.name = c.GetField ( "name" ).str;
			convo.conversation = c.GetField ( "conversation" ).str;
						
			conversations.Add ( convo );
		}
	}
	
	return conversations;
}

// To editor
static function DeserializeConversationToEditor ( str : String ) : List.< EditorConversationEntry > {
	var c : JSONObject = new JSONObject ( str );
	var conversation : List.< EditorConversationEntry > = new List.< EditorConversationEntry >();
			
	for ( var o = 0; o < c.list.Count; o++ ) {
		var e : JSONObject = c.list[o];
		var entryObj : GameObject = Instantiate ( Resources.Load ( "Prefabs/UI/EditorConversationEntry" ) ) as GameObject;
		var entry : EditorConversationEntry = entryObj.GetComponent ( EditorConversationEntry );
		
		entry.index.text = o.ToString();
		entry.type.selectedOption = e.GetField ( "type" ).str;
		
		// lines
		if ( e.GetField ( "type" ).str == "Line" ) {
			entry.line.condition.text = e.GetField ( "condition" ).str;
			entry.line.consequence.text = e.GetField ( "consequence" ).str;
			entry.line.speaker.selectedOption = e.GetField ( "speaker" ).str;
			entry.line.line.text = e.GetField ( "line" ).str;
		
		// groups
		} else if ( e.GetField ( "type" ).str == "Group" ) {
			entry.group.options.selectedOption = e.GetField ( "options" ).list.Count.ToString();
			entry.group.groupType.selectedOption = e.GetField ( "groupType" ).str;
			
			for ( var i = 0; i < e.GetField ( "options" ).list.Count; i++ ) {
				var gl : JSONObject = e.GetField ( "options" ).list[i];		
				var groupLineObj : GameObject = Instantiate ( Resources.Load ( "Prefabs/UI/EditorConversationGroupLine" ) ) as GameObject;
				var groupLine : EditorConversationGroupLine = groupLineObj.GetComponent ( EditorConversationGroupLine );
			
				groupLine.SetIndex ( i );
				groupLine.consequence.text = gl.GetField ( "consequence" ).str;
				groupLine.line.text = gl.GetField ( "line" ).str;
			
				groupLine.transform.parent = entry.group.container;
				groupLine.transform.localPosition = new Vector3 ( 20, (i+1) * 50, 0 );
				groupLine.transform.localScale = Vector3.one;
			
			}
		
		// dialog boxes
		} else if ( e.GetField ( "type" ).str == "DialogBox" ) {
			entry.dialogBox.instructions.text = e.GetField ( "instructions" ).str;
			entry.dialogBox.title.text = e.GetField ( "title" ).str;
			entry.dialogBox.useInput.isChecked = e.GetField ( "useInput" ).str == "True";
			entry.dialogBox.canCancel.isChecked = e.GetField ( "canCancel" ).str == "True";
		
		}
	
		conversation.Add ( entry );
	}
	
	return conversation;
}


////////////////////
// Deserialize quest
////////////////////
static function DeserializeQuest ( obj : JSONObject ) : Quest {
	var quest : Quest = new Quest ();
	
	quest.id = obj.GetField ( "id" ).str;
	quest.title = obj.GetField ( "title" ).str;
	quest.desc = obj.GetField ( "desc" ).str;
	quest.active = obj.GetField ( "active" ).b;
	quest.isMainQuest = obj.GetField ( "isMainQuest" ).b;
	quest.skillPoints = obj.GetField ( "skillPoints" ).n;
	
	return quest;
}


////////////////////
// Deserialize screenshot
////////////////////
static function DeserializeScreenshot ( input : String ) : Texture2D {
	var map : JSONObject =  new JSONObject ( input );
	var bytes : byte[] = Convert.FromBase64String ( map.GetField ( "screenshot" ).str );
	var image : Texture2D = new Texture2D ( 0, 0 );
	
	image.LoadImage ( bytes );
			
	return image;
}
