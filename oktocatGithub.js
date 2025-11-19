// script.js
console.log("Ciao dal terminale!");

// Esempio con fetch (nativo in Deno)
const response = await fetch('https://api.github.com/users/octocat');
const data = await response.json();
console.log(data.name);