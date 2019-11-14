import { Injectable } from '@angular/core';
import { Exercise } from './exercise.model';
import { Subject } from 'rxjs/Subject'
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';
import { UiService } from '../shared/ui.service';

@Injectable()
export class TrainingService {

  //properties
  exercisesChanged = new Subject<Exercise[]>();
  exerciseChanged = new Subject<Exercise>(); //who ever is listening,knows which exercise is chosen.
  finishedExercisesChanged = new Subject<Exercise[]>();
  availableExercises: Exercise[] = [];
  private runningExercise: Exercise;

  private fbSubs: Subscription[] = [];

  constructor(private db: AngularFirestore, private uiService: UiService) {

  }



  //helper method 
  fetchAvailableExercises() {
    // return this.availableExercises.slice();  //create a copy array.
    //so now this array can be edited without effecting the old array.

    this.uiService.loadingStateChanged.next(true);
    this.fbSubs.push(this.db.collection('availableExercises').snapshotChanges().pipe(map(docArray => {
      // throw (new Error());

      return docArray.map(doc => {

        return {
          id: doc.payload.doc.id,
          name: doc.payload.doc.data()['name'],
          duration: doc.payload.doc.data()['duration'],
          calories: doc.payload.doc.data()['calories'],
        }
      })
    })).subscribe(
      (exercises: Exercise[]) => {
        this.availableExercises = exercises;
        this.exercisesChanged.next([...this.availableExercises]);
        this.uiService.loadingStateChanged.next(false);
      }, error => {
        this.uiService.loadingStateChanged.next(false);
        this.uiService.showSnackbar('fetching exercises failed , please try again later', null, 3000);
        this.exerciseChanged.next(null);

      }
    )
    )

  }


  //method to start an exercise
  startExercise(selectedId: string) {
    this.db.doc('availableExercises/' + selectedId).update({ Lastselected: new Date() })
    this.runningExercise = this.availableExercises.find(ex => ex.id === selectedId); //ex is each element of availableExercises array
    this.exerciseChanged.next({ ...this.runningExercise });
  }

  //method to complete an exercise
  completeExercise() {

    this.addDataToDatabase({ ...this.runningExercise, date: new Date(), state: 'completed' });  //spread operator copies all the properties of the running exercise.
    this.runningExercise = null;
    this.exerciseChanged.next(null);

  }


  //method to stop an exercise
  cancelExercise(progress: number) {

    this.addDataToDatabase({

      ...this.runningExercise,
      duration: this.runningExercise.duration * (progress / 100),
      calories: this.runningExercise.calories * (progress / 100),
      date: new Date(),
      state: 'cancelled'

    });  //spread operator copies all the properties of the running exercise.
    this.runningExercise = null;
    this.exerciseChanged.next(null);

  }


  getRunningExercise() {
    return { ...this.runningExercise };
  }

  fetchCompletedorCancelledExercises() {

    this.fbSubs.push(this.db.collection('finishedExercises').valueChanges().subscribe(
      (exercises: Exercise[]) => {

        this.finishedExercisesChanged.next(exercises);
      }
    )
    )
  }

  cancelSubscription() {
    this.fbSubs.forEach(sub => sub.unsubscribe());
  }

  //saving data to database
  private addDataToDatabase(exercise: Exercise) {
    this.db.collection('finishedExercises').add(exercise);
  }

}