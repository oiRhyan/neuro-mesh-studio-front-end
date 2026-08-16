'use client'

import { Canvas } from '@react-three/fiber'
import { useMemo, useRef, useEffect, useState } from 'react'
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

type AnimationName =
  | 'preset:idle'
  | 'preset:walk'
  | 'preset:run'
  | 'preset:jump'

const PRESET_ANIMATIONS: AnimationName[] = [
  'preset:idle',
  'preset:walk',
  'preset:run',
  'preset:jump'
]

interface ModelProps {
  url: string
  selectedAnimation: string | null
  onAnimationsDetected: (animations: string[]) => void
}

function Model({
  url,
  selectedAnimation,
  onAnimationsDetected
}: ModelProps) {
  const { scene, animations } = useGLTF(url)
  const groupRef = useRef<THREE.Group>(null)

  const { clonedScene, scaleFactor } = useMemo(() => {
    const clone = SkeletonUtils.clone(scene)
    const itemsToRemove: THREE.Object3D[] = []

    clone.traverse((child: any) => {
      const name = child.name
        ? child.name.toLowerCase()
        : ''

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
          if (
            child.material.opacity === 0 ||
            child.material.transparent
          ) {
            child.material.depthWrite = false
            child.material.renderOrder = -1
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
      if (
        (child.isMesh || child.isSkinnedMesh) &&
        child.geometry
      ) {
        child.geometry.computeBoundingBox()

        if (child.geometry.boundingBox) {
          const childBox =
            child.geometry.boundingBox.clone()

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
      const currentHeight =
        size.y > 0.001
          ? size.y
          : 1

      calculatedScale =
        targetHeight / currentHeight
    }

    return {
      clonedScene: clone,
      scaleFactor: calculatedScale
    }
  }, [scene])

  const availableAnimations = useMemo(() => {
    return animations.map(
      (animation) => animation.name
    )
  }, [animations])

  useEffect(() => {
    console.log(
      '[ViewerCanvas] 🎬 Animações encontradas:',
      availableAnimations
    )
    onAnimationsDetected(availableAnimations)
  }, [
    availableAnimations,
    onAnimationsDetected
  ])

  const { actions } = useAnimations(
    animations,
    groupRef
  )

  useEffect(() => {
    if (!selectedAnimation) {
      return
    }

    const action =
      actions[selectedAnimation]

    if (!action) {
      console.warn(
        `[ViewerCanvas] ⚠️ Animação não encontrada: ${selectedAnimation}`
      )
      return
    }

    console.log(
      `[ViewerCanvas] 🎬 Executando: ${selectedAnimation}`
    )


    Object.entries(actions).forEach(
      ([name, otherAction]) => {
        if (
          name !== selectedAnimation &&
          otherAction
        ) {
          otherAction.fadeOut(0.25)
        }
      }
    )

    action
      .reset()
      .fadeIn(0.25)
      .play()

    if (selectedAnimation === 'preset:jump') {
      action.setLoop(
        THREE.LoopOnce,
        1
      )
      action.clampWhenFinished = true
    } else {
      action.setLoop(
        THREE.LoopRepeat,
        Infinity
      )
      action.clampWhenFinished = false
    }

    return () => {
      action.fadeOut(0.25)
    }
  }, [
    selectedAnimation,
    actions
  ])

  return (
    <Center
      bottom
      position={[0, 1, 0]}
    >
      <group
        ref={groupRef}
        scale={scaleFactor}
      >
        <primitive
          object={clonedScene}
        />
      </group>
    </Center>
  )
}

interface AnimationControlsProps {
  availableAnimations: string[]
  selectedAnimation: string | null
  onSelectAnimation: (animation: string | null) => void
}

function AnimationControls({
  availableAnimations,
  selectedAnimation,
  onSelectAnimation
}: AnimationControlsProps) {
  const availablePresets =
    PRESET_ANIMATIONS.filter(
      (preset) =>
        availableAnimations.includes(preset)
    )

  if (availablePresets.length === 0) {
    return null
  }

  const getLabel = (animation: string) => {
    switch (animation) {
      case 'preset:idle':
        return 'Idle'
      case 'preset:walk':
        return 'Walk'
      case 'preset:run':
        return 'Run'
      case 'preset:jump':
        return 'Jump'
      default:
        return animation
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '80px',
        right: '20px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
        background:
          'rgba(18, 18, 24, 0.85)',
        backdropFilter:
          'blur(12px)',
        border:
          '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        marginTop: '200px',
        boxShadow:
          '0 8px 24px rgba(0,0,0,0.3)'
      }}
    >
      <div
        style={{
          color: '#fff',
          fontSize: '12px',
          fontWeight: 600,
          marginBottom: '2px',
          opacity: 0.7
        }}
      >
        Animações
      </div>

      {availablePresets.map((animation) => {
        const active =
          selectedAnimation === animation

        return (
          <button
            key={animation}
            onClick={() =>
              onSelectAnimation(
                active
                  ? null
                  : animation
              )
            }
            style={{
              minWidth: '130px',
              padding:
                '9px 12px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#fff',
              background: active
                ? '#6366f1'
                : 'rgba(255,255,255,0.08)',
              fontSize: '13px',
              fontWeight: 600,
              transition:
                'all 0.2s ease',
              boxShadow: active
                ? '0 4px 12px rgba(99,102,241,0.35)'
                : 'none'
            }}
          >
            {getLabel(animation)}
          </button>
        )
      })}

      {selectedAnimation && (
        <button
          onClick={() =>
            onSelectAnimation(null)
          }
          style={{
            minWidth: '130px',
            padding:
              '8px 12px',
            border:
              '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px',
            cursor: 'pointer',
            color: '#d1d5db',
            background:
              'transparent',
            fontSize: '12px'
          }}
        >
          Parar animação
        </button>
      )}
    </div>
  )
}

type ViewerCanvasProps = {
  modelUrl?: string
}

export function ViewerCanvas({
  modelUrl
}: ViewerCanvasProps) {
  const [
    availableAnimations,
    setAvailableAnimations
  ] = useState<string[]>([])

  const [
    selectedAnimation,
    setSelectedAnimation
  ] = useState<string | null>(null)

  /*
   * Quando trocar de modelo, limpa a
   * animação anterior.
   */
  useEffect(() => {
    setAvailableAnimations([])
    setSelectedAnimation(null)
  }, [modelUrl])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%'
      }}
    >
      <Canvas
        camera={{
          position: [0, 0.5, 4.5],
          fov: 45
        }}
      >
        <directionalLight
          intensity={3}
          position={[5, 8, 5]}
        />
        <Environment
          preset="warehouse"
        />

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
          <Model
            url={modelUrl}
            selectedAnimation={
              selectedAnimation
            }
            onAnimationsDetected={
              setAvailableAnimations
            }
          />
        )}

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

      <AnimationControls
        availableAnimations={
          availableAnimations
        }
        selectedAnimation={
          selectedAnimation
        }
        onSelectAnimation={
          setSelectedAnimation
        }
      />
    </div>
  )
}