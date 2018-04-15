import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notfound',
  templateUrl: './notfound.component.html',
  styleUrls: ['./notfound.component.scss']
})
export class NotfoundComponent implements OnInit {

  constructor(
    private router: Router
  ) { }
  currentURL;
  ngOnInit() {
    document.title = "404; Not Found - Hawk";
    this.currentURL = this.router.url;
  }

}
