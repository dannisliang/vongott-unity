Shader "Vongott/Bumped Cubemap Reflection" {
	Properties {
		_MainTex("Texture", 2D) = "white" {}
		_BumpTex("Texture", 2D) = "bump" {}
		_Cube ("Cube Map", CUBE) = "" {}
	}
	
	SubShader {
		Tags { "RenderType" = "Opaque" }
		
		CGPROGRAM
		#pragma surface surf Lambert
		
		struct Input {
			float2 uv_MainTex;
			float3 worldRefl;
			INTERNAL_DATA
		};
		
		sampler2D _MainTex;
		sampler2D _BumpTex;
		samplerCUBE _Cube;
		
		void surf ( Input IN, inout SurfaceOutput o ) {
			o.Albedo = tex2D (_MainTex, IN.uv_MainTex).rgb;
			o.Normal = UnpackNormal (tex2D (_BumpTex, IN.uv_MainTex));
			o.Emission = texCUBE (_Cube, WorldReflectionVector( IN, o.Normal)).rgb;
		}
					
		ENDCG
	} 
	
	FallBack "Diffuse"
}
