import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
    styleUrls: ['./home.component.scss'],
    templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
    
  constructor(private router: Router) { }

  ngOnInit() {
    document.title = "Home - Ping by hype.";
    if (localStorage.getItem("currentUser") !== null) {
      this.router.navigate(["/dashboard", "overview"]);
    }
  }
    
}
