import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { AudioService } from '../audio.service';
import { MatDialog } from '@angular/material/dialog';
import { AudioUploadModalComponent } from '../audio-upload-modal/audio-upload-modal.component';
import { audioData } from '../audioData';
import { HttpClient } from '@angular/common/http';
import { response } from 'express';

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.css']
})
export class AudioPlayerComponent implements OnInit {
  currentTime: number = 0;
  duration: number = 0;
  playbackRate: number = 1;
  loopStart: number = 0;
  loopEnd: number = 0;
  isPlayingAudio: boolean = false;
  isRecording: boolean = false;
  isRepeating: boolean = false;
  isPlayingRecording: boolean = false;
  showLoopStart: boolean = false;
  showLoopEnd: boolean = false;
  currentSubtitle: string = '';
  currentFileName: string = '';
  currentFileSource: string = '';
  selectedFile: File | null = null;
  audioList: any[]=[] 
  audioListOrignal: any[]=[] 
  audioSrcs: string | ArrayBuffer | null = null;
  isDropdownVisible = false;
  currentAudio: any;
  currentAudioIndex: number = -1;
  audioElement!: HTMLAudioElement;

  baseUrl: string = 'http://localhost:3000/file';
  audioSource:string='https://30dsaaudio.s3.amazonaws.com/';
  private isDraggingStart = false;
  private isDraggingEnd = false;
  private timelineWidth = 0;

  audio: HTMLAudioElement = new Audio();
  @ViewChild('timeline', { static: true }) timeline!: ElementRef<HTMLDivElement>;
  @ViewChild('startLoop', { static: true }) startLoop!: ElementRef<HTMLDivElement>;
  @ViewChild('endLoop', { static: true }) endLoop!: ElementRef<HTMLDivElement>;
  @ViewChild('audioPlayer', { static: true }) audioPlayer!: ElementRef<HTMLAudioElement>;

  constructor(public audioService: AudioService, public dialog: MatDialog,private http: HttpClient) {
    this.audioService.getAudioElement().addEventListener('timeupdate', () => {
      this.currentTime = this.audioService.getAudioElement().currentTime;
      this.duration = this.audioService.getAudioElement().duration;
      this.updateSubtitle();
    });

    this.audioService.getAudioElement().addEventListener('loadedmetadata', () => {
      this.duration = this.audioService.getAudioElement().duration;
    });

    this.audioService.getAudioElement().addEventListener('ended', () => {
      if (this.isRepeating) {
        this.audioService.playAudio();
      }
    });
  }

  ngOnInit() {
    this.audioService.loadSubtitles('assets/subtitles.vtt');
    this.loadAudioList();
  }

 

  toggleRepeat() {
    this.isRepeating = !this.isRepeating;
  }

  togglePlayAudio() {
    if (this.isPlayingAudio) {
      this.audioService.pauseAudio();
      this.isPlayingAudio = false;
    } else {
      if (this.isPlayingRecording) {
        this.audioService.pauseRecording();
        this.isPlayingRecording = false;
      }
      this.audioService.playAudio();
      this.isPlayingAudio = true;
    }
  }

  async toggleRecording() {
    if (this.isRecording) {
      const fileName = `recording-${new Date().toISOString()}.webm`;
      const blob = await this.audioService.stopRecording();
      if (blob) {
        this.audioService.storeRecordingInFirestore(fileName);
        this.audioService.playRecording();
      }
    } else {
      this.audioService.startRecording();
    }
    this.isRecording = !this.isRecording;
  }

  stopRecording() {
    this.audioService.pauseRecording();
    this.audioService.setCurrentTime(0);
    this.isPlayingRecording = false;
  }

  togglePlayRecording() {
    if (this.isPlayingRecording) {
      this.audioService.pauseRecording();
      this.isPlayingRecording = false;
    } else {
      if (this.isPlayingAudio) {
        this.audioService.pauseAudio();
        this.isPlayingAudio = false;
      }
      this.audioService.playRecording();
      this.isPlayingRecording = true;
    }
  }

  stopAudio() {
    this.audioService.pauseAudio();
    this.audioService.setCurrentTime(0);
    this.isPlayingAudio = false;
  }

  playNextAudio() {
    if (this.currentAudioIndex < this.audioList.length - 1) {
      this.playAudio(this.audioList[this.currentAudioIndex + 1].key);
    }
  }

  playPreviousAudio() {
    if (this.currentAudioIndex > 0) {
      this.playAudio(this.audioList[this.currentAudioIndex - 1].key);
    }
  }

  updatePlaybackRate(event: any) {
    let rate = parseFloat(event.target.value);
    if(rate<0.25){
        rate=0.25;
    }
    else if(rate >2){
        rate=2;
    }
    else if(Math.abs(rate -2) <0.5){
       rate=2
    }
    this.playbackRate=rate;
    this.audioService.setPlaybackRate(rate);
  }

  updateLoopStart(event: any) {
    this.loopStart = parseFloat(event.target.value);
    this.audioService.setLoop(this.loopStart, this.loopEnd);
  }

