import { withAuth } from '@/context/auth';
import { logApiError, useFetch } from '@/hooks/useFetch';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import * as L from 'leaflet'
import * as GeoJson from "geojson";
import { useEffect, useMemo } from 'react';
import { GestureHandling } from 'leaflet-gesture-handling';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import Shell from '@/components/Shell';

const AmsterdamCentraal: [number, number] = [52.379189, 4.899431];

function MapController() {
  const map = useMap();
  useEffect(() => {
    map.addHandler("gestureHandling", GestureHandling);
    // @ts-expect-error typescript does not see additional handler here
    map.gestureHandling.enable();
  }, [map]);
  return null;
}

function Map() {
  const [{ data, loading }, fetch] = useFetch<GeoJson.FeatureCollection<GeoJson.Point>>({
    method: 'GET',
    url: '/data',
  });
  const center = useMemo<[number, number]>(() => {
    if (!data || !data.features.length) return AmsterdamCentraal;
    const { lat, lng } = L.geoJSON(data).getBounds().getCenter();
    return [lat, lng];
  }, [data]);

  // Fetch data on mount
  useEffect(() => { fetch().catch(logApiError()) }, []);

  if (!data || loading) return (<div>Loading...</div>);
  return (
    <>
      <Shell.Header>
        <h1>Map</h1>
      </Shell.Header>

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
          {data.features.map(({ geometry }, index) => (
            <Marker
              key={index}
              position={geometry.coordinates.toReversed() as [number, number]}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </>
  )
}

export default withAuth(Map);
