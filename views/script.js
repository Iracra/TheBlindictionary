document.addEventListener("DOMContentLoaded", function () {
  const searchButton = document.getElementById("searchButton");
  const results = document.getElementById("results");
  const detailDiv = document.getElementById("datailCont");
  const details = document.getElementById("details");
  const input = document.getElementById("wordInput");
  const clearButton = document.getElementById("clearbutton");

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
          const h2 = document.createElement("h2");
          results.appendChild(h2);
          h2.textContent = "Terms Found:";
          h2.id = "res1";
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

          h2.appendChild(linkContainer);
        }
      } catch (error) {
        console.error(error);
        document.getElementById("resultsDiv").innerHTML = "Error in the API call.";
      }
    }
  }

  async function displayWordDetails(singleWord) {
    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": "07e0782a67mshe6931296b9986dap118445jsn9b7a1fbadec6",
        "X-RapidAPI-Host": "wordsapiv1.p.rapidapi.com",
      },
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
    detailsHdr.hidden = false;
    const h2Word = document.createElement("h2");
    h2Word.textContent = word;
    detailDiv.style.lineHeight = "0.001";
    detailDiv.appendChild(document.createElement("br"));
    detailDiv.appendChild(h2Word);
    detailDiv.style.lineHeight = "0.001";
    detailDiv.appendChild(document.createElement("br"));
    const flagNoun = await checkPartOfSpeech("noun", results);
    if (flagNoun) {
      createSection("Noun", "noun");
      generateDetails(results, "noun")

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
      var otherPartOfSpeech = otherPartOfSpeech.charAt(0).toUpperCase() + otherPartOfSpeech.slice(1);
      createSection(otherPartOfSpeech, "other");
      generateDetails(results, "other");
    }

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
      if (partOfSpeech !== 'noun' && partOfSpeech !== 'verb' && partOfSpeech !== 'adverb' && partOfSpeech !== 'adjective' && partOfSpeech !== 'pronoun') {
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

    for (const resultn of results) {
        const partOfSpeech = resultn.partOfSpeech;
        if (partOfSpeech == partOfSpe && i < 3) {
            const definition = resultn.definition;
            const definitionParagraph = document.createElement("p");
            definitionParagraph.textContent = capitalizeFirstLetter(definition);

            // Add CSS to control line spacing for definitions
            definitionParagraph.style.margin = "0"; // Remove margin
            definitionParagraph.style.padding = "0"; // Remove padding
            definitionParagraph.style.lineHeight = "1.2"; // Adjust line height as needed

            defDiv.appendChild(definitionParagraph);
            defDiv.appendChild(document.createElement("br"));
            i++;
        }
    }

    var id2 = "ex" + partOfSpe;
    createSection("Examples:", id2); // Create the Examples section
    const exDiv =  document.getElementById(id2);
    var j = 0;
    let foundExample = false; // Flag to track if any examples are found

    for (const resultn of results) {
        const partOfSpeech = resultn.partOfSpeech;
        if (partOfSpeech == partOfSpe && j < 1) {
            const examples = resultn.examples;
            if (examples && examples.length > 0) {
                for (const example of examples) {
                    const exampleParagraph = document.createElement("p");
                    exampleParagraph.textContent = capitalizeFirstLetter(example);

                    // Add CSS to control line spacing for examples
                    exampleParagraph.style.margin = "0"; // Remove margin
                    exampleParagraph.style.padding = "0"; // Remove padding
                    exampleParagraph.style.lineHeight = "1.2"; // Adjust line height as needed

                    exDiv.appendChild(exampleParagraph);
                    exDiv.appendChild(document.createElement("br"));
                }
                foundExample = true; // Set the flag to true if examples are found
                j++;
            }
      
        }
    }
    
    // Hide the Examples section if no examples are found
    if (foundExample == false) {
        exDiv.hidden = true;
    }
}




  async function refreshDetails() {
    await clearResults(details);
    const h2 = document.createElement("h2");
    h2.id = "detailsHdr";
    h2.textContent = "Terms Details:";
    h2.hidden = true;
    const div = document.createElement("div");
    div.id = "datailCont";
    div.appendChild(h2);
    details.appendChild(document.createElement("br"));
    details.appendChild(div);
    details.appendChild(document.createElement("br"));
  }
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
});
