import { Component, OnInit } from '@angular/core';
import { JsonEditorOptions } from 'ang-jsoneditor';
import { Doc, NawahService, Query, Res, SDKConfig, Session } from 'ng-nawah';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';


@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

	toolsTabsActive: number = 1;
	callTabsActive: number = 1;
	consoleTabsActive: number = 1;

	environment: any = environment;

	editorOptionsView: JsonEditorOptions;
	editorOptionsQuery: JsonEditorOptions;
	editorOptionsDoc: JsonEditorOptions;
	data: any;

	SDKConfig: SDKConfig = {
		api: environment.ws_api,
		anonToken: environment.anon_token,
		authAttrs: [],
		appId: 'NAWAH_SANDBOX',
		authHashLevel: '6.1',
		debug: true
	}

	authVars: any = {
		var: 'email',
		val: 'ADMIN@NAWAH',
		password: '__ADMINx0',
		auth: null
	};

	showInit: boolean = true;
	showAuth: boolean = true;

	guardOn: boolean = true;

	doc: any = { 1: 2 };
	callArgs: {
		sid: string;
		token: string;
		endpoint: string;
		query: Query;
		doc: any;
	} = {
			sid: 'f00000000000000000000012',
			token: environment.anon_token,
			endpoint: '',
			query: [],
			doc: {}
		};

	docFiles: Array<FileList> = [];

	output: Array<{ time: Date; type: 'text' | 'json'; value: any; }> = [];

	constructor(public nawah: NawahService) {
		this.editorOptionsView = new JsonEditorOptions()
		this.editorOptionsView.modes = ['code', 'view'];
		this.editorOptionsView.mode = 'view';
		this.editorOptionsView.statusBar = false;
		this.editorOptionsQuery = new JsonEditorOptions()
		this.editorOptionsQuery.modes = ['code', 'view'];
		this.editorOptionsQuery.mode = 'code';
		this.editorOptionsQuery.statusBar = false;
		this.editorOptionsDoc = new JsonEditorOptions()
		this.editorOptionsDoc.modes = ['code', 'view'];
		this.editorOptionsDoc.mode = 'code';
		this.editorOptionsDoc.statusBar = false;
	}

	ngOnInit() { console.log(this.nawah.inited); }

	updateAnonToken(): void {
		this.callArgs.token = this.SDKConfig.anonToken;
	}

	updateAuthAttrs($event: Event): void {
		this.SDKConfig.authAttrs = ($event.target as any).value.split(' ');
	}

	updateDocFiles(): void {
		this.docFiles = (JSON.stringify(this.callArgs.doc).match(/__file__/g) as any).fill(undefined);
	}

	init(): void {
		this.showAuth = true;
		try {
			this.nawah.init(this.SDKConfig)
				.pipe(
					catchError((err) => {
						if (err instanceof CloseEvent) {
							this.pushOutput({ type: 'text', value: 'Connection Closed.' });
						} else {
							this.pushOutput({ type: 'json', value: err });
						}
						return throwError(err);
					}),
					// retry(10)
				)
				.subscribe((res: Res<Doc>) => {
					if (res.args.code == 'CORE_CONN_OK') {
						this.showInit = false;
					}
					this.pushOutput({ type: 'json', value: res })
				}, (err) => {
					if (err instanceof CloseEvent) {
						this.pushOutput({ type: 'text', value: 'Connection Closed.' });
					} else {
						this.pushOutput({ type: 'json', value: err });
					}
				}, () => {
					console.log('complete');
				});
		} catch (err) {
			this.pushOutput({ type: 'text', value: err });
		}

		this.nawah.authed$.subscribe((session: Session) => {
			if (session) {
				this.showAuth = this.guardOn = false;
				this.authVars.auth = session;
				this.callArgs.sid = session._id;
				this.callArgs.token = session.token;
			} else {
				this.showAuth = this.guardOn = true;
				this.callArgs.sid = 'f00000000000000000000012';
				this.callArgs.token = environment.anon_token;
			}
		});
	}

	auth(): void {
		try {
			this.logCall(`api.auth(${this.authVars.var}, ${this.authVars.val}, ********)`);
			this.nawah.auth(this.authVars.var, this.authVars.val, this.authVars.password).subscribe((res: Res<Doc>) => {

			}, (err) => {
				this.pushOutput({ type: 'json', value: err });
			});
		} catch (err) {
			this.pushOutput({ type: 'text', value: err });
		}
	}

	checkAuth(): void {
		this.logCall('api.checkAuth()');
		try {
			this.nawah.checkAuth()
				.subscribe((res: Res<Doc>) => {

				}, (err: Res<Doc>) => {
					this.pushOutput({ type: 'json', value: err });
				});
		} catch (err) {
			this.pushOutput({ type: 'text', value: err });
		}
	}

	signout(): void {
		this.logCall('api.signout()');
		this.nawah.signout().subscribe();
	}

	updateFiles(obj: any, i: number = 0): void {
		if (!this.docFiles.length || i == this.docFiles.length) {
			return;
		}
		for (let attr of Object.keys(obj)) {
			if (obj[attr] instanceof Array) {
				this.updateFiles(obj[attr], i);
			} else if (obj[attr] instanceof Object) {
				this.updateFiles(obj[attr], i);
			} else {
				if (obj[attr] == '__file__') {
					this.pushOutput({ type: 'text', value: `Replacing __file__ attr in doc with file#${i}` });
					obj[attr] = this.docFiles[i];
					if (!obj[attr]) {
						this.pushOutput({ type: 'text', value: `File#${i} is null value. Stopping.` });
						throw Error('No file value');
					}
					i += 1;
					if (i == this.docFiles.length) return;
				}
			}
		}
	}

	call(): void {
		try {
			let query: any = JSON.parse(JSON.stringify(this.callArgs.query));
			let doc: any = JSON.parse(JSON.stringify(this.callArgs.doc));

			console.log('before files:', doc);
			this.updateFiles(doc);
			console.log('after files:', doc);

			this.logCall(`api.call(${this.callArgs.endpoint}, {query:${JSON.stringify(query)}, doc:${JSON.stringify(doc)}})`);
			this.nawah.call({
				endpoint: this.callArgs.endpoint,
				sid: this.callArgs.sid,
				token: this.callArgs.token,
				query: query,
				doc: doc
			}).subscribe((res) => {
				// this.output += JSON.stringify(res) + '\n';
			}, (err) => {
				// this.output += JSON.stringify(err) + '\n';
			});
		} catch (err) {
			this.pushOutput({ type: 'json', value: err });
		}
	}

	logCall(call: string): void {
		this.pushOutput({ type: 'text', value: `Pushing call:\n${call}` });
	}

	pushOutput({ type, value }: { type: 'json' | 'text'; value: any; }): void {
		this.output.push({ time: new Date(), type: type, value: value });
		setTimeout(() => {
			document.querySelector('.console-separator:last-child').scrollIntoView();
		}, 50);
	}

}