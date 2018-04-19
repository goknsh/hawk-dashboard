import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    name = "Dashboard";
    ngOnInit() {
        if (localStorage.getItem("currentUser") === null) {
            this.name = "Dashboard";
        } else {
            this.name = JSON.parse(localStorage.getItem("currentUser"))['name'];   
        }
    }
    
    nameDisp = false;
    constructor(private router: Router) {
        router.events.subscribe((val) => {
            if (localStorage.getItem("currentUser") === null) {
                this.name = "Dashboard";
                this.nameDisp = false;
            } else {
                this.name = JSON.parse(localStorage.getItem("currentUser"))['name'];   
                this.nameDisp = true;
            }
        });
    }
}
