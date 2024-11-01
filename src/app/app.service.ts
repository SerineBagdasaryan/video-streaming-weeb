import { Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "./environments/environment";
import {Observable} from "rxjs";
import {ResponseItem, TokenResponse} from "./core/models";

@Injectable({
  providedIn: 'root',
})
export class AppService {
  constructor(private readonly _httpClient: HttpClient) {
  }
  sign(userId: number): Observable<ResponseItem<TokenResponse>> {
    const fullUrl = `${environment.url}/users/sign`;
    return this._httpClient.post<ResponseItem<TokenResponse>>(fullUrl, { userId });
  }
}
