const basicURL = 'http://jservice.io/api/';
const row = 5;
const column = 6;
let category = [];

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    let categoryIds = [];
    let res = await axios.get(`${basicURL}categories?count=100`);    
    categoryIds = res.data.map(each => each.id);
    return (_.sampleSize(categoryIds, column));
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    let res = await axios.get(`${basicURL}category?id=${catId}`);
    // get titles
    let title = res.data.title;
    // get clues
    let randomClues = _.sampleSize(res.data.clues, row);
    let clues = randomClues.map(each => ({
        question: each.question,
        answer: each.answer,
        showing: null
        })
    )  

    return {title, clues};
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    let body = document.querySelector('body');
    let div = document.createElement('div');
    div.setAttribute('id', 'loader');

    // create table
    let table = document.querySelector('table');
    //create table header
    let tableHeader = document.createElement('thead');  
    let trHeader = document.createElement('tr');

    for (let i = 0; i < column; i++) {
        // console.log(category[i][0].title);
        let th = document.createElement('th');
        th.innerText = `${category[i].title.toUpperCase()}`;
        th.setAttribute('id',`${i}`);
        trHeader.append(th);
    }

    tableHeader.append(trHeader);
    //create table body
    let tableBody = document.createElement('tbody');

    for (let i = 0; i < row; i++) {
        let trBody = document.createElement('tr');
        for (let j = 0; j < column; j++) {
            let td = document.createElement('td');
            td.setAttribute('id', `${i}-${j}`);
            td.innerText='?';
            trBody.append(td);
        }        
        tableBody.append(trBody);
    }

    table.append(tableHeader, tableBody);
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    let [rowIndex, colIndex] = evt.target.id.split('-');
    let curCell = category[colIndex].clues[rowIndex];
    let curshowing = curCell.showing;

    if (curshowing === null) {
        $(`#${rowIndex}-${colIndex}`).html(`${curCell.question}`);
        curCell.showing = 'question';
    } else if (curshowing === 'question') {
        $(`#${rowIndex}-${colIndex}`).html(`${curCell.answer}`);
        curCell.showing = 'answer';
    } else {
        return;
    }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    // console.log('showLoadingView');
    let loadingDiv = document.querySelector('.loader');
    loadingDiv.innerHTML='';
    let img = document.createElement('img');
    img.setAttribute('src', 'loading_apple.gif');
    loadingDiv.append(img);
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    const loader = document.querySelector('.loader');
    loader.className += ' hidden';
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    // reset the content of category array
    category = [];
    // get IDs with a size of column
    let idsArray = await getCategoryIds();

    // fill category of each id 

    // for (let each of idsArray) {
    //     category.push(await getCategory(each));
    // }

    await Promise.all(
        [getCategory(idsArray[0]),
        getCategory(idsArray[1]),
        getCategory(idsArray[2]),
        getCategory(idsArray[3]),
        getCategory(idsArray[4]),
        getCategory(idsArray[5]),
        ]
    ).then(
        values => {
            for (let each of values) {
                category.push(each);
            }
        }
    );

    // fill table with new categories
    fillTable();
}

/** On click of start / restart button, set up game. */
// TODO

let restartBtn = document.querySelector('button');
restartBtn.addEventListener('click', function(){
    restartClicked();
    restartBtn.innerText = 'Restart Game';
})

function restartClicked () {
    document.querySelector('.loader').classList.remove('hidden');
    showLoadingView();
    $(document).ready(async function () {
        // showLoadingView();
        hideLoadingView();
        $('table').empty();
        setupAndStart();
    });
};

/** On page load, add event handler for clicking clues */
// TODO
// window.addEventListener('load', function(){
//     const loader = document.querySelector('.loader');
//     console.log(loader);
// });
showLoadingView();
$(document).ready(async function () {
    // showLoadingView();
    hideLoadingView();
    setupAndStart();
    $('body').on('click', 'td', handleClick);
});
