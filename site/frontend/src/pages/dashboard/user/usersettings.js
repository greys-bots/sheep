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
		this.state = {
			user: this.props.user,
			edit: {name: '', color: ''},
			error: ''
		};
	}

	handleChange = (e) => {
		var target = e.target;
		this.setState(state => {
			state.edit[target.name] = target.value;
			return state;
		})
	}

	handleSubmit = async (e) => {
		e.preventDefault();

		try {
			var data = await axios.put('/api/color', {
				name: this.state.edit.name,
				color: this.state.edit.color
			});
		} catch(e) {
			console.log(e);
			return this.setState({error: e.response.data});
		}

		this.setState(state => {
			state.user.colors.push(data.data);

			state.edit = {name: '', color: ''};
			state.error = '';

			return state;
		})
	}

	onDelete = (color) => {
		this.setState(state => {
			var index = state.user.colors.findIndex(c => c.id == color.id);
			state.user.colors.splice(index, 1);
			return state;
		})
	}

	onUpdate = (color) => {
		this.setState(state => {
			var index = state.user.colors.findIndex(c => c.id == color.id);
			state.user.colors[index] = color;
			return state;
		})
	}

	render() {
		var user = this.state.user;
		if(!user) return (<Redirect to="/"/>);
		
		return (
			<div className="Dash-main">
			<div className="Dash-info">
			<h1>User Settings</h1>
			<p>
				Welcome to your user settings area!{" "}
				Here you can manage all your saved colors.
			</p>
			</div>
			<section id="saved-colors">
			<h2>Saved Colors</h2>
			<form onSubmit={(e) => this.handleSubmit(e)} className="Dash-savedColor"
				style={{
					background: this.state.edit.color.startsWith('#') ?
								this.state.edit.color :
								`#${this.state.edit.color}`
				}}
			>
				<input type="text" name="name" placeholder="name"
					   value={this.state.edit.name} onChange={(e)=> this.handleChange(e)}/>
				<input type="text" name="color" placeholder="color"
					   value={this.state.edit.color} onChange={(e)=> this.handleChange(e)}/>
				<button onClick={this.handleSubmit}>Add New</button>
			</form>
			{user.colors && user.colors.map(c => {
				return (
					<SavedColor
					key={`${c.id}`}
					color={c}
					onDelete={(color) => this.onDelete(color)}
					onUpdate={(color) => this.onUpdate(color)}/>
				)
			})}
			</section>
			</div>
		);
	}
}

export default UserSettings;