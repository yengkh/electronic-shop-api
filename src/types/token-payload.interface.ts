export interface TokenPayload {
  _id: string;
  phone: string;
  role: "admin" | "customer";
}
