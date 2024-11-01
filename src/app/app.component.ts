import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {SocketService} from "./shared/services";
import {RecordingTypes} from "./core/enums";
import {AppService} from "./app.service";

@Component({
    selector: 'app-root',
  standalone: true,
  imports: [FormsModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  @ViewChild('video') videoRef!: ElementRef;
  private mediaRecorder!: MediaRecorder;
  private mediaStream!: MediaStream;
  private screenRecorder!: MediaRecorder;
  private screenStream!: MediaStream;
  private userId: number = 3;
  constructor(private socketService: SocketService,
              private appService: AppService) {
  }

  ngOnInit(): void {
    this._initializeSign();
    this.startStreaming();
  }
  private _initializeSign() {
    this.appService.sign(this.userId).subscribe((res: any) => {
      localStorage.setItem('token', res.data.accessToken);
    })
  }
  async startStreaming(): Promise<void> {
    this.mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true});
    this.screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    this.videoRef.nativeElement.srcObject = this.mediaStream;
    this.mediaRecorder = new MediaRecorder(this.mediaStream, { mimeType: 'video/webm' });
    this.screenRecorder = new MediaRecorder(this.screenStream, { mimeType: 'video/webm' });
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.socketService.sendVideoData(event.data, RecordingTypes.camera);
      }
    };
    this.mediaRecorder.start(100);
    this.screenRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.socketService.sendVideoData(event.data, RecordingTypes.screen);
      }
    };
    this.screenRecorder.start(100);
  }
  stopStreaming() {
    // Stop media recorder streams
    this.mediaRecorder.stop();
    this.screenRecorder.stop();
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }

    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
    }
    this.socketService.endVideoStream();
  }
}
