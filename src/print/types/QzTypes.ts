export type QzConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export interface QzPrinter {
  name: string;
  description: string;
  connection: string;
  status: string;
}

export interface QzState {
  status: QzConnectionStatus;
  printers: QzPrinter[];
  errorMessage: string | null;
}
