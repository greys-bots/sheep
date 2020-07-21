import React, { Component, Fragment as Frag } from 'react';
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
	NavLink,
	withRouter
} from 'react-router-dom';
import axios from 'axios';

import Module from './module';

import './docs.css';

class DocsHome extends Component {
	constructor() {
		super();
		this.state = {commands: null, modules: null, open: false}
	}

	async componentDidMount() {
		var data = await axios('/api/commands');
		data = data.data;
		console.log(data);
		this.setState({...data});
	}

	toggle() {
		this.setState({open: !this.state.open});
	}

	hideMenu() {
		if(this.state.open) this.setState({open: false});
	}

	render() {
		if(!this.state.commands) return (<p>Loading...</p>);

		return (
			<Router baseName="/docs">
			<Frag>
			<div className="App-header">
	          <h1 className="App-title"><a href="/docs">Sheep Docs</a></h1>
	          <div className="Docs-mobileLinks">
	          	<a className="App-button" href="/">home</a>
	          	<button className="App-button Docs-menuToggle" onClick={() => this.toggle()}>menu</button>
	          </div>
	          <nav className="Docs-navLinks">
	          <a className="App-buttton" href="/">home</a>
	          {this.state.modules.map(m =>
	          	(<NavLink className="Docs-button"
		          	key={m.name.toLowerCase()}
		          	to={`/docs/${m.name.replace(" ", "-").toLowerCase()}`}>
		          	{m.name.toLowerCase()}
	          	</NavLink>))}
	          </nav>
	        </div>
			<div className="Docs-container" onClick={() => this.hideMenu()}>
		        <div className={"Docs-navSidebar" + (this.state.open ? " open" : "")}>
	        	{this.state.modules.map(m => {
	        		return (
	        			<Frag>
	        			<h1>
	        			<NavLink className="Docs-button"
	        				key={`mobile-${m.name}`}
				          	to={`/docs/${m.name.replace(" ", "-").toLowerCase()}`}>
				          	{m.name}
				        </NavLink>
				        </h1>
				        <ul>
				        {m.commands && m.commands.map(c => {
							if(!c.subcommands || !c.subcommands[0])
								return (
									<li>
										<h3>
										<Link key={`mobile-${m.name}-${c.name}`} to={`/docs/${m.name}/#${c.name}`}>{c.name}</Link>
										</h3>
									</li>
								);
							else {
								return (
									<li><h3><Link key={`mobile-${m.name}-${c.name}`} to={`#${c.name}`}>{c.name}</Link></h3>
										<ul>
										{c.subcommands.map(sc => <l1><Link key={`mobile-${m.name}-${c.name}-${sc.name}`} to={`/docs/${m.name}/#${sc.name.replace(" ", "-")}`}>{sc.name.replace(c.name + " ", "")}</Link></l1>)}
										</ul>
									</li>
								)
							}
						})}
						</ul>
						</Frag>
	        		);
	        	})}
		        </div>
		        <Switch>
		        <Route path="/docs" exact render={() => {
			        return (
			        	<div className="Docs-main">
						<p style={{padding: '5px 10px'}}>
							Welcome to the documentation for Sheep!
							<br/>
							Click on a link above to navigate between modules and{" "}
							learn more about what the bot can do
						</p>
						</div>
			        );
				}} />
				<Route path="/docs/:module" exact component={Module}/>
				</Switch>
			</div>
			</Frag>
			</Router>
		)
	}
}

export default DocsHome;