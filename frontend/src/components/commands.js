import React, {Component} from 'react';
import axios from 'axios';

import Command from './command';

class Commands extends Component {
	constructor(props) {
		super(props);
		this.state = {cmds: undefined};
	}

	async componentDidMount() {
		var data = await axios('/commands');
		this.setState({...data.data});
	}

	render() {
		var commands = this.state.commands;
		console.log(commands);
		return (
			<div className="App-commandsContainer">
	          <h2>Commands</h2>
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
	            {commands!=undefined ? commands.map((c, i) => {
	              return (
	                <Command key={i} cmd={c} />
	              )
	            }) : <tr><td>Loading...</td></tr>}
	        </div>
		);
	}
}

export default Commands;