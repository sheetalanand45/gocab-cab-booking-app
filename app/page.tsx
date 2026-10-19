
"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import DriverDashboard from "@/components/DriverDashboard";
import RideReceipt from "@/components/RideReceipt";
import {
  ArrowRight,
  Car,
  CheckCircle2,
  Clock,
  CreditCard,
  LogOut,
  MapPin,
  Navigation,
  ShieldCheck,
  User as UserIcon,
  Wallet,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import LocationSearch, {
  type LocationValue,
} from "@/components/LocationSearch";

// OpenStreetMap / Leaflet must load on the client only.
const GoCabMap = dynamic(() => import("@/components/GoCabMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[350px] items-center justify-center bg-slate-100 text-slate-500">
      Loading OpenStreetMap...
    </div>
  ),
});

type Cab = {
  id: string;
  name: string;
  description: string;
  baseFare: number;
  perKm: number;
  capacity: string;
  icon: string;
};

const cabs: Cab[] = [
  {
    id: "mini",
    name: "Go Mini",
    description: "Affordable rides for everyday travel",
    baseFare: 50,
    perKm: 12,
    capacity: "3 seats",
    icon: "🚕",
  },
  {
    id: "sedan",
    name: "Go Sedan",
    description: "Comfortable rides for extra space",
    baseFare: 80,
    perKm: 16,
    capacity: "4 seats",
    icon: "🚘",
  },
  {
    id: "xl",
    name: "Go XL",
    description: "Extra space for groups and luggage",
    baseFare: 110,
    perKm: 21,
    capacity: "6 seats",
    icon: "🚙",
  },
];

function getFare(cab: Cab, distanceKm: number) {
  return Math.max(70, Math.round(cab.baseFare + distanceKm * cab.perKm));
}

// ---------------- AUTHENTICATION ----------------

