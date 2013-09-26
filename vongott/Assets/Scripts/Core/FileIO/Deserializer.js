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
		var path : String = pfb.GetField("path").str + "/" + pfb.GetField("id").str;
		
		Debug.Log ( "Deserializer | Instantiate " + path );
		
		var newPfb : GameObject = Instantiate ( Resources.Load ( path ) as GameObject );
		var tm : TextMesh = newPfb.GetComponentInChildren ( TextMesh );
		var bk : Book = newPfb.GetComponent(Book);
		
		newPfb.GetComponent(Prefab).id = pfb.GetField("id").str;
		newPfb.GetComponent(Prefab).path = pfb.GetField("path").str;
		newPfb.transform.localScale = DeserializeVector3 ( pfb.GetField("localScale") );
		newPfb.transform.localPosition = DeserializeVector3 ( pfb.GetField("localPosition") );
		newPfb.transform.localEulerAngles = DeserializeVector3 ( pfb.GetField("localEulerAngles") );
		
		if ( tm != null && pfb.HasField ( "text" ) ) {
			tm.text = pfb.GetField ( "text" ).str;
		}
		
		if ( bk != null && pfb.HasField ( "bookText" ) ) {
			bk.content = pfb.GetField ( "bookText" ).str;
		}
		
		if ( pfb.HasField("materialPath") ) {
			newPfb.GetComponent(Prefab).materialPath = pfb.GetField("materialPath").str;
			newPfb.GetComponent(Prefab).ReloadMaterial();
		}
		
		newPfb.name = obj.GetField("name").str;
		
		if ( newPfb.GetComponent(Prefab).path == "Prefabs/Stairs" ) {
			newPfb.tag = "walkable";
		}
		
		// GUID
		if ( obj.HasField ( "GUID" ) ) {
			newPfb.GetComponent(GUID).GUID = obj.GetField ( "GUID" ).str;
		}
		
		return newPfb;

	// check if lightsource
	} else if ( obj.HasField("LightSource") ) {
		var lgt : JSONObject = obj.GetField("LightSource");
		var newObj : GameObject;
		var prefabPath : String = "Prefabs/Editor/light_source";
		
		if ( lgt.HasField ("prefabPath") && lgt.GetField ("prefabPath").str != "" ) {
			prefabPath = lgt.GetField ("prefabPath").str;
		}
		
		Debug.Log ( "Deserializer | Instantaite " + prefabPath );
		
		newObj = Instantiate ( Resources.Load ( prefabPath ) as GameObject );

		newObj.GetComponent(LightSource).SetRange ( lgt.GetField ("range").n );
		newObj.GetComponent(LightSource).SetColor ( DeserializeColor( lgt.GetField ("color") ) );
		newObj.GetComponent(LightSource).SetIntensity ( lgt.GetField ("intensity").n );
		newObj.GetComponent(LightSource).prefabPath = prefabPath;
		
		newObj.transform.localScale = DeserializeVector3 ( lgt.GetField("localScale") );
		newObj.transform.localPosition = DeserializeVector3 ( lgt.GetField("localPosition") );
		newObj.transform.localEulerAngles = DeserializeVector3 ( lgt.GetField("localEulerAngles") );
		
		newObj.name = obj.GetField("name").str;
		
		// GUID
		if ( obj.HasField ( "GUID" ) ) {
			newObj.GetComponent(GUID).GUID = obj.GetField ( "GUID" ).str;
		}
	
		return newObj;
	
	// check if actor
	} else if ( obj.HasField("Actor") ) {
		var act : JSONObject = obj.GetField("Actor");
		var cnv : JSONObject = obj.GetField("Conversation");
		var newAct : GameObject;
		
		Debug.Log ( "Deserializer | Instantaite " + act.GetField("model").str );	
								
		newAct = Instantiate ( Resources.Load ( "Actors/" + act.GetField("model").str ) as GameObject );
		newAct.GetComponent(Actor).SetAffiliation ( act.GetField ( "affiliation" ).str );
		newAct.GetComponent(Actor).SetMood ( act.GetField ( "mood" ).str );
		
		newAct.GetComponent(Actor).SetPathType ( act.GetField ( "pathType" ).str );
		newAct.GetComponent(Actor).path = DeserializePath ( act.GetField ( "path" ) );
		newAct.GetComponent(Actor).inventory = DeserializeInventory ( act.GetField ( "inventory" ) );
		newAct.GetComponent(Actor).conversations = DeserializeConversationsToGame ( act.GetField ( "conversations" ) );
		
		newAct.transform.localScale = DeserializeVector3 ( act.GetField("localScale") );
		newAct.transform.localPosition = DeserializeVector3 ( act.GetField("localPosition") );
		newAct.transform.localEulerAngles = DeserializeVector3 ( act.GetField("localEulerAngles") );
	
		newAct.name = obj.GetField("name").str;
		newAct.layer = 9;
	
		// GUID
		if ( obj.HasField ( "GUID" ) ) {
			newAct.GetComponent(GUID).GUID = obj.GetField ( "GUID" ).str;
		}
	
		return newAct;
	
	// check if surface
	} else if ( obj.HasField("Surface") ) {
		var srf : JSONObject = obj.GetField("Surface");
		var newSrfObj : GameObject = new GameObject("Surface", MeshRenderer, MeshFilter, MeshCollider);
		var newSrf : Surface = newSrfObj.AddComponent(Surface);
		
		for ( var p : Object in srf.GetField("planes").list ) {
			newSrf.planes.Add ( DeserializeSurfacePlane ( p as JSONObject ) );
		}
		
		newSrf.materialPath = srf.GetField("materialPath").str;
		newSrf.materialSize = srf.GetField ( "materialSize" ).n;
		if ( srf.HasField ( "foliagePath" ) ) { newSrf.materialPath = srf.GetField("foliagePath").str; }
		if ( srf.HasField ( "foliageDensity" ) ) { newSrf.materialSize = srf.GetField ( "foliageDensity" ).n; }
		newSrfObj.transform.localScale = DeserializeVector3 ( srf.GetField ( "localScale" ) );
		newSrfObj.transform.localPosition = DeserializeVector3 ( srf.GetField ( "localPosition" ) );
		newSrfObj.transform.localEulerAngles = DeserializeVector3 ( srf.GetField ( "localEulerAngles" ) );
		if ( newSrfObj.transform.localScale.y == 1 ) {
			newSrfObj.tag = "walkable";
		}
	
		newSrf.name = obj.GetField("name").str;
	
		newSrf.Init ();
		newSrf.Apply ();
	
		// GUID
		if ( obj.HasField ( "GUID" ) ) {
			newSrfObj.GetComponent(GUID).GUID = obj.GetField ( "GUID" ).str;
		}
	
		return newSrfObj;
	
	// check if spawnpoint
	} else if ( obj.HasField("SpawnPoint") ) {
		var spt : JSONObject = obj.GetField("SpawnPoint");
		var newSpt : GameObject;
		
		newSpt = Instantiate ( Resources.Load ( "Prefabs/Editor/spawnpoint" ) as GameObject );
		newSpt.transform.localEulerAngles = new Vector3 ( 0, DeserializeVector3 ( spt.GetField("localEulerAngles") ).y, 0 );
		newSpt.transform.localPosition = DeserializeVector3 ( spt.GetField("localPosition") );
		//newSpt.GetComponent(SpawnPoint).spawnPointName = 
	
		newSpt.name = obj.GetField("name").str;
	
		// GUID
		if ( obj.HasField ( "GUID" ) ) {
			newSpt.GetComponent(GUID).GUID = obj.GetField ( "GUID" ).str;
		}
		
		return newSpt;
	
	// check trigger
	} else if ( obj.HasField("Trigger") ) {
		var trg : JSONObject = obj.GetField("Trigger");
		
		var newTrg : GameObject = Instantiate ( Resources.Load ( "Prefabs/Editor/trigger" ) as GameObject );
		newTrg.transform.localEulerAngles = DeserializeVector3 ( trg.GetField("localEulerAngles") );
		newTrg.transform.localPosition = DeserializeVector3 ( trg.GetField("localPosition") );
		newTrg.transform.localScale = DeserializeVector3 ( trg.GetField("localScale") );
		newTrg.layer = 9;
		
		newTrg.GetComponent(Trigger).SetActivationType ( trg.GetField ( "activation" ).str );
		newTrg.GetComponent(Trigger).fireOnce = trg.GetField ( "fireOnce" ).b;
		newTrg.GetComponent(Trigger).events = DeserializeEvents ( trg.GetField ( "events" ) );
		
		newTrg.name = obj.GetField("name").str;
		
		// GUID
		if ( obj.HasField ( "GUID" ) ) {
			newTrg.GetComponent(GUID).GUID = obj.GetField ( "GUID" ).str;
		}
		
		return newTrg;
	
	} else {
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
}

