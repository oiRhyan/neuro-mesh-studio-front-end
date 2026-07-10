'use client'

import { useEffect, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Center, ContactShadows, useGLTF } from '@react-three/drei'
import { BackgroundGradient } from './BackgroundForModel/BackgroundGradient'

function Model({ url }: { url: string }) {
  if (!url) return null

  const lowerUrl = url.toLowerCase()
  const isModel = lowerUrl.includes('.glb') || lowerUrl.includes('.gltf') || lowerUrl.startsWith('blob:')

  if (!isModel) {
    console.warn("[ThumbnailViewer] URL inválida para modelo 3D:", url)
    return null
  }

  const { scene } = useGLTF(url)

  const clonedScene = useMemo(() => {
    return scene.clone(true)
  }, [scene])

  return (
    <Center>
      <primitive object={clonedScene} dispose={null} />
    </Center>
  )
}

function ThumbnailCapture({
  onCaptureReady
}: {
  onCaptureReady: (captureFn: () => string) => void
}) {
  const { gl } = useThree()

  useEffect(() => {
    if (gl?.domElement) {
      onCaptureReady(() => {
        return gl.domElement.toDataURL('image/png')
      })
    }
    return () => {
      onCaptureReady(() => '')
    }
  }, [gl, onCaptureReady])

  return null
}

type ThumbnailViewerProps = {
  modelUrl: string
  onCaptureReady: (captureFn: () => string) => void
}

export function ThumbnailViewer({ modelUrl, onCaptureReady }: ThumbnailViewerProps) {
  return (
    <div className="thumbnail-viewer" style={{ width: '100%', height: '250px', position: 'relative' }}>
      <Canvas
        gl={{
          preserveDrawingBuffer: true
        }}
        camera={{
          position: [4, 3, 6],
          fov: 45
        }}
      >
        <ThumbnailCapture onCaptureReady={onCaptureReady} />

        <ambientLight intensity={1.5} />
        <directionalLight intensity={3} position={[5, 8, 5]} />
        
        <Model url={modelUrl} />

        <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} />
        <OrbitControls enableDamping />
      </Canvas>
    </div>
  )
}