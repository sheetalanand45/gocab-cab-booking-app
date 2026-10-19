

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTESERVICE_API_KEY;

  if (!apiKey) {
    console.error("OPENROUTESERVICE_API_KEY is missing.");

    return NextResponse.json(
      { error: "Routing API key is missing from .env.local." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { pickup, dropoff } = body;

    const validPoint = (point: unknown) =>
      Array.isArray(point) &&
      point.length === 2 &&
      point.every(
        (value) =>
          typeof value === "number" && Number.isFinite(value)
      ) &&
      point[0] >= -180 &&
      point[0] <= 180 &&
      point[1] >= -90 &&
      point[1] <= 90;

    if (!validPoint(pickup) || !validPoint(dropoff)) {
      return NextResponse.json(
        { error: "Valid pickup and destination coordinates are required." },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let response: Response;

    try {
      response = await fetch(
        "https://api.heigit.org/openrouteservice/v2/directions/driving-car/geojson",
        {
          method: "POST",
          headers: {
            Authorization: apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            coordinates: [pickup, dropoff],
          }),
          cache: "no-store",
          signal: controller.signal,
        }
      );
    } catch (error) {
      if (controller.signal.aborted) {
        return NextResponse.json(
          {
            error:
              "OpenRouteService timed out. Please try again in a moment.",
          },
          { status: 504 }
        );
      }

      console.error("OpenRouteService connection error:", error);

      return NextResponse.json(
        {
          error:
            "Could not connect to OpenRouteService. Check your internet connection and try again.",
        },
        { status: 502 }
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const providerMessage = await response.text().catch(() => "");

      // Log provider details in your terminal, not to the public client.
      console.error("OpenRouteService response:", {
        status: response.status,
        message: providerMessage.slice(0, 1000),
      });

      if (response.status === 401) {
        return NextResponse.json(
          { error: "The OpenRouteService API key is invalid." },
          { status: 502 }
        );
      }

      if (response.status === 403) {
        return NextResponse.json(
          {
            error:
              "OpenRouteService denied the request. Check your API access and quota.",
          },
          { status: 502 }
        );
      }

      if (response.status === 429) {
        return NextResponse.json(
          {
            error:
              "OpenRouteService rate limit reached. Please wait and try again.",
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: `OpenRouteService returned HTTP ${response.status}. Check the VS Code terminal for details.`,
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    const feature = data.features?.[0];
    const summary = feature?.properties?.summary;
    const coordinates = feature?.geometry?.coordinates;

    if (
      !Array.isArray(coordinates) ||
      coordinates.length < 2 ||
      !summary ||
      !Number.isFinite(summary.distance) ||
      !Number.isFinite(summary.duration)
    ) {
      console.error("Unexpected route response:", data);

      return NextResponse.json(
        { error: "No valid driving route was returned." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      geometry: feature.geometry,
      distanceKm: summary.distance / 1000,
      durationMinutes: summary.duration / 60,
    });
  } catch (error) {
    console.error("Route API error:", error);

    return NextResponse.json(
      { error: "Unexpected error while calculating the driving route." },
      { status: 500 }
    );
  }
}
