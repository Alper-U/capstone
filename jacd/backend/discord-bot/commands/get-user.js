const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get-user')
        .setDescription('Gets details of a user')
        .addStringOption(option =>
            option.setName('token')
                .setDescription('your jwt login token')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('uid')
                .setDescription('user id')
                .setRequired(true)),
    async execute(interaction) {
        const uid = interaction.options.getInteger('uid');
        const url = `http://localhost:5005/users/${uid}`;
        const token = interaction.options.getString('token');
        const users = await fetchUsers(token, url);
        await interaction.reply(`Getting details of taskmaster ${uid}...\n${users}`);
    },
};

async function fetchUsers(token, url) {
    const response = await fetch(url, {
        method: "GET",
        mode: "cors",
        headers: {
            "Authorization": token
        }
    });
    if (response.status == 409) {
        return `No user found for id provided`
    }
    if (response.status != 200) {
        return `Error fetching user [error ${response.status}]`;
    }
    return JSON.stringify(await response.json(), null, 2);
}