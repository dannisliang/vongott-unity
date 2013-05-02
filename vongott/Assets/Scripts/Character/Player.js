class Player extends MonoBehaviour {
	////////////////////
	// Prerequisites
	////////////////////
	// Inspector items
	var head : GameObject;
	var hand : GameObject;
	var torso : GameObject;
	var foot_r : GameObject;
	var foot_l : GameObject;
	
	
	////////////////////
	// Public functions
	////////////////////
	// Equip
	function Equip ( entry : Entry, equip : boolean ) {
		var slot : Equipment.Slots = entry.eqSlot;
		var target : GameObject;
		
		if ( slot == Equipment.Slots.Hands ) {
			target = hand;
		} else if ( slot == Equipment.Slots.Torso ) {
			target = torso;
		} else if ( slot == Equipment.Slots.Head ) {
			target = head;
		} else {
			target = foot_r;
		} 
		
		if ( equip ) {
			var instance : GameObject = new GameObject ( entry.title );
			var mf : MeshFilter = instance.AddComponent(MeshFilter);
			var mr : MeshRenderer = instance.AddComponent(MeshRenderer);
			
			mf.mesh = entry.mesh;
			mr.materials = entry.materials;
			
			instance.transform.parent = target.transform;
			instance.transform.localPosition = Vector3.zero;
			instance.transform.localEulerAngles = Vector3.zero;
		
			GameCore.Print ( "Player | item '" + entry.title + "' equipped" );
		} else {
			Destroy ( target.transform.FindChild( entry.title ).gameObject );
			
			GameCore.Print ( "Player | item '" + entry.title + "' unequipped" );
		}
	}
	
	// Install
	function Install ( entry : Entry, install : boolean ) {
		var slot : Upgrade.Slots = entry.upgSlot;
		
		if ( install ) {
			GameCore.Print ( "Player | installed upgrade " + entry.title + " in " + slot );
		} else {
			GameCore.Print ( "Player | uninstalled upgrade " + entry.title );
		}
	}
	
	function Start () {
		
	}
		
	function Update () {
	
	}
}