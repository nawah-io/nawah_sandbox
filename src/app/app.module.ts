import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { NgNawahModule } from 'ng-nawah';
import { AppComponent } from './app.component';
import { KeysPipe, ValuesPipe } from './object.pipe';


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
		NgNawahModule,
		NgbModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
