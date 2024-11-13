import {DestroyRef, inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "./environments/environment";
import {BehaviorSubject, Observable} from "rxjs";
import {PaginatedResponse, Recording, ResponseItem, TokenResponse} from "./core/models";

@Injectable({
  providedIn: 'root',
})
export class AppService {
  constructor(private readonly _httpClient: HttpClient) {
  }
  getRecordings(take: number, skip: number, userId: number): Observable<PaginatedResponse> {
    return this._httpClient.get<PaginatedResponse>(`${environment.url}/media-stream?take=${take}&skip=${skip}&userId=${userId}`);
  }
  sign(userId: number): Observable<ResponseItem<TokenResponse>> {
    const fullUrl = `${environment.url}/users/sign`;
    return this._httpClient.post<ResponseItem<TokenResponse>>(fullUrl, { userId });
  }
}