static function DeserializeGameObject ( s : String ) : GameObject {
	var obj : JSONObject = new JSONObject ( s );
	var o : GameObject = DeserializeGameObjectFromJSON ( obj );
	
	// camera
	if ( obj.HasField ( "Camera" ) && Camera.main.GetComponent ( EditorCamera ) ) {
		var cam : JSONObject = obj.GetField("Camera");
		
		Camera.main.transform.localPosition = DeserializeVector3 ( cam.GetField ( "localPosition" ) );
		Camera.main.transform.localEulerAngles = DeserializeVector3 ( cam.GetField ( "localEulerAngles" ) );
		Camera.main.GetComponent(EditorCamera).RefreshFixPoint ( false );
	}
	
	// skybox
	if ( obj.HasField ( "Skybox" ) ) {
		var parent : Transform = GameObject.FindWithTag("SkyboxCamera").transform.parent;
		var skybox : GameObject = Instantiate ( Resources.Load ( "Prefabs/Skyboxes/" + obj.GetField ( "Skybox" ).str ) as GameObject );
		
		skybox.name = skybox.name.Replace( "(Clone)", "" );
		
		skybox.transform.parent = parent;
		skybox.transform.localPosition = Vector3.zero;
		skybox.transform.localScale = Vector3.one;
		skybox.transform.localEulerAngles = Vector3.zero;
	}
	
	return o;
}

