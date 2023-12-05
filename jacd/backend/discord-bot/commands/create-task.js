const { SlashCommandBuilder } = require('discord.js');
const { decodeToken } = require('../utils.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('create-task')
    .setDescription('creates a task in a project')
    .addStringOption(option =>
        option.setName('token')
            .setDescription('your jwt login token')
            .setRequired(true))
    .addIntegerOption(option =>
        option.setName('pid')
            .setDescription('the project id of the project you want to create a task in')
            .setRequired(true))
    .addStringOption(option => 
        option.setName('tname')
            .setDescription('Name of your task')
            .setRequired(true))
    .addStringOption(option => 
        option.setName('description')
            .setDescription('brief description of task')
            .setRequired(true))
    .addStringOption(option => 
        option.setName('status')
            .setDescription('status of task')
            .setRequired(true)
            .addChoices(
                { name: 'Not Started', value: 'Not Started'},
                { name: 'In Progress', value: 'In Progress'},
                { name: 'Blocked', value: 'Blocked'},
                { name: 'Done', value: 'Done'}
            ))
    .addIntegerOption(option =>
        option.setName('assignee')
            .setDescription('id of user to assign to')),

    async execute(interaction) {
        const pid = interaction.options.getInteger('pid');
        const url = `http://localhost:5005/tasks/create/${pid}`
        const token = interaction.options.getString('token');
        const tname = interaction.options.getString('tname');
        const desc = interaction.options.getString('description');
        const assignee = interaction.options.getInteger('assignee');
        const creator = decodeToken(token).uid;
        const status = interaction.options.getString('status');
        const task = JSON.stringify(await createTask(url, token, tname, desc, creator, assignee, status));
        await interaction.reply(`Creating task... ${task}`);
    }
}

async function createTask(url, token, tname, desc, creator, assignee, status) {
    const data = {
            "t_name": tname,
            "t_description": desc,
            "assignee_id": assignee,
            "creator_id": creator,
            "task_status": status
    }

    const response = await fetch(url, {
        method: "POST",
        mode: "cors",

        headers: {
            "Authorization": token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    return response.json();
}