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
	o.AddField ( "name", obj.name.Replace ( "(Clone)", "" ) );
	
	// check if prefab
	if ( obj.GetComponent(Prefab) ) {
		// guid
		o.AddField ( "GUID", obj.GetComponent(GUID).GUID );
		
		var pfb : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
		var tm : TextMesh = obj.GetComponentInChildren (TextMesh);
		var bk : Book = obj.GetComponent(Book);
		var dr : Door = obj.GetComponent(Door);
		var pc : Computer = obj.GetComponent(Computer);
		var tl : Terminal = obj.GetComponent(Terminal);
		var sc : SurveillanceCamera = obj.GetComponent(SurveillanceCamera);
		var kp : Keypad = obj.GetComponent(Keypad);
		var lp : LiftPanel = obj.GetComponentInChildren(LiftPanel);
		var tr : Trigger = obj.GetComponent(Trigger);
		
		pfb.AddField ( "path", obj.GetComponent(Prefab).path );
		pfb.AddField ( "id", obj.GetComponent(Prefab).id );
		pfb.AddField ( "localScale", SerializeVector3 ( obj.transform.localScale ) );
		pfb.AddField ( "localPosition", SerializeVector3 ( obj.transform.localPosition ) );
		pfb.AddField ( "localEulerAngles", SerializeVector3 ( obj.transform.localEulerAngles ) );
		
		if ( tm != null ) {
			pfb.AddField ( "text", tm.text );
		}
		
		if ( bk != null ) {
			pfb.AddField ( "bookText", SerializeMultiLineString ( bk.content ) );
		}
		
		if ( dr != null ) {
			pfb.AddField ( "doorLocked", dr.locked );
			pfb.AddField ( "doorClosed", dr.closed );
			pfb.AddField ( "doorLockLevel", dr.lockLevel );
		}
		
		if ( pc != null ) {
			pfb.AddField ( "computer", SerializeComputer ( pc ) );
		}
		
		if ( tl != null ) {
			pfb.AddField ( "terminal", SerializeTerminal ( tl ) );
		}
		
		if ( sc != null ) {
			pfb.AddField ( "surveillanceCamera", SerializeSurveillanceCamera ( sc ) );
		}
		
		if ( kp != null ) {
			pfb.AddField ( "keypad", SerializeKeypad ( kp ) );
		}
		
		if ( lp != null ) {
			pfb.AddField ( "liftPanel", SerializeLiftPanel ( lp ) );
		}
	
		if ( tr != null ) {
			pfb.AddField ( "trigger", SerializeTrigger ( tr ) );
		}

		if ( obj.GetComponent(Prefab).materialPath != "" && obj.GetComponent(Prefab).canChangeMaterial ) {
			pfb.AddField ( "materialPath", obj.GetComponent(Prefab).materialPath );
		}
		
		o.AddField ( "Prefab", pfb );
		
		return o;
	
	// check if combined mesh
	} else if ( obj.GetComponent(CombinedMesh) ) {
		var smh : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
		
		smh.AddField ( "mesh", SerializeMesh ( obj.GetComponent(MeshFilter).sharedMesh ) );
		smh.AddField ( "material", "Editor/editor_checker" );
		smh.AddField ( "localScale", SerializeVector3 ( obj.transform.localScale ) );
		smh.AddField ( "localPosition", SerializeVector3 ( obj.transform.localPosition ) );
		smh.AddField ( "localEulerAngles", SerializeVector3 ( obj.transform.localEulerAngles ) );
		
		o.AddField ( "CombinedMesh", smh );
		
		return o;
	
	// check if imported mesh
	} else if ( obj.GetComponent(ImportedMesh) ) {
		var imh : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
		
		imh.AddField ( "mesh", SerializeMesh ( obj.GetComponent(MeshFilter).sharedMesh ) );
		imh.AddField ( "material", "Editor/editor_checker" );
		imh.AddField ( "localScale", SerializeVector3 ( obj.transform.localScale ) );
		imh.AddField ( "localPosition", SerializeVector3 ( obj.transform.localPosition ) );
		imh.AddField ( "localEulerAngles", SerializeVector3 ( obj.transform.localEulerAngles ) );
		
		o.AddField ( "ImportedMesh", imh );
		
		return o;
		
	// check if nav mesh
	} else if ( obj.GetComponent(OPNavMesh) ) {
		var nvm : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
		
		nvm.AddField ( "mesh", SerializeMesh ( obj.GetComponent(MeshFilter).sharedMesh ) );
		nvm.AddField ( "localScale", SerializeVector3 ( obj.transform.localScale ) );
		nvm.AddField ( "localPosition", SerializeVector3 ( obj.transform.localPosition ) );
		nvm.AddField ( "localEulerAngles", SerializeVector3 ( obj.transform.localEulerAngles ) );
		
		o.AddField ( "NavMesh", nvm );
		
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
		
	// check if wallet
	} else if ( obj.GetComponent(Wallet) ) {
		// guid
		o.AddField ( "GUID", obj.GetComponent(GUID).GUID );
		
		var wlt : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
		
		wlt.AddField ( "creditAmount", obj.GetComponent(Wallet).creditAmount );
		wlt.AddField ( "localScale", SerializeVector3 ( obj.transform.localScale ) );
		wlt.AddField ( "localPosition", SerializeVector3 ( obj.transform.localPosition ) );
		wlt.AddField ( "localEulerAngles", SerializeVector3 ( obj.transform.localEulerAngles ) );
		
		o.AddField ( "Wallet", wlt );
		
		return o;
		
	// check if actor
	} else if ( obj.GetComponent(Actor) ) {
		// guid
		o.AddField ( "GUID", obj.GetComponent(GUID).GUID );
		
		var act : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
		
		act.AddField ( "model", obj.GetComponent(Actor).model );
		act.AddField ( "affiliation", obj.GetComponent(Actor).affiliation.ToString() );
		act.AddField ( "mood", obj.GetComponent(Actor).mood );
		
		act.AddField ( "pathType", obj.GetComponent(Actor).pathType.ToString() );
		act.AddField ( "path", SerializePath ( obj.GetComponent(Actor).path ) );
		act.AddField ( "inventory", SerializeInventory ( obj.GetComponent(Actor).inventory ) );
				
		act.AddField ( "conversationTree", obj.GetComponent(Actor).conversationTree );
		
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
		srf.AddField ( "foliagePath", obj.GetComponent(Surface).foliagePath );
		srf.AddField ( "foliageDensity", obj.GetComponent(Surface).foliageDensity );
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
		
		var trg : JSONObject = SerializeTrigger ( obj.GetComponent(Trigger) );
	
		trg.AddField ( "localPosition", SerializeVector3 ( obj.transform.localPosition ) );
		trg.AddField ( "localEulerAngles", SerializeVector3 ( obj.transform.localEulerAngles ) );
		trg.AddField ( "localScale", SerializeVector3 ( obj.transform.localScale ) );
	
		o.AddField ( "Trigger", trg );
	
		return o;
	
	// check navnode
	} else if ( obj.GetComponent(OPWayPoint) ) {		
		var nav : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
	
		nav.AddField ( "localPosition", SerializeVector3 ( obj.transform.localPosition ) );
	
		o.AddField ( "NavNode", nav );
	
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
	if ( entries == null ) { return null; }
	
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

// multi-line text
static function SerializeMultiLineString ( str : String ) : JSONObject {
	var lines : JSONObject = new JSONObject (JSONObject.Type.ARRAY);
	var array : String[] = str.Split ( "\n"[0] );

	for ( var s : String in array ) {
		lines.Add ( s );
	}

	return lines;
}

// nav mesh
static function SerializeNavNodes ( nodes : OPNode[] ) : JSONObject {
	var sNodes : JSONObject = new JSONObject ( JSONObject.Type.ARRAY );
	
	for ( var node : OPNode in nodes ) {
		var sNode : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
		var sNeighbors : JSONObject = new JSONObject ( JSONObject.Type.ARRAY );
		
		for ( var n : OPNode in node.neighbors ) {
			sNeighbors.Add ( System.Array.IndexOf ( nodes, n ) );
		}
		
		sNode.AddField ( "position", SerializeVector3 ( node.position ) );
		sNode.AddField ( "neighbors", sNeighbors );
	
		sNodes.Add ( sNode );
	}
	
	return sNodes;
}


////////////////////
// Serialize components individually
////////////////////
// Trigger
static function SerializeTrigger ( tr : Trigger ) : JSONObject {
	var trigger : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
	var events : JSONObject = new JSONObject (JSONObject.Type.ARRAY);

	trigger.AddField ( "activation", tr.activation.ToString() );
	trigger.AddField ( "fireOnce", tr.fireOnce );

	for ( var i : int = 0; i < tr.events.Count; i++ ) {
		events.Add ( tr.events[i] );
	}

	trigger.AddField ( "events", events );

	return trigger;
}

// LiftPanel
static function SerializeLiftPanel ( lp : LiftPanel ) : JSONObject {
	var liftPanel : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
	var allDestinations : JSONObject = new JSONObject (JSONObject.Type.ARRAY);

	for ( var v : Vector3 in lp.allDestinations ) {
		allDestinations.Add ( SerializeVector3 ( v ) );
	}

	liftPanel.AddField ( "allDestinations", allDestinations );
	
	return liftPanel;
}

// Keypad
static function SerializeKeypad ( kp : Keypad ) : JSONObject {
	var keypad : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
	
	keypad.AddField ( "passCode", kp.passCode );
	keypad.AddField ( "difficulty", kp.difficulty );
	keypad.AddField ( "doorGUID", kp.doorGUID );
	
	return keypad;
}

// Terminal
static function SerializeTerminal ( t : Terminal ) : JSONObject {
	var term : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
	var guids : JSONObject = new JSONObject (JSONObject.Type.ARRAY);
	
	term.AddField ( "passCode", t.passCode );
	term.AddField ( "difficulty", t.difficulty );
	
	for ( var s : String in t.cameraGUIDs ) {
		guids.Add ( s );
	}
	
	term.AddField ( "cameraGUIDs", guids );
	
	return term;
}

// SurveillanceCamera
static function SerializeSurveillanceCamera ( sc : SurveillanceCamera ) : JSONObject {
	var cam : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
	
	cam.AddField ( "target", sc.target.ToString() );
	
	if ( sc.doorGUID != "" ) {
		cam.AddField ( "doorGUID", sc.doorGUID );
	}
	
	return cam;
}

// Computer
static function SerializeComputer ( c : Computer ) : JSONObject {
	var com : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
	
	com.AddField ( "domain", c.domain );
	com.AddField ( "validAccounts", SerializeAccounts ( c.validAccounts ) );
	
	return com;
}

static function SerializeAccounts ( accounts : List.<Computer.Account> ) : JSONObject {
	var list : JSONObject = new JSONObject (JSONObject.Type.ARRAY);

	for ( var acc : Computer.Account in accounts ) {
		list.Add ( SerializeAccount ( acc ) );
	}

	return list;
}

static function SerializeAccount ( account : Computer.Account ) : JSONObject {
	var acc : JSONObject = new JSONObject (JSONObject.Type.OBJECT);

	acc.AddField ( "username", account.username );
	acc.AddField ( "password", account.password );
	acc.AddField ( "messages", SerializeMultiLineString ( account.messages ) );
	acc.AddField ( "todoList", SerializeMultiLineString ( account.todoList ) );
	acc.AddField ( "openFile", SerializeMultiLineString ( account.openFile ) );
	acc.AddField ( "openFileName", account.openFileName );
	acc.AddField ( "wallpaper", account.wallpaper );

	return acc;
}

// GameEvent
static function SerializeGameEvent ( event : GameEvent ) : JSONObject {
	var evt : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
	
	evt.AddField ( "id", event.id );
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
			
		case GameEvent.eEventType.ToggleDoor:
			evt.AddField ( "type", "ToggleDoor" );
			evt.AddField ( "toggleDoorName", event.toggleDoorName );
			evt.AddField ( "toggleDoorBool", event.toggleDoorBool );
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
			
		case GameEvent.eEventType.GiveItem:
			evt.AddField ( "type", "GiveItem" );
			evt.AddField ( "giveItem", event.giveItem );
			evt.AddField ( "giveCost", event.giveCost );
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
static function DeserializeConversationNode ( obj : EditorConversationNode ) : JSONObject {
	var node : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
	var connectedTo : JSONObject = new JSONObject (JSONObject.Type.ARRAY);

	node.AddField ( "rootIndex", obj.rootIndex );
	node.AddField ( "nodeIndex", obj.nodeIndex ); 
	node.AddField ( "type", obj.selectedType );

	switch ( obj.selectedType ) {
		case "Speak":
			var lines : JSONObject = new JSONObject (JSONObject.Type.ARRAY);
			
			for ( var l : int = 0; l < obj.speak.lines.childCount; l++ ) {
				lines.Add ( obj.speak.lines.GetChild(l).GetComponent(EditorConversationNodeLine).line.text );
			}
			
			node.AddField ( "speaker", obj.speak.speakerPopUp.selectedOption );
			node.AddField ( "lines", lines );
			break;
		
		case "GameEvent":
			node.AddField ( "event", obj.gameEvent.event.text );
			break;
		
		case "Condition":
			node.AddField ( "condition", obj.condition.flag.text );
			break;
			
		case "Consequence":
			node.AddField ( "consequence", obj.consequence.flag.text );
			node.AddField ( "consequenceBool", obj.consequence.bool.selectedOption == "True" );
			break;
			
		case "EndConvo":
			node.AddField ( "action", obj.endConvo.action.selectedOption );
			node.AddField ( "nextRoot", int.Parse(obj.endConvo.nextRoot.selectedOption) );
			break;
			
		case "Exchange":
			node.AddField ( "item", obj.exchange.item.text );
			node.AddField ( "credits", int.Parse(obj.exchange.credits.text) );
			break;
	
	}

	for ( var i : int = 0; i < obj.connectedTo.Length; i++ ) {
		if ( obj.activeOutputs[i] && obj.connectedTo[i] ) {
			connectedTo.Add ( DeserializeConversationNode ( obj.connectedTo[i] ) );
		}
	}

	node.AddField ( "connectedTo", connectedTo );

	return node;
}

static function SerializeConversationRootNode ( obj : EditorConversationRootNode ) : JSONObject {
	var rootNode : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
	
	rootNode.AddField ( "auto", obj.auto.isTicked );
	
	if ( obj.connectedTo ) {
		rootNode.AddField ( "connectedTo", DeserializeConversationNode ( obj.connectedTo ) );
	}
	
	return rootNode;
}

static function SerializeConversationTree ( obj : Transform ) : JSONObject {
	var conversationTree : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
	var rootNodes : JSONObject = new JSONObject (JSONObject.Type.ARRAY);
	
	for ( var i : int = 0; i < obj.childCount; i++ ) {
		rootNodes.Add ( SerializeConversationRootNode ( obj.GetChild(i).GetComponent ( EditorConversationRootNode ) ) );
	}
	
	conversationTree.AddField ( "rootNodes", rootNodes ); 
	
	return conversationTree;
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