static function DeserializeSpawnPoints ( s : String ) : String[] {
	var obj : JSONObject = new JSONObject ( s );
	var list : List.< String > = new List.< String > ();	
	var array : String[];
	
	for ( var o : Object in obj.list) {
		var jo : JSONObject = o as JSONObject;
		if ( jo.HasField("SpawnPoint") ) {
			list.Add ( jo.GetField("SpawnPoint").GetField("name").str );
		}
	}
	
	array = new String[list.Count];
	
	for ( var i = 0; i < list.Count; i++ ) {
		array[i] = list[i];
	}
	
	return array;
}

// all children
static function DeserializeGameObjectChildren ( obj : JSONObject, parent : Transform ) {
	if ( !obj ) {
		return;
	}
	
	for ( var c : Object in obj.list) {
		var o : GameObject = DeserializeGameObjectFromJSON ( c as JSONObject );
		
		o.transform.parent = parent;
	}
}

// all components
static function DeserializeGameObjectComponents ( arr : JSONObject, o : GameObject ) {
	if ( !arr ) {
		return;
	}
	
	for ( var x : Object in arr.list ) {
		var j : JSONObject = x as JSONObject;
		
		if ( j.HasField ( "Light" ) ) {
			DeserializeLight ( j.GetField ( "Light" ), o );
		} else if ( j.HasField("Transform") ) {
			DeserializeTransform ( j.GetField ( "Transform" ), o );
		}
	}
}

// game events
static function DeserializeEvents ( evt : JSONObject ) : List.< GameEvent > {
	if ( !evt ) {
		return null;
	}
	
	var events : List.< GameEvent > =  new List.< GameEvent > ();
	
	for ( var o : Object in evt.list ) {
		var j : JSONObject = o as JSONObject;
		
		events.Add ( DeserializeGameEvent ( j ) );
	}
	
	return events;
}

// path
static function DeserializePath ( pth : JSONObject ) : List.< PathNode > {
	var nodes : List.< PathNode > = new List.< PathNode >();

	for ( var o : Object in pth.list ) {
		nodes.Add ( DeserializePathNode ( (o as JSONObject) ) );
	}

	return nodes;
}

// inventory
static function DeserializeInventory ( ety : JSONObject ) : InventoryEntry[] {
	var inv : InventoryEntry[] = new InventoryEntry[4];
	
	for ( var i = 0; i < ety.list.Count; i++ ) {
		var slot : JSONObject = ety.list[i] as JSONObject;
		var path = slot.GetField("prefabPath").str;
		
		if ( path != "" ) {
			inv[i] = new InventoryEntry ( path );
		}
	}
	
	return inv;
}


////////////////////
// Deserialize components individually
////////////////////
// GameEvent
static function DeserializeGameEvent ( evt : JSONObject ) : GameEvent {
	var event : GameEvent = new GameEvent();
	
	event.delay = evt.GetField ( "delay" ).n;
	event.condition = evt.GetField ( "condition" ).str;
	event.conditionBool = evt.GetField ( "conditionBool" ).b;
			
	switch ( evt.GetField ( "type" ).str ) {
		case "Animation":
			event.type = GameEvent.eEventType.Animation;
			event.animationObject = evt.GetField ( "animationObject" ).str;
			event.animationType = evt.GetField ( "animationType" ).str;
			event.animationVector = DeserializeVector3 ( evt.GetField ( "animationVector" ) );
			break;
		
		case "Quest":
			event.type = GameEvent.eEventType.Quest;
			event.questID = evt.GetField ( "questID" ).str;
			event.questAction = evt.GetField ( "questAction" ).str;
			break;
			
		case "NextPath":
			event.type = GameEvent.eEventType.NextPath;
			event.nextPathName = evt.GetField ( "nextPathName" ).str;
			break;
			
		case "SetFlag":
			event.type = GameEvent.eEventType.SetFlag;
			event.flagName = evt.GetField ( "flagName" ).str;
			event.flagBool = evt.GetField ( "flagBool" ).b;
			break;
			
		case "Travel":
			event.type = GameEvent.eEventType.Travel;
			event.travelMap = evt.GetField ( "travelMap" ).str;
			event.travelSpawnPoint = evt.GetField ( "travelSpawnPoint" ).str;
			break;
	
	}
	
	return event;
}

