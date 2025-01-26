import { withAuth } from '@/context/auth'
import { logApiError, useFetch } from '@/hooks/useFetch'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import * as TWEEN from '@tweenjs/tween.js'
import * as L from 'leaflet'
import * as GeoJson from 'geojson'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { GestureHandling } from 'leaflet-gesture-handling'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import Shell from '@/components/app/Shell'
import Earth from '@/components/three/Earth'
import Camera from '@/components/three/Camera'
import * as Styles from './index.module.scss'

const worldTransitionDuration = 2000
const mapTransitionDuration = parseInt(Styles.mapTransitionDuration, 10)

function MapController() {
  const map = useMap()
  useEffect(() => {
    map.addHandler('gestureHandling', GestureHandling)
    // @ts-expect-error typescript does not see additional handler here
    map.gestureHandling.enable()
  }, [map])
  return null
}

function Map() {
  const [response, request] = useFetch<GeoJson.FeatureCollection<GeoJson.Point>>({
    method: 'GET',
    url: '/data',
  })
  const points = response.data?.features ?? []
  const isLoading = !response.data || response.loading
  const isEmpty = !points.length

  const center: L.LatLngLiteral = useMemo(() => {
    if (isEmpty) return { lat: 0, lng: 0 }
    return L.geoJSON(response.data).getBounds().getCenter()
  }, [response.data, isEmpty])

  // Fetch data on mount
  useEffect(() => { request().catch(logApiError()) }, [request])
  const [mapVisible, setMapVisible] = useState(false)

  const handleTransitionStart = useCallback(() => {
    setTimeout(() => {
      setMapVisible(true)
    }, worldTransitionDuration - mapTransitionDuration)
  }, [])

  // Showing the 3D scene in the default state
  if (isLoading) return null
  return (
    <>
      <Shell.Header>
        <h1>Map</h1>
      </Shell.Header>

      <Earth.Config
        position={center}
        onTransitionStart={handleTransitionStart}
        transitionDuration={worldTransitionDuration}
        easing={TWEEN.Easing.Quadratic.Out}
      />
      <Camera.Config
        zoom={2}
        fov={3}
        position={[0, -0.05, 3]}
        transitionDuration={worldTransitionDuration}
      />

      <div className={Styles.map} data-hidden={!mapVisible}>
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={false}
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            top: 0,
            left: 0,
          }}
        >
          <MapController />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MarkerClusterGroup
            animate={false}
            disableClusteringAtZoom={18}
          >
            {points.map(({ geometry }, index) => (
              <Marker
                key={index}
                position={geometry.coordinates.toReversed() as [number, number]}
              />
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </>
  )
}

export default withAuth(Map)
