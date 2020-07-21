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

import SavedColor from './savedColor';

class UserSettings extends Component {
	constructor(props) {
		super(props);
		console.log(this.props);
		this.state = {user: this.props.user};
	}

	render() {
		console.log(this.state.user);
		var user = this.state.user;
		if(!user) return (<Redirect to="/"/>);
		
		return (
			<div className="Dash-main">
			<section id="saved-colors">
			<h1>Saved Colors</h1>
			<form onSubmit={(e) => e.preventDefault()}>
			<div className="Dash-savedColor">
				<input type="text" placeholder="name" />
				<input type="text" placeholder="color" />
				<button>Add New</button>
			</div>
			{user.colors && user.colors.map((c, i) => {
				return (
					<SavedColor key={`${c.id}-${i}`}
					token={user.tokens.token} color={c}/>
				)
			})}
			</form>
			</section>
			</div>
		);
	}
}

export default UserSettings;