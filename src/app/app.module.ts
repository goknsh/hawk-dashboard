import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { ClarityModule } from '@clr/angular';
import { ROUTING } from "./app.routing";
import { AuthGuard } from './_guards/index';
import { AppComponent } from './app.component';
import { HomeComponent } from "./home/home.component";
import { SponsorComponent } from './sponsor/sponsor.component';
import { TosComponent } from './tos/tos.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LogoutComponent } from './logout/logout.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { StatsComponent } from './stats/stats.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        SponsorComponent,
        TosComponent,
        PrivacyComponent,
        LoginComponent,
        SignupComponent,
        DashboardComponent,
        LogoutComponent,
        NotfoundComponent,
        StatsComponent
    ],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        ClarityModule,
        ROUTING
    ],
    providers: [
        AuthGuard,
        Title
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
