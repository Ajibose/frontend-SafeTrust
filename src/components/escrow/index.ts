// XDR Signing and Transaction Components
export { XDRSigningFlow } from "./XDRSigningFlow";
export { TransactionPreview } from "./TransactionPreview";

// Escrow Dashboard Components
export { WalletEscrowDashboard, type WalletEscrowDashboardProps } from "./WalletEscrowDashboard";
export { EscrowCard } from "./EscrowCard";
export { EscrowStatusBadge } from "./EscrowStatusBadge";
export { RealTimeEscrowStatus } from "./RealTimeEscrowStatus";

// Status-driven detail views (MVP demo)
export * from "./views";

// Hooks
export {
  useEscrowStatus,
  getEscrowStatusString,
  getStatusVariant,
  formatStatus,
} from "./hook/useEscrowStatus";

// Types
export type {
  EscrowAction,
  TransactionResult,
  XDRSigningFlowProps,
  TransactionPreviewProps
} from "@/types/escrow";