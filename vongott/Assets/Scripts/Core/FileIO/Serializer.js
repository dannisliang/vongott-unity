#pragma strict

import System;
import System.Text;

////////////////////
// Serialize GameObjects with their children and components
////////////////////
// GameObject
static function SerializeGameObject ( obj : GameObject ) : JSONObject {
	var o : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
	var chl : JSONObject;
	var com : JSONObject;
	
	// name
	o.AddField ( "name", obj.name );
	
	// check if prefab
	if ( obj.GetComponent(Prefab) ) {
		// guid
		o.AddField ( "GUID", obj.GetComponent(GUID).GUID );
		
		var pfb : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
		var tm : TextMesh = obj.GetComponentInChildren (TextMesh);
		var bk : Book = obj.GetComponent(Book);
		
		pfb.AddField ( "path", obj.GetComponent(Prefab).path );
		pfb.AddField ( "id", obj.GetComponent(Prefab).id );
		pfb.AddField ( "localScale", SerializeVector3 ( obj.transform.localScale ) );
		pfb.AddField ( "localPosition", SerializeVector3 ( obj.transform.localPosition ) );
		pfb.AddField ( "localEulerAngles", SerializeVector3 ( obj.transform.localEulerAngles ) );
		
		if ( tm != null ) {
			pfb.AddField ( "text", tm.text );
		}
		
		if ( bk != null ) {
			pfb.AddField ( "bookText", bk.content );
		}
		
		if ( obj.GetComponent(Prefab).materialPath != "" && obj.GetComponent(Prefab).canChangeMaterial ) {
			pfb.AddField ( "materialPath", obj.GetComponent(Prefab).materialPath );
		}
		
		o.AddField ( "Prefab", pfb );
		
		return o;
	
	// check if lightsource
	} else if ( obj.GetComponent(LightSource) ) {
		// guid
		o.AddField ( "GUID", obj.GetComponent(GUID).GUID );
		
		var lgt : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
		
		lgt.AddField ( "color", SerializeColor ( obj.GetComponent(LightSource).color ) );
		lgt.AddField ( "range", obj.GetComponent(LightSource).range );
		lgt.AddField ( "intensity", obj.GetComponent(LightSource).intensity );
		lgt.AddField ( "prefabPath", obj.GetComponent(LightSource).prefabPath );
		lgt.AddField ( "localScale", SerializeVector3 ( obj.transform.localScale ) );
		lgt.AddField ( "localPosition", SerializeVector3 ( obj.transform.localPosition ) );
		lgt.AddField ( "localEulerAngles", SerializeVector3 ( obj.transform.localEulerAngles ) );
		
		o.AddField ( "LightSource", lgt );
		
		return o;
		
	// check if actor
	} else if ( obj.GetComponent(Actor) ) {
		// guid
		o.AddField ( "GUID", obj.GetComponent(GUID).GUID );
		
		var act : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
		var conversations : JSONObject = new JSONObject (JSONObject.Type.ARRAY);
		
		act.AddField ( "model", obj.GetComponent(Actor).model );
		act.AddField ( "affiliation", obj.GetComponent(Actor).affiliation.ToString() );
		act.AddField ( "mood", obj.GetComponent(Actor).mood );
		
		act.AddField ( "pathType", obj.GetComponent(Actor).pathType.ToString() );
		act.AddField ( "path", SerializePath ( obj.GetComponent(Actor).path ) );
		act.AddField ( "inventory", SerializeInventory ( obj.GetComponent(Actor).inventory ) );
		
		for ( var c : Conversation in obj.GetComponent(Actor).conversations ) {
			var convo : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
			
			convo.AddField ( "condition", c.condition );
			convo.AddField ( "conditionBool", c.conditionBool );
			convo.AddField ( "startQuest", c.startQuest );
			convo.AddField ( "endQuest", c.endQuest );
			
			convo.AddField ( "chapter", c.chapter );
			convo.AddField ( "scene", c.scene );
			convo.AddField ( "name", c.name );
			convo.AddField ( "conversation", c.conversation );
		
			conversations.Add ( convo );
		}
		
		act.AddField ( "conversations", conversations );
		
		act.AddField ( "localScale", SerializeVector3 ( obj.transform.localScale ) );
		act.AddField ( "localPosition", SerializeVector3 ( obj.transform.localPosition ) );
		act.AddField ( "localEulerAngles", SerializeVector3 ( obj.transform.localEulerAngles ) );
		
		o.AddField ( "Actor", act );
		
		return o;

	// check if surface
	} else if ( obj.GetComponent(Surface) ) {
		// guid
		o.AddField ( "GUID", obj.GetComponent(GUID).GUID );
		
		var srf : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
		var planes : JSONObject = new JSONObject (JSONObject.Type.ARRAY);
		
		for ( var p : SurfacePlane in obj.GetComponent ( Surface ).planes ) {
			planes.Add ( SerializeSurfacePlane ( p ) );
		}
		
		srf.AddField ( "materialPath", obj.GetComponent(Surface).materialPath );
		srf.AddField ( "materialSize", obj.GetComponent(Surface).materialSize );
		srf.AddField ( "localScale", SerializeVector3 ( obj.transform.localScale ) );
		srf.AddField ( "localPosition", SerializeVector3 ( obj.transform.localPosition ) );
		srf.AddField ( "localEulerAngles", SerializeVector3 ( obj.transform.localEulerAngles ) );
		srf.AddField ( "planes", planes );
		
		o.AddField ( "Surface", srf );
		
		return o;
	
	// check if spawnpoint
	} else if ( obj.GetComponent(SpawnPoint) ) {
		// guid
		o.AddField ( "GUID", obj.GetComponent(GUID).GUID );
		
		var spt : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
		
		spt.AddField ( "name", obj.name );
		spt.AddField ( "localPosition", SerializeVector3 ( obj.transform.localPosition ) );
		spt.AddField ( "localEulerAngles", SerializeVector3 ( obj.transform.localEulerAngles ) );
	
		o.AddField ( "SpawnPoint", spt );
	
		return o;
	
	// check trigger
	} else if ( obj.GetComponent(Trigger) ) {
		// guid
		o.AddField ( "GUID", obj.GetComponent(GUID).GUID );
		
		var trg : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
	
		trg.AddField ( "localPosition", SerializeVector3 ( obj.transform.localPosition ) );
		trg.AddField ( "localEulerAngles", SerializeVector3 ( obj.transform.localEulerAngles ) );
		trg.AddField ( "localScale", SerializeVector3 ( obj.transform.localScale ) );
	
		trg.AddField ( "activation", obj.GetComponent(Trigger).activation.ToString() );
		trg.AddField ( "fireOnce", obj.GetComponent(Trigger).fireOnce );
		trg.AddField ( "events", SerializeEvents ( obj.GetComponent(Trigger).events ) );
	
		o.AddField ( "Trigger", trg );
	
		return o;
	
	// anything else
	} else {
		// components
		com = SerializeGameObjectComponents ( obj );
		o.AddField ( "components", com );
		
		// children
		chl = SerializeGameObjectChildren ( obj );
		o.AddField ( "children", chl );
		
		return o;
	}
}

