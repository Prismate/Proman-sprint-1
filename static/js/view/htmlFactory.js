export const htmlTemplates = {
    board: 1,
    card: 2
};

export const builderFunctions = {
    [htmlTemplates.board]: boardBuilder,
    [htmlTemplates.card]: cardBuilder
};

export function htmlFactory(template) {
    if (builderFunctions.hasOwnProperty(template)) {
        return builderFunctions[template];
    }

    console.error("Undefined template: " + template);

    return () => {
        return "";
    };
}

function boardBuilder(board) {
    return `<div class="body-container">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="board-title" data-board-id="${board.id}">${board.title}</h6>
                    <button class="delete-board-btn btn btn-sm btn-delete" data-board-id="${board.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
                <div class="row">
                    <div class="col">
                        <div class="card mb-3" data-board-id=${board.id}>
                            <div class="board-body">
                                <div class="row">
                                    <div class="column col new rounded" data-board-id="${board.id}" data-status-id="1">
                                        <h6>New</h6>
                                        <div class="cards-container"></div> <!-- Kontener na karty -->
                                        <button class="create-card-btn btn btn-sm btn-primary" data-board-id="${board.id}" data-status="New">Create new card</button>
                                    </div>
                                    <div class="column col in-progress rounded" data-board-id="${board.id}" data-status-id="2">
                                        <h6>In Progress</h6>
                                        <div class="cards-container"></div>
                                        <button class="create-card-btn btn btn-sm btn-primary" data-board-id="${board.id}" data-status="In Progress">Create new card</button>
                                    </div>
                                    <div class="column col testing rounded" data-board-id="${board.id}" data-status-id="3">
                                        <h6>Testing</h6>
                                        <div class="cards-container"></div>
                                        <button class="create-card-btn btn btn-sm btn-primary" data-board-id="${board.id}" data-status="Testing">Create new card</button>
                                    </div>
                                    <div class="column col done rounded" data-board-id="${board.id}" data-status-id="4">
                                        <h6>Done</h6>
                                        <div class="cards-container"></div>
                                        <button class="create-card-btn btn btn-sm btn-primary" data-board-id="${board.id}" data-status="Done">Create new card</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}

function cardBuilder(card) {
    return `<div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <span class="card-title">${card.title}</span>
                        <button class="btn btn-edit"><i class="bi bi-pencil"></i></button>
                    </div>
                </div>
            </div>`;
}