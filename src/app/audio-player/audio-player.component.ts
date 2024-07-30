import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { AudioService } from '../audio.service';
import { MatDialog } from '@angular/material/dialog';
import { AudioUploadModalComponent } from '../audio-upload-modal/audio-upload-modal.component';
import { audioData } from '../audioData';
import { HttpClient } from '@angular/common/http';
import { response } from 'express';
import { KeyedRead } from '@angular/compiler';

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
  subtitleList: any[]=[] 
  audioListOrignal: any[]=[] 
  audioSrcs: string | ArrayBuffer | null = null;
  isDropdownVisible = false;
  currentAudio: any;
  currentAudioIndex: number = 0;
  audioElement!: HTMLAudioElement;
  initialLoopStart: number = 0;
  initialLoopEnd: number = 0;
  currentlyPlayingKey:string='';
  baseUrl: string = 'http://localhost:3000/file';
  audioSource:string='https://30dsaaudio.s3.amazonaws.com/';
  
  isLoading: boolean = false;
  private audioKeys: string[] = [];
 
  audio: HTMLAudioElement = new Audio();
 
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


  formatTime(seconds: number): string {
    if(isNaN(seconds)){
      return '00:00';
    }
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
          this.isLoading = true;
          this.audioService.uploadFile(result.audioFile,result.subtitleFile)
            .then(() => {
              this.isLoading = false;
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
    this.isLoading = true;
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
        this.isLoading = false;
        this.subtitleList=response
        .filter((item:any) => !item.Key.endsWith('.mp3') && !item.Key.endsWith('.wav')).map((item:any) =>{
          return{
            key: item.Key,
            subtitleUrl: `${this.baseUrl}/${item.Key}`,
            createdAt: item.LastModified,
            fileName: `${item.LastModified}/${item.Key}`,
            audioFileKey:  null ,
            subtitleFileKey:  item.Key 
          }
        })
      }
    );
    console.log ('subtitle list o complete', this.subtitleList)
      console.log ('final list', this.audioList)
  }
 
  playAudio(key: string,index: number) {
    this.isLoading = true;
    console.log ('subtitle list o complete', this.subtitleList)
    this.stopAudio();
    // const index=this.audioList.findIndex(audio =>audio.key===key)
    this.currentAudioIndex = index
    this.currentlyPlayingKey=this.audioList[this.currentAudioIndex].key;
    console.log(this.currentAudioIndex,'this is current audio index')
    this.currentTime=0;
    this.duration=0;
    this.audioService.loadAudioUrl(this.audioSource + key)
    this.isLoading = false;
    this.togglePlayAudio()
  }
  playNextAudio() {
    if (this.currentAudioIndex < this.audioList.length - 1) {
      this.currentAudioIndex++;
      const nextAudio = this.audioList[this.currentAudioIndex];
      this.playAudio(nextAudio.key, this.currentAudioIndex);
    }
  }
  playPreviousAudio() {
    if (this.currentAudioIndex > 0) {
      this.currentAudioIndex--;
      const previousAudio = this.audioList[this.currentAudioIndex];
      this.playAudio(previousAudio.key, this.currentAudioIndex);

    }
  }
  // loops
  toggleLoopStart() {
    if (!this.showLoopStart) {
      this.showLoopStart = true;
      this.initialLoopStart = this.currentTime;
    } else {
      this.showLoopStart = false;
    }
  }
  
  toggleLoopEnd() {
    if (!this.showLoopEnd) {
      this.showLoopEnd = true;
      this.initialLoopEnd = this.currentTime;
    } else {
      this.showLoopEnd = false;
    }
  }
  
  updateLoopStart(event: any) {
    this.loopStart = parseFloat(event.target.value);
    this.audioService.setLoop(this.loopStart, this.loopEnd);
  }
  
  updateLoopEnd(event: any) {
    this.loopEnd = parseFloat(event.target.value);
    this.audioService.setLoop(this.loopStart, this.loopEnd);
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
  }

 
}

 
