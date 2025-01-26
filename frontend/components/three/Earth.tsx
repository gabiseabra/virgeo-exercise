import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'
import { useGLTF } from '@react-three/drei'
import { useRef, useEffect, Suspense, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { createSlot, withSlot } from '@/context/slots'
import { LatLngLiteral } from 'leaflet' // Import LatLngLiteral from leaflet

export type EarthProps = {
  /**
   * The speed of the spin in radians per frame.
   * Set to 0 to disable the spinning *and* transition animations.
   */
  speed?: number
  /**
   * The lat/lon you want the globe to face (object with lat, lng in degrees).
   * We’ll animate from the current orientation to this orientation whenever it changes.
   */
  position?: LatLngLiteral
  /**
   * Callback fired when the animation to a new position *starts*.
   */
  onTransitionStart?: () => void
  /**
   * Callback when we finish animating to `position`.
   */
  onTransitionEnd?: () => void
  /**
   * A function that computes how long (ms) the transition should take.
   */
  transitionDuration?: number | GetTransitionDuration
  /**
   * A custom easing function for the transition animation.
   */
  easing?: (t: number) => number
}

type GetTransitionDuration = (
  startEuler: THREE.Euler,
  endEuler: THREE.Euler,
) => number

/* Default variables and constants */

/** The axis about which the Earth spins */
const AXIS = { x: 0, y: -1 }

const defaultPosition = { lat: 0, lng: 0 } // Update defaultPosition
/**
 * A default transition-duration calculation:
 * It estimates how long the tween should take based on the angular difference
 * between startPosition and endPosition, divided by speed. This keeps the speed
 * consistent regardless of the distance between the two points.
 */
const getDefaultTransitionDuration = (speed: number): GetTransitionDuration => (startEuler, endEuler) => {
  if (speed === 0) return 0
  const deltaX = endEuler.x - startEuler.x
  const deltaY = endEuler.y - startEuler.y
  const deltaZ = endEuler.z - startEuler.z
  const angularDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ)
  return (angularDistance / speed) * 1000
}

const Config = createSlot<EarthProps>('EarthProps')

/**
 * A React Three Fiber component representing a spinning Earth globe
 * that can also animate to face a given lat/lon position.
 */
