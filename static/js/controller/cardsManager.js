import {dataHandler} from "../data/dataHandler.js";
import {htmlFactory, htmlTemplates} from "../view/htmlFactory.js";


export let cardsManager = {
    loadCards: async function (boardId) {
        const cards = await dataHandler.getCardsByBoardId(boardId);
        console.log(cards);
        for (let card of cards) {
            this.addCardToDOM(card, boardId);
        }
    },
    addCardToDOM: function (card, boardId) {
        const cardBuilder = htmlFactory(htmlTemplates.card);
        const content = cardBuilder(card);
        const createCardButton = document.querySelector(`.column[data-board-id="${boardId}"][data-status-id="${card.status_id}"] .create-card-btn`);
        createCardButton.insertAdjacentHTML("beforebegin", content);
    },
    createCard: async function (boardId, status) {
        document.querySelector(`.column[data-board-id="${boardId}"][data-status-id="${status}"] .create-card-btn`).blur();
        const cardTitle = prompt("Please enter the card title:");
        if (cardTitle) {
            const newCardData = {
                title: cardTitle,
                board_id: boardId,
                status_id: status
            };
            try {
                const response = await dataHandler.createNewCard(newCardData);
                console.log(response);
                if (response[0].success) {
                    const card = {
                        id: response[0].card_id,
                        title: cardTitle,
                        board_id: boardId,
                        status_id: status
                    };
                    this.addCardToDOM(card, boardId);
                } else {
                    console.error("Failed to create the card:", response[0].message);
                }
            } catch (error) {
                console.error("Error while creating a new card:", error);
            }
        }
    }
};

function deleteButtonHandler(clickEvent) {
    //implementacja funkcji deleteButtonHandler
}
