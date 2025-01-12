import { withAuth } from '@/context/auth';
import { useFetch } from '@/hooks/useFetch';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import * as L from 'leaflet'
import * as GeoJson from "geojson";
import { useEffect, useMemo } from 'react';
import { GestureHandling } from 'leaflet-gesture-handling';

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
    if (!data) return [0, 0];
    const { lat, lng } = L.geoJSON(data).getBounds().getCenter();
    return [lat, lng];
  }, [data]);

  // Fetch data on mount
  useEffect(() => { fetch() }, []);

  if (!data || loading) return (<div>Loading...</div>);
  return (
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
      {data.features.map(({ geometry }, index) => (
        <Marker
          key={index}
          position={geometry.coordinates.toReversed() as [number, number]}
        />
      ))}
    </MapContainer>
  )
}

export default withAuth(Map);
