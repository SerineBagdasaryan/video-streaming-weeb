export interface SignUser {
  userId: number;
}
export interface TokenResponse {
  accessToken: string;
}
export interface ResponseItem<T> {
  data: T;
}
