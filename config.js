// Firebase Configuration
// Replace these values with your actual Firebase project configuration
// To get your config, go to: Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
    apiKey: "AIzaSyBsds2IcVAhfpUMjT97ugPTqmAAKnakb8o",
    authDomain: "taskmanager-c551e.firebaseapp.com",
    projectId: "taskmanager-c551e",
    storageBucket: "taskmanager-c551e.firebasestorage.app",
    messagingSenderId: "292117813244",
    appId: "1:292117813244:web:27e35b9f7734a34bf74479",
    measurementId: "G-CB5GZK566C"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
