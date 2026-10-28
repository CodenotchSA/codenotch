import React, { useCallback, useEffect, useState } from 'react';
import { useCodenotch } from '@codenotch/react';
import { clientDbContext } from '../generated/db-client-context';
import { addBook } from '../processes/add-book.process';
import { borrowBook } from '../processes/borrow-book.process';
import { returnBook } from '../processes/return-book.process';
import type { IBook } from '../tables/books.table';
import type { ILoan } from '../tables/loans.table';
import './shelf.css';

type Notice = { kind: 'info' | 'error'; text: string };

// Reads go through the tables, with the rights of the signed-in user; every change is a process
const shelf: React.FC = () => {
    const cn = useCodenotch(clientDbContext);
    const user = cn.getLoggedUser();
    const isLibrarian = user?.roles.includes('Admin') ?? false;

    const [search, setSearch] = useState('');
    const [books, setBooks] = useState<IBook[] | undefined>(undefined);
    const [openLoans, setOpenLoans] = useState<ILoan[]>([]);
    const [notice, setNotice] = useState<Notice | undefined>(undefined);
    const [busy, setBusy] = useState(false);

    const refresh = useCallback(async () => {
        let bookQuery = cn.tables.Books.sort(book => book.Title, 'ASC').take(200);
        const text = search.trim();
        if (text !== '') {
            // The filter is read on the runtime, not run here: the text travels as a parameter
            bookQuery = bookQuery.filter((book, $) => book.Title.includes($.text) || book.Author.includes($.text), { text });
        }
        try {
            const [shelfRows, loanRows] = await Promise.all([
                bookQuery.run(),
                cn.tables.Loans.filter(loan => loan.ReturnedAt.IsNull()).sort(loan => loan.DueOn, 'ASC').take(500).run(),
            ]);
            setBooks(shelfRows);
            setOpenLoans(loanRows);
        }
        catch (error) {
            setNotice({ kind: 'error', text: String(error) });
        }
    }, [cn, search]);

    useEffect(() => { void refresh(); }, [refresh]);

    // Runs one process, says how it went, and reloads what the page shows
    const act = async <T,>(start: () => Promise<{ isError: boolean; errorMessage: string; output: T }>, done: (output: T) => string) => {
        setBusy(true);
        try {
            const result = await start();
            setNotice(result.isError ? { kind: 'error', text: result.errorMessage } : { kind: 'info', text: done(result.output) });
            await refresh();
        }
        finally {
            setBusy(false);
        }
    };

    const loanOf = (bookId: string) => openLoans.find(loan => loan.BookId === bookId);
    const myLoans = openLoans.filter(loan => loan.BorrowerId === user?.id);
    const titleOf = (bookId: string) => books?.find(book => book.Id === bookId)?.Title ?? 'A book';

    return <main>
        <header>
            <h1>Team Library</h1>
            {user && <span className="who">{user.firstName ?? user.email}{isLibrarian && ' · librarian'}</span>}
        </header>

        {notice && <p className={`notice ${notice.kind}`} onClick={() => setNotice(undefined)}>{notice.text}</p>}

        <section>
            <h2>My loans</h2>
            {myLoans.length === 0 && <p className="muted">You have no book at the moment.</p>}
            <ul className="loans">
                {myLoans.map(loan =>
                    <li key={loan.Id}>
                        <span>
                            <strong>{titleOf(loan.BookId)}</strong>, due back on {day(loan.DueOn)}
                            {loan.Overdue && <span className="badge late">overdue</span>}
                        </span>
                        <button disabled={busy} onClick={() => act(
                            () => cn.startProcess(returnBook, { loanId: loan.Id }),
                            returned => returned.late ? 'Returned, a little late. Thank you!' : 'Returned. Thank you!')}>
                            Return
                        </button>
                    </li>)}
            </ul>
        </section>

        <section>
            <h2>The shelf</h2>
            <input className="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search a title or an author" />
            {books === undefined && <p className="muted">Loading…</p>}
            {books !== undefined && books.length === 0 && <p className="muted">No book matches.</p>}
            {books !== undefined && books.length > 0 && <table>
                <thead><tr><th>Title</th><th>Author</th><th>Where it is</th><th /></tr></thead>
                <tbody>
                    {books.map(book => {
                        const loan = loanOf(book.Id);
                        return <tr key={book.Id}>
                            <td>{book.Title}</td>
                            <td>{book.Author}</td>
                            <td>{loan
                                ? <>With {loan.BorrowerName}, until {day(loan.DueOn)}{loan.Overdue && <span className="badge late">overdue</span>}</>
                                : <span className="badge free">on the shelf</span>}
                            </td>
                            <td>{!loan && <button disabled={busy} onClick={() => act(
                                () => cn.startProcess(borrowBook, { bookId: book.Id }),
                                borrowed => `'${borrowed.title}' is yours until ${day(borrowed.dueOn)}.`)}>
                                Borrow
                            </button>}</td>
                        </tr>;
                    })}
                </tbody>
            </table>}
        </section>

        {isLibrarian && <AddBookForm busy={busy} onAdd={(title, author, isbn) => act(
            () => cn.startProcess(addBook, { title, author, isbn }),
            added => `'${added.title}' is on the shelf.`)} />}
    </main>;
};

const AddBookForm: React.FC<{ busy: boolean; onAdd: (title: string, author: string, isbn: string) => Promise<void> }> = ({ busy, onAdd }) => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [isbn, setIsbn] = useState('');

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        await onAdd(title, author, isbn);
        setTitle('');
        setAuthor('');
        setIsbn('');
    };

    return <section>
        <h2>Add a book</h2>
        <form className="add" onSubmit={submit}>
            <input value={title} onChange={event => setTitle(event.target.value)} placeholder="Title" required />
            <input value={author} onChange={event => setAuthor(event.target.value)} placeholder="Author" required />
            <input value={isbn} onChange={event => setIsbn(event.target.value)} placeholder="ISBN-13 (optional)" />
            <button disabled={busy} type="submit">Add</button>
        </form>
    </section>;
};

/** '2026-03-23' or '2026-03-23T00:00:00' as the reader's calendar writes it. */
const day = (value: string): string =>
    new Date(`${value.slice(0, 10)}T00:00:00Z`).toLocaleDateString(undefined, { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' });

export default shelf;