export default withSlot(Config)(function Earth({
  speed = 1,
  position = defaultPosition,
  onTransitionStart,
  onTransitionEnd,
  transitionDuration = getDefaultTransitionDuration(speed),
  easing,
}: EarthProps) {
  const groupRef = useRef<THREE.Group>(null)
  const tweenRef = useRef<TWEEN.Tween<THREE.Euler> | null>(null)
  const timeRef = useRef<number>(0)
  const mountedRef = useRef<boolean>(false)

  // Store the callbacks in refs so that the tween can access the latest values
  const onTransitionStartRef = useRef(onTransitionStart)
  const onTransitionEndRef = useRef(onTransitionEnd)
  onTransitionStartRef.current = onTransitionStart
  onTransitionEndRef.current = onTransitionEnd

  // Start the tween animation whenever the position changes
  useEffect(() => {
    if (!groupRef.current) return

    const targetEuler = eulerFromLatLng(position)
    const startEuler = groupRef.current.rotation.clone()

    if (startEuler.equals(targetEuler)) return

    const finalEuler = adjustForwardRotation(startEuler, targetEuler)

    const ms = typeof transitionDuration === 'number'
      ? transitionDuration
      : transitionDuration(startEuler, finalEuler)

    tweenRef.current = new TWEEN.Tween(startEuler)
      .to(finalEuler, ms)
      .easing(easing)
      .onStart(() => {
        onTransitionStartRef.current?.()
      })
      .onUpdate((currentRotation) => {
        if (groupRef.current) {
          groupRef.current.rotation.x = currentRotation.x
          groupRef.current.rotation.y = currentRotation.y
          groupRef.current.rotation.z = currentRotation.z
        }
      })
      .onComplete(() => {
        tweenRef.current = null
        onTransitionEndRef.current?.()
      })
      .start(timeRef.current)

    return () => {
      tweenRef.current?.stop()
    }
    // only position should ever trigger an update here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useFrame(({ clock }, delta) => {
    timeRef.current = clock.getElapsedTime() * 1000
    tweenRef.current?.update(timeRef.current)

    // This ensures that the spinning animation doesn't start before we process the initial tween animation.
    // This is important because the tween animation is based on the current rotation, so if we start spinning before
    // the component is mounted, we would trigger the tween even though the position is initial.
    if (!mountedRef.current) return
    // If we are not currently tweening, spin continuously
    if (!tweenRef.current && speed > 0 && groupRef.current) {
      groupRef.current.rotation.x += (AXIS.x * speed * delta)
      groupRef.current.rotation.y += (AXIS.y * speed * delta)
    }
  })

  const initialProps = useMemo(() => ({
    rotation: eulerFromLatLng(position),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [])

  return (
    <group ref={groupRef} {...initialProps}>
      <Suspense fallback={<EarthFallback />}>
        <EarthMesh />
      </Suspense>
    </group>
  )
})

/*
Author: Jacobs Development (https://sketchfab.com/Jacobs_Development)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/low-poly-planet-earth-7b1dc4f802a54a6297e7a46888a85f77
Title: Low Poly Planet Earth
*/
function EarthMesh() {
  const { nodes, materials } = useGLTF('/scene.gltf')

  const planetMaterial = useMemo<THREE.Material>(() => {
    const material = new THREE.MeshStandardMaterial()
    if (materials.Planet) {
      material.copy(materials.Planet)
    }
    material.setValues({
      metalness: 0,
      roughness: 1,
    })
    return material
  }, [materials])

  return (
    <mesh
      castShadow
      receiveShadow
      // @ts-ignore
      geometry={nodes.Object_Planet_0.geometry}
      material={planetMaterial}
      position={positionCorrection}
      rotation={rotationCorrection}
    />
  )
}

/**
 * A base rotation correction so the model's north pole is aligned with +Y.
 */
const rotationCorrection = new THREE.Euler(Math.PI, -Math.PI / 2, Math.PI, 'XYZ')
/**
 * XYZ offset for the model's position so the "ocean ball" is centered at 0,0,0.
 */
const positionCorrection = new THREE.Vector3(0.065, 0.147, 0.045)

useGLTF.preload('/scene.gltf')

/**
 * A fallback mesh to use when the GLTF model is loading
 * The color is a close match to the original model.
 */
function EarthFallback() {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={0x51b0e4} />
    </mesh>
  )
}

/**
 * Converts a lat/lon pair (in degrees) into a "globe orientation" Euler.
 *  - Rotate about Y by -longitude
 *  - Then rotate about X by latitude
 */
function eulerFromLatLng(position: LatLngLiteral): THREE.Euler {
  const θ = THREE.MathUtils.degToRad(-position.lng) // lon
  const φ = THREE.MathUtils.degToRad(position.lat) // lat
  return new THREE.Euler(φ, θ, 0, 'XYZ')
}

/**
 * Adjusts the "targetEuler" so that the rotation is forced in a forward direction with respect to the axis of rotation.
 */
function adjustForwardRotation(
  startEuler: THREE.Euler,
  targetEuler: THREE.Euler,
): THREE.Euler {
  // Start from the current rotation
  const finalEuler = startEuler.clone()
  // The x axis is not locked, so we can go in the shortest path
  finalEuler.x = targetEuler.x
  // For the y axis, we want to make a full extra rotation if the shortest path is backwards
  const diff = (startEuler.y - targetEuler.y) % RAD
  finalEuler.y -= diff
  if (diff < 0) finalEuler.y -= Math.PI * 2

  return finalEuler
}

const RAD = Math.PI * 2
