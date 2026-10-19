
"use client";

type RideReceiptData = {
  id: string;
  cab_type: string;
  pickup_address: string;
  dropoff_address: string;
  estimated_fare: number | string;
  distance_km: number | string;
  payment_method: string;
  payment_status: string;
  status: string;
  created_at: string;
};

type RideReceiptProps = {
  ride: RideReceiptData;
  onClose: () => void;
};

export default function RideReceipt({
  ride,
  onClose,
}: RideReceiptProps) {
  return (
    <div
      id="gocab-receipt-modal"
      className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 p-4"
    >
      <div className="mx-auto my-8 max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div id="gocab-receipt">
          {/* Receipt Header */}
          <div className="border-b border-dashed border-slate-300 pb-5 text-center">
            <h2 className="text-3xl font-black text-indigo-700">
              GoCab
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Ride Receipt
            </p>

            <p className="mt-3 break-all text-xs text-slate-400">
              Booking ID: {ride.id}
            </p>
          </div>

          {/* Ride Details */}
          <div className="space-y-4 py-5">
            <div>
              <p className="text-xs text-slate-500">
                Pickup location
              </p>
              <p className="break-words font-semibold">
                {ride.pickup_address}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Destination
              </p>
              <p className="break-words font-semibold">
                {ride.dropoff_address}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">Cab type</p>
                <p className="font-semibold capitalize">
                  {ride.cab_type}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Distance</p>
                <p className="font-semibold">
                  {Number(ride.distance_km).toFixed(1)} km
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Booking date
                </p>
                <p className="font-semibold">
                  {new Date(ride.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Ride status</p>
                <p className="font-semibold capitalize">
                  {ride.status.replaceAll("_", " ")}
                </p>
              </div>
            </div>
          </div>

          {/* Fare and Payment Details */}
          <div className="border-t border-dashed border-slate-300 pt-5">
            <div className="flex justify-between gap-4">
              <span className="text-slate-600">Estimated fare</span>
              <span className="text-xl font-black">
                ₹{Number(ride.estimated_fare).toFixed(2)}
              </span>
            </div>

            <div className="mt-3 flex justify-between gap-4 text-sm">
              <span className="text-slate-500">Payment method</span>
              <span className="font-semibold">
                {ride.payment_method || "Not selected"}
              </span>
            </div>

            <div className="mt-2 flex justify-between gap-4 text-sm">
              <span className="text-slate-500">Payment status</span>
              <span className="font-semibold capitalize">
                {ride.payment_status || "Pending"}
              </span>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              Thank you for choosing GoCab!
            </p>

            {ride.payment_status !== "paid" && (
              <p className="mt-3 text-center text-xs text-amber-700">
                This receipt records the booking and estimated fare.
                Payment has not been confirmed.
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="gocab-receipt-actions mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white hover:bg-indigo-700"
          >
            Print / Save PDF
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-3 font-bold"
          >
            Close
          </button>
        </div>
      </div>

      {/* Print only the receipt, not the booking page */}
      <style jsx global>{`
        @media print {
          @page {
            size: auto;
            margin: 12mm;
          }

          body * {
            visibility: hidden !important;
          }

          #gocab-receipt,
          #gocab-receipt * {
            visibility: visible !important;
          }

          #gocab-receipt-modal {
            position: static !important;
            inset: auto !important;
            overflow: visible !important;
            padding: 0 !important;
            background: white !important;
          }

          #gocab-receipt-modal > div {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }

          #gocab-receipt {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            padding: 12px !important;
            background: white !important;
          }

          .gocab-receipt-actions {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}