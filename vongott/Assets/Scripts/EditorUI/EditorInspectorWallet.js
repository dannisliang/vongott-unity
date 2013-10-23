#pragma strict

class EditorInspectorWallet extends MonoBehaviour {
	public var amountInput : OGTextField;
	
	private var wallet : Wallet;
	
	function Init ( obj : GameObject ) {
		wallet = obj.GetComponent ( Wallet );
		
		amountInput.text = wallet.creditAmount.ToString();
	}
	
	function Update () {
		if ( amountInput.text == "" ) {
			amountInput.text = "0";
		}
	
		wallet.creditAmount = int.Parse ( amountInput.text );
	}
}