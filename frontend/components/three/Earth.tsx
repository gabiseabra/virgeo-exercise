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
   * Set to false to pause the spinning animation.
   */
  spinning?: boolean
  /**
   * Unit vector representing the axis about which to spin.
   */
  direction?: THREE.Vector2Like
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
  transitionDuration?: number | (() => number)
}

// Defaults
const defaultDirection = { x: 0, y: -1 }
const defaultPosition = { lat: 0, lng: 0 } // Update defaultPosition

/**
 * @todo A default transition-duration calculation:
 * It estimates how long the tween should take based on the angular difference
 * between startPosition and endPosition, divided by speed. This keeps the speed
 * consistent regardless of the distance between the two points.
 */
function dummyTransitionDuration(): number {
  return 6000
}

const Config = createSlot<EarthProps>('EarthProps')

/**
 * A React Three Fiber component representing a spinning Earth globe
 * that can also animate to face a given lat/lon position.
 */
export default withSlot(Config)(function Earth({
  speed = 1,
  spinning = true,
  direction = defaultDirection,
  position = defaultPosition,
  onTransitionStart,
  onTransitionEnd,
  transitionDuration = dummyTransitionDuration, // Use dummyTransitionDuration
}: EarthProps) {
  const groupRef = useRef<THREE.Group>(null)
  const tweenRef = useRef<TWEEN.Tween<THREE.Euler> | null>(null)
  const timeRef = useRef<number>(0)
  const mountedRef = useRef<boolean>(false)

  // Whenever the user changes `position` or `direction`, create a new tween
  useEffect(() => {
    if (!groupRef.current) return

    if (speed <= 0) return

    const naiveTargetEuler = eulerFromLatLon(position)
    const startEuler = groupRef.current.rotation.clone()

    if (startEuler.equals(naiveTargetEuler)) return

    const finalEuler = adjustForwardRotation(direction, startEuler, naiveTargetEuler)

    const ms = typeof transitionDuration === 'number'
      ? transitionDuration
      : transitionDuration()

    tweenRef.current = new TWEEN.Tween(startEuler)
      .to(finalEuler, ms)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onStart((currentRotation) => {
        onTransitionStart?.() // @todo pass some parameters
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
      .start(timeRef.current)

    return () => {
      tweenRef.current?.stop()
    }
  }, [position, direction, speed, onTransitionStart, onTransitionEnd, transitionDuration])

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
    if (!tweenRef.current && spinning && speed > 0 && groupRef.current) {
      groupRef.current.rotation.x += speed * direction.x * delta
      groupRef.current.rotation.y += speed * direction.y * delta
    }
  })

  const initialProps = useMemo(() => ({
    rotation: eulerFromLatLon(position),
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
 *  - Rotate about Y by -lng
 *  - Then rotate about X by +lat
 */
function eulerFromLatLon(position: LatLngLiteral): THREE.Euler {
  const φ = THREE.MathUtils.degToRad(position.lat) // lat
  const θ = THREE.MathUtils.degToRad(-position.lng) // lon
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
