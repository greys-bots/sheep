import React, { Component, Fragment as Frag } from 'react';
import {
	HashRouter as Router,
	Switch,
	Route,
	Link,
	withRouter
} from 'react-router-dom';
import axios from 'axios';

import Command from './command';

class Module extends Component {
	constructor(props) {
		super(props);
		this.state = {
			module: null,
			cmd: null,
			subcmd: null
		}
	}

	async componentDidMount() {
		var data = await axios(`/api/module/${this.props.match.params.module}`);
		data = data.data;

		if(!this.props.location.hash) this.setState({module: data, cmd: null, subcmd: null});
		else if(this.props.location.hash.includes("-")) {
			var split = this.props.location.hash.replace("#", "").split("-");
			this.setState({module: data, cmd: split[0], subcmd: split[1]})
		} else this.setState({module: data, cmd: this.props.location.hash.replace("#", "")});
	}

	async componentDidUpdate(prev) {
		if(!Object.keys(prev).find(x => this.props[x] != prev[x])) return null;

		var data = await axios(`/api/module/${this.props.match.params.module}`);
		data = data.data;

		if(!this.props.location.hash) this.setState({module: data, cmd: null, subcmd: null});
		else if(this.props.location.hash.includes("-")) {
			var split = this.props.location.hash.replace("#", "").split("-");
			this.setState({module: data, cmd: split[0], subcmd: split[1]})
		} else this.setState({module: data, cmd: this.props.location.hash.replace("#", ""), subcmd: null});
	}

	render() {
		if(!this.state.module) return (<p>Loading...</p>);

		var mod = this.state.module;
		var cmd = this.state.cmd ?
			this.state.module.commands.find(x => x.name == this.state.cmd) :
			null;
		return (
			<div className="Docs-main">
				<div className="Docs-sidebar">
				<h2><Link to={`/docs/${mod.name.replace(" ", "-").toLowerCase()}`}>{mod.name}</Link></h2>
				<ul>
				{mod.commands && mod.commands.map(c => {
					if(!c.subcommands || !c.subcommands[0])
						return (<li><h3><Link to={`#${c.name}`}>{c.name}</Link></h3></li>);
					else {
						return (
							<li><h3><Link to={`#${c.name}`}>{c.name}</Link></h3>
								<ul>
								{c.subcommands.map(sc => <l1><Link to={`#${sc.name.replace(" ", "-")}`}>{sc.name.replace(c.name + " ", "")}</Link></l1>)}
								</ul>
							</li>
						)
					}
				})}
				</ul>
				</div>

				<div className="Docs-info">
				{cmd ? <Command cmd={cmd} scroll={this.state.subcmd}/> :
				(
					<Frag>
						<h1>{mod.name}</h1>
						<p>{mod.description}</p>
						<p>Click on a command in the sidebar to view more info on it</p>
					</Frag>
				)}
				</div>
			</div>
		)
	}
}

export default withRouter(Module);