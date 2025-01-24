import { withAuth } from '@/context/auth'
import { logApiError, useFetch } from '@/hooks/useFetch'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import * as L from 'leaflet'
import * as GeoJson from 'geojson'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { GestureHandling } from 'leaflet-gesture-handling'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import Shell from '@/components/app/Shell'
import World from '@/components/three/World'
import * as Styles from './index.module.scss'

const AmsterdamCentraal: [number, number] = [52.379189, 4.899431]

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

  const center = useMemo<[number, number]>(() => {
    if (isEmpty) return AmsterdamCentraal
    const { lat, lng } = L.geoJSON(response.data).getBounds().getCenter()
    return [lat, lng]
  }, [response.data, isEmpty])

  // Fetch data on mount
  useEffect(() => { request().catch(logApiError()) }, [request])
  const [mapVisible, setMapVisible] = useState(false)
  const handleTransitionEnd = useCallback(() => {
    setMapVisible(true)
  }, [])

  if (isLoading) return (<div>Loading...</div>)
  return (
    <>
      <Shell.Header>
        <h1>Map</h1>
      </Shell.Header>

      <World.Config
        spinning={false}
        center={{ x: center[0], y: center[1] }}
        onTransitionEnd={handleTransitionEnd}
        transitionDuration={1000}
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