// all children
static function SerializeGameObjectChildren ( obj : GameObject ) : JSONObject {
	var chl : JSONObject = new JSONObject (JSONObject.Type.ARRAY);
	
	for ( var i = 0; i < obj.transform.childCount; i++ ) {
		var c = obj.transform.GetChild ( i ).gameObject;
		
		var o = SerializeGameObject ( c );
		chl.Add ( o );
	}
	
	return chl;
}

// all components
static function SerializeGameObjectComponents ( obj : GameObject ) : JSONObject {
	var com : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
	
	for ( var c : Component in obj.GetComponents(Component) ) {
		if ( c.GetType() == Light ) {
			com.AddField ( "Light", SerializeLight ( c as Light ) );
		} else if ( c.GetType() == Transform ) {
			com.AddField ( "Transform", SerializeTransform ( c as Transform ) );
		}
	}
	
	return com;
}

// game events
static function SerializeEvents ( events : List.< GameEvent > ) : JSONObject {
	var evt : JSONObject = new JSONObject (JSONObject.Type.ARRAY);
	
	for ( var e : GameEvent in events ) {
		evt.Add ( SerializeGameEvent ( e ) );
	}
	
	return evt;
}

// path
static function SerializePath ( nodes : List.< PathNode > ) : JSONObject {
	var pth : JSONObject = new JSONObject (JSONObject.Type.ARRAY);
	
	for ( var p : PathNode in nodes ) {
		pth.Add ( SerializePathNode ( p ) );
	}
	
	return pth;
}

