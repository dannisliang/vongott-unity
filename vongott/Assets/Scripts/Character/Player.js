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
	function Equip ( entry : Entry, equip : boolean ) {
		var slot : Item.EquipmentSlots = entry.eqSlot;
		var target : GameObject;
		
		if ( slot == Item.EquipmentSlots.Hands ) {
			target = hand;
		} else if ( slot == Item.EquipmentSlots.Torso ) {
			target = torso;
		} else if ( slot == Item.EquipmentSlots.Head ) {
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
		} else {
			Destroy ( target.transform.FindChild( entry.title ).gameObject );
		}
	}
	
	function Start () {
		GameCore.SetPlayerObject ( this.gameObject );
	}
		
	function Update () {
	
	}
}