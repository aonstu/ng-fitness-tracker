import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { UiService } from 'src/app/shared/ui.service';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import * as fromApp from 'src/app/app.reducer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  isLoading$: Observable<boolean>;
  private loadingSubs: Subscription;

  constructor(private authService: AuthService, private uiService: UiService,
    private store: Store<{ ui: fromApp.State }>) { }



  ngOnInit() {

    this.isLoading$ = this.store.pipe(map(state => state.ui.isLoading));

    // this.loadingSubs = this.uiService.loadingStateChanged.subscribe(isLoading => {
    //   this.isLoading = isLoading;
    // })
    this.loginForm = new FormGroup({
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'password': new FormControl(null, [Validators.required, Validators.minLength(6)])
    });


  }

  onSubmit() {
    console.log(this.loginForm.get('email').value);

    this.authService.login({
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    })

  }

  // ngOnDestroy() {

  //   if (this.loadingSubs) {
  //     this.loadingSubs.unsubscribe();  //unsubscribe prevents memory leaks
  //   }

  // }

}
