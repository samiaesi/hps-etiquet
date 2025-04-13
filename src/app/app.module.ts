import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import {FormsModule} from '@angular/forms';
import {MatToolbar, MatToolbarModule} from '@angular/material/toolbar';
import {MatCard, MatCardContent, MatCardModule, MatCardTitle} from '@angular/material/card';
import {DatePipe} from '@angular/common';
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {
  MatCell, MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef,
  MatRow, MatRowDef,
  MatTable, MatTableModule
} from '@angular/material/table';
import {MatInput, MatInputModule} from '@angular/material/input';
import {MatButton, MatButtonModule} from '@angular/material/button';

@NgModule({
  declarations: [AppComponent], // ✅ ici, pas dans imports
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatInputModule,
    MatIconModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
