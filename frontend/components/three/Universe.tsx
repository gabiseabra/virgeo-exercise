import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function Universe({
  pointSize = 1,
  points = 500000,
  distance = 100,
  range = 4000,
  speed = 0.00015,
}: {
  /** Size of each point in the universe */
  pointSize?: number
  /** Number of points (stars) in the universe */
  points?: number
  /** Minimum distance from the center for points */
  distance?: number
  /** Range of distance from the center for points */
  range?: number
  /** Speed of rotation for the universe */
  speed?: number
}) {
  const starsRef = useRef<THREE.Points>(null)
  const starMaterial = useMemo(() => new THREE.PointsMaterial({
    color: 0xffffff,
    size: pointSize,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.8,
    fog: true,
  }), [pointSize])
  const starGeometry = useMemo(() => {
    const starGeometry = new THREE.BufferGeometry()
    const starVertices = []
    for (let i = 0; i < points; i++) {
      // Generate random spherical coordinates
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos((Math.random() * 2) - 1)
      // Convert spherical coordinates to a unit vector
      const unitVector = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi),
      )
      // Scale the unit vector by a random distance within the specified range
      const distanceFromCenter = distance + Math.random() * range
      const position = unitVector.multiplyScalar(distanceFromCenter)
      // Add the position to the vertices array
      starVertices.push(position.x, position.y, position.z)
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))
    return starGeometry
  }, [points, distance, range])
  useFrame(() => {
    if (!starsRef.current) return
    starsRef.current.rotation.x += speed
    starsRef.current.rotation.y += speed
  })
  return (
    <points
      ref={starsRef}
      geometry={starGeometry}
      material={starMaterial}
    />
  )
}
