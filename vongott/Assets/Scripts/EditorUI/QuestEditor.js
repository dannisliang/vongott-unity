#pragma strict

public class QuestEditor extends OGPage {
	public var title : OGTextField;
	public var description : OGTextField;
	public var skillpoints : OGTextField;

	private var savePath : String;

	override function ExitPage () {
		savePath = "";
	}

	public function New () {
		savePath = "";
		title.text = "";
		description.text = "";
		skillpoints.text = "";
	}

	public function Open () {
		var fileBrowser : OEFileBrowser = OEWorkspace.GetInstance().fileBrowser;
		fileBrowser.browseMode = OEFileBrowser.BrowseMode.Open;
		fileBrowser.filter = ".quest";
		fileBrowser.callback = function ( file : FileInfo ) {
			savePath = file.FullName;
			
			var json : JSONObject = OFReader.LoadFile ( file.FullName );

			title.text = json.GetField ( "title" ).str;
			description.text = json.GetField ( "description" ).str;
			skillpoints.text = json.GetField ( "skillpoints" ).str;
		};
		fileBrowser.sender = "QuestEditor";
		OGRoot.GetInstance().GoToPage ( "FileBrowser" );
	}

	public function Save () {
		if ( !String.IsNullOrEmpty ( savePath ) ) {
			var json : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
			
			json.AddField ( "title", title.text );
			json.AddField ( "description", description.text );
			json.AddField ( "skillpoints", skillpoints.text );

			OFWriter.SaveFile ( json, savePath );

		} else {
			SaveAs ();

		}
	}

	public function SaveAs () {
		var fileBrowser : OEFileBrowser = OEWorkspace.GetInstance().fileBrowser;
		fileBrowser.browseMode = OEFileBrowser.BrowseMode.Save;
		fileBrowser.callback = function ( path : String ) { savePath = path; Save(); };
		fileBrowser.sender = "QuestEditor";
		OGRoot.GetInstance().GoToPage ( "FileBrowser" );
	}
}
