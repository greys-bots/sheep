import React, { Component, Fragment as Frag } from 'react';
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
	Redirect,
	NavLink
} from 'react-router-dom';
import axios from 'axios';

import UserSettings from './user/usersettings.js';
import GuildSettings from './guild/guildsettings.js';
import NotFound from '../notfound';

import './dash.css';

const login_url = "https://discord.com/api/oauth2/authorize?client_id=585271178180952064&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Flogin&response_type=code&scope=identify%20guilds";
// "https://discord.com/api/oauth2/authorize?client_id=585271178180952064&redirect_uri=https%3A%2F%2Fsheep.greysdawn.com%2Fapi%2Flogin&response_type=code&scope=identify%20guilds";

const img_url = "https://cdn.discordapp.com";

class DashHome extends Component {
	constructor(props) {
		super(props);
		this.state = {
			user: null,
			guilds: null,
			open: false,
			fetched: false
		};
	}

	async componentDidMount() {
		try {
			var req = await axios('/api/user');
		} catch(e) {
			return this.setState({fetched: true});
		}

		console.log({...req.data});
		this.setState({...req.data, fetched: true});
	}

	toggle() {
		this.setState({open: !this.state.open});
	}

	hideMenu() {
		if(this.state.open) this.setState({open: false});
	}

	render() {
		if(!this.state.fetched) return null;
		var user = this.state.user;
		var guilds = this.state.guilds;
		return (
			<Router basename="/dash">
			<Frag>
			<div className="Dash-header" role="navigation">
				<h1 className="App-title"><Link to="/">Sheep Dash</Link></h1>
				<div className="App-navLinks">
				<a className="App-button" href="/">home</a>
				<a className="App-button" href="/docs">docs</a>
				<a className="App-button" href="/gen">generator</a>
				</div>
				{(!user && this.state.fetched) && (
					<a style={{display: 'inline-block'}} href={login_url} className="Dash-login">
						Login
					</a>
				)}
				{user && (
					<button className="App-button" onClick={() => this.toggle()}>menu</button>
				)}
			</div>
			<div className="Dash-container" onClick={() => this.hideMenu()} >
			{guilds && (
				<div className={`Dash-sidebar${this.state.open ? " open" : ''}`} role="navigation" aria-hidden={this.state.open ? "false" : "true"}>
				<NavLink to="/user" className="Dash-sideLink" aria-label="user settings">
					<img alt="User avatar" role="presentation" src={user.avatar.startsWith("a_") ? `${img_url}/avatars/${user.id}/${user.avatar}.gif` : `${img_url}/avatars/${user.id}/${user.avatar}.png`} />
					<span>User Settings</span>
				</NavLink>
				{guilds.map(g => {
					return (<NavLink to={`/guild/${g.id}`} className="Dash-sideLink" key={g.id} aria-label="guild settings">
						<img alt={`${g.name} avatar`} role="presentation" src={g.icon ? (g.icon.startsWith("a_") ? `${img_url}/icons/${g.id}/${g.icon}.gif` : `${img_url}/icons/${g.id}/${g.icon}.png`) : "https://cdn.discordapp.com/embed/avatars/0.png"} />
						<span>{g.name}</span>
					</NavLink>);
				})}
				</div>
			)}
			<Switch>
			<Route path="/" exact render={()=> {
				return (
		        	<div className="Dash-main">
		        	{user && <Redirect to="/user"/>}
					<p style={{textAlign: 'center'}}>
						Welcome to the web dashboard for Sheep!
						<br/>
						<a style={{display: 'inline-block'}} href={login_url} className="Dash-login">
							Log in with Discord
						</a>
					</p>
					</div>
		        );
			}}/>
			<Route path="/user" exact render={(props) => <UserSettings {...props} user={user} />} />
			<Route path="/guild/:id" exact render={(props) => <GuildSettings {...props} user={user} guilds={guilds} />} />
			<Route component={NotFound} />
			</Switch>
			</div>
			</Frag>
			</Router>
		);
	}
}

export default DashHome;