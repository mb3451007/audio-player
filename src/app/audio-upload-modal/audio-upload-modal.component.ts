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
  subtitleSrc: string | ArrayBuffer | null = null;
  audioFile: File | null = null;
  subtitleFile: File | null = null;
  isUrlMode: boolean = false;
  isFileMode: boolean = false;
  audioFileName: string = '';
  subtitleFileName: string = '';

  constructor(public dialogRef: MatDialogRef<AudioUploadModalComponent>) {}

  onFileSelected(event: any, fileType: 'audio' | 'subtitle') {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if(fileType==='audio'){
          this.audioFileName = file ? file.name : '';
           this.audioSrc=reader.result as string;
           this.audioFile=file;
        }
        else if(fileType==='subtitle'){
          this.subtitleFileName = file ? file.name : '';
          this.subtitleSrc=reader.result as string;
          this.subtitleFile=file;
        }
        this.isUrlMode=false;
        this.isFileMode=true;
        this.validateFiles()
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
    this.isFileMode=false;
    this.audioFile=null;
    this.subtitleFile=null;
    this.audioSrc=null;
    this.subtitleSrc=null;
    this.validateFiles();
    
  }

  onCancel() {
    this.dialogRef.close(null);
  }
  // onSubtitleChange(event: any) {
  //   const subtitlefile= event.target.files[0]
  //   if(subtitlefile){
  //     const reader=new FileReader();
  //     reader.readAsDataURL(subtitlefile);
  //     reader.onload=()=>{
  //       this.subtitleSrc=reader.result as string;
  //       this.subtitleFile=subtitlefile;
  //       // this.isUrlMode=true;
  //       this.validateFiles();
  //     }
  //   }
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files.length) {
  //     this.subtitleFile = input.files[0];
  //     this.validateFiles()
  //   }
  // }
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
          subtitleSrc: this.subtitleSrc,
          audioSrc:this.audioSrc,
        });
      } 
    }
    else{
      console.warn('Both AudioFile and Subtitle must be Selected');
    }
  }
  triggerFileInput(inputId: string) {
    const fileInput = document.getElementById(inputId) as HTMLElement;
    fileInput.click();
  }
}
