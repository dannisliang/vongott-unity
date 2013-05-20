#pragma strict

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
		var newPfb : GameObject = Instantiate ( Resources.Load ( "Prefabs/" + pfb.GetField("path").str + "/" + pfb.GetField("id").str ) as GameObject );
		
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


// Transform
static function DeserializeTransform ( c : JSONObject, o : GameObject ) {
	var component : Transform = o.AddComponent ( Transform ); 
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
			
			convo.condition = c.GetField ( "condition" ).str;
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