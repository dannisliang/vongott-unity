Shader "Vongott/Bumped Specular" {
	Properties {
		_MainTex("Texture", 2D) = "white" {}
		_BumpTex("Normal Map", 2D ) = "bump" {}
		_SpecColor("Specular Color", Color) = (1,1,1,1)
		_SpecPower("Specular Power", Range(0,2)) = 0.5
	}
	
	SubShader {
		Tags { "RenderType" = "Opaque" }
		
		CGPROGRAM
		#pragma surface surf BlinnPhong
		
		struct Input {
			float2 uv_MainTex;
		};
		
		sampler2D _MainTex;
		sampler2D _BumpTex;
		float _SpecPower;
		
		void surf ( Input IN, inout SurfaceOutput o ) {
			fixed4 tex = tex2D (_MainTex, IN.uv_MainTex);
			
			o.Albedo = tex.rgb;
			o.Normal = UnpackNormal ( tex2D ( _BumpTex, IN.uv_MainTex ) );
			o.Specular = _SpecPower;
			o.Gloss = tex.a;
		}
					
		ENDCG
	} 
	
	FallBack "Diffuse"
}