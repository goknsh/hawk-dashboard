import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bot',
  templateUrl: './bot.component.html',
  styleUrls: ['./bot.component.scss']
})
export class BotComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    document.title = "About our Bot - Hawk";
  }

}
