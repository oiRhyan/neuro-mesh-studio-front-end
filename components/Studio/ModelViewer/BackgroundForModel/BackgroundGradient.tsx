import * as THREE from 'three'

export function BackgroundGradient() {
    return (
        <mesh
            position={[0, 0, -15]}
        >
            <planeGeometry args={[80, 80]} />

            <shaderMaterial

                uniforms={{

                    color1: {
                        value: new THREE.Color('#050505')
                    },

                    color2: {
                        value: new THREE.Color('#131313')
                    },

                    color3: {
                        value: new THREE.Color('#2a1745')
                    }

                }}

                vertexShader={`
          varying vec2 vUv;

          void main() {

            vUv = uv;

            gl_Position =
              projectionMatrix *
              modelViewMatrix *
              vec4(position,1.0);

          }
        `}

                fragmentShader={`

uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;

varying vec2 vUv;

void main(){

  vec2 uv = vUv;

  vec3 background =

    mix(
      color1,
      color2,
      uv.y
    );

  float glow =

    smoothstep(
      0.7,
      0.0,
      distance(
        uv,
        vec2(0.5,0.35)
      )
    );

  background +=

    color3 * glow * 0.35;

  gl_FragColor =

    vec4(
      background,
      1.0
    );

}

`}
            />

        </mesh>
    )
}