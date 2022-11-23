class Cart {
    books;
    constructor(oldCart) {
        if (!oldCart) {
            this.books = [];
        } else {
            this.books = oldCart;
        }
    }

    addBookToCart(bookInfo) {
        let bookFound = false;
        this.books.forEach(book => {
            if (book.id == bookInfo.id) {
                book.quantity++;
                bookFound = true;
                return;
            }
        });
        if (!bookFound) {
            this.books.push(bookInfo);
        }
    }

    removeBookFromCart(bookInfo) {
        this.books.forEach(book => {
            if (book.id == bookInfo.id) {
                book.quantity--;
                if (book.quantity <= 0) {
                    this.books.filter((value, index, err) => {
                        if (value.id == book.id) {
                            this.books.splice(index, 1);
                        }
                    })
                }
                return;
            }
        });
    }
}

module.exports = Cart;