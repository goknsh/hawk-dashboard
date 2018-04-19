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
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss']
})

export class VerifyComponent implements OnInit {

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  loginDisplay; unverifiedDisplay; serverNum; errorMsg = "No errors recieved."; errorDisplay = "inactive"; loginstatus = "Login"; verifyDisplay = false; sub; version; userStatus = JSON.parse(localStorage.getItem("currentUser")); hash;

  ngOnInit() {
    document.title = "Verify Email - Hawk";
    this.sub = this.route.params.subscribe(params => {
       this.hash = params['id'];
    });
    if (new Date().getDate() < 15) {
      this.serverNum = "s1";
    } else {
      this.serverNum = "s2";
    }
    this.loginDisplay = true;
  }
  
  login = new FormGroup({
    email: new FormControl('', Validators.compose([Validators.required, Validators.email])),
    password: new FormControl('', Validators.required)
  });
   
  loginUser(credentials) {
    this.loginstatus = "Contacting server...";
    this.http.get<response>(`https://main-${this.serverNum}.herokuapp.com/api/v2/?verify=true&email=${credentials.email}&pass=${credentials.password}&hash=${this.hash}`).subscribe(
      data => {
        if (data.response === "mismatch") {
          this.errorMsg = "Incorrect email or password or account does not exist."
          this.errorDisplay = "active";
          this.loginstatus = "Login";
        } if (data.response === "success") {
          localStorage.setItem('currentUser', JSON.stringify({ email: data.email, name: data.name, pass: credentials.password, expires: new Date().setHours(new Date().getHours() + 2)}));
          this.loginstatus = "Successful. Redirecting you...";
          setTimeout(() => { this.router.navigate(["/dashboard", "overview"]); }, 300);
        } if (data.response === "verify") {
          this.errorMsg = "The hashes do not match. Please try again."
          this.errorDisplay = "active";
          this.loginstatus = "Login";
        } if (data.response === "nomatch") {
          this.router.navigate(["/login", "unverified"]);
        } if (data.response === "error") {
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
