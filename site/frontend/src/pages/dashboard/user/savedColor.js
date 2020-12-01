import React, { Component } from 'react';
import axios from 'axios';
import * as tc from 'tinycolor2';

class SavedColor extends Component {
	constructor(props) {
		super(props);
		this.state = {
			color: this.props.color,
			edit: Object.assign({}, this.props.color)
		};
	}

	handleChange = (e) => {
		var target = e.target;
		this.setState(state => {
			state.edit[target.name] = target.value;
			return state;
		})
	}

	saveColor = async (e) => {
		e.preventDefault();

		try {
			var data = await axios.patch('/api/color/'+this.state.color.name, {
				name: this.state.edit.name,
				color: this.state.edit.color
			});
		} catch(e) {
			console.log(e);
			return this.setState({error: e.response.data});
		}

		this.setState({
			color: data.data,
			edit: Object.assign({}, data.data)
		})

		if(this.props.onUpdate) this.props.onUpdate(data.data);
	}

	deleteColor = async (e) => {
		e.preventDefault();

		try {
			await axios.delete('/api/color/'+this.state.color.name);
		} catch(e) {
			console.log(e);
			return this.setState({error: e.response.data});
		}

		if(this.props.onDelete) this.props.onDelete(this.state.color);
	}

	render() {
		var bg = tc(this.state.edit.color);
		return (
			<form onSubmit={(e)=> this.saveColor(e)} className="Dash-savedColor"
			style={{
				background: bg.toHexString()
			}}>
				{this.state.error && <p>{this.state.error}</p>}
				<input type="text" placeholder="name" name="name" value={this.state.edit.name} onChange={(e)=> this.handleChange(e)}/>
				<input type="text" placeholder="color" name="color" value={this.state.edit.color} onChange={(e)=> this.handleChange(e)}/>
				<div className="Dash-buttons">
					<button onClick={(e)=> this.saveColor(e)}>Save Changes</button>
					<button onClick={(e)=> this.deleteColor(e)}>Delete</button>
				</div>
			</form>
		)
	}
}

export default SavedColor;