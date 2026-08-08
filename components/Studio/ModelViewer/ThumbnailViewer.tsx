'use client'

import { useEffect, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'
import { OrbitControls, Center, ContactShadows, useGLTF } from '@react-three/drei'
import { BackgroundGradient } from './BackgroundForModel/BackgroundGradient' // Mantenha seus imports

function Model({ url }: { url: string }) {
  if (!url) return null

  const lowerUrl = url.toLowerCase()
  const isModel = lowerUrl.includes('.glb') || lowerUrl.includes('.gltf') || lowerUrl.startsWith('blob:')

  if (!isModel) {
    console.warn("[ThumbnailViewer] URL inválida para modelo 3D:", url)
    return null
  }

  const { scene } = useGLTF(url)

  // Clona a cena e aplica a limpeza do Rig de forma segura
  const { clonedScene, scaleFactor } = useMemo(() => {
    // Uso obrigatório do SkeletonUtils para não corromper modelos com RIG
    const clone = SkeletonUtils.clone(scene)
    const itemsToRemove: any[] = []

    clone.traverse((child: any) => {
      const name = child.name ? child.name.toLowerCase() : ''
      
      if (
        name.includes('bounds') || 
        name.includes('hitbox') || 
        name.includes('collider') || 
        name.includes('collision') ||
        name.includes('sensor')
      ) {
        itemsToRemove.push(child)
        return
      }

      if (child.isMesh || child.isSkinnedMesh) {
        child.castShadow = true
        child.receiveShadow = true

        if (child.material) {
          if (child.material.opacity === 0 || child.material.transparent) {
            child.material.depthWrite = false
            child.renderOrder = -1
          }
        }
      }
    })

    itemsToRemove.forEach((item) => {
      if (item.parent) {
        item.parent.remove(item)
      }
    })

    clone.updateMatrixWorld(true)
    const box = new THREE.Box3()
    box.makeEmpty()

    clone.traverse((child: any) => {
      if ((child.isMesh || child.isSkinnedMesh) && child.geometry) {
        child.geometry.computeBoundingBox()
        if (child.geometry.boundingBox) {
          const childBox = child.geometry.boundingBox.clone()
          childBox.applyMatrix4(child.matrixWorld)
          box.union(childBox)
        }
      }
    })

    let calculatedScale = 1
    if (!box.isEmpty()) {
      const size = new THREE.Vector3()
      box.getSize(size)

      const targetHeight = 2
      const currentHeight = size.y > 0.001 ? size.y : 1 
      calculatedScale = targetHeight / currentHeight
    }

    return { clonedScene: clone, scaleFactor: calculatedScale }
  }, [scene])

  return (
    <Center 
      bottom 
      position={[0, 1, 0]} // Alinhado com a sombra de contato
    >
      {/* O <group> encapsula a escala preservando os cálculos dos ossos */}
      <group scale={scaleFactor}>
        <primitive object={clonedScene} dispose={null} />
      </group>
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
          position: [4, 2, 6],
          fov: 20
        }}
      >
        <ThumbnailCapture onCaptureReady={onCaptureReady} />

        <ambientLight intensity={1.5} />
        <directionalLight intensity={3} position={[5, 10, 5]} />
        
        <Model url={modelUrl} />

        <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} />
        <OrbitControls enableDamping />
      </Canvas>
    </div>
  )
}