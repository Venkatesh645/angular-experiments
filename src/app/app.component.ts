import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

const EXPIRED_TOKEN = 'EXPIRED_TOKEN';
const VALID_TOKEN = 'VALID_TOKEN';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'experiments-v8';
  setIntervalCtrl: any;
  count: number = 0;

  constructor(private http: HttpClient) { }

  setValidToken() {
    console.log('===== Setting the VALID_TOKEN to localStorage ======');
    localStorage.setItem('token', VALID_TOKEN);
  }

  setExpiredToken() {
    console.log('===== Setting the EXPIRED_TOKEN to localStorage ======');
    localStorage.setItem('token', EXPIRED_TOKEN);
    setInterval(() => {
      console.log('===== Setting the EXPIRED_TOKEN to localStorage | setINterval ======');
      localStorage.setItem('token', EXPIRED_TOKEN);
    }, 10000);
  }

  makeApiCalls(): any {
    // this.fetchData();
    this.setIntervalCtrl = setInterval(() => {
      console.log("===== setInterval =====");
      this.fetchData();
    }, 1000);
  }

  stopTheApiCalls() {
    console.log('=== Clearing the interval ===')
    clearInterval(this.setIntervalCtrl);
  }


  fetchData(): void {
    try {
      const URL = 'http://localhost:8080/api/url';
      this.count = this.count + 1;
      const headers = {
        token: localStorage.getItem('token'),
        count: this.count.toString()
      }
      console.log('########## headers ==>', headers);
      this.http.get(URL, {
        headers
      }).subscribe(resp => {
        console.log('fetchData | resp =/>', resp);
      }, error => {
        console.log('fetchData | erro =/>', error);
      });
    } catch (error) {
      console.error('error=>', error);
    }
  }


}
