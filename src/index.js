import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import { onSnapshot } from "@firebase/firestore";
import * as d3 from "d3";
import { legendColor } from 'd3-svg-legend'


// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBd3qu-NGBxA0qnQhVC2bs0rjmdP7sYi1w",
  authDomain: "udemy-practice-e0102.firebaseapp.com",
  projectId: "udemy-practice-e0102",
  storageBucket: "udemy-practice-e0102.appspot.com",
  messagingSenderId: "145692816151",
  appId: "1:145692816151:web:e75328324d02dd9a21fd52",
  measurementId: "G-7M6DXMV50F"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const colRef = collection(db, 'activities');


// DOM elements
const btns = document.querySelectorAll('button');
const form = document.querySelector('form');
const formAct = document.querySelector('form span');
const input = document.querySelector('input');
const error = document.querySelector('.error');

let activity = 'cycling';

btns.forEach(btn => {
  btn.addEventListener('click', e => {
    // get selected activity
    activity = e.target.dataset.activity;

    // remove and add active class
    btns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    // set id of input field
    input.setAttribute('id', activity);

    // set text of form span (the activity)
    formAct.textContent = activity;
  });
});

// form submit
form.addEventListener('submit', e => {
  // prevent default action
  e.preventDefault()

  const distance = parseInt(input.value);
  if(distance){
    db.collection('activities').add({
      distance, 
      activity,
      date: new Date().toString()
    }).then(() => {
      error.textContent = '';
      input.value = '';
    }).catch(err => console.log(err));
  } else {
    error.textContent = 'Please enter a valid distance'
  }

});

// data array and firestore
let data = [];

const unsub = onSnapshot(colRef, (snapshot)  => {

  snapshot.docChanges().forEach(change => {

    const doc = {...change.doc.data(), id: change.doc.id};

    switch (change.type) {
      case 'added':
        data.push(doc);
        break;
      case 'modified':
        const index = data.findIndex(item => item.id == doc.id);
        data[index] = doc;
        break;
      case 'removed':
        data = data.filter(item => item.id !== doc.id);
        break;
      default:
        break;
    }

  })
});