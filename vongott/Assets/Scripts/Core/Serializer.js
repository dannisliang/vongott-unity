#pragma strict

////////////////////
// Serialize GameObjects with their children and components
////////////////////
// GameObject
static function SerializeGameObject ( obj : GameObject ) : JSONObject {
	var o : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
	var chl : JSONObject;
	var com : JSONObject;
	
	// check if prefab
	if ( obj.GetComponent(Prefab) ) {
		var pfb : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
		
		pfb.AddField ( "path", obj.GetComponent(Prefab).path );
		pfb.AddField ( "id", obj.GetComponent(Prefab).id );
		pfb.AddField ( "localScale", SerializeVector3 ( obj.transform.localScale ) );
		pfb.AddField ( "localPosition", SerializeVector3 ( obj.transform.localPosition ) );
		pfb.AddField ( "localEulerAngles", SerializeVector3 ( obj.transform.localEulerAngles ) );
		
		o.AddField ( "Prefab", pfb );
		
		return o;
	
	// check if lightsource
	} else if ( obj.GetComponent(LightSource) ) {
		var lgt : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
		
		lgt.AddField ( "color", SerializeColor ( obj.GetComponent(LightSource).color ) );
		lgt.AddField ( "range", obj.GetComponent(LightSource).range );
		lgt.AddField ( "intensity", obj.GetComponent(LightSource).intensity );
		lgt.AddField ( "localPosition", SerializeVector3 ( obj.transform.localPosition ) );
		
		o.AddField ( "LightSource", lgt );
		
		return o;
		
	// check if actor
	} else if ( obj.GetComponent(Actor) ) {
		var act : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
		act.AddField ( "model", obj.GetComponent(Actor).model );
		act.AddField ( "affiliation", obj.GetComponent(Actor).affiliation );
		act.AddField ( "mood", obj.GetComponent(Actor).mood );
		act.AddField ( "localScale", SerializeVector3 ( obj.transform.localScale ) );
		act.AddField ( "localPosition", SerializeVector3 ( obj.transform.localPosition ) );
		act.AddField ( "localEulerAngles", SerializeVector3 ( obj.transform.localEulerAngles ) );
		
		var cnv : JSONObject = new JSONObject (JSONObject.Type.OBJECT);
		cnv.AddField ( "chapter", obj.GetComponent(Conversation).chapter );
		cnv.AddField ( "scene", obj.GetComponent(Conversation).scene );
		cnv.AddField ( "actorName", obj.GetComponent(Conversation).actorName );
		
		o.AddField ( "Actor", act );
		o.AddField ( "Conversation", cnv );
		
		return o;

	}
	
	// name
	o.AddField ( "name", obj.name );
		
	// components
	com = SerializeGameObjectComponents ( obj );
	o.AddField ( "components", com );
	
	// children
	chl = SerializeGameObjectChildren ( obj );
	o.AddField ( "children", chl );
	
	return o;
}

// all children
static function SerializeGameObjectChildren ( obj : GameObject ) : JSONObject {
	var chl : JSONObject = new JSONObject (JSONObject.Type.ARRAY);
	
	for ( var i = 0; i < obj.transform.GetChildCount(); i++ ) {
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


////////////////////
// Serialize components individually
////////////////////
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