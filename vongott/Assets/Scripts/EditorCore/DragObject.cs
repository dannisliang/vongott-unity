using UnityEngine;
using System.Collections;

public class DragObject : MonoBehaviour {

    public Transform transTemp; // Drag gameobject empty in the inspector
     
    // Update is called once per frame
    void Update () {
	    if (Input.GetMouseButtonDown(0))
	    transTemp.position = Camera.main.ScreenToWorldPoint(new Vector3(Input.mousePosition.x, Input.mousePosition.y, 5f));
	     
	    if (Input.GetMouseButton(0))
	    {
	    Vector3 fingerPos = Camera.main.ScreenToWorldPoint(new Vector3(Input.mousePosition.x, Input.mousePosition.y, 5f));
	    transform.position = new Vector3(fingerPos.x, transform.position.y, fingerPos.z);
	    Vector3 relative = transTemp.InverseTransformPoint(fingerPos);
	    float angle = Mathf.Atan2(relative.x, relative.z) * Mathf.Rad2Deg;
	    if (angle < 0)
	    angle += 360;
	    Debug.Log(angle);
	    }
    }
}
