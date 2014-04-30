#pragma strict

public class OECharacterInspector extends OEComponentInspector {
	public var playerObject : OEObjectField;

	override function In () {
		var character : OACharacter = target.GetComponent.< OACharacter >();
	
		playerObject.In ( character.player, typeof ( GameObject ) );
	}	
	
	override function Out () {
		var character : OACharacter = target.GetComponent.< OACharacter >();

		character.player = playerObject.Out() as GameObject;
	}	
}
