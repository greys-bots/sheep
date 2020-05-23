import React, {Component} from 'react';
import axios from 'axios';

import Command from './command';

class Commands extends Component {
	constructor(props) {
		super(props);
		this.state = {
			commands: null,
			modules: null,
			filters: []
		};
	}

	async componentDidMount() {
		var data = await axios('/api/commands');
		data = data.data;
		data.commands = data.commands.sort((a,b) => a.name > b.name ? 1 : (a.name < b.name ? -1 : 0));
		this.setState({...data, filters: data.modules.map(m => m.name).concat(["Unsorted"])});
	}

	async toggleFilter(e) {
		var target = e.target;
		var filters = this.state.filters;
		if(target.checked && !this.state.filters.includes(target.name)) filters.push(target.name);
		else if(!target.checked) filters = filters.filter(x => x != target.name);
		this.setState({filters});
	}

	render() {
		var commands = this.state.commands;
		var modules = this.state.modules;
		if(!commands) return (<p>Loading...</p>)
		return (
			<div className="App-commandsContainer">
	          <h2>Commands</h2>
	          <div className="App-filters">
	          <h2>Filters</h2>
	          <div>
	          	{modules.map((m, i) => {
	          		return (
	          			<p>
	          				<input key={i} type="checkbox" name={m.name} checked={this.state.filters.includes(m.name)} onChange={(e)=>this.toggleFilter(e)} />{" "}
	          				{m.name}
	          			</p>
	          		)
	          	})}
	          </div>
	          </div>
	          <div className="App-command App-commandsHeader">
		          <div>
		          	<h3 style={{width: '50px'}}>Command</h3>
		          </div>
		          <div>
		          	<h3>Description</h3>
		          </div>
		          <div>
		          	<h3>Usage</h3>
		          </div>
	          </div>
	            {commands.map((c, i) => {
	            	if(this.state.filters) {
	            		if(this.state.filters.includes(c.module ? c.module.name : "unsorted")) return (<Command key={i} cmd={c} />);
	            		else return null;
	            	} else {
	            		return (
			                <Command key={i} cmd={c} />
			            )
	            	}
	            })}
	        </div>
		);
	}
}

export default Commands;