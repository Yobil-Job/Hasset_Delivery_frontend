import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Car icon for driver marker
const carIcon = L.divIcon({
    className: 'custom-car-icon',
    html: `
        <div style="
            width: 40px;
            height: 40px;
            background: #3b82f6;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            border: 3px solid white;
        ">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
        </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

interface LiveTrackingMapProps {
    latitude: number;
    longitude: number;
    driverName?: string;
    pickup?: RoutePoint;
    destination?: RoutePoint;
}

interface RoutePoint {
    lat: number;
    lng: number;
}

function MapUpdater({ lat, lng, routePoints, setRoutePoints, pickup, destination }: {
    lat: number;
    lng: number;
    routePoints: RoutePoint[];
    setRoutePoints: React.Dispatch<React.SetStateAction<RoutePoint[]>>;
    pickup?: RoutePoint;
    destination?: RoutePoint;
}) {
    const map = useMap();
    const prevPosition = useRef<RoutePoint | null>(null);

    useEffect(() => {
        const currentPoint = { lat, lng };

        if (pickup && destination && !prevPosition.current) {
            const bounds = L.latLngBounds(
                [pickup.lat, pickup.lng],
                [destination.lat, destination.lng]
            ).extend([lat, lng]);
            map.fitBounds(bounds, { padding: [40, 40] });
        } else {
            map.flyTo([lat, lng], map.getZoom(), {
                duration: 1.2,
                easeLinearity: 0.25
            });
        }

        // Add to route if position changed significantly (>10 meters)
        const newPoint = currentPoint;
        if (prevPosition.current) {
            const distance = map.distance(
                [prevPosition.current.lat, prevPosition.current.lng],
                [lat, lng]
            );

            // Only add point if moved more than 10 meters
            if (distance > 10) {
                setRoutePoints(prev => [...prev, newPoint]);
                prevPosition.current = newPoint;
            }
        } else {
            // First point
            setRoutePoints([newPoint]);
            prevPosition.current = newPoint;
        }
    }, [lat, lng, map, setRoutePoints, pickup, destination]);

    return null;
}

const pickupIcon = L.divIcon({
    className: 'pickup-icon',
    html: `<div style="width: 18px;height: 18px;border-radius: 9999px;background: #22c55e;border: 2px solid white;box-shadow: 0 4px 6px rgba(0,0,0,0.25);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
});

const destinationIcon = L.divIcon({
    className: 'destination-icon',
    html: `<div style="width: 18px;height: 18px;border-radius: 9999px;background: #ef4444;border: 2px solid white;box-shadow: 0 4px 6px rgba(0,0,0,0.25);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
});

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({ latitude, longitude, driverName, pickup, destination }) => {
    const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);

    return (
        <div className="h-[500px] w-full rounded-lg overflow-hidden border border-gray-200 shadow-lg bg-white">
            <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-600 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <span className="inline-block w-3 h-3 rounded-full bg-blue-500 border border-white shadow-sm" />
                        <span>Driver</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="inline-block w-4 h-[3px] rounded-full bg-blue-500" />
                        <span>Route travelled</span>
                    </div>
                </div>
                <span className="text-[10px] text-gray-400">Live GPS view</span>
            </div>
            <MapContainer
                center={[latitude, longitude]}
                zoom={15}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <LayersControl position="topright">
                    {/* Street Map Layer */}
                    <LayersControl.BaseLayer checked name="Street Map">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </LayersControl.BaseLayer>

                    {/* Satellite Layer */}
                    <LayersControl.BaseLayer name="Satellite View">
                        <TileLayer
                            attribution='Tiles &copy; Esri'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                    </LayersControl.BaseLayer>
                </LayersControl>

                {/* Route Polyline (blue line showing path traveled) */}
                {routePoints.length > 1 && (
                    <Polyline
                        positions={routePoints.map(p => [p.lat, p.lng])}
                        pathOptions={{
                            color: '#2563eb',
                            weight: 5,
                            opacity: 0.85,
                            lineCap: 'round',
                            lineJoin: 'round'
                        }}
                    />
                )}

                {pickup && (
                    <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
                        <Popup>
                            <div className="text-xs font-medium">Pickup</div>
                        </Popup>
                    </Marker>
                )}

                {destination && (
                    <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
                        <Popup>
                            <div className="text-xs font-medium">Delivery destination</div>
                        </Popup>
                    </Marker>
                )}

                {/* Driver Marker with Car Icon */}
                <Marker position={[latitude, longitude]} icon={carIcon}>
                    <Popup>
                        <div className="text-center">
                            <p className="font-semibold">{driverName || 'Driver'}</p>
                            <p className="text-xs text-gray-500">Live Location</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {latitude.toFixed(6)}, {longitude.toFixed(6)}
                            </p>
                        </div>
                    </Popup>
                </Marker>

                <MapUpdater
                    lat={latitude}
                    lng={longitude}
                    routePoints={routePoints}
                    setRoutePoints={setRoutePoints}
                    pickup={pickup}
                    destination={destination}
                />
            </MapContainer>
        </div>
    );
};
