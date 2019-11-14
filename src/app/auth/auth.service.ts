import { Subject } from 'rxjs/Subject';

import { User } from './user.model';
import { AuthData } from './auth-data.model';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { TrainingService } from '../training/training.service';
import { MatSnackBar } from '@angular/material';
import { UiService } from '../shared/ui.service';
import { Store } from '@ngrx/store';
import * as fromApp from '../app.reducer';


@Injectable()
export class AuthService {
  private user: User
  authChange = new Subject<boolean>();
  private isAuthenticated = false;


  constructor(private router: Router, private afauth: AngularFireAuth,
    private trainingService: TrainingService, private snackbar: MatSnackBar,
    private uiService: UiService, private store: Store<{ ui: fromApp.State }>) {

  }

  initAuthListener() {
    this.afauth.authState.subscribe(
      user => {
        if (user) {
          this.isAuthenticated = true;
          this.authChange.next(true);
          this.router.navigate(['/training']);

        } else {
          this.trainingService.cancelSubscription();
          this.authChange.next(false);
          this.router.navigate(['/login']);
          this.isAuthenticated = false;
        }
      }
    )             //authState is an object : 1. an observable to which u can subscribe
    //  2. it emits an event whenever the authentication status changes
  }


  registerUser(authData: AuthData) {

    // code previous to angularfire
    // this.user = {
    //   email: authData.email,
    //   userId: Math.round(Math.random() * 10000).toString()
    // };


    // this.uiService.loadingStateChanged.next(true);
    this.store.dispatch({ type: 'START_LOADING' });
    this.afauth.auth.createUserWithEmailAndPassword(authData.email, authData.password).then(
      result => {
        console.log(result);
        // this.uiService.loadingStateChanged.next(false);
        this.store.dispatch({ type: 'STOP_LOADING' });

      }).catch(error => {
        // this.uiService.loadingStateChanged.next(false);
        this.store.dispatch({ type: 'STOP_LOADING' });
        this.uiService.showSnackbar(error, null, 3000);
      })


  }

  login(authData: AuthData) {

    // code previous to angularfireauth
    // this.user = {
    //   email: authData.email,
    //   userId: Math.round(Math.random() * 10000).toString()
    // };

    // this.uiService.loadingStateChanged.next(true);
    this.store.dispatch({ type: 'START_LOADING' });
    this.afauth.auth.signInWithEmailAndPassword(authData.email, authData.password)
      .then(
        result => {
          console.log(result);
          // this.uiService.loadingStateChanged.next(false);
          this.store.dispatch({ type: 'STOP_LOADING' });
        }
      ).catch(
        error => {
          // this.uiService.loadingStateChanged.next(false);
          this.store.dispatch({ type: 'STOP_LOADING' });
          this.uiService.showSnackbar(error, null, 3000);
        }
      )

    this.authSuccessfully();
  }

  logout() {
    // this.user = null;

    this.afauth.auth.signOut();

    // this.trainingService.cancelSubscription();
    // this.authChange.next(false);
    // this.router.navigate(['/login']);
    // this.isAuthenticated = false;
  }

  getUser() {
    return { ...this.user };
  }

  // linked to the authguard
  isAuth() {
    // return this.user != null;
    return this.isAuthenticated;
  }

  authSuccessfully() {

    // this.isAuthenticated = true;
    // this.authChange.next(true);
    // this.router.navigate(['/training']);

  }

}