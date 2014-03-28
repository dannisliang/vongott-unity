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
		
		var newPfb : GameObject = Instantiate ( Resources.Load ( path ) as GameObject );
		var tm : TextMesh = newPfb.GetComponentInChildren ( TextMesh );
		var bk : Book = newPfb.GetComponent(Book);
		var dr : Door = newPfb.GetComponent(Door);
		var pc : Computer = newPfb.GetComponent(Computer);
		var tl : Terminal = newPfb.GetComponent(Terminal);
		var sc : SurveillanceCamera = newPfb.GetComponent(SurveillanceCamera);
		var kp : Keypad = newPfb.GetComponent(Keypad);
		var lp : LiftPanel = newPfb.GetComponentInChildren(LiftPanel);
		var tr : Trigger = newPfb.GetComponent(Trigger);
		
		newPfb.GetComponent(Prefab).id = pfb.GetField("id").str;
		newPfb.GetComponent(Prefab).path = pfb.GetField("path").str;
		newPfb.transform.localScale = DeserializeVector3 ( pfb.GetField("localScale") );
		newPfb.transform.localPosition = DeserializeVector3 ( pfb.GetField("localPosition") );
		newPfb.transform.localEulerAngles = DeserializeVector3 ( pfb.GetField("localEulerAngles") );
		
		if ( tm != null && pfb.HasField ( "text" ) ) {
			tm.text = pfb.GetField ( "text" ).str;
		}
		
		if ( bk != null && pfb.HasField ( "bookText" ) ) {
			bk.content = DeserializeMultiLineString ( pfb.GetField ( "bookText" ) );
		}
		
		if ( dr != null ) {
			if ( pfb.HasField ( "doorLocked" ) ) { dr.locked = pfb.GetField ( "doorLocked" ).b; }
			if ( pfb.HasField ( "doorClosed" ) ) { dr.closed = pfb.GetField ( "doorClosed" ).b; }
			dr.lockLevel = pfb.GetField ( "doorLockLevel" ).n;
		}
		
		if ( pc != null && pfb.HasField ( "computer" ) ) {
			DeserializeComputer ( pfb.GetField ( "computer" ), pc );
		}
		
		if ( tl != null && pfb.HasField ( "terminal" ) ) {
			DeserializeTerminal ( pfb.GetField ( "terminal" ), tl );
		}
		
		if ( sc != null && pfb.HasField ( "surveillanceCamera" ) ) {
			DeserializeSurveillanceCamera ( pfb.GetField ( "surveillanceCamera" ), sc );
		}
		
		if ( kp != null && pfb.HasField ( "keypad" ) ) {
			DeserializeKeypad ( pfb.GetField ( "keypad" ), kp );
		}
		
		if ( lp != null && pfb.HasField ( "liftPanel" ) ) {
			DeserializeLiftPanel ( pfb.GetField ( "liftPanel" ), lp );
		}
	
		if ( tr != null && pfb.HasField ( "trigger" ) ) {
			DeserializeTrigger ( pfb.GetField ( "trigger" ), tr );
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
	
	// check if combined mesh
	} else if ( obj.HasField("CombinedMesh") ) {
		var cbm : JSONObject = obj.GetField("CombinedMesh");
		var newCbm : GameObject = Instantiate ( Resources.Load ( "Prefabs/Editor/CombinedMesh" ) as GameObject );
		
		newCbm.GetComponent(MeshFilter).sharedMesh = DeserializeMesh ( cbm.GetField("mesh") );
		newCbm.GetComponent(MeshCollider).sharedMesh = newCbm.GetComponent(MeshFilter).sharedMesh;
		newCbm.GetComponent(MeshRenderer).sharedMaterial = Resources.Load ( "Materials/" + cbm.GetField("material").str ) as Material;
		
		newCbm.transform.localScale = DeserializeVector3 ( cbm.GetField("localScale") );
		newCbm.transform.localPosition = DeserializeVector3 ( cbm.GetField("localPosition") );
		newCbm.transform.localEulerAngles = DeserializeVector3 ( cbm.GetField("localEulerAngles") );
		
		newCbm.name = obj.GetField("name").str;
		
		return newCbm;
		
	// check if imported mesh
	} else if ( obj.HasField("ImportedMesh") ) {
		var imp : JSONObject = obj.GetField("ImportedMesh");
		var newImp : GameObject = new GameObject ( obj.GetField("name").str, ImportedMesh, MeshFilter, MeshCollider, MeshRenderer );
		
		newImp.GetComponent(MeshFilter).sharedMesh = DeserializeMesh ( imp.GetField("mesh") );
		newImp.GetComponent(MeshCollider).sharedMesh = newImp.GetComponent(MeshFilter).sharedMesh;
		newImp.GetComponent(MeshRenderer).sharedMaterial = Resources.Load ( "Materials/" + imp.GetField("material").str ) as Material;
		
		newImp.transform.localScale = DeserializeVector3 ( imp.GetField("localScale") );
		newImp.transform.localPosition = DeserializeVector3 ( imp.GetField("localPosition") );
		newImp.transform.localEulerAngles = DeserializeVector3 ( imp.GetField("localEulerAngles") );
				
		return newImp;
		
	// check if nav mesh
	} else if ( obj.HasField("NavMesh") ) {
		var nvm : JSONObject = obj.GetField("NavMesh");
		var newNvm : GameObject = new GameObject ( obj.GetField("name").str, OPNavMesh, MeshFilter, MeshCollider, MeshRenderer );
		
		newNvm.GetComponent(MeshFilter).sharedMesh = DeserializeMesh ( nvm.GetField("mesh") );
		newNvm.GetComponent(MeshCollider).sharedMesh = newNvm.GetComponent(MeshFilter).sharedMesh;
		newNvm.GetComponent(MeshRenderer).sharedMaterial = Resources.Load ( "Materials/Editor/editor_navmesh" ) as Material;
		
		newNvm.transform.localScale = DeserializeVector3 ( nvm.GetField("localScale") );
		newNvm.transform.localPosition = DeserializeVector3 ( nvm.GetField("localPosition") );
		newNvm.transform.localEulerAngles = DeserializeVector3 ( nvm.GetField("localEulerAngles") );
				
		return newNvm;

	// check if lightsource
	} else if ( obj.HasField("LightSource") ) {
		var lgt : JSONObject = obj.GetField("LightSource");
		var newObj : GameObject;
		var prefabPath : String = "Prefabs/Editor/light_source";
		
		if ( lgt.HasField ("prefabPath") && lgt.GetField ("prefabPath").str != "" ) {
			prefabPath = lgt.GetField ("prefabPath").str;
		}
		
		newObj = Instantiate ( Resources.Load ( prefabPath ) as GameObject );

		newObj.GetComponent(LightSource).SetRange ( lgt.GetField ("range").n );
		if ( lgt.HasField ("type") ) { newObj.GetComponent(LightSource).SetType ( lgt.GetField ("type").str ); }
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
	
	// check if wallet
	} else if ( obj.HasField("Wallet") ) {
		var wlt : JSONObject = obj.GetField("Wallet");
		var newWlt : GameObject;
		
		newWlt = Instantiate ( Resources.Load ( "Items/Misc/wallet" ) as GameObject );

		Debug.Log ( "Deserializer | Instantiate wallet" );

		newWlt.GetComponent(Wallet).creditAmount = wlt.GetField ("creditAmount").n;
		
		newWlt.transform.localScale = DeserializeVector3 ( wlt.GetField("localScale") );
		newWlt.transform.localPosition = DeserializeVector3 ( wlt.GetField("localPosition") );
		newWlt.transform.localEulerAngles = DeserializeVector3 ( wlt.GetField("localEulerAngles") );
		
		newWlt.name = obj.GetField("name").str;
		
		// GUID
		if ( obj.HasField ( "GUID" ) ) {
			newWlt.GetComponent(GUID).GUID = obj.GetField ( "GUID" ).str;
		}
	
		return newWlt;
	
	// check if actor
	} else if ( obj.HasField("Actor") ) {
		var act : JSONObject = obj.GetField("Actor");
		var cnv : JSONObject = obj.GetField("Conversation");
		var newAct : GameObject;
		
		newAct = Instantiate ( Resources.Load ( "Actors/" + act.GetField("model").str ) as GameObject );
		newAct.GetComponent(Actor).SetAffiliation ( act.GetField ( "affiliation" ).str );
		newAct.GetComponent(Actor).SetMood ( act.GetField ( "mood" ).str );
		
		newAct.GetComponent(Actor).SetPathType ( act.GetField ( "pathType" ).str );
		newAct.GetComponent(Actor).path = DeserializePath ( act.GetField ( "path" ) );
		newAct.GetComponent(Actor).inventory = DeserializeInventory ( act.GetField ( "inventory" ) );
		if ( act.HasField ( "conversationTree" ) ) { newAct.GetComponent(Actor).conversationTree = act.GetField ( "conversationTree" ).str; }
		
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
		
		DeserializeTrigger ( trg, newTrg.GetComponent(Trigger) );
		
		newTrg.name = obj.GetField("name").str;
		
		// GUID
		if ( obj.HasField ( "GUID" ) ) {
			newTrg.GetComponent(GUID).GUID = obj.GetField ( "GUID" ).str;
		}
		
		return newTrg;
		
	// check navnode
	} else if ( obj.HasField("NavNode") ) {
		var nav : JSONObject = obj.GetField("NavNode");
		
		var newNav : GameObject = Instantiate ( Resources.Load ( "Prefabs/Editor/nav_node" ) as GameObject );
		newNav.transform.localPosition = DeserializeVector3 ( nav.GetField("localPosition") );
		newNav.layer = 15;
		
		newNav.name = obj.GetField("name").str;
				
		return newNav;
	
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
	var obj : JSONObject = new JSONObject ( s, false );
	var o : GameObject = DeserializeGameObjectFromJSON ( obj );
	
	// camera
	if ( obj.HasField ( "Camera" ) && Camera.main.GetComponent ( EditorCamera ) ) {
		var cam : JSONObject = obj.GetField("Camera");
		
		Camera.main.transform.localPosition = DeserializeVector3 ( cam.GetField ( "localPosition" ) );
		Camera.main.transform.localEulerAngles = DeserializeVector3 ( cam.GetField ( "localEulerAngles" ) );
		Camera.main.GetComponent(EditorCamera).RefreshFixPoint ( false );
	}
	
	// nav nodes
	if ( obj.HasField ( "NavNodes" ) ) {
		if ( EditorCore.running ) {
			EditorCore.navNodes = DeserializeNavNodes ( obj.GetField ( "NavNodes" ) );
		} else {
			GameCore.GetInstance().GetComponent(OPScanner).SetMap ( DeserializeNavNodes ( obj.GetField ( "NavNodes" ) ) );
		}
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
	var obj : JSONObject = new JSONObject ( s, false );
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
	if ( !ety.list ) { return null; }
	
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

// multi-line text
static function DeserializeMultiLineString ( lines : JSONObject ) : String {
	var newString : String = "";

	for ( var o : Object in lines.list ) {
		newString += (o as JSONObject).str + "\n";
	}

	return newString;
}

// .obj file
static function DeserializeOBJ ( lines : String[] ) : Mesh {
	var mesh : Mesh = new Mesh ();
	var vertices : List.< Vector3 > = new List.< Vector3 > ();
	var uvs : List.< Vector2 > = new List.< Vector2 > ();
	var triangles : List.< int > = new List.< int > ();
	
	for ( var i : int = 0; i < lines.Length; i++ ) {
		var group : String[] = lines[i].Split ( " "[0] );
		
		// Vertices
		if ( group[0] == "v" ) {
			var v3 : Vector3 = Vector3.zero;
			
			v3.x = float.Parse(group[1]);
			v3.y = float.Parse(group[2]);
			v3.z = float.Parse(group[3]);
			
			vertices.Add ( v3 );
		
		// UVs
		} else if ( group[0] == "vt" ) {
			var v2 : Vector2 = Vector2.zero;
		
			v2.x = float.Parse(group[1]);
			v2.y = float.Parse(group[2]);
		
			uvs.Add ( v2 );
			
		// Triangles
		} else if ( group[0] == "f" ) {
			var pair0 : String[] = group[1].Split ( "/"[0] );
			var pair1 : String[] = group[2].Split ( "/"[0] );
			var pair2 : String[] = group[3].Split ( "/"[0] );
		
			triangles.Add ( int.Parse ( pair0[0] ) );
			triangles.Add ( int.Parse ( pair1[0] ) );
			triangles.Add ( int.Parse ( pair2[0] ) );
		}
	}
	
	mesh.vertices = vertices.ToArray();
	mesh.uv = uvs.ToArray();
	mesh.triangles = triangles.ToArray();
	
	return mesh;
}

// nav mesh
static function DeserializeNavNodes ( sNodes : JSONObject ) : OPNode[] {
	var nodes : OPNode[] = new OPNode[sNodes.list.Count];
	
	// Init nodes
	for ( var i : int = 0; i < nodes.Length; i++ ) {
		var sNode : JSONObject = sNodes.list[i] as JSONObject;
		
		nodes[i] = new OPNode ();
		nodes[i].position = DeserializeVector3 ( sNode.GetField ( "position" ) );
	}
	
	// Get neighbours
	for ( i = 0; i < nodes.Length; i++ ) {
		for ( var n : Object in (sNodes.list[i] as JSONObject).GetField ( "neighbors" ).list ) {
			nodes[i].neighbors.Add ( nodes [ (n as JSONObject).n ] );
		}
	}
	
	return nodes;
}

////////////////////
// Deserialize components individually
////////////////////
// Trigger
static function DeserializeTrigger ( o : JSONObject, tr : Trigger ) {
	tr.SetActivationType ( o.GetField ( "activation" ).str );
	tr.fireOnce = o.GetField ( "fireOnce" ).b;

	tr.events.Clear ();
	var events : List.< JSONObject > = o.GetField ( "events" ).list;
	for ( var i : int = 0; i < events.Count; i++ ) {
		tr.events.Add ( events[i].str );
	}
}

// LiftPanel
static function DeserializeLiftPanel ( o : JSONObject, lp : LiftPanel ) {
	lp.allDestinations.Clear ();
	
	for ( var v : Object in o.GetField("allDestinations").list ) {
		var j : JSONObject = v as JSONObject;
		
		lp.allDestinations.Add ( DeserializeVector3 ( j ) );
	}
}

// Keypad
static function DeserializeKeypad ( o : JSONObject, kp : Keypad ) {
	kp.passCode = o.GetField ( "passCode" ).str;
	kp.difficulty = o.GetField ( "difficulty" ).n;
	kp.doorGUID = o.GetField ( "doorGUID" ).str;
}

// Terminal
static function DeserializeTerminal ( o : JSONObject, t : Terminal ) {
	t.passCode = o.GetField ( "passCode" ).str;
	t.difficulty = o.GetField ( "difficulty" ).n;
	
	for ( var i = 0; i < o.GetField ( "cameraGUIDs" ).list.Count; i++ ) {
		t.cameraGUIDs[i] = o.GetField ( "cameraGUIDs" ).list[i].str;
	}
}

// SurveillanceCamera
static function DeserializeSurveillanceCamera ( o : JSONObject, c : SurveillanceCamera ) {
	c.SetTarget ( o.GetField ( "target" ).str );
	
	if ( o.HasField ( "doorGUID" ) ) {
		c.doorGUID = o.GetField ( "doorGUID" ).str;
	}
}

// Computer
static function DeserializeComputer ( o : JSONObject, c : Computer ) {
	c.domain = o.GetField ( "domain" ).str;
	c.validAccounts = DeserializeAccounts ( o.GetField ( "validAccounts" ) );
}

static function DeserializeAccounts ( accounts : JSONObject ) : List.<Computer.Account> {
	var list : List.<Computer.Account> = new List.<Computer.Account>();

	for ( var o : Object in accounts.list ) {
		list.Add ( DeserializeAccount ( o as JSONObject ) );
	}

	return list;
}

static function DeserializeAccount ( account : JSONObject ) : Computer.Account {
	var acc : Computer.Account = new Computer.Account ();

	acc.username = account.GetField ( "username" ).str;
	acc.password = account.GetField ( "password" ).str;
	acc.messages = DeserializeMultiLineString ( account.GetField ( "messages" ) );
	acc.todoList = DeserializeMultiLineString ( account.GetField ( "todoList" ) );
	acc.openFile = DeserializeMultiLineString ( account.GetField ( "openFile" ) );
	acc.openFileName = account.GetField ( "openFileName" ).str;
	acc.wallpaper = account.GetField ( "wallpaper" ).str;

	return acc;
}

// GameEvent
static function DeserializeGameEvent ( evt : JSONObject ) : GameEvent {
	var event : GameEvent = new GameEvent();
	
	if ( evt.HasField ( "id" ) ) { event.id = evt.GetField ( "id" ).str; }
	if ( evt.HasField ( "delay" ) ) { event.delay = evt.GetField ( "delay" ).n; }
	if ( evt.HasField ( "condition" ) ) { event.condition = evt.GetField ( "condition" ).str; }
	if ( evt.HasField ( "conditionBool" ) ) { event.conditionBool = evt.GetField ( "conditionBool" ).b; }
	
	if ( evt.HasField ( "type" ) ) {
		switch ( evt.GetField ( "type" ).str ) {
			case "Animation":
				event.type = GameEvent.eEventType.Animation;
				event.animationObject = evt.GetField ( "animationObject" ).str;
				event.animationType = evt.GetField ( "animationType" ).str;
				event.animationVector = DeserializeVector3 ( evt.GetField ( "animationVector" ) );
				break;
			
			case "Consequence":
				event.type = GameEvent.eEventType.Consequence;
				event.questID = evt.GetField ( "questID" ).str;
				event.questAction = evt.GetField ( "questAction" ).str;
				event.flagName = evt.GetField ( "flagName" ).str;
				event.flagBool = evt.GetField ( "flagBool" ).b;
				break;
				
			case "NextPath":
				event.type = GameEvent.eEventType.NextPath;
				event.nextPathName = evt.GetField ( "nextPathName" ).str;
				break;
			
			case "ToggleDoor":
				event.type = GameEvent.eEventType.ToggleDoor;
				event.toggleDoorName = evt.GetField ( "toggleDoorName" ).str;
				event.toggleDoorBool = evt.GetField ( "toggleDoorBool" ).b;
				break;
				
			case "Travel":
				event.type = GameEvent.eEventType.Travel;
				event.travelMap = evt.GetField ( "travelMap" ).str;
				event.travelSpawnPoint = evt.GetField ( "travelSpawnPoint" ).str;
				break;
				
			case "GiveItem":
				event.type = GameEvent.eEventType.GiveItem;
				event.giveItem = evt.GetField ( "giveItem" ).str;
				event.giveCost = evt.GetField ( "giveCost" ).n;
				break;
		
		}
	
		return event;
	
	} else {
		Debug.LogError ( "Deserializer | Not a valid GameEvent!" );
		
		return null;
	
	}
	
	
}

// PathNode
static function DeserializePathNode ( p : JSONObject ) : PathNode {
	var node : PathNode = new PathNode ();
	
	// position
	node.position = DeserializeVector3( p.GetField ( "position" ) );
	
	// duration
	node.duration = p.GetField ( "duration" ).n;
	
	// movement
	if ( p.HasField ( "movement" ) ) { node.SetMovement ( p.GetField ( "movement" ).str ); }
	
	return node;
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

// Mesh
static function DeserializeMesh ( m : JSONObject ) : Mesh {
	var mesh : Mesh = new Mesh();
	var vertices : Vector3[] = new Vector3 [ m.GetField ( "vertices" ).list.Count ];
	var uv : Vector2[] = new Vector2 [ m.GetField ( "uv" ).list.Count ];
	var triangles : int[] = new int [ m.GetField ( "triangles" ).list.Count ];
	
	var i : int = 0;
	
	for ( i = 0; i < vertices.Length; i++ ) {
		vertices[i] = DeserializeVector3 ( m.GetField ( "vertices" ).list[i] );
	}
	
	for ( i = 0; i < uv.Length; i++ ) {
		uv[i] = DeserializeVector2 ( m.GetField ( "uv" ).list[i] );
	}
	
	for ( i = 0; i < triangles.Length; i++ ) {
		triangles[i] = m.GetField ( "triangles" ).list[i].n;
	}
	
	mesh.vertices = vertices;
	mesh.uv = uv;
	mesh.triangles = triangles;
	
	return mesh;
}


////////////////////
// Conversations
////////////////////
// Node
static function DeserializeConversationNode ( n : JSONObject ) : ConversationNode {
	var node : ConversationNode = new ConversationNode();
	
	if ( !n ) { Debug.LogWarning ( "Deserializer | Loose end!" ); return; }
	
	if ( n.HasField ( "rootIndex" ) ) { node.rootIndex = n.GetField ( "rootIndex" ).n; }
	if ( n.HasField ( "nodeIndex" ) ) { node.nodeIndex = n.GetField ( "nodeIndex" ).n; }
	node.type = n.GetField ( "type" ).str;
	
	switch ( n.GetField ( "type" ).str ) {	
		case "Speak":
			node.speaker = n.GetField("speaker").str;
			for ( var i : int; i < n.GetField("lines").list.Count; i++ ) {
				node.lines.Add ( n.GetField("lines").list[i].str );
			}
			break;
			
		case "GameEvent":
			node.event = n.GetField("event").str;
			break;
			
		case "Condition":
			node.condition = n.GetField("condition").str;
			break;
			
		case "Consequence":
			node.consequence = n.GetField("consequence").str;
			node.consequenceBool = n.GetField("consequenceBool").b;
			if ( n.HasField ( "questName" ) ) { node.questName = n.GetField ( "questName" ).str; }
			if ( n.HasField ( "questAction" ) ) { node.questAction = n.GetField ( "questAction" ).str; }
			break;
			
		case "EndConvo":
			node.action = n.GetField("action").str;
			node.nextRoot = n.GetField("nextRoot").n;
			break;
			
		case "Exchange":
			node.credits = n.GetField("credits").n;
			node.item = n.GetField("item").str;
			break;

		case "Jump":
			node.jumpTo = n.GetField("jumpTo").n;
			break;
	}

	for ( var ni : int; ni < n.GetField("connectedTo").list.Count; ni++ ) {
		node.connectedTo.Add ( DeserializeConversationNode ( n.GetField("connectedTo").list[ni] ) );
	}
	
	return node;
}

// Tree
static function DeserializeConversationTree ( str : String ) : ConversationTree {
	var obj : JSONObject = new JSONObject ( str, false );	
	var tree : ConversationTree = new ConversationTree();
	
	for ( var rno : Object in obj.GetField("rootNodes").list ) {
		var rn : JSONObject = rno as JSONObject;
		var rootNode : ConversationRootNode = new ConversationRootNode ();
		
		rootNode.auto = rn.GetField("auto").b;
		rootNode.passive = ( rn.HasField("passive") ) ? rn.GetField("passive").b : false;
		
		rootNode.connectedTo = DeserializeConversationNode (rn.GetField("connectedTo"));	
		
		tree.rootNodes.Add ( rootNode );
	}
	
	return tree;
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
	var map : JSONObject =  new JSONObject ( input, false );
	var bytes : byte[] = Convert.FromBase64String ( map.GetField ( "screenshot" ).str );
	
	return bytes;
}

////////////////////
// Deserialize map data
////////////////////
static function DeserializeMapData ( input : String ) : MapData {
	var parsed : JSONObject = new JSONObject ( input, false );
	var json : JSONObject = parsed.GetField ( "mapData" );
	
	if ( !json ) {
		return null;
	}

	var data = new MapData ();

	data.name = json.GetField ( "name" ).str;
	data.musicCalm = json.GetField ( "musicCalm" ).str;
	data.musicAggressive = json.GetField ( "musicAggressive" ).str;
	data.ambientLight = DeserializeColor ( json.GetField ( "ambientLight" ) );
	data.fogEnabled = json.GetField ( "fogEnabled" ).b;
	data.fogColor = DeserializeColor ( json.GetField ( "fogColor" ) );
	data.fogDensity = json.GetField ( "fogDensity" ).n;

	return data;
}
