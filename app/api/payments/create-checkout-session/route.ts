
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!secretKey || !supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Payment environment variables are missing." },
        { status: 500 }
      );
    }

    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Please log in to continue." },
        { status: 401 }
      );
    }

    const accessToken = authorization.slice(7);

    const authClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please log in again." },
        { status: 401 }
      );
    }

    const { rideId } = await request.json();

    if (typeof rideId !== "string" || !rideId.trim()) {
      return NextResponse.json(
        { error: "A valid ride ID is required." },
        { status: 400 }
      );
    }

    const riderDb = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: { Authorization: authorization },
      },
    });

    const { data: ride, error: rideError } = await riderDb
      .from("rides")
      .select(
        "id, rider_id, estimated_fare, status, payment_status"
      )
      .eq("id", rideId)
      .eq("rider_id", user.id)
      .single();

    if (rideError || !ride) {
      return NextResponse.json(
        { error: "Ride not found or access denied." },
        { status: 404 }
      );
    }

    if (ride.status === "cancelled") {
      return NextResponse.json(
        { error: "Cancelled rides cannot be paid for." },
        { status: 400 }
      );
    }

    if (ride.payment_status === "paid") {
      return NextResponse.json(
        { error: "This ride has already been paid for." },
        { status: 409 }
      );
    }

    const amount = Math.round(Number(ride.estimated_fare) * 100);

    if (!Number.isSafeInteger(amount) || amount < 100) {
      return NextResponse.json(
        { error: "The ride fare is invalid." },
        { status: 400 }
      );
    }

    const stripe = new Stripe(secretKey);
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // Let Stripe configure the available payment methods.
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `GoCab ride ${ride.id}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      client_reference_id: ride.id,
      metadata: {
        ride_id: ride.id,
        rider_id: user.id,
      },
      success_url: `${appUrl}/?payment=success`,
      cancel_url: `${appUrl}/?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout session error:", error);

    return NextResponse.json(
      { error: "Unable to start checkout. Check server configuration." },
      { status: 500 }
    );
  }
}
