export let dataHandler = {
    getBoards: async function () {
        return await apiGet("/api/boards");
    },

    getBoard: async function (boardId) {
        return await apiGet(`/api/boards/${boardId}`);
    },

    getStatuses: async function () {
        return await apiGet('/api/statuses');
    },

    getStatus: async function (statusId) {
        return await apiGet(`/api/statuses/${statusId}`);
    },

    getCardsByBoardId: async function (boardId) {
        return await apiGet(`/api/boards/${boardId}/cards/`);
    },

    getCard: async function (cardId) {
        return await apiGet(`/api/cards/${cardId}`);
    },

    createNewBoard: async function (boardData, callback) {
        console.log("Przed wywołaniem apiPost w createNewBoard");
        const newBoard = await apiPost("/api/boards", boardData);
        console.log("Po wywołaniu apiPost w createNewBoard");

        if (newBoard && typeof callback === "function") {
            callback(newBoard);
        }
    },
    createNewCard: async function (newCardData) {
        return await apiPost('/api/cards', newCardData);
    }
};

async function apiGet(url) {
    let response = await fetch(url, {
        method: "GET",
    });
    if (response.ok) {
        return await response.json();
    }
}


async function apiPost(url, payload) {
    let response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    if (response.ok) {
        const responseData = await response.json();
        console.log("Odpowiedź z serwera:", responseData);
        return responseData;
    } else {
        throw new Error(`Failed to post data: ${response.statusText}`);
    }
}

async function apiDelete(url) {
    let response = await fetch(url, {
        method: "DELETE"
    });
    if (!response.ok) {
        throw new Error(`Failed to delete data: ${response.statusText}`);
    }
}

async function apiPut(url, payload) {
    let response = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    if (response.ok) {
        return await response.json();
    } else {
        throw new Error(`Failed to update data: ${response.statusText}`);
    }
}

async function apiPatch(url, payload) {
    let response = await fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    if (response.ok) {
        return await response.json();
    } else {
        throw new Error(`Failed to patch data: ${response.statusText}`);
    }
}