function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (mode === "signup") {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: name.trim() },
          },
        });

        if (authError) throw authError;

        if (data.session) {
          setMessage("Account created successfully!");
        } else {
          setMessage(
            "Account created. Check your email for a confirmation link if required."
          );
        }
      } else {
        const { error: authError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (authError) throw authError;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Authentication failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-900 p-5">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
        <section className="hidden flex-col justify-between bg-indigo-600 p-10 text-white md:flex">
          <div>
            <div className="flex items-center gap-3 text-2xl font-extrabold">
              <span className="rounded-xl bg-white/15 p-3">
                <Car size={28} />
              </span>
              GoCab
            </div>

            <h1 className="mt-16 text-4xl font-extrabold leading-tight">
              Your journey,
              <br />
              your way.
            </h1>

            <p className="mt-5 max-w-sm leading-7 text-indigo-100">
              Book your ride, discover driving routes, and travel with
              confidence.
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm text-indigo-100">
            <ShieldCheck size={21} />
            Convenient and reliable ride booking
          </div>
        </section>

        <section className="p-7 sm:p-10">
          <div className="mb-8 flex items-center gap-3 text-2xl font-extrabold text-indigo-700 md:hidden">
            <Car size={28} />
            GoCab
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900">
            {mode === "login" ? "Welcome back!" : "Create your account"}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {mode === "login"
              ? "Sign in to continue booking your rides."
              : "Sign up to get started with GoCab."}
          </p>

          <form onSubmit={handleAuth} className="mt-8 space-y-5">
            {mode === "signup" && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full name
                </label>
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email address
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>
              <input
                required
                type="password"
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {message && (
              <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
                setMessage("");
              }}
              className="font-bold text-indigo-600 hover:underline"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </section>
      </div>
    </main>
  );
}


type Ride = {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  cab_type: string;
  distance_km: number;
  duration_minutes: number;
  estimated_fare: number;
  status: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
};


// ---------------- BOOKING PAGE ----------------

function BookingPage({ user }: { user: User }) {
  const [pickup, setPickup] = useState<LocationValue | null>(null);
  const [drop, setDrop] = useState<LocationValue | null>(null);

  // Leaflet uses [latitude, longitude] for map positions.
  const [routeCoordinates, setRouteCoordinates] = useState<
    [number, number][]
  >([]);

  const [distanceKm, setDistanceKm] = useState(0);
  const [duration, setDuration] = useState("");
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [selectedCab, setSelectedCab] = useState("mini");
  const [rideStatus, setRideStatus] = useState("");
  const [bookingComplete, setBookingComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [currentRideId, setCurrentRideId] = useState<string | null>(null);
  const [myRides, setMyRides] = useState<Ride[]>([]);
  const [ridesLoading, setRidesLoading] = useState(false);
  const [ridesError, setRidesError] = useState("");
  const [cancellingRideId, setCancellingRideId] = useState<string | null>(null);
  const [cancelRideError, setCancelRideError] = useState("");
  const [cancelRideMessage, setCancelRideMessage] = useState("");
  const [receiptRideId, setReceiptRideId] = useState<string | null>(null);

  const selectedCabDetails =
    cabs.find((cab) => cab.id === selectedCab) ?? cabs[0];

  const fare = distanceKm > 0
    ? getFare(selectedCabDetails, distanceKm)
    : 0;

  function clearRoute() {
    setRouteCoordinates([]);
    setDistanceKm(0);
    setDuration("");
    setRouteError("");
    setBookingComplete(false);
    setPaymentComplete(false);
    setDurationMinutes(0);
    setCurrentRideId(null);
  }

  async function calculateRoute() {
    if (!pickup || !drop) {
      setRideStatus(
        "Choose both pickup and destination from the suggestions."
      );
      return;
    }

    if (pickup.lat === drop.lat && pickup.lng === drop.lng) {
      setRouteError("Pickup and destination must be different.");
      return;
    }

    setRouteLoading(true);
    setRouteError("");
    setRouteCoordinates([]);
    setDistanceKm(0);
    setDuration("");
    setRideStatus("");

    try {
      const response = await fetch("/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // OpenRouteService requires [longitude, latitude].
          pickup: [pickup.lng, pickup.lat],
          dropoff: [drop.lng, drop.lat],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to calculate the route.");
      }

      if (
        !Array.isArray(data.geometry?.coordinates) ||
        data.geometry.coordinates.length < 2 ||
        !Number.isFinite(data.distanceKm) ||
        !Number.isFinite(data.durationMinutes)
      ) {
        throw new Error("The routing service returned invalid route details.");
      }

      const points: [number, number][] =
        data.geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng]
        );

      setRouteCoordinates(points);
      setDistanceKm(data.distanceKm);
      setDurationMinutes(data.durationMinutes);

      const minutes = Math.round(data.durationMinutes);
      setDuration(
        minutes >= 60
          ? `${Math.floor(minutes / 60)} hr ${minutes % 60} min`
          : `${minutes} min`
      );

      setRideStatus("Driving route found. Your fare is ready!");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to calculate the route.";

      setRouteError(errorMessage);
      setRideStatus("");
    } finally {
      setRouteLoading(false);
    }
  }

  
  async function bookRide() {
    if (!pickup || !drop || routeCoordinates.length < 2) {
      setRideStatus("Select both locations and calculate your route first.");
      return;
    }

    if (distanceKm <= 0 || durationMinutes <= 0 || fare <= 0) {
      setRideStatus("Please calculate a valid route and fare first.");
      return;
    }

    setRouteError("");
    setBookingLoading(true);
    setRideStatus("");
    setBookingComplete(false);
    setPaymentComplete(false);

    try {
      const { data: ride, error } = await supabase
        .from("rides")
        .insert({
          rider_id: user.id,
          pickup_address: pickup.address,
          pickup_lat: pickup.lat,
          pickup_lng: pickup.lng,
          dropoff_address: drop.address,
          dropoff_lat: drop.lat,
          dropoff_lng: drop.lng,
          cab_type: selectedCab,
          distance_km: distanceKm,
          duration_minutes: durationMinutes,
          estimated_fare: fare,
          status: "requested",
          payment_method: paymentMethod,
          payment_status: "pending",
        })
        .select("id")
        .single();

      if (error) throw error;

      setCurrentRideId(ride.id);
      setBookingComplete(true);
      setRideStatus(
        `Your ${selectedCabDetails.name} ride has been saved! You can now continue to demo payment.`
      );

      await loadMyRides();
    } catch (err: unknown) {
      console.error("Ride booking failed:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Unknown error. Check the browser console.";

      setRideStatus(`Unable to save your ride: ${message}`);
    } finally {
      setBookingLoading(false);
    }
  }

  const loadMyRides = useCallback(async () => {
    setRidesLoading(true);
    setRidesError("");

    try {
      const { data, error } = await supabase
        .from("rides")
        .select(
          "id, pickup_address, dropoff_address, cab_type, distance_km, duration_minutes, estimated_fare, status, payment_method, payment_status, created_at"
        )
        .eq("rider_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setMyRides((data ?? []) as Ride[]);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to load your rides.";

      setRidesError(message);
    } finally {
      setRidesLoading(false);
    }
  }, [user.id]);

  async function cancelRide(rideId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this ride?"
    );

    if (!confirmed) return;

    setCancellingRideId(rideId);
    setCancelRideError("");
    setCancelRideMessage("");

    try {
      const { error } = await supabase.rpc("cancel_ride", {
        p_ride_id: rideId,
      });

      if (error) {
        throw error;
      }

      setCancelRideMessage("Your ride has been cancelled successfully.");
      await loadMyRides();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unable to cancel this ride.";

      setCancelRideError(message);
    } finally {
      setCancellingRideId(null);
    }
  }
    
  useEffect(() => {
    // Load ride history when the booking page opens.
    void loadMyRides();

    const channel = supabase
      .channel(`rider-rides-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rides",
          filter: `rider_id=eq.${user.id}`,
        },
        () => {
          void loadMyRides();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user.id, loadMyRides]);
  
  async function completeDemoPayment() {
    if (!currentRideId) {
      setRideStatus("Ride not found. Please book again.");
      return;
    }

    setRideStatus("");

    try {

      // Save the selected payment method for this rider's ride.
      const { data, error } = await supabase.rpc("set_ride_payment_method", {
        p_ride_id: currentRideId,
        p_payment_method: paymentMethod,
      });

      console.log("Payment method updated:", data);

      if (error) {
        console.error("Payment method RPC error:", error);
        throw new Error(`${error.message} (${error.code ?? "no error code"})`);
      }

      console.log("Payment method updated:", data);

      setPaymentComplete(true);

      setRideStatus(
        paymentMethod === "Cash"
          ? "Ride confirmed for the demo. Cash payment is pending."
          : paymentMethod === "UPI"
            ? "Demo confirmation complete. UPI payment is pending; no real money was charged."
            : "Demo confirmation complete. Card payment is pending; no real money was charged."
      );

      await loadMyRides();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to save your payment method.";

      setRideStatus(`Unable to save payment method: ${message}`);
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setRideStatus(`Unable to sign out: ${error.message}`);
    }
  }

  const selectedReceiptRide =
  myRides.find((ride) => ride.id === receiptRideId) ?? null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-3">
            <span className="rounded-xl bg-indigo-600 p-2.5 text-white">
              <Car size={25} />
            </span>
            <span className="text-2xl font-extrabold tracking-tight">
              Go<span className="text-indigo-600">Cab</span>
            </span>
          </a>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 text-sm text-slate-600 sm:flex">
              <span className="rounded-full bg-indigo-50 p-2 text-indigo-600">
                <UserIcon size={17} />
              </span>
              <span className="max-w-36 truncate">
                {user.user_metadata?.full_name || user.email}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                void loadMyRides();
                document.getElementById("my-rides")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="rounded-xl bg-indigo-50 px-3 py-2.5 text-sm font-bold text-indigo-700 hover:bg-indigo-100"
            >
              My Rides
            </button>

            <button
              type="button"
              onClick={signOut}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <LogOut size={17} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Intro */}
      <section className="bg-gradient-to-r from-indigo-950 via-indigo-800 to-indigo-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-indigo-200">
            Your ride, your choice
          </p>
          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight sm:text-5xl">
            Get there comfortably with GoCab.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">
            Choose your pickup and destination, view the driving route,
            compare cab fares, and book your ride.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-indigo-100">
            <span className="flex items-center gap-2">
              <ShieldCheck size={18} /> Easy booking
            </span>
            <span className="flex items-center gap-2">
              <Navigation size={18} /> Road-based route
            </span>
            <span className="flex items-center gap-2">
              <Wallet size={18} /> Fare estimate
            </span>
          </div>
        </div>
      </section>

      
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)] lg:items-start lg:px-8">
        {/* Booking controls */}
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h2 className="text-xl font-extrabold">Plan your ride</h2>
              <p className="mt-1 text-sm text-slate-500">
                Search and select both locations.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Pickup location
                </label>
                <LocationSearch
                  kind="pickup"
                  placeholder="Enter pickup location"
                  onSelect={(location) => {
                    setPickup(location);
                    clearRoute();
                    setRideStatus("Pickup selected. Choose your destination.");
                  }}
                  onTyping={() => {
                    setPickup(null);
                    clearRoute();
                    setRideStatus("");
                  }}
                />
                {pickup && (
                  <p className="mt-2 text-xs text-green-700">
                    Selected: {pickup.address}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Destination
                </label>
                <LocationSearch
                  kind="drop"
                  placeholder="Enter destination"
                  onSelect={(location) => {
                    setDrop(location);
                    clearRoute();
                    setRideStatus(
                      "Destination selected. Calculate your driving route."
                    );
                  }}
                  onTyping={() => {
                    setDrop(null);
                    clearRoute();
                    setRideStatus("");
                  }}
                />
                {drop && (
                  <p className="mt-2 text-xs text-rose-700">
                    Selected: {drop.address}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={calculateRoute}
                disabled={routeLoading || !pickup || !drop}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Navigation size={18} />
                {routeLoading ? "Calculating route..." : "Calculate route & fare"}
              </button>

              {routeError && (
                <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  {routeError}
                </p>
              )}

              {rideStatus && (
                <p
                  className={`rounded-xl p-3 text-sm ${
                    paymentComplete
                      ? "bg-green-50 text-green-700"
                      : "bg-indigo-50 text-indigo-700"
                  }`}
                >
                  {rideStatus}
                </p>
              )}
            </div>
          </div>

          {/* Cab selection */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-extrabold">Choose your cab</h2>
            <p className="mt-1 text-sm text-slate-500">
              Select a cab to see your estimated fare.
            </p>

            <div className="mt-5 space-y-3">
              {cabs.map((cab) => {
                const selected = selectedCab === cab.id;
                const cabFare =
                  distanceKm > 0 ? getFare(cab, distanceKm) : null;

                return (
                  <button
                    type="button"
                    key={cab.id}
                    onClick={() => setSelectedCab(cab.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                        : "border-slate-200 hover:border-indigo-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-3xl">{cab.icon}</span>

                    <span className="min-w-0 flex-1">
                      <span className="block font-extrabold">{cab.name}</span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {cab.description}
                      </span>
                      <span className="mt-1 block text-xs text-slate-400">
                        {cab.capacity}
                      </span>
                    </span>

                    <span className="text-right">
                      <span className="block font-extrabold text-slate-900">
                        {cabFare !== null ? `₹${cabFare}` : "—"}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {selected ? "Selected" : "Select"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {distanceKm > 0 && (
              <div className="mt-5 rounded-2xl bg-slate-900 p-5 text-white">
                <p className="text-sm text-slate-300">Estimated total fare</p>
                <p className="mt-1 text-3xl font-extrabold">
                  ₹{fare}
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-300">
                  Estimate based on the selected cab&apos;s base fare and road
                  distance. Actual fares may differ.
                </p>

                <button
                  type="button"
                  onClick={bookRide}
                  disabled={bookingLoading}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 font-bold text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {bookingLoading
                    ? "Saving your ride..."
                    : `Book ${selectedCabDetails.name}`}
                  {!bookingLoading && <ArrowRight size={18} />}
                </button>
              </div>
            )}
          </div>

          {/* Demo payment */}
          {currentRideId && (
            <p className="mt-2 text-xs text-slate-500">
              Booking reference: {currentRideId}
            </p>
          )}
          {bookingComplete && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <CreditCard size={22} />
                </span>
                <div>
                  <h2 className="text-xl font-extrabold">Payment</h2>
                  <p className="text-sm text-slate-500">
                    Demo payment — no real money is charged.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-slate-500">Selected cab</span>
                  <span className="font-semibold">{selectedCabDetails.name}</span>
                </div>
                <div className="mt-3 flex justify-between gap-3 text-sm">
                  <span className="text-slate-500">Road distance</span>
                  <span className="font-semibold">
                    {distanceKm.toFixed(1)} km
                  </span>
                </div>
                <div className="mt-3 flex justify-between gap-3 text-sm">
                  <span className="text-slate-500">Estimated fare</span>
                  <span className="font-extrabold">₹{fare}</span>
                </div>
              </div>

              <label className="mb-2 mt-5 block text-sm font-bold">
                Payment method
              </label>
              <select
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-indigo-500"
              >
                <option value="UPI">UPI (demo)</option>
                <option value="Card">Credit / Debit Card (demo)</option>
                <option value="Cash">Cash (demo)</option>
              </select>

              {paymentComplete ? (
                <div className="mt-5 rounded-xl bg-green-50 p-4 text-green-800">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 size={20} />
                    Ride confirmed!
                  </div>
                  <p className="mt-2 text-sm">
                    This is a simulated booking confirmation. No driver has
                    been dispatched and no real payment was processed.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={completeDemoPayment}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3.5 font-bold text-white hover:bg-green-700"
                >
                  <ShieldCheck size={18} />
                  Confirm demo payment
                </button>
              )}
            </div>
          )}
        </section>

        {/* Map and route summary */}
        <section className="min-w-0 space-y-5">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
              <div>
                <h2 className="text-xl font-extrabold">Your route</h2>
                <p className="mt-1 text-sm text-slate-500">
                  OpenStreetMap with driving directions
                </p>
              </div>

              {routeCoordinates.length > 1 && (
                <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                  Route calculated
                </span>
              )}
            </div>

            <div className="relative h-[300px] w-full overflow-hidden rounded-2xl sm:h-[340px] lg:h-[380px]">
              <GoCabMap
                pickup={pickup}
                drop={drop}
                routeCoordinates={routeCoordinates}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 sm:p-5">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Navigation size={17} className="text-indigo-600" />
                  Road distance
                </div>
                <p className="mt-2 text-2xl font-extrabold">
                  {distanceKm > 0 ? `${distanceKm.toFixed(1)} km` : "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock size={17} className="text-indigo-600" />
                  Estimated time
                </div>
                <p className="mt-2 text-2xl font-extrabold">
                  {duration || "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <MapPin className="text-indigo-600" size={23} />
              <h3 className="mt-3 font-extrabold">Choose locations</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Search for a pickup point and destination.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <Navigation className="text-indigo-600" size={23} />
              <h3 className="mt-3 font-extrabold">Calculate route</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Get a driving route and road-distance estimate.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <Wallet className="text-indigo-600" size={23} />
              <h3 className="mt-3 font-extrabold">Estimate fare</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Compare the estimated fare for available cab types.
              </p>
            </div>
          </div>

          <p className="px-1 text-xs leading-5 text-slate-500">
            Map data © OpenStreetMap contributors. Driving routes and distance
            estimates are provided by OpenRouteService. Fare estimates are for
            this project demo and are not live taxi quotes.
          </p>
        </section>
      </div>

      <section
        id="my-rides"
        className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-10 sm:px-6 lg:px-8"
      >
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold">My Rides</h2>
              <p className="mt-1 text-sm text-slate-500">
                View and manage your GoCab bookings.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadMyRides()}
              disabled={ridesLoading}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {ridesLoading ? "Loading..." : "Refresh rides"}
            </button>
          </div>

          {cancelRideMessage && (
            <p className="mt-5 rounded-xl bg-green-50 p-4 text-sm text-green-700">
              {cancelRideMessage}
            </p>
          )}

          {cancelRideError && (
            <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {cancelRideError}
            </p>
          )}

          {ridesLoading && (
            <p className="mt-6 text-sm text-slate-500">
              Loading your bookings...
            </p>
          )}

          {ridesError && (
            <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {ridesError}
            </p>
          )}

          {!ridesLoading && !ridesError && myRides.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center">
              <Car className="mx-auto text-slate-400" size={34} />
              <h3 className="mt-3 font-bold">No rides loaded yet</h3>
              <p className="mt-2 text-sm text-slate-500">
                Book a ride or refresh to view your Supabase bookings.
              </p>
            </div>
          )}

          <div className="mt-6 space-y-4">
            {myRides.map((ride) => (
              <article
                key={ride.id}
                className="rounded-2xl border border-slate-200 p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold capitalize">
                      GoCab {ride.cab_type}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      Booking ID: {ride.id}
                    </p>
                  </div>

                  <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold capitalize text-indigo-700">
                    {ride.status.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex gap-3">
                    <MapPin className="mt-0.5 shrink-0 text-green-600" size={18} />
                    <div>
                      <p className="text-xs text-slate-500">Pickup</p>
                      <p className="text-sm font-semibold">
                        {ride.pickup_address}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Navigation className="mt-0.5 shrink-0 text-rose-600" size={18} />
                    <div>
                      <p className="text-xs text-slate-500">Destination</p>
                      <p className="text-sm font-semibold">
                        {ride.dropoff_address}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-slate-500">Estimated fare</p>
                    <p className="mt-1 font-extrabold">
                      ₹{Number(ride.estimated_fare).toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Distance</p>
                    <p className="mt-1 font-bold">
                      {Number(ride.distance_km).toFixed(1)} km
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Payment method</p>
                    <p className="mt-1 font-bold">{ride.payment_method}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Payment status</p>
                    <p className="mt-1 font-bold capitalize">
                      {ride.payment_status}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-400">
                    Booked: {new Date(ride.created_at).toLocaleString()}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setReceiptRideId(ride.id)}
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"
                    >
                      View Receipt
                    </button>

                    {(ride.status === "requested" ||
                      ride.status === "accepted") && (
                      <button
                        type="button"
                        onClick={() => void cancelRide(ride.id)}
                        disabled={cancellingRideId !== null}
                        className="rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {cancellingRideId === ride.id
                          ? "Cancelling..."
                          : "Cancel Ride"}
                      </button>
                    )}
                  </div>
                </div>

              </article>
            ))}
          </div>
        </div>
      </section>



      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} GoCab. Built for a cab booking app demo.
          </p>
          <p>Plan your ride. Travel with ease.</p>
        </div>
      </footer>

      {selectedReceiptRide && (
        <RideReceipt
          ride={selectedReceiptRide}
          onClose={() => setReceiptRideId(null)}
        />
      )}
    </main>
  );
}

// ---------------- APP SESSION ----------------


export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [appRole, setAppRole] = useState<"rider" | "driver" | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          console.error("Unable to get session:", error.message);
        }

        if (mounted) {
          setUser(data.session?.user ?? null);
          setCheckingSession(false);
        }
      })
      .catch((error) => {
        console.error("Session check failed:", error);
        if (mounted) setCheckingSession(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setAppRole(null);
        setCheckingSession(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-400 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-300">
            Loading GoCab...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (appRole === "driver") {
    return (
      <DriverDashboard
        user={user}
        onSignOut={() => {
          void supabase.auth.signOut();
        }}
      />
    );
  }

  if (appRole === "rider") {
    return <BookingPage user={user} />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-10 text-white">
      <section className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-3xl font-black">
            G
          </div>
          <h1 className="mt-4 text-3xl font-black">Welcome to GoCab</h1>
          <p className="mt-2 text-sm text-slate-400">
            Choose how you want to use GoCab.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setAppRole("rider")}
            className="rounded-2xl border border-slate-700 bg-slate-800 p-6 text-left transition hover:border-indigo-400 hover:bg-slate-800/80"
          >
            <span className="text-3xl">🚕</span>
            <h2 className="mt-3 text-lg font-extrabold">Continue as Rider</h2>
            <p className="mt-2 text-sm leading-5 text-slate-400">
              Book a cab, calculate fares, and view your rides.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setAppRole("driver")}
            className="rounded-2xl border border-slate-700 bg-slate-800 p-6 text-left transition hover:border-indigo-400 hover:bg-slate-800/80"
          >
            <span className="text-3xl">🚗</span>
            <h2 className="mt-3 text-lg font-extrabold">Continue as Driver</h2>
            <p className="mt-2 text-sm leading-5 text-slate-400">
              Register your vehicle and manage ride requests.
            </p>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            void supabase.auth.signOut();
          }}
          className="mt-6 w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-bold text-slate-300 hover:bg-slate-800"
        >
          Sign out
        </button>
      </section>
    </main>
  );
}

