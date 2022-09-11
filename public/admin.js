const bookList = document.getElementById("book-list")

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

//Ez function for creating an entire book with inputs
function getBookElement(book)
{
    let bookElement = document.createElement("div")
    let keys = Object.keys(book)
    let inputs = []
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const val = book[key];
        console.log(typeof(val))
        console.log(val)
        let o = createInput(key, val, getType(val));
        inputs.push(o.input)
        bookElement.append(o.container)
    }
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

async function RefreshBooks()
{
    //Clear
    bookList.textContent = '';
    //Fetch
    let req = await fetch("http://localhost:3001/listBooks")
    let books = await req.json()
    //Refill
    for (let i = 0; i < books.length; ++i) {
        const book = books[i];
        bookList.append(getBookElement(book).bookElement)
        
    }

}

RefreshBooks()