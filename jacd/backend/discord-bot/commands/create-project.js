
const { SlashCommandBuilder } = require('discord.js');
const { decodeToken } = require('../utils.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('create-project')
    .setDescription('creates a new project')
    .addStringOption(option =>
        option.setName('token')
            .setDescription('your jwt login token')
            .setRequired(true))
    .addStringOption(option => 
        option.setName('pname')
            .setDescription('Name of your JACD project')
            .setRequired(true))
    .addStringOption(option => 
        option.setName('description')
            .setDescription('brief description of your project')
            .setRequired(true)),

    async execute(interaction) {
        const url = `http://localhost:5005/projects/create`
        const token = interaction.options.getString('token');
        const uid = decodeToken(token).uid;
        const pname = interaction.options.getString('pname')
        const desc = interaction.options.getString('description');
        const project = JSON.stringify(await createProject(url, token, uid, pname, desc));
        await interaction.reply(`Creating project... ${project}`);
    }
}

async function createProject(url, token, uid, pname, desc) {
    const data = {
            "u_id": uid,
            "p_name": pname,
            "p_description": desc
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