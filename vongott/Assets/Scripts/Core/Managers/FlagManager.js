#pragma strict

static var flagTable : JSONObject;

static function Init () {
	flagTable = Loader.LoadFlags();
}

static function SaveFlags () {
	Saver.SaveFlags ( flagTable );
}

static function SetFlag ( flag : String, state : boolean ) {
	if ( !flagTable ) {
		Init ();
	}
	
	if ( flagTable.GetField ( flag ) ) {
		flagTable.GetField ( flag ).b = state;
	}
	
	GameCore.Print ( "FlagManager | set flag '" + flag + "' to " + state );
}

static function GetFlag ( flag : String, state : boolean ) {
	if ( !flagTable ) {
		Init ();
	}
	
	if ( flagTable.GetField ( flag ) ) {
		GameCore.Print ( "FlagManager | flag '" + flag + "' is " + flagTable.GetField ( flag ).b );
		return flagTable.GetField ( flag ).b == state;
	} else {
		GameCore.Print ( "FlagManager | flag '" + flag + "' doesn't exist" );
		return false;
	}
}