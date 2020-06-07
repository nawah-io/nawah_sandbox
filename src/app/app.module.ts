import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgJsonEditorModule } from 'ang-jsoneditor'; 

import { NgLimpModule } from 'ng-limp'

import { AppComponent } from './app.component';
import { KeysPipe, ValuesPipe } from './object.pipe';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
	AppComponent,
	KeysPipe,
	ValuesPipe
  ],
  imports: [
	BrowserModule,
	FormsModule,
	ReactiveFormsModule,
	NgJsonEditorModule,
	NgLimpModule,
	NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
