import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import * as RecordRTC from 'recordrtc';
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';
import { HttpClient } from '@angular/common/http';

interface Subtitle {
  start: number;
  end: number;
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private storage = firebase.storage();
  private audio: HTMLAudioElement = new Audio();
  private recorder: RecordRTC.RecordRTCPromisesHandler | null = null;
  private stream: MediaStream | null = null;
  private loopStart: number = 0;
  private loopEnd: number = 0;
  private recordingBlob: Blob | null = null;
  private subtitles: Subtitle[] = [];
  private currentSubtitleIndex: number = -1;
  private audioList: string[] = [
    'assets/audio1.mp3',
    'assets/audio2.mp3',
    // Add more audio URLs as needed
  ];
  private currentAudioIndex: number = 0;
  private isPlaying: boolean = false;
  private backendUrl = 'http://localhost:3000';
  
  constructor(private firestore: AngularFirestore , private http:HttpClient) {
    this.audio.addEventListener('loadedmetadata', () => {
      this.loopEnd = this.audio.duration;
      this.audio.loop = false;
    });
    this.audio.addEventListener('error', (event) => {
      console.error('Error loading audio source:', event);
      alert('Error loading audio source. Please check the URL and try again.');
    });
  }

 
  // async uploadFile(file: File): Promise<string> {
  //   const filePath = `audio_files/${file.name}`;
  //   const fileRef = this.storage.ref(filePath);
  //   const task = fileRef.put(file);

  //   return new Promise<string>((resolve, reject) => {
  //     task.on(
  //       firebase.storage.TaskEvent.STATE_CHANGED,
  //       () => {},
  //       reject,
  //       () => {
  //         fileRef.getDownloadURL().then(resolve).catch(reject);
  //       }
  //     );
  //   });
  // }

  async uploadAudio(fileName: string, audioSrc: string): Promise<void> {
    await this.firestore.collection('audio-database').add({
      fileName,
      audioSrc,
      timestamp: new Date()
    });
  }

  async storeRecordingInFirestore(fileName: string): Promise<void> {
    if (this.recordingBlob) {
      // const audioSrc = await this.uploadFile(new File([this.recordingBlob], fileName));
      // await this.addAudioToFirestore(fileName, audioSrc);
    }
  }

  loadAudio(file: File) {
    const url = URL.createObjectURL(file);
    this.audio.src = url;
    this.audio.load();
  }

  loadAudioUrl(url: string) {
    this.audio.src = '';
    this.audio.src = url;
    this.audio.load();
    this.audio.addEventListener('error', this.handleAudioError);
  }

  private handleAudioError = (event: Event) => {
    console.error('Audio Source Error:', event);
    alert('Error Loading Audio Source. Please check the URL and try again.');
  }

  playAudio() {
    this.audio.play();
  }

  pauseAudio() {
    this.audio.pause();
  }

  startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.stream = stream;
      this.recorder = new RecordRTC.RecordRTCPromisesHandler(stream, {
        type: 'audio'
      });
      this.recorder.startRecording();
    });
  }

  async stopRecording(): Promise<Blob | null> {
    if (this.recorder) {
      await this.recorder.stopRecording();
      this.recordingBlob = await this.recorder.getBlob();
      this.stream?.getTracks().forEach(track => track.stop());
      return this.recordingBlob;
    }
    return null;
  }

  getRecordingBlob(): Blob | null {
    return this.recordingBlob;
  }

  playRecording() {
    if (this.recordingBlob) {
      const audioURL = URL.createObjectURL(this.recordingBlob);
      this.audio.src = audioURL;
      this.audio.load();
      this.audio.play();
    }
  }

  pauseRecording() {
    this.audio.pause();
  }

  setPlaybackRate(rate: number) {
    this.audio.playbackRate = rate;
  }

  setCurrentTime(time: number) {
    this.audio.currentTime = time;
  }

  setLoop(start: number, end: number) {
    this.loopStart = start;
    this.loopEnd = end;
    this.audio.addEventListener('timeupdate', this.loopHandler.bind(this));
  }

  private loopHandler() {
    if (this.audio.currentTime >= this.loopEnd) {
      this.audio.currentTime = this.loopStart;
      this.audio.play();
    }
  }

  getAudioElement(): HTMLAudioElement {
    return this.audio;
  }

  loadSubtitles(subtitleUrl: string) {
    fetch(subtitleUrl)
      .then(response => response.text())
      .then(data => this.parseSubtitles(data));
  }

  private parseSubtitles(data: string) {
    const lines = data.split('\n');
    const subtitleRegex = /(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/;
    let subtitle: Subtitle | null = null;

    for (let line of lines) {
      const match = line.match(subtitleRegex);
      if (match) {
        if (subtitle) {
          this.subtitles.push(subtitle);
        }
        subtitle = {
          start: this.parseTime(match[1]),
          end: this.parseTime(match[2]),
          text: ''
        };
      } else if (subtitle && line.trim()) {
        subtitle.text += line.trim() + ' ';
      }
    }

    if (subtitle) {
      this.subtitles.push(subtitle);
    }
  }

  private parseTime(time: string): number {
    const parts = time.split(':');
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const seconds = parseFloat(parts[2]);
    return hours * 3600 + minutes * 60 + seconds;
  }

  getSubtitleForCurrentTime(): string {
    const currentTime = this.audio.currentTime;
    for (let i = 0; i < this.subtitles.length; i++) {
      const subtitle = this.subtitles[i];
      if (currentTime >= subtitle.start && currentTime <= subtitle.end) {
        this.currentSubtitleIndex = i;
        return subtitle.text;
      }
    }
    return '';
  }

  loadAndPlayAudioByIndex(index: number) {
    if (index >= 0 && index < this.audioList.length) {
      this.currentAudioIndex = index;
      this.loadAudioUrl(this.audioList[this.currentAudioIndex]);
      this.playAudio();
    }
  }

  getCurrentAudioIndex(): number {
    return this.currentAudioIndex;
  }

  isAudioPlaying(): boolean {
    return this.isPlaying;
  }

  async addAudio(collectionName: string, fileName: string, audioUrl: string): Promise<void> {
    try {
      await this.firestore.collection(collectionName).add({ fileName, audioUrl, timestamp: new Date() });
      console.log('Audio added to Firestore successfully');
    } catch (error) {
      console.error('Error adding audio to Firestore', error);
      throw new Error('Failed to add audio to Firestore. Please try again.');
    }
  }
  getAudios() {
    // return this.http.get(`${this.backendUrl}/files`);
    return this.http.get(`http://localhost:3000/files`);
  }
  
  uploadFile(audioFile: File, subtitleFile:File): any {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('subtitle', subtitleFile);
    return this.http.post<{message:string}>(`${this.backendUrl}/upload`, formData).toPromise()
    .then((response:any) =>{
      console.log(response.message);
      
    })
    .catch(error =>{
      console.log('Error uploading file: ' + error.message);
      
    })
  }

  getAudioFilesFromDatabase() {
    return this.firestore.collection('audio-database').valueChanges();
  }

  loadAudioFromDatabase(collectionName: string, audioUrl: string): any {
    return this.firestore.collection(collectionName).valueChanges().subscribe((files: any[]) => {
      const file = files.find((file: any) => file.audioUrl === audioUrl);
      if (file) {
        this.loadAudioUrl(file.audioUrl);
        this.playAudio();
      }
    });
  }

  clearRecording() {
    this.recordingBlob = null;
  }
  getCurrentCue(currentTime: number): { text: string } {
    for (let i = 0; i < this.subtitles.length; i++) {
      const subtitle = this.subtitles[i];
      if (currentTime >= subtitle.start && currentTime <= subtitle.end) {
        return { text: subtitle.text };
      }
    }
    return { text: '' };
  }
  getAudioByKey(key: any) {
    return this.http.get(`${this.backendUrl}/file/${key}`,{ responseType: 'blob' });
  };
  }
