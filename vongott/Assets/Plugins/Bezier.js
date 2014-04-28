#pragma strict

public class Bezier extends System.Object {
	var p0 : Vector3;
	var p1 : Vector3;
	var p2 : Vector3;
	var p3 : Vector3;

	var ti : float = 0.0;

	private var b0 : Vector3 = Vector3.zero;
	private var b1 : Vector3 = Vector3.zero;
	private var b2 : Vector3 = Vector3.zero;
	private var b3 : Vector3 = Vector3.zero;

	private var Ax : float;
	private var Ay : float;
	private var Az : float;

	private var Bx : float;
	private var By : float;
	private var Bz : float;

	private var Cx : float;
	private var Cy : float;
	private var Cz : float;

	// Init function v0 = 1st point, v1 = handle of the 1st point , v2 = handle of the 2nd point, v3 = 2nd point
	// handle1 = v0 + v1
	// handle2 = v3 + v2
	function Bezier(v0 : Vector3, v1 : Vector3, v2 : Vector3, v3 : Vector3) {
		this.p0 = v0;
		this.p1 = v1;
		this.p2 = v2;
		this.p3 = v3;
	}

	// 0.0 >= t <= 1.0
	function GetPointAtTime(t : float) : Vector3 {
		this.CheckConstant();
		var t2 : float = t * t;
		var t3 : float = t * t * t;
		var x : float = this.Ax * t3 + this.Bx * t2 + this.Cx * t + p0.x;
		var y : float = this.Ay * t3 + this.By * t2 + this.Cy * t + p0.y;
		var z : float = this.Az * t3 + this.Bz * t2 + this.Cz * t + p0.z;
		return(Vector3(x,y,z));
	}

	private function SetConstant() {
		this.Cx = 3 * ((this.p0.x + this.p1.x) - this.p0.x);
		this.Bx = 3 * ((this.p3.x + this.p2.x) - (this.p0.x + this.p1.x)) - this.Cx;
		this.Ax = this.p3.x - this.p0.x - this.Cx - this.Bx;

		this.Cy = 3 * ((this.p0.y + this.p1.y) - this.p0.y);
		this.By = 3 * ((this.p3.y + this.p2.y) - (this.p0.y + this.p1.y)) - this.Cy;
		this.Ay = this.p3.y - this.p0.y - this.Cy - this.By;

		this.Cz = 3 * ((this.p0.z + this.p1.z) - this.p0.z);
		this.Bz = 3 * ((this.p3.z + this.p2.z) - (this.p0.z + this.p1.z)) - this.Cz;
		this.Az = this.p3.z - this.p0.z - this.Cz - this.Bz;
	}

	// Check if p0, p1, p2 or p3 have changed
	private function CheckConstant() {
		if (this.p0 != this.b0 || this.p1 != this.b1 || this.p2 != this.b2 || this.p3 != this.b3) {
			this.SetConstant();
			this.b0 = this.p0;
			this.b1 = this.p1;
			this.b2 = this.p2;
			this.b3 = this.p3;
		}
	}
}
