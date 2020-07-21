import React, { Component, Fragment as Frag } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import * as showdown from 'showdown';

import Subcommand from './subcommand';

showdown.setOption('strikethrough', true);
showdown.setOption('tables', true);
showdown.setOption('ghCodeBlocks', true);
showdown.setOption('tasklists', true);
showdown.setOption('simpleLineBreaks', true);
showdown.setOption('openLinksInNewWindow', true);
showdown.setOption('emoji', true);
showdown.setOption('underline', true);
showdown.setOption('splitAdjacentBlockquotes', true);

var conv = new showdown.Converter();

class Command extends Component {
	constructor(props) {
		super(props);
		this.state = {cmd: this.props.cmd, scroll: this.props.scroll};

		this.ref = React.createRef();
	}

	async componentDidUpdate(prev) {
		if(!this.props.cmd) return this.setState({cmd: null})
		if(JSON.stringify(prev) == JSON.stringify(this.props)) return null;
		
		this.setState({cmd: this.props.cmd, scroll: this.props.scroll});
		if(!this.props.scroll) this.scroll();
	}

	scroll() {
		this.ref.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
		this.setState({scroll: true});
	}

	render() {
		var cmd = this.state.cmd;
		if(!cmd) return null;
		var scroll = this.state.scroll && cmd.subcommands ?
			cmd.subcommands.find(x => x.name == `${cmd.name} ${this.state.scroll}`) :
			null;
		return (
			<Frag>
				<h1 ref={this.ref}><Link to={`#${cmd.name}`}>{cmd.name}</Link></h1>
				<p dangerouslySetInnerHTML={{__html: conv.makeHtml(cmd.help)}} />
				<p dangerouslySetInnerHTML={{__html: conv.makeHtml(cmd.usage.join("\n"))}} />
				{cmd.desc && <p dangerouslySetInnerHTML={{__html: conv.makeHtml(cmd.desc)}} />}
				{cmd.subcommands && cmd.subcommands.map(c => <Subcommand cmd={c} key={c.name} scroll={(scroll && scroll.name == c.name)}/>)}
			</Frag>
		);
	}
}

export default Command;