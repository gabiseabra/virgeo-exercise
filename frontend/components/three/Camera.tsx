import { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'
import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { createSlotFill, withSlot } from '@/context/slots'
import { equals } from '@/utils/equals'

export type CameraProps = {
  position?: [number, number, number]
  rotation?: [number, number, number]
  zoom?: number
  fov?: number
}

export type AnimatedCameraProps = CameraProps & {
  /**
   * How long the tween should take (in ms).
   * Defaults to 1000ms.
   */
  transitionDuration?: number

  /**
   * Called when the transition (tween) *starts*.
   */
  onTransitionStart?: () => void

  /**
   * Called when the transition (tween) *completes*.
   */
  onTransitionEnd?: () => void

  /**
   * If true, this camera will become the default in the scene.
   * Defaults to true.
   */
  makeDefault?: boolean
}

const Config = createSlotFill<AnimatedCameraProps>('Camera.Config')

/**
 * A React component that animates a PerspectiveCamera’s
 * position, zoom, and fov whenever these props change.
 *
 * It reads the camera’s *current* values on each change,
 * so you don’t need to pass an "initial" value.
 */
export default withSlot(Config)(function Camera({
  position,
  rotation,
  zoom = 1,
  fov = 60,
  transitionDuration = 1000,
  onTransitionStart,
  onTransitionEnd,
  makeDefault = true,
}: AnimatedCameraProps) {
  // Store the camera instance
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)

  // Active tween reference (if any)
  const tweenRef = useRef<TWEEN.Tween<CameraProps> | null>(null)

  // We track time in milliseconds to pass into TWEEN.update()
  const timeRef = useRef<number>(0)

  /**
   * Whenever position/zoom/fov changes, we create a new tween:
   * - from the camera’s *current* state
   * - to the new props
   */
  useEffect(() => {
    const camera = cameraRef.current
    if (!camera) return

    const from = cameraPropsFromCamera(camera)
    const to: CameraProps = { position, rotation, zoom, fov }

    if (equals(from, to)) return

    // Create the tween
    tweenRef.current = new TWEEN.Tween(from)
      .to(to, transitionDuration)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onStart(() => {
        onTransitionStart?.()
      })
      .onUpdate((current) => {
        if (!cameraRef.current) return
        updateCameraProps(cameraRef.current, current)
      })
      .onComplete(() => {
        tweenRef.current = null
        onTransitionEnd?.()
      })
      // Start using the *current* time, so it's in sync with useFrame
      .start(timeRef.current)

    // Cleanup if the component unmounts or re-renders
    return () => {
      tweenRef.current?.stop()
    }
  }, [position, rotation, zoom, fov, transitionDuration, onTransitionStart, onTransitionEnd])

  useFrame(({ clock }) => {
    timeRef.current = clock.getElapsedTime() * 1000
    tweenRef.current?.update(timeRef.current)
  })

  const initialProps = useMemo(() => ({ position, rotation, zoom, fov }), [])

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault={makeDefault}
      {...initialProps}
    />
  )
})

const cameraPropsFromCamera = (camera: THREE.PerspectiveCamera): CameraProps => ({
  position: [camera.position.x, camera.position.y, camera.position.z],
  rotation: [camera.rotation.x, camera.rotation.y, camera.rotation.z],
  zoom: camera.zoom,
  fov: camera.fov,
})

const updateCameraProps = (camera: THREE.PerspectiveCamera, props: CameraProps) => {
  if (props.position)
    camera.position.set(...props.position)
  if (props.rotation)
    camera.rotation.set(...props.rotation)
  if (props.zoom)
    camera.zoom = props.zoom
  if (props.fov)
    camera.fov = props.fov
  camera.updateProjectionMatrix()
}

/**
 * Compute the rotation needed so that a camera positioned at `from` will face `to`, using `up` as the "up" direction.
 */
export const lookAt = (
  from: [number, number, number],
  to: [number, number, number],
  up: [number, number, number] = [0, 1, 0],
): [number, number, number] => {
  const matrix = new THREE.Matrix4()
  // Build a look-at view matrix from cameraPos to targetPos
  matrix.lookAt(
    new THREE.Vector3(...from),
    new THREE.Vector3(...to),
    new THREE.Vector3(...up),
  )

  // Extract the rotation (as a quaternion) from that matrix
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(matrix)

  // Convert the quaternion to Euler angles
  const euler = new THREE.Euler().setFromQuaternion(quaternion, 'XYZ')

  return [euler.x, euler.y, euler.z]
}
