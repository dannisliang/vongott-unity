#pragma strict

public class OECharacterInspector extends OEComponentInspector {
	public var playerObject : OEObjectField;
	public var behaviour : OEPopup;
	public var pathUpdate : OEFloatField;

	override function In () {
		var character : OACharacter = target.GetComponent.< OACharacter >();
	
		playerObject.In ( character.player, typeof ( GameObject ) );
		behaviour.In ( character.behaviour, System.Enum.GetNames ( typeof ( OABehaviour ) ) );
		pathUpdate.In ( character.updatePathInterval );
	}	
	
	override function Out () {
		var character : OACharacter = target.GetComponent.< OACharacter >();

		character.player = playerObject.Out() as GameObject;
		character.behaviour = behaviour.Out();
		character.updatePathInterval = pathUpdate.Out();
	}	
}