// PathNode
static function DeserializePathNode ( p : JSONObject ) : PathNode {
	var node : PathNode = new PathNode ();
	
	// position
	node.position = DeserializeVector3( p.GetField ( "position" ) );
	
	// duration
	node.duration = p.GetField ( "duration" ).n;
	
	// duration
	if ( p.HasField ( "running" ) ) { node.running = p.GetField ( "running" ).b; }
	
	return node;
}

// SurfacePlane
static function DeserializeSurfacePlane ( p : JSONObject ) : SurfacePlane {
	var vertices : Vector3[] = new Vector3[4];
	
	for ( var i = 0; i < p.GetField ("vertices").list.Count; i++ ) {
		vertices[i] = DeserializeVector3 ( p.GetField ("vertices").list[i] as JSONObject );
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
		for ( var o : Object in convos.list ) {
			var c : JSONObject = o as JSONObject;
			
			var convo : Conversation = new Conversation ();
			
			if ( c.HasField ( "condition" ) ) { convo.condition = c.GetField ( "condition" ).str; }
			if ( c.HasField ( "conditionBool" ) ) { convo.conditionBool = c.GetField ( "conditionBool" ).b; }
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
		var e : JSONObject = c.list[o] as JSONObject;
		var entryObj : GameObject = Instantiate ( Resources.Load ( "Prefabs/UI/EditorConversationEntry" ) ) as GameObject;
		var entry : EditorConversationEntry = entryObj.GetComponent ( EditorConversationEntry );
		
		entry.index.text = o.ToString();
		entry.type.selectedOption = e.GetField ( "type" ).str;
		
		// lines
		if ( e.GetField ( "type" ).str == "Line" ) {
			entry.line.condition.text = e.GetField ( "condition" ).str;
			entry.line.conditionBool.isChecked = e.GetField ( "conditionBool" ).b;
			entry.line.consequence.text = e.GetField ( "consequence" ).str;
			entry.line.consequenceBool.isChecked = e.GetField ( "consequenceBool" ).b;
			entry.line.speaker.selectedOption = e.GetField ( "speaker" ).str;
			entry.line.line.text = e.GetField ( "line" ).str;
			entry.line.endConvo.selectedOption = e.GetField ( "endConvo" ).str;
		
		// groups
		} else if ( e.GetField ( "type" ).str == "Group" ) {
			entry.group.condition.text = e.GetField ( "condition" ).str;
			entry.group.conditionBool.isChecked = e.GetField ( "conditionBool" ).b;
			entry.group.options.selectedOption = e.GetField ( "options" ).list.Count.ToString();
			entry.group.groupType.selectedOption = e.GetField ( "groupType" ).str;
			entry.group.speaker.selectedOption = e.GetField ( "speaker" ).str;
			
			for ( var i = 0; i < e.GetField ( "options" ).list.Count; i++ ) {
				var gl : JSONObject = e.GetField ( "options" ).list[i] as JSONObject;		
				var groupLineObj : GameObject = Instantiate ( Resources.Load ( "Prefabs/UI/EditorConversationGroupLine" ) ) as GameObject;
				var groupLine : EditorConversationGroupLine = groupLineObj.GetComponent ( EditorConversationGroupLine );
			
				groupLine.SetIndex ( i );
				groupLine.consequence.text = gl.GetField ( "consequence" ).str;
				groupLine.consequenceBool.isChecked = gl.GetField ( "consequenceBool" ).b;
				groupLine.line.text = gl.GetField ( "line" ).str;
				groupLine.endConvo.selectedOption = gl.GetField ( "endConvo" ).str;
			
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
static function DeserializeScreenshot ( input : String ) : byte[] {
	var map : JSONObject =  new JSONObject ( input );
	var bytes : byte[] = Convert.FromBase64String ( map.GetField ( "screenshot" ).str );
	
	return bytes;
}
