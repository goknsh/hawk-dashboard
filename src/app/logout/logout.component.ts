import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    
  }

  sub;

  ngOnInit() {
    document.title = "Logout - Hawk";
    localStorage.removeItem("currentUser");
    this.sub = this.route.params.subscribe(params => {
      if (params['id'] === "unauthorized") {
        this.router.navigate(["/login", "unauthorized"]);
      } if (params['id'] === "true") {
        this.router.navigate(["/login", "loggedout"]);
      }
    });
  }

}
