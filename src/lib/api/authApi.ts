export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
  mfaRequired: boolean;
  mfaToken: string | null;
  id: string;
  name: string;
  email: string;
}

export interface MfaSetupResponse {
  secret: string;
  qrCodeUrl: string;
}
