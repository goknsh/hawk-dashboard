import { ModuleWithProviders } from '@angular/core/src/metadata/ng_module';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { SponsorComponent } from './sponsor/sponsor.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { SignupComponent } from './signup/signup.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { TosComponent } from './tos/tos.component';
import { StatsComponent } from './stats/stats.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './_guards/index';


export const ROUTES: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'home', component: HomeComponent},
    {path: '404', component: NotfoundComponent},
    {path: 'sponsor', component: SponsorComponent},
    {path: 'privacy', component: PrivacyComponent},
    {path: 'login', redirectTo: 'login/new', pathMatch: 'full'},
    {path: 'login/:id', component: LoginComponent},
    {path: 'logout', component: LogoutComponent},
    {path: 'signup', component: SignupComponent},
    {path: 'stats', component: StatsComponent},
    {path: 'dashboard', redirectTo: 'dashboard/overview', pathMatch: 'full'},
    {path: 'dashboard/:id', component: DashboardComponent, canActivate: [AuthGuard]},
    {path: 'tos', component: TosComponent},
    {path: '**', component: NotfoundComponent}
];

export const ROUTING: ModuleWithProviders = RouterModule.forRoot(ROUTES);
