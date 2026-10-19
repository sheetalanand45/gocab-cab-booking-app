
"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import {
  CarFront,
  CheckCircle2,
  Clock,
  LogOut,
  MapPin,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

type DriverProfile = {
  user_id: string;
  full_name: string;
  phone: string | null;
  vehicle_type: "mini" | "sedan" | "xl";
  vehicle_number: string;
  is_available: boolean;
};

type Ride = {
  id: string;
  rider_id: string;
  driver_id: string | null;
  pickup_address: string;
  dropoff_address: string;
  cab_type: string;
  distance_km: number;
  estimated_fare: number;
  status: string;
  payment_status: string;
  created_at: string;
};

export default function DriverDashboard({
  user,
  onSignOut,
}: {
  user: User;
  onSignOut: () => void;
}) {
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [fullName, setFullName] = useState(
    user.user_metadata?.full_name ?? ""
  );
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState<"mini" | "sedan" | "xl">(
    "mini"
  );
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);

    try {
      const { data: driver, error: driverError } = await supabase
        .from("driver_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (driverError) throw driverError;

      setProfile(driver as DriverProfile | null);

      if (!driver) {
        setRides([]);
        return;
      }

      const { data: rideData, error: rideError } = await supabase
        .from("rides")
        .select(
          "id, rider_id, driver_id, pickup_address, dropoff_address, cab_type, distance_km, estimated_fare, status, payment_status, created_at"
        )
        .or(`driver_id.eq.${user.id},status.eq.requested`)
        .order("created_at", { ascending: false });

      if (rideError) throw rideError;

      setRides((rideData ?? []) as Ride[]);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Unable to load the driver dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
        void loadDashboard();
    }, 0);

    return () => {
        window.clearTimeout(timer);
    };
  }, [loadDashboard]);

  async function registerDriver(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice("");

    try {
      const { error } = await supabase.from("driver_profiles").insert({
        user_id: user.id,
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        vehicle_type: vehicleType,
        vehicle_number: vehicleNumber.trim().toUpperCase(),
        is_available: false,
      });

      if (error) throw error;

      setNotice("Driver profile created successfully!");
      await loadDashboard();
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Unable to register as a driver."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability() {
    if (!profile) return;

    setSaving(true);
    setNotice("");

    try {
      const { error } = await supabase
        .from("driver_profiles")
        .update({ is_available: !profile.is_available })
        .eq("user_id", user.id);

      if (error) throw error;

      setNotice(
        profile.is_available
          ? "You are now offline."
          : "You are now available for rides."
      );

      await loadDashboard();
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Unable to update your availability."
      );
    } finally {
      setSaving(false);
    }
  }

  async function acceptRide(rideId: string) {
    setSaving(true);
    setNotice("");

    try {
      const { error } = await supabase.rpc("accept_ride", {
        p_ride_id: rideId,
      });

      if (error) throw error;

      setNotice("Ride accepted successfully!");
      await loadDashboard();
    } catch (error) {
      console.error("Accept ride failed:", error);

      setNotice(
        error instanceof Error
          ? `Could not accept ride: ${error.message}`
          : "Could not accept ride. Check the browser console."
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateRideStatus(
    rideId: string,
    newStatus: "driver_arriving" | "in_progress" | "completed"
  ) {
    setSaving(true);
    setNotice("");

    try {
      const { error } = await supabase.rpc("update_driver_ride_status", {
        p_ride_id: rideId,
        p_new_status: newStatus,
      });

      if (error) throw error;

      setNotice(
        newStatus === "driver_arriving"
          ? "Status updated: Driver arriving."
          : newStatus === "in_progress"
            ? "Ride started successfully."
            : "Ride completed successfully."
      );

      await loadDashboard();
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Unable to update ride status."
      );
    } finally {
      setSaving(false);
    }
  }


  if (loading && !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <p className="text-slate-600">Loading Driver Dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-600 p-2 text-white">
              <CarFront size={25} />
            </div>
            <div>
              <h1 className="text-xl font-black">GoCab Driver</h1>
              <p className="text-sm text-slate-500">Driver Dashboard</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onSignOut}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold hover:bg-slate-100"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 px-5 py-8">
        {notice && (
          <div
            role="status"
            className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-800"
          >
            {notice}
          </div>
        )}

        {!profile ? (
          <section className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <ShieldCheck className="mb-4 text-indigo-600" size={36} />
            <h2 className="text-2xl font-black">Driver Registration</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Enter your details to create your driver profile.
            </p>

            <form onSubmit={registerDriver} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-bold">
                  Full name
                </label>
                <input
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold">
                  Phone number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold">
                  Vehicle type
                </label>
                <select
                  value={vehicleType}
                  onChange={(event) =>
                    setVehicleType(event.target.value as "mini" | "sedan" | "xl")
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
                >
                  <option value="mini">Go Mini</option>
                  <option value="sedan">Go Sedan</option>
                  <option value="xl">Go XL</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold">
                  Vehicle registration number
                </label>
                <input
                  required
                  value={vehicleNumber}
                  onChange={(event) => setVehicleNumber(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 uppercase outline-none focus:border-indigo-500"
                  placeholder="e.g. DL01AB1234"
                />
              </div>

              <button
                disabled={saving}
                className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Registering..." : "Register as Driver"}
              </button>
            </form>
          </section>
        ) : (
          <>
            <section className="flex flex-col justify-between gap-5 rounded-3xl bg-indigo-600 p-6 text-white sm:flex-row sm:items-center">
              <div>
                <p className="text-sm text-indigo-100">Welcome back,</p>
                <h2 className="mt-1 text-2xl font-black">
                  {profile.full_name}
                </h2>
                <p className="mt-2 text-sm text-indigo-100">
                  {profile.vehicle_type.toUpperCase()} · {profile.vehicle_number}
                </p>
                <p className="mt-1 text-sm text-indigo-100">
                  {profile.phone || "Phone number not provided"}
                </p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() => void toggleAvailability()}
                className={`rounded-xl px-5 py-3 font-bold disabled:opacity-50 ${
                  profile.is_available
                    ? "bg-white text-indigo-700"
                    : "bg-indigo-800 text-white hover:bg-indigo-900"
                }`}
              >
                {profile.is_available
                  ? "Go Offline"
                  : "Go Online"}
              </button>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black">Ride Requests</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Review new bookings and accept a ride when you are online.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void loadDashboard()}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold hover:bg-slate-50"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>

              {!profile.is_available && (
                <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                  You are offline. Go online to accept new rides.
                </p>
              )}

              <div className="mt-5 space-y-4">
                {rides.filter(
                  (ride) =>
                    ride.driver_id === user.id ||
                    (ride.status === "requested" && !ride.driver_id)
                ).length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                    <CarFront className="mx-auto text-slate-400" size={32} />
                    <p className="mt-3 font-bold">No rides to show</p>
                    <p className="mt-1 text-sm text-slate-500">
                      New ride requests will appear here when available.
                    </p>
                  </div>
                ) : (
                  rides
                    .filter(
                      (ride) =>
                        ride.driver_id === user.id ||
                        (ride.status === "requested" && !ride.driver_id)
                    )
                    .map((ride) => (
                      <article
                        key={ride.id}
                        className="rounded-2xl border border-slate-200 p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-extrabold">
                              {ride.cab_type.toUpperCase()} Ride
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {new Date(ride.created_at).toLocaleString()}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xl font-black">
                              ₹{Number(ride.estimated_fare).toFixed(0)}
                            </p>
                            <p className="text-xs capitalize text-slate-500">
                              {ride.status.replaceAll("_", " ")}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          <p className="flex items-start gap-2 text-sm">
                            <MapPin
                              className="mt-0.5 shrink-0 text-emerald-600"
                              size={17}
                            />
                            <span>
                              <strong>Pickup:</strong> {ride.pickup_address}
                            </span>
                          </p>
                          <p className="flex items-start gap-2 text-sm">
                            <MapPin
                              className="mt-0.5 shrink-0 text-rose-600"
                              size={17}
                            />
                            <span>
                              <strong>Drop-off:</strong> {ride.dropoff_address}
                            </span>
                          </p>
                          <p className="flex items-center gap-2 text-sm text-slate-500">
                            <Clock size={16} />
                            {Number(ride.distance_km).toFixed(1)} km
                          </p>
                        </div>

                        
                        {ride.driver_id === user.id ? (
                        <div className="mt-4 space-y-3">
                            <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
                            <CheckCircle2 size={18} />
                            Your ride · {ride.status.replaceAll("_", " ")}
                            </p>

                            {ride.status === "accepted" && (
                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => void updateRideStatus(ride.id, "driver_arriving")}
                                className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white disabled:opacity-50"
                            >
                                Driver Arriving
                            </button>
                            )}

                            {ride.status === "driver_arriving" && (
                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => void updateRideStatus(ride.id, "in_progress")}
                                className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white disabled:opacity-50"
                            >
                                Start Ride
                            </button>
                            )}

                            {ride.status === "in_progress" && (
                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => void updateRideStatus(ride.id, "completed")}
                                className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white disabled:opacity-50"
                            >
                                Complete Ride
                            </button>
                            )}

                            {ride.status === "completed" && (
                            <p className="rounded-xl bg-slate-100 p-3 text-sm font-bold text-slate-600">
                                This ride is completed.
                            </p>
                            )}
                        </div>
                        ) : (
                        <button
                            type="button"
                            disabled={saving || !profile.is_available}
                            onClick={() => void acceptRide(ride.id)}
                            className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? "Please wait..." : "Accept Ride"}
                        </button>
                        )}

                      </article>
                    ))
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
