'use client'

import { Canvas } from '@react-three/fiber'
import { useMemo } from 'react'
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

function Model({ url }: { url: string }) {
  if (!url) return null
  
  // Verificação robusta: imune a URL encoding (%3F), parâmetros adicionais ou letras maiúsculas
  const lowerUrl = url.toLowerCase()
  const isModel = lowerUrl.includes('.glb') || lowerUrl.includes('.gltf') || lowerUrl.startsWith('blob:')
  
  if (!isModel) {
    console.warn("[ViewerCanvas] URL inválida para modelo 3D:", url)
    return null
  }
  
  const { scene } = useGLTF(url)

  // Clona a cena para isolar o grafo de cena do estúdio principal
  const clonedScene = useMemo(() => {
    return scene.clone(true)
  }, [scene])

  return (
    <Center>
      <primitive
        object={clonedScene}
        dispose={null}
      />
    </Center>
  )
}

type ViewerCanvasProps = {
  modelUrl?: string
}

export function ViewerCanvas({ modelUrl }: ViewerCanvasProps) {
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