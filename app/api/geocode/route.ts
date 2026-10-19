

import { NextResponse } from "next/server";

type GeocodeFeature = {
  geometry?: {
    coordinates?: unknown;
  };
  properties?: {
    label?: string;
    name?: string;
  };
};

type GeocodeResponse = {
  features?: GeocodeFeature[];
};

type LocationResult = {
  address: string;
  lng: number;
  lat: number;
};

function isCoordinateArray(
  coordinates: unknown
): coordinates is [number, number] {
  return (
    Array.isArray(coordinates) &&
    coordinates.length >= 2 &&
    typeof coordinates[0] === "number" &&
    Number.isFinite(coordinates[0]) &&
    typeof coordinates[1] === "number" &&
    Number.isFinite(coordinates[1])
  );
}

export async function GET(request: Request) {
  const apiKey = process.env.OPENROUTESERVICE_API_KEY;
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 3) {
    return NextResponse.json({ results: [] });
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: "Geocoding API key is not configured." },
      { status: 500 }
    );
  }

  try {
    const url = new URL(
      "https://api.heigit.org/pelias/v1/autocomplete"
    );

    url.searchParams.set("text", query);
    url.searchParams.set("boundary.country", "IND");
    url.searchParams.set("size", "5");

    const response = await fetch(url, {
      headers: { Authorization: apiKey },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Geocoding API status:", response.status);

      return NextResponse.json(
        {
          error:
            "Location search failed. Check your API key and quota.",
        },
        { status: 502 }
      );
    }

    const data = (await response.json()) as GeocodeResponse;

    const features = Array.isArray(data.features)
      ? data.features
      : [];

    const results: LocationResult[] = features
      .filter((feature) =>
        isCoordinateArray(feature.geometry?.coordinates)
      )
      .map((feature) => {
        const coordinates = feature.geometry!.coordinates as [
          number,
          number
        ];

        return {
          address:
            feature.properties?.label ??
            feature.properties?.name ??
            "Selected location",
          lng: coordinates[0],
          lat: coordinates[1],
        };
      });

    return NextResponse.json({ results });
  } catch (error: unknown) {
    console.error("Geocoding request failed:", error);

    return NextResponse.json(
      { error: "Unable to search locations right now." },
      { status: 500 }
    );
  }
}
