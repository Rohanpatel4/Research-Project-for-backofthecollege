const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'finished_work')));


const db = new sqlite3.Database('./backofthecollege.db', sqlite3.OPEN_READWRITE);


app.get('/people', (req, res) => {
    const searchTerm = req.query.searchTerm;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;
  
    let totalCountQuery = 'SELECT COUNT(*) AS totalCount FROM people';
    let mainQuery = 'SELECT * FROM people';
    let queryParams = [];
  

    if (searchTerm) {
        let searchTermFormatted = `%${searchTerm}%`;
        totalCountQuery += ` WHERE Last_Name LIKE ? OR First_Name LIKE ?`;
        mainQuery += ` WHERE Last_Name LIKE ? OR First_Name LIKE ?`;
        queryParams.push(searchTermFormatted, searchTermFormatted);
    }
  

    db.get(totalCountQuery, queryParams, (err, countResult) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
  
        const totalCount = countResult.totalCount;
  

        mainQuery += ` LIMIT ? OFFSET ?`;
        queryParams.push(pageSize, offset);
        db.all(mainQuery, queryParams, (err, rows) => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
                return;
            }

            res.json({ totalCount, results: rows });
        });
    });
});


  



app.get('/', (req, res) => {

  res.sendFile(path.join(__dirname, 'finished_work', 'advanced_search.html'));
});


app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
