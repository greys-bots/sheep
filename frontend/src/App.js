import React from 'react';
import * as fetch from 'node-fetch';
import './App.css';

import Commands from './components/commands';
import Stats from './components/stats';

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function App() {
  var color = Math.floor(Math.random()*16777215).toString(16);
  var rgb = hexToRgb(color);
  var bg;
  if(rgb) bg = (rgb.r * 0.299) + (rgb.g * 0.587) + (rgb.b * 0.114) < 186 ? "white" : "black";
  else {
    color = "000";
    bg = "white"
  }
  return (
    <div className="App">
      <div className="App-header">
        <img src="/favicon.ico" className="App-avatar"/>
        <p className="App-title">Sheep </p>
        <a className="App-button" href="https://discordapp.com/api/oauth2/authorize?client_id=585271178180952064&permissions=8&scope=bot">add me!</a>
        <a className="App-button" href="https://discord.gg/EvDmXGt">need help?</a>
        <a className="App-button" href="https://github.com/greys-bots/sheep">view source</a>
      </div>
      <div className="App-container">
        <section className="App-about">
          <div>
          <h1>Sheep</h1>
          <h3><em>A <span className="App-color" style={{color: `#${color}`, backgroundColor: bg}}>color changing</span> bot for Discord</em></h3>
          <p><strong>Sheep</strong> is a Discord bot created by <a href="https://github.com/greysdawn">@greysdawn</a>{" "}
            just for changing role colors on Discord. With short commands and easy syntax, Sheep is made to be as simple{" "}
            and accessible as possible. To get started,{" "}
            invite them using <a href="https://discordapp.com/api/oauth2/authorize?client_id=585271178180952064&permissions=268462080&scope=bot">this link</a>{" "}
            and use <em>s!h</em> in a channel they can see.
          </p>
          </div>
          <div style={{textAlign: "center"}}>
          <img className="App-sheep" src={"/sheep/"+color} />
          </div>
        </section>
        <Stats />
        <Commands />
        <div className="App-note">
        <h1>Notes</h1>
        <p><strong>Prefixes:</strong> Sheep's prefixes are s!, sh!, sheep!, and baa!</p>
        <p><strong>Permissions:</strong> The permissions that Sheep needs are Manage Messages (for removing reactions),{" "}
                   Manage Roles (for creating, editing, etc roles), Send Messages (obviously), and Embed Links (for the color embeds)</p>
        <p><strong>Role moving:</strong> Sheep will automatically move roles up under a role named Sheep (capitalization unimportant), regardless of it being their top role.{" "}
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
    </div>
  );
}

export default App;
