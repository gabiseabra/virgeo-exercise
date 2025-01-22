import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function Universe({
  pointSize = 1.2,
  points = 6000,
  distance = 2000,
  speed = 0.00015,
}: {
  pointSize?: number
  points?: number
  distance?: number
  speed?: number
}) {
  const starsRef = useRef<THREE.Points>(null)
  const starMaterial = useMemo(() => new THREE.PointsMaterial({
    color: 0xffffff,
    size: pointSize,
    sizeAttenuation: true,
    transparent: true,
  }), [pointSize])
  const starGeometry = useMemo(() => {
    const starGeometry = new THREE.BufferGeometry()
    const starVertices = []
    for (let i = 0; i < points; i++) {
      const x = (Math.random() - 0.5) * distance
      const y = (Math.random() - 0.5) * distance
      const z = (Math.random() - 0.5) * distance
      starVertices.push(x, y, z)
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))
    return starGeometry
  }, [points, distance])
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
