document.addEventListener("DOMContentLoaded", function () {
  const searchButton = document.getElementById("searchButton");
  const results = document.getElementById("results");
  const detailDiv = document.getElementById("datailCont");
  const details = document.getElementById("details");
  const input = document.getElementById("wordInput");
  const clearButton = document.getElementById("clearButton");
  var globalwordDet;

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

  async function fetchWords() {
    const word = document.getElementById("wordInput").value;
    if (word !== "") {
      const urldD = `https://api.datamuse.com/words?sp=${word}*&max=30`;
      try {
        const response = await fetch(urldD, { mode: "cors" });
        const words = await response.json();
        if (words && words.length > 0) {
          const h1 = document.createElement("h1");
          results.appendChild(h1);
          h1.textContent = "Terms Found:";
          h1.id = "res1";
          h1.classList.add("larger-text");
          const linkContainer = document.createElement("div");
          linkContainer.setAttribute("aria-label", "Terms Result List");
          for (let a = 0; a < words.length; a++) {
            const singleWord = words[a].word;
            const uppercaseWord =
              singleWord.charAt(0).toUpperCase() + singleWord.slice(1);
            const link = document.createElement("a");
            link.id = "li" + a + 1;
            link.textContent = uppercaseWord;
            link.href = "javascript:void(0)";
            link.addEventListener("click", function () {
              refreshDetails();
              displayWordDetails(singleWord);
            });

            if (a < words.length - 1) {
              linkContainer.appendChild(link);
              linkContainer.appendChild(document.createTextNode(" "));
            } else {
              linkContainer.appendChild(link);
            }

            if ((a + 1) % 10 === 0) {
              linkContainer.appendChild(document.createElement("br"));
            }
          }

          h1.appendChild(linkContainer);
        }
      } catch (error) {
        console.error(error);
        document.getElementById("resultsDiv").innerHTML =
          "Error in the API call.";
      }
    }
  }

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
    const wordDetails = await response.json();
    if (!wordDetails || wordDetails.results.length === 0) {
      details.hidden = true;
      const errorDiv = document.createElement("div");
      errorDiv.textContent = "No Details Found.";
      document.body.appendChild(errorDiv);
      return;
    }
    globalwordDet = wordDetails;
    details.hidden = false;
    const results = wordDetails.results;
    await clearResults(detailDiv);
    const writtenWord =
      singleWord.charAt(0).toUpperCase() + singleWord.slice(1);
    await templatePage(writtenWord, results);
  }

  function clearResults(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  async function templatePage(word, results) {
    const detailDiv = document.getElementById("datailCont");
    const detailsHdr = document.getElementById("detailsHdr");
    const pronouce = globalwordDet.pronunciation.all;
    detailsHdr.hidden = false;
    const h2Word = document.createElement("h2");
    const h2pronounce = document.createElement("h2");
    h2Word.id = "wrd";
    h2Word.textContent = "Word: " + word;
    h2Word.classList.add("larger-text");
    detailDiv.style.lineHeight = "0.001";
    detailDiv.appendChild(document.createElement("br"));
    detailDiv.appendChild(h2Word);
    h2pronounce.id = "prn";
    h2pronounce.textContent = "Pronunciation: " + pronouce;
    detailDiv.appendChild(h2pronounce);
    detailDiv.style.lineHeight = "0.001";
    detailDiv.appendChild(document.createElement("br"));

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
  }

  function checkPartOfSpeech(PartOfSpeech, results) {
    for (const result of results) {
      if (result.partOfSpeech === PartOfSpeech) {
        return true;
      }
    }
    return false;
  }

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

  function generateDetails(results, partOfSpe) {
    var id = "def" + partOfSpe;
    const childId = createSection("Definitions:", id);
    const defDiv = document.getElementById(id);
    var i = 0;
    const defContainer = document.createElement("div");
    defContainer.setAttribute("aria-label", "Definitions Result List");
    for (const resultn of results) {
      const partOfSpeech = resultn.partOfSpeech;
      if (partOfSpeech == partOfSpe && i < 3) {
        const definition = resultn.definition;
        const definitionLink = document.createElement("a");
        definitionLink.href = "javascript:void(0)"; // Add a link with no action
        definitionLink.textContent = capitalizeFirstLetter(definition);

        // Add CSS to control line spacing for definitions
        definitionLink.style.margin = "0"; // Remove margin
        definitionLink.style.padding = "0"; // Remove padding
        definitionLink.style.lineHeight = "1.2"; // Adjust line height as needed

        definitionLink.style.textDecoration = "none"; // Remove underline
        definitionLink.style.color = "inherit"; // Use the default text color
        definitionLink.style.cursor = "default"; // Change cursor to default
        // Prevent the link from navigating when clicked
        definitionLink.onclick = function () {
          return false;
        };

        defContainer.appendChild(definitionLink);
        defContainer.appendChild(document.createElement("br"));

        /*         defDiv.appendChild(definitionLink);
        defDiv.appendChild(document.createElement("br")); */
        i++;
      }
    }
    if (defContainer.hasChildNodes()) {
      defDiv.appendChild(defContainer);
    }
    const exContainer = document.createElement("div");
    exContainer.setAttribute("aria-label", "Examples Result List");
    var id2 = "ex" + partOfSpe;
    createSection("Examples:", id2); // Create the Examples section
    const exDiv = document.getElementById(id2);
    var j = 0;
    let foundExample = false; // Flag to track if any examples are found

    for (const resultn of results) {
      const partOfSpeech = resultn.partOfSpeech;
      if (partOfSpeech == partOfSpe && j < 1) {
        const examples = resultn.examples;
        if (examples && examples.length > 0) {
          for (const example of examples) {
            const exampleLink = document.createElement("a");
            exampleLink.href = "javascript:void(0)"; // Add a link with no action
            exampleLink.textContent = capitalizeFirstLetter(example);

            // Add CSS to control line spacing for examples
            exampleLink.style.margin = "0"; // Remove margin
            exampleLink.style.padding = "0"; // Remove padding
            exampleLink.style.lineHeight = "1.2"; // Adjust line height as needed
            exampleLink.style.textDecoration = "none"; // Remove underline
            exampleLink.style.color = "inherit"; // Use the default text color
            exampleLink.style.cursor = "default"; // Change cursor to default
            // Prevent the link from navigating when clicked
            exampleLink.onclick = function () {
              return false;
            };

            exContainer.appendChild(exampleLink);
            exContainer.appendChild(document.createElement("br"));

            /*             exDiv.appendChild(exampleLink);
            exDiv.appendChild(document.createElement("br")); */
          }
          foundExample = true; // Set the flag to true if examples are found
          j++;
        }
      }
    }
    if (exContainer.hasChildNodes()) {
      exDiv.appendChild(exContainer);
    }

    var id3 = "syn" + partOfSpe;
    createSection("Synonyms:", id3);
    const synDiv = document.getElementById(id3);
    var k = 0;
    let foundSynonym = false; // Flag to track if any synonyms are found
    const synonymsArray = []; // Array to store synonyms
    const synonymsContainer = document.createElement("div");
    synonymsContainer.setAttribute("aria-label", "Synonyms Result List");
    for (const resultn of results) {
      const partOfSpeech = resultn.partOfSpeech;
      if (partOfSpeech == partOfSpe && k < 4) {
        const synonyms = resultn.synonyms;
        if (synonyms && synonyms.length > 0) {
          synonymsArray.push(...synonyms.slice(0, 4)); // Add up to 4 synonyms to the array
          foundSynonym = true; // Set the flag to true if synonyms are found
          k++;
        }
      }
    }

    if (synonymsArray.length > 0) {
      const synonymsText = synonymsArray
        .slice(0, 5)
        .map(capitalizeFirstLetter)
        .join(", ");
      const synonymLink = document.createElement("a");
      synonymLink.href = "javascript:void(0)"; // Add a link with no action
      synonymLink.textContent = synonymsText;

      synonymLink.style.margin = "0";
      synonymLink.style.padding = "0";
      synonymLink.style.lineHeight = "1.2";
      synonymLink.style.textDecoration = "none"; // Remove underline
      synonymLink.style.color = "inherit"; // Use the default text color
      synonymLink.style.cursor = "default"; // Change cursor to default
      // Prevent the link from navigating when clicked
      synonymLink.onclick = function () {
        return false;
      };
      synonymsContainer.appendChild(synonymLink);
      synonymsContainer.appendChild(document.createElement("br"));

      /*       synDiv.appendChild(synonymLink);
      synDiv.appendChild(document.createElement("br")); */
    }
    synonymsContainer.appendChild(document.createElement("br"));
    if (synonymsContainer.hasChildNodes()) {
      synDiv.appendChild(synonymsContainer);
    }

    if (foundExample === false) {
      exDiv.hidden = true;
    }
  }

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
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
});
