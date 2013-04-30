#pragma strict

private class Convo {
	var chapter : int;
	var scene : int;
	var name : String;
}

private class State {
	var affiliation : String;
	var mood : String;
}

class Actor extends MonoBehaviour {
	var conversation : Convo = new Convo ();
	var state : State = new State ();
}