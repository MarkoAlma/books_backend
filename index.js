import express, { response } from "express"
import mysql from "mysql"
import cors from "cors"
import { configDB } from "./configDB.js"

const db = mysql.createConnection(configDB)
const app = express()

app.use(cors())
app.use(express.json())

const port = 8000

app.get("/books/categories", (req, resp)=>{
    const sql = "SELECT id, name FROM categories order by name"
    db.query(sql, (error, result)=>{
        if (error) {
            console.log(error);
            resp.status(500).json({error:"Adatbázis hiba !!!"})
        }else {
            resp.status(200).send(result)
        }
    })
})

app.get("/books", (req, resp)=>{
    const sql = "SELECT books.id, books.title, books.author, books.description, books.cover, books.rating, categories.name as category FROM books, categories where books.category_id = categories.id ORDER by books.title;"
    db.query(sql, (error, result)=>{
        if (error) {
            console.log(error);
            resp.status(500).json({error:"Adatbázis hiba !!!"})
        }else {
            resp.status(200).send(result)
        }
    })
})

app.get("/books/categ/:categId", (req, resp)=>{
    const {categId} = req.params
    const sql = "SELECT books.id, books.title, books.author, books.description, books.cover, books.rating, categories.name as category FROM books, categories where books.category_id = categories.id and categories.id = ? ORDER by books.title;"
    const values = [categId]
    db.query(sql, values, (error, result)=>{
        if (error) {
            console.log(error);
            resp.status(500).json({error:"Adatbázis hiba !!!"})
        }else {
            resp.status(200).send(result)
        }
    })
})

app.get("/books/title/:searchedText", (req, resp)=>{
    const {searchedText} = req.params
    const sql = "SELECT books.id, books.title, books.author, books.description, books.cover, books.rating, categories.name as category FROM books, categories where books.category_id = categories.id AND INSTR(books.title, ?) > 0 ORDER by books.title;"
    const values = [searchedText]
    db.query(sql, values, (error, result)=>{
        if (error) {
            console.log(error);
            resp.status(500).json({error:"Adatbázis hiba !!!"})
        }else {
            resp.status(200).send(result)
        }
    })
})

app.get("/books/author/:author", (req, resp)=>{
    const {author} = req.params
    const sql = "SELECT books.id, books.title, books.author, books.description, books.cover, books.rating, categories.name as category FROM books, categories where books.category_id = categories.id AND INSTR(books.author, ?) > 0 ORDER by books.title;"
    const values = [author]
    db.query(sql, values, (error, result)=>{
        if (error) {
            console.log(error);
            resp.status(500).json({error:"Adatbázis hiba !!!"})
        }else {
            resp.status(200).send(result)
        }
    })
})

app.post("/books", (req, resp)=>{
    const {title, author, description, cover, category_id, rating} = req.body
    if (!title || !author || !description || !cover || !category_id || !rating) {
        return resp.status(400).json({error:"Nincs megadva az összes attribútum"})
    }
    const sql = "INSERT INTO books (title, author, description, cover, category_id, rating) VALUES (?,?,?,?,?,?);"
    const values = [title, author, description, cover, category_id, rating]
    db.query(sql, values, (error, result)=>{
        if (error) {
            console.log(error);
            resp.status(500).json({error:"Adatbázis hiba !!!"})
        }else {
            resp.status(201).send({id:result.insertId, title, author, description, cover, category_id, rating})
        }
    })
})

app.put("/books/:id", (req, resp)=>{
    const {title, author, description, cover, rating} = req.body
    if (!title || !author || !description || !cover || !rating) {
        return resp.status(400).json({error:"Nincs megadva az összes attribútum"})
    }
    const {id} = req.params
    const sql = "UPDATE books SET title = ?, author = ?, description=?, cover=?, rating=? WHERE books.id = ?;"
    const values = [title, author, description, cover, rating, id]
    db.query(sql, values, (error, result)=>{
        if (error) {
            console.log(error);
            resp.status(500).json({error:"Adatbázis hiba !!!"})
        }else if (result.affectedRows == 0) {
            resp.status(404).json({error:"A megadott könyv (id) nem létezik"})
        }
        else {
            resp.status(200).send(result)
        }
    })
})

app.delete("/books/:id", (req, resp)=>{
    const {id} = req.params
    const sql = "DELETE FROM books WHERE id=?"
    const values = [id]
    db.query(sql, values, (error, result)=>{
        if (error) {
            console.log(error);
            resp.status(500).json({error:"Adatbázis hiba !!!"})
        }else if (result.affectedRows == 0) {
            resp.status(404).json({error:"A megadott könyv (id) nem létezik"})
        }
        else {
            resp.status(200).json({msg:"Sikeres törlés!"})
        }
    })
})

app.listen(port,()=>console.log(`A szerver hallgatózik a ${port} porton`))