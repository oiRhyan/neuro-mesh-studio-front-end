'use client'

import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, Suspense } from 'react'
import { OrbitControls, Center, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

function AutoFitCamera({ modelScene }: { modelScene: THREE.Object3D }) {
  const { camera, invalidate } = useThree()

  useEffect(() => {
    if (!modelScene) return
    
    const timeout = setTimeout(() => {
      const box = new THREE.Box3().setFromObject(modelScene)
      if (box.isEmpty()) return

      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())

      const maxDim = Math.max(size.x, size.y, size.z)
      const fovRad = (45 * Math.PI) / 180
      
      let radius = Math.abs(maxDim / (2 * Math.tan(fovRad / 2)))
      radius *= 1.25 

      const angle = -Math.PI / 5 
      const camX = Math.sin(angle) * radius
      const camZ = Math.cos(angle) * radius

      camera.position.set(camX, center.y, camZ)
      camera.lookAt(center)
      camera.updateProjectionMatrix()
      invalidate()
    }, 100)

    return () => clearTimeout(timeout)
  }, [modelScene, camera, invalidate])

  return null
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url)

  return (
    <Center>
      <primitive object={scene} rotation={[0, -Math.PI / 2, 0]} dispose={null} />
      <AutoFitCamera modelScene={scene} />
    </Center>
  )
}

type HomePreviewCanvasProps = {
  modelUrl?: string
}

export function HomePreviewCanvas({ modelUrl }: HomePreviewCanvasProps) {
  if (!modelUrl) return null

  return (
    <Canvas
      camera={{ position: [0, 3, 5], fov: 45 }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      shadows
    >
      <ambientLight intensity={1.8} />
      <directionalLight intensity={2.5} position={[0, 4, 5]} />
    
      <Suspense fallback={null}>
        <Model url={modelUrl} />
      </Suspense>

      <OrbitControls
        makeDefault
        enableDamping
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  )
}