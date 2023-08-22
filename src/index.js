import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import { onSnapshot } from "@firebase/firestore";
import * as d3 from "d3";
import { legendColor } from 'd3-svg-legend'


// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDMw--Z3Zl-e-y1TUnXMmghE5Dd7Gl5ChE",
  authDomain: "udemy-d3-firebase-23286.firebaseapp.com",
  projectId: "udemy-d3-firebase-23286",
  storageBucket: "udemy-d3-firebase-23286.appspot.com",
  messagingSenderId: "124615150939",
  appId: "1:124615150939:web:2408f5cbfdc3b3b9a1de7e",
  measurementId: "G-F3K0M89R9G"
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

    const item = {
      distance, 
      activity,
      date: new Date().toString()
    }

    addDoc(colRef, item)
      .then(() => {
        error.textContent = '';
        input.value = '';
      })
      .catch(err => console.log(err));
  } else {
    error.textContent = 'Please enter a valid distance'
  }

});

const margin = { top: 20, right: 20, bottom: 50, left: 100 };
const graphWidth = 560 - margin.right - margin.left;
const graphHeight = 360 - margin.top - margin.bottom;


const svg = d3.select('.canvas')
  .append('svg')
  .attr('width', graphWidth + margin.left + margin.right)
  .attr('height', graphHeight + margin.top + margin.bottom);

const graph = svg.append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

// scales
const x = d3.scaleTime().range([0, graphWidth]);
const y = d3.scaleLinear().range([graphHeight, 0]);

// axes groups
const xAxisGroup = graph.append('g')
  .attr('class', 'x-axis')
  .attr('transform', "translate(0," + graphHeight + ")");

const yAxisGroup = graph.append('g')
  .attr('class', 'y-axis');

// update function
const update = (data) => {

  // set scale domains
  x.domain(d3.extent(data, d => new Date(d.date)));
  y.domain([0, d3.max(data, d =>  d.distance)]);

  //console.log(x(new Date(data[0].date)))

  // create axes
  const xAxis = d3.axisBottom(x)
    .ticks(4)
    .tickFormat(d3.timeFormat("%b %d"));
    
  const yAxis = d3.axisLeft(y)
    .ticks(4)
    .tickFormat(d => d + 'm');

  // call axes
  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);

  // rotate axis text
  xAxisGroup.selectAll('text')
    .attr('transform', 'rotate(-40)')
    .attr('text-anchor', 'end');

};



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

  update(data)
});