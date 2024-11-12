import {Component, DestroyRef, ElementRef, inject, OnInit, ViewChild} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {SocketService} from "./shared/services";
import {RecordingTypes} from "./core/enums";
import {AppService} from "./app.service";
import {Observable} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {AsyncPipe, JsonPipe, NgForOf, NgIf} from "@angular/common";
import {PaginatedResponse, Recording} from "./core/models";

@Component({
    selector: 'app-root',
  standalone: true,
  imports: [FormsModule, RouterOutlet, AsyncPipe, NgForOf, JsonPipe, NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  @ViewChild('video') videoRef!: ElementRef;
  private mediaRecorder!: MediaRecorder;
  private mediaStream!: MediaStream;
  private screenRecorder!: MediaRecorder;
  private screenStream!: MediaStream;
  private userId: number = 4;
  public destroyRef: DestroyRef = inject(DestroyRef);
  public recordings$!: Observable<Recording[] | null>;
  public take: number = 10;
  public skip: number = 0;
  constructor(private socketService: SocketService,
              private appService: AppService) {
    this.recordings$ = this.appService.getRecordings$();
  }

  ngOnInit(): void {
    this._initializeSign();
    this.getRecordings();
    this.startStreaming();
  }
  private _initializeSign(): void {
    this.appService.sign(this.userId).subscribe((res: any) => {
      localStorage.setItem('token', res.data.accessToken);
    })
  }
  private getRecordings() {
      this.appService.getRecordings(this.take, this.skip, this.userId)
        .pipe(
          (takeUntilDestroyed(this.destroyRef))
        )
        .subscribe(
            (response: PaginatedResponse) => {
            this.appService.setRecordings(response?.data);
          },
        );
  }
  async startStreaming(): Promise<void> {
    this.mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true});
    this.screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    this.videoRef.nativeElement.srcObject = this.mediaStream;
    this.mediaRecorder = new MediaRecorder(this.mediaStream, { mimeType: 'video/webm' });
    this.screenRecorder = new MediaRecorder(this.screenStream, { mimeType: 'video/webm' });
    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        this.socketService.sendVideoData(event.data, RecordingTypes.camera);
      }
    };
    this.mediaRecorder.start(1000);
    this.screenRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.socketService.sendVideoData(event.data, RecordingTypes.screen);
      }
    };
    this.screenRecorder.start(1000);
  }
  stopStreaming(): void {
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
