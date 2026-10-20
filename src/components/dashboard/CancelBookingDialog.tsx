import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, cancelBooking } from "@/features/bookings";
import type { EscrowData } from "@/types/dashboard";

interface CancelBookingDialogProps {
  escrow: EscrowData;
  onClose: () => void;
  onCancelled: (updated: EscrowData) => void;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch {
    return "Invalid date";
  }
};

export function CancelBookingDialog({
  escrow,
  onClose,
  onCancelled,
}: CancelBookingDialogProps) {
  const [reason, setReason] = useState("");
  const [state, setState] = useState<"idle" | "pending" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const pending = state === "pending";

  const confirm = async () => {
    if (!escrow.metadata) return;
    setState("pending");
    setError(null);
    try {
      const updated = await cancelBooking(
        escrow.metadata.bookingId,
        reason.trim() || undefined,
      );
      onCancelled(updated);
      toast.success("Booking cancelled");
      onClose();
    } catch (e) {
      setState("error");
      setError(
        e instanceof ApiError && e.code === "RESERVATION_NOT_CANCELLABLE"
          ? "This booking can no longer be cancelled. It's already funded; request a refund or open a dispute instead."
          : "We couldn't cancel the booking. Check your connection and try again.",
      );
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !pending && onClose()}>
      <DialogContent
        onEscapeKeyDown={(e) => pending && e.preventDefault()}
        onInteractOutside={(e) => pending && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            Cancel booking {escrow.metadata?.bookingId}?
          </DialogTitle>
          <DialogDescription>
            {escrow.metadata?.hotelName},{" "}
            {formatDate(escrow.metadata?.checkInDate)} –{" "}
            {formatDate(escrow.metadata?.checkOutDate)}. No funds have been sent
            yet, so nothing is refunded. This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <Label htmlFor="cancel-reason">Reason (optional)</Label>
        <Textarea
          id="cancel-reason"
          maxLength={500}
          value={reason}
          disabled={pending}
          onChange={(e) => setReason(e.target.value)}
        />
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Keep booking
          </Button>
          <Button variant="destructive" onClick={confirm} disabled={pending}>
            {pending ? "Cancelling…" : "Cancel booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