// inventory
static function SerializeInventory ( entries : InventoryEntry[] ) : JSONObject {
	var inv : JSONObject = new JSONObject (JSONObject.Type.ARRAY);
	
	for ( var e : InventoryEntry in entries ) {
		if ( e ) {
			var entry : JSONObject = JSONObject (JSONObject.Type.OBJECT );
			entry.AddField ( "prefabPath", e.prefabPath );
			inv.Add ( entry );
		}
	}
	
	return inv;
}


////////////////////
// Serialize components individually
////////////////////
// GameEvent
static function SerializeGameEvent ( event : GameEvent ) : JSONObject {
	var evt : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
	
	evt.AddField ( "delay", event.delay );
	evt.AddField ( "condition", event.condition );
	evt.AddField ( "conditionBool", event.conditionBool );
			
	switch ( event.type ) {
		case GameEvent.eEventType.Animation:
			evt.AddField ( "type", "Animation" );
			evt.AddField ( "animationObject", event.animationObject );
			evt.AddField ( "animationType", event.animationType );
			evt.AddField ( "animationVector", SerializeVector3 ( event.animationVector ) );
			break;
		
		case GameEvent.eEventType.Quest:
			evt.AddField ( "type", "Quest" );
			evt.AddField ( "questID", event.questID );
			evt.AddField ( "questAction", event.questAction );
			break;
			
		case GameEvent.eEventType.NextPath:
			evt.AddField ( "type", "NextPath" );
			evt.AddField ( "nextPathName", event.nextPathName );
			break;
			
		case GameEvent.eEventType.SetFlag:
			evt.AddField ( "type", "SetFlag" );
			evt.AddField ( "flagName", event.flagName );
			evt.AddField ( "flagBool", event.flagBool );
			break;
			
		case GameEvent.eEventType.Travel:
			evt.AddField ( "type", "Travel" );
			evt.AddField ( "travelMap", event.travelMap );
			evt.AddField ( "travelSpawnPoint", event.travelSpawnPoint );
			break;
	
	}
	
	return evt;
}

// PathNode
static function SerializePathNode ( p : PathNode ) : JSONObject {
	var node : JSONObject = JSONObject (JSONObject.Type.OBJECT);
	
	// position
	node.AddField ( "position", SerializeVector3 ( p.position ) );	
	
	// duration
	node.AddField ( "duration", p.duration );
	
	// running
	node.AddField ( "running", p.running );
	
	return node;
}

// SurfacePlane
static function SerializeSurfacePlane ( p : SurfacePlane ) : JSONObject {
	var plane : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
	var vertices : JSONObject = new JSONObject ( JSONObject.Type.ARRAY );
	
	for ( var v : Vector3 in p.vertices ) {
		vertices.Add ( SerializeVector3 ( v ) );
	}
	
	plane.AddField ( "vertices", vertices );
	plane.AddField ( "index", SerializeVector2 ( p.index ) );
	plane.AddField ( "position", SerializeVector3 ( p.position ) );
	
	return plane;
}

// Transform
static function SerializeTransform ( c : Transform ) : JSONObject {
	var component : JSONObject = JSONObject (JSONObject.Type.OBJECT); 
	var pos : JSONObject = new JSONObject (JSONObject.Type.ARRAY);
	var rot : JSONObject = new JSONObject (JSONObject.Type.ARRAY);
	var scl : JSONObject = new JSONObject (JSONObject.Type.ARRAY);
	
	// position
	component.AddField ( "localPosition", SerializeVector3 ( c.localPosition ) );
	
	// rotation
	component.AddField ( "localEulerAngles", SerializeVector3 ( c.localEulerAngles ) );
	
	// scale
	component.AddField ( "localScale", SerializeVector3 ( c.localScale ) );
	
	return component;
}

// Light
static function SerializeLight ( l : Light ) : JSONObject {
	var component : JSONObject = JSONObject (JSONObject.Type.OBJECT);
		
	// range
	component.AddField ( "range", l.range );
	
	// intensity
	component.AddField ( "intensity", l.intensity );
	
	// color
	component.AddField ( "color", SerializeColor ( l.color ) );
	
	return component;
}

// Color
static function SerializeColor ( c : Color ) : JSONObject {
	var color : JSONObject = new JSONObject (JSONObject.Type.ARRAY);
	
	color.Add ( c.r );
	color.Add ( c.g );
	color.Add ( c.b );
	color.Add ( c.a );

	return color;
}

// Vector3
static function SerializeVector3 ( v : Vector3 ) : JSONObject {
	var vector : JSONObject = new JSONObject (JSONObject.Type.ARRAY);
	
	vector.Add ( v.x );
	vector.Add ( v.y );
	vector.Add ( v.z );
	
	return vector;
}

