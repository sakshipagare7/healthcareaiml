'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Phone,
  Copy,
  Check,
  Building2,
  Clock,
  ShieldCheck,
  ExternalLink,
  Compass,
  Search,
  Filter
} from 'lucide-react';

interface Hospital {
  id: string;
  name: string;
  area: string;
  address: string;
  phone: string;
  emergencyPhone: string;
  lat: number;
  lng: number;
  type: string;
  services: string[];
  distanceKm?: number;
}

const TRAUMA_CENTERS: Hospital[] = [
  {
    id: 'hinduja',
    name: 'P. D. Hinduja National Hospital & Medical Research Centre',
    area: 'Mahim',
    address: 'Veer Savarkar Marg, Mahim West, Mumbai, Maharashtra 400016',
    phone: '+91 22 2445 1515',
    emergencyPhone: '+91 22 2444 7000',
    lat: 19.0330,
    lng: 72.8397,
    type: 'Level 1 Trauma & Tertiary Multi-Specialty',
    services: ['24x7 Cath Lab', 'Emergency Stroke Team', 'ICU/CCU', 'Blood Bank', 'Trauma Surgery']
  },
  {
    id: 'lilavati',
    name: 'Lilavati Hospital & Research Centre',
    area: 'Bandra West',
    address: 'A-791, Bandra Reclamation, Bandra West, Mumbai, Maharashtra 400050',
    phone: '+91 22 2675 1000',
    emergencyPhone: '+91 22 2656 8000',
    lat: 19.0514,
    lng: 72.8295,
    type: 'Apex Emergency & Super-Specialty',
    services: ['Cardiac Resuscitation', '24x7 Casualty', 'Neuro-Trauma Unit', 'Emergency Dialysis']
  },
  {
    id: 'sion',
    name: 'Lokmanya Tilak Municipal General Hospital (Sion Hospital)',
    area: 'Sion',
    address: 'Sion West, Mumbai, Maharashtra 400022',
    phone: '+91 22 2407 6381',
    emergencyPhone: '+91 22 2406 3000',
    lat: 19.0390,
    lng: 72.8601,
    type: 'Premier Municipal Apex Trauma Centre',
    services: ['24x7 Free Casualty', 'Comprehensive Burn Care', 'Apex Trauma Center', 'Emergency ICU']
  },
  {
    id: 'kem',
    name: 'King Edward Memorial (KEM) Hospital',
    area: 'Parel',
    address: 'Acharya Donde Marg, Parel, Mumbai, Maharashtra 400012',
    phone: '+91 22 2410 7000',
    emergencyPhone: '+91 22 2413 6051',
    lat: 19.0028,
    lng: 72.8427,
    type: 'Government Apex Tertiary Care & Teaching Hospital',
    services: ['24x7 Emergency Casualty', 'Level 1 Trauma Care', 'Central Blood Bank', 'Intensive Care']
  },
  {
    id: 'holyfamily',
    name: 'Holy Family Multispeciality Hospital',
    area: 'Bandra West',
    address: 'St. Andrew\'s Road, Bandra West, Mumbai, Maharashtra 400050',
    phone: '+91 22 6267 0555',
    emergencyPhone: '+91 22 6267 0112',
    lat: 19.0573,
    lng: 72.8272,
    type: 'Multi-Specialty Emergency Care',
    services: ['24x7 Heart Attack Center', 'Acute Medical ICU', 'Emergency Operation Theatres']
  },
  {
    id: 'cooper',
    name: 'Dr. R. N. Cooper Municipal General Hospital',
    area: 'Juhu / Vile Parle',
    address: 'U-15, N. S. Road, Juhu, Mumbai, Maharashtra 400056',
    phone: '+91 22 2620 7254',
    emergencyPhone: '+91 22 2620 7255',
    lat: 19.1075,
    lng: 72.8364,
    type: 'Municipal Trauma & Emergency Hospital',
    services: ['24x7 Emergency Ward', 'Rapid Ambulance Bay', 'Casualty Operation Theatre']
  }
];

