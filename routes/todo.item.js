const express = require('express');
const todoModel = require('../models/todo.model');
const router = express.Router();

// CRUD TODO_ITEM Routes
// Currently ignore t_user_id field as user is not implemented yet

// Get all todos
router.get('/getAll', async (req, res) => {
    const size = req.query.size;
    const page = req.query.page || 1;   // by default show page 1

    try {
        const allTodos = await todoModel.getAllTodos(size, page);

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
        let ongoingTodos = await todoModel.getOngoingTodos(size, page);

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
        let todosOfTheDay = await todoModel.getTodosOfTheDay(size, page);

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
        let completedTodos = await todoModel.getCompletedTodos(size, page);

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
        const targetTodo = await todoModel.getTodoById(req.params.todoId);

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

        let createdTodo = await todoModel.createTodo(todoToCreate);

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

        let updatedTodo = await todoModel.updateTodoById(valuesToUpdate);
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
        const updatedTodo = await todoModel.completeTodoById(todoId);
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
        const deletedTodo = await todoModel.deleteTodoById(todoId);
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