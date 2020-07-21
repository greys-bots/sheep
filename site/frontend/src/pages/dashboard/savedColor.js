import React, { Component, Fragment as Frag } from 'react';
import axios from 'axios';
import * as tc from 'tinycolor2';

class SavedColor extends Component {
	constructor(props) {
		super(props);
		this.state = {color: this.props.color,
			edit: Object.assign({}, this.props.color),
			token: this.props.token
		};
	}

	handleChange = (e) => {
		var target = e.target;
		console.log(target.name, target.value);
		this.setState(state => {
			state.edit[target.name] = target.value;
			return state;
		})
	}

	saveColor = async (e) => {
		e.preventDefault();

		console.log(this.state.color);

		try {
			var data = await axios.patch('/api/color/'+this.state.color.name, {
				name: this.state.edit.name,
				color: this.state.edit.color
			}, {headers: {'Authorization': this.state.token}})
		} catch(e) {
			console.log(e);
			return this.setState({error: e.response.data});
		}

		console.log(data);

		this.setState({
			color: data.data,
			edit: Object.assign({}, data.data)
		})
	}

	render() {
		return (
			<div className="Dash-savedColor">
				{this.state.error && <p>{this.state.error}</p>}
				<input type="text" placeholder="name" name="name" value={this.state.edit.name} onChange={(e)=> this.handleChange(e)}/>
				<input type="text" placeholder="color" name="color" value={this.state.edit.color} onChange={(e)=> this.handleChange(e)}/>
				<button onClick={(e)=> this.saveColor(e)}>Save Changes</button>
				<button onClick={(e)=> this.deleteColor(e)}>Delete</button>
			</div>
		)
	}
}

export default SavedColor;