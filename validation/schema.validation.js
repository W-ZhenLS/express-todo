const Joi = require('joi');

// Schema for input validation using Joi

const todoToCreateSchema = Joi.object({
    title: Joi.string()
        .max(255)
        .required(),

    description: Joi.string()
        .max(255)
        .required(),

    date: Joi.date()
        .required()
});

const todoToUpdateSchema = Joi.object({
    title: Joi.string()
        .max(255)
        .required(),

    description: Joi.string()
        .max(255)
        .required(),

    date: Joi.date()
        .required(),

    isCompleted: Joi.boolean()
        .required()
});

module.exports = {
    todoToCreateSchema,
    todoToUpdateSchema
}