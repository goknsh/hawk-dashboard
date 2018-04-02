import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Chart } from 'chart.js';

interface response {
  response: string
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
  loading = true; latencyLineChartJS; lookupLineChartJS;
  localTimes = new Array(); sslTimes = new Array();
  errorMsg; errorDisplay = false; loginstatus; site; item; currentURL;
  dashboardStatus = "Everything is working!"; dashboardClass = "good"; dashboardSub = "All of your websites are up and running.";
  overviewStatus = "good"; overviewSub = "This website is up and running.";
  sub; version; overviewDisplay = false; notfoundDisplay = false; moreDisplay = false; moreDisplayStatus; reqMoreDataForOverview = new Array(); addDisplay = false;
  moreName; usLatencyChart = new Array(); usLookupChart = new Array(); timesForChart = new Array(); timesForLog = new Array(); outages = new Array();

  ngOnInit() {
    document.title = "Dashboard - Ping by hype.";
    window.onbeforeunload = function(e) {
      sessionStorage.clear()
    };
    this.currentURL = this.router.url;
    if (localStorage.getItem("currentUser") === null) {
      this.router.navigate(["/login", "unauthorized"]);
    } else {
      if (new Date().getTime() >= this.userStatus["expires"]) {
        localStorage.clear();
        this.router.navigate(["/login", "loggedout"]);
      } else {
        this.getOverviewData();
        this.loading = true; this.overviewDisplay = false;
        setInterval(() => { this.getOverviewData(); }, 90000);
      }
    }
    this.routerTrack();
  }
  