  updateLoopEnd(event: any) {
    this.loopEnd = parseFloat(event.target.value);
    this.audioService.setLoop(this.loopStart, this.loopEnd);
  }

  toggleLoopStart() {
    this.showLoopStart = !this.showLoopStart;
  }

  toggleLoopEnd() {
    this.showLoopEnd = !this.showLoopEnd;
  }

  formatTime(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }


  padZero(number: number): string {
    return number < 10 ? `0${number}` : `${number}`;
  }

  onTimeUpdate(event: any) {
    this.audioService.setCurrentTime(event.target.value);
  }

  onLoopPointDrag(event: DragEvent, point: 'start' | 'end') {
    const rect = (event.target as HTMLElement).parentElement!.getBoundingClientRect();
    const newTime = (event.clientX - rect.left) / rect.width * this.duration;
    if (point === 'start') {
      this.loopStart = newTime;
    } else {
      this.loopEnd = newTime;
    }
    this.audioService.setLoop(this.loopStart, this.loopEnd);
    event.preventDefault();
  }

  updateSubtitle() {
    this.currentSubtitle = this.audioService.getSubtitleForCurrentTime();
  }

  openUploadModal() {
    const dialogRef = this.dialog.open(AudioUploadModalComponent, {
      width: '400px'
    });
  
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (result.type === 'file') {
          console.log(result.audioFile, 'this is file from modal');
          console.log(result.subtitleFile, 'this is file from modal');
          
           

          this.audioService.uploadFile(result.audioFile,result.subtitleFile)
            .then(() => {
              this.loadAudioList();
              console.log('audio File Src added to Aws Bucket successfully');
              
            })
            .catch((error:any) => console.error(';Error adding audio to Aws Bucket',));
        } else if (result.type === 'url') {
          const audioUrl = result.url;
          const audioUrlName=result.file.name
          this.audioService.uploadFile(audioUrl,audioUrlName)
            .then(() => {
              this.loadAudioList();
              console.log('audio Url added to firestore successfully');
            })
            .catch((error:any) => console.error('Error adding audio to Firestore', error));
        }
      }
    });
  }
  
  loadAudioFromDatabase(url: string) {
    this.audioService.loadAudioUrl(url);
    this.currentFileName = url;
    this.currentFileSource = url;
  }


  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      try {
        // const audioUrl = await this.audioService.uploadFile(file);
        // await this.audioService.uploadFile(file);
        console.log('File uploaded and metadata saved.');
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  }
   toggleDropdown() {
    this.isDropdownVisible = !this.isDropdownVisible;
  }

  loadAudioList(): void {
    this.audioService.getAudios().subscribe((response: any) => {
      this.audioListOrignal = response;
      console.log(this.audioListOrignal, 'This is response data coming from backend');
  
      this.audioList = response
      .filter((item: any) => item.Key.endsWith('.mp3') || item.Key.endsWith('.wav'))
      .map((item:any)=>{
          return {
            key: item.Key,
            audioUrl: `${this.baseUrl}/${item.Key}`,
            createdAt: item.LastModified,
            fileName: `${item.LastModified}/${item.Key}`,
            audioFileKey:  item.Key ,
            subtitleFileKey:  null 
          };
        });
      });
      console.log ('final list', this.audioList)
  }


  playAudio(key: string) {
    this.stopAudio();
    this.audioService.loadAudioUrl("https:30dsaaudio.s3.amazonaws.com/" + key)
    this.togglePlayAudio()

    // this.audioService.getAudioByKey(key).subscribe({
    //   next: (audioBlob) => {
    //     console.log(audioBlob, 'successfully loaded audio key');
    //     console.log(key,'keyyyy');
    //     const audioURL = URL.createObjectURL(audioBlob);
    //     console.log ('url', audioURL)
    //     this.currentAudio = `https:30dsaaudio.s3.amazonaws.com/${key}`
    //     console.log(this.currentAudio,'this is currentAudio test');
    //     this.isPlayingAudio = true;
    //   },
    //   error: (error) => {
    //     console.error('Error fetching audio:', error);
    //   }
    // });
  }

  // loops


  ngAfterViewInit() {
    this.timelineWidth = this.timeline.nativeElement.offsetWidth;
  }

 
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isDraggingStart) {
      const newLeft = this.getRelativePosition(event.clientX);
      if (newLeft < this.loopEnd) {
        this.loopStart = (newLeft / this.timelineWidth) * this.duration;
      }
    }

    if (this.isDraggingEnd) {
      const newRight = this.getRelativePosition(event.clientX);
      if (newRight > this.loopStart) {
        this.loopEnd = (newRight / this.timelineWidth) * this.duration;
      }
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isDraggingStart = false;
    this.isDraggingEnd = false;
  }
  onDragStartLoop() {
    this.isDraggingStart = true;
  }

  onDragEndLoop() {
    this.isDraggingEnd = true;
  }
  private getRelativePosition(mouseX: number): number {
    const timelineRect = this.timeline.nativeElement.getBoundingClientRect();
    return Math.max(0, Math.min(mouseX - timelineRect.left, this.timelineWidth));
  }
 
}

 
