'use client'

import { Canvas } from '@react-three/fiber'

import {
    OrbitControls,
    Environment,
    ContactShadows,
    Center,
    Grid,
    GizmoHelper,
    GizmoViewport,
    useGLTF
} from '@react-three/drei'

function Model({
    url
}: {
    url: string
}) {
    const { scene } = useGLTF(url)

    return (
        <Center>
            <primitive object={scene} />
        </Center>
    )
}

export function ViewerCanvas({
    modelUrl
}: {
    modelUrl?: string
}) {
    return (
        <Canvas
            camera={{
                position: [4, 3, 6],
                fov: 45
            }}
        >
            <ambientLight intensity={1.5} />

            <directionalLight
                intensity={3}
                position={[5, 8, 5]}
            />

            <Environment preset="warehouse" />

            <Grid
                position={[0, -1, 0]}
                cellSize={0.5}
                sectionSize={5}
                fadeDistance={35}
                infiniteGrid
                cellColor="#23252d"
                sectionColor="#323643"
            />

            {modelUrl && (
                <>
                    <Model url={modelUrl} />

                    <ContactShadows
                        position={[0, -1, 0]}
                        opacity={0.4}
                        scale={20}
                        blur={2}
                    />
                </>
            )}

            <OrbitControls
                makeDefault
                enableDamping
            />

            <GizmoHelper
                alignment="bottom-right"
                margin={[80, 80]}
            >
                <GizmoViewport />
            </GizmoHelper>
        </Canvas>
    )
}