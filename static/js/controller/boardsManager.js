import {dataHandler} from "../data/dataHandler.js";
import {htmlFactory, htmlTemplates} from "../view/htmlFactory.js";
import {domManager} from "../view/domManager.js";
import {cardsManager} from "./cardsManager.js"; //upewnij się, że ścieżka jest poprawna

export let boardsManager = {
    loadBoards: async function () {
        const boards = await dataHandler.getBoards();
        let boardsHTML = '';

        for (let board of boards) {
            const boardBuilder = htmlFactory(htmlTemplates.board);
            const content = boardBuilder(board);
            boardsHTML += content;
            cardsManager.loadCards(board.id);
        }

        boardsHTML += '<button id="add-board-btn" class="btn btn-primary">Add Board</button>';
        domManager.addChild("#root", ""); // Czyści zawartość #root
        domManager.addChild("#root", boardsHTML);

        // Dodaje event listener do przycisku po dodaniu go do DOM
        document.getElementById("add-board-btn").addEventListener("click", this.addBoard);

        // Dodaje event listener do przycisków "Create new card" dla WSZYSTKICH tablic
        for (let board of boards) {
            this.addEventListenersToBoard(board.id);
        }
    },
    addBoard: function () {
        document.getElementById("add-board-btn").blur();
        const boardName = prompt("Please enter the new board name:");
        if (boardName) {
            const newBoardData = {
                title: boardName
            };
            dataHandler.createNewBoard(newBoardData, function(responseArray) {
                console.log("Response from createNewBoard:", responseArray);

                const response = responseArray[0];

                if (response.success) {
                    const newBoard = {
                        id: response.board_id,
                        title: boardName
                    };
                    console.log("New board object:", newBoard);

                    const boardBuilder = htmlFactory(htmlTemplates.board);
                    const content = boardBuilder(newBoard);
                    console.log("Generated board HTML:", content);

                    // Dodaje nową tablicę przed przyciskiem "Add Board"
                    const addButton = document.getElementById("add-board-btn");
                    addButton.insertAdjacentHTML("beforebegin", content);

                    cardsManager.loadCards(newBoard.id);

                    // Dodaje event listener do przycisków "Create new card" dla nowo utworzonej tablicy
                    boardsManager.addEventListenersToBoard(newBoard.id);
                } else {
                    console.error("Failed to create the board on the frontend.");
                }
            });
        }
    },
    addEventListenersToBoard: async function (boardId) {
        const statuses = await dataHandler.getStatuses();
        for (let status of statuses) {
            const button = document.querySelector(`.column[data-board-id="${boardId}"][data-status-id="${status.id}"] .create-card-btn`);
            if (button) {
                button.addEventListener("click", function () {
                    cardsManager.createCard(boardId, status.id);
                });
            }
        }
    }
};



let board = {
  id: 1,
  title: "Board 1",
  cards: [
    { id: 1, title: "Card 1", status: "New" },
    { id: 2, title: "Card 2", status: "In Progress" },
    // ...
  ],
};

let groups = {
  "New": [],
  "In Progress": [],
  "Testing": [],
  "Done": [],
};

for (let card of board.cards) {
  if (groups.hasOwnProperty(card.status)) {
    groups[card.status].push(card);
  }
}

board.newCards = groups["New"];
board.progressCards = groups["In Progress"];
board.testingCards = groups["Testing"];
board.doneCards = groups["Done"];


function showHideButtonHandler(clickEvent) {
    const boardId = clickEvent.target.dataset.boardId;
    cardsManager.loadCards(boardId);
}


document.addEventListener('click', function(event) {
    if (event.target.classList.contains('board-title')) {
        const currentTitle = event.target.textContent;
        const boardId = event.target.dataset.boardId;
        const inputBox = `
            <div class="d-flex">
                <input type="text" value="${currentTitle}" data-board-id="${boardId}" class="board-title-input custom-board-title-input form-control mr-2">
                <button class="save-board-title btn btn-primary">Save</button>
            </div>`;
        event.target.outerHTML = inputBox;
    }
});


document.addEventListener('click', async function(event) {
    if (event.target.classList.contains('save-board-title')) {
        const inputElement = document.querySelector('.board-title-input');
        const newTitle = inputElement.value;
        const boardId = inputElement.dataset.boardId;

        // Wyślij żądanie do serwera
        const response = await fetch(`/api/boards/${boardId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: newTitle })
        });

        const data = await response.json();
        if (data.success) {
            const newTitleElement = document.createElement('span');
            newTitleElement.classList.add('board-title');
            newTitleElement.dataset.boardId = boardId;
            newTitleElement.textContent = newTitle;

            const parentElement = inputElement.parentElement;

            parentElement.removeChild(inputElement);
            const saveButton = document.querySelector('.save-board-title');
            parentElement.removeChild(saveButton);

            parentElement.prepend(newTitleElement);
        } else {
            alert('Nie udało się zaktualizować tytułu tablicy.');
        }
    }
});

document.addEventListener('click', async function(event) {
    const deleteButton = event.target.closest('.delete-board-btn');
    if (deleteButton) {
        const boardId = deleteButton.dataset.boardId;

        try {
            const response = await fetch(`/api/boards/${boardId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                const boardElement = document.querySelector(`[data-board-id="${boardId}"]`).closest('.body-container');
                if (boardElement) {
                    boardElement.remove();
                } else {
                    console.error(`Nie znaleziono elementu tablicy o ID ${boardId} do usunięcia.`);
                    console.log(document.body.innerHTML);
                }
            } else {
                const responseData = await response.json();
                const errorMessage = responseData.message || 'Nie udało się usunąć tablicy.';
                alert(errorMessage);
            }
        } catch (error) {
            console.error('Błąd podczas usuwania tablicy:', error);
        }
    }
});