// Vector2
static function SerializeVector2 ( v : Vector2 ) : JSONObject {
	var vector : JSONObject = new JSONObject (JSONObject.Type.ARRAY);
	
	vector.Add ( v.x );
	vector.Add ( v.y );
	
	return vector;
}

// Mesh
static function SerializeMesh ( m : Mesh ) : JSONObject {
	var mesh : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
	var vertices : JSONObject = new JSONObject ( JSONObject.Type.ARRAY );
	var uv : JSONObject = new JSONObject ( JSONObject.Type.ARRAY );
	var triangles : JSONObject = new JSONObject ( JSONObject.Type.ARRAY );
	
	for ( var v : Vector3 in m.vertices ) {
		vertices.Add ( SerializeVector3 ( v ) );
	}
	
	for ( var u : Vector2 in m.uv ) {
		uv.Add ( SerializeVector2 ( u ) );
	}
	
	for ( var t : int in m.triangles ) {
		triangles.Add ( t );
	}
	
	mesh.AddField ( "vertices", vertices );
	mesh.AddField ( "uv", uv );
	mesh.AddField ( "triangles", triangles );
	
	return mesh;
}

////////////////////
// Serialize conversation
////////////////////
static function SerializeConversation ( c : List.< EditorConversationEntry > ) : JSONObject {
	var conversation : JSONObject = new JSONObject (JSONObject.Type.ARRAY);
	
	for ( var e : EditorConversationEntry in c ) {
		var gLine : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
		var entry : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
		entry.AddField ( "type", e.type.selectedOption );		
		 
		// line
		if ( e.type.selectedOption == "Line" ) {
			var l = e.line;
						
			entry.AddField ( "condition", l.condition.text );
			entry.AddField ( "conditionBool", l.conditionBool.isChecked );
			entry.AddField ( "consequence", l.consequence.text );
			entry.AddField ( "consequenceBool", l.consequenceBool.isChecked );
			entry.AddField ( "speaker", l.speaker.selectedOption );
			entry.AddField ( "line", l.line.text );
			entry.AddField ( "endConvo", l.endConvo.selectedOption );			
		
		// group
		} else if ( e.type.selectedOption == "Group" ) {
			var g = e.group;
			var options : JSONObject = new JSONObject (JSONObject.Type.ARRAY);
			
			for ( var i = 0; i < g.container.childCount; i++ ) {
				var gl : EditorConversationGroupLine = g.container.GetChild ( i ).gameObject.GetComponent ( EditorConversationGroupLine );
				var groupLine : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
																																																																																																																																																																															
				groupLine.AddField ( "consequence", gl.consequence.text );
				groupLine.AddField ( "consequenceBool", gl.consequenceBool.isChecked );
				groupLine.AddField ( "line", gl.line.text );
				groupLine.AddField ( "endConvo", gl.endConvo.selectedOption );
				
				options.Add ( groupLine );
			}
			
			entry.AddField ( "condition", g.condition.text );
			entry.AddField ( "conditionBool", l.conditionBool.isChecked );
			entry.AddField ( "groupType", g.groupType.selectedOption );
			entry.AddField ( "options", options );
			entry.AddField ( "speaker", g.speaker.selectedOption );
		
		// dialog box
		} else if ( e.type.selectedOption == "DialogBox" ) {
			var d = e.dialogBox;
			
			entry.AddField ( "canCancel", d.canCancel.isChecked.ToString() );
			entry.AddField ( "useInput", d.useInput.isChecked.ToString() );
			entry.AddField ( "title", d.title.text );
			entry.AddField ( "instructions", d.instructions.text );
			
		}
		
		conversation.Add ( entry );
	}
	
	return conversation;
}


////////////////////
// Serialize quest
////////////////////
static function SerializeQuest ( q : Quest ) : JSONObject {
	var quest : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
	
	quest.AddField ( "id", q.id );
	quest.AddField ( "title", q.title );
	quest.AddField ( "desc", q.desc );
	quest.AddField ( "active", q.active );
	quest.AddField ( "isMainQuest", q.isMainQuest );
	quest.AddField ( "skillPoints", q.skillPoints );
	
	return quest;
}


////////////////////
// Serialize screenshot
////////////////////
static function SerializeScreenshot ( tex : Texture2D ) : String {
	var bytes = tex.EncodeToPNG();
	var encoded = Convert.ToBase64String ( bytes );
	
	return encoded;
}