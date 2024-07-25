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
  audioFile: File | null = null;
  subtitleFile: File | null = null;
  isUrlMode: boolean = false;
  isFileMode: boolean = false;

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
        this.audioFile=file;
        this.isUrlMode=false;
        this.isFileMode=true;
        this.validateFiles()
        // console.log(this.audioSrc, 'this is audio data URL for checking');
        // this.dialogRef.close({ type: 'file', file, audioSrc: this.audioSrc });
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
      };
    } else {
      console.warn('No file selected');
    }
  }
  onUrlProvided() {
    this.isUrlMode=true;
    this.audioFile=null;
    this.subtitleFile=null;
    this.audioSrc=null;
    this.validateFiles();
    // this.dialogRef.close({ type: 'url', url: this.audioUrl });
  }

  onCancel() {
    this.dialogRef.close(null);
  }
  onSubtitleChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.subtitleFile = input.files[0];
      this.validateFiles()
    }
  }
  validateFiles() {
    
  }
  isFormValid(){
    if(this.isUrlMode){
      return this.audioUrl.trim() !=='';
    }
    else {
      return this.audioFile !=null && this.subtitleFile !=null;
    }
   
  }
  onSubmit(){
    
    if(this.isFormValid()){
      if(this.isUrlMode){
        this.dialogRef.close({
          type: 'url',
          url : this.audioUrl
        });
      }
      else {
        this.dialogRef.close({
          type : 'file',
          audioFile : this.audioFile,
          subtitleFile: this.subtitleFile,
          audioSrc:this.audioSrc,
        });
      } 
    }
    else{
      console.warn('Both AudioFile and Subtitle must be Selected');
    }
  }
}
