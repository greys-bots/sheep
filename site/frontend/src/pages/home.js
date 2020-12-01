import React, { Component, Fragment as Frag } from 'react';

import Stats from '../components/stats';
import Header from '../components/header';

class Home extends Component {
    render() {
        var color = Math.floor(Math.random()*16777215).toString(16);
        return (
            <Frag>
            <Header />
            <div className="App-container">
            <section className="App-about">
            <div>
            <h3><em>A <span className="App-color" style={{color: `#${color}`}}>color&nbsp;changing</span> bot for Discord</em></h3>
            <p><strong>Sheep</strong> is a Discord bot created by <a href="https://github.com/greysdawn">@greysdawn</a>{" "}
            just for changing role colors on Discord. With short commands and easy syntax, Sheep is made to be as simple{" "}
            and accessible as possible. To get started,{" "}
            invite them using <a href="https://discordapp.com/api/oauth2/authorize?client_id=585271178180952064&permissions=268462080&scope=bot">this link</a>{" "}
            and use <em>s!h</em> in a channel they can see.
            </p>
            </div>
            <div style={{textAlign: "center"}}>
            <img className="App-sheep" src={"/sheep/"+color} alt="Sheep" />
            </div>
            </section>
            <Stats />
            <div className="App-features">
            <h1>Features</h1>
            <div className="inner">
            <div>
            <h2>User-based color roles</h2>
            <p>
            Sheep can create individualized color roles for your server's members.{" "}
            All they need to do is use <code>s!c</code> with a color of their choice, and{" "}
            the bot will do the rest.
            </p>
            </div>
            <div>
            <h2>Server-based roles</h2>
            <p>
            Too many members for everyone to get their own roles? No problem!{" "}
            Sheep also offers <em>server-based roles</em>, meaning that users get to{" "}
            choose their color from a list of roles you've already created.
            <br/>
            To get started, use <code>s!tg</code> to toggle the role mode, and then{" "}
            check out <code>s!h role</code> for info on what your options are.
            </p>
            </div>
            <div>
            <h2>Role linking</h2>
            <p>
            Still want user-based colors, but have multiple people with multiple accounts{" "}
            taking up part of your server's role limit? Also no problem. Users can use{" "}
            <code>s!link</code> in order to link their roles together, meaning that two{" "}
            or more people can then share a role and change it from any account they're on.
            <br/>
            Now you have only one role where someone's alts might've given you five.
            </p>
            </div>
            <div>
            <h2>Color utils</h2>
            <p>
            In addition to color roles, Sheep also comes with some fun utilities.{" "}
            You can use <code>s!mix</code> to mix two colors, and{" "}
            <code>s!convert</code> to convert colors to other forms.
            </p>
            </div>
            <div>
            <h2>Custom color names</h2>
            <p>
            Sheep comes with a handful of color names as defined <a href="https://www.w3schools.com/colors/colors_names.asp">here</a>.{" "}
            Using <code>s!save</code>, you can set custom colors for you to use with{" "}
            <code>s!c</code> later. You can also export and import these colors using{" "}
            <code>s!export</code> and <code>s!import</code> respectively, in case{" "}
            you want to share those colors with others or have multiple accounts.
            </p>
            </div>
            </div>
            </div>
            <div className="App-note">
            <h1>Notes</h1>
            <p><strong>Prefixes:</strong> Sheep's prefixes are s!, sh!, sheep!, and baa!</p>
            <p><strong>Permissions:</strong> The permissions that Sheep needs are Manage Messages (for removing reactions),{" "}
            Manage Roles (for creating, editing, etc roles), Send Messages (obviously), and Embed Links (for the color embeds)</p>
            <p><strong>Role moving:</strong> Sheep will automatically move roles up under a role containing the word "Sheep" (capitalization unimportant), regardless of it being their top role.{" "}
            This means that any roles above the Sheep <em>role</em> must be uncolored in order for Sheep's colors to be seen, and the Sheep role must be added to the bot{" "}
            (if it wasn't already created and added by Discord)</p>
            </div>
            <section className="App-footer">
            <div>
            <h1>Want to support the bot?</h1>
            <p>
            Currently, Sheep is being run on a Vultr VPS along with a few other bots and the rest of our sites. At the moment this means that{" "}
            they only have 2gb of RAM to share with everything else, and we will eventually need an upgraded{" "}
            environment to run in. We're also without a job right now, and rely on patrons and donations to get by.<br/>
            If you'd like to donate, you can send money to our Ko-Fi or choose to become a Patron.
            </p>
            </div>
            <div className="App-links">
            <a href="https://ko-fi.com/greysdawn" className="App-button">Ko-Fi</a><br/>
            <a href="https://patreon.com/greysdawn" className="App-button">Patreon</a><br/>
            </div>
            </section>
            </div>
            </Frag>
        );
    } 
}

export default Home;