  routerTrack() {
    this.sub = this.route.params.subscribe(params => {
      this.version = params['id'];
      if (new Date().getTime() >= this.userStatus["expires"]) {
        localStorage.clear();
        this.router.navigate(["/login", "loggedout"]);
      } else {
        if (isNaN(this.version) === true) {
          if (this.version === 'overview') {
            this.loading = false;
            this.moreDisplay = false;
            this.overviewDisplay = true;
            this.notfoundDisplay = false;
            this.addDisplay = false;
          } if (this.version === 'add') {
            this.loading = false;
            this.moreDisplay = false;
            this.overviewDisplay = false;
            this.notfoundDisplay = false;
            this.addDisplay = true;
          } if (this.version !== "add" && this.version !== "overview") {
            this.loading = false;
            this.moreDisplay = false;
            this.overviewDisplay = false;
            this.notfoundDisplay = true;
            this.addDisplay = false;
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
            }
          }
        }
      }
    });
  }
  
  getOverviewData() {
    this.userData = JSON.parse(localStorage.getItem("currentUser"));
    this.http.get(`https://us.useping.ga/api/v1/new?site=get&email=${this.userData.email}&pass=${this.userData.pass}`).subscribe(
      data => {
        this.reqData = data; this.localTimes = []; this.sslTimes = [];
        let i = 0; let notOk = 0;
          for (let item of this.reqData) {
            this.localTimes.push(new Date(item[0]["data"]["time"] + " UTC").toLocaleTimeString());
            this.sslTimes.push(new Date(item[0]["data"]["us-ssl-expiry"] + " UTC").toLocaleString());
            if (this.reqData[i][0]["data"]["us-status"] !== "Up") {
              notOk++;
            }
            i++;
          }
          if (notOk !== 0) {
            this.dashboardStatus = "Uh-oh. Something isn’t right.";
            this.dashboardSub = "One or more of your websites is/are down because it returned a bad response code or has timed out.";
            this.dashboardClass = "bad";
          }
          if (this.version === 'overview') {
            this.overviewDisplay = true; this.loading = false;
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
  
  getMoreData(id) {
    this.loading = true;
    this.overviewDisplay = false;
    
    this.userData = JSON.parse(localStorage.getItem("currentUser"));
    this.http.get(`https://us.useping.ga/api/v1/new?site=more&id=${id}&email=${this.userData.email}&pass=${this.userData.pass}`).subscribe(
      data => {
        this.moreDisplayStatus = "Everything is working!";
        this.moreName = data["name"];
        delete data[0]["id"]; delete data[0]["name"]; delete data[0]["site"];
        this.reqMoreData = new Array(); this.reqMoreData.push(data[0]); this.reqMoreData = this.reqMoreData[0]; this.reqMoreDataForOverview.push(this.reqMoreData[0][0]);
        let i = 0;
        for (let item of this.reqMoreData) {
          this.timesForLog.push(new Date(item[0]["time"] + " UTC").toLocaleString());
          this.timesForChart.push(new Date(item[0]["time"] + " UTC").toLocaleTimeString());
          this.usLatencyChart.push(item[0]["us-ping"]);
          this.usLookupChart.push(item[0]["us-lookup"]);
          if (item[0]["outage"] === "1") {
            this.outages.push(i);
          }
          i++;
        }
        // if (item[0]["us-status"] !== "Up" | item[0]["uk-status"] !== "Up" | item[0]["in-status"] !== "Up") {
        
        if (this.reqMoreData[0][0]["us-status"] !== "Up") {
          this.overviewStatus = "bad";
          this.overviewSub = "This website is down because it returned a bad response code or has timed out.";
        }
        
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
    Chart.defaults.global.defaultFontFamily = 'IBM Plex Sans';
    this.latencyLineChartJS = new Chart('latencyLineChart', {
      type: 'line',
      data: {
        labels: this.timesForChart.splice(0, 61).reverse(),
        datasets: [{
          label: "Latency in US",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          data: this.usLatencyChart.splice(0, 61).reverse(),
          fill: true,
        }, {
          label: "Latency in GB",
          fill: true,
          backgroundColor: "rgba(44, 249, 116, 0.2)",
          borderColor: "rgba(44, 249, 116, 1)",
          // data: this.usLatencyChart.splice(0, 61),
        }, {
          label: "Latency in IN",
          fill: true,
          backgroundColor: "rgba(63, 176, 229, 0.2)",
          borderColor: "rgba(63, 176, 229, 1)",
          // data: this.usLatencyChart.splice(0, 61),
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
          intersect: false
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
        labels: this.timesForChart.splice(0, 61).reverse(),
        datasets: [{
          label: "Nameserver Lookup in US",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          data: this.usLookupChart.splice(0, 61).reverse(),
          fill: true,
        }, {
          label: "Nameserver Lookup in GB",
          fill: true,
          backgroundColor: "rgba(44, 249, 116, 0.2)",
          borderColor: "rgba(44, 249, 116, 1)",
          // data: this.usLookupChart.splice(0, 61),
        }, {
          label: "Nameserver Lookup in IN",
          fill: true,
          backgroundColor: "rgba(63, 176, 229, 0.2)",
          borderColor: "rgba(63, 176, 229, 1)",
          // data: this.usLookupChart.splice(0, 61),
        }]
      },
      options: {
        responsive: true,
        title:{
          display:true,
          text: 'Nameserver Lookup for last 60 checks',
          fontSize: 28,
          fontColor: 'black',
        },
        tooltips: {
          mode: 'index',
          intersect: false
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
  
  urlRegex = "(((http|ftp|https):\/{2})+(([0-9a-z_-]+\.)+(aero|asia|biz|cat|com|coop|edu|gov|info|int|jobs|mil|mobi|museum|name|net|org|pro|tel|travel|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cx|cy|cz|cz|de|dj|dk|dm|do|dz|ec|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mn|mn|mo|mp|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|nom|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ra|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw|arpa)(:[0-9]+)?((\/([~0-9a-zA-Z\#\+\%@\.\/_-]+))?(\?[0-9a-zA-Z\+\%@\/&\[\];=_-]+)?)?))\b";
  
  addWebsite = new FormGroup({
    url: new FormControl('', Validators.compose([Validators.required, Validators.pattern("https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)")])),
    timeout: new FormControl('', Validators.compose([Validators.required])),
    title: new FormControl('', Validators.compose([Validators.required]))
  });
  
  errorMsgAdd; errorDisplayAdd = "error inactive"; addWebsiteStatus = "Add Website";
  
  addWebsiteToDB(website) {
    this.addWebsiteStatus = "Contacting server...";
    this.http.get<response>(`https://us.useping.ga/api/v1/new?add=true&url=${website.url}&title=${website.title}&timeout=${website.timeout}&email=${this.userData.email}&pass=${this.userData.pass}`).subscribe(
      data => {
        if (data.response === "mismatch") {
          this.errorMsgAdd = "Incorrect email or password or account does not exist."
          this.errorDisplayAdd = "error active";
          this.addWebsiteStatus = "Add website";
        } if (data.response === "exists") {
          this.errorMsgAdd = "The website you're trying to add already exists."
          this.errorDisplayAdd = "error active";
          this.addWebsiteStatus = "Add website";
        } if (data.response === "success") {
          this.errorMsgAdd = "Website successfully added."
          this.errorDisplayAdd = "success active";
          this.addWebsiteStatus = "Add website";
        } if (data.response === "error") {
          this.errorMsgAdd = "Something is wrong with the server. Try again later."
          this.errorDisplayAdd = "error active";
          this.addWebsiteStatus = "Add website";
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          this.errorMsgAdd = "Something is wrong on your side. Are you online? If you have an AdBlocker, try turning it off."
          this.errorDisplayAdd = "active";
        } else {
          this.errorMsgAdd = "Something is wrong with the server. Try again later, or we’ll automatically try to connect to the server again in 90 seconds."
          this.errorDisplayAdd = "active";
        }
      }
    )
  }
  
  backButton() {
    this.overviewDisplay = true;
    this.moreDisplay = false;
  }
  
}
