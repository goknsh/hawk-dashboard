import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Chart } from 'chart.js';

interface response {
  response: string,
  thresh: number,
  name: string
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) { }
  
  userData = null; reqData: any; reqMoreData: any;
  userStatus = JSON.parse(localStorage.getItem("currentUser"));
  loading = true; latencyLineChartJS; lookupLineChartJS; basic = true;
  localTimes = new Array(); sslTimes = new Array(); sslMoreAuth = new Array(); sslMoreExp = new Array(); siteURLMore;
  errorMsg; errorDisplay = false; loginstatus; site; item; currentURL;
  dashboardStatus = "Loading..."; dashboardClass; dashboardSub = "We are downloading data from our servers.";
  overviewStatus = "good"; overviewSub = "This website is up and running."; overviewRepeat; realData; serverNum;
  sub; version; overviewDisplay = false; notfoundDisplay = false; moreDisplay = false; moreDisplayStatus; reqMoreDataForOverview = new Array(); addDisplay = false; accountDisplay = false; currentLatencyMore;
  moreName; moreNameRegex: any; usLatencyChart = new Array(); usLookupChart = new Array(); ieLatencyChart = new Array(); ieLookupChart = new Array(); usSpeedForCharts = new Array(); ieSpeedForCharts = new Array(); timesForLatency = new Array(); timesForLookup = new Array(); timesForLog = new Array(); outages = new Array();

  ngOnInit() {
    document.title = "Dashboard - Hawk"; setTimeout(() => { this.basic; }, 500);
    window.onbeforeunload = function(e) {
      sessionStorage.clear();
    };
    
    if (new Date().getDate() < 15) {
      this.serverNum = "s1";
    } else {
      this.serverNum = "s2";
    }
    
    if (localStorage.getItem("currentUser") === null) {
      this.router.navigate(["/login", "unauthorized"]);
    } else {
      if (new Date().getTime() >= this.userStatus["expires"]) {
        localStorage.clear();
        this.router.navigate(["/login", "timeout"]);
      } else {
          this.getOverviewData(); this.loading = true; this.overviewDisplay = false; this.overviewRepeat = setInterval(() => { this.getOverviewData(); }, 90000);
        }
    }
    this.routerTrack();
  }
  
  routerTrack() {
    this.sub = this.route.params.subscribe(params => {
      this.currentURL = this.router.url;
      this.version = params['id'];
      if (new Date().getTime() >= this.userStatus["expires"]) {
        localStorage.clear();
        this.router.navigate(["/login", "timeout"]);
      } else {
        if (isNaN(this.version) === true) {
          if (this.version === 'overview') {
            this.loading = false;
            this.moreDisplay = false;
            this.overviewDisplay = true;
            this.notfoundDisplay = false;
            this.addDisplay = false;
            this.accountDisplay = false;
          } if (this.version === 'add') {
            this.loading = false;
            this.moreDisplay = false;
            this.overviewDisplay = false;
            this.notfoundDisplay = false;
            this.addDisplay = true;
            this.accountDisplay = false;
          } if (this.version === 'account') {
            this.loading = false;
            this.moreDisplay = false;
            this.overviewDisplay = false;
            this.notfoundDisplay = false;
            this.addDisplay = false;
            this.accountDisplay = true;
          } if (this.version !== "add" && this.version !== "overview" && this.version !== "account") {
            this.loading = false;
            this.moreDisplay = false;
            this.overviewDisplay = false;
            this.notfoundDisplay = true;
            this.addDisplay = false;
            this.accountDisplay = false;
          }
        } else {
          if (sessionStorage.getItem(this.version) === null) {
            this.getMoreData(Number(this.version));
            sessionStorage.clear();
            sessionStorage.setItem(this.version, String(new Date().setSeconds(new Date().getSeconds() + 90)));
          } else {
            if (Number(sessionStorage.getItem(this.version)) < Number(new Date())) {
              this.getMoreData(Number(this.version));
              sessionStorage.clear();
              sessionStorage.setItem(this.version, String(new Date().setSeconds(new Date().getSeconds() + 90)));
            } else {
              this.loading = true;
              this.overviewDisplay = false;
              this.moreDisplay = true;
              this.loading = false;
              this.notfoundDisplay = false;
              this.addDisplay = false;
              this.accountDisplay = false;
            }
          }
        }
      }
    });
  }
  
  data: any;
  
  getOverviewData() {
    this.userData = JSON.parse(localStorage.getItem("currentUser"));
    this.http.get(`https://main-${this.serverNum}.herokuapp.com/api/v2/?site=get&email=${this.userData.email}&pass=${this.userData.pass}`).subscribe(
      data => {
        this.data = data;
        if (this.data["response"] === "error") {
          this.dashboardStatus = "Something is wrong with our server.";
          this.dashboardSub = "We’ll try again in 90 seconds.";
          this.dashboardClass = "bad";
        } if (this.data["response"] === "mismatch") {
          this.dashboardStatus = "Unauthorized.";
          this.dashboardSub = "You have a wrong password.";
          setTimeout(() => { this.router.navigate(["/logout", "unauthorized"]); }, 500);
        } else {
          if (this.data.length === 0) {
            this.dashboardStatus = "No websites added.";
            this.dashboardSub = "Looks like you don’t have Hawk monitoring anything. Go ahead and add a check.";
          } else {
            this.reqData = data; this.localTimes = []; this.sslTimes = []; this.sslTimes["us"] = []; this.sslTimes["ie"] = [];
            let i = 0; let notOk = 0;
              for (let item of this.reqData) {
                this.localTimes.push(new Date(item[0]["data"]["time"] + " GMT").toLocaleTimeString());
                if (item["us-ssl-exp"] !== "Not present") {
                  this.sslTimes["us"].push(new Date(item["us-ssl-exp"]).toLocaleString());
                } else {
                  this.sslTimes["us"].push("Not present");
                }
                if (item["ie-ssl-exp"] !== "Not present") {
                  this.sslTimes["ie"].push(new Date(item["ie-ssl-exp"]).toLocaleString());
                } else {
                  this.sslTimes["ie"].push("Not present");
                }
                if (this.reqData[i][0]["data"]["us-status"] !== "Up") {
                  notOk++;
                } if (this.reqData[i][0]["data"]["ie-status"] !== "Up") {
                  notOk++;
                }
                i++;
              }
              if (notOk !== 0) {
                this.dashboardStatus = "Uh-oh. Something isn’t right.";
                this.dashboardSub = "One or more of your websites is/are down because it returned a bad response code or has timed out.";
                this.dashboardClass = "bad";
              } else {
                this.dashboardStatus = "Everything is working!";
                this.dashboardClass = "good";
                this.dashboardSub = "All of your websites are up and running.";
              }
              if (this.version === 'overview') {
                this.overviewDisplay = true; this.loading = false;
              }
          }
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          this.errorMsg = "Something is wrong on your side. Are you online? If you have an AdBlocker, try turning it off."
          this.errorDisplay = true;
        } else {
          this.errorMsg = "Something is wrong with the server. Try again later, or we’ll automatically try to connect to the server again in 90 seconds."
          this.errorDisplay = true;
        }
      }
    )
  }
  
  addWebsite = new FormGroup({
    url: new FormControl('', Validators.compose([Validators.required, Validators.pattern("https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)")])),
    timeout: new FormControl('', Validators.compose([Validators.required])),
    title: new FormControl('', Validators.compose([Validators.required])),
    interval: new FormControl('')
  });
  
  errorMsgAdd; addErrorAlertType = "info"; addErrorDisplay = false; addWebsiteStatus = "Add Check";
  
  passwordChangeButton = "Change Password";
  
  passwordChange = new FormGroup({
    currentPassword: new FormControl('', Validators.compose([Validators.required])),
    passwordChangeToThis: new FormControl('', Validators.compose([Validators.required]))
  });
  
  passwordChangeTo(value) {
    this.passwordChangeButton = "Contacting server...";
    this.http.get<response>(`https://main-${this.serverNum}.herokuapp.com/api/v2/?change=pass&email=${this.userData.email}&pass=${value.currentPassword}&newpass=${value.passwordChangeToThis}`).subscribe(
      data => {
        if (data.response === "mismatch") {
          this.passwordChangeButton = "Unauthorized!";
          setTimeout(() => { this.router.navigate(["/logout", "unauthorized"]); }, 200);
        } if (data.response === "success") {
          this.passwordChangeButton = "Password Changed. You’ll need to login again.";
          setTimeout(() => { this.router.navigate(["/logout", "unauthorized"]); this.passwordChangeButton = "Change Password"; }, 1000);
        } if (data.response === "error") {
          this.passwordChangeButton = "An error occured";
          setTimeout(() => { this.passwordChangeButton = "Change Password"; }, 1000);
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          this.passwordChangeButton = "An error occured";
          setTimeout(() => { this.passwordChangeButton = "Change Password"; }, 1000);
        } else {
          this.passwordChangeButton = "An error occured";
          setTimeout(() => { this.passwordChangeButton = "Change Password"; }, 1000);
        }
      }
    )
  }
  
  addWebsiteToDB(website) {
    this.addWebsiteStatus = "Contacting server...";
    this.http.get<response>(`https://main-${this.serverNum}.herokuapp.com/api/v2/?add=true&url=${website.url}&title=${website.title}&timeout=${website.timeout}&email=${this.userData.email}&pass=${this.userData.pass}`).subscribe(
      data => {
        if (data.response === "mismatch") {
          this.errorMsgAdd = "Incorrect email or password or account does not exist."
          this.addErrorAlertType = "alert-danger";
          this.addErrorDisplay = true;
          this.addWebsiteStatus = "Add Check";
          setTimeout(() => { this.router.navigate(["/login", "unauthorized"]); }, 200);
        } if (data.response === "exists") {
          this.errorMsgAdd = "The website you're trying to add already exists."
          this.addErrorAlertType = "alert-danger";
          this.addErrorDisplay = true;
          this.addWebsiteStatus = "Add Check";
        } if (data.response === "success") {
          this.errorMsgAdd = "Website successfully added."
          this.addErrorAlertType = "alert-success";
          this.addErrorDisplay = true;
          this.addWebsiteStatus = "Add Check";
          this.addWebsite.reset();
          this.getOverviewData();
          setInterval(() => { this.addErrorDisplay = false; }, 3000);
        } if (data.response === "error") {
          this.errorMsgAdd = "Something is wrong with the server. Try again later."
          this.addErrorAlertType = "alert-danger";
          this.addErrorDisplay = true;
          this.addWebsiteStatus = "Add Check";
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          this.errorMsgAdd = "Something is wrong on your side. Are you online? If you have an AdBlocker, try turning it off."
          this.addErrorAlertType = "alert-danger";
          this.addErrorDisplay = true;
        } else {
          this.errorMsgAdd = "Something is wrong with the server. Try again later, or we’ll automatically try to connect to the server again in 90 seconds."
          this.addErrorAlertType = "alert-danger";
          this.addErrorDisplay = true;
        }
      }
    )
  }
  
  emailChange = new FormGroup({
    currentEmail: new FormControl('', Validators.compose([Validators.email])),
    emailChangeToThis: new FormControl('', Validators.compose([Validators.email, Validators.required]))
  });

  emailControlButton = "Change Email";
  
  emailChangeTo(value) {
    this.http.get<response>(`https://main-${this.serverNum}.herokuapp.com/api/v2/?change=email&email=${this.userData.email}&to=${value.emailChangeToThis}&pass=${this.userData.pass}`).subscribe(
      data => {
        if (data.response === "mismatch") {
          this.emailControlButton = "Unauthorized!";
          setTimeout(() => { this.router.navigate(["/login", "unauthorized"]); }, 200);
        } if (data.response === "success") {
          this.emailControlButton = "Website Deleted. Taking you to all websites overview."; this.deleteWebsite.reset(); this.getOverviewData();
          setTimeout(() => { this.emailControlButton = "Change Email"; }, 1000);
        } if (data.response === "error") {
          this.emailControlButton = "An error occured";
          setTimeout(() => { this.emailControlButton = "Change Email"; }, 1000);
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          this.emailControlButton = "An error occured";
          setTimeout(() => { this.emailControlButton = "Change Email"; }, 1000);
        } else {
          this.emailControlButton = "An error occured";
          setTimeout(() => { this.emailControlButton = "Change Email"; }, 1000);
        }
      }
    )
  }
  
  changeLatency = new FormGroup({
    changeLatencyTo: new FormControl('', Validators.compose([Validators.required]))
  });
  
  changeLatencyButton = "Change Latency";
  
  changeLatencyTo(value) {
    this.http.get<response>(`https://main-${this.serverNum}.herokuapp.com/api/v2/?change=latency&to=${value.changeLatencyTo}&url=${this.siteURLMore}&email=${this.userData.email}&pass=${this.userData.pass}`).subscribe(
      data => {
        if (data.response === "mismatch") {
          this.changeLatencyButton = "Unauthorized!";
          setTimeout(() => { this.router.navigate(["/login", "unauthorized"]); }, 200);
        } if (data.response === "success") {
          this.changeLatencyButton = "Latency Threshold Changed"; this.currentLatencyMore = data.thresh; this.changeLatency.reset();
          setTimeout(() => { this.changeLatencyButton = "Change Latency"; }, 1000);
        } if (data.response === "error") {
          this.changeLatencyButton = "An error occured";
          setTimeout(() => { this.changeLatencyButton = "Change Latency"; }, 1000);
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          this.changeLatencyButton = "An error occured";
          setTimeout(() => { this.changeLatencyButton = "Change Latency"; }, 1000);
        } else {
          this.changeLatencyButton = "An error occured";
          setTimeout(() => { this.changeLatencyButton = "Change Latency"; }, 1000);
        }
      }
    )
  }
  
  changeWebsiteName = new FormGroup({
    changeWebsiteNameTo: new FormControl('', Validators.compose([Validators.required]))
  });
  
  changeWebsiteButton = "Change Name";
  
  changeWebsiteNameTo(value) {
    this.http.get<response>(`https://main-${this.serverNum}.herokuapp.com/api/v2/?change=website&to=${value.changeWebsiteNameTo}&url=${this.siteURLMore}&email=${this.userData.email}&pass=${this.userData.pass}`).subscribe(
      data => {
        if (data.response === "mismatch") {
          this.changeWebsiteButton = "Unauthorized!";
          setTimeout(() => { this.router.navigate(["/login", "unauthorized"]); }, 200);
        } if (data.response === "success") {
          this.changeWebsiteButton = "Name Changed"; this.moreName = data.name; this.currentLatencyMore = data.name; this.changeWebsiteName.reset();
          setTimeout(() => { this.changeWebsiteButton = "Change Name"; }, 1000);
        } if (data.response === "error") {
          this.changeWebsiteButton = "An error occured";
          setTimeout(() => { this.changeWebsiteButton = "Change Name"; }, 1000);
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          this.changeWebsiteButton = "An error occured";
          setTimeout(() => { this.changeWebsiteButton = "Change Name"; }, 1000);
        } else {
          this.changeWebsiteButton = "An error occured";
          setTimeout(() => { this.changeWebsiteButton = "Change Name"; }, 1000);
        }
      }
    )
  }
  
  deleteWebsite = new FormGroup({
    confirm: new FormControl('', Validators.compose([Validators.required]))
  });
  
  deleteButton = "Delete Check";
  
  deleteWebsiteSubmit(value) {
    this.http.get<response>(`https://main-${this.serverNum}.herokuapp.com/api/v2/?delete=true&id=${this.version}&url=${this.siteURLMore}&email=${this.userData.email}&pass=${this.userData.pass}`).subscribe(
      data => {
        if (data.response === "mismatch") {
          this.deleteButton = "Unauthorized!";
          setTimeout(() => { this.router.navigate(["/login", "unauthorized"]); }, 200);
        } if (data.response === "success") {
          this.deleteButton = "Website Deleted. Taking you to all websites overview."; this.deleteWebsite.reset(); this.getOverviewData();
          setTimeout(() => { this.router.navigate(["/dashboard", "overview"]); this.deleteButton = "Delete Check"; }, 1000);
        } if (data.response === "error") {
          this.deleteButton = "An error occured";
          setTimeout(() => { this.router.navigate(["/dashboard", "overview"]); this.deleteButton = "Delete Check"; }, 1000);
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          this.deleteButton = "An error occured";
          setTimeout(() => { this.deleteButton = "Delete Check"; }, 1000);
        } else {
          this.deleteButton = "An error occured";
          setTimeout(() => { this.deleteButton = "Delete Check"; }, 1000);
        }
      }
    )
  }
  
  letter: any; usUptime; ieUptime; usUptimeWk; ieUptimeWk; usUptimeMn; ieUptimeMn; usApd; usApdData; ieApd; ieApdData; usApdWk; usApdWkData; ieApdWk; ieApdWkData; usApdMn; usApdMnData; ieApdMn; ieApdMnData; usLatency; ieLatency; usLookup; ieLookup; usSpeed; ieSpeed;
  getMoreData(id) {
    this.loading = true; this.overviewDisplay = false; this.sslMoreAuth = new Array(); this.sslMoreExp = new Array(); this.reqMoreDataForOverview = new Array(); this.addDisplay = false; this.accountDisplay = false; this.currentLatencyMore; this.moreNameRegex = new Array();
    this.userData = JSON.parse(localStorage.getItem("currentUser"));
    
    this.http.get(`https://main-${this.serverNum}.herokuapp.com/api/v2/?site=more&id=${id}&email=${this.userData.email}&pass=${this.userData.pass}`).subscribe(
      data => {
        this.moreDisplayStatus = "Everything is working!";
        this.moreName = data["name"];
        for (this.letter of Array.from(this.moreName)) {
          this.moreNameRegex.push(`[${this.letter.toLowerCase()}${this.letter.toUpperCase()}]`);
        }
        this.moreNameRegex = this.moreNameRegex.toString().replace(/,/g, '');
        this.siteURLMore = data["site"];
        this.sslMoreAuth.push(data["us-ssl-auth"]); this.sslMoreAuth.push(data["ie-ssl-auth"]); this.currentLatencyMore = data["thresh"];
        if (data["us-ssl-exp"] !== "Not present") {
          this.sslMoreExp.push(new Date(data["us-ssl-exp"]).toLocaleString());
        } else {
          this.sslMoreExp.push("Not present");
        } if (data["ie-ssl-exp"] !== "Not present") {
          this.sslMoreExp.push(new Date(data["ie-ssl-exp"]).toLocaleString());
        } else {
          this.sslMoreExp.push("Not present");
        }
        this.reqMoreData = new Array(); this.reqMoreData.push(data[0]); this.reqMoreData = this.reqMoreData[0]; this.reqMoreDataForOverview.push(this.reqMoreData[0][0]);
        let i = 0;
        this.timesForLatency = new Array(); this.timesForLookup = new Array(); this.timesForLog = new Array(); this.usLatencyChart = new Array(); this.usLookupChart = new Array(); this.usSpeedForCharts = new Array(); this.ieLatencyChart = new Array(); this.ieLookupChart = new Array(); this.ieSpeedForCharts = new Array(); this.outages = new Array();
        for (let item of this.reqMoreData) {
          this.timesForLatency.push(new Date(item[0]["time"] + " UTC").toLocaleTimeString());
          this.timesForLookup.push(new Date(item[0]["time"] + " UTC").toLocaleTimeString());
          this.timesForLog.push(new Date(item[0]["time"] + " UTC").toLocaleString());
          this.usLatencyChart.push(item[0]["us-latency"]); this.ieLatencyChart.push(item[0]["ie-latency"]);
          this.usLookupChart.push(item[0]["us-lookup"]); this.ieLookupChart.push(item[0]["ie-lookup"]);
          this.usSpeedForCharts.push(item[0]["us-speed"]); this.ieSpeedForCharts.push(item[0]["ie-speed"]);
          if (item[0]["outage"] === "1") {
            this.outages.push(i);
            console.log(this.outages)
          }
          i++;
        }
        if (this.reqMoreData[0][0]["us-status"] !== "Up" || this.reqMoreData[0][0]["ie-status"] !== "Up") {
          this.overviewStatus = "bad";
          this.overviewSub = "This website is down because it returned a bad response code or has timed out.";
        }
        
        this.usUptime = data["us-uptime"]; this.ieUptime = data["ie-uptime"];
        this.usUptimeWk = data["us-uptime-wk"]; this.ieUptimeWk = data["ie-uptime-wk"];
        this.usUptimeMn = data["us-uptime-mn"]; this.ieUptimeMn = data["ie-uptime-mn"];
        this.usLatency = data["us-latency"]; this.ieLatency = data["ie-latency"];
        this.usLookup = data["us-lookup"]; this.ieLookup = data["ie-lookup"];
        this.usSpeed = data["us-speed"]; this.ieSpeed = data["ie-speed"];
        this.usApd = data["us-apd"]; this.usApdData = data["us-apd-data"]; this.ieApd = data["ie-apd"]; this.ieApdData = data["ie-apd-data"];
        this.usApdWk = data["us-apd-wk"]; this.usApdWkData = data["us-apd-wk-data"]; this.ieApdWk = data["ie-apd-wk"]; this.ieApdWkData = data["ie-apd-wk-data"];
        this.usApdMn = data["us-apd-mn"]; this.usApdMnData = data["us-apd-mn-data"]; this.ieApdMn = data["ie-apd-mn"]; this.ieApdMnData = data["ie-apd-mn-data"];
        this.drawCharts();
        this.loading = false; this.moreDisplay = true;
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          this.errorMsg = "Something is wrong on your side. Are you online? If you have an AdBlocker, try turning it off."
          this.errorDisplay = true;
        } else {
          this.errorMsg = "Something is wrong with the server. Try again later, or we’ll automatically try to connect to the server again in 90 seconds."
          this.errorDisplay = true;
        }
      }
    )
  }
  
  drawCharts() {
    Chart.defaults.global.defaultFontFamily = 'Colfax';
    if (this.latencyLineChartJS !== undefined) {
      this.latencyLineChartJS.destroy();
      this.lookupLineChartJS.destroy();
    }
    this.latencyLineChartJS = new Chart('latencyLineChart', {
      type: 'line',
      data: {
        labels: this.timesForLatency.splice(0, 61).reverse(),
        datasets: [{
          label: "Latency in US",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          data: this.usLatencyChart.splice(0, 61).reverse(),
          speed: this.usSpeedForCharts
        }, {
          label: "Latency in IE",
          fill: true,
          backgroundColor: "rgba(44, 249, 116, 0.2)",
          borderColor: "rgba(44, 249, 116, 1)",
          data: this.ieLatencyChart.splice(0, 61).reverse(),
          speed: this.ieSpeedForCharts
        }]
      },
      options: {
        responsive: true,
        title:{
          display:true,
          text: 'Latency for last 60 checks',
          fontSize: 28,
          fontColor: 'black',
        },
        tooltips: {
          mode: 'index',
          intersect: false,
            callbacks: {
                label: function(tooltipItems, data) {
                  if (tooltipItems.datasetIndex === 0) {
                    return 'United States: ' + tooltipItems.yLabel + 'ms @ ' + data.datasets[tooltipItems.datasetIndex].speed[tooltipItems.index] + "mbps";
                  } if (tooltipItems.datasetIndex === 1) {
                    return 'Ireland: ' + tooltipItems.yLabel + 'ms @ ' + data.datasets[tooltipItems.datasetIndex].speed[tooltipItems.index] + "mbps";
                  }
                }
            }
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Time'
            }
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Latency (ms)'
            }
          }]
        }
      }
    });
    
    this.lookupLineChartJS = new Chart('lookupLineChart', {
      type: 'line',
      data: {
        labels: this.timesForLookup.splice(0, 61).reverse(),
        datasets: [{
          label: "Nameserver Lookup Latency in US",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          data: this.usLookupChart.splice(0, 61).reverse(),
          speed: this.usSpeedForCharts
        }, {
          label: "Nameserver Lookup Latency in IE",
          fill: true,
          backgroundColor: "rgba(44, 249, 116, 0.2)",
          borderColor: "rgba(44, 249, 116, 1)",
          data: this.ieLookupChart.splice(0, 61).reverse(),
          speed: this.ieSpeedForCharts
        }]
      },
      options: {
        responsive: true,
        title:{
          display:true,
          text: 'Nameserver Lookup Latency for last 60 checks',
          fontSize: 28,
          fontColor: 'black',
        },
        tooltips: {
          mode: 'index',
          intersect: false,
            callbacks: {
              label: function(tooltipItems, data) {
                if (tooltipItems.datasetIndex === 0) {
                  return 'United States: ' + tooltipItems.yLabel + 'ms @ ' + data.datasets[tooltipItems.datasetIndex].speed[tooltipItems.index] + "mbps";
                } if (tooltipItems.datasetIndex === 1) {
                  return 'Ireland: ' + tooltipItems.yLabel + 'ms @ ' + data.datasets[tooltipItems.datasetIndex].speed[tooltipItems.index] + "mbps";
                }
              }
            }
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Time'
            }
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Latency (ms)'
            }
          }]
        }
      }
    });
  }
  
  backButton() {
    this.overviewDisplay = true;
    this.moreDisplay = false;
  }
  
}
