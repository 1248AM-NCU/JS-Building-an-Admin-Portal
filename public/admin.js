const bookList = document.getElementById("book-list")
const announce = document.getElementById("announce")
let clientArr = [];

function Announce(text){
    announce.textContent = text;
}
//Ez function for creating an input element
function createInput(name, val, type){
    let container = document.createElement("span");
    let label = document.createElement("label");
    label.setAttribute("for", name);
    label.textContent = name;
    container.append(label);
    let input;
    if(type == 'textarea')
    {
        input = document.createElement("textarea");
        input.setAttribute("id", name);
        input.setAttribute("name", name);
        input.textContent = val;
    }
    else{
        input = document.createElement("input");
        input.setAttribute("type", type);
        input.setAttribute("id", name);
        input.setAttribute("name", name);
        input.setAttribute("value", val);
    }
    container.append(input);
    return { container, input }
}
function createButton(text, callback)
{
    let button = document.createElement("button")
    button.onclick = callback
    button.textContent = text
    return button
}

//Ez function for creating an entire book with inputs
function getBookElement(book)
{
    let bookElement = document.createElement("div")
    let keys = Object.keys(book)
    let inputs = []
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const val = book[key];
        let o = createInput(key, val, getType(val));
        inputs.push(o.input)
        bookElement.append(o.container)
    }
    let updateFunc = async () => {
        Announce("Pending update of book")
        inputs.forEach(element => {
            book[element.id] = element.value
        });
        let req = await fetch(`http://localhost:3001/updateBook`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(book)
        })
        let res = await req.json()
        if(res.error) Announce("Failed to update book")
        else Announce("Book has been successfully updated")
    }
    let delFunc = async () => {
        Announce("Pending deletion of book")
        let orig = bookElement.style.display;
        bookElement.style.display = "none"
        let req = await fetch(`http://localhost:3001/removeBook/${book.id}`, {
            method: "DELETE"
        })
        let res = await req.json()
        if(res.error) {
            Announce("Failed to delete book")
            bookElement.style.display = orig
        }
        else{
            Announce("Book has been successfully deleted")
            bookElement.parentNode.removeChild(bookElement)
        }
    }
    let upButtton = createButton("Update", updateFunc)
    bookElement.append(upButtton)
    let delButtton = createButton("Delete", delFunc)
    bookElement.append(delButtton)
    return {bookElement, inputs}
}
//Gets type for input type from js type
function getType(val) {
    switch(typeof(val)){
        case "number":
            return 'number'
        case "string":
            //If the string is actually a number
            if(!isNaN(val)) return 'number'
            //If the string is just a tad too much
            else if(val.length > 35) return 'textarea'
            else return "text";
        default:
            console.error("didn't quite get the correct type")
            break;
    }
}
//Check if books match with server
async function RefreshBooks()
{
    Announce("Pending Refresh")
    //Fetch
    let req = await fetch("http://localhost:3001/listBooks")
    let books = await req.json()
    if(!arrayEquals(books, clientArr))
    {
        clientArr = books
        RefreshList()
    } 
    else{
        Announce("Up to date")
    }
}

//This function is called if books on the server do not match our update
//And requires sync
function RefreshList()
{
    bookList.textContent = '';
    let books = clientArr;
    for (let i = 0; i < books.length; ++i) {
        const book = books[i];
        bookList.append(getBookElement(book).bookElement)
    }
    Announce("List updated")
}

async function AddNewBook(){
    Announce("Pending Addition")
    let inputs = Array.from(document.getElementsByClassName("create-input"));
    console.log(inputs)
    let book = {};
    inputs.forEach(element => {
        book[element.id] = element.value;
    });
    let req = await fetch("http://localhost:3001/addBook",{
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(book)
    })
    let res = await req.json()
    if(res.error){
        Announce("Addition failed")
    }
    else{
        Announce("Addition Succeded")
        bookList.append(getBookElement(book).bookElement)
    }
}

function arrayEquals(a, b) {
    //Relatively easy, and not aiming for optimization, not after overkilling it
    return JSON.stringify(a)==JSON.stringify(b);
  }

RefreshBooks()
