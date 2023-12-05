const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('get-projects')
    .setDescription(`Lists your projects. Must supply your login token`)
    .addStringOption(option =>
        option.setName('token')
            .setDescription('your jwt login token')
            .setRequired(true)),
    async execute(interaction) {
        const url = "http://localhost:5005/projects";
        const token = interaction.options.getString('token');
        const projects = await fetchProjects(url, token);
        await interaction.reply(`Fetching your JACD projects...\n${projects}`);
    }
}

async function fetchProjects(url, token) {
    const response = await fetch(url, {
        method: "GET",
        mode: "cors",
        headers: {
            "Authorization": token
        }
    });
    if (response.status != 200) {
        return `Error fetching projects [error ${response.status}]`;
    }
    return JSON.stringify(await response.json(), null, 2);
}