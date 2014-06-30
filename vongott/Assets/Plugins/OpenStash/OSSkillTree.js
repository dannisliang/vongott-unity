#pragma strict

public class OSSkill { 
	public var name : String = "";
	public var level : int = 0;
}

public class OSSkillTree extends MonoBehaviour {
	public var definitions : OSDefinitions;
	public var skills : List.< OSSkill > = new List.< OSSkill >();
	public var quickSlots : List.< int > = new List.< int > ();
	public var eventHandler : GameObject;

	
}
