'use client'

import { Canvas } from '@react-three/fiber'
import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Grid,
  GizmoHelper,
  GizmoViewport,
  useGLTF,
  useAnimations,
  Center
} from '@react-three/drei'

function Model({ url, isTaunting }: { url: string; isTaunting: boolean }) {
  if (!url) return null
  
  const lowerUrl = url.toLowerCase()
  const isModel = lowerUrl.includes('.glb') || lowerUrl.includes('.gltf') || lowerUrl.startsWith('blob:')
  
  if (!isModel) {
    console.warn("[ViewerCanvas] URL inválida para modelo 3D:", url)
    return null
  }
  
  const { scene } = useGLTF(url)

  const { animations: tauntAnimations } = useGLTF('/taunt.glb');

  const groupRef = useRef<THREE.Group>(null)

  const formattedAnimations = useMemo(() => {
    if (!tauntAnimations || tauntAnimations.length === 0) return []
    const clip = tauntAnimations[0].clone()
    clip.name = 'taunt'
    return [clip]
  }, [tauntAnimations])

  const { actions } = useAnimations(formattedAnimations, groupRef)

  useEffect(() => {
    const tauntAction = actions['taunt']
    if (!tauntAction) return

    if (isTaunting) {
      tauntAction.reset().fadeIn(0.3).play()
    } else {
      tauntAction.fadeOut(0.3)
    }

    return () => {
      tauntAction.fadeOut(0.3)
    }
  }, [isTaunting, actions])

  const { clonedScene, scaleFactor } = useMemo(() => {
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
        child.frustumCulled = false
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
    <group ref={groupRef}>
      <Center
        bottom
        position={[0, 3, 0]}
      >
        <group scale={scaleFactor}>
          <primitive
            object={clonedScene}
            dispose={null}
          />
        </group>
      </Center>
    </group>
  )
}

type ViewerCanvasProps = {
  modelUrl?: string
  isTaunting?: boolean
}

export function ViewerCanvas({ modelUrl, isTaunting = false }: ViewerCanvasProps) {
  return (
    <Canvas
      camera={{
        position: [0, 0.5, 4.5], 
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

      {modelUrl && <Model url={modelUrl} isTaunting={isTaunting} />}

      <ContactShadows
        position={[0, -1, 0]}
        opacity={0.4}
        scale={20}
        blur={2}
      />

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        target={[0, 0, 0]} 
      />

      <GizmoHelper
        alignment="bottom-right"
        margin={[70, 70]}
      >
        <GizmoViewport />
      </GizmoHelper>
    </Canvas>
  )
}