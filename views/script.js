document.addEventListener("DOMContentLoaded", function () {

  const currentURL = new URL(window.location.href);

 /* Gestione inserimento valore parametri URL nei CSS */
  const bgColor = currentURL.searchParams.get('bgColor') || "light grey"; // Default to light grey;
  const textColor = currentURL.searchParams.get('textColor') || "black"; // Default to dark grey;
  const textFont = currentURL.searchParams.get('textFont') || "Arial"; // Default to Arial;
  const textSize = currentURL.searchParams.get('textSize') || "100%"; // Default to normal size (100%)
  ;
  if (bgColor && textColor && textFont && textSize) {
    document.documentElement.style.setProperty("--background-color", bgColor);
    document.documentElement.style.setProperty("--text-color", textColor);
    document.documentElement.style.setProperty("--text-font", textFont);
    document.documentElement.style.setProperty("--textSize", textSize);
  }

  /* Elementi a schermo di default */

  const searchButton = document.getElementById("searchButton");
  const results = document.getElementById("results");
  const detailDiv = document.getElementById("datailCont");
  const details = document.getElementById("details");
  const input = document.getElementById("wordInput");
  const clearButton = document.getElementById("clearButton");
  var globalwordDet;

  /* Eventi legati a elementi a schermo  */

  searchButton.addEventListener("click", async function (event) {
    event.preventDefault();
    await clearResults(results);
    await refreshDetails();
    await fetchWords();
    const link = document.getElementById("li01");
    if (link) {
      link.focus();
    }
  });

  clearButton.addEventListener("click", async function (event) {
    event.preventDefault();
    await clearResults(results);
    await refreshDetails();
    input.value = "";
    input.focus();
  });

  input.addEventListener("keydown", async function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      await clearResults(results);
      await refreshDetails();
      await fetchWords();
      const link = document.getElementById("li01");
      if (link) {
        link.focus();
      }
    }
  });

  /* Fetch Words - legge da API datamuse tutte le parole che rientrano nella stringa inserita nella searchbar
  e le visualizza a schermo come dei link cliccabili.
  */

  async function fetchWords() {
    const word = document.getElementById("wordInput").value;
    if (word !== "") {
      const urldD = `https://api.datamuse.com/words?sp=${word}*&max=30`;
      try {
        const response = await fetch(urldD, { mode: "cors" }); 
        const words = await response.json(); /* Catturo l'array di parole trovato */
        if (words && words.length > 0) {
          const h1 = document.createElement("h1");
          results.appendChild(h1);
          h1.textContent = "Terms Found:"; /* Creo header */
          h1.id = "res1";
          h1.classList.add("larger-text");
          /* Creo un container per i link con area label terms result list (per screen reader) */
          const linkContainer = document.createElement("div");
          linkContainer.setAttribute("aria-label", "Terms Result List");
          for (let a = 0; a < words.length; a++) {
            const singleWord = words[a].word;
           /* Parola da mostrare a schermo con prima lettera maiuscola */
            const uppercaseWord =
              singleWord.charAt(0).toUpperCase() + singleWord.slice(1);
            /* Con parola trovata creo un link che al click mostra il dettaglio di quel termine in basso nello schermo */
            const link = document.createElement("a");
            link.id = "li" + a + 1;
            link.textContent = uppercaseWord;
            link.href = "javascript:void(0)";
            link.addEventListener("click", function () {
              refreshDetails();
              displayWordDetails(singleWord);
            });
            /* Inserisci uno spazio dopo ogni parola tranne l'ultima */
            if (a < words.length - 1) {
              linkContainer.appendChild(link);
              linkContainer.appendChild(document.createTextNode(" "));
            } else {
              linkContainer.appendChild(link);
            }
            /* Vai a capo ogni 10 termini (per leggibilità anche per vedenti) */
            if ((a + 1) % 10 === 0) {
              linkContainer.appendChild(document.createElement("br"));
            }
          
          }

          h1.appendChild(linkContainer);
          refreshCss();
        }
      } catch (error) {
        console.error(error);
        document.getElementById("resultsDiv").innerHTML =
          "Error in the API call.";
      }
    }
  }

