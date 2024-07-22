import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-audio-upload-modal',
  templateUrl: './audio-upload-modal.component.html',
  styleUrls: ['./audio-upload-modal.component.css']
})
export class AudioUploadModalComponent {
  public audioUrl: string = '';
  audioSrc: string | ArrayBuffer | null = null;

  constructor(public dialogRef: MatDialogRef<AudioUploadModalComponent>) {}

  // onFileSelected(event: any) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onload = () => {
  //       this.audioSrc = reader.result as string;
  //       this.dialogRef.close({ type: 'file', file, audioSrc: this.audioSrc });
  //     };
  //     reader.onerror = (error) => {
  //       console.error('Error reading file:', error);
  //     };
  //   } else {
  //     console.warn('No file selected');
  //   }
  // }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.audioSrc = reader.result as string;
        console.log(this.audioSrc, 'this is audio data URL for checking');
        this.dialogRef.close({ type: 'file', file, audioSrc: this.audioSrc });
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
      };
    } else {
      console.warn('No file selected');
    }
  }
  onUrlProvided() {
    this.dialogRef.close({ type: 'url', url: this.audioUrl });
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}