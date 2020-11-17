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
    console.log(res.data);
    // get titles
    let title = res.data.title;
    // get clues
    let randomClues = _.sampleSize(res.data.clues, row);
    let clues = randomClues.map(each => ({
        question: each.question,
        answer: each.answer,
        showing: null,
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
            td.innerText=`$${200 + i * 200}`;
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
    console.log(category[colIndex].clues[rowIndex]);
    let curCell = category[colIndex].clues[rowIndex];
    let curshowing = curCell.showing;

    if (curshowing === null) {
        $(`#${rowIndex}-${colIndex}`).html(`${curCell.question}`);
        curCell.showing = 'question';
    } else if (curshowing === 'question') {
        $(`#${rowIndex}-${colIndex}`).html(`${curCell.answer}`);
        curCell.showing = 'answer';
    } else if (curshowing === 'answer') {
        $(`#${rowIndex}-${colIndex}`).html(`<p>Is your answer correct?</p></br><button class='yes' >Yes</button> <button class='no'>No</button>`)
        applyValue(rowIndex, colIndex);
        curCell.showing = 'question';
    } else if (curshowing === 'no') {
        $(`#${rowIndex}-${colIndex}`).html(`${curCell.answer}`);
        curCell.showing = null;
    } else if (curshowing === 'done') {
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
    let loader = document.querySelector('.loader');
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

/** Get All players's name: **/
function getPlayersName() {
    allPlayers = document.querySelectorAll('input');
    let showPlayers = document.querySelector('.players');
    console.log(allPlayers);

    allPlayers.forEach((each, index) => {
        let player = document.createElement('span');
        if (each.value === '') {
            player.innerHTML = `Player ${index + 1}: <span class=${index}>0</span> `
        } else {
            player.innerHTML = `${each.value}: <span class=${index}>0</span> `
        }
        showPlayers.append(player);
    });
}

/** apply values to players: **/
function applyValue(rowIndex, colIndex) {
    // under case which answer is correct
    let yesValue = document.querySelector('.yes');
        yesValue.addEventListener('click', function(){
        console.log(rowIndex);
        console.log(colIndex);
        let numbers = document.querySelectorAll(`input[type=text]`)
        $(`#${rowIndex}-${colIndex}`).html(`<p>Which Player ?</p></br><input class=getPlayer type=number min=1 max=${numbers.length} value=1></input> <input class=submitValue type=submit></input>`);
        $(`.submitValue`).on('click', function(){
            // console.log('test!');
            // console.log(rowIndex);
            // console.log(colIndex);
            let getPlayer = document.getElementsByClassName('getPlayer');
            console.log(parseInt(rowIndex) + 1);
            addValue(getPlayer[0].value, (parseInt(rowIndex)+1)*200);
            $(`#${rowIndex}-${colIndex}`).html(`${category[colIndex].clues[rowIndex].answer}`);
            category[colIndex].clues[rowIndex].showing = 'done';
            console.log(category[colIndex].clues[rowIndex].showing);
        });
    });
    // under case which answer is correct
    let noValue = document.querySelector('.no');
        noValue.addEventListener('click', function() {
        $(`#${rowIndex}-${colIndex}`).html(`${category[colIndex].clues[rowIndex].answer}`);
        category[colIndex].clues[rowIndex].showing = 'done';
    });
}

/** apply values to the player who got the correct answer: **/
function addValue(number, value) {
    let allPlayers = document.querySelectorAll('input[type=text]');
    // console.log(allPlayers[0].value);
    allPlayers.forEach((each, index) => {
        // console.log(typeof index+1);
        // console.log(typeof number);
        if (number == index + 1) {
            console.log(allPlayers[index].value);
            console.log(value);
            console.log([index, value]);
            let newValue = document.getElementsByClassName(`${index}`);
            console.log(newValue[0].innerText);
            newValue[0].innerText = parseInt(newValue[0].innerText) + value;        
        }
    });
}

/** On click of start / restart button, set up game. */
// TODO

let restartBtn = document.querySelector('#restart');
restartBtn.addEventListener('click', function(){
    // restartClicked();
    if (startButton.innerText === 'Restart Game') {
        document.querySelector('.players').innerHTML = '';
        getPlayersName();
        document.querySelector('.loader').classList.remove('hidden');
        showLoadingView();
        $(document).ready(async function () {
            // showLoadingView();
            hideLoadingView();
            $('table').empty();
            setupAndStart();
        });
    }
})

/** On page load, add event handler for clicking clues */
// TODO

let formBoard = document.querySelector('.setupGame')

let gameBoard = document.querySelector('.startGame')
gameBoard.style.display = 'none'

let startButton = document.getElementById('restart')

startButton.addEventListener('click', function () {
    console.log(startButton.innerText);
    if (startButton.innerHTML === 'Start Game') {
        startButton.innerText = 'Restart Game';
        startButton.style.display = 'none';
        formBoard.style.display = 'none';
        showLoadingView();
        
        $(document).ready(async function() {
            hideLoadingView();
            $('table').empty();
            setupAndStart();
            $('body').on('click', 'td', handleClick);
            gameBoard.style.display = 'block';
            startButton.style.display = 'block';
        })
        getPlayersName();
    }
})

/** Add one more player if needed */
document.getElementsByClassName('addOneMore')[0].addEventListener('click', function(event) {
    event.preventDefault();
    let numOfPlayers = document.querySelectorAll('input[type=text]').length;
    if (numOfPlayers < 4) {
    let divForNewPlayer = document.getElementsByClassName('ifOneMore');
        console.log(divForNewPlayer);
        $(divForNewPlayer).append(`<div><label for="playerOne">Player ${numOfPlayers + 1}: </label><input type="text" id=${numOfPlayers + 1}></div>`);
        numOfPlayers += 1;
    }
});