/*   async function checkWordDefinition(singleWord){
    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": "07e0782a67mshe6931296b9986dap118445jsn9b7a1fbadec6",
        "X-RapidAPI-Host": "wordsapiv1.p.rapidapi.com"
      }
    };
    const url = `https://wordsapiv1.p.rapidapi.com/words/${singleWord}`;
    const response = await fetch(url, options);
    
    if (response.status === 404) {
      // Handle the 404 error here
      return false;
    }
    
    const wordDetails = await response.json();
    
    if (!wordDetails || wordDetails.results.length === 0 || wordDetails.success === false) {
      return false;
    }
    
    return true;
  } */

/* displayWordDetails - per la parola passata dal link cliccato effettua una chiamata a wordsAPI che  restituisce il dettaglio di quel termine
contenente Parola, Pronuncia ( Scritta fonetica e verbale, descrizione, Esempi di utilizzo, sinonimi effettuando una classificazione per
  parte del discorso nome,verbo,aggettivo ecc..) */
  async function displayWordDetails(singleWord) {
    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": "07e0782a67mshe6931296b9986dap118445jsn9b7a1fbadec6",
        "X-RapidAPI-Host": "wordsapiv1.p.rapidapi.com"
      }
    };
    const url = `https://wordsapiv1.p.rapidapi.com/words/${singleWord}`; 
    const response = await fetch(url, options);
    const wordDetails = await response.json(); /* Legge record estratti da API wordsapi */
    if (!wordDetails || wordDetails.results.length === 0) { /* Non trovo nulla - non mostro nulla */
      details.hidden = true;
      const errorDiv = document.createElement("div");
      errorDiv.textContent = "No Details Found.";
      document.body.appendChild(errorDiv);
      return;
    }
    globalwordDet = wordDetails;
    details.hidden = false;
    const results = wordDetails.results;
    await clearResults(detailDiv);  /* Elimina tutti i valori presenti nei nodi figli del contenitore dei dettagli */
    const writtenWord =
      singleWord.charAt(0).toUpperCase() + singleWord.slice(1); /* passo alla pagina template la parola con la prima lettera maiuscola */
    await templatePage(writtenWord, results); /* Funzione generazione dinamica pagina risultati */
  }

  function clearResults(node) { /* Elimina tutti i valori presenti nei nodi figli del contenitore dei dettagli */
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  /* funzione  templatePage -  dalla parola e i risultati come dettaglio della parola genera la pagina in formato accessibile */
  async function templatePage(word, results) {
    const detailDiv = document.getElementById("datailCont");
    const detailsHdr = document.getElementById("detailsHdr");
    const pronouce = globalwordDet.pronunciation.all;
    detailsHdr.hidden = false;     /* Mostro  header  dettagli legato a index.ejs*/
    const h2Word = document.createElement("h2");
    const h2pronounce = document.createElement("h2");
    h2Word.id = "wrd";
    h2Word.textContent = "Word: " + word;  /* Mostro sotto la parola  */
    h2Word.classList.add("larger-text");
    detailDiv.style.lineHeight = "0.001";
    detailDiv.appendChild(document.createElement("br")); /* Aggiungo una riga vuota */
    detailDiv.appendChild(h2Word);
    h2pronounce.id = "prn";
    h2pronounce.textContent = "Pronunciation: " + pronouce; /* Mostro la pronuncia  */
    detailDiv.appendChild(h2pronounce);
    detailDiv.style.lineHeight = "0.001";
    detailDiv.appendChild(document.createElement("br"));  /* Aggiungo una riga vuota */

    const playPronounceButton = document.createElement("button"); /* Creo un pulsante */
    playPronounceButton.innerHTML = "<span>&#x1F50A;</span> Play Pronounce";  /* Aggiungo una scritta e un icona con simbolo suono   */
    /* Css per aspetto pulsante */
    playPronounceButton.id = "playPronounceButton";
    playPronounceButton.style.fontSize = "16px";
    playPronounceButton.style.padding = "10px 20px";
    playPronounceButton.style.backgroundColor = "#28a745";
    playPronounceButton.style.color = "#fff";
    playPronounceButton.style.border = "none";
    playPronounceButton.style.borderRadius = "5px";
    playPronounceButton.style.cursor = "pointer";
    playPronounceButton.style.marginTop = "10px"; 

     /* Hover CSS per pulsante */
    playPronounceButton.addEventListener("mouseenter", function () {
      playPronounceButton.style.backgroundColor = "#218838"; 
    });

    playPronounceButton.addEventListener("mouseleave", function () {
      playPronounceButton.style.backgroundColor = "#28a745"; 
    });
    playPronounceButton.style.marginTop = "10px"; 

    /* Leggo parola con API responsivevoice usando un text-to-speech e riproduco audio, l'audio è riprodotto premendo il pulsante*/
    playPronounceButton.addEventListener("click", async function () {
      responsiveVoice.speak(word);
    });

    /* aggiungo il pulsante a schermo */
    detailDiv.appendChild(playPronounceButton);

    /* Per ogni categoria Nome,verbo,pronome,avverbio,aggettivo  mostro i dettagli del termine e gli esempi */
    const flagNoun = await checkPartOfSpeech("noun", results);
    if (flagNoun) {
      createSection("Noun", "noun");
      generateDetails(results, "noun");
    }

    const flagVerb = await checkPartOfSpeech("verb", results);
    if (flagVerb) {
      createSection("Verb", "verb");
      generateDetails(results, "verb");
    }

    const flagPronoun = await checkPartOfSpeech("pronoun", results);
    if (flagPronoun) {
      createSection("Pronoun", "pronoun");
      generateDetails(results, "pronoun");
    }

    const flagAdverb = await checkPartOfSpeech("adverb", results);
    if (flagAdverb) {
      createSection("Adverb", "adverb");
      generateDetails(results, "adverb");
    }
    const flagAdj = await checkPartOfSpeech("adjective", results);
    if (flagAdj) {
      createSection("Adjective", "adjective");
      generateDetails(results, "adjective");
    }
    /* Se ho una parte del discorsa diversa dalle precedenti mostro quella a cui appartiene la parola inserendola dinamicamente */
    var otherPartOfSpeech = await getOtherPartofSpeech(results);
    if (otherPartOfSpeech) {
      var otherPartOfSpeech =
        otherPartOfSpeech.charAt(0).toUpperCase() + otherPartOfSpeech.slice(1);
      createSection(otherPartOfSpeech, "other");
      generateDetails(results, "other");
    }

    const backButton = document.createElement("button");
    backButton.textContent = "New Search";
    backButton.id = "backButtoon";
    backButton.style.fontSize = "16px";
    backButton.style.padding = "10px 20px";
    backButton.style.backgroundColor = "#007BFF";
    backButton.style.color = "#fff";
    backButton.style.border = "none";
    backButton.style.borderRadius = "5px";
    backButton.style.cursor = "pointer";
    backButton.style.marginTop = "20px"; // Add more space on top
    backButton.style.marginLeft = "0px"; // Align more to the left
    backButton.addEventListener("mouseenter", function () {
      backButton.style.backgroundColor = "#0056b3";
    });

    backButton.addEventListener("mouseleave", function () {
      backButton.style.backgroundColor = "#007BFF";
    });
    backButton.addEventListener("click", async function (event) {
      event.preventDefault();
      await clearResults(results);
      await refreshDetails();
      input.value = "";
      input.focus();
    });
    detailDiv.style.lineHeight = "0.001";
    detailDiv.appendChild(document.createElement("br"));
    detailDiv.appendChild(backButton);
    h2Word.focus();
    refreshCss();
  }

  function checkPartOfSpeech(PartOfSpeech, results) {
    for (const result of results) {
      if (result.partOfSpeech === PartOfSpeech) {
        return true;
      }
    }
    return false;
  }

  /* Creo intestazione con titolo intestazione e id intestazione  */
  function createSection(sectionTitle, chidId) {
    const detailDiv = document.getElementById("datailCont");
    const hSection = document.createElement("h2");
    hSection.textContent = sectionTitle;
    hSection.style.fontSize = "1.2em";
    hSection.style.fontWeight = "bold";
    detailDiv.appendChild(hSection);
    detailDiv.style.lineHeight = "0.001";
    detailDiv.appendChild(document.createElement("br"));
    const sectionDiv = document.createElement("div");
    sectionDiv.id = chidId;
    detailDiv.appendChild(sectionDiv);
  }

  /* function createSection2(sectionTitle,textvalue, id) {
    const detailDiv = document.getElementById(id);
    const hSection = document.createElement("h3");
    hSection.textContent = "Part of speech: " + sectionTitle;
    hSection.style.fontSize = "1.2em";
    hSection.style.fontWeight = "bold";
    detailDiv.appendChild(hSection);

    // Create a paragraph to display the text value
    const paragraph = document.createElement("p");
    paragraph.textContent = textvalue; // Set the text content here
    detailDiv.appendChild(paragraph);
  } */

  function getOtherPartofSpeech(results) {
    for (const result of results) {
      var partOfSpeech = result.partOfSpeech;
      if (
        partOfSpeech !== "noun" &&
        partOfSpeech !== "verb" &&
        partOfSpeech !== "adverb" &&
        partOfSpeech !== "adjective" &&
        partOfSpeech !== "pronoun"
      ) {
        return partOfSpeech;
      }
    }
    return false;
  }

  /* generateDetails - genera il dettaglio dei termini a schermo inserendo tutti i componenti html dinamicamente con i valori trovati in results classificando per 
  parte del discorso inserita in funzione templatePage  */
  function generateDetails(results, partOfSpe) {

/* Dettaglio definizioni  */
    var id = "def" + partOfSpe;
    const childId = createSection("Definitions:", id);
    const defDiv = document.getElementById(id);
    var i = 0;
    const defContainer = document.createElement("div");
    defContainer.setAttribute("aria-label", "Definitions Result List"); /* container definizioni con aria label per screen reader */
    for (const resultn of results) {
      const partOfSpeech = resultn.partOfSpeech;
      if (partOfSpeech == partOfSpe && i < 3) { /* Genero fino a 3 definizioni per ogni parte del discorso  */
        const definition = resultn.definition;
        const definitionLink = document.createElement("a"); /* inserimento come link accssibie  */
        definitionLink.href = "javascript:void(0)"; 
        definitionLink.textContent = capitalizeFirstLetter(definition);
       /* Css definizioni */
  
        definitionLink.style.margin = "0"; 
        definitionLink.style.padding = "0"; 
        definitionLink.style.lineHeight = "1.2"; 

        definitionLink.style.textDecoration = "none"; 
        definitionLink.style.color = "inherit"; 
        definitionLink.style.cursor = "default"; 

        definitionLink.onclick = function () {
          return false;
        };

        defContainer.appendChild(definitionLink);
        defContainer.appendChild(document.createElement("br"));

        i++;
      }
    }
    if (defContainer.hasChildNodes()) {
      defDiv.appendChild(defContainer);  /* aggiungo il container popolato di definizioni come figlio del foglio index.ejs */
    }

    /* Dettaglio esempi  */
    const exContainer = document.createElement("div");
    exContainer.setAttribute("aria-label", "Examples Result List"); /* container esempi con aria label per screen reader */
    var id2 = "ex" + partOfSpe;
    createSection("Examples:", id2); 
    const exDiv = document.getElementById(id2);
    var j = 0;
    let foundExample = false; 

    for (const resultn of results) {
      const partOfSpeech = resultn.partOfSpeech;
      if (partOfSpeech == partOfSpe && j < 1) { /* Genero fino a 1 esempio per ogni parte del discorso  */
        const examples = resultn.examples;
        if (examples && examples.length > 0) {
          for (const example of examples) {
            const exampleLink = document.createElement("a");
            exampleLink.href = "javascript:void(0)"; 
            exampleLink.textContent = capitalizeFirstLetter(example);
            /* Css esempi */
          
            exampleLink.style.margin = "0"; 
            exampleLink.style.padding = "0"; 
            exampleLink.style.lineHeight = "1.2"; 
            exampleLink.style.textDecoration = "none"; 
            exampleLink.style.color = "inherit"; 
            exampleLink.style.cursor = "default"; 
   
            exampleLink.onclick = function () {
              return false;
            };

            exContainer.appendChild(exampleLink);
            exContainer.appendChild(document.createElement("br"));

         
          }
          foundExample = true; 
          j++;
        }
      }
    }
    if (exContainer.hasChildNodes()) {
      exDiv.appendChild(exContainer); /* aggiungo il container esempi popolato alla pagina index.ejs dopo definizioni */
    }

    /* Dettaglio sinonimi  */
    var id3 = "syn" + partOfSpe;
    createSection("Synonyms:", id3);
    const synDiv = document.getElementById(id3);
    var k = 0;
    let foundSynonym = false; 
    const synonymsArray = []; 
    const synonymsContainer = document.createElement("div");
    synonymsContainer.setAttribute("aria-label", "Synonyms Result List"); /* container sinonimi con aria label per screen reader */
    for (const resultn of results) {
      const partOfSpeech = resultn.partOfSpeech;
      if (partOfSpeech == partOfSpe && k < 4) { /* Genero fino a 4 sinonimi per ogni parte del discorso  */
        const synonyms = resultn.synonyms;
        if (synonyms && synonyms.length > 0) {
          synonymsArray.push(...synonyms.slice(0, 4)); 
          foundSynonym = true; 
          k++;
        }
      }
    }

    if (synonymsArray.length > 0) { /* rendo prima lettera maiscola e aggiungo virgola mostrando fino a 5 sinonimi */
      const synonymsText = synonymsArray
        .slice(0, 5)
        .map(capitalizeFirstLetter)
        .join(", ");
      const synonymLink = document.createElement("a");
      synonymLink.href = "javascript:void(0)"; 
      synonymLink.textContent = synonymsText;
      /* Css sinonimi */
      synonymLink.style.margin = "0";
      synonymLink.style.padding = "0";
      synonymLink.style.lineHeight = "1.2";
      synonymLink.style.textDecoration = "none"; 
      synonymLink.style.color = "inherit";
      synonymLink.style.cursor = "default"; 

      synonymLink.onclick = function () { 
        return false;
      };
      synonymsContainer.appendChild(synonymLink); /* aggiungo il container definizioni popolato alla pagina index.ejs dopo definizioni */
      synonymsContainer.appendChild(document.createElement("br")); 


    }
    synonymsContainer.appendChild(document.createElement("br"));
    if (synonymsContainer.hasChildNodes()) {
      synDiv.appendChild(synonymsContainer);
    }

    if (foundExample === false) {
      exDiv.hidden = true;
    }
  }

  /* refreshDetails -  elimina tutti i valori presenti nei nodi figli del contenitore dei dettagli */
  async function refreshDetails() {
    await clearResults(details);
    const h1 = document.createElement("h1");
    h1.id = "detailsHdr";
    h1.textContent = "Terms Details:";
    h1.hidden = true;
    h1.style.marginTop = "2px";
    const div = document.createElement("div");
    div.id = "datailCont";
    div.appendChild(h1);
    details.appendChild(document.createElement("br"));
    details.appendChild(div);
    details.appendChild(document.createElement("br"));
  }

  /* capitalizeFirstLetter - rende la prima lettera di una parola maiuscola */
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

   /* refresh css - refresa il CSS con i valori default  utente  / quelli parametrizzati nelle impotazioni */
  function refreshCss(){

    const currentURL = window.location.href;
    const url = new URL(currentURL);
    const bgColor = url.searchParams.get('bgColor');
    const textColor = url.searchParams.get('textColor');
    const textFont = url.searchParams.get('textFont');
    const textSize = url.searchParams.get('textSize');
    if (bgColor && textColor && textFont && textSize) {
      const allElements = document.querySelectorAll('*');
      allElements.forEach((element) => {
        element.style.backgroundColor = bgColor;
        element.style.color = textColor;
        element.style.fontFamily = textFont;
        element.style.fontSize = textSize;
    });
      }
  }

});