// Haversine formula to compute great-circle distance in kilometers
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function HospitalLocator() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Location access was denied. You can still browse the emergency directory below or use manual search.');
        } else {
          setGpsError('Unable to detect location. Showing verified 24x7 trauma directory.');
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const copyPhoneNumber = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Compute distance and sort
  const hospitalsWithDistance = TRAUMA_CENTERS.map((h) => {
    if (userLocation) {
      const distance = calculateHaversineDistance(userLocation.lat, userLocation.lng, h.lat, h.lng);
      return { ...h, distanceKm: distance };
    }
    return h;
  });

  const filteredHospitals = hospitalsWithDistance
    .filter((h) => {
      const matchesSearch =
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.services.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesArea = selectedArea === 'all' || h.area.toLowerCase().includes(selectedArea.toLowerCase());
      return matchesSearch && matchesArea;
    })
    .sort((a, b) => {
      if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm;
      }
      return 0;
    });

  const areas = ['all', 'Mahim', 'Bandra', 'Sion', 'Parel', 'Juhu'];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-[#0B2545]">
                Nearby 24x7 Emergency Trauma Centers & Hospitals
              </h3>
              <p className="text-xs text-slate-500">
                Verified emergency casualty desks, ICU capabilities, and instant turn-by-turn routing
              </p>
            </div>
          </div>
        </div>

        {/* GPS Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={requestGeolocation}
            disabled={gpsLoading}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-xs ${
              userLocation
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-[#0B2545] hover:bg-slate-800 text-white'
            }`}
          >
            <Compass className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
            <span>
              {gpsLoading
                ? 'Detecting Location...'
                : userLocation
                ? `GPS Active (${userLocation.lat.toFixed(3)}, ${userLocation.lng.toFixed(3)})`
                : 'Use My Current Location'}
            </span>
          </button>

          {userLocation && (
            <a
              href={`https://www.google.com/maps/search/emergency+hospital+trauma+center/@${userLocation.lat},${userLocation.lng},14z`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold transition-all"
            >
              <Navigation className="w-3.5 h-3.5 text-teal-600" />
              <span>Map View</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
            </a>
          )}
        </div>
      </div>

      {gpsError && (
        <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
          <span>{gpsError}</span>
          <button
            onClick={() => setGpsError(null)}
            className="text-amber-700 hover:text-amber-900 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search hospitals by name, area (Mahim, Bandra, Sion) or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
          {areas.map((area) => (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedArea === area
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {area === 'all' ? 'All Areas' : area}
            </button>
          ))}
        </div>
      </div>

      {/* Hospital Cards Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHospitals.map((hospital) => (
          <div
            key={hospital.id}
            className="rounded-xl border border-slate-200 hover:border-teal-300 p-4 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
                  24x7 Casualty
                </span>
                {hospital.distanceKm !== undefined && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                    <Navigation className="w-3 h-3 text-teal-600" />
                    {hospital.distanceKm} km away
                  </span>
                )}
              </div>

              <h4 className="font-bold text-slate-900 text-sm leading-snug mb-1">
                {hospital.name}
              </h4>
              <p className="text-[11px] text-slate-500 mb-2 flex items-start gap-1">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                <span>{hospital.address}</span>
              </p>

              <div className="text-[11px] text-slate-600 mb-3 font-medium">
                <span className="text-slate-400">Type: </span>
                {hospital.type}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1 mb-4">
                {hospital.services.slice(0, 3).map((srv, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200"
                  >
                    {srv}
                  </span>
                ))}
                {hospital.services.length > 3 && (
                  <span className="text-[10px] text-slate-500 self-center">
                    +{hospital.services.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <a
                  href={`tel:${hospital.emergencyPhone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call ER</span>
                </a>
                <button
                  onClick={() => copyPhoneNumber(hospital.id, hospital.emergencyPhone)}
                  title="Copy emergency casualty phone number"
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs transition-all"
                >
                  {copiedId === hospital.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  hospital.name + ' ' + hospital.address
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-all"
              >
                <span>Navigate</span>
                <ExternalLink className="w-3 h-3 text-teal-600" />
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Emergency Directory verified for tertiary acute care and trauma resuscitation.</span>
        <span className="font-semibold text-slate-700">Central Emergency Helpline: 112</span>
      </div>
    </div>
  );
}
