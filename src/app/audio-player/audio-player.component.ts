import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AudioService } from '../audio.service';
import { MatDialog } from '@angular/material/dialog';
import { AudioUploadModalComponent } from '../audio-upload-modal/audio-upload-modal.component';
import { audioData } from '../audioData';
import { HttpClient } from '@angular/common/http';

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

  loadAudioList() {
    
    this.audioService.getAudios().subscribe((response:any) => {
      this.audioListOrignal=response,
      console.log(this.audioListOrignal,'This is Responce Data Coming From Backend')
     this.audioList=response.map((item:any)=>({
      key:item.Key,
      audioUrl:`baseUrl/${item.Key}`,
      createdAt:item.LastModified, 
      fileName:`${item.LastModified}/${item.Key}`
     }))
      console.log(this.audioList, 'this is audio list');
    });
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

  nextAudio() {
    // Implement your logic for next audio
  }

  previousAudio() {
    // Implement your logic for previous audio
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

  formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${this.padZero(minutes)}:${this.padZero(seconds)}`;
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

 
  playAudio(audioFile: string) {
    if (this.isPlayingRecording) {
      this.stopRecording();
    }

    this.audio.src = audioFile;
    this.audio.play();
    this.isPlayingAudio = true;
    this.audio.ontimeupdate = () => this.currentTime = this.audio.currentTime;
    this.audio.onended = () => this.isPlayingAudio = false;
    this.currentFileName = this.audioList.find(audio => audio.audioFile === audioFile)?.key || '';
    this.duration = this.audio.duration;
  }
  }
  
