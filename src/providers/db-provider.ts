import { Injectable } from '@angular/core';
//import {Storage, SqlStorage} from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class DbProvider {

  constructor(public http: Http) {
    console.log('Hello DbProvider Provider');
  }

}
