const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('get-tasks')
    .setDescription(`Lists tasks assigned to you`)
    .addStringOption(option =>
        option.setName('token')
            .setDescription('your jwt login token')
            .setRequired(true)),
    
    async execute(interaction) {
        const token = interaction.options.getString('token');
        const url = `http://localhost:5005/tasks/`
        const tasks = await fetchTasks(url, token);
        await interaction.reply(`${tasks}`);
    }
}

async function fetchTasks(url, token) {
    const response = await fetch(url, {
        method: "GET",
        mode: "cors",
        headers: {
            "Authorization": token
        }
    });
    if (response.status != 200) {
        return `Error fetching tasks [error ${response.status}]`;
    }
    return JSON.stringify(await response.json(), null, 2);
}