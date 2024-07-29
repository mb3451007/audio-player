import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AudioPlayerComponent } from './audio-player/audio-player.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AudioUploadModalComponent } from './audio-upload-modal/audio-upload-modal.component';
// 
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { TruncatePipe } from './truncate.pipe';
import { environment } from '../environments/environment';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { CUSTOM_ELEMENTS_SCHEMA, } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire/compat';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { TruncateKeyPipe } from './truncate-key.pipe';





@NgModule({
  declarations: [AppComponent, AudioPlayerComponent, AudioUploadModalComponent, TruncatePipe, TruncateKeyPipe],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterOutlet,
    RouterModule,
    FormsModule,
    CommonModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    AngularFireAuthModule,
    AngularFireModule.initializeApp(environment.firebase), 
    AngularFirestoreModule,
    MatIconModule,
    DragDropModule,
    MatTreeModule,
    AngularFireModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [AudioUploadModalComponent]  
})
export class AppModule {}
