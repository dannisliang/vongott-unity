#pragma strict

static var flagTable : JSONObject;

static function LoadFlags () {
	flagTable = Loader.LoadFlags();
}

static function SaveFlags () {
	Saver.SaveFlags ( flagTable );
}

static function SetFlag ( flag : String, state : boolean ) {
	if ( !flagTable ) {
		LoadFlags ();
	}
	
	if ( flagTable.GetField ( flag ) ) {
		flagTable.GetField ( flag ).b = state;
	}
}

static function GetFlag ( flag : String ) {
	if ( !flagTable ) {
		LoadFlags ();
	}
	
	if ( flagTable.GetField ( flag ) ) {
		return flagTable.GetField ( flag ).b;
	} else {
		return false;
	}
}