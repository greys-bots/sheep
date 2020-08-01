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
import * as tc from 'tinycolor2';

class GuildSettings extends Component {
	constructor(props) {
		super(props);

		this.state = {
			user: this.props.user,
			guild: this.props.guilds.find(g => g.id == this.props.match.params.id)
		}
	}

	render() {
		if(!this.state.user) return (<Redirect to="/"/>);
		
		return (
			<div className="Dash-main">
			<p>WIP</p>
			</div>
		);
	}
}

export default GuildSettings;