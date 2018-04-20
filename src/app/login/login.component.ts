import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

interface response {
  email: string,
  name: string,
  response: string
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {
    
  }

  serverNum;
  loginDisplay; unverifiedDisplay; errorMsg = "No errors recieved."; errorDisplay = "inactive"; loginstatus = "Login"; verifyDisplay = false; sub; version; userStatus = JSON.parse(localStorage.getItem("currentUser"));
  
  ngOnInit() {
    document.title = "Login - Hawk";
    if (localStorage.getItem("currentUser") !== null) {
      if (new Date().getTime() >= this.userStatus["expires"]) {
        localStorage.clear();
        this.router.navigate(["/login", "loggedout"]);
      } else {
        this.router.navigate(["/dashboard"]);
      }
    } if (new Date().getDate() < 15) {
      this.serverNum = "s1";
    } else {
      this.serverNum = "s2";
    }
    this.sub = this.route.params.subscribe(params => {
       this.version = params['id'];
       if (this.version === 'unauthorized') {
         this.loginDisplay = true;
         this.verifyDisplay = false;
         this.unverifiedDisplay = false;
         this.errorDisplay = "active";
         this.errorMsg = "You don’t have access to that page. Try logging in.";
       } if (this.version === 'loggedout') {
         this.loginDisplay = true;
         this.verifyDisplay = false;
         this.unverifiedDisplay = false;
         this.errorDisplay = "active";
         this.errorMsg = "You’ve logged out successfully.";
       } if (this.version === 'timeout') {
         this.loginDisplay = true;
         this.verifyDisplay = false;
         this.unverifiedDisplay = false;
         this.errorDisplay = "active";
         this.errorMsg = "Your session has timed out, so you’ve been logged out forcefully.";
       } if (this.version === 'new') {
         this.loginDisplay = true;
         this.verifyDisplay = false;
         this.unverifiedDisplay = false;
         this.errorDisplay = "inactive";
         this.errorMsg = "No errors recieved.";
       } if (this.version === 'unverified') {
         this.loginDisplay = false;
         this.verifyDisplay = false;
         this.unverifiedDisplay = true;
         this.errorDisplay = "inactive";
         this.errorMsg = "No errors recieved.";
       } if (this.version === 'verify') {
         this.loginDisplay = false;
         this.verifyDisplay = true;
         this.unverifiedDisplay = false;
         this.errorDisplay = "inactive";
         this.errorMsg = "No errors recieved.";
       }
    });
  }
  
  login = new FormGroup({
    email: new FormControl('', Validators.compose([Validators.required, Validators.email])),
    password: new FormControl('', Validators.compose([Validators.required]))
  });
  
  loginUser(credentials) {
    this.loginstatus = "Contacting server...";
    this.http.get<response>(`https://main-${this.serverNum}.herokuapp.com/api/v2/?login=true&email=${credentials.email}&pass=${credentials.password}`).subscribe(
      data => {
        if (data.response === "mismatch") {
          this.errorMsg = "Incorrect email or password or account does not exist."
          this.errorDisplay = "active";
          this.loginstatus = "Login";
        } if (data.response === "success") {
          localStorage.setItem('currentUser', JSON.stringify({ email: data.email, name: data.name, pass: credentials.password, expires: new Date().setHours(new Date().getHours() + 2)}));
          this.loginstatus = "Successful. Redirecting you...";
          setTimeout(() => { this.loginstatus = "Login"; this.router.navigate(["/dashboard", "overview"]); }, 300);
        } if (data.response === "verify") {
          this.loginstatus = "There’s a problem...";
          this.router.navigate(["/login", "unverified"]);
          setTimeout(() => { this.loginstatus = "Login"; this.login.reset(); }, 300);
        }  if (data.response === "error") {
          this.errorMsg = "Something is wrong with the server. Try again later."
          this.errorDisplay = "active";
          this.loginstatus = "Login";
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          this.errorMsg = "Something is wrong on your side. Are you online? If you have a AdBlocker, try turning it off."
          this.errorDisplay = "active";
          this.loginstatus = "Login";
        } else {
          this.errorMsg = "Something is wrong with the server. Try again later."
          this.errorDisplay = "active";
          this.loginstatus = "Login";
        }
      }
    )
  }
}
