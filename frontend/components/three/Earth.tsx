import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'
import { useGLTF } from '@react-three/drei'
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'

/**
 * Converts a lat/lon pair (in degrees) into a "globe orientation" Euler.
 *  - Rotate about Y by -longitude
 *  - Then rotate about X by +latitude
 */
function eulerFromLatLon(position: THREE.Vector2Like): THREE.Euler {
  const φ = THREE.MathUtils.degToRad(position.y) // lat
  const θ = THREE.MathUtils.degToRad(-position.x) // lon
  return new THREE.Euler(φ, θ, 0, 'XYZ')
}

/**
 * Converts a THREE.Euler (in 'XYZ' order) back to lat/lon in degrees.
 *  - euler.x => -lat
 *  - euler.y => +lon
 */
function latLonFromEuler(euler: THREE.Euler): THREE.Vector2 {
  const lonDeg = THREE.MathUtils.radToDeg(euler.y) * -1
  const latDeg = THREE.MathUtils.radToDeg(euler.x)
  return new THREE.Vector2(lonDeg, latDeg)
}

/**
 * Converts the X/Y angles of a 'XYZ' Euler to a Vector2 (x = euler.x, y = euler.y).
 * Mainly useful for measuring angular differences.
 */
function vector2FromEuler(euler: THREE.Euler): THREE.Vector2 {
  return new THREE.Vector2(euler.x, euler.y)
}

/**
 * Adjusts the "targetEuler" so that the rotation is forced in a "forward direction."
 */
function adjustForwardRotation(
  forward: THREE.Vector2Like,
  currentEuler: THREE.Euler,
  targetEuler: THREE.Euler,
): THREE.Euler {
  const adjusted = targetEuler.clone()

  const diff = new THREE.Vector2(currentEuler.y, currentEuler.x)
    .sub(new THREE.Vector2(targetEuler.y, targetEuler.x))

  const diffDir = diff.clone().normalize()

  if (forward.x !== 0 && Math.sign(diffDir.x) !== Math.sign(forward.x)) {
    adjusted.x += Math.PI * 2 * forward.x
  }

  if (forward.y !== 0 && Math.sign(diffDir.y) !== Math.sign(forward.y)) {
    adjusted.y += Math.PI * 2 * forward.y
  }

  return adjusted
}

/**
 * A base rotation correction so the 3D model's north pole is aligned with +Y.
 */
const rotationCorrection = new THREE.Euler(Math.PI, -Math.PI / 2, Math.PI, 'XYZ')

/**
 * A default transition-duration calculation:
 * It estimates how long the tween should take based on the angular difference
 * between startPosition and endPosition, divided by speed. This keeps the speed
 * consistent regardless of the distance between the two points.
 */
function defaultTransitionDuration(
  startPosition: THREE.Vector2Like,
  endPosition: THREE.Vector2Like,
  speed: number,
): number {
  if (speed === 0) return 0

  const diffEuler = eulerFromLatLon({
    x: startPosition.x - endPosition.x,
    y: startPosition.y - endPosition.y,
  })
  const distance = vector2FromEuler(diffEuler).length()
  return (distance / speed) * 1000
}

export type EarthProps = {
  /**
   * The speed of the spin in radians per frame.
   * Set to 0 to disable the spinning animation.
   */
  speed?: number
  /**
   * Unit vector representing the axis about which to spin.
   */
  direction?: THREE.Vector2Like
  /**
   * The lat/lon you want the globe to face (object with x=lon, y=lat in degrees).
   * We’ll animate from the current orientation to this orientation whenever it changes.
   */
  position?: THREE.Vector2Like
  /**
   * Callback fired when the animation to a new position *starts*.
   */
  onTransitionStart?: (
    fromPosition: THREE.Vector2Like,
    toPosition: THREE.Vector2Like,
  ) => void
  /**
   * Callback when we finish animating to `position`.
   */
  onTransitionEnd?: () => void
  /**
   * A function that computes how long (ms) the transition should take.
   */
  transitionDuration?: (
    fromPosition: THREE.Vector2Like,
    toPosition: THREE.Vector2Like,
    speed: number
  ) => number
}

// Defaults
const defaultDirection = { x: 0, y: -1 }
const defaultPosition = { x: 0, y: 0 }

/**
 * A React Three Fiber component representing a spinning Earth globe
 * that can also animate to face a given lat/lon position.
 */
export default function Earth({
  speed = 0,
  direction = defaultDirection,
  position = defaultPosition,
  onTransitionStart,
  onTransitionEnd,
  transitionDuration = defaultTransitionDuration,
}: EarthProps) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const tweenRef = useRef<TWEEN.Tween<THREE.Euler> | null>(null)

  const { nodes, materials } = useGLTF('/scene.gltf')

  // On mount, initialize the group’s rotation to match the initial "position"
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.copy(eulerFromLatLon(position))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Whenever the user changes `position` or `direction`, create a new tween
  useEffect(() => {
    if (!groupRef.current) return

    if (speed <= 0) return

    tweenRef.current?.stop()

    const startEuler = groupRef.current.rotation.clone()
    const naiveTargetEuler = eulerFromLatLon(position)

    if (startEuler.equals(naiveTargetEuler)) return

    const finalEuler = adjustForwardRotation(direction, startEuler, naiveTargetEuler)

    const ms = transitionDuration(
      latLonFromEuler(startEuler),
      latLonFromEuler(finalEuler),
      speed,
    )

    tweenRef.current = new TWEEN.Tween(startEuler)
      .to(finalEuler, ms)
      .onStart((currentRotation) => {
        onTransitionStart?.(
          latLonFromEuler(currentRotation),
          latLonFromEuler(naiveTargetEuler),
        )
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
        onTransitionEnd?.()
      })
      .start()
  }, [position, direction, speed, onTransitionStart, onTransitionEnd, transitionDuration])

  useFrame((_, delta) => {
    tweenRef.current?.update()

    // If we are not currently tweening, spin continuously
    if (!tweenRef.current && speed > 0 && groupRef.current) {
      groupRef.current.rotation.x += speed * direction.x * delta
      groupRef.current.rotation.y += speed * direction.y * delta
    }
  })

  return (
    <group ref={groupRef} dispose={null}>
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        // @ts-ignore
        geometry={nodes.Object_Planet_0.geometry}
        material={materials.Planet}
        rotation={rotationCorrection}
      />
    </group>
  )
}

/*
Author: Jacobs Development (https://sketchfab.com/Jacobs_Development)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/low-poly-planet-earth-7b1dc4f802a54a6297e7a46888a85f77
Title: Low Poly Planet Earth
*/
useGLTF.preload('/scene.gltf')
