let db;
const request = indexedDB.open("budget-tracker", 1);

request.onupgradeneeded = ({target}) => {
    let db = target.result;
    db.createObjectStore("pending", { autoIncrement: true })
}

request.onsuccess = ({ target }) => {
    db = target.result;

    if (navigator.onLine) {
        uploadEntries();
    }
}

request.onerror = ({target}) => {
    console.log("err: ", target.errorCode)
}

function uploadEntries() {
    const txn = db.transaction(["pending"], "readwrite");
    const store = txn.objectStore("pending");
    //check if there's any information in the indexedDB at all
    const getAll = store.getAll();

    getAll.onsuccess = function() {
        const storedData = getAll.result;

        if(storedData.length !== 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(storedData),
                headers: {
                    Accepts: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then((info) => {
                console.log(info);
                const txn = db.transaction(["pending"], "readwrite");
                const store = txn.objectStore("pending");
                store.clear();
            })
        }
    }
}

function saveRecord(record) {
    const txn = db.transaction(["pending"], "readwrite");
    const store = txn.objectStore("pending");
    store.add(record)
}

window.addEventListener("online", uploadEntries);