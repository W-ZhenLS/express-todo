const pool = require('../dbconfig');

// Get all todos
module.exports.getAllTodos = async function (size, page) {
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
    return allTodos;
}

// Get incomplete todos, sorted from Date DESC
module.exports.getOngoingTodos = async function (size, page) {
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
    return ongoingTodos;
}

// Get todos of the day
module.exports.getTodosOfTheDay = async function (size, page) {
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
    return todosOfTheDay;
}

// Get completed todos (history)
module.exports.getCompletedTodos = async function (size, page) {
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
    return completedTodos;
}

// Get todo by id
module.exports.getTodoById = async function (todoId) {
    const targetTodo = await pool.query(
        `SELECT t_id "id", t_title "title", t_desc "description", to_char(t_date, 'yyyy-mm-dd') "date", t_isCompleted "isCompleted" 
            FROM TODO_ITEM 
            WHERE t_id = $1`,
        [todoId]
    );
    return targetTodo;
}

// Create new todo
module.exports.createTodo = async function (todoToCreate) {
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
    return createdTodo;
}

// Update todo by id
module.exports.updateTodoById = async function (valuesToUpdate) {
    const updatedTodo = await pool.query(
        `UPDATE TODO_ITEM 
            SET t_title = $1, t_desc = $2, t_date = $3, t_isCompleted = $4 
            WHERE t_id = $5
            RETURNING t_id "id", t_title "title", t_desc "description", to_char(t_date, 'yyyy-mm-dd') "date", t_isCompleted "isCompleted"
            `,
        valuesToUpdate
    );
    return updatedTodo;
}

// Complete todo by id
module.exports.completeTodoById = async function (todoId) {
    const updatedTodo = await pool.query(
        `UPDATE TODO_ITEM 
            SET t_isCompleted = true 
            WHERE t_id = $1
            RETURNING t_id "id", t_title "title", t_desc "description", to_char(t_date, 'yyyy-mm-dd') "date", t_isCompleted "isCompleted"
        `,
        [todoId]
    );
    return updatedTodo;
}

// Delete todo by id
module.exports.deleteTodoById = async function (todoId) {
    const deletedTodo = await pool.query(
        `DELETE FROM TODO_ITEM 
            WHERE t_id = $1
            RETURNING t_id "id", t_title "title", t_desc "description", to_char(t_date, 'yyyy-mm-dd') "date", t_isCompleted "isCompleted"
        `,
        [todoId]
    );
    return deletedTodo;
    
}