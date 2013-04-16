Shader "Vongott/Bumped Rim Lighting" {
	Properties {
		_MainTex ( "Diffuse Texture", 2D ) = "white" {}
		_BumpTex ( "Normal Map", 2D ) = "bump" {}
		_RimColor ( "Rim Color", Color ) = (1,1,1,1)
		_RimPower ( "Rim Power", Range(0.1,10) ) = 3.0
	}
	
	SubShader {
		Tags { "RenderType" = "Opaque" }
		
		CGPROGRAM
		#pragma surface surf Lambert
		
		struct Input {
			float2 uv_MainTex;
			float3 viewDir;
		};		
		
		sampler2D _MainTex;
		sampler2D _BumpTex;
		float4 _RimColor;
		float _RimPower;
		
		void surf ( Input IN, inout SurfaceOutput o ) {
			o.Albedo = tex2D ( _MainTex, IN.uv_MainTex ).rgb;
			o.Normal = UnpackNormal ( tex2D ( _BumpTex, IN.uv_MainTex ) );
						
			half rim = 1 - saturate ( dot ( normalize ( IN.viewDir ), o.Normal ) );
			
			o.Emission = _RimColor.rgb * pow ( rim, _RimPower );
		}
		
		ENDCG
	}
	
	Fallback "Diffuse"
}