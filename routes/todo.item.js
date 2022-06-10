const express = require('express');
const { append } = require('express/lib/response');
const pool = require('../dbconfig');
const router = express.Router();

// CRUD TODO_ITEM Routes
// Currently ignore t_user_id field as user is not implemented yet

// Get all todos
router.get('/getAll', async (req, res) => {
    const size = req.query.size;
    const page = req.query.page || 1;   // by default show page 1

    try {
        let allTodos;

        // if size is not specify, SELECT * without limit & offset
        if (!size) {
            allTodos = await pool.query(
                `SELECT t_id "id", t_title "title", t_desc "description", to_char(t_date, 'yyyy-mm-dd') "date", t_isCompleted "isCompleted" 
                    FROM TODO_ITEM 
                    ORDER BY t_date DESC
                `
            );
        } else {
            allTodos = await pool.query(
                `SELECT t_id "id", t_title "title", t_desc "description", to_char(t_date, 'yyyy-mm-dd') "date", t_isCompleted "isCompleted" 
                    FROM TODO_ITEM 
                    ORDER BY t_date DESC
                    LIMIT $1 
                    OFFSET $2`,
                [size, (page - 1) * size]
            );
        }

        res.status(200).json({
            timestamp: new Date(),
            itemsLength: allTodos.rowCount,
            result: allTodos.rows
        });

    } catch (err) {
        console.error(err.message);
        res.status(403).send('403 Forbidden Access');
    }
});

// Get incomplete todos, sorted from Date DESC
router.get('/getOngoing', async (req, res) => {
    const size = req.query.size;
    const page = req.query.page || 1;   // by default show page 1

    try {
        let ongoingTodos;

        // if size is not specified, get all ongoing todos
        if (!size) {
            ongoingTodos = await pool.query(
                `SELECT t_id "id", t_title "title", t_desc "description", to_char(t_date, 'yyyy-mm-dd') "date", t_isCompleted "isCompleted" 
                    FROM TODO_ITEM 
                    WHERE t_isCompleted = false 
                    ORDER BY t_date 
                `
            );
        } else {
            ongoingTodos = await pool.query(
                `SELECT t_id "id", t_title "title", t_desc "description", to_char(t_date, 'yyyy-mm-dd') "date", t_isCompleted "isCompleted" 
                    FROM TODO_ITEM 
                    WHERE t_isCompleted = false 
                    ORDER BY t_date 
                    LIMIT $1 
                    OFFSET $2`,
                [size, (page - 1) * size]
            );
        }

        res.status(200).json({
            timestamp: new Date(),
            itemsLength: ongoingTodos.rowCount,
            result: ongoingTodos.rows
        });

    } catch (err) {
        console.error(err.message);
        res.status(403).send('403 Forbidden Access');
    }
});

// Get todos of the day
router.get('/todosOfTheDay', async (req, res) => {
    const size = req.query.size;
    const page = req.query.page || 1;   // by default show page 1


    try {
        let todosOfTheDay;

        // If size not specified, get all todos of the day
        if (!size) {
            todosOfTheDay = await pool.query(
                `SELECT t_id "id", t_title "title", t_desc "description", to_char(t_date, 'yyyy-mm-dd') "date", t_isCompleted "isCompleted" 
                    FROM TODO_ITEM 
                    WHERE t_date = CURRENT_DATE
                    AND t_isCompleted = FALSE
                    ORDER BY t_id
                `
            );
        } else {
            todosOfTheDay = await pool.query(
                `SELECT t_id "id", t_title "title", t_desc "description", to_char(t_date, 'yyyy-mm-dd') "date", t_isCompleted "isCompleted" 
                    FROM TODO_ITEM 
                    WHERE t_date = CURRENT_DATE
                    AND t_isCompleted = FALSE
                    ORDER BY t_id
                    LIMIT $1 
                    OFFSET $2
                `,
                [size, (page - 1) * size]
            );

        }
        res.status(200).json({
            timestamp: new Date(),
            itemsLength: todosOfTheDay.rowCount,
            result: todosOfTheDay.rows
        });

    } catch (err) {
        console.error(err.message);
        res.status(403).send('403 Forbidden Access');
    }
});

// Get history - todos with isCompleted=true
router.get('/getCompleted', async (req, res) => {
    const size = req.query.size;
    const page = req.query.page || 1;   // by default show page 1

    try {
        let completedTodos;

        // if size is not specified, get all ongoing todos
        if (!size) {
            completedTodos = await pool.query(
                `SELECT t_id "id", t_title "title", t_desc "description", to_char(t_date, 'yyyy-mm-dd') "date", t_isCompleted "isCompleted" 
                    FROM TODO_ITEM 
                    WHERE t_isCompleted = true 
                    ORDER BY t_date DESC 
                `
            );
        } else {
            completedTodos = await pool.query(
                `SELECT t_id "id", t_title "title", t_desc "description", to_char(t_date, 'yyyy-mm-dd') "date", t_isCompleted "isCompleted" 
                    FROM TODO_ITEM 
                    WHERE t_isCompleted = true 
                    ORDER BY t_date DESC 
                    LIMIT $1 
                    OFFSET $2`,
                [size, (page - 1) * size]
            );
        }

        res.status(200).json({
            timestamp: new Date(),
            itemsLength: completedTodos.rowCount,
            result: completedTodos.rows
        });

    } catch (err) {
        console.error(err.message);
        res.status(403).send('403 Forbidden Access');
    }
});

// Get todo by id
router.get('/:todoId', async (req, res) => {
    try {
        const targetTodo = await pool.query(
            `SELECT t_id "id", t_title "title", t_desc "description", to_char(t_date, 'yyyy-mm-dd') "date", t_isCompleted "isCompleted" 
                FROM TODO_ITEM 
                WHERE t_id = $1`,
            [req.params.todoId]
        );

        // Exclude all metadata from result
        const targetTodoContent = targetTodo.rows[0];

        // If target not exists, return 403 
        if (!targetTodoContent) {
            res.status(403).json({
                timestamp: new Date(),
                errorMessage: '403 Forbidden Access'
            });
        } else {
            res.status(200).json({
                timestamp: new Date(),
                result: targetTodoContent
            });
        }

    } catch (err) {
        console.error(err.message);
        res.status(403).send('403 Forbidden Access');
    }
});

// Create todo
router.post('/', async (req, res) => {
    try {
        const todoToCreate = [
            req.body.title,
            req.body.description,
            req.body.date,
            false,
            1    // temporarily using admin id
        ];

        const createdTodo = await pool.query(
            `INSERT INTO TODO_ITEM (
                t_title, t_desc, t_date, t_isCompleted, t_user_id
                )
            VALUES (
                $1, $2, $3, $4, $5
            ) 
            RETURNING t_id "id", t_title "title", t_desc "description", to_char(t_date, 'yyyy-mm-dd') "date", t_isCompleted "isCompleted"
            `,
            todoToCreate
        );

        res.status(201).json({
            timestamp: new Date(),
            result: createdTodo.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(403).send(err.message);
    }
});

// Update todo by id
router.put('/:todoId', async (req, res) => {
    try {
        const valuesToUpdate = [
            req.body.title,
            req.body.description,
            req.body.date,
            req.body.isCompleted,
            req.params.todoId   // id of todoToUpdate, $5 in SQL query
        ];

        const updatedTodo = await pool.query(
            `UPDATE TODO_ITEM 
                SET t_title = $1, t_desc = $2, t_date = $3, t_isCompleted = $4 
                WHERE t_id = $5
                RETURNING t_id "id", t_title "title", t_desc "description", to_char(t_date, 'yyyy-mm-dd') "date", t_isCompleted "isCompleted"
                `,
            valuesToUpdate
        );

        const updatedTodoContent = updatedTodo.rows[0];
        if (!updatedTodoContent) {
            res.status(403).json({
                timestamp: new Date(),
                errorMessage: '403 Forbidden Access'
            });
        } else {
            res.status(200).json({
                timestamp: new Date(),
                result: updatedTodoContent
            });
        }

    } catch (err) {
        console.error(err.message);
        res.status(403).send(err.message);
    }
});

// Complete todos - update isCompleted to true
router.put('/:todoId/complete', async (req, res) => {
    try {
        const todoId = req.params.todoId;
        const updatedTodo = await pool.query(
            `UPDATE TODO_ITEM 
                SET t_isCompleted = true 
                WHERE t_id = $1
                RETURNING t_id "id", t_title "title", t_desc "description", to_char(t_date, 'yyyy-mm-dd') "date", t_isCompleted "isCompleted"
            `,
            [todoId]
        );

        const updatedTodoContent = updatedTodo.rows[0];
        if (!updatedTodoContent) {
            res.status(403).json({
                timestamp: new Date(),
                errorMessage: '403 Forbidden Access'
            });
        } else {
            res.status(200).json({
                timestamp: new Date(),
                result: updatedTodoContent
            });
        }

    } catch (err) {
        console.error(err.message);
        res.status(403).send('403 Forbidden Access');
    }
});

// Delete todo by id
router.delete('/:todoId', async (req, res) => {
    try {
        const todoId = req.params.todoId;
        const deletedTodo = await pool.query(
            `DELETE FROM TODO_ITEM 
                WHERE t_id = $1
                RETURNING t_id "id", t_title "title", t_desc "description", to_char(t_date, 'yyyy-mm-dd') "date", t_isCompleted "isCompleted"
            `,
            [todoId]
        );

        const deletedTodoContent = deletedTodo.rows[0];
        if (!deletedTodoContent) {
            res.status(403).json({
                timestamp: new Date(),
                errorMessage: '403 Forbidden Access'
            });
        } else {
            res.status(200).json({
                timestamp: new Date(),
                result: deletedTodoContent
            });
        }

    } catch (err) {
        console.error(err.message);
        res.status(403).send(err.message);
    }
});

module.exports = router;