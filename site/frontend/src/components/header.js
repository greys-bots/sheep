import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Header extends Component {
	render() {
		return (
			<div className="App-header">
                <h1 className="App-title"><Link to="/">Sheep</Link></h1>
                <div className="App-navLinks">
                <a className="App-button" href="https://discordapp.com/api/oauth2/authorize?client_id=585271178180952064&permissions=8&scope=bot">invite</a>
                <a className="App-button" href="https://github.com/greys-bots/sheep">source</a>
                <a className="App-button" href="/docs">docs</a>
                <a className="App-button" href="/dash">dash</a>
                <a className="App-button" href="/gen">generator</a>
                </div>
            </div>
		);
	}
}

export default Header;