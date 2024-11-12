import { Injectable} from '@angular/core';
import { io } from 'socket.io-client';
import {environment} from "../../environments/environment";
import {RecordingTypes} from "../../core/enums";

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket = io(environment.ws, {
    transports: ['websocket'],
    query: {
      token: localStorage.getItem('token')
    },
  });
  constructor() {
    this.socket.on('error', (error) => {
      console.error('Socket error:', error.message);
      this.socket.disconnect();
    });
    this.socket.connect();
  }
  sendVideoData(data: Blob, recordingType: RecordingTypes ): void {
    this.socket.emit('video-stream', {
      videoData: data,
      type: recordingType,
    });
  }

  endVideoStream() {
    this.socket.emit('end-video');
    this.socket.disconnect();
    localStorage.removeItem('token');
  }
}
