//The container for the editor
const bookList = document.getElementById("book-list")
//The div used to log the most recent change
const announce = document.getElementById("announce")
let clientArr = []; //Client's copy of the books for client side only updates

//Uses the announce div to log the most recent changes
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
//Ez function for creating a button element
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
        let o = createInput(key, val, getInputType(val));
        inputs.push(o.input)
        bookElement.append(o.container)
    }
    //Update callback to the update button
    let updateFunc = async () => {
        Announce("Pending update of book")
        inputs.forEach(element => {
            book[element.id] = invertInputType(element)
        });
        let req = await fetch(`http://localhost:3001/updateBook`, {
            method: "PATCH",
            body: JSON.stringify(book)
        })
        let res = await req.json()
        if(res.error) Announce("Failed to update book")
        else Announce("Book has been successfully updated")
    }
    //Delete callback to the delete button
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
            clientArr.splice(clientArr.indexOf(book),1)
        }
    }
    //Create update and delete buttons
    let upButtton = createButton("Update", updateFunc)
    bookElement.append(upButtton)
    let delButtton = createButton("Delete", delFunc)
    bookElement.append(delButtton)
    //Return the element and inputs
    return {bookElement, inputs}
}

//Gets type for input type from js type
function getInputType(val) {
    switch(typeof(val)){
        case "number":
            return 'number'
        case "string":
            //If the string is actually a number
            if(!isNaN(val)) return 'number'
            //If the string is just a tad too much, use a textarea instead
            else if(val.length > 35) return 'textarea'
            else return "text";
        default:
            console.error("didn't quite get the correct type")
            break;
    }
}

//Essentially the inverse of getInputType
function invertInputType(element){
    let tag = element.tagName.toUpperCase()
    let value = element.value
    if(tag == "TEXTAREA") return value
    switch (element.getAttribute("type")) {
        case "number":
            return Number(value)
        case "text":
        default:
            return value;
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

//This function is called if books on the server do not match our update and requires sync
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

//Adds a new book
async function AddNewBook(){
    Announce("Pending Addition")
    let inputs = Array.from(document.getElementsByClassName("create-input"));
    console.log(inputs)
    let book = {};
    inputs.forEach(element => {
        book[element.id] = invertInputType(element);
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
        console.log(res)
        book.id = res.id //Idk why this won't work
        bookList.append(getBookElement(book).bookElement)
    }
}

//Checks if two arrays are equal
function arrayEquals(a, b) {
    //Relatively easy, and not aiming for optimization, not after overkilling it
    return JSON.stringify(a)==JSON.stringify(b);
  }

//Initially creates the edit page
RefreshBooks